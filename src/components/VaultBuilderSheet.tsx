import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { BottomSheet } from "./BottomSheet";
import { callAnthropic } from "../services/finalAnthropic";
import { useAppContext } from "../context/AppContext";

interface VaultBuilderSheetProps {
  open: boolean;
  onClose: () => void;
}

const questions = [
  "Why did you start this journey?",
  "What does your best day look like?",
  "What are you most afraid of going back to?",
  "Write one thing you're proud of — no matter how small.",
  "What would you tell yourself on your hardest future day?",
  "What is the one goal that matters most right now?",
];

const fallbackItems = [
  { type: "quote", tag: "Remember why I started", content: "You started because you refused to stay where you were. Keep choosing the harder truth when it matters." },
  { type: "note", tag: "When I feel lost", content: "When everything feels noisy, return to one task, one room, one clear next step. That is enough to restart." },
  { type: "win", tag: "When I win", content: "You do not need the whole future solved to deserve credit. Small wins stacked daily are how you became someone different." },
  { type: "quote", tag: "When I want to quit", content: "The version of you who finishes will feel ordinary while building it. That is the point." },
  { type: "note", tag: "When I failed", content: "Failure is data, not identity. Use it to tighten the plan, not to shrink your effort." },
];

export const VaultBuilderSheet = ({ open, onClose }: VaultBuilderSheetProps) => {
  const { dispatch } = useAppContext();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array.from({ length: 6 }, () => ""));
  const [generated, setGenerated] = useState<Array<{ type: string; tag: string; content: string }>>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const canContinue = answers[step].trim().length >= 10;
  const progressDots = useMemo(() => Array.from({ length: 6 }, (_, index) => index), []);

  const answerSet = (value: string) => {
    const next = [...answers];
    next[step] = value;
    setAnswers(next);
  };

  const next = async () => {
    if (step < 5) {
      setStep((current) => current + 1);
      return;
    }

    setSaving(true);
    const fallback = JSON.stringify({ items: fallbackItems });
    const result = await callAnthropic({
      model: "claude-sonnet-4-20250514",
      system:
        "You are writing deeply personal vault items for a user's LifeOS. Based on their answers, create 5 vault items. Each item should feel personal, direct, and emotionally resonant. Respond ONLY in this JSON format: { 'items': [ { 'type': 'quote'|'note'|'win', 'tag': one of: 'Remember why I started'|'When I want to quit'|'When I feel weak'|'When I feel lost'|'When I win'|'When I failed', 'content': string (2-4 sentences, personal, second-person 'you') } ] }. Use all 5 different tags. Make content reference specifics from their answers.",
      messages: [
        {
          role: "user",
          content: JSON.stringify(
            questions.map((question, index) => ({ question, answer: answers[index] })),
          ),
        },
      ],
      maxTokens: 1500,
      fallback,
      timeoutMs: 5000,
    });

    try {
      const parsed = JSON.parse(result.text) as { items?: Array<{ type: string; tag: string; content: string }> };
      setGenerated((parsed.items ?? fallbackItems).slice(0, 5));
    } catch {
      setGenerated(fallbackItems.slice(0, 5));
    }
    setSaving(false);
  };

  const saveAll = () => {
    generated.slice(0, 5).forEach((item, index) => {
      dispatch({
        type: "ADD_VAULT_ITEM",
        payload: {
          item: {
            id: `v-${Date.now()}-${index}`,
            type: item.type === "quote" ? "Quote" : item.type === "win" ? "Win" : "Note",
            tag: item.tag,
            content: item.content,
            daysAgo: 0,
          },
        },
      });
    });
    onClose();
  };

  if (!open) return null;

  return (
    <BottomSheet open={open} onClose={onClose} maxHeightClassName="h-[100vh] max-h-[100vh]">
      <div className="flex h-[100vh] flex-col">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} strokeWidth={1.5} className="text-[var(--primary)]" />
            <div>
              <p className="text-[18px] font-medium text-[var(--text-1)]">Build your vault</p>
              <p className="text-[13px] text-[var(--text-3)]">I&apos;ll ask you a few questions. Answer honestly.</p>
            </div>
          </div>
          <span className="text-[12px] text-[var(--text-3)]">{step + 1}/6</span>
        </div>

        {!generated.length ? (
          <div className="flex-1 px-4 py-6">
            <div className="mb-6 flex justify-center gap-2">
              {progressDots.map((dot) => (
                <span key={dot} className={`h-2 w-2 rounded-full ${dot === step ? "bg-[var(--primary)]" : "bg-[var(--s3)]"}`} />
              ))}
            </div>

            <div className="flex h-[72vh] flex-col items-center justify-center">
              <p className="max-w-[360px] text-center text-[22px] font-medium text-[var(--text-1)]">{questions[step]}</p>
              <textarea
                autoFocus
                value={answers[step]}
                onChange={(event) => answerSet(event.target.value)}
                rows={4}
                className="mt-5 w-full max-w-[420px] rounded-[14px] border-b border-[var(--border)] bg-[var(--s2)] p-4 text-[16px] text-[var(--text-1)] outline-none"
              />
              <button
                type="button"
                disabled={!canContinue}
                onClick={() => void next()}
                className="tap-scale mt-5 h-12 w-full max-w-[420px] rounded-[10px] bg-[var(--primary)] text-[14px] font-medium text-white disabled:opacity-50"
              >
                Next →
              </button>
              <button type="button" className="mt-3 text-[12px] text-[var(--text-3)]" onClick={() => void next()}>
                Skip
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-5">
            {saving ? (
              <div className="flex h-[60vh] flex-col items-center justify-center text-center">
                <Sparkles size={36} strokeWidth={1.4} className="animate-pulse text-[var(--primary)]" />
                <p className="mt-3 text-[14px] text-[var(--text-2)]">Writing your vault items...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {generated.map((item, index) => (
                  <article key={`${item.tag}-${index}`} className={`rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4 ${editing ? "" : "animate-fade-in-up"}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--primary)]">New</p>
                        <p className="mt-1 text-[14px] font-medium text-[var(--text-1)]">{item.tag}</p>
                      </div>
                      <span className="rounded-full bg-[var(--teal-muted)] px-2 py-1 text-[11px] text-[var(--teal)]">{item.type}</span>
                    </div>
                    <textarea
                      value={item.content}
                      onChange={(event) => {
                        const next = [...generated];
                        next[index] = { ...next[index], content: event.target.value };
                        setGenerated(next);
                      }}
                      className={`mt-3 w-full rounded-[12px] border border-[var(--border)] bg-[var(--s2)] p-3 text-[13px] text-[var(--text-2)] outline-none ${editing ? "" : "pointer-events-none"}`}
                      rows={4}
                      readOnly={!editing}
                    />
                  </article>
                ))}
                <button type="button" className="tap-scale w-full rounded-[10px] bg-[var(--primary)] py-3 text-[14px] font-medium text-white" onClick={saveAll}>
                  Save all to your vault →
                </button>
                <button type="button" className="w-full text-[12px] text-[var(--text-3)]" onClick={() => setEditing((current) => !current)}>
                  Edit before saving
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </BottomSheet>
  );
};
