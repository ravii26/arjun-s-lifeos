import { useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  FileText,
  MessageSquare,
  Play,
  Plus,
  Trophy,
  Sparkles,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { VaultItem } from "../data/types";

type VaultDraftType = "Quote" | "Video" | "Note" | "Win" | "Memory" | "Reset";

const typeOptions: Array<{ label: string; value: VaultDraftType }> = [
  { label: "Quote", value: "Quote" },
  { label: "Video", value: "Video" },
  { label: "Note", value: "Note" },
  { label: "Win", value: "Win" },
  { label: "Memory", value: "Memory" },
  { label: "Reset", value: "Reset" },
];

const tagOptions = [
  "Remember why I started",
  "When I want to quit",
  "When I feel lost",
  "When I win",
  "When I feel weak",
  "When I failed",
];

const tagStyles: Record<string, { background: string; color: string }> = {
  "When I want to quit": { background: "var(--amber-muted)", color: "var(--amber)" },
  "When I feel weak": { background: "rgba(224,96,126,0.12)", color: "#E0607E" },
  "When I feel lost": { background: "rgba(74,144,217,0.12)", color: "#4A90D9" },
  "When I failed": { background: "var(--s3)", color: "var(--text-3)" },
  "Remember why I started": { background: "var(--primary-muted)", color: "var(--primary)" },
  "When I win": { background: "var(--teal-muted)", color: "var(--teal)" },
};

const typeIcons: Record<VaultItem["type"], typeof MessageSquare> = {
  Quote: MessageSquare,
  Video: Play,
  Note: FileText,
  Win: Trophy,
};

const getRandomItem = (items: VaultItem[]): VaultItem => items[Math.floor(Math.random() * items.length)] ?? items[0];

const getTypeLabel = (value: VaultDraftType): VaultItem["type"] => {
  if (value === "Memory") return "Note";
  if (value === "Reset") return "Quote";
  return value;
};

const getItemStyle = (item: VaultItem) => tagStyles[item.tag] ?? tagStyles["Remember why I started"];

const VaultCard = ({ item, onClick }: { item: VaultItem; onClick: () => void }) => {
  const Icon = typeIcons[item.type];
  const style = getItemStyle(item);

  return (
    <button
      type="button"
      onClick={onClick}
      className="tap-scale hover-surface flex min-h-[176px] w-full flex-col rounded-[18px] border border-[var(--border)] bg-[color:rgba(17,17,25,0.78)] p-4 text-left transition-colors"
      style={{ backdropFilter: "blur(10px)" }}
    >
      <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--text-3)]">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-[12px] border border-[var(--border)] bg-[var(--s2)]">
          <Icon size={16} strokeWidth={1.5} />
        </span>
        <span>{item.type}</span>
      </div>
      <span
        className="mt-4 inline-flex w-fit rounded-full px-3 py-1 text-[12px]"
        style={{ background: style.background, color: style.color }}
      >
        {item.tag}
      </span>
      <p
        className="mt-4 text-[13px] font-normal leading-[1.65] text-[var(--text-2)]"
        style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
      >
        {item.content}
      </p>
      <div className="mt-auto pt-4 text-right text-[12px] text-[var(--text-3)]">{item.daysAgo} days ago</div>
    </button>
  );
};

const VaultDeliveryOverlay = ({
  item,
  onClose,
  onAnother,
  phase,
}: {
  item: VaultItem;
  onClose: () => void;
  onAnother: () => void;
  phase: "enter" | "steady" | "exit";
}) => {
  const startY = useRef<number | null>(null);
  const motionClass = phase === "exit" ? "opacity-0 translate-y-5" : phase === "enter" ? "opacity-0 translate-y-5" : "opacity-100 translate-y-0";

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col transition-all duration-300 ease-out ${motionClass}`}
      style={{ background: "linear-gradient(180deg, #1A1560 0%, #08080F 100%)" }}
      onTouchStart={(event) => {
        startY.current = event.touches[0]?.clientY ?? null;
      }}
      onTouchEnd={(event) => {
        const endY = event.changedTouches[0]?.clientY ?? null;
        if (startY.current !== null && endY !== null && endY - startY.current >= 80) {
          onClose();
        }
        startY.current = null;
      }}
    >
      <div className="pt-12 text-center text-[12px] italic text-[var(--text-3)]">
        Your past self saved this for you {item.daysAgo} days ago
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 w-full max-w-[360px] -translate-x-1/2 -translate-y-1/2 px-4 text-center">
        <div className="rounded-[24px] border border-[rgba(255,255,255,0.1)] bg-[rgba(17,17,25,0.32)] px-6 py-7 shadow-none backdrop-blur-md">
          <svg className="mx-auto mb-5 opacity-30" width="56" height="56" viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <path d="M22 14C14 14 10 20 10 28v8h12v14h12V28c0-8-4-14-12-14Zm30 0c-8 0-12 6-12 14v8h12v14h12V28c0-8-4-14-12-14Z" fill="var(--primary)" />
          </svg>
          <p className="text-[18px] font-normal italic leading-[1.7] text-[var(--text-1)]">{item.content}</p>
        </div>
      </div>

      <div className="absolute bottom-8 left-4 right-4 flex gap-3">
        <button
          type="button"
          className="tap-scale h-12 flex-1 rounded-[14px] bg-[var(--teal)] text-[14px] font-medium text-white"
          onClick={onClose}
        >
          This helped
        </button>
        <button
          type="button"
          className="tap-scale h-12 flex-1 rounded-[14px] border border-[var(--border)] bg-[var(--s2)] text-[14px] font-medium text-[var(--text-1)]"
          onClick={onAnother}
        >
          Show another
        </button>
      </div>
    </div>
  );
};

const AddVaultSheet = ({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (item: VaultItem) => void;
}) => {
  const { state } = useAppContext();
  const [type, setType] = useState<VaultDraftType>("Quote");
  const [tag, setTag] = useState<string>(tagOptions[0]);
  const [content, setContent] = useState("");

  return (
    <div className="fixed inset-0 z-[90] bg-black/50" onClick={onClose}>
      <div className="animate-slide-up fixed bottom-0 left-0 right-0 rounded-t-[24px] border border-[var(--border)] bg-[var(--s2)] px-5 pb-6 pt-8" onClick={(event) => event.stopPropagation()}>
        <div className="absolute left-1/2 top-3 h-1 w-10 -translate-x-1/2 rounded-full bg-[var(--s3)]" />
        <h2 className="text-[18px] font-medium text-[var(--text-1)]">Add to vault</h2>
        <p className="mt-1 text-[12px] text-[var(--text-3)]">Store something useful enough to return to later.</p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {typeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setType(option.value)}
              className={`tap-scale rounded-[14px] border px-3 py-3 text-left text-[12px] transition-colors ${
                type === option.value
                  ? "border-[var(--primary)] bg-[var(--primary-muted)] text-[var(--primary)]"
                  : "border-[var(--border)] bg-[var(--s1)] text-[var(--text-2)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <textarea
          className="mt-4 h-28 w-full rounded-[16px] border border-[var(--border)] bg-[var(--s1)] p-3 text-[14px] font-normal leading-[1.6] text-[var(--text-1)] outline-none"
          placeholder="Write the thing you want future-you to see..."
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {tagOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={`tap-scale rounded-full px-3 py-2 text-[12px] transition-colors ${
                tag === option ? "bg-[var(--primary)] text-white" : "bg-[var(--s1)] text-[var(--text-3)]"
              }`}
              onClick={() => setTag(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="tap-scale mt-5 h-12 w-full rounded-[16px] bg-[var(--primary)] text-[14px] font-medium text-white"
          onClick={() => {
            const item: VaultItem = {
              id: `v-${Date.now()}`,
              type: getTypeLabel(type),
              tag,
              content: content.trim() || "Saved for future you.",
              daysAgo: 0,
            };
            onSubmit(item);
          }}
        >
          Save to vault
        </button>
        <p className="mt-3 text-[12px] text-[var(--text-3)]">Saved items blend into the room without extra chrome.</p>
      </div>
    </div>
  );
};

export const Vault = () => {
  const { state, dispatch } = useAppContext();
  const [activeItem, setActiveItem] = useState<VaultItem | null>(null);
  const [overlayPhase, setOverlayPhase] = useState<"enter" | "steady" | "exit">("steady");
  const [sheetOpen, setSheetOpen] = useState(false);

  const themeStyle = useMemo(
    () =>
      ({
        background: state.theme === "dark" ? "linear-gradient(180deg, #05041e 50%, #08080F 100%)" : "#EEEAFF",
        ["--bg"]: state.theme === "dark" ? "#08080F" : "#EEEAFF",
      }) as CSSProperties & Record<string, string>,
    [state.theme],
  );

  const openRandom = () => {
    setOverlayPhase("enter");
    setActiveItem(getRandomItem(state.vaultItems));
    window.setTimeout(() => setOverlayPhase("steady"), 10);
  };

  const closeOverlay = () => {
    setOverlayPhase("exit");
    window.setTimeout(() => {
      setActiveItem(null);
    }, 300);
  };

  const showAnother = () => {
    setOverlayPhase("exit");
    window.setTimeout(() => {
      setActiveItem(getRandomItem(state.vaultItems));
      setOverlayPhase("enter");
      window.setTimeout(() => setOverlayPhase("steady"), 10);
    }, 150);
  };

  return (
    <div className="relative p-10" style={themeStyle}>
      <div className="pointer-events-none absolute -top-12 left-1/2 h-36 w-56 -translate-x-1/2 rounded-full bg-[var(--primary)]/15 blur-3xl" />

      <section className="rounded-[20px] border border-[rgba(255,255,255,0.08)] bg-[rgba(20,18,42,0.62)] px-5 py-6 backdrop-blur-md">
        <div className="text-center">
          <p className="text-[11px] font-normal uppercase tracking-[0.2em] text-[var(--text-3)]">Vault</p>
          <h1 className="mt-2 text-[24px] font-medium text-[var(--text-1)]">Your armoury.</h1>
          <p className="mt-2 text-[14px] font-normal italic text-[var(--text-2)]">
            Everything your best self saved for your hardest days.
          </p>
        </div>

        <button
          type="button"
          onClick={openRandom}
          className="tap-scale mt-5 h-14 w-full rounded-[16px] bg-[var(--primary)] text-[16px] font-medium text-white"
        >
          I need this right now →
        </button>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-normal uppercase tracking-[0.12em] text-[var(--text-2)]">Your saved fuel</p>
          <p className="text-[12px] font-normal text-[var(--text-2)]">{state.vaultItems.length} items</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {state.vaultItems.map((item) => (
            <VaultCard key={item.id} item={item} onClick={() => setActiveItem(item)} />
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-[12px] font-normal uppercase tracking-[0.12em] text-[var(--text-2)]">When your vault was surfaced</p>
        <div className="overflow-hidden rounded-[16px] border border-[var(--border)] bg-[rgba(19,19,33,0.72)]">
          {[
            "3 days ago — Relationships score dropped below 40",
            "11 days ago — Missed workout 3 days in a row",
            "28 days ago — Day rated 1 out of 5",
          ].map((entry) => (
            <div key={entry} className="border-b border-[var(--border)] px-4 py-3 text-[12px] font-normal text-[var(--text-2)] last:border-b-0">
              {entry}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between text-[12px] font-normal text-[var(--text-2)]">
          <p>{state.pendingResources.length} resources waiting</p>
          <p>Vault on standby</p>
        </div>
        <button
          type="button"
          className="tap-scale h-12 w-full rounded-[16px] border border-[var(--border)] bg-[rgba(19,19,33,0.72)] text-[14px] font-medium text-[var(--text-1)]"
          onClick={() => setSheetOpen(true)}
        >
          Add to vault
        </button>
      </section>

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="tap-scale fixed bottom-[calc(84px+env(safe-area-inset-bottom))] right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-white md:bottom-8 md:right-8"
        aria-label="Add vault item"
      >
        <Plus size={24} strokeWidth={1.5} />
      </button>

      {sheetOpen ? (
        <AddVaultSheet
          onClose={() => setSheetOpen(false)}
          onSubmit={(item) => {
            dispatch({ type: "ADD_VAULT_ITEM", payload: { item } });
            setSheetOpen(false);
          }}
        />
      ) : null}

      {activeItem ? <VaultDeliveryOverlay item={activeItem} phase={overlayPhase} onClose={closeOverlay} onAnother={showAnother} /> : null}
    </div>
  );
};