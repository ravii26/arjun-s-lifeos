import { LucideIcon } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  note: string;
  Icon: LucideIcon;
}

export const PlaceholderPage = ({ title, note, Icon }: PlaceholderPageProps) => {
  return (
    <section className="flex min-h-[70vh] items-center justify-center">
      <div className="card-base max-w-[440px] text-center">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--s2)] text-[var(--text-2)]">
          <Icon size={24} strokeWidth={1.5} />
        </div>
        <h2 className="mt-4 text-page-title text-[var(--text-1)]">{title}</h2>
        <p className="mt-2 text-[14px] font-normal text-[var(--text-3)]">{note}</p>
      </div>
    </section>
  );
};
