/**
 * Snapshot the Avalon Roads maps dataset from albiononlinebuilds.com.
 *
 * The /maps/avalon page ships the whole 400-map array inside its client JS
 * chunk, so we pull the chunk, extract the `[{name,tier,resources}]` literal
 * and store it as JSON. Also downloads the resource icons into public/.
 *
 * Output: data/avalon-maps.json + public/avalon-icons/*.webp
 */

import fs from "node:fs";
import path from "node:path";

const BASE = "https://www.albiononlinebuilds.com";
const PAGE = `${BASE}/ru/maps/avalon`;
const OUT = path.resolve("data/avalon-maps.json");
const ICON_DIR = path.resolve("public/avalon-icons");

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
  "Accept-Language": "ru",
};

const ICONS = ["green", "blue", "rock", "wood", "hide", "ore", "dg_solo", "dg_group"];

const html = await fetch(PAGE, { headers: HEADERS }).then((r) => {
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${PAGE}`);
  return r.text();
});
console.log("page:", html.length, "bytes");

const chunk = html.match(/src="(\/_next\/static\/chunks\/app\/[^"]*maps\/avalon\/page-[^"]+\.js)"/)?.[1];
if (!chunk) throw new Error("maps chunk not found");
console.log("chunk:", chunk);

const code = await fetch(BASE + chunk, { headers: HEADERS }).then((r) => {
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${chunk}`);
  return r.text();
});

function extractBalanced(src, start) {
  let depth = 0;
  let inStr = false;
  let esc = false;
  let quote = "";
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === quote) inStr = false;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      inStr = true;
      quote = c;
      continue;
    }
    if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}") {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  throw new Error("unbalanced array");
}

const marker = code.indexOf("h=[{name:");
if (marker < 0) throw new Error("maps array marker not found");
const arrText = extractBalanced(code, code.indexOf("[", marker));
const maps = Function(`return (${arrText})`)();

const clean = maps
  .filter((m) => typeof m?.name === "string" && /^T[468]$/.test(m?.tier))
  .map((m) => ({
    name: m.name,
    tier: m.tier,
    resources: Object.fromEntries(ICONS.map((k) => [k, Number(m.resources?.[k]) || 0])),
  }));

console.log("maps:", clean.length);
if (clean.length < 300) throw new Error("unexpectedly few maps");

const out = { source: PAGE, fetchedAt: new Date().toISOString(), maps: clean };
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n", "utf8");
console.log("written:", OUT, (fs.statSync(OUT).size / 1024).toFixed(0) + "KB");

fs.mkdirSync(ICON_DIR, { recursive: true });
for (const icon of ICONS) {
  const file = path.join(ICON_DIR, `${icon}.webp`);
  const res = await fetch(`${BASE}/avalon-icons/${icon}.webp`, { headers: HEADERS });
  if (!res.ok) {
    console.log("icon failed:", icon, res.status);
    continue;
  }
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}
console.log("icons:", fs.readdirSync(ICON_DIR).join(", "));
