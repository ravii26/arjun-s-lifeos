import { Sparkles, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { convertToAction } from "../services/actionConverter";
import { useAppContext } from "../context/AppContext";
import { BottomSheet } from "./BottomSheet";

const toAreaName = (areaId: string) =>
  ({
    career: "Career",
    health: "Health",
    mind: "Mind",
    finance: "Finance",
    relationships: "Relationships",
    creative: "Creative",
  }[areaId] ?? "Mind");

export const ActionConverterFAB = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useAppContext();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{ output: string; areaId: string; priority: "P1" | "P2" | "P3"; source: string } | null>(null);

  const shouldHide = useMemo(() => {
    const path = location.pathname;
    return path.startsWith("/focus") || path.startsWith("/review") || path.startsWith("/statistics");
  }, [location.pathname]);

  if (shouldHide) return null;

  const convert = async () => {
    setLoading(true);
    const result = await convertToAction(text);
    setPreview({
      output: result.output,
      areaId: result.area,
      priority: result.priority,
      source: result.source,
    });
    setLoading(false);
  };

  const saveAsTask = () => {
    if (!preview) return;
    const taskId = `t-${Date.now()}`;
    dispatch({
      type: "ADD_TASK",
      payload: {
        task: {
          id: taskId,
          title: preview.output,
          areaId: preview.areaId,
          priority: preview.priority,
          done: false,
          estimateMin: 25,
        },
      },
    });

    dispatch({
      type: "ADD_ACTION_HISTORY",
      payload: {
        item: {
          id: `ac-${Date.now()}`,
          input: text,
          output: preview.output,
          areaId: preview.areaId,
          priority: preview.priority,
          createdAt: "Just now",
        },
      },
    });

    setOpen(false);
    setText("");
    setPreview(null);
    navigate("/focus");
  };

  return (
    <>
      <button
        type="button"
        aria-label="Action converter"
        onClick={() => setOpen(true)}
        className="tap-scale fixed bottom-[calc(84px+env(safe-area-inset-bottom))] right-4 z-[95] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-white md:bottom-8 md:right-8"
      >
        <Plus size={22} strokeWidth={1.8} />
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <div className="px-4 pb-6 pt-8">
          <div className="flex items-center justify-between">
            <p className="text-[16px] font-medium text-[var(--text-1)]">Action converter</p>
            <span className="rounded-full bg-[var(--s1)] px-2 py-1 text-[11px] text-[var(--text-3)]">Global</span>
          </div>

          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste your thought, idea, or vague intention..."
            className="mt-4 min-h-28 w-full rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-3 text-[14px] text-[var(--text-1)] outline-none"
          />

          <button
            type="button"
            onClick={convert}
            disabled={loading || text.trim().length < 6}
            className="tap-scale mt-3 w-full rounded-[12px] bg-[var(--primary)] px-4 py-3 text-[13px] font-medium text-white disabled:opacity-60"
          >
            {loading ? "Converting..." : "Convert to action"}
          </button>

          {preview ? (
            <div className="mt-4 rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-4">
              <div className="flex items-center gap-2 text-[12px] text-[var(--primary)]">
                <Sparkles size={14} strokeWidth={1.5} />
                <span>{preview.source === "api" ? "AI suggestion" : "Smart fallback"}</span>
              </div>
              <p className="mt-2 text-[14px] text-[var(--text-1)]">{preview.output}</p>
              <p className="mt-2 text-[12px] text-[var(--text-3)]">
                {toAreaName(preview.areaId)} · {preview.priority}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="tap-scale rounded-[10px] bg-[var(--primary)] px-3 py-2 text-[12px] font-medium text-white"
                  onClick={saveAsTask}
                >
                  Save as task
                </button>
                <button
                  type="button"
                  className="tap-scale rounded-[10px] border border-[var(--border)] bg-[var(--s2)] px-3 py-2 text-[12px] text-[var(--text-2)]"
                  onClick={() => {
                    setPreview(null);
                    setText("");
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          ) : null}

          {state.actionHistory.length > 0 ? (
            <div className="mt-5 space-y-2">
              <p className="text-[12px] text-[var(--text-3)]">Recent conversions</p>
              {state.actionHistory.slice(0, 3).map((item) => (
                <div key={item.id} className="rounded-[10px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2">
                  <p className="text-[12px] text-[var(--text-2)]">{item.output}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </BottomSheet>
    </>
  );
};
