import { NextResponse } from 'next/server';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { retrieveDocuments } from '@/lib/rag';
import { createServiceClient } from '@/lib/supabase-server';

function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || !key.trim()) return null;
  try {
    return new GoogleGenAI({
      apiKey: key.trim(),
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
  } catch (e) {
    console.warn('Could not initialize Gemini SDK:', e);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = String(body.query || body.prompt || 'wholesale sourcing & escrow trends').trim();
    const role = String(body.role || 'retailer').trim().toLowerCase();

    let liveContext: Array<{ text: string; metadata?: any }> = [];
    const pathwayBaseUrl = process.env.PATHWAY_API_URL;
    if (pathwayBaseUrl) {
      try {
        const pathwayRes = await fetch(`${pathwayBaseUrl}/v1/retrieve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, k: 3 }),
          signal: AbortSignal.timeout(1500),
        });
        if (pathwayRes.ok) {
          liveContext = await pathwayRes.json();
        }
      } catch (e) {
        console.warn('Pathway retrieval unavailable:', e);
      }
    }

    // Fetch live catalog summary from Supabase
    let catalogSummary = '';
    try {
      const admin = createServiceClient();
      const { data: prods } = await admin
        .from('products')
        .select('name, category, base_price, min_order_quantity, unit')
        .eq('is_active', true)
        .order('demand_score', { ascending: false })
        .limit(8);

      if (Array.isArray(prods) && prods.length > 0) {
        const cats = Array.from(new Set(prods.map((p: any) => p.category).filter(Boolean)));
        const topItem = prods[0];
        catalogSummary = `Active top listings across ${cats.join(', ')} including ${topItem.name} at ₹${Number(
          topItem.base_price || 0
        ).toLocaleString('en-IN')}/${topItem.unit || 'unit'} (MOQ ${topItem.min_order_quantity}).`;
      }
    } catch {
      // Non-blocking
    }

    const ragDocs = await retrieveDocuments(query, 2);
    if (liveContext.length === 0 && ragDocs.length > 0) {
      liveContext = ragDocs.map((d) => ({
        text: d.content.slice(0, 260),
        metadata: { source: d.source },
      }));
    }

    const systemInstruction = `You are Tradigoo AI Trade Brain, an expert B2B sourcing and margin advisor for Indian wholesale trade.
- Provide actionable B2B guidance tailored specifically for ${role.toUpperCase()}s in India.
- Always use Indian Rupees (₹), reference MOQ optimization, GST input credit, or Tradigoo escrow safety where relevant.
- Keep your answer crisp, practical, and easy to scan (2-3 sentences).`;

    let aiResponseText = '';
    const ai = getGeminiClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: `Market Snapshot: ${catalogSummary || 'Active Indian wholesale catalog'}\nRetrieved Context: ${JSON.stringify(
            liveContext
          )}\nUser Focus: "${query}"`,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          },
        });
        aiResponseText = response.text?.trim() || '';
      } catch (geminiError) {
        console.warn('Trade Brain Gemini call failed, using catalog/RAG fallback:', geminiError);
      }
    }

    if (!aiResponseText) {
      if (role === 'wholesaler') {
        aiResponseText = `${
          catalogSummary ? `${catalogSummary} ` : ''
        }Highlight GST verification, competitive MOQ slabs, and crisp product imagery to win repeat orders from high-trust retailers on Tradigoo.`;
      } else {
        aiResponseText = `${
          catalogSummary ? `${catalogSummary} ` : ''
        }Compare GST-verified suppliers by landed cost in ₹ and MOQ—every order stays protected in Tradigoo Escrow until OTP delivery confirmation and your 24-hour quality inspection.`;
      }
    }

    return NextResponse.json({
      recommendation: aiResponseText,
      matches: liveContext,
    });
  } catch (error) {
    console.error('Trade Brain Error:', error);
    return NextResponse.json({ error: 'Failed to generate Trade Brain response' }, { status: 500 });
  }
}
