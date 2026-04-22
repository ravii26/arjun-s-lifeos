import { useMemo, useRef, useState } from "react";
import { Download, Upload, Plus, Sparkles, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { DomainId, Skill } from "../data/types";

const domainOptions: Array<{ id: DomainId; label: string; color: string }> = [
  { id: "career", label: "Career", color: "#7C6FF7" },
  { id: "finance", label: "Finance", color: "#C4840A" },
  { id: "mind", label: "Mind", color: "#4A90D9" },
  { id: "health", label: "Health", color: "#1DB37E" },
  { id: "relationships", label: "Relationships", color: "#E0607E" },
  { id: "creative", label: "Creative", color: "#E8850C" },
];

const levelLabel = (value: number): string => {
  if (value <= 3) return "Getting started";
  if (value <= 6) return "Building";
  if (value <= 8) return "Strong";
  return "Advanced";
};

export const Skills = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState("");
  const [domainId, setDomainId] = useState<DomainId>("career");
  const [whyItMatters, setWhyItMatters] = useState("");
  const [backupMessage, setBackupMessage] = useState<string | null>(null);

  const conceptCountBySkillId = useMemo(
    () => new Map(state.skills.map((skill) => [skill.id, state.concepts.filter((concept) => concept.skillId === skill.id).length])),
    [state.concepts, state.skills],
  );

  const focusSkills = state.skills.filter((skill) => skill.weeklyFocus);

  const addSkill = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const now = new Date().toISOString();
    const skill: Skill = {
      id: `sk-${Date.now()}`,
      name: trimmed,
      domainId,
      whyItMatters: whyItMatters.trim() || `This skill helps you grow in ${domainId}.`,
      currentLevel: 1,
      targetLevel: 7,
      weeklyFocus: false,
      conceptIds: [],
      createdAt: now,
      updatedAt: now,
    };

    dispatch({ type: "ADD_SKILL", payload: { skill } });
    setName("");
    setWhyItMatters("");
  };

  const exportBackup = () => {
    const payload = JSON.stringify(state, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `lifeos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setBackupMessage("Backup exported");
  };

  const importBackup = async (file: File) => {
    const text = await file.text();
    const parsed = JSON.parse(text) as typeof state;
    dispatch({ type: "REPLACE_APP_STATE", payload: { state: parsed } });
    setBackupMessage("Backup imported");
  };

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] text-[var(--text-3)]">Skills</p>
          <h1 className="text-page-title text-[var(--text-1)]">Learning skills</h1>
        </div>
        <button
          type="button"
          className="tap-scale rounded-[10px] border border-[var(--border)] bg-[var(--s1)] px-3 py-2 text-[12px] text-[var(--primary)]"
          onClick={() => navigate("/knowledge")}
        >
          Open knowledge
        </button>
      </header>

      <section className="rounded-[16px] border border-[var(--border)] bg-[var(--s2)] p-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} strokeWidth={1.5} className="text-[var(--primary)]" />
          <p className="text-[13px] font-medium text-[var(--text-1)]">Use skills as the top-level structure.</p>
        </div>
        <p className="mt-2 text-[13px] leading-[1.65] text-[var(--text-2)]">
          A skill is the capability you want to improve. Concepts feed the skill, practice logs prove it is becoming real, and weekly focus tells LifeOS what matters now.
        </p>
      </section>

      <section className="rounded-[16px] border border-[var(--border)] bg-[var(--s1)] p-4">
        <div className="flex items-center gap-2 text-[var(--text-1)]">
          <Download size={16} strokeWidth={1.5} className="text-[var(--primary)]" />
          <p className="text-[14px] font-medium">Backup</p>
        </div>
        <p className="mt-2 text-[13px] leading-[1.65] text-[var(--text-2)]">Export your full LifeOS state or restore it from a JSON file. This keeps your personal system portable.</p>
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
              setBackupMessage("Import failed");
            } finally {
              event.target.value = "";
            }
          }}
        />
        {backupMessage ? <p className="mt-3 text-[12px] text-[var(--text-3)]">{backupMessage}</p> : null}
      </section>

      <section className="grid grid-cols-3 gap-3">
        <article className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-3)]">Skills</p>
          <p className="mt-1 text-[22px] font-medium text-[var(--text-1)]">{state.skills.length}</p>
        </article>
        <article className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-3)]">Weekly focus</p>
          <p className="mt-1 text-[22px] font-medium text-[var(--text-1)]">{focusSkills.length}</p>
        </article>
        <article className="rounded-[14px] border border-[var(--border)] bg-[var(--s1)] px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-3)]">Practice logs</p>
          <p className="mt-1 text-[22px] font-medium text-[var(--text-1)]">{state.practiceLogs.length}</p>
        </article>
      </section>

      <section className="rounded-[16px] border border-[var(--border)] bg-[var(--s1)] p-4">
        <div className="flex items-center gap-2 text-[var(--text-1)]">
          <Target size={16} strokeWidth={1.5} className="text-[var(--primary)]" />
          <p className="text-[14px] font-medium">Create a skill</p>
        </div>
        <div className="mt-4 space-y-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Skill name"
            className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--s2)] px-4 py-3 text-[14px] text-[var(--text-1)] outline-none"
          />
          <textarea
            value={whyItMatters}
            onChange={(event) => setWhyItMatters(event.target.value)}
            placeholder="Why does this skill matter?"
            className="min-h-24 w-full rounded-[12px] border border-[var(--border)] bg-[var(--s2)] px-4 py-3 text-[14px] text-[var(--text-1)] outline-none"
          />
          <div className="flex flex-wrap gap-2">
            {domainOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setDomainId(option.id)}
                className={`tap-scale rounded-full px-3 py-2 text-[12px] ${domainId === option.id ? "bg-[var(--primary-muted)] text-[var(--primary)]" : "bg-[var(--s2)] text-[var(--text-3)]"}`}
                style={domainId === option.id ? { borderLeft: `3px solid ${option.color}` } : undefined}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button type="button" className="tap-scale h-11 w-full rounded-[14px] bg-[var(--primary)] text-[14px] font-medium text-white" onClick={addSkill}>
            Add skill
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-section text-[var(--text-1)]">Current skills</p>
          <span className="text-[12px] text-[var(--text-3)]">{state.skills.length} total</span>
        </div>
        {state.skills.map((skill) => {
          const conceptCount = conceptCountBySkillId.get(skill.id) ?? 0;
          const domain = domainOptions.find((entry) => entry.id === skill.domainId);
          return (
            <article key={skill.id} className="rounded-[16px] border border-[var(--border)] bg-[var(--s1)] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-3)]">
                    <span className="rounded-full bg-[var(--s3)] px-2 py-1">{skill.weeklyFocus ? "Weekly focus" : "Not focused"}</span>
                    <span className="rounded-full bg-[var(--primary-muted)] px-2 py-1 text-[var(--primary)]">{skill.domainId}</span>
                    <span className="rounded-full bg-[var(--s3)] px-2 py-1">{conceptCount} concepts</span>
                  </div>
                  <p className="mt-2 text-[15px] font-medium text-[var(--text-1)]">{skill.name}</p>
                  <p className="mt-2 text-[13px] text-[var(--text-2)]">{skill.whyItMatters}</p>
                </div>
                <button
                  type="button"
                  className={`tap-scale rounded-full px-3 py-2 text-[12px] ${skill.weeklyFocus ? "bg-[var(--teal)] text-white" : "bg-[var(--s2)] text-[var(--text-2)]"}`}
                  onClick={() => dispatch({ type: "TOGGLE_SKILL_WEEKLY_FOCUS", payload: { skillId: skill.id } })}
                >
                  {skill.weeklyFocus ? "Focused" : "Focus"}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <article className="rounded-[12px] bg-[var(--s2)] px-3 py-3">
                  <p className="text-[11px] text-[var(--text-3)]">Current level</p>
                  <p className="mt-1 text-[18px] font-medium text-[var(--text-1)]">{skill.currentLevel}/10</p>
                  <p className="text-[12px] text-[var(--text-3)]">{levelLabel(skill.currentLevel)}</p>
                </article>
                <article className="rounded-[12px] bg-[var(--s2)] px-3 py-3">
                  <p className="text-[11px] text-[var(--text-3)]">Target level</p>
                  <p className="mt-1 text-[18px] font-medium text-[var(--text-1)]">{skill.targetLevel}/10</p>
                  <p className="text-[12px] text-[var(--text-3)]">{domain?.label ?? skill.domainId}</p>
                </article>
              </div>

              <div className="mt-4 rounded-[12px] border border-[var(--border)] bg-[var(--s2)] p-3">
                <div className="flex items-center justify-between text-[12px] text-[var(--text-3)]">
                  <span>Concept coverage</span>
                  <span>{Math.min(100, conceptCount * 25)}%</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-[var(--border)]">
                  <div className="h-1.5 rounded-full bg-[var(--primary)]" style={{ width: `${Math.min(100, conceptCount * 25)}%` }} />
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};