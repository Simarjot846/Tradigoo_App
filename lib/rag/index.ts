import fs from 'fs';
import path from 'path';

export interface RagDocument {
    content: string;
    source: string;
    score?: number;
}

const STOP_WORDS = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'to', 'for',
    'of', 'with', 'what', 'how', 'why', 'who', 'can', 'you', 'this', 'that', 'it',
    'i', 'me', 'my', 'do', 'does', 'did', 'be', 'are', 'was', 'were', 'have',
    'has', 'had', 'tell', 'about', 'some', 'please', 'help'
]);

export async function retrieveDocuments(query: string, k: number = 3): Promise<RagDocument[]> {
    const dataDir = path.join(process.cwd(), 'lib', 'rag', 'data');
    if (!fs.existsSync(dataDir)) {
        return [];
    }

    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.txt'));
    const documents: RagDocument[] = [];

    // Extract meaningful search terms (remove punctuation and common stop words)
    const cleanQuery = query.toLowerCase().replace(/[^\w\s]/g, ' ');
    const rawTokens = cleanQuery.split(/\s+/).filter(t => t.length >= 2);
    const meaningfulTerms = rawTokens.filter(t => !STOP_WORDS.has(t));
    const searchTerms = meaningfulTerms.length > 0 ? meaningfulTerms : rawTokens;

    for (const file of files) {
        const filePath = path.join(dataDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        // Split into logical document sections/paragraphs
        const chunks = content.split(/(?:\r?\n){2,}|---|#{1,3}\s+/).filter(c => c.trim().length > 30);

        for (const chunk of chunks) {
            let score = 0;
            const chunkLower = chunk.toLowerCase();

            // Match terms
            for (const term of searchTerms) {
                if (chunkLower.includes(term)) {
                    score += 2;
                    // Boost if exact word match
                    const regex = new RegExp(`\\b${term}\\b`, 'i');
                    if (regex.test(chunk)) {
                        score += 3;
                    }
                }
            }

            if (score > 0) {
                documents.push({
                    content: chunk.trim(),
                    source: file,
                    score: score
                });
            }
        }
    }

    // If query was broad / no keyword matched, provide foundational FAQ and Escrow policy overview
    if (documents.length === 0) {
        for (const file of ['faq.txt', 'escrow_policy.txt', 'delivery_process.txt']) {
            const filePath = path.join(dataDir, file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf-8');
                const firstChunk = content.split(/(?:\r?\n){2,}|---|#{1,3}\s+/).filter(c => c.trim().length > 50)[0];
                if (firstChunk) {
                    documents.push({
                        content: firstChunk.trim(),
                        source: file,
                        score: 1
                    });
                }
            }
        }
    }

    // Sort by score descending and return top-k unique chunks
    const seen = new Set<string>();
    return documents
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .filter(doc => {
            const preview = doc.content.slice(0, 60);
            if (seen.has(preview)) return false;
            seen.add(preview);
            return true;
        })
        .slice(0, k);
}

export function formatContext(documents: RagDocument[]): string {
    if (documents.length === 0) {
        return "No relevant records found in the knowledge base.";
    }

    return documents
        .map((doc, i) => `[Document ${i + 1} - Source: ${doc.source}]\n${doc.content}`)
        .join('\n\n---\n\n');
}
