import { NextResponse } from 'next/server';
import { retrieveDocuments, formatContext } from '@/lib/rag';
import { generateGroqCompletion, GroqMessage } from '@/lib/groq';
import { GoogleGenAI } from '@google/genai';

function buildRagFallbackReply(query: string, docs: Array<{ content: string; source: string }>): string {
  const q = query.toLowerCase();

  if (/^(hi|hello|hey|namaste|good morning|good afternoon|good evening)\b/.test(q.trim())) {
    return (
      'Hello! Welcome to **Tradigoo B2B Support**.\n\n' +
      'I can help you with:\n' +
      '- **Escrow Protection** — how payments stay protected until OTP & inspection\n' +
      '- **Order Tracking & QR Verification** — dispatch, pickup scans, and delivery OTP\n' +
      '- **Wholesaler GST & Trust Score** — supplier verification and listing guidance\n' +
      '- **Disputes & Refunds** — raising inspection claims within the 24-hour window'
    );
  }

  if (docs.length > 0) {
    const cleanSnippets = docs
      .slice(0, 2)
      .map((d) => d.content.replace(/\s+/g, ' ').trim())
      .map((text) => (text.length > 340 ? `${text.slice(0, 340)}...` : text));

    return (
      `Here is what Tradigoo's trade policy & knowledge base covers for your query:\n\n` +
      cleanSnippets.map((snippet) => `• ${snippet}`).join('\n\n')
    );
  }

  return (
    'On Tradigoo, retailer payments are held safely in escrow until delivery is confirmed with a 6-digit OTP and the 24-hour inspection window passes. ' +
    'You can browse verified wholesalers in the Marketplace, track active shipments in My Orders, or open a support ticket if you need operations assistance.'
  );
}

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { reply: 'Please ask a question about Tradigoo, orders, escrow, or products.' },
        { status: 400 }
      );
    }

    const userQuery = message.trim();
    const retrievedDocs = await retrieveDocuments(userQuery, 4);
    const context = formatContext(retrievedDocs);

    const systemPrompt = `You are Tradigoo AI Assistant, the dedicated customer support assistant for the Tradigoo B2B Wholesale Commerce Platform in India.

CORE PLATFORM KNOWLEDGE:
- Tradigoo connects verified Indian retailers and wholesalers with escrow payment protection.
- Escrow: Retailer payments are held safely until goods are delivered (OTP-verified) and the 24-hour inspection window closes without dispute.
- Order & Delivery: Fulfilled with courier tracking, QR verification, and OTP confirmation.
- Dispute Resolution: Retailers can raise a dispute during inspection with photo/video evidence for operations review.
- Currency: Always format prices in Indian Rupees (₹).

INSTRUCTIONS:
- Answer concisely using the Knowledge Base Context below.
- Use clear bullet points for workflows or policies.
- Stay focused on B2B trade, sourcing, escrow, logistics, and Tradigoo usage.

KNOWLEDGE BASE CONTEXT:
${context}`;

    // 1. Prefer Gemini via @google/genai when GEMINI_API_KEY is configured
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && geminiKey.trim()) {
      try {
        const ai = new GoogleGenAI({
          apiKey: geminiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        });
        const historyText = Array.isArray(history)
          ? history
              .slice(-6)
              .map((h: any) => {
                const text = h.text || h.content || h.parts?.[0]?.text || '';
                const label = h.role === 'model' || h.role === 'assistant' ? 'Assistant' : 'User';
                return text ? `${label}: ${String(text).trim()}` : '';
              })
              .filter(Boolean)
              .join('\n')
          : '';

        const result = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: `${systemPrompt}\n\n${historyText ? `Conversation so far:\n${historyText}\n\n` : ''}User: ${userQuery}`,
          config: { maxOutputTokens: 1024 },
        });

        if (result.text) {
          return NextResponse.json({
            reply: result.text,
            provider: 'gemini',
            model: 'gemini-4-hydrogen',
            sources: retrievedDocs.map((d) => d.source),
          });
        }
      } catch (geminiError) {
        console.warn('[chat] Gemini request failed, checking fallback:', geminiError);
      }
    }

    // 2. Fallback to Groq if configured
    const groqApiKey = process.env.GROQ_API_KEY;
    if (groqApiKey && groqApiKey.trim()) {
      try {
        const groqMessages: GroqMessage[] = [{ role: 'system', content: systemPrompt }];
        if (Array.isArray(history)) {
          for (const item of history.slice(-6)) {
            const text = item.text || item.content || (item.parts && item.parts[0]?.text);
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

        return NextResponse.json({
          reply: text,
          provider: 'groq',
          model: modelUsed,
          sources: retrievedDocs.map((d) => d.source),
        });
      } catch (groqError) {
        console.warn('[chat] Groq fallback failed:', groqError);
      }
    }

    // 3. Knowledge-base RAG synthesis fallback when LLM keys are not present in environment
    return NextResponse.json({
      reply: buildRagFallbackReply(userQuery, retrievedDocs),
      provider: 'tradigoo-rag',
      sources: retrievedDocs.map((d) => d.source),
    });
  } catch (error: any) {
    console.error('RAG Chat API Error:', error?.message || error);
    return NextResponse.json(
      { reply: 'Unable to process your question right now. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
