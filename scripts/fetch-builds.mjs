import fs from "node:fs";
import path from "node:path";
import { fetchJSON, sleep } from "./lib.mjs";

const API = "https://albiononlinegrind.com/api/builds";
const MAX_BUILDS = Number(process.env.MAX_BUILDS || 240);
const DELAY_MS = 1500;
const OUT = path.resolve("data/builds.raw.json");
const TRANSLATIONS = path.resolve("data/translations.json");

fs.mkdirSync(path.dirname(OUT), { recursive: true });

const collected = [];
const seen = new Set();
let page = 1;

while (collected.length < MAX_BUILDS) {
  console.log(`fetching page ${page} (${collected.length}/${MAX_BUILDS})...`);
  const data = await fetchJSON(`${API}?page=${page}`);
  const builds = data.builds || [];
  if (builds.length === 0) break;
  for (const b of builds) {
    if (!b.is_published || b.is_unlisted || seen.has(b.slug)) continue;
    seen.add(b.slug);
    collected.push(b);
    if (collected.length >= MAX_BUILDS) break;
  }
  if (!data.hasMore) break;
  page++;
  await sleep(DELAY_MS);
}

const sorted = collected.sort((a, b) => (b.upvote_count || 0) - (a.upvote_count || 0));

let translations = {};
if (fs.existsSync(TRANSLATIONS)) {
  translations = JSON.parse(fs.readFileSync(TRANSLATIONS, "utf8"));
}

const merged = sorted.map((b) => {
  const t = translations[b.slug];
  return {
    ...b,
    title_ru: t?.title_ru || null,
    description_ru: t?.description_ru || null,
  };
});

fs.writeFileSync(OUT, JSON.stringify(merged, null, 1), "utf8");

const missing = merged.filter((b) => !b.title_ru).map((b) => b.slug);
console.log(`wrote ${merged.length} builds -> ${OUT}`);
console.log(`translations present: ${merged.length - missing.length}/${merged.length}`);
if (missing.length) {
  fs.writeFileSync(
    path.resolve("data/missing-translations.json"),
    JSON.stringify(missing, null, 1),
    "utf8"
  );
  console.log(`missing title_ru for ${missing.length} slugs -> data/missing-translations.json`);
}
