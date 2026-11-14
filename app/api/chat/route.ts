import { NextResponse } from 'next/server';
import { retrieveDocuments, formatContext } from '@/lib/rag';
import { generateGroqCompletion, GroqMessage } from '@/lib/groq';
import { createServiceClient } from '@/lib/supabase-server';
import { getAuthenticatedSession } from '@/lib/server-auth';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

interface LiveProductSnippet {
  id: string;
  name: string;
  category: string;
  base_price: number;
  unit: string;
  min_order_quantity: number;
  seller?: { business_name?: string; gst_verified?: boolean; location?: string } | null;
}

async function fetchLiveCatalogContext(query: string): Promise<LiveProductSnippet[]> {
  try {
    const admin = createServiceClient();
    const { data, error } = await admin
      .from('products')
      .select(
        `
        id, name, category, base_price, unit, min_order_quantity,
        seller:profiles!seller_id (business_name, gst_verified, location)
      `
      )
      .eq('is_active', true)
      .order('demand_score', { ascending: false })
      .limit(30);

    if (error || !Array.isArray(data)) return [];

    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2);

    const normalized: LiveProductSnippet[] = data.map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category || 'General',
      base_price: Number(row.base_price || 0),
      unit: row.unit || 'unit',
      min_order_quantity: Number(row.min_order_quantity || 1),
      seller: Array.isArray(row.seller) ? row.seller[0] : row.seller,
    }));

    if (terms.length === 0) return normalized.slice(0, 8);

    const scored = normalized
      .map((p) => {
        const hay = `${p.name} ${p.category} ${p.seller?.business_name || ''} ${p.seller?.location || ''}`.toLowerCase();
        const score = terms.reduce((acc, term) => (hay.includes(term) ? acc + 1 : acc), 0);
        return { p, score };
      })
      .sort((a, b) => b.score - a.score);

    const matched = scored.filter((item) => item.score > 0).map((item) => item.p);
    return matched.length > 0 ? matched.slice(0, 6) : normalized.slice(0, 6);
  } catch (err) {
    console.warn('[chat] Live catalog lookup skipped:', err);
    return [];
  }
}

function buildMarketplaceFallbackReply(
  query: string,
  docs: Array<{ content: string; source: string }>,
  liveProducts: LiveProductSnippet[],
  userContext: { role?: string; trustScore?: number; gstVerified?: boolean; businessName?: string } | null
): string {
  const q = query.toLowerCase().trim();

  if (/^(hi|hello|hey|namaste|good morning|good afternoon|good evening)\b/.test(q)) {
    const roleNote =
      userContext?.role === 'wholesaler'
        ? `You are signed in as a **Wholesaler** (${userContext.businessName || 'Supplier'}, Trust Score **${userContext.trustScore ?? 500}/1000**).`
        : userContext?.role === 'retailer'
        ? `You are signed in as a **Retailer** (${userContext.businessName || 'Buyer'}, Trust Score **${userContext.trustScore ?? 500}/1000**).`
        : 'Welcome to Tradigoo!';

    return (
      `Namaste! ${roleNote}\n\n` +
      'I can help you with:\n' +
      '- **Live Catalog & Sourcing** — products, MOQ rules, GST slabs, and verified suppliers\n' +
      '- **Escrow & Checkout** — **Add to Cart** vs **Buy Now** direct checkout\n' +
      '- **Delivery & Verification** — QR parcel verification, 6-digit OTP, and 24-hour inspection\n' +
      '- **Trust Score & GST** — how supplier and buyer trust scores (0–1000) are calculated'
    );
  }

  if (/(escrow|payment|safe|razorpay|hold|release|refund|security)/.test(q)) {
    return (
      '**How Tradigoo Escrow Protection Works:**\n\n' +
      '1. **Payment Held Safely:** When you checkout via **Cart** or **Buy Now**, funds are locked in Tradigoo Escrow (never sent directly before dispatch).\n' +
      '2. **Dispatch & QR Verification:** Wholesaler attaches a tamper-evident verification QR label and marks the shipment **Shipped**.\n' +
      '3. **Delivery OTP & 24-Hour Inspection:** Confirm receipt with your 6-digit OTP to start a **24-hour quality inspection window**.\n' +
      '4. **Release or Dispute:** Confirm quality in **My Orders** to release funds immediately, or raise a dispute with evidence if items are damaged or short-shipped.'
    );
  }

  if (/(trust|score|gst|gstin|verif|badge|tier)/.test(q)) {
    const scoreLine = userContext
      ? `\n\nYour current Trust Score is **${userContext.trustScore ?? 500}/1000** (${userContext.gstVerified ? 'GST Verified' : 'GST Pending Verification'}).`
      : '';
    return (
      '**Tradigoo Trust Score & GST Verification:**\n\n' +
      '- **Baseline Score:** New accounts start at **500/1000** (or **550/1000** once GSTIN is verified).\n' +
      '- **Live Calculation:** Completed escrow orders increase your score, while verified disputes reduce it.\n' +
      '- **GST Verification:** Submit your 15-character GSTIN in **Profile → Trust & GST** to earn the Verified badge and filter priority in the Marketplace.' +
      scoreLine
    );
  }

  if (/(dispute|damage|issue|problem|broken|shortage|complain|ticket)/.test(q)) {
    return (
      '**Raising an Order Dispute or Support Issue:**\n\n' +
      '1. Open **My Orders** and select the affected order.\n' +
      '2. During the **Delivered / 24-Hour Inspection** stage, click **Report Issue**.\n' +
      '3. Describe the mismatch/damage and attach unboxing video or photo evidence.\n' +
      '4. Escrow payout is paused immediately while Tradigoo Operations reviews your claim.'
    );
  }

  if (/(buy now|cart|checkout|order|moq|minimum|gst|tax)/.test(q) && !/(product|price|rice|spice|oil|tea|wheat|catalog|available|stock|sell|inventory)/.test(q)) {
    return (
      '**Ordering on Tradigoo (Add to Cart vs Buy Now):**\n\n' +
      '- **Add to Cart:** Collect multiple wholesale SKUs from different suppliers, adjust quantities (in compliance with each product\'s **MOQ**), and checkout together.\n' +
      '- **Buy Now:** Jump straight from any product card or product detail page into **Escrow Checkout** for that specific SKU without altering your existing cart.\n' +
      '- **GST Calculation:** Category-appropriate GST (5%–18%) is itemized transparently before confirmation.'
    );
  }

  if (/(sell|wholesaler|add sku|inventory|list product|upload|qr label)/.test(q)) {
    return (
      '**Wholesaler Selling & Dispatch Workflow:**\n\n' +
      '1. Go to **Add SKU** (or **Inventory**) to publish products with photos, wholesale unit price, and **MOQ**.\n' +
      '2. Incoming buyer orders appear in **Orders** (`/orders-received`) once funded in Escrow.\n' +
      '3. Download the **Verification QR Label** from the order drawer, seal the consignment, and click **Mark Ready for Pickup / Shipped**.'
    );
  }

  if (
    liveProducts.length > 0 &&
    /(product|price|rice|spice|oil|tea|wheat|dry fruit|electronic|textile|catalog|available|stock|find|buy|source|cheap|best|recommend)/.test(q)
  ) {
    const bullets = liveProducts
      .slice(0, 5)
      .map(
        (p) =>
          `- **${p.name}** (${p.category}) — **₹${p.base_price.toLocaleString('en-IN')}/${p.unit}** · MOQ: **${p.min_order_quantity} ${p.unit}** · Supplier: ${
            p.seller?.business_name || 'Verified Wholesaler'
          }${p.seller?.gst_verified ? ' (GST ✓)' : ''}`
      )
      .join('\n');

    return (
      `Here are live wholesale listings currently available on Tradigoo:\n\n${bullets}\n\n` +
      'You can click **Add to Cart** to build a multi-item order or **Buy Now** on any listing for instant escrow checkout.'
    );
  }

  if (docs.length > 0) {
    const cleanSnippets = docs
      .slice(0, 2)
      .map((d) => d.content.replace(/\s+/g, ' ').trim())
      .map((text) => (text.length > 260 ? `${text.slice(0, 260)}...` : text));

    return (
      `Here is the relevant Tradigoo guidance for your question:\n\n` +
      cleanSnippets.map((snippet) => `- ${snippet}`).join('\n')
    );
  }

  return (
    'On Tradigoo, you can source verified wholesale products using **Add to Cart** or **Buy Now**, pay safely into Escrow, and release funds only after OTP delivery verification and the 24-hour inspection window. ' +
    'Ask me about specific product prices, MOQs, GST verification, Trust Scores, or order tracking!'
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const message = body?.message;
    const history = body?.history;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'Please enter a question about Tradigoo, orders, escrow, or products.' },
        { status: 400 }
      );
    }

    const userQuery = message.trim();

    // Fetch RAG docs, live catalog items, and optional authenticated user context in parallel
    const [retrievedDocs, liveProducts, session] = await Promise.all([
      retrieveDocuments(userQuery, 4),
      fetchLiveCatalogContext(userQuery),
      getAuthenticatedSession().catch(() => null),
    ]);

    let userContext: { role?: string; trustScore?: number; gstVerified?: boolean; businessName?: string } | null =
      null;
    if (session?.userId) {
      try {
        const admin = createServiceClient();
        const { data: profile } = await admin
          .from('profiles')
          .select('role, trust_score, gst_verified, business_name')
          .eq('id', session.userId)
          .maybeSingle();
        if (profile) {
          userContext = {
            role: profile.role || session.role,
            trustScore: Number(profile.trust_score ?? 500),
            gstVerified: Boolean(profile.gst_verified),
            businessName: profile.business_name || undefined,
          };
        }
      } catch {
        // Non-blocking profile context
      }
    }

    const ragContext = formatContext(retrievedDocs);
    const catalogContext =
      liveProducts.length > 0
        ? liveProducts
            .map(
              (p) =>
                `- ${p.name} | Category: ${p.category} | Price: ₹${p.base_price}/${p.unit} | MOQ: ${p.min_order_quantity} | Supplier: ${
                  p.seller?.business_name || 'Verified Wholesaler'
                } (${p.seller?.gst_verified ? 'GST Verified' : 'Standard'}${p.seller?.location ? `, ${p.seller.location}` : ''})`
            )
            .join('\n')
        : 'No active catalog items matched directly.';

    const userContextText = userContext
      ? `Signed-in User: Role=${userContext.role}, Business=${userContext.businessName || 'Partner'}, TrustScore=${userContext.trustScore}/1000, GSTVerified=${userContext.gstVerified}`
      : 'User Status: Guest / Browsing';

    const systemInstruction = `You are Tradigoo Trade Assistant, the official AI support & wholesale sourcing advisor for Tradigoo — India's B2B wholesale marketplace and escrow platform.

PLATFORM RULES & FEATURES:
- Currency is always Indian Rupees (₹).
- Ordering: Buyers can use "Add to Cart" (multi-item cart respecting MOQ) or "Buy Now" (direct single-SKU escrow checkout at /order/confirm).
- Escrow Flow: Payment Held in Escrow -> Wholesaler prints QR label & marks Shipped -> Delivery OTP verification -> 24-hour Quality Inspection window -> Confirm Quality releases escrow (or Raise Dispute holds funds for operations review).
- Trust Score: Calculated on a 0–1000 scale (starts at 500, or 550 with verified GST; rises on successful orders and drops on disputes).
- Roles: Retailers browse Marketplace, manage Cart & My Orders; Wholesalers manage Inventory, Add SKU, and Orders Received.
- Never invent fake order IDs or external prices; ground product answers in the LIVE CATALOG SNAPSHOT below.
- Format answers cleanly with short paragraphs or Markdown bullet points.

${userContextText}

LIVE CATALOG SNAPSHOT:
${catalogContext}

KNOWLEDGE BASE CONTEXT:
${ragContext}`;

    // 1. Primary: Gemini 4 Hydrogen via @google/genai
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey.trim()) {
      try {
        const ai = new GoogleGenAI({
          apiKey: geminiKey.trim(),
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        });

        const formattedHistory = Array.isArray(history)
          ? history
              .slice(-8)
              .map((h: any) => {
                const text = String(h?.text || h?.content || h?.parts?.[0]?.text || '').trim();
                if (!text) return null;
                const role = h?.role === 'model' || h?.role === 'assistant' ? 'model' : 'user';
                return { role, parts: [{ text }] };
              })
              .filter(Boolean) as Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>
          : [];

        const chat = ai.chats.create({
          model: 'gemini-4-hydrogen',
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
          history: formattedHistory,
        });

        const result = await chat.sendMessage({ message: userQuery });
        if (result.text && result.text.trim()) {
          return NextResponse.json({
            reply: result.text.trim(),
            provider: 'gemini',
            model: 'gemini-4-hydrogen',
            sources: retrievedDocs.map((d) => d.source),
          });
        }
      } catch (geminiError) {
        console.warn('[chat] Gemini request failed, checking fallback:', geminiError);
      }
    }

    // 2. Secondary: Groq API if configured
    const groqApiKey = process.env.GROQ_API_KEY;
    if (groqApiKey && groqApiKey.trim()) {
      try {
        const groqMessages: GroqMessage[] = [{ role: 'system', content: systemInstruction }];
        if (Array.isArray(history)) {
          for (const item of history.slice(-8)) {
            const text = item?.text || item?.content || item?.parts?.[0]?.text;
            if (text && typeof text === 'string' && text.trim()) {
              const role = item.role === 'model' || item.role === 'assistant' ? 'assistant' : 'user';
              groqMessages.push({ role, content: text.trim() });
            }
          }
        }
        groqMessages.push({ role: 'user', content: userQuery });

        const { text, modelUsed } = await generateGroqCompletion(groqMessages, {
          model: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
          temperature: 0.3,
          max_tokens: 1024,
        });

        if (text && text.trim()) {
          return NextResponse.json({
            reply: text.trim(),
            provider: 'groq',
            model: modelUsed,
            sources: retrievedDocs.map((d) => d.source),
          });
        }
      } catch (groqError) {
        console.warn('[chat] Groq fallback failed:', groqError);
      }
    }

    // 3. Built-in Live Catalog + RAG Assistant Synthesizer (when external LLM keys are unset/unavailable)
    return NextResponse.json({
      reply: buildMarketplaceFallbackReply(userQuery, retrievedDocs, liveProducts, userContext),
      provider: 'tradigoo-assistant',
      sources: retrievedDocs.map((d) => d.source),
    });
  } catch (error: any) {
    console.error('Chat API Error:', error?.message || error);
    return NextResponse.json(
      { error: 'Unable to process your question right now. Please try again.' },
      { status: 500 }
    );
  }
}
