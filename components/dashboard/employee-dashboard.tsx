'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { authFetch } from '@/lib/auth-fetch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Headset,
  Search,
  RefreshCw,
  Send,
  Lock,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

interface TicketMessage {
  sender: string;
  role: string;
  message: string;
  timestamp: string;
}

interface SupportTicket {
  id: string;
  ticket_number: string;
  customer_id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  order_id?: string | null;
  subject: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: string;
  assigned_to?: string | null;
  internal_notes: string[];
  messages: TicketMessage[];
  created_at: string;
  updated_at: string;
  resolution_notes?: string | null;
}

const STATUS_FILTERS = ['ALL', 'NEW', 'ASSIGNED', 'WAITING_FOR_CUSTOMER', 'RESOLVED'];

export function EmployeeDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [replyText, setReplyText] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [resolutionText, setResolutionText] = useState('');
  const [saving, setSaving] = useState(false);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch('/api/tickets', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load support queue');
      const list = Array.isArray(data) ? data : [];
      setTickets(list);
      setSelectedId((prev) => (prev && list.some((t) => t.id === prev) ? prev : list[0]?.id || null));
    } catch (err: any) {
      setError(err?.message || 'Unable to load support operations queue.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const filteredTickets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tickets.filter((t) => {
      const statusOk =
        statusFilter === 'ALL' || t.status.toUpperCase() === statusFilter.toUpperCase();
      if (!statusOk) return false;
      if (!q) return true;
      return (
        t.ticket_number.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.customer_name.toLowerCase().includes(q) ||
        (t.customer_email || '').toLowerCase().includes(q) ||
        (t.order_id || '').toLowerCase().includes(q)
      );
    });
  }, [tickets, searchQuery, statusFilter]);

  const selectedTicket = useMemo(
    () => filteredTickets.find((t) => t.id === selectedId) || filteredTickets[0] || null,
    [filteredTickets, selectedId]
  );

  const counts = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === 'NEW' || t.status === 'ASSIGNED').length,
      waiting: tickets.filter((t) => t.status === 'WAITING_FOR_CUSTOMER').length,
      resolved: tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
    };
  }, [tickets]);

  const patchTicket = async (payload: Record<string, any>, successMsg: string) => {
    if (!selectedTicket) return;
    setSaving(true);
    try {
      const res = await authFetch(`/api/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error || 'Failed to update ticket');

      setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      toast.success(successMsg);
      return updated;
    } catch (err: any) {
      toast.error(err?.message || 'Action failed');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    const updated = await patchTicket(
      { replyMessage: replyText.trim(), assignedTo: user?.name || user?.email },
      'Reply sent to partner.'
    );
    if (updated) setReplyText('');
  };

  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNote.trim()) return;
    const updated = await patchTicket(
      { internalNote: internalNote.trim() },
      'Internal operations note saved.'
    );
    if (updated) setInternalNote('');
  };

  const handleResolveTicket = async () => {
    const notes = resolutionText.trim() || 'Reviewed and resolved by Tradigoo Operations.';
    const updated = await patchTicket(
      { status: 'RESOLVED', resolutionNotes: notes },
      'Ticket marked resolved.'
    );
    if (updated) setResolutionText('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Operations Support Desk
              </span>
              <span className="text-slate-300 dark:text-zinc-700">·</span>
              <span className="text-xs text-slate-500 dark:text-zinc-400">{user?.email}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Support &amp; Dispute Resolution Queue
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              Respond to partner inquiries, inspect order disputes, log internal notes, and resolve escalations.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={loadTickets}
            disabled={loading}
            className="h-9 text-xs font-semibold whitespace-nowrap shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </Button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Total Tickets', value: counts.total, icon: Headset, tone: 'text-blue-600 dark:text-blue-400' },
            { label: 'Open / Assigned', value: counts.open, icon: AlertCircle, tone: 'text-amber-600 dark:text-amber-400' },
            { label: 'Awaiting Partner', value: counts.waiting, icon: Clock, tone: 'text-purple-600 dark:text-purple-400' },
            { label: 'Resolved', value: counts.resolved, icon: CheckCircle2, tone: 'text-emerald-600 dark:text-emerald-400' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                    {item.label}
                  </span>
                  <Icon className={`w-4 h-4 ${item.tone}`} />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-4 flex items-center justify-between gap-3">
            <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
            <Button size="sm" variant="outline" onClick={loadTickets}>
              Retry
            </Button>
          </div>
        )}

        {/* Main Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Ticket Queue Column */}
          <div className="lg:col-span-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket #, partner, subject, order ID..."
                className="pl-9 h-9 bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-sm"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {STATUS_FILTERS.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300'
                  }`}
                >
                  {st.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
              {loading && tickets.length === 0 ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-zinc-800 animate-pulse" />
                  ))}
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-500 dark:text-zinc-400">
                  No tickets match the current filter.
                </div>
              ) : (
                filteredTickets.map((t) => {
                  const isSelected = selectedTicket?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedId(t.id)}
                      className={`w-full text-left rounded-xl border p-3.5 transition-colors ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-500/10'
                          : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400">
                          {t.ticket_number}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                          {t.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {t.subject}
                      </p>
                      <div className="flex items-center justify-between gap-2 mt-1.5 text-xs text-slate-500 dark:text-zinc-400">
                        <span className="truncate">{t.customer_name}</span>
                        <span className="shrink-0 font-mono">{t.priority}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Ticket Detail Column */}
          <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 flex flex-col justify-between">
            {!selectedTicket ? (
              <div className="py-20 text-center text-slate-500 dark:text-zinc-400 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto opacity-50" />
                <p className="text-sm">Select a support ticket from the queue to review details.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Ticket Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mb-1">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {selectedTicket.ticket_number}
                      </span>
                      <span>·</span>
                      <span>{selectedTicket.category}</span>
                      <span>·</span>
                      <span>Priority: {selectedTicket.priority}</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {selectedTicket.subject}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                      Partner: <span className="font-medium text-slate-700 dark:text-zinc-200">{selectedTicket.customer_name}</span>
                      {selectedTicket.customer_email ? ` (${selectedTicket.customer_email})` : ''}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {selectedTicket.order_id && (
                      <Link
                        href={`/dispute/${selectedTicket.order_id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
                      >
                        Order #{selectedTicket.order_id.slice(0, 8)}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                    <select
                      value={selectedTicket.status}
                      disabled={saving}
                      onChange={(e) =>
                        patchTicket({ status: e.target.value }, `Status set to ${e.target.value}.`)
                      }
                      className="h-8 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2.5 text-xs font-semibold text-slate-800 dark:text-zinc-200"
                    >
                      <option value="NEW">NEW</option>
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="WAITING_FOR_CUSTOMER">WAITING FOR CUSTOMER</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>
                </div>

                {/* Conversation Thread */}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {selectedTicket.messages.map((msg, idx) => {
                    const isStaff = msg.role === 'employee' || msg.role === 'founder';
                    return (
                      <div
                        key={idx}
                        className={`rounded-xl p-3 text-sm ${
                          isStaff
                            ? 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 ml-4'
                            : 'bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400 mb-1">
                          <span className="font-semibold text-slate-800 dark:text-zinc-200">
                            {msg.sender} ({msg.role})
                          </span>
                          <span>{new Date(msg.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-700 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                          {msg.message}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Public Reply Form */}
                <form onSubmit={handleSendReply} className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Reply to Partner
                  </label>
                  <div className="flex gap-2">
                    <Textarea
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a clear response or next step for the buyer/wholesaler..."
                      className="text-sm bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 resize-none"
                    />
                    <Button
                      type="submit"
                      disabled={saving || !replyText.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 self-end h-10"
                    >
                      <Send className="w-4 h-4 mr-1.5" /> Reply
                    </Button>
                  </div>
                </form>

                {/* Internal Notes + Resolution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-zinc-800">
                  <form onSubmit={handleAddInternalNote} className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600" /> Internal Ops Notes (Staff Only)
                    </label>
                    {selectedTicket.internal_notes.length > 0 && (
                      <div className="rounded-lg bg-amber-50/70 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 p-2.5 space-y-1 max-h-24 overflow-y-auto">
                        {selectedTicket.internal_notes.map((n, i) => (
                          <p key={i} className="text-[11px] text-amber-900 dark:text-amber-200 font-mono">
                            {n}
                          </p>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Input
                        value={internalNote}
                        onChange={(e) => setInternalNote(e.target.value)}
                        placeholder="Add internal investigation note..."
                        className="h-9 text-xs bg-slate-50 dark:bg-zinc-950"
                      />
                      <Button type="submit" size="sm" variant="outline" disabled={saving || !internalNote.trim()} className="h-9 text-xs shrink-0">
                        Log Note
                      </Button>
                    </div>
                  </form>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Resolution Summary
                    </label>
                    {selectedTicket.resolution_notes && (
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg p-2">
                        {selectedTicket.resolution_notes}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Input
                        value={resolutionText}
                        onChange={(e) => setResolutionText(e.target.value)}
                        placeholder="Final resolution outcome..."
                        className="h-9 text-xs bg-slate-50 dark:bg-zinc-950"
                      />
                      <Button
                        type="button"
                        size="sm"
                        disabled={saving}
                        onClick={handleResolveTicket}
                        className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                      >
                        Resolve
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
