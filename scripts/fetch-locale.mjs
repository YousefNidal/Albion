import fs from "node:fs";
import path from "node:path";

const CACHE = path.resolve("data/.cache");
const ITEMS_URL =
  "https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/formatted/items.json";
const LOC_URL =
  "https://raw.githubusercontent.com/ao-data/ao-bin-dumps/master/localization.json";

fs.mkdirSync(CACHE, { recursive: true });

async function ensureCache(name, url) {
  const p = path.join(CACHE, name);
  if (fs.existsSync(p)) return p;
  console.log(`downloading ${url} ...`);
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${url}`);
  const buf = Buffer.from(await r.arrayBuffer());
  fs.writeFileSync(p, buf);
  console.log(`saved ${name} (${(buf.length / 1048576).toFixed(1)} MB)`);
  return p;
}

const itemsPath = await ensureCache("items.json", ITEMS_URL);
const locPath = await ensureCache("localization.json", LOC_URL);

const items = JSON.parse(fs.readFileSync(itemsPath, "utf8"));
console.log(`items: ${items.length}`);

const byId = new Map();
for (const it of items) {
  if (!it.UniqueName) continue;
  byId.set(it.UniqueName, it);
}

function ru(it) {
  return (
    it?.LocalizedNames?.["RU-RU"] || it?.LocalizedNames?.["EN-US"] || null
  );
}
function en(it) {
  return it?.LocalizedNames?.["EN-US"] || null;
}

// ---------- flip pool ----------
const pool = [];
const seenPool = new Set();

function parseId(id) {
  const m = id.match(/^T(\d)_(.+)/);
  if (!m) return null;
  const rest = m[2];
  const em = rest.match(/^(.*)@(\d)$/);
  return { tier: Number(m[1]), rest: em ? em[1] : rest, ench: em ? Number(em[2]) : 0 };
}

function pushPool(id, cat) {
  if (seenPool.has(id)) return;
  if (id.includes("PROTOTYPE")) return;
  const p = parseId(id);
  if (!p) return;
  if (!byId.has(id)) return;
  seenPool.add(id);
  pool.push({ id, cat, tier: p.tier, ench: p.ench });
}

const ALL = items.map((i) => i.UniqueName).filter(Boolean);

// weapons: MAIN + 2H (no gathering tools), T6-T8, enchant 0-3
for (const id of ALL) {
  const p = parseId(id);
  if (!p || p.ench > 3) continue;
  if (p.tier < 6 || p.tier > 8) continue;
  if (/^MAIN_/.test(p.rest)) pushPool(id, "weapon");
  else if (/^2H_/.test(p.rest) && !/^2H_TOOL/.test(p.rest)) pushPool(id, "weapon");
}
// armor: helmet/chest/boots, T6-T8, enchant 0-3
for (const id of ALL) {
  const p = parseId(id);
  if (!p || p.ench > 3) continue;
  if (p.tier < 6 || p.tier > 8) continue;
  if (/^HEAD_/.test(p.rest)) pushPool(id, "helmet");
  else if (/^ARMOR_/.test(p.rest)) pushPool(id, "chest");
  else if (/^SHOES_/.test(p.rest)) pushPool(id, "boots");
}
// capes (plain), T6-T8, enchant 0-3
for (const id of ALL) {
  const p = parseId(id);
  if (!p || p.ench > 3 || p.tier < 6 || p.tier > 8) continue;
  if (/^CAPE$/.test(p.rest)) pushPool(id, "cape");
}
// runes / souls / relics T4-T8
for (const id of ALL) {
  const p = parseId(id);
  if (!p || p.ench !== 0) continue;
  if (/^(RUNE|SOUL|RELIC)$/.test(p.rest)) pushPool(id, "material");
}
// raw + refined resources T4-T8
for (const id of ALL) {
  const p = parseId(id);
  if (!p || p.ench !== 0 || p.tier < 4 || p.tier > 8) continue;
  if (/^(WOOD|ROCK|ORE|HIDE|FIBER|PLANKS|STONEBLOCK|METALBAR|LEATHER|CLOTH)$/.test(p.rest))
    pushPool(id, "resource");
}
// meals T5-T8, enchant 0-3
for (const id of ALL) {
  const p = parseId(id);
  if (!p || p.ench > 3 || p.tier < 5 || p.tier > 8) continue;
  if (/^MEAL_/.test(p.rest)) pushPool(id, "food");
}
// potions T5-T8, enchant 0-3
for (const id of ALL) {
  const p = parseId(id);
  if (!p || p.ench > 3 || p.tier < 5 || p.tier > 8) continue;
  if (/^POTION_/.test(p.rest)) pushPool(id, "potion");
}
// mounts T5-T8, enchant 0-3
for (const id of ALL) {
  const p = parseId(id);
  if (!p || p.ench > 3 || p.tier < 5 || p.tier > 8) continue;
  if (/^MOUNT_/.test(p.rest)) pushPool(id, "mount");
}

const counts = {};
for (const e of pool) counts[e.cat] = (counts[e.cat] || 0) + 1;
pool.sort((a, b) => a.cat.localeCompare(b.cat) || a.id.localeCompare(b.id));
fs.writeFileSync(
  path.resolve("data/flip-pool.json"),
  JSON.stringify({ counts, items: pool }, null, 0),
  "utf8"
);
console.log(`flip pool: ${pool.length} ids`, counts);

// ---------- items locale (pool + every item id used by builds) ----------
const builds = JSON.parse(fs.readFileSync(path.resolve("data/builds.raw.json"), "utf8"));
const buildItemIds = new Set();
for (const b of builds) {
  for (const k of [
    "weapon_id", "helmet_id", "helmet_id_alt", "chest_id", "chest_id_alt",
    "boots_id", "boots_id_alt", "cape_id", "cape_id_alt",
    "offhand_id", "offhand_id_alt", "food_id", "food_alt", "potion_id", "potion_alt",
  ]) {
    if (b[k]) buildItemIds.add(b[k]);
  }
}
const itemsLocale = {};
let missItem = 0;
for (const id of new Set([...seenPool, ...buildItemIds])) {
  const it = byId.get(id);
  const name = ru(it);
  if (name) itemsLocale[id] = name;
  else {
    missItem++;
    const fallback = en(it);
    if (fallback) itemsLocale[id] = fallback;
  }
}
fs.writeFileSync(
  path.resolve("data/items-locale.json"),
  JSON.stringify(itemsLocale, null, 0),
  "utf8"
);
console.log(
  `items-locale: ${Object.keys(itemsLocale).length} (no RU: ${missItem}, build-only ids: ${[...buildItemIds].filter((i) => !seenPool.has(i)).length})`
);

// ---------- spells locale (RU names for skills used by builds) ----------
const skillIds = new Set();
for (const b of builds) {
  for (const k of Object.keys(b)) {
    if (!/_skills$|_skills_alt$|skills_alt$/.test(k)) continue;
    const v = b[k];
    if (Array.isArray(v)) for (const s of v) if (typeof s === "string") skillIds.add(s);
  }
}
console.log(`build spell ids: ${skillIds.size}`);

console.log("parsing localization.json ...");
const loc = JSON.parse(fs.readFileSync(locPath, "utf8"));
const tuArr = loc?.tmx?.body?.tu || [];
console.log(`tu entries: ${tuArr.length}`);

const spellsRu = {};
let spellHit = 0;
for (const tu of tuArr) {
  const tuid = tu["@tuid"];
  if (typeof tuid !== "string" || !tuid.startsWith("@SPELLS_")) continue;
  const id = tuid.slice("@SPELLS_".length);
  if (!skillIds.has(id)) continue;
  if (id.endsWith("_DESC")) continue;
  for (const tuv of tu.tuv || []) {
    if (tuv["@xml:lang"] === "RU-RU" && tuv.seg) {
      spellsRu[id] = tuv.seg;
      spellHit++;
      break;
    }
  }
}
fs.writeFileSync(
  path.resolve("data/spells-locale.json"),
  JSON.stringify(spellsRu, null, 0),
  "utf8"
);
const noRu = [...skillIds].filter((s) => !spellsRu[s]);
console.log(`spells-locale: ${spellHit}/${skillIds.size} found`);
if (noRu.length) console.log(`missing RU spells (${noRu.length}): ${noRu.slice(0, 40).join(", ")}`);
