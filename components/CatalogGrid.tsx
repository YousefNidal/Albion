"use client";

import { useMemo, useState } from "react";
import { BuildCard } from "./BuildCard";
import { builds } from "@/lib/data";
import { BUILD_CAT_RU, buildTitle } from "@/lib/labels";

type Sort = "votes" | "new";

export function CatalogGrid() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState<Sort>("votes");

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of builds) counts.set(b.category, (counts.get(b.category) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = builds.filter((b) => {
      if (cat !== "all" && b.category !== cat) return false;
      if (!q) return true;
      return (
        buildTitle(b).toLowerCase().includes(q) ||
        b.title.toLowerCase().includes(q) ||
        b.slug.includes(q) ||
        (b.author ?? "").toLowerCase().includes(q)
      );
    });
    out = [...out].sort((a, b) =>
      sort === "votes"
        ? (b.upvote_count ?? 0) - (a.upvote_count ?? 0)
        : +new Date(b.created_at) - +new Date(a.created_at)
    );
    return out;
  }, [query, cat, sort]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск: оружие, автор, название…"
          className="h-10 w-64 rounded border border-line bg-panel px-3 text-sm text-text placeholder:text-muted focus:border-gold/60 focus:outline-none"
        />
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="h-10 rounded border border-line bg-panel px-3 text-sm text-text focus:border-gold/60 focus:outline-none"
        >
          <option value="all">Все контенты</option>
          {categories.map(([c, n]) => (
            <option key={c} value={c}>
              {BUILD_CAT_RU[c] ?? c} ({n})
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="h-10 rounded border border-line bg-panel px-3 text-sm text-text focus:border-gold/60 focus:outline-none"
        >
          <option value="votes">По популярности</option>
          <option value="new">Сначала новые</option>
        </select>
        <span className="text-xs text-muted">
          Найдено: <span className="num text-gold">{list.length}</span>
        </span>
      </div>

      {list.length === 0 ? (
        <p className="mt-10 text-center text-muted">
          Ничего не нашлось. Попробуйте другой запрос или сбросьте фильтры.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((b) => (
            <BuildCard key={b.slug} build={b} />
          ))}
        </div>
      )}
    </div>
  );
}
