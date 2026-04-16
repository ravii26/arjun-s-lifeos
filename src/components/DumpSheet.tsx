import { ArrowRight, Inbox, Sparkles, Trash2, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { BottomSheet } from "./BottomSheet";
import { callAnthropic } from "../services/finalAnthropic";
import type { DumpItem } from "../types";

interface DumpSheetProps {
  open: boolean;
  onClose: () => void;
}

const ageLabel = (createdAt: string): string => {
  const diff = Math.max(Date.now() - new Date(createdAt).getTime(), 0);
  const days = Math.max(Math.round(diff / (24 * 60 * 60 * 1000)), 0);
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
};

const fallbackProcess = (content: string) => ({
  suggestedType: content.toLowerCase().includes("book") ? "course" : content.toLowerCase().includes("gratitude") ? "note" : "task",
  areaId: content.toLowerCase().includes("shadcn") ? "career" : content.toLowerCase().includes("gratitude") ? "mind" : "career",
  reasoning: "Smart fallback routed this into the nearest LifeOS lane.",
  accepted: true,
});

export const DumpSheet = ({ open, onClose }: DumpSheetProps) => {
  const { state, dispatch } = useAppContext();
  const [text, setText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [processedOpen, setProcessedOpen] = useState(false);

  const unprocessed = useMemo(() => state.dumpItems.filter((item) => !item.processed).slice().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), [state.dumpItems]);
  const processed = useMemo(() => state.dumpItems.filter((item) => item.processed).slice().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), [state.dumpItems]);

  const addItem = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    const item: DumpItem = {
      id: `d-${Date.now()}`,
      content: trimmed,
      createdAt: new Date().toISOString(),
      processed: false,
    };
    dispatch({ type: "ADD_DUMP_ITEM", payload: { item } });
    setText("");
  };

  const processItem = async (item: DumpItem) => {
    const fallback = fallbackProcess(item.content);
    const result = await callAnthropic({
      model: "claude-sonnet-4-20250514",
      system: "You process dump items into a single structured JSON object with suggestedType, areaId, reasoning, accepted.",
      messages: [{ role: "user", content: item.content }],
      maxTokens: 180,
      fallback: JSON.stringify(fallback),
      timeoutMs: 2000,
    });

    const parsed = (() => {
      try {
        return JSON.parse(result.text) as typeof fallback;
      } catch {
        return fallback;
      }
    })();

    dispatch({
      type: "UPDATE_DUMP_ITEM",
      payload: {
        item: {
          ...item,
          processed: true,
          processingResult: {
            suggestedType: parsed.suggestedType,
            areaId: parsed.areaId,
            reasoning: parsed.reasoning,
            accepted: parsed.accepted,
          },
        },
      },
    });
  };

  const processAll = async () => {
    setProcessing(true);
    for (let index = 0; index < unprocessed.length; index += 1) {
      const item = unprocessed[index];
      setProgress(`Processing ${index + 1} of ${unprocessed.length}...`);
      await new Promise((resolve) => setTimeout(resolve, index === 0 ? 0 : 300));
      await processItem(item);
    }
    setProgress(null);
    setProcessing(false);
  };

  const handleQuickSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    addItem(text);
  };

  if (!open) return null;

  return (
    <BottomSheet open={open} onClose={onClose} maxHeightClassName="h-[100vh] max-h-[100vh]">
      <div className="flex h-[100vh] flex-col">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
          <div className="flex items-center gap-2">
            <Inbox size={18} strokeWidth={1.5} className="text-[var(--text-2)]" />
            <p className="text-[18px] font-medium text-[var(--text-1)]">Dump</p>
            <span className="rounded-full bg-[var(--amber-muted)] px-2 py-1 text-[11px] text-[var(--amber)]">{unprocessed.length}</span>
          </div>
          <button
            type="button"
            className="tap-scale h-7 rounded-[8px] bg-[var(--primary-muted)] px-3 text-[12px] font-medium text-[var(--primary)] disabled:opacity-40"
            disabled={unprocessed.length === 0 || processing}
            onClick={() => void processAll()}
          >
            {processing ? "Processing..." : "Process all"}
          </button>
        </div>

        <form className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--s1)] p-3" onSubmit={handleQuickSubmit}>
          <div className="flex items-center gap-2 rounded-[12px] border border-[var(--border)] bg-[var(--s2)] px-3 h-[44px]">
            <input
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Type anything — ideas, links, thoughts, reminders..."
              className="min-w-0 flex-1 border-0 bg-transparent text-[14px] text-[var(--text-1)] outline-none"
            />
            <button type="submit" className="tap-scale inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-white">
              <ArrowRight size={16} strokeWidth={1.8} />
            </button>
          </div>
          {progress ? <p className="mt-2 text-[12px] text-[var(--text-3)]">{progress}</p> : null}
        </form>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          <section className="space-y-2">
            <p className="text-[12px] uppercase tracking-[0.08em] text-[var(--text-3)]">Unprocessed</p>
            {unprocessed.map((item) => (
              <article key={item.id} className="rounded-[10px] border border-[var(--border)] bg-[var(--s1)] p-3 transition-colors duration-150 hover:bg-[var(--s3)]">
                <p className="text-[13px] text-[var(--text-1)]">{item.content}</p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--text-3)]">
                  <span>{ageLabel(item.createdAt)}</span>
                  <div className="flex items-center gap-2">
                    <button type="button" className="tap-scale text-[var(--primary)]" onClick={() => void processItem(item)}>
                      <Wand2 size={12} strokeWidth={1.8} />
                    </button>
                    <button type="button" className="tap-scale text-[var(--text-3)]" onClick={() => dispatch({ type: "DELETE_DUMP_ITEM", payload: { itemId: item.id } })}>
                      <Trash2 size={12} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
                {item.processingResult ? (
                  <div className="mt-3 rounded-[10px] bg-[var(--primary-muted)] p-2 text-[12px] text-[var(--text-1)]">
                    → {item.processingResult.suggestedType} · {item.processingResult.reasoning}
                  </div>
                ) : null}
              </article>
            ))}
          </section>

          <section className="mt-5 space-y-2">
            <button type="button" className="flex items-center gap-2 text-[12px] text-[var(--text-3)]" onClick={() => setProcessedOpen((current) => !current)}>
              <Sparkles size={12} strokeWidth={1.5} />
              Processed {processed.length}
            </button>
            {processedOpen ? (
              <div className="space-y-2">
                {processed.map((item) => (
                  <article key={item.id} className="rounded-[10px] border border-[var(--border)] bg-[var(--s1)] p-3 opacity-60">
                    <p className="text-[13px] text-[var(--text-1)]">{item.content}</p>
                    <div className="mt-2 flex gap-2 text-[11px]">
                      <span className="rounded-full bg-[var(--primary-muted)] px-2 py-1 text-[var(--primary)]">→ {item.processingResult?.suggestedType ?? "item"}</span>
                      <span className={`rounded-full px-2 py-1 ${item.processingResult?.accepted ? "bg-[var(--teal-muted)] text-[var(--teal)]" : "bg-[var(--s3)] text-[var(--text-3)]"}`}>
                        {item.processingResult?.accepted ? "Accepted" : "Declined"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </BottomSheet>
  );
};
