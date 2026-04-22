import { Download, RotateCcw, Shield, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAppContext } from "../context/AppContext";

export const Settings = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const exportBackup = () => {
    const payload = JSON.stringify(state, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `lifeos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus("Backup exported");
  };

  const importBackup = async (file: File) => {
    const text = await file.text();
    const parsed = JSON.parse(text) as Partial<typeof state>;
    dispatch({ type: "REPLACE_APP_STATE", payload: { state: parsed } });
    setStatus("Backup imported");
  };

  const resetApp = () => {
    const confirmed = window.confirm("Reset all LifeOS data to the seeded state? This cannot be undone.");
    if (!confirmed) return;
    dispatch({ type: "RESET_APP_STATE" });
    setStatus("LifeOS data reset");
  };

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--text-3)]">Settings</p>
          <h1 className="text-page-title text-[var(--text-1)]">Backup and control</h1>
        </div>
        <button
          type="button"
          className="tap-scale rounded-[10px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[12px] text-[var(--primary)]"
          onClick={() => navigate("/dashboard")}
        >
          Done
        </button>
      </header>

      <section className="rounded-[16px] border border-[var(--border)] bg-[var(--s2)] p-4">
        <div className="flex items-center gap-2">
          <Shield size={16} strokeWidth={1.5} className="text-[var(--primary)]" />
          <p className="text-[14px] font-medium text-[var(--text-1)]">Theme</p>
        </div>
        <p className="mt-2 text-[13px] leading-[1.65] text-[var(--text-2)]">Toggle the visual mode for the entire app.</p>
        <div className="mt-4 inline-flex rounded-[14px] border border-[var(--border)] bg-[var(--s1)] p-2">
          <ThemeToggle />
        </div>
      </section>

      <section className="rounded-[16px] border border-[var(--border)] bg-[var(--s1)] p-4">
        <div className="flex items-center gap-2">
          <Download size={16} strokeWidth={1.5} className="text-[var(--primary)]" />
          <p className="text-[14px] font-medium text-[var(--text-1)]">Backup</p>
        </div>
        <p className="mt-2 text-[13px] leading-[1.65] text-[var(--text-2)]">Export your full LifeOS state or restore it from a JSON backup.</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" className="tap-scale rounded-[14px] bg-[var(--primary)] px-4 py-3 text-[13px] font-medium text-white" onClick={exportBackup}>
            Export backup
          </button>
          <button type="button" className="tap-scale rounded-[14px] border border-[var(--border)] bg-[var(--s2)] px-4 py-3 text-[13px] text-[var(--text-2)]" onClick={() => fileInputRef.current?.click()}>
            Import backup
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            try {
              await importBackup(file);
            } catch {
              setStatus("Import failed");
            } finally {
              event.target.value = "";
            }
          }}
        />
      </section>

      <section className="rounded-[16px] border border-[var(--border)] bg-[var(--s1)] p-4">
        <div className="flex items-center gap-2">
          <RotateCcw size={16} strokeWidth={1.5} className="text-[var(--amber)]" />
          <p className="text-[14px] font-medium text-[var(--text-1)]">Reset data</p>
        </div>
        <p className="mt-2 text-[13px] leading-[1.65] text-[var(--text-2)]">Restore seeded LifeOS content while keeping your current theme choice.</p>
        <button type="button" className="tap-scale mt-4 h-11 w-full rounded-[14px] bg-[var(--amber)] text-[14px] font-medium text-white" onClick={resetApp}>
          Reset app data
        </button>
      </section>

      {status ? <p className="text-[12px] text-[var(--text-3)]">{status}</p> : null}
    </div>
  );
};