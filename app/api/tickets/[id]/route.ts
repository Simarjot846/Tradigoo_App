import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedSession } from '@/lib/server-auth';
import { getTicketsStore } from '@/lib/tickets-store';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthenticatedSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const ticket = getTicketsStore().get(id);

  if (!ticket) {
    return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
  }

  if (
    ticket.customer_id !== session.userId &&
    session.role !== 'employee' &&
    session.role !== 'founder'
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(ticket);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const store = getTicketsStore();
    const ticket = store.get(id);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const isOps = session.role === 'employee' || session.role === 'founder';
    const isOwner = ticket.customer_id === session.userId;

    if (!isOps && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      status,
      assignedTo,
      assigned_to,
      internalNote,
      internal_note,
      replyMessage,
      reply_message,
      resolutionNotes,
      resolution_notes,
      priority,
    } = body;

    // Customers can only add replies, not change staff status/notes/assignment
    if (!isOps && (status || assignedTo || assigned_to || internalNote || internal_note || resolutionNotes || resolution_notes || priority)) {
      return NextResponse.json(
        { error: 'Only operations staff or founder can update ticket status or notes.' },
        { status: 403 }
      );
    }

    if (status) ticket.status = status;

    const assignee = assignedTo ?? assigned_to;
    if (assignee !== undefined) {
      ticket.assigned_to = assignee;
      if (ticket.status === 'NEW' && assignee) {
        ticket.status = 'ASSIGNED';
      }
    }

    const note = internalNote ?? internal_note;
    if (note && typeof note === 'string' && note.trim()) {
      const actor = session.profile?.name || (session.role === 'founder' ? 'Founder' : 'Ops Agent');
      ticket.internal_notes.push(`[${new Date().toLocaleTimeString()} by ${actor}]: ${note.trim()}`);
    }

    const reply = replyMessage ?? reply_message;
    if (reply && typeof reply === 'string' && reply.trim()) {
      const sender = session.profile?.name || (isOps ? 'Tradigoo Operations' : 'Customer');
      ticket.messages.push({
        sender,
        role: session.role,
        message: reply.trim(),
        timestamp: new Date().toISOString(),
      });
      if (isOps && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED') {
        ticket.status = 'WAITING_FOR_CUSTOMER';
      }
    }

    const resolution = resolutionNotes ?? resolution_notes;
    if (resolution !== undefined) {
      ticket.resolution_notes = resolution;
      if (resolution) {
        ticket.status = 'RESOLVED';
      }
    }

    if (priority) ticket.priority = priority;

    ticket.updated_at = new Date().toISOString();
    store.set(id, ticket);

    return NextResponse.json(ticket);
  } catch (error: any) {
    console.error('Ticket update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update ticket' }, { status: 500 });
  }
}
