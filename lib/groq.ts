export interface GroqMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface GroqChatOptions {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    timeoutMs?: number;
}

/**
 * Groq OpenAI-Compatible Chat Completion Helper
 * Primary Model: llama-3.1-70b-versatile (stable, widely available)
 * Secondary: llama-3.3-70b-versatile (newer, may not be available on all plans)
 * Fallback Model: llama-3.1-8b-instant (ultra-low latency, ~800 tokens/s)
 */
export async function generateGroqCompletion(
    messages: GroqMessage[],
    options: GroqChatOptions = {}
): Promise<{ text: string; modelUsed: string }> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || !apiKey.trim()) {
        const err: any = new Error('GROQ_API_KEY is not configured');
        err.code = 'GROQ_API_KEY_MISSING';
        throw err;
    }

    // Model priority: env override → llama-3.1-70b → llama-3.3-70b → llama-3.1-8b-instant
    const requestedModel = options.model || process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';
    const modelChain = [
        requestedModel,
        'llama-3.1-70b-versatile',
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
    ].filter((m, i, arr) => arr.indexOf(m) === i); // deduplicate

    const timeoutMs = options.timeoutMs || 12000;

    const callApi = async (modelName: string) => {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey.trim()}`,
            },
            body: JSON.stringify({
                model: modelName,
                messages,
                temperature: options.temperature ?? 0.2,
                max_tokens: options.max_tokens ?? 1024,
            }),
            signal: AbortSignal.timeout(timeoutMs),
        });

        if (response.status === 429) {
            const errData = await response.json().catch(() => ({}));
            const err: any = new Error(errData?.error?.message || 'Rate limit exceeded on Groq API');
            err.status = 429;
            throw err;
        }

        if (response.status === 401) {
            const errData = await response.json().catch(() => ({}));
            const err: any = new Error(errData?.error?.message || 'Invalid Groq API Key');
            err.status = 401;
            throw err;
        }

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const err: any = new Error(errData?.error?.message || `Groq API error HTTP ${response.status}`);
            err.status = response.status;
            err.isModelError = errData?.error?.type === 'invalid_request_error' || response.status === 404;
            throw err;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
            throw new Error('Groq returned empty completion content');
        }

        return { text: content.trim(), modelUsed: modelName };
    };

    // Try each model in the chain, falling back on model-not-found or rate-limit errors
    let lastError: any;
    for (const model of modelChain) {
        try {
            return await callApi(model);
        } catch (err: any) {
            lastError = err;
            // Don't try next model if it's an auth error
            if (err.status === 401) throw err;
            // Try next model on rate limit or model-not-found
            if (err.status === 429 || err.isModelError || err.status === 404) {
                console.warn(`Groq model "${model}" unavailable (${err.status}), trying next...`);
                continue;
            }
            throw err;
        }
    }
    throw lastError;
}
