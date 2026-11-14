'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, Bot, Loader2, Minimize2, Mic, Sparkles, RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Markdown from 'react-markdown';
import { authFetch } from '@/lib/auth-fetch';

type Message = {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
};

const INITIAL_MESSAGE: Message = {
  role: 'model',
  text: 'Namaste! I am **Tradigoo Trade Assistant**. Ask me about live wholesale products, pricing & MOQs, escrow protection, delivery OTPs, or GST verification.',
};

const QUICK_PROMPTS = [
  'Show popular wholesale products & MOQs',
  'How does escrow protection work?',
  'How do I verify GST & Trust Score?',
  'How to raise an inspection dispute?',
];

export function Chatbot() {
  const pathname = usePathname();
  const isTransactionalPage =
    pathname === '/cart' || pathname === '/order/confirm' || pathname.startsWith('/order');
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onOpenEvent = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener('tradigoo:open-assistant', onOpenEvent);
    return () => window.removeEventListener('tradigoo:open-assistant', onOpenEvent);
  }, []);

  // Track mobile virtual keyboard resize cleanly via visualViewport
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const vv = window.visualViewport;
    const updateViewport = () => {
      if (window.innerWidth < 768) {
        setViewportHeight(vv.height);
      } else {
        setViewportHeight(null);
      }
    };
    updateViewport();
    vv.addEventListener('resize', updateViewport);
    return () => vv.removeEventListener('resize', updateViewport);
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen, loading]);

  const sendMessage = async (textToSend: string) => {
    const cleanText = textToSend.trim();
    if (!cleanText || loading) return;

    setLastFailedPrompt(null);
    setInput('');
    const currentMessages = [...messages, { role: 'user' as const, text: cleanText }];
    setMessages(currentMessages);
    setLoading(true);

    try {
      const history = messages
        .filter((m) => !m.isError)
        .slice(-8)
        .map((m) => ({
          role: m.role,
          parts: [{ text: m.text }],
        }));

      const res = await authFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: cleanText, history }),
      });

      const data = await res.json();
      if (!res.ok || !data.reply) {
        throw new Error(data?.error || 'Assistant service unavailable');
      }

      setMessages((prev) => [...prev, { role: 'model', text: data.reply }]);
    } catch (error: any) {
      console.error('Chat error:', error);
      setLastFailedPrompt(cleanText);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: error?.message || 'I could not reach the assistant right now. Please tap retry below.',
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    sendMessage(input);
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setLastFailedPrompt(null);
  };

  const startListening = () => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) setInput(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } else {
      toast.info('Voice dictation is not supported in this browser. Please type your question.');
    }
  };

  const mobileSheetMaxHeight = viewportHeight ? `${Math.round(viewportHeight * 0.78)}px` : '76dvh';

  return (
    <>
      {!isOpen && (
        <div
          className={`fixed ${
            pathname === '/'
              ? 'bottom-5 right-4 sm:bottom-6 sm:right-6'
              : isTransactionalPage
              ? 'bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] md:bottom-6 right-4 sm:right-6'
              : 'bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] md:bottom-6 right-4 sm:right-6'
          } z-40 flex items-center gap-2.5`}
        >
          <Button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="h-12 px-4 rounded-full bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#2563EB] hover:opacity-95 text-white shadow-lg border border-white/15 flex items-center gap-2 transition-transform hover:scale-[1.02]"
            aria-label="Open Tradigoo Trade Assistant"
          >
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="text-xs font-semibold hidden sm:inline">Trade Assistant</span>
          </Button>
        </div>
      )}

      {isOpen && (
        <>
          {/* Mobile Bottom-Sheet Dim Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="md:hidden fixed inset-0 z-55 bg-slate-950/50 backdrop-blur-xs"
            aria-hidden="true"
          />

          <div
            style={
              !isMinimized && viewportHeight
                ? { height: mobileSheetMaxHeight, maxHeight: mobileSheetMaxHeight }
                : undefined
            }
            className={`fixed z-[60] bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden
              inset-x-0 bottom-0 rounded-t-3xl pb-safe
              md:inset-x-auto md:bottom-6 md:right-6 md:w-[400px] md:rounded-2xl md:pb-0
              ${isMinimized ? 'h-auto' : 'h-[76dvh] max-h-[82dvh] md:h-[min(560px,calc(100dvh-4rem))]'}
            `}
          >
            {/* Mobile Drag Handle */}
            <div className="md:hidden flex justify-center pt-2 pb-1 bg-[#0F172A] shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/25" />
            </div>

            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-[#0F172A] via-[#1E3A8A] to-[#2563EB] text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm leading-tight truncate">Tradigoo Trade Assistant</h3>
                  <p className="text-[11px] text-blue-100/80 leading-tight">Live Catalog · Escrow · GST</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {messages.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleResetChat}
                    className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                    aria-label="Reset conversation"
                    title="Clear conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized((v) => !v)}
                  className="hidden md:inline-flex h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                  aria-label={isMinimized ? 'Expand assistant' : 'Minimize assistant'}
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                  aria-label="Close assistant"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div
                  ref={scrollRef}
                  className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-3 bg-slate-50 dark:bg-zinc-900/60 overscroll-contain"
                >
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                          m.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-sm'
                            : m.isError
                            ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-500/30 rounded-bl-sm'
                            : 'bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 rounded-bl-sm shadow-2xs'
                        }`}
                      >
                        {m.role === 'model' ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 text-[13px]">
                            <Markdown>{m.text}</Markdown>
                          </div>
                        ) : (
                          <span>{m.text}</span>
                        )}
                      </div>
                      {m.isError && lastFailedPrompt && i === messages.length - 1 && (
                        <button
                          type="button"
                          onClick={() => sendMessage(lastFailedPrompt)}
                          className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <RotateCcw className="w-3 h-3" /> Retry message
                        </button>
                      )}
                    </div>
                  ))}

                  {messages.length === 1 && !loading && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {QUICK_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          onClick={() => sendMessage(prompt)}
                          className="text-left text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-blue-500 hover:text-blue-600 transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-zinc-900 px-3.5 py-2 rounded-2xl rounded-bl-sm border border-slate-200 dark:border-zinc-800 flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-xs">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                        Analyzing catalog &amp; policy...
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Footer — always pinned cleanly at bottom above mobile keyboard */}
                <div className="p-3 bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 shrink-0">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex items-center gap-2"
                  >
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={startListening}
                      className={`h-10 w-10 shrink-0 ${
                        isListening
                          ? 'text-rose-600 bg-rose-50 dark:bg-rose-500/10'
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      aria-label="Voice input"
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onFocus={() => {
                        setTimeout(() => {
                          if (scrollRef.current) {
                            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                          }
                        }, 150);
                      }}
                      placeholder="Ask about products, escrow, GST..."
                      className="h-10 bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-sm"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={loading || !input.trim()}
                      className="h-10 w-10 shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
