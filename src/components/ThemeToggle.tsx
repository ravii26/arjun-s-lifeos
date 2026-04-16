import { Moon, Sun } from "lucide-react";
import { useAppContext } from "../context/AppContext";

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle = ({ className = "" }: ThemeToggleProps) => {
  const { state, dispatch } = useAppContext();
  const isDark = state.theme === "dark";

  return (
    <button
      type="button"
      onClick={() => dispatch({ type: "TOGGLE_THEME" })}
      className={`tap-scale hover-surface inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--s2)] text-[var(--text-2)] ${className}`}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
    </button>
  );
};
