/**
 * Snapshot the community "top builds" list from albiononlinebuilds.com.
 *
 * The site is a Next.js app whose SSR HTML embeds the full flight payload
 * (self.__next_f.push) with the structured build list, so no private API
 * is needed — we reuse their own rendered data.
 *
 * Output: data/builds2.json
 */

import fs from "node:fs";
import path from "node:path";

const URL = "https://www.albiononlinebuilds.com/ru/top-builds";
const OUT = path.resolve("data/builds2.json");

const html = await fetch(URL, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
    "Accept-Language": "ru",
  },
}).then((r) => {
  if (!r.ok) throw new Error(`HTTP ${r.status} for ${URL}`);
  return r.text();
});

console.log("html:", html.length, "bytes");

const chunks = [];
const pushRe = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
for (let m; (m = pushRe.exec(html)); ) {
  try {
    chunks.push(JSON.parse(m[1]));
  } catch {
    /* ignore non-string payloads */
  }
}
const flight = chunks.join("");
console.log("flight:", flight.length, "bytes,", chunks.length, "chunks");

function extractBalanced(src, start) {
  let depth = 0;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}") {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  throw new Error("unbalanced JSON at " + start);
}

// All "builds":[ arrays in the payload (list section + maybe more).
const builds = [];
const seen = new Map();
for (let i = flight.indexOf('"builds":['); i >= 0; i = flight.indexOf('"builds":[', i + 1)) {
  const arr = JSON.parse(extractBalanced(flight, i + '"builds":'.length));
  for (const b of arr) {
    if (!b?.slug) continue;
    const prev = seen.get(b.slug);
    if (prev != null && builds[prev].upvotes >= b.upvotes) continue;
    const norm = {
      slug: b.slug,
      title: b.title,
      modes: Array.isArray(b.modes) && b.modes.length ? b.modes : b.mode ? [b.mode] : [],
      tag: typeof b.tag === "string" ? b.tag : null,
      items: Array.isArray(b.items) ? b.items.map((x) => (typeof x === "string" ? x : null)) : [],
      upvotes: Number(b.upvotes) || 0,
      tier: b.tierListBadge?.tier ?? null,
      tierList: b.tierListBadge?.title ?? null,
      author: typeof b.author === "string" ? b.author : null,
      authorRegion: typeof b.authorRegion === "string" ? b.authorRegion : null,
      createdAt: b.createdAt?.seconds ?? null,
      updatedAt: b.updatedAt?.seconds ?? null,
    };
    if (prev != null) builds[prev] = norm;
    else {
      seen.set(b.slug, builds.length);
      builds.push(norm);
    }
  }
}
console.log("builds:", builds.length);

// Category (mode) labels from the RU tab bar.
let modes = [];
const allLabelIdx = flight.indexOf('"allLabel"');
if (allLabelIdx >= 0) {
  const itemsIdx = flight.indexOf('"items":[', allLabelIdx);
  if (itemsIdx >= 0 && itemsIdx - allLabelIdx < 400) {
    modes = JSON.parse(extractBalanced(flight, itemsIdx + '"items":'.length)).filter(
      (m) => m?.slug && m?.label
    );
  }
}
console.log("modes:", modes.length, modes.map((m) => `${m.slug}=${m.label}`).join(" | "));

const modeSet = new Set(builds.flatMap((b) => b.modes));
const missing = [...modeSet].filter((m) => !modes.some((x) => x.slug === m));
if (missing.length) console.log("modes without label:", missing.join(", "));

const out = {
  source: URL,
  fetchedAt: new Date().toISOString(),
  modes,
  builds: builds.sort((a, b) => b.upvotes - a.upvotes || b.updatedAt - a.updatedAt),
};
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n", "utf8");
console.log("written:", OUT, fs.statSync(OUT).size, "bytes");

// Small copy of just the mode labels, safe to import from client components.
const MODES_OUT = path.resolve("data/builds2-modes.json");
fs.writeFileSync(MODES_OUT, JSON.stringify(modes, null, 1) + "\n", "utf8");
console.log("written:", MODES_OUT);
