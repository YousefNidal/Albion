import assert from "node:assert";
import { computeFlips, enchantQty, indexRows } from "../lib/market.ts";
import type { DirectFlip, PoolEntry, Quote, Quotes, UpgradeFlip } from "../lib/types.ts";

function q(map: Record<string, Record<string, [sell: number, buyMax: number]>>): Quotes {
  const quotes: Quotes = new Map();
  for (const [id, cities] of Object.entries(map)) {
    let m = quotes.get(id);
    if (!m) quotes.set(id, (m = new Map<string, Quote>()));
    for (const [city, [sell, buyMax]] of Object.entries(cities)) {
      m.set(city, { sell, buyMax });
    }
  }
  return quotes;
}

const pool: PoolEntry[] = [
  { id: "T8_MAIN_AXE", cat: "weapon", tier: 8, ench: 0 },
  { id: "T6_2H_AXE", cat: "weapon", tier: 6, ench: 0 },
  { id: "T6_2H_AXE@2", cat: "weapon", tier: 6, ench: 2 },
  { id: "T6_RUNE", cat: "material", tier: 6, ench: 0 },
  { id: "T6_SOUL", cat: "material", tier: 6, ench: 0 },
];

assert.equal(enchantQty({ id: "T8_MAIN_AXE", cat: "weapon" }), 288, "1H qty");
assert.equal(enchantQty({ id: "T6_2H_AXE", cat: "weapon" }), 384, "2H qty");
assert.equal(enchantQty({ id: "T6_ARMOR_PLATE_SET1", cat: "chest" }), 192, "chest qty");
assert.equal(enchantQty({ id: "T6_HEAD_CLOTH_SET1", cat: "helmet" }), 96, "helmet qty");
assert.equal(enchantQty({ id: "T6_POTION_HEAL", cat: "potion" }), null, "potions not rune-enchantable");

const quotes = q({
  T8_MAIN_AXE: {
    Martlock: [100000, 0],
    Caerleon: [200000, 0],
    BlackMarket: [0, 150000],
  },
  T6_2H_AXE: { Thetford: [50000, 0] },
  "T6_2H_AXE@2": { Lymhurst: [200000, 0] },
  T6_RUNE: { Martlock: [60, 0], Caerleon: [50, 0] },
  T6_SOUL: { Martlock: [100, 0] },
});

const all = new Set(pool.map((p) => p.cat));
const flips = computeFlips(pool, quotes, {
  tax: 0.065,
  cats: all,
  minProfit: 1,
  minRoi: 0,
  includeUpgrades: true,
});

// --- direct flip: buy Martlock 100k, sell Caerleon 200k (BM 150k loses) ---
const direct = flips.find(
  (f): f is DirectFlip => f.kind === "direct" && f.id === "T8_MAIN_AXE"
);
assert.ok(direct, "direct flip exists");
assert.equal(direct.buyCity, "Martlock", "cheapest buy city");
assert.equal(direct.sellCity, "Caerleon", "best sell city after tax");
assert.equal(direct.sellPrice, 200000);
assert.equal(direct.buyPrice, 100000);
const expected = 200000 * (1 - 0.065) - 100000;
assert.ok(Math.abs(direct.profit - expected) < 1e-6, `profit ${direct.profit} == ${expected}`);
assert.ok(Math.abs(direct.roi - expected / 100000) < 1e-9, "roi");

// --- upgrade flip .0 -> .2 for a 2H weapon ---
const up = flips.find(
  (f): f is UpgradeFlip => f.kind === "upgrade" && f.id === "T6_2H_AXE@2"
);
assert.ok(up, "upgrade flip exists");
assert.equal(up.baseId, "T6_2H_AXE");
assert.equal(up.buyPrice, 50000, "base bought at Thetford");
assert.equal(up.mats.length, 2, "runes + souls for .2");
assert.deepEqual(
  up.mats.map((m) => [m.id, m.qty, m.price]),
  [
    ["T6_RUNE", 384, 50],
    ["T6_SOUL", 384, 100],
  ],
  "material ids, quantities and cheapest prices"
);
assert.equal(up.matCost, 384 * 50 + 384 * 100, "mat cost");
assert.equal(up.sellCity, "Lymhurst");
const upExpected = 200000 * (1 - 0.065) - (50000 + up.matCost);
assert.ok(Math.abs(up.profit - upExpected) < 1e-6, `upgrade profit ${up.profit}`);

// --- indexRows ignores zero prices ---
const idx = indexRows([
  { item_id: "X", city: "Martlock", quality: 1, sell_price_min: 0, buy_price_max: 0 },
  { item_id: "X", city: "Caerleon", quality: 1, sell_price_min: 123, buy_price_max: 456 },
]);
assert.equal(idx.get("X")!.get("Martlock")!.sell, null, "0 becomes null");
assert.equal(idx.get("X")!.get("Caerleon")!.buyMax, 456);

console.log("test-flips: all assertions passed");
