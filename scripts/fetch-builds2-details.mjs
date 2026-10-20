/**
 * Fetch per-build details (items + spells + passives + description) from
 * albiononlinebuilds.com for every build in data/builds2.json.
 *
 * Incremental: builds already present in data/builds2-details.json are skipped
 * unless --force is passed. Output: data/builds2-details.json
 */

import fs from "node:fs";
import path from "node:path";

const LIST = path.resolve("data/builds2.json");
const OUT = path.resolve("data/builds2-details.json");
const FORCE = process.argv.includes("--force");
const DELAY_MS = 350;
const RETRIES = 3;

const list = JSON.parse(fs.readFileSync(LIST, "utf8"));
const out = fs.existsSync(OUT)
  ? JSON.parse(fs.readFileSync(OUT, "utf8"))
  : { fetchedAt: null, builds: {} };
out.builds ??= {};

const todo = list.builds.filter((b) => FORCE || !out.builds[b.slug]?.items);
console.log(`builds total: ${list.builds.length}, to fetch: ${todo.length}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function extractBalanced(src, start) {
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}") {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  throw new Error("unbalanced JSON at " + start);
}

function parseFlight(html) {
  const chunks = [];
  const re = /self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g;
  for (let m; (m = re.exec(html)); ) {
    try {
      chunks.push(JSON.parse(m[1]));
    } catch {}
  }
  return chunks.join("");
}

function findStateAndMeta(flight, slug) {
  // meta: search every {"id":"..."} meta blob, keep the one matching the slug
  let meta = null;
  for (let i = flight.indexOf('"meta":{"id"'); i >= 0; i = flight.indexOf('"meta":{"id"', i + 1)) {
    const raw = extractBalanced(flight, i + '"meta":'.length);
    try {
      const m = JSON.parse(raw);
      if (m.slug === slug && m.title) {
        meta = m;
        break;
      }
    } catch {}
  }
  if (!meta) throw new Error("meta not found");

  const stateIdx = flight.indexOf('"state":{"items":[');
  if (stateIdx < 0) throw new Error("state not found");
  const state = JSON.parse(extractBalanced(flight, stateIdx + '"state":'.length));
  if (!Array.isArray(state.items) || state.items.length !== 10) {
    throw new Error("bad items array");
  }
  return { state, meta };
}

async function fetchBuild(slug) {
  const url = `https://www.albiononlinebuilds.com/ru/build/${slug}`;
  let lastErr;
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
          "Accept-Language": "ru",
        },
      });
      if (res.status === 404) return { missing: true };
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const { state, meta } = findStateAndMeta(parseFlight(html), slug);
      return {
        slug,
        title: meta.title,
        description: typeof meta.description === "string" ? meta.description : "",
        modes: Array.isArray(meta.modes) && meta.modes.length ? meta.modes : [meta.mode].filter(Boolean),
        upvotes: Number(meta.upvotes) || 0,
        author: typeof meta.author === "string" ? meta.author : null,
        authorRegion: typeof meta.authorRegion === "string" ? meta.authorRegion : null,
        updatedAt: meta.updatedAt?.seconds ?? null,
        tier: meta.tierListBadge?.tier ?? null,
        tierList: meta.tierListBadge?.title ?? null,
        items: state.items.map((x) => (typeof x === "string" ? x : null)),
        spells: Array.from({ length: 10 }, (_, i) =>
          Array.isArray(state.spells?.[i]) ? state.spells[i].filter((s) => typeof s === "string") : []
        ),
        passives: Array.from({ length: 10 }, (_, i) =>
          typeof state.passives?.[i] === "string" ? state.passives[i] : null
        ),
      };
    } catch (e) {
      lastErr = e;
      await sleep(1500 * attempt);
    }
  }
  throw lastErr ?? new Error("fetch failed");
}

let done = 0;
let failed = [];
for (const b of todo) {
  try {
    const detail = await fetchBuild(b.slug);
    if (detail.missing) {
      console.log("missing:", b.slug);
      out.builds[b.slug] = { slug: b.slug, missing: true };
    } else {
      out.builds[b.slug] = detail;
    }
  } catch (e) {
    console.log("FAILED:", b.slug, e.message);
    failed.push(b.slug);
  }
  done++;
  if (done % 25 === 0) {
    console.log(`${done}/${todo.length}`);
    fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n", "utf8");
  }
  await sleep(DELAY_MS);
}

out.fetchedAt = new Date().toISOString();
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n", "utf8");
console.log(`saved ${Object.keys(out.builds).length} details, failed: ${failed.length}`);
if (failed.length) console.log("failed slugs:", failed.join(", "));
