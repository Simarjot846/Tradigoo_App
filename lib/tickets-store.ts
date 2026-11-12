export interface TicketMessage {
  sender: string;
  role: string;
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  order_id: string | null;
  subject: string;
  category: 'Order' | 'Delivery' | 'Payment' | 'Verification' | 'Dispute' | 'General';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'WAITING_FOR_CUSTOMER' | 'ESCALATED' | 'RESOLVED' | 'CLOSED';
  assigned_to: string | null;
  internal_notes: string[];
  messages: TicketMessage[];
  created_at: string;
  updated_at: string;
  resolution_notes: string | null;
}

declare global {
  var __tradigooTicketsStore: Map<string, SupportTicket> | undefined;
}

export function getTicketsStore(): Map<string, SupportTicket> {
  if (!globalThis.__tradigooTicketsStore) {
    globalThis.__tradigooTicketsStore = new Map<string, SupportTicket>();
  }
  return globalThis.__tradigooTicketsStore;
}

export function syncTicketsFromDatabaseRecords(
  profiles: any[],
  orders: any[],
  disputes: any[]
) {
  const store = getTicketsStore();
  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  // Always sync any real DB disputes that aren't already tracked in store
  disputes.forEach((d: any, index: number) => {
    const tId = `ticket_dispute_${d.id}`;
    if (store.has(tId)) return;
    const customer = profileMap.get(d.raised_by);
    store.set(tId, {
      id: tId,
      ticket_number: `TK-${2100 + index}`,
      customer_id: d.raised_by,
      customer_name: customer?.name || customer?.business_name || 'Retail Partner',
      customer_email: customer?.email || 'retailer@tradigoo.com',
      customer_phone: customer?.phone || undefined,
      order_id: d.order_id,
      subject: `Order Dispute #${(d.order_id || '').slice(0, 8)}: ${d.reason || 'Quality/Delivery review'}`,
      category: 'Dispute',
      priority: 'HIGH',
      status: d.status === 'resolved' ? 'RESOLVED' : d.status === 'under_review' ? 'IN_PROGRESS' : 'NEW',
      assigned_to: null,
      internal_notes: [],
      messages: [
        {
          sender: customer?.name || 'Retail Partner',
          role: 'retailer',
          message: d.reason || 'Dispute raised during inspection window.',
          timestamp: d.created_at || new Date().toISOString(),
        },
      ],
      created_at: d.created_at || new Date().toISOString(),
      updated_at: d.updated_at || new Date().toISOString(),
      resolution_notes: d.resolution_notes || null,
    });
  });

  // Sync unverified wholesaler onboarding tasks if store is small
  profiles
    .filter((p) => p.role === 'wholesaler' && !p.gst_verified)
    .slice(0, 5)
    .forEach((p: any, idx: number) => {
      const tId = `ticket_verify_${p.id}`;
      if (store.has(tId)) return;
      store.set(tId, {
        id: tId,
        ticket_number: `KV-${1200 + idx}`,
        customer_id: p.id,
        customer_name: p.name || p.business_name || 'Wholesaler Partner',
        customer_email: p.email || 'wholesaler@tradigoo.com',
        customer_phone: p.phone || undefined,
        order_id: null,
        subject: `GST & KYC Verification: ${p.business_name || p.name}`,
        category: 'Verification',
        priority: 'MEDIUM',
        status: 'NEW',
        assigned_to: null,
        internal_notes: [
          p.gst_number
            ? `Submitted GSTIN ${p.gst_number} awaiting compliance check.`
            : 'Wholesaler registered without GST verification completed.',
        ],
        messages: [
          {
            sender: p.business_name || p.name || 'Wholesaler',
            role: 'wholesaler',
            message: p.gst_number
              ? `Requesting supplier verification for GSTIN ${p.gst_number} (${p.location || 'India'}).`
              : `Account created for ${p.business_name || 'Wholesale business'}. Pending verification review.`,
            timestamp: p.created_at || new Date().toISOString(),
          },
        ],
        created_at: p.created_at || new Date().toISOString(),
        updated_at: p.created_at || new Date().toISOString(),
        resolution_notes: null,
      });
    });

  // Sync active escrow/shipped order inquiries when needed
  if (store.size === 0 && orders.length > 0) {
    const sampleOrder = orders[0];
    const customer = profileMap.get(sampleOrder.buyer_id);
    const tId = `ticket_order_${sampleOrder.id}`;
    store.set(tId, {
      id: tId,
      ticket_number: 'TK-1001',
      customer_id: customer?.id || sampleOrder.buyer_id,
      customer_name: customer?.name || 'Retail Partner',
      customer_email: customer?.email || 'retailer@tradigoo.com',
      customer_phone: customer?.phone || undefined,
      order_id: sampleOrder.id,
      subject: `Escrow & Logistics Check for Order #${sampleOrder.id.slice(0, 8)}`,
      category: 'Delivery',
      priority: 'MEDIUM',
      status: 'NEW',
      assigned_to: null,
      internal_notes: ['Awaiting pickup & delivery scan confirmation.'],
      messages: [
        {
          sender: customer?.name || 'Retail Partner',
          role: 'retailer',
          message: 'Please confirm dispatch timeline and courier tracking status.',
          timestamp: sampleOrder.created_at || new Date().toISOString(),
        },
      ],
      created_at: sampleOrder.created_at || new Date().toISOString(),
      updated_at: sampleOrder.created_at || new Date().toISOString(),
      resolution_notes: null,
    });
  }
}
