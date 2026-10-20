"use client";

import { useMemo, useState } from "react";
import {
  AVALON_RESOURCE_ORDER,
  AVALON_RESOURCE_RU,
  AVALON_TIERS,
  avalonIcon,
  avalonMapImage,
} from "@/lib/labels";
import type { AvalonMap, AvalonResourceKey } from "@/lib/types";

const PER_PAGE = 24;
const SOURCE = "https://www.albiononlinebuilds.com";

export function AvalonMaps({ maps }: { maps: AvalonMap[] }) {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<string | null>(null);
  const [resources, setResources] = useState<Set<AvalonResourceKey>>(new Set());
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/-/g, " ");
    return maps.filter((m) => {
      const nameOk = !q || m.name.toLowerCase().replace(/-/g, " ").includes(q);
      const tierOk = !tier || m.tier === tier;
      const resOk =
        resources.size === 0 || [...resources].every((k) => m.resources[k] > 0);
      return nameOk && tierOk && resOk;
    });
  }, [maps, query, tier, resources]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const shown = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const pageNumbers: (number | "...")[] =
    pages <= 7
      ? Array.from({ length: pages }, (_, i) => i + 1)
      : current <= 4
        ? [1, 2, 3, 4, 5, "...", pages]
        : current >= pages - 3
          ? [1, "...", pages - 4, pages - 3, pages - 2, pages - 1, pages]
          : [1, "...", current - 1, current, current + 1, "...", pages];

  const toggleResource = (key: AvalonResourceKey) => {
    setResources((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setPage(1);
  };

  const hasFilters = Boolean(query || tier || resources.size);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Поиск по названию карты…"
          className="w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm text-text placeholder:text-muted/70 focus:border-gold/50 focus:outline-none sm:w-72"
        />

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setTier(null);
              setPage(1);
            }}
            className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
              tier === null
                ? "border-gold/60 bg-gold/10 text-gold-hi"
                : "border-line bg-panel text-muted hover:text-text"
            }`}
          >
            Все
          </button>
          {AVALON_TIERS.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTier(t === tier ? null : t);
                setPage(1);
              }}
              className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                tier === t
                  ? "border-gold/60 bg-gold/10 text-gold-hi"
                  : "border-line bg-panel text-muted hover:text-text"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {AVALON_RESOURCE_ORDER.map((key) => {
            const active = resources.has(key);
            return (
              <button
                key={key}
                onClick={() => toggleResource(key)}
                title={AVALON_RESOURCE_RU[key]}
                aria-pressed={active}
                className={`grid h-9 w-9 place-items-center rounded-lg border transition-colors ${
                  active
                    ? "border-gold/60 bg-gold/10"
                    : "border-line bg-panel hover:border-gold/40"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avalonIcon(key)}
                  alt={AVALON_RESOURCE_RU[key]}
                  width={22}
                  height={22}
                  className="h-[22px] w-[22px]"
                />
              </button>
            );
          })}
        </div>

        {hasFilters && (
          <button
            onClick={() => {
              setQuery("");
              setTier(null);
              setResources(new Set());
              setPage(1);
            }}
            className="rounded-lg border border-line bg-panel px-3 py-1.5 text-xs text-muted transition-colors hover:text-text"
          >
            Сбросить
          </button>
        )}
      </div>

      <p className="mt-4 text-sm text-muted">
        Карт: <span className="num text-gold">{filtered.length}</span>
        {filtered.length !== maps.length && <span className="num"> из {maps.length}</span>}
      </p>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted">
          Ничего не найдено. Измените запрос или сбросьте фильтры.
        </p>
      ) : (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((m) => (
              <MapCard key={m.name} map={m} />
            ))}
          </div>

          {pages > 1 && (
            <nav className="mt-6 flex flex-wrap items-center justify-center gap-1.5 text-sm">
              <button
                onClick={() => setPage(Math.max(1, current - 1))}
                disabled={current === 1}
                className="rounded-lg border border-line bg-panel px-3 py-1.5 text-muted transition-colors enabled:hover:text-text disabled:opacity-40"
              >
                Назад
              </button>
              {pageNumbers.map((n, i) =>
                n === "..." ? (
                  <span key={`e${i}`} className="px-1 text-muted/60">
                    …
                  </span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`num min-w-9 rounded-lg border px-3 py-1.5 transition-colors ${
                      n === current
                        ? "border-gold/60 bg-gold/10 text-gold-hi"
                        : "border-line bg-panel text-muted enabled:hover:text-text"
                    }`}
                  >
                    {n}
                  </button>
                )
              )}
              <button
                onClick={() => setPage(Math.min(pages, current + 1))}
                disabled={current === pages}
                className="rounded-lg border border-line bg-panel px-3 py-1.5 text-muted transition-colors enabled:hover:text-text disabled:opacity-40"
              >
                Далее
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

function MapCard({ map: m }: { map: AvalonMap }) {
  const present = AVALON_RESOURCE_ORDER.filter((k) => m.resources[k] > 0);
  return (
    <a
      href={`${SOURCE}/ru/maps/avalon/${m.name}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-lg border border-line bg-panel transition-colors hover:border-gold/60"
      title={`Открыть ${m.name} на albiononlinebuilds.com`}
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-ink-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avalonMapImage(m.name)}
          alt={m.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <span className="num absolute right-2 top-2 rounded border border-gold/60 bg-ink/90 px-1.5 py-0.5 text-[11px] font-bold text-gold-hi">
          {m.tier}
        </span>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold text-text group-hover:text-gold-hi">
            {m.name}
          </span>
          <span className="num shrink-0 text-[10px] text-muted">открыть ↗</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          {present.map((k) => (
            <span
              key={k}
              className="flex items-center gap-1 text-xs text-muted"
              title={`${AVALON_RESOURCE_RU[k]}: ${m.resources[k]}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avalonIcon(k)} alt="" width={16} height={16} className="h-4 w-4" />
              <span className="num">{m.resources[k]}</span>
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}
