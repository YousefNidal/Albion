import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuildPaperDoll } from "@/components/BuildPaperDoll";
import { BuildComps } from "@/components/BuildComps";
import { compsForBuild } from "@/lib/community-comps";
import {
  COMMUNITY_DETAILS_FETCHED_AT,
  communityBuildDetail,
  communityDetailSlugs,
} from "@/lib/community-details";
import { community } from "@/lib/data";
import { GEAR_SLOT_RU, communityModeRu, itemIcon, itemName, spellIcon, spellName } from "@/lib/labels";
import type { CommunityBuildDetail } from "@/lib/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return communityDetailSlugs.map((slug) => ({ slug }));
}

const dateFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function updatedDate(seconds: number | null): string | null {
  if (!seconds) return null;
  return dateFmt.format(new Date(seconds * 1000));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const b = communityBuildDetail(slug);
  if (!b) return { title: "Билд не найден" };
  const modes = b.modes.map(communityModeRu).join(", ");
  const desc =
    b.description.trim().slice(0, 160) ||
    `Билд «${b.title}» для режима ${modes || "Albion Online"}: экипировка, умения и пассивы от автора ${b.author ?? "сообщества"}.`;
  return { title: `${b.title} — билд Albion Online`, description: desc };
}

export default async function CommunityBuildPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const b = communityBuildDetail(slug);
  if (!b) notFound();

  const updated = updatedDate(b.updatedAt);
  const originalUrl = `https://www.albiononlinebuilds.com/ru/build/${b.slug}`;
  const comps = compsForBuild(b.slug);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href="/builds2"
        className="text-sm text-muted transition-colors hover:text-gold-hi"
      >
        ← Топ билдов
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {b.modes.map((m) => (
              <Link
                key={m}
                href={`/builds2/${m}`}
                className="rounded bg-ink-2 px-2 py-0.5 text-[11px] text-muted transition-colors hover:text-gold-hi"
              >
                {communityModeRu(m)}
              </Link>
            ))}
            {b.tag && (
              <span className="rounded bg-ink-2 px-2 py-0.5 text-[11px] text-muted">{b.tag}</span>
            )}
          </div>
          <h1 className="mt-2 font-display text-3xl leading-tight tracking-tight text-text sm:text-4xl">
            {b.title}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {b.author ?? "Аноним"}
            {b.authorRegion ? ` · ${b.authorRegion}` : ""}
            {updated ? ` · обновлён ${updated}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {b.tier && (
            <span
              className="num rounded border border-gold/60 bg-gold/10 px-2.5 py-1 text-sm font-bold text-gold-hi"
              title={b.tierList ? `Тир-лист: ${b.tierList}` : "Тир-лист"}
            >
              ТИР {b.tier}
            </span>
          )}
          <span
            className="num flex items-center gap-1 rounded border border-line bg-panel px-2.5 py-1 text-sm text-gold"
            title="Голосов за билд"
          >
            <span aria-hidden className="text-[11px]">
              ▲
            </span>
            {b.upvotes}
          </span>
        </div>
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <section className="rounded-lg border border-line bg-panel p-4">
            <h2 className="mb-4 font-display text-lg text-text">Экипировка</h2>
            <BuildPaperDoll build={b} />
          </section>

          <SkillSlots build={b} />
        </div>

        <div className="space-y-4">
          {b.description.trim() && (
            <section className="rounded-lg border border-line bg-panel p-4">
              <h2 className="font-display text-lg text-text">Описание от автора</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">
                {b.description}
              </p>
            </section>
          )}

          <section className="rounded-lg border border-line bg-panel p-4 text-sm">
            <h2 className="font-display text-lg text-text">О билде</h2>
            <dl className="mt-2 space-y-1.5 text-muted">
              <div className="flex justify-between gap-3">
                <dt>Режим</dt>
                <dd className="text-right text-text">
                  {b.modes.map(communityModeRu).join(", ") || "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Автор</dt>
                <dd className="text-right text-text">{b.author ?? "Аноним"}</dd>
              </div>
              {b.authorRegion && (
                <div className="flex justify-between gap-3">
                  <dt>Регион</dt>
                  <dd className="text-right text-text">{b.authorRegion}</dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt>Голоса</dt>
                <dd className="num text-right text-gold">{b.upvotes}</dd>
              </div>
              {updated && (
                <div className="flex justify-between gap-3">
                  <dt>Обновлён</dt>
                  <dd className="text-right text-text">{updated}</dd>
                </div>
              )}
            </dl>
            <a
              href={originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block rounded-lg border border-line bg-ink-2 px-3 py-2 text-center text-sm text-text transition-colors hover:border-gold/50 hover:text-gold-hi"
            >
              Открыть оригинал ↗
            </a>
            <p className="mt-3 text-[11px] leading-relaxed text-muted/70">
              Снимок сайта albiononlinebuilds.com от{" "}
              {dateFmt.format(
                COMMUNITY_DETAILS_FETCHED_AT ?? new Date(community.fetchedAt)
              )}
              . Тир, голоса и описание принадлежат автору и сайту-источнику.
            </p>
          </section>
        </div>
      </div>

      <BuildComps buildSlug={b.slug} comps={comps} />
    </div>
  );
}

function SkillSlots({ build }: { build: CommunityBuildDetail }) {
  const slots = build.items
    .map((_, i) => i)
    .filter((i) => (build.spells[i]?.length ?? 0) > 0 || build.passives[i]);
  if (slots.length === 0) return null;

  return (
    <section className="rounded-lg border border-line bg-panel">
      <h2 className="border-b border-line px-4 py-3 font-display text-lg text-text">
        Умения и пассивы
      </h2>
      <ul className="divide-y divide-line/60">
        {slots.map((i) => {
          const id = build.items[i];
          const spells = Array.from(new Set(build.spells[i] ?? []));
          const passive = build.passives[i] ?? null;
          return (
            <li key={i} className="flex items-start gap-3 px-4 py-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded border border-line bg-panel-2">
                {id ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={itemIcon(id)}
                    alt=""
                    width={40}
                    height={40}
                    loading="lazy"
                    className="h-10 w-10"
                  />
                ) : (
                  <span className="text-[10px] text-muted/50">—</span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-[11px] uppercase tracking-wide text-muted">
                    {GEAR_SLOT_RU[i]}
                  </span>
                  <span className="text-sm text-text">{id ? itemName(id) : "—"}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                  {spells.map((s) => (
                    <span key={s} className="flex items-center gap-2" title={spellName(s)}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={spellIcon(s)}
                        alt=""
                        width={32}
                        height={32}
                        loading="lazy"
                        className="h-8 w-8 rounded border border-line/60 bg-ink-2"
                      />
                      <span className="text-sm text-muted">{spellName(s)}</span>
                    </span>
                  ))}
                  {passive && (
                    <span className="flex items-center gap-2" title={`Пассив: ${spellName(passive)}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={spellIcon(passive)}
                        alt=""
                        width={32}
                        height={32}
                        loading="lazy"
                        className="h-8 w-8 rounded border border-gold/40 bg-ink-2"
                      />
                      <span className="text-sm text-muted">{spellName(passive)}</span>
                      <span className="rounded bg-ink-2 px-1.5 py-0.5 text-[10px] text-muted/80">
                        пассив
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
