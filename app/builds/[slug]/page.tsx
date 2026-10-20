import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuildSet, type Slot } from "@/components/BuildSet";
import { BuildSkills, type SkillGroup } from "@/components/BuildSkills";
import {
  TRAIT_RU,
  buildCatRu,
  buildDesc,
  buildTitle,
  buildBySlug,
  builds,
  itemIcon,
} from "@/lib/data";

export function generateStaticParams() {
  return builds.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const build = buildBySlug.get(slug);
  if (!build) return { title: "Билд не найден" };
  return {
    title: buildTitle(build),
    description: buildDesc(build) ?? `Билд Albion Online: ${buildTitle(build)}`,
  };
}

const SLOT_LABELS: [keyof import("@/lib/types").Build, string][] = [
  ["weapon_id", "Оружие"],
  ["helmet_id", "Шлем"],
  ["chest_id", "Грудь"],
  ["boots_id", "Ботинки"],
  ["cape_id", "Плащ"],
  ["offhand_id", "Офхенд"],
  ["food_id", "Еда"],
  ["potion_id", "Зелье"],
];

const ALT_FOR: Record<string, keyof import("@/lib/types").Build> = {
  helmet_id: "helmet_id_alt",
  chest_id: "chest_id_alt",
  boots_id: "boots_id_alt",
  cape_id: "cape_id_alt",
  offhand_id: "offhand_id_alt",
  food_id: "food_alt",
  potion_id: "potion_alt",
};

function firstId(v: unknown): string | null {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) {
    const s = v.find((x) => typeof x === "string" && x.length > 0);
    return typeof s === "string" ? s : null;
  }
  return null;
}

export default async function BuildDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const build = buildBySlug.get(slug);
  if (!build) notFound();

  const slots: Slot[] = [];
  for (const [key, label] of SLOT_LABELS) {
    const id = build[key] as string | null;
    if (!id) continue;
    const altKey = ALT_FOR[key as string];
    slots.push({ label, id, altId: altKey ? firstId(build[altKey]) : null });
  }

  const skillGroups: SkillGroup[] = [
    { label: "Оружие", skills: build.weapon_skills ?? [] },
    { label: "Шлем", skills: build.helmet_skills ?? [] },
    { label: "Грудь", skills: build.chest_skills ?? [] },
    { label: "Ботинки", skills: build.boots_skills ?? [] },
  ];

  const desc = build.description_ru || build.description;
  const isTranslated = Boolean(build.description_ru && build.description);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/builds" className="text-xs text-muted hover:text-gold">
        ← Все билды
      </Link>

      <header className="mt-4 flex items-start gap-5">
        {build.weapon_id && (
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-lg border border-line bg-panel">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={itemIcon(build.weapon_id)}
              alt=""
              width={64}
              height={64}
              className="h-16 w-16"
            />
          </div>
        )}
        <div className="min-w-0">
          <span className="inline-block rounded border border-gold/50 bg-gold/10 px-2 py-0.5 text-xs text-gold-hi">
            {buildCatRu(build.category)}
          </span>
          <h1 className="mt-2 font-display text-3xl leading-tight text-text">
            {buildTitle(build)}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {build.title}
            {build.author ? ` · автор: ${build.author}` : ""}
            <span className="num ml-3 text-gold/90">▲ {build.upvote_count ?? 0}</span>
          </p>
        </div>
      </header>

      <div className="mt-8 space-y-10">
        {desc && (
          <section>
            <h2 className="font-display text-xl text-gold-hi">Описание</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-text/90">{desc}</p>
            {isTranslated && (
              <p className="mt-2 text-xs text-muted">
                Перевод с английского; оригинальное описание — с сайта albiononlinegrind.com.
              </p>
            )}
            {!isTranslated && build.description && !build.description_ru && (
              <p className="mt-2 text-xs text-muted">
                Описание доступно только на английском.{" "}
                {build.description.length > 400
                  ? "Перевод появится позже."
                  : `Оригинал: ${build.description}`}
              </p>
            )}
          </section>
        )}

        <BuildSet slots={slots} />
        <BuildSkills groups={skillGroups} />

        {(build.recommended_traits?.length ?? 0) > 0 && (
          <section>
            <h2 className="font-display text-xl text-gold-hi">Рекомендуемые черты</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {build.recommended_traits!.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-line bg-panel px-3 py-1 text-sm text-text"
                >
                  {TRAIT_RU[t] ?? t}
                </span>
              ))}
            </div>
          </section>
        )}

        {(build.youtube_ids?.length ?? 0) > 0 && (
          <section>
            <h2 className="font-display text-xl text-gold-hi">Видео</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              {build.youtube_ids!.map((id) => (
                <a
                  key={id}
                  href={`https://www.youtube.com/watch?v=${id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-line bg-panel px-4 py-2 text-sm text-text transition-colors hover:border-gold/60 hover:text-gold-hi"
                >
                  Смотреть на YouTube →
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
