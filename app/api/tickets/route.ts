import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase-server';
import { getAuthenticatedSession } from '@/lib/server-auth';
import { getTicketsStore, syncTicketsFromDatabaseRecords, SupportTicket } from '@/lib/tickets-store';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');
    const customerId = searchParams.get('customerId');

    const supabase = createServiceClient();
    const [profilesRes, ordersRes, disputesRes] = await Promise.all([
      supabase.from('profiles').select('id, name, email, phone, business_name, role, gst_verified, gst_number, location, created_at').limit(50),
      supabase.from('orders').select('id, buyer_id, seller_id, status, created_at').order('created_at', { ascending: false }).limit(50),
      supabase.from('disputes').select('*').order('created_at', { ascending: false }).limit(50),
    ]);

    syncTicketsFromDatabaseRecords(profilesRes.data || [], ordersRes.data || [], disputesRes.data || []);

    const store = getTicketsStore();
    let tickets = Array.from(store.values());

    // Non-privileged users can only inspect their own tickets
    if (session.role !== 'employee' && session.role !== 'founder') {
      tickets = tickets.filter((t) => t.customer_id === session.userId);
    } else if (customerId) {
      tickets = tickets.filter((t) => t.customer_id === customerId);
    }

    if (status && status !== 'ALL') {
      tickets = tickets.filter((t) => t.status.toLowerCase() === status.toLowerCase());
    }
    if (assignedTo) {
      tickets = tickets.filter((t) => t.assigned_to === assignedTo);
    }

    tickets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json(tickets);
  } catch (error: any) {
    console.error('Tickets GET error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthenticatedSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      orderId,
      subject,
      category = 'General',
      priority = 'MEDIUM',
      message,
    } = body;

    if (!subject || !message || typeof subject !== 'string' || typeof message !== 'string') {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const ticketNumber = `TK-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket: SupportTicket = {
      id: ticketId,
      ticket_number: ticketNumber,
      customer_id: session.userId,
      customer_name: session.profile?.name || session.profile?.business_name || 'Tradigoo Partner',
      customer_email: session.email,
      customer_phone: session.profile?.phone || undefined,
      order_id: orderId || null,
      subject: subject.trim(),
      category,
      priority,
      status: 'NEW',
      assigned_to: null,
      internal_notes: [],
      messages: [
        {
          sender: session.profile?.name || session.profile?.business_name || 'Partner',
          role: session.role,
          message: message.trim(),
          timestamp: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      resolution_notes: null,
    };

    getTicketsStore().set(ticketId, newTicket);

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error: any) {
    console.error('Tickets POST error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create ticket' }, { status: 500 });
  }
}
