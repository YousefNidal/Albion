"use client";

import Link from "next/link";
import { useState } from "react";
import { communityModeRu, communityModes, itemIcon, itemName, prettyItemId } from "@/lib/labels";
import type { CommunityCompView } from "@/lib/types";

const knownModes = new Set(communityModes.map((m) => m.slug));

export function BuildComps({
  buildSlug,
  comps,
}: {
  buildSlug: string;
  comps: CommunityCompView[];
}) {
  const [active, setActive] = useState(0);
  if (comps.length === 0) return null;
  const comp = comps[Math.min(active, comps.length - 1)];

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl tracking-tight text-text">Состав команды</h2>
        <p className="text-xs text-muted">
          компов для этого билда: <span className="num text-gold">{comps.length}</span>
        </p>
      </div>

      {comps.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-b border-line pb-3 text-sm">
          {comps.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActive(i)}
              className={
                i === active ? "text-gold-hi" : "text-muted transition-colors hover:text-text"
              }
            >
              {c.name}
              <span className="num ml-1 text-xs text-muted/70">{c.members.length}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 rounded-lg border border-line bg-panel">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-lg text-text">{comp.name}</h3>
              {comp.tier && (
                <span
                  className="num rounded border border-gold/60 bg-gold/10 px-1.5 py-0.5 text-[10px] font-bold text-gold-hi"
                  title={comp.tierList ? `Тир-лист: ${comp.tierList}` : "Тир-лист"}
                >
                  ТИР {comp.tier}
                </span>
              )}
              <span className="num flex items-center gap-1 text-xs text-gold" title="Голоса за комп">
                <span aria-hidden className="text-[10px]">
                  ▲
                </span>
                {comp.upvotes}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
              {comp.modes.map((m) =>
                knownModes.has(m) ? (
                  <Link
                    key={m}
                    href={`/builds2/${m}`}
                    className="rounded bg-ink-2 px-1.5 py-0.5 transition-colors hover:text-gold-hi"
                  >
                    {communityModeRu(m)}
                  </Link>
                ) : (
                  <span key={m} className="rounded bg-ink-2 px-1.5 py-0.5">
                    {communityModeRu(m)}
                  </span>
                )
              )}
              {comp.authorName && <span>· автор {comp.authorName}</span>}
              <span>
                · участников <span className="num">{comp.members.length}</span>
              </span>
            </div>
          </div>
          <a
            href={`https://www.albiononlinebuilds.com/ru/comp/${comp.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg border border-line bg-ink-2 px-3 py-1.5 text-xs text-text transition-colors hover:border-gold/50 hover:text-gold-hi"
          >
            Открыть комп ↗
          </a>
        </div>

        {comp.description && (
          <p className="whitespace-pre-line border-b border-line/60 px-4 py-3 text-sm leading-relaxed text-muted">
            {comp.description}
          </p>
        )}

        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {comp.members.map((m, i) => (
            <MemberCard key={`${m.id}-${m.slug}-${i}`} member={m} isCurrent={m.slug === buildSlug} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MemberCard({
  member,
  isCurrent,
}: {
  member: CommunityCompView["members"][number];
  isCurrent: boolean;
}) {
  const label = member.tag?.trim() || member.title || prettyItemId(member.slug);
  const className = `group flex flex-col rounded-lg border bg-ink-2/50 p-2.5 transition-colors ${
    isCurrent ? "border-gold/60 hover:border-gold" : "border-line/70 hover:border-gold/70"
  }`;

  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-semibold uppercase tracking-wide text-text" title={label}>
          {label}
        </span>
        {isCurrent ? (
          <span className="shrink-0 rounded border border-gold/60 bg-gold/10 px-1.5 py-0.5 text-[10px] text-gold-hi">
            этот билд
          </span>
        ) : (
          member.upvotes > 0 && (
            <span className="num shrink-0 text-[10px] text-gold" title="Голоса за билд">
              ▲{member.upvotes}
            </span>
          )
        )}
      </div>

      <div className="mt-2 grid grid-cols-5 gap-1">
        {member.items.map((id, i) => (
          <span
            key={i}
            className={`grid aspect-square place-items-center rounded ${
              id ? "bg-panel-2" : "border border-dashed border-line/50"
            }`}
            title={id ? itemName(id) : undefined}
          >
            {id && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={itemIcon(id)}
                alt=""
                width={32}
                height={32}
                loading="lazy"
                className="h-8 w-8"
              />
            )}
          </span>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="truncate text-[11px] text-muted" title={member.title ?? member.slug}>
          {member.title ?? "билд участника"}
        </span>
        <span
          className={`shrink-0 text-[11px] transition-colors ${
            member.internal ? "text-gold group-hover:text-gold-hi" : "text-muted group-hover:text-gold-hi"
          }`}
        >
          {member.internal ? "открыть →" : "на сайте ↗"}
        </span>
      </div>
    </>
  );

  return member.internal ? (
    <Link href={`/builds2/build/${member.slug}`} className={className} title={member.title ?? member.slug}>
      {content}
    </Link>
  ) : (
    <a
      href={`https://www.albiononlinebuilds.com/ru/build/${member.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      title={member.title ?? member.slug}
    >
      {content}
    </a>
  );
}
