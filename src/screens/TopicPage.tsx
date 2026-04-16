import { ArrowLeft, Link2, NotebookPen, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BottomSheet } from "../components/BottomSheet";
import { useAppContext } from "../context/AppContext";

export const TopicPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const topic = state.topics.find((item) => item.id === id);
  const links = state.topicLinks.filter((item) => item.topicId === id);
  const relatedNotes = state.learnNotes.filter((note) =>
    links.some((link) => link.label.toLowerCase().includes(note.title.slice(0, 8).toLowerCase())),
  );
  const relatedNotebook = state.notebookEntries.filter((entry) => entry.topicIds.includes(id ?? ""));

  const chartPath = useMemo(() => {
    const points = links.slice(0, 6).map((link, index) => {
      const x = 30 + index * 48;
      const y = 160 - link.strength;
      return `${x},${y}`;
    });
    return points.join(" ");
  }, [links]);

  if (!topic) {
    return (
      <section className="card-base">
        <p className="text-[14px] text-[var(--text-2)]">Topic not found.</p>
        <button type="button" onClick={() => navigate("/learn?tab=notes")} className="mt-3 text-[13px] text-[var(--primary)]">
          Back to Learn
        </button>
      </section>
    );
  }

  const selectedEntry = state.notebookEntries.find((entry) => entry.id === selectedEntryId) ?? null;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <button
          type="button"
          className="tap-scale inline-flex items-center gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[13px] text-[var(--text-2)]"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back
        </button>
        <span className="rounded-full bg-[var(--primary-muted)] px-3 py-1 text-[12px] text-[var(--primary)]">Topic</span>
      </header>

      <section className="card-base">
        <p className="text-page-title text-[var(--text-1)]">{topic.title}</p>
        <p className="mt-2 text-[13px] leading-[1.7] text-[var(--text-2)]">{topic.summary}</p>
      </section>

      <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
        <p className="text-[14px] font-medium text-[var(--text-1)]">Concept links</p>
        <svg width="100%" height="180" viewBox="0 0 320 180" className="mt-3">
          <line x1="20" y1="160" x2="300" y2="160" stroke="var(--border)" />
          <line x1="20" y1="20" x2="20" y2="160" stroke="var(--border)" />
          {chartPath ? <polyline points={chartPath} fill="none" stroke="var(--primary)" strokeWidth="2.5" /> : null}
          {links.slice(0, 6).map((link, index) => (
            <g key={link.id}>
              <circle cx={30 + index * 48} cy={160 - link.strength} r="4" fill="var(--primary)" />
              <text x={30 + index * 48} y={172} textAnchor="middle" style={{ fontSize: 10, fill: "var(--text-3)" }}>
                {index + 1}
              </text>
            </g>
          ))}
        </svg>
        <div className="mt-3 space-y-2">
          {links.map((link) => (
            <div key={link.id} className="flex items-center justify-between rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3 py-2">
              <div className="flex items-center gap-2 text-[13px] text-[var(--text-2)]">
                <Link2 size={14} strokeWidth={1.5} />
                {link.label}
              </div>
              <span className="text-[11px] text-[var(--text-3)]">{link.strength}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-section text-[var(--text-1)]">Related notes</p>
          <button
            type="button"
            className="tap-scale rounded-[10px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[12px] text-[var(--primary)]"
            onClick={() => navigate("/learn?tab=notes")}
          >
            Open Learn notes
          </button>
        </div>
        {relatedNotes.length === 0 ? <p className="text-[12px] text-[var(--text-3)]">No linked notes yet.</p> : null}
        {relatedNotes.slice(0, 4).map((note) => (
          <div key={note.id} className="rounded-[12px] border border-[var(--border)] bg-[var(--s1)] p-3">
            <p className="text-[13px] font-medium text-[var(--text-1)]">{note.title}</p>
            <p className="mt-1 text-[12px] text-[var(--text-3)]">{note.preview}</p>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <p className="text-section text-[var(--text-1)]">Notebook entries</p>
        {relatedNotebook.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className="tap-scale w-full rounded-[12px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3 text-left"
            onClick={() => setSelectedEntryId(entry.id)}
          >
            <p className="text-[13px] font-medium text-[var(--text-1)]">{entry.title}</p>
            <p className="mt-1 text-[12px] text-[var(--text-3)]">{entry.createdAt}</p>
          </button>
        ))}
      </section>

      <section className="rounded-[14px] border border-[var(--border)] bg-[var(--s2)] p-4" style={{ borderLeft: "3px solid var(--primary)" }}>
        <div className="flex items-center gap-2 text-[12px] text-[var(--primary)]">
          <Sparkles size={14} strokeWidth={1.5} />
          AI observation
        </div>
        <p className="mt-2 text-[13px] italic text-[var(--text-2)]">Your strongest insights stick when notebook notes are connected to one explicit topic map.</p>
      </section>

      <BottomSheet open={Boolean(selectedEntry)} onClose={() => setSelectedEntryId(null)}>
        {selectedEntry ? (
          <div className="px-4 pb-6 pt-8">
            <p className="text-[16px] font-medium text-[var(--text-1)]">{selectedEntry.title}</p>
            <p className="mt-3 text-[13px] leading-[1.7] text-[var(--text-2)]">{selectedEntry.body}</p>
            <button
              type="button"
              disabled={Boolean(selectedEntry.convertedNoteId)}
              className="tap-scale mt-4 inline-flex items-center gap-2 rounded-[12px] bg-[var(--primary)] px-4 py-3 text-[13px] font-medium text-white disabled:opacity-60"
              onClick={() => {
                dispatch({ type: "CONVERT_NOTEBOOK_TO_NOTE", payload: { entryId: selectedEntry.id } });
                setSelectedEntryId(null);
                navigate("/learn?tab=notes");
              }}
            >
              <NotebookPen size={16} strokeWidth={1.5} />
              {selectedEntry.convertedNoteId ? "Already converted" : "Convert to Learn note"}
            </button>
          </div>
        ) : null}
      </BottomSheet>
    </div>
  );
};
