import type { Flip, PoolCat, PoolEntry, PriceRow, Quotes, UpgradeFlip } from "./types";

export type ServerKey = "europe" | "west" | "east";

export const SERVERS: { key: ServerKey; label: string }[] = [
  { key: "europe", label: "Европа" },
  { key: "west", label: "Запад (Америка)" },
  { key: "east", label: "Азия" },
];

export const HOST: Record<ServerKey, string> = {
  europe: "https://europe.albion-online-data.com",
  west: "https://west.albion-online-data.com",
  east: "https://east.albion-online-data.com",
};

export const BUY_CITIES = [
  "Martlock",
  "FortSterling",
  "Thetford",
  "Lymhurst",
  "Bridgewatch",
  "Caerleon",
  "Brecilien",
] as const;

export const ALL_CITIES = [...BUY_CITIES, "BlackMarket"] as const;

export const CITY_RU: Record<string, string> = {
  Martlock: "Мартлок",
  FortSterling: "Форт-Стерлинг",
  Thetford: "Тетфорд",
  Lymhurst: "Лимхерст",
  Bridgewatch: "Бриджвотч",
  Caerleon: "Керлеон",
  BlackMarket: "Чёрный рынок",
  Brecilien: "Бресильен",
};

export const cityRu = (c: string): string => CITY_RU[c] ?? c;

export const TAX_PRESETS = [
  { value: 0.065, label: "Селл-ордер, премиум — 6,5%" },
  { value: 0.04, label: "Мгновенная продажа, премиум — 4%" },
  { value: 0.105, label: "Селл-ордер, без премиума — 10,5%" },
  { value: 0.08, label: "Мгновенная продажа, без премиума — 8%" },
];

const DELAY_MS = 450;

/** "6.5%" / "4%" — для подписей налога в UI. */
export const fmtTaxPct = (tax: number): string => {
  const pct = tax * 100;
  return `${pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(1).replace(".", ",")}%`;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface FetchProgress {
  done: number;
  total: number;
}

/** Fetch sell/buy quotes for every id across all cities, in batches. */
export async function fetchQuotes(
  server: ServerKey,
  ids: string[],
  onProgress?: (p: FetchProgress) => void,
  signal?: AbortSignal
): Promise<Quotes> {
  const host = HOST[server];
  // Batch ids so the URL stays safely under the API's 4096-char limit.
  const query = `?locations=${ALL_CITIES.join(",")}&qualities=1`;
  const baseLen = `${host}/api/v2/stats/prices/.json`.length + query.length;
  const chunks: string[][] = [];
  let cur: string[] = [];
  let curLen = baseLen;
  for (const id of ids) {
    const add = id.length + 1;
    if (cur.length > 0 && curLen + add > 4000) {
      chunks.push(cur);
      cur = [];
      curLen = baseLen;
    }
    cur.push(id);
    curLen += add;
  }
  if (cur.length > 0) chunks.push(cur);
  const quotes: Quotes = new Map();
  let done = 0;

  for (const chunk of chunks) {
    if (signal?.aborted) throw new DOMException("aborted", "AbortError");
    const url = `${host}/api/v2/stats/prices/${chunk.join(",")}.json${query}`;

    let res: Response | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      res = await fetch(url, { signal });
      if (res.status === 429) {
        const wait = 8000 * (attempt + 1);
        await sleep(wait);
        continue;
      }
      break;
    }
    if (!res || !res.ok) {
      throw new Error(`Ошибка загрузки цен (HTTP ${res?.status ?? "?"})`);
    }
    const rows = (await res.json()) as PriceRow[];
    indexRows(rows, quotes);
    done++;
    onProgress?.({ done, total: chunks.length });
    await sleep(DELAY_MS);
  }
  return quotes;
}

export function indexRows(rows: PriceRow[], into: Quotes = new Map()): Quotes {
  for (const r of rows) {
    if (!r?.item_id || !r.city) continue;
    let m = into.get(r.item_id);
    if (!m) into.set(r.item_id, (m = new Map()));
    m.set(r.city, { sell: num(r.sell_price_min), buyMax: num(r.buy_price_max) });
  }
  return into;
}

function num(v: unknown): number | null {
  return typeof v === "number" && v > 0 ? v : null;
}

/* ------------------------------ flip math ------------------------------ */

/** Materials per single enchant step, by wiki.albiononline.com/wiki/Enchanting. */
export function enchantQty(entry: Pick<PoolEntry, "cat" | "id">): number | null {
  if (entry.id.match(/^T\d+_MAIN_/)) return 288;
  if (entry.id.match(/^T\d+_2H_/)) return 384;
  switch (entry.cat) {
    case "chest":
      return 192;
    case "helmet":
    case "boots":
    case "cape":
      return 96;
    default:
      return null;
  }
}

const MAT_SUFFIX: Record<number, "RUNE" | "SOUL" | "RELIC"> = {
  1: "RUNE",
  2: "SOUL",
  3: "RELIC",
};

function bestBuy(
  q: Quotes,
  id: string
): { price: number; city: string } | null {
  const m = q.get(id);
  if (!m) return null;
  let best: { price: number; city: string } | null = null;
  for (const city of BUY_CITIES) {
    const s = m.get(city)?.sell;
    if (s != null && (!best || s < best.price)) best = { price: s, city };
  }
  return best;
}

function bestSell(
  q: Quotes,
  id: string,
  tax: number
): { price: number; city: string; net: number } | null {
  const m = q.get(id);
  if (!m) return null;
  let best: { price: number; city: string; net: number } | null = null;
  for (const [city, quote] of m) {
    // Royal cities: sell into a sell order at that price.
    // Black Market: you can only sell — receive the top system buy order.
    const raw = city === "BlackMarket" ? quote.buyMax : quote.sell;
    if (raw == null) continue;
    const net = raw * (1 - tax);
    if (!best || net > best.net) best = { price: raw, city, net };
  }
  return best;
}

export interface ComputeOptions {
  tax: number;
  cats: Set<PoolCat>;
  minProfit: number;
  minRoi: number;
  includeUpgrades: boolean;
}

export function computeFlips(pool: PoolEntry[], q: Quotes, o: ComputeOptions): Flip[] {
  const out: Flip[] = [];
  const byBase = new Map<string, PoolEntry>();
  for (const e of pool) if (e.ench === 0) byBase.set(e.id, e);

  for (const e of pool) {
    if (!o.cats.has(e.cat)) continue;
    const buy = bestBuy(q, e.id);
    const sell = bestSell(q, e.id, o.tax);
    if (!buy || !sell) continue;
    if (sell.city === buy.city && sell.price <= buy.price) continue;
    const profit = sell.net - buy.price;
    const roi = buy.price > 0 ? profit / buy.price : 0;
    if (profit >= o.minProfit && roi >= o.minRoi && profit > 0) {
      out.push({
        kind: "direct",
        id: e.id,
        cat: e.cat,
        tier: e.tier,
        ench: e.ench,
        buyPrice: buy.price,
        buyCity: buy.city,
        sellPrice: sell.price,
        sellCity: sell.city,
        profit,
        roi,
      });
    }
  }

  if (o.includeUpgrades) {
    for (const e of pool) {
      if (e.ench === 0 || !o.cats.has(e.cat)) continue;
      const qty = enchantQty(e);
      if (qty == null) continue;
      const baseId = e.id.replace(/@\d+$/, "");
      const buy = bestBuy(q, baseId);
      const sell = bestSell(q, e.id, o.tax);
      if (!buy || !sell) continue;

      const mats: UpgradeFlip["mats"] = [];
      let matCost = 0;
      let ok = true;
      for (let step = 1; step <= e.ench; step++) {
        const matId = `T${e.tier}_${MAT_SUFFIX[step]}`;
        const mBuy = bestBuy(q, matId);
        if (!mBuy) {
          ok = false;
          break;
        }
        mats.push({ id: matId, qty, price: mBuy.price });
        matCost += qty * mBuy.price;
      }
      if (!ok) continue;

      const cost = buy.price + matCost;
      const profit = sell.net - cost;
      const roi = cost > 0 ? profit / cost : 0;
      if (profit >= o.minProfit && roi >= o.minRoi && profit > 0) {
        out.push({
          kind: "upgrade",
          id: e.id,
          cat: e.cat,
          tier: e.tier,
          ench: e.ench,
          baseId,
          buyPrice: buy.price,
          buyCity: buy.city,
          mats,
          matCost,
          sellPrice: sell.price,
          sellCity: sell.city,
          profit,
          roi,
        });
      }
    }
  }

  out.sort((a, b) => b.profit - a.profit);
  return out;
}

/* ------------------------------ formatting ------------------------------ */

const ruFmt = new Intl.NumberFormat("ru-RU");

export function fmtSilver(n: number): string {
  return ruFmt.format(Math.round(n));
}

export function fmtShort(n: number): string {
  const a = Math.abs(n);
  if (a >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")} млн`;
  if (a >= 10_000) return `${Math.round(n / 1000)} тыс.`;
  return ruFmt.format(Math.round(n));
}

export function fmtRoi(roi: number): string {
  return `${(roi * 100).toFixed(1).replace(".", ",")}%`;
}

export function fmtEnch(e: number): string {
  return e === 0 ? "" : `.${e}`;
}
