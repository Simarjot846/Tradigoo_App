import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { retrieveDocuments } from '@/lib/rag';

function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || !key.trim()) return null;
  try {
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });
  } catch (e) {
    console.warn('Could not initialize Gemini SDK:', e);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = String(body.query || body.prompt || 'wholesale commodity trading advice').trim();
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

    const ragDocs = await retrieveDocuments(query, 2);
    if (liveContext.length === 0 && ragDocs.length > 0) {
      liveContext = ragDocs.map((d) => ({ text: d.content.slice(0, 260), metadata: { source: d.source } }));
    }

    const prompt = `You are Tradigoo AI Trade Brain, an expert B2B sourcing and margin advisor for Indian wholesale trade.
User Role: ${role.toUpperCase()}
Context: ${JSON.stringify(liveContext)}
Query: "${query}"

Instructions:
- Provide actionable B2B guidance tailored for ${role.toUpperCase()}s in India.
- Reference INR (₹), MOQ optimization, GST input credit, or escrow safety where relevant.
- Keep your answer crisp and practical (2-4 sentences).`;

    let aiResponseText = '';
    const ai = getGeminiClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: prompt,
          config: { maxOutputTokens: 512 },
        });
        aiResponseText = response.text || '';
      } catch (geminiError) {
        console.warn('Trade Brain Gemini call failed, using RAG fallback:', geminiError);
      }
    }

    if (!aiResponseText) {
      if (ragDocs.length > 0) {
        aiResponseText = `${ragDocs[0].content.replace(/\s+/g, ' ').slice(0, 260)}...`;
      } else if (role === 'wholesaler') {
        aiResponseText = `For "${query}", highlight GST verification, clear MOQ tiers, and crisp product images to convert repeat retail buyers on Tradigoo.`;
      } else {
        aiResponseText = `For "${query}", compare verified suppliers by GST status, MOQ, and delivered cost in ₹—your payment stays protected in Tradigoo escrow until OTP and inspection complete.`;
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
