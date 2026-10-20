"use client";

import Link from "next/link";
import { useState } from "react";
import { communityModeRu, itemIcon, itemName } from "@/lib/labels";
import type { CommunityBuild } from "@/lib/types";

const PAGE = 60;

/** All 10 slots, bag and mount included. */
const SLOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export function CommunityList({ builds }: { builds: CommunityBuild[] }) {
  const [limit, setLimit] = useState(PAGE);
  const shown = builds.slice(0, limit);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((b) => (
          <CommunityBuildCard key={b.slug} build={b} />
        ))}
      </div>
      {builds.length > limit && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setLimit((n) => n + PAGE)}
            className="rounded-lg border border-line bg-panel px-5 py-2.5 text-sm text-text transition-colors hover:border-gold/50 hover:text-gold-hi"
          >
            Показать ещё {Math.min(PAGE, builds.length - limit)} · осталось {builds.length - limit}
          </button>
        </div>
      )}
    </div>
  );
}

function CommunityBuildCard({ build: b }: { build: CommunityBuild }) {
  return (
    <Link
      href={`/builds2/build/${b.slug}`}
      className="group flex flex-col rounded-lg border border-line bg-panel p-4 transition-colors hover:border-gold/60"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          {b.modes.map((m) => (
            <span
              key={m}
              className="rounded bg-ink-2 px-1.5 py-0.5 text-[10px] leading-tight text-muted"
            >
              {communityModeRu(m)}
            </span>
          ))}
        </div>
        {b.tier && (
          <span
            className="num shrink-0 rounded border border-gold/60 bg-gold/10 px-1.5 py-0.5 text-[10px] font-bold text-gold-hi"
            title={b.tierList ? `Тир-лист: ${b.tierList}` : "Тир-лист"}
          >
            ТИР {b.tier}
          </span>
        )}
      </div>

      <h3
        className="mt-2 truncate font-display text-base leading-snug text-text group-hover:text-gold-hi"
        title={b.title}
      >
        {b.title}
      </h3>

      <div className="mt-3 grid grid-cols-5 gap-1.5 rounded-lg border border-line/60 bg-ink/50 p-2">
        {SLOTS.map((i) => {
          const id = b.items[i] ?? null;
          return (
            <div
              key={i}
              className={`grid aspect-square place-items-center rounded ${
                id ? "bg-ink-2" : "border border-dashed border-line/60 bg-ink-2/30"
              }`}
              title={id ? itemName(id) : undefined}
            >
              {id && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={itemIcon(id)}
                  alt={itemName(id)}
                  width={44}
                  height={44}
                  loading="lazy"
                  className="h-11 w-11"
                  onError={(e) => {
                    e.currentTarget.style.visibility = "hidden";
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs">
        <span className="truncate text-muted">
          {b.author ?? "Аноним"}
          {b.authorRegion ? ` · ${b.authorRegion}` : ""}
        </span>
        <span className="num ml-auto flex shrink-0 items-center gap-1 text-gold" title="Голосов">
          <span aria-hidden className="text-[10px]">
            ▲
          </span>
          {b.upvotes}
        </span>
      </div>
      <span className="mt-1 truncate text-[10px] text-muted/60 group-hover:text-gold/70">
        умения, пассивы и описание →
      </span>
    </Link>
  );
}
