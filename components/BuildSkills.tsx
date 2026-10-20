import { spellIcon, spellRu } from "@/lib/labels";

export interface SkillGroup {
  label: string;
  skills: string[];
}

export function BuildSkills({ groups }: { groups: SkillGroup[] }) {
  const visible = groups.filter((g) => g.skills && g.skills.length > 0);
  if (visible.length === 0) return null;
  return (
    <section>
      <h2 className="font-display text-xl text-gold-hi">Способности</h2>
      <div className="mt-4 space-y-3">
        {visible.map((g) => (
          <div key={g.label} className="flex flex-wrap items-center gap-2">
            <span className="w-24 shrink-0 text-xs uppercase tracking-wide text-muted">
              {g.label}
            </span>
            {g.skills.filter((s) => s).map((s) => {
              const ru = spellRu(s);
              return (
                <span
                  key={s}
                  title={ru ?? s}
                  className="flex items-center gap-2 rounded border border-line bg-panel px-2 py-1 text-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={spellIcon(s)} alt="" width={24} height={24} className="h-6 w-6" loading="lazy" />
                  <span className={ru ? "text-text" : "text-muted"}>{ru ?? s}</span>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
