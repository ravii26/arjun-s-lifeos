import { ArrowRight, Check, Sparkles, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { callAnthropic } from "../services/finalAnthropic";
import { useAppContext } from "../context/AppContext";
import { BottomSheet } from "./BottomSheet";

interface CoachPanelProps {
  open: boolean;
  currentScreen: string;
  contextSummary: string;
  prefilledMessage?: string;
  onClose: () => void;
}

const quickPrompts = [
  "How am I doing this week?",
  "What should I focus on today?",
  "Why is my lowest area score low?",
  "Help me build a better morning routine",
];

export const CoachPanel = ({ open, currentScreen, contextSummary, prefilledMessage, onClose }: CoachPanelProps) => {
  const { state, dispatch } = useAppContext();
  const [draft, setDraft] = useState(prefilledMessage ?? "");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(prefilledMessage ?? "");
  }, [open, prefilledMessage]);

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [state.coachMessages, loading, open]);

  const visibleMessages = useMemo(() => state.coachMessages, [state.coachMessages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage = {
      id: `cm-${Date.now()}`,
      role: "user" as const,
      content: trimmed,
      timestamp: new Date().toISOString(),
      screenContext: currentScreen,
    };

    dispatch({ type: "ADD_COACH_MESSAGE", payload: { message: userMessage } });
    setDraft("");
    setLoading(true);

    const systemPrompt = `You are Arjun's personal life coach inside LifeOS. You know everything about his current state. Be direct, warm, and specific. Never be generic. Reference his actual data. Keep responses under 4 sentences unless asked for more. Do not use bullet points unless the user explicitly asks for a list. Your tone: a senior friend who has figured life out and genuinely cares.\n\nCurrent state:\n- Name: Arjun Mehta, Day 47\n- ${contextSummary}\n- Current screen: ${currentScreen}\n- Day rating: ${state.dayRating ?? "not rated yet"}\n- Morning energy: ${state.morningCheckIn.energy ?? "not set"}`;

    const fallback = "I'm having trouble connecting right now. Try again in a moment.";
    const result = await callAnthropic({
      model: "claude-sonnet-4-20250514",
      system: systemPrompt,
      messages: state.coachMessages.map((message) => ({ role: message.role, content: message.content })).concat({ role: "user", content: trimmed }),
      maxTokens: 600,
      fallback,
      timeoutMs: 4000,
    });

    dispatch({
      type: "ADD_COACH_MESSAGE",
      payload: {
        message: {
          id: `cm-${Date.now()}-a`,
          role: "assistant",
          content: result.text,
          timestamp: new Date().toISOString(),
          screenContext: currentScreen,
        },
      },
    });
    setLoading(false);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void sendMessage(draft);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140]">
      <div className="absolute inset-0 bg-black/40 md:hidden" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full flex-col border-l border-[var(--border)] bg-[var(--s1)] md:w-[360px] md:shadow-none">
        <div className="flex h-[52px] items-center justify-between border-b border-[var(--border)] px-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} strokeWidth={1.5} className="text-[var(--primary)]" />
            <div>
              <p className="text-[15px] font-medium text-[var(--text-1)]">AI Coach</p>
              <p className="text-[12px] text-[var(--text-3)]">Day 47</p>
            </div>
          </div>
          <button type="button" className="tap-scale text-[var(--text-3)]" onClick={onClose}>
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-4 py-3 text-center text-[12px] italic text-[var(--text-3)]">Viewing {currentScreen} · {contextSummary}</div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {visibleMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <Sparkles size={32} strokeWidth={1.4} className="text-[var(--primary)] opacity-40" />
              <p className="mt-3 text-[14px] font-medium text-[var(--text-1)]">Your coach is ready.</p>
              <p className="mt-1 text-[12px] text-[var(--text-3)]">Ask anything about your progress, habits, or goals.</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="tap-scale rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3 py-2 text-left text-[11px] text-[var(--text-2)]"
                    onClick={() => void sendMessage(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3 py-2">
              {visibleMessages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-[12px] px-3 py-3 ${message.role === "user" ? "bg-[var(--primary-muted)] text-[var(--primary)]" : "bg-[var(--s2)] text-[var(--text-1)]"}`}>
                    {message.role === "assistant" ? <Sparkles size={12} strokeWidth={1.5} className="mb-1 text-[var(--primary)]" /> : null}
                    <p className="text-[13px] leading-[1.6]">{message.content}</p>
                    <p className="mt-2 text-[10px] text-[var(--text-3)]">{new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
              ))}
              {loading ? (
                <div className="flex justify-start">
                  <div className="rounded-[12px] bg-[var(--s2)] px-3 py-3 text-[var(--text-3)]">
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--text-3)]" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--text-3)] [animation-delay:120ms]" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--text-3)] [animation-delay:240ms]" />
                    </div>
                  </div>
                </div>
              ) : null}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <form className="border-t border-[var(--border)] p-3" onSubmit={handleSubmit}>
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={1}
              placeholder="Ask your coach..."
              className="min-h-[40px] flex-1 resize-none rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3 py-3 text-[13px] text-[var(--text-1)] outline-none"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage(draft);
                }
              }}
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="tap-scale inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-white disabled:opacity-50"
            >
              <ArrowRight size={18} strokeWidth={1.8} />
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
};
