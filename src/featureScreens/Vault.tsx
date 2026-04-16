import * as React from 'react';
import { Quote, Sparkles, Video, Mic, Image, FileText, Award, Plus, ArrowLeft, ArrowRight } from 'lucide-react';
import { BottomSheet } from '@/components/BottomSheet';
import { useApp } from '@/context/appState';
import { cn } from '@/lib/utils';
import type { VaultItem, VaultItemType } from '@/types';

const typeMeta: Record<VaultItemType, { label: string; Icon: React.ElementType; color: string }> = {
  quote: { label: 'Quote', Icon: Quote, color: 'var(--primary)' },
  video: { label: 'Video', Icon: Video, color: 'var(--amber)' },
  voice: { label: 'Voice', Icon: Mic, color: 'var(--teal)' },
  image: { label: 'Image', Icon: Image, color: 'var(--primary)' },
  note: { label: 'Note', Icon: FileText, color: 'var(--t2)' },
  win: { label: 'Win', Icon: Award, color: 'var(--teal)' },
};

const tagOptions = [
  { label: 'focus', color: 'var(--primary)' },
  { label: 'quit', color: 'var(--amber)' },
  { label: 'lost', color: 'var(--primary)' },
  { label: 'failed', color: 'var(--t2)' },
  { label: 'weak', color: 'var(--coral)' },
  { label: 'win', color: 'var(--teal)' },
];

const seedVaultItems: VaultItem[] = [
  { id: 'vault-seed-1', type: 'quote', tag: 'focus', content: 'Small daily wins compound faster than sporadic intensity.', daysAgo: 2, source: 'Notebook' },
  { id: 'vault-seed-2', type: 'win', tag: 'win', content: 'Shipped the dashboard skeleton and cleaned up routing.', daysAgo: 0 },
  { id: 'vault-seed-3', type: 'note', tag: 'relationships', content: 'One call can reset a whole week.', daysAgo: 6 },
  { id: 'vault-seed-4', type: 'video', tag: 'quit', content: 'Stay-hard clip saved after missing four workouts.', daysAgo: 11 },
  { id: 'vault-seed-5', type: 'voice', tag: 'weak', content: 'Voice note for the night I wanted to quit.', daysAgo: 15 },
  { id: 'vault-seed-6', type: 'image', tag: 'focus', content: 'A screen that felt right after the second redesign.', daysAgo: 18 },
  { id: 'vault-seed-7', type: 'quote', tag: 'win', content: 'You do not need more intensity. You need more continuity.', daysAgo: 25, source: 'Journal' },
];

function useOverlaySwipe(onClose: () => void) {
  const touchStart = React.useRef<number | null>(null);
  const [offset, setOffset] = React.useState(0);

  return {
    offset,
    swipeHandlers: {
      onTouchStart: (event: React.TouchEvent) => {
        touchStart.current = event.touches[0]?.clientY ?? null;
      },
      onTouchMove: (event: React.TouchEvent) => {
        if (touchStart.current === null) return;
        const delta = event.touches[0].clientY - touchStart.current;
        if (delta > 0) setOffset(delta);
      },
      onTouchEnd: () => {
        if (offset >= 80) onClose();
        setOffset(0);
        touchStart.current = null;
      },
    },
  };
}

function VaultDeliveryOverlay({
  item,
  isOpen,
  onClose,
  onNext,
  helped,
}: {
  item: VaultItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  helped: () => void;
}) {
  const { state } = useApp();
  const { offset, swipeHandlers } = useOverlaySwipe(onClose);

  if (!isOpen || !item) return null;
  const meta = typeMeta[item.type];
  const Icon = meta.Icon;
  const dark = state.theme === 'dark';

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto transition-all duration-300"
      style={{
        background: dark ? 'linear-gradient(180deg, #1A1560 0%, #08080F 100%)' : '#EEEAFF',
        transform: `translateY(${offset}px)`,
      }}
      {...swipeHandlers}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[720px] flex-col px-4 pb-8 pt-12 text-center">
        <div className="text-[12px] italic text-[var(--t3)]">{item.daysAgo} days ago</div>
        <div className="flex flex-1 items-center justify-center">
          <div className="space-y-4">
            <div className="flex justify-center text-[var(--primary)] opacity-30">
              <Quote size={64} strokeWidth={1.25} />
            </div>
            <div className="mx-auto max-w-[280px] text-[18px] font-normal italic leading-[1.7] text-[var(--t1)]">
              {item.content}
            </div>
            <div className="flex items-center justify-center gap-2 text-[12px] text-[var(--t3)]">
              <span className="rounded-full bg-[var(--s3)] px-2 py-0.5">{meta.label}</span>
              <span className="rounded-full bg-[var(--s3)] px-2 py-0.5">{item.tag}</span>
            </div>
          </div>
        </div>
        <div className="fixed bottom-8 left-4 right-4 mx-auto flex max-w-[720px] gap-3">
          <button type="button" onClick={helped} className="h-14 flex-1 rounded-[14px] bg-[var(--teal)] text-[16px] font-medium text-white">
            This helped
          </button>
          <button type="button" onClick={onNext} className="h-14 flex-1 rounded-[14px] bg-[var(--s2)] text-[16px] font-medium text-[var(--t1)]">
            Show another
          </button>
        </div>
      </div>
    </div>
  );
}

function VaultCard({ item, onOpen }: { item: VaultItem; onOpen: (item: VaultItem) => void }) {
  const meta = typeMeta[item.type];
  const Icon = meta.Icon;

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className="rounded-[14px] border border-[var(--border-strong)] bg-[var(--s1)]/85 p-4 text-left transition-colors duration-150 hover:bg-[var(--s2)]"
    >
      <div className="flex items-center justify-between gap-2 text-[12px] text-[var(--t3)]">
        <div className="flex items-center gap-2">
          <Icon size={16} strokeWidth={1.5} />
          <span>{meta.label}</span>
        </div>
        <span>{item.daysAgo}d</span>
      </div>
      <div className="mt-3 line-clamp-2 text-[13px] leading-[1.6] text-[var(--t2)]">
        {item.content}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="rounded-full px-2 py-0.5 text-[11px]" style={{ color: meta.color, background: 'color-mix(in srgb, currentColor 12%, transparent)' }}>
          {item.tag}
        </span>
        <span className="text-[12px] text-[var(--t3)]">{item.daysAgo} days ago</span>
      </div>
    </button>
  );
}

function AddVaultSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { dispatch } = useApp();
  const [type, setType] = React.useState<VaultItemType>('quote');
  const [tag, setTag] = React.useState(tagOptions[0].label);
  const [content, setContent] = React.useState('');

  React.useEffect(() => {
    if (!isOpen) return;
    setType('quote');
    setTag(tagOptions[0].label);
    setContent('');
  }, [isOpen]);

  const save = () => {
    if (!content.trim()) return;
    dispatch({
      type: 'ADD_VAULT_ITEM',
      item: {
        id: `vault-${Date.now()}`,
        type,
        tag,
        content: content.trim(),
        daysAgo: 0,
      },
    });
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Add vault item" height="full">
      <div className="space-y-4 pb-4">
        <div className="grid grid-cols-2 gap-2">
          {(['quote', 'video', 'voice', 'image', 'note', 'win'] as VaultItemType[]).map((itemType) => {
            const meta = typeMeta[itemType];
            const Icon = meta.Icon;
            return (
              <button key={itemType} type="button" onClick={() => setType(itemType)} className={cn('rounded-[12px] border px-3 py-3 text-left text-[12px]', type === itemType ? 'border-[var(--primary)] bg-[var(--primary-bg)] text-[var(--primary)]' : 'border-[var(--border)] bg-[var(--s2)] text-[var(--t2)]')}>
                <div className="flex items-center gap-2">
                  <Icon size={14} strokeWidth={1.5} />
                  <span>{meta.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {tagOptions.map((item) => (
            <button key={item.label} type="button" onClick={() => setTag(item.label)} className={cn('rounded-full px-3 py-2 text-[12px]', tag === item.label ? 'bg-[var(--primary)] text-white' : 'bg-[var(--s3)] text-[var(--t2)]')}>
              {item.label}
            </button>
          ))}
        </div>

        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="What do you want to save?"
          rows={4}
          className="min-h-[120px] w-full rounded-[14px] border border-[var(--border-strong)] bg-[var(--s2)] p-4 text-[14px] text-[var(--t1)] outline-none placeholder:text-[var(--t3)]"
        />

        <button type="button" onClick={save} className="h-12 w-full rounded-[14px] bg-[var(--primary)] text-[14px] font-medium text-white">
          Save for my future self →
        </button>
      </div>
    </BottomSheet>
  );
}

export function Vault() {
  const { state, dispatch } = useApp();
  const [activeItem, setActiveItem] = React.useState<VaultItem | null>(null);
  const [deliveryIndex, setDeliveryIndex] = React.useState(0);
  const [showDelivery, setShowDelivery] = React.useState(false);
  const [showAdd, setShowAdd] = React.useState(false);
  const [closing, setClosing] = React.useState(false);

  const vaultItems = state.vaultItems.length >= 7 ? state.vaultItems : [...state.vaultItems, ...seedVaultItems.slice(0, 7 - state.vaultItems.length)];
  const currentItem = activeItem ?? vaultItems[deliveryIndex % vaultItems.length] ?? null;

  const openRandom = () => {
    if (!vaultItems.length) return;
    setDeliveryIndex(Math.floor(Math.random() * vaultItems.length));
    setActiveItem(null);
    setShowDelivery(true);
  };

  const openItem = (item: VaultItem) => {
    setActiveItem(item);
    setShowDelivery(true);
  };

  const closeDelivery = () => {
    setClosing(true);
    window.setTimeout(() => {
      setShowDelivery(false);
      setClosing(false);
      setActiveItem(null);
    }, 250);
  };

  const showAnother = () => {
    setDeliveryIndex((current) => (current + 1) % vaultItems.length);
    setActiveItem(null);
  };

  const helped = () => {
    closeDelivery();
  };

  return (
    <div
      className="space-y-6 pb-24"
      style={{ background: state.theme === 'dark' ? 'linear-gradient(180deg, #1A1560 0%, #08080F 100%)' : '#EEEAFF' }}
    >
      <div className="text-center">
        <div className="text-[24px] font-medium text-[var(--t1)]">Your armoury.</div>
        <div className="mt-2 text-[14px] italic text-[var(--t2)]">Everything your best self saved for your hardest days.</div>
      </div>

      <button type="button" onClick={openRandom} className="h-14 w-full rounded-[14px] bg-[var(--primary)] text-[16px] font-medium text-white">
        I need this right now →
      </button>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[16px] font-medium text-[var(--t1)]">Your saved fuel</div>
          <div className="text-[12px] text-[var(--t3)]">{vaultItems.length} items</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {vaultItems.map((item) => (
            <VaultCard key={item.id} item={item} onOpen={openItem} />
          ))}
        </div>
      </section>

      <section className="space-y-2 rounded-[14px] border border-[var(--border)] bg-[var(--s2)] px-4 py-4 text-[12px] text-[var(--t3)]">
        <div className="border-b border-[var(--border)] pb-2">Auto-trigger log</div>
        <div className="border-b border-[var(--border)] py-2">Saved fuel is resurfacing when you need it most.</div>
        <div className="py-2">Tap any card to deliver it again.</div>
      </section>

      <button type="button" onClick={() => setShowAdd(true)} className="fixed bottom-[82px] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-white md:bottom-6 md:right-6">
        <Plus size={24} strokeWidth={1.5} />
      </button>

      {showDelivery && currentItem ? (
        <div
          className={cn('fixed inset-0 z-[100] overflow-y-auto transition-all duration-300')}
          style={{ background: state.theme === 'dark' ? 'linear-gradient(180deg, #1A1560 0%, #08080F 100%)' : '#EEEAFF', opacity: closing ? 0 : 1, transform: closing ? 'translateY(20px)' : 'translateY(0)' }}
        >
          <div className="mx-auto flex min-h-screen w-full max-w-[720px] flex-col px-4 pb-8 pt-12 text-center">
            <div className="text-[12px] italic text-[var(--t3)]">{currentItem.daysAgo} days ago</div>
            <div className="flex flex-1 items-center justify-center">
              <div className="space-y-4">
                <div className="flex justify-center text-[var(--primary)] opacity-30">
                  <Quote size={64} strokeWidth={1.25} />
                </div>
                <div className="mx-auto max-w-[280px] text-[18px] font-normal italic leading-[1.7] text-[var(--t1)]">
                  {currentItem.content}
                </div>
              </div>
            </div>
            <div className="fixed bottom-8 left-4 right-4 mx-auto flex max-w-[720px] gap-3">
              <button type="button" onClick={helped} className="h-14 flex-1 rounded-[14px] bg-[var(--teal)] text-[16px] font-medium text-white">
                This helped
              </button>
              <button type="button" onClick={showAnother} className="h-14 flex-1 rounded-[14px] bg-[var(--s2)] text-[16px] font-medium text-[var(--t1)]">
                Show another
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AddVaultSheet isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
