"use client";

import { useEffect, useMemo, useState } from "react";
import { itemName, itemIcon } from "@/lib/labels";
import {
  BUY_CITIES,
  SERVERS,
  cityRu,
  fetchQuotes,
  fmtSilver,
  type ServerKey,
} from "@/lib/market";
import type { Quotes } from "@/lib/types";

export interface Slot {
  label: string;
  id: string;
  altId?: string | null;
}

interface FetchResult {
  server: ServerKey;
  quotes: Quotes | null;
  error: string | null;
}

export function BuildSet({ slots }: { slots: Slot[] }) {
  const [server, setServer] = useState<ServerKey>("europe");
  const [result, setResult] = useState<FetchResult | null>(null);

  const ids = useMemo(
    () => [...new Set(slots.flatMap((s) => [s.id, s.altId].filter(Boolean) as string[]))],
    [slots]
  );

  useEffect(() => {
    const ac = new AbortController();
    fetchQuotes(server, ids, undefined, ac.signal)
      .then((q) => setResult({ server, quotes: q, error: null }))
      .catch((e) => {
        if (e?.name === "AbortError") return;
        setResult({ server, quotes: null, error: String(e?.message ?? e) });
      });
    return () => ac.abort();
  }, [server, ids]);

  const fresh: FetchResult | null =
    result !== null && result.server === server ? result : null;
  const state: "loading" | "error" | "idle" = !fresh
    ? "loading"
    : fresh.error
      ? "error"
      : "idle";
  const quotes = fresh && !fresh.error ? fresh.quotes : null;
  const errMsg = fresh?.error ?? "";

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-xl text-gold-hi">Сет и цены</h2>
        <select
          value={server}
          onChange={(e) => setServer(e.target.value as ServerKey)}
          className="h-8 rounded border border-line bg-panel px-2 text-xs text-text focus:border-gold/60 focus:outline-none"
        >
          {SERVERS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-line">
        <table className="w-full text-sm">
          <thead className="bg-panel text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-3 py-2 font-normal">Слот</th>
              <th className="px-3 py-2 font-normal">Предмет</th>
              <th className="px-3 py-2 text-right font-normal">Мин. цена продажи</th>
              <th className="px-3 py-2 text-right font-normal">ЧР (бай-ордер)</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((s) => (
              <SlotRow key={s.label + s.id} slot={s} quotes={quotes} state={state} errMsg={errMsg} />
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted">
        Цены — минимальные действующие селл-ордера по городам; Чёрный рынок — лучший бай-ордер
        системы. Обновляется при открытии страницы.
      </p>
    </section>
  );
}

function SlotRow({
  slot,
  quotes,
  state,
  errMsg,
}: {
  slot: Slot;
  quotes: Quotes | null;
  state: "idle" | "loading" | "error";
  errMsg: string;
}) {
  const allIds = [slot.id, slot.altId].filter(Boolean) as string[];

  let best: { price: number; city: string } | null = null;
  let bm: number | null = null;
  if (quotes) {
    for (const id of allIds) {
      const m = quotes.get(id);
      if (!m) continue;
      for (const city of BUY_CITIES) {
        const s = m.get(city)?.sell;
        if (s != null && (!best || s < best.price)) best = { price: s, city };
      }
      const bmm = m.get("BlackMarket")?.buyMax;
      if (bmm != null && (bm == null || bmm > bm)) bm = bmm;
    }
  }

  return (
    <tr className="border-t border-line bg-ink-2/60">
      <td className="px-3 py-3 align-top text-xs text-muted">{slot.label}</td>
      <td className="px-3 py-3">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded border border-line bg-ink">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={itemIcon(slot.id)} alt="" width={36} height={36} className="h-9 w-9" loading="lazy" />
          </div>
          <div className="min-w-0">
            <div className="text-text">{itemName(slot.id)}</div>
            {slot.altId && (
              <div className="text-xs text-muted">или: {itemName(slot.altId)}</div>
            )}
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-right align-middle">
        {state === "loading" ? (
          <span className="text-xs text-muted">загрузка…</span>
        ) : state === "error" ? (
          <span className="text-xs text-red">{errMsg}</span>
        ) : best ? (
          <>
            <span className="num text-gold-hi">{fmtSilver(best.price)}</span>
            <span className="ml-2 text-xs text-muted">{cityRu(best.city)}</span>
          </>
        ) : (
          <span className="text-xs text-muted">нет данных</span>
        )}
      </td>
      <td className="px-3 py-3 text-right align-middle">
        {bm != null ? (
          <span className="num text-text">{fmtSilver(bm)}</span>
        ) : (
          <span className="text-xs text-muted">—</span>
        )}
      </td>
    </tr>
  );
}
