import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { BottomSheet } from "./BottomSheet";
import { Note, Topic } from "../data/types";

interface NoteDetailSheetProps {
  open: boolean;
  note: Note | null;
  topics: Topic[];
  onClose: () => void;
  onAddToTopic: (topicId: string) => void;
}

export const NoteDetailSheet = ({ open, note, topics, onClose, onAddToTopic }: NoteDetailSheetProps) => {
  const [selecting, setSelecting] = useState(false);

  if (!note) return null;

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="flex h-[88vh] flex-col">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4">
          <button type="button" className="tap-scale text-[var(--text-2)]" onClick={onClose}>
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <p className="text-[14px] font-medium text-[var(--text-1)]">Note details</p>
          <div className="h-5 w-5" />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <p className="text-[18px] font-medium text-[var(--text-1)]">{note.title}</p>
          <p className="mt-2 text-[12px] text-[var(--text-3)]">{note.source}</p>
          <p className="mt-4 text-[14px] leading-[1.7] text-[var(--text-2)]">{note.body}</p>

          <div className="mt-5 space-y-2">
            <p className="text-[13px] font-medium text-[var(--text-1)]">Key points</p>
            {note.keyPoints.map((point) => (
              <div key={point} className="rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[13px] text-[var(--text-2)]">
                {point}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-[var(--text-1)]">Knowledge connections</p>
              <button
                type="button"
                className="tap-scale inline-flex items-center gap-1 rounded-[10px] bg-[var(--primary-muted)] px-3 py-2 text-[12px] text-[var(--primary)]"
                onClick={() => setSelecting((current) => !current)}
              >
                <Plus size={14} strokeWidth={1.5} />
                Add
              </button>
            </div>
            {selecting ? (
              <div className="mt-3 grid grid-cols-1 gap-2">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    className="tap-scale rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3 py-2 text-left text-[12px] text-[var(--text-2)]"
                    onClick={() => {
                      onAddToTopic(topic.id);
                      setSelecting(false);
                    }}
                  >
                    {topic.title}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-[12px] text-[var(--text-3)]">Link this note to a topic map for better review recall.</p>
            )}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
};
