/**
 * Team compositions ("компы") for community builds.
 *
 * albiononlinebuilds.com exposes a public JSON API used by their own frontend:
 *   GET https://api.albiononlinebuilds.com/api/builds/{slug}  -> { compIds: [] }
 *   GET https://api.albiononlinebuilds.com/api/comp/{compId}  -> comp with members
 *
 * Output: data/builds2-comps.json
 *   { fetchedAt, byBuild: {buildSlug: [compId]}, comps: {compId: comp} }
 */

import fs from "node:fs";
import path from "node:path";

const API = "https://api.albiononlinebuilds.com";
const LIST = path.resolve("data/builds2.json");
const OUT = path.resolve("data/builds2-comps.json");
const CONCURRENCY = 4;
const DELAY_MS = 120;
const RETRIES = 3;

const list = JSON.parse(fs.readFileSync(LIST, "utf8"));
const slugs = list.builds.map((b) => b.slug);

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
  Origin: "https://www.albiononlinebuilds.com",
  Referer: "https://www.albiononlinebuilds.com/",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url) {
  let lastErr;
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(url, { headers });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
      await sleep(700 * attempt);
    }
  }
  throw lastErr;
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  let done = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
      done++;
      if (done % 50 === 0) console.log(`${done}/${items.length}`);
      await sleep(DELAY_MS);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

console.log(`fetching compIds for ${slugs.length} builds...`);
const failedBuilds = [];
const byBuild = {};

await mapLimit(slugs, CONCURRENCY, async (slug) => {
  try {
    const b = await getJson(`${API}/api/builds/${encodeURIComponent(slug)}`);
    if (b?.compIds?.length) byBuild[slug] = b.compIds;
  } catch (e) {
    failedBuilds.push(slug);
    console.log("FAILED build:", slug, e.message);
  }
});

const compIds = [...new Set(Object.values(byBuild).flat())];
console.log(`builds with comps: ${Object.keys(byBuild).length}, unique comps: ${compIds.length}`);

console.log("fetching comps...");
const comps = {};
const failedComps = [];
await mapLimit(compIds, CONCURRENCY, async (id) => {
  try {
    const c = await getJson(`${API}/api/comp/${encodeURIComponent(id)}`);
    if (c?.id) {
      comps[id] = {
        id: c.id,
        slug: c.slug,
        name: c.name,
        mode: c.mode ?? null,
        modes: Array.isArray(c.modes) && c.modes.length ? c.modes : c.mode ? [c.mode] : [],
        description: typeof c.description === "string" ? c.description : null,
        upvotes: Number(c.upvotes) || 0,
        authorName: typeof c.authorName === "string" ? c.authorName : null,
        tier: c.tierListBadge?.tier ?? null,
        tierList: c.tierListBadge?.title ?? null,
        members: (c.members ?? [])
          .filter((m) => m?.slug)
          .map((m) => ({
            id: m.id,
            slug: m.slug,
            tag: typeof m.tag === "string" ? m.tag : null,
            items: Array.from({ length: 10 }, (_, i) =>
              typeof m.items?.[i] === "string" ? m.items[i] : null
            ),
            upvotes: Number(m.upvotes) || 0,
          })),
      };
    }
  } catch (e) {
    failedComps.push(id);
    console.log("FAILED comp:", id, e.message);
  }
});

const out = {
  source: API,
  fetchedAt: new Date().toISOString(),
  byBuild,
  comps,
};
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n", "utf8");
console.log(
  `saved: ${Object.keys(comps).length} comps, ${Object.keys(byBuild).length} builds -> ${OUT} (${(
    fs.statSync(OUT).size / 1024
  ).toFixed(0)}KB)`
);
if (failedBuilds.length) console.log("failed builds:", failedBuilds.length);
if (failedComps.length) console.log("failed comps:", failedComps.length);
