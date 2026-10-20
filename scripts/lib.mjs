const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function fetchJSON(url, { retries = 4, backoffMs = 5000, timeout = 30000, headers = {} } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "albionwebb-static-site/1.0 (build snapshot script)", ...headers },
        signal: AbortSignal.timeout(timeout),
      });
      if (res.status === 429) {
        if (attempt >= retries) throw new Error(`429 rate limited: ${url}`);
        const wait = backoffMs * (attempt + 1);
        console.log(`  429, waiting ${wait / 1000}s...`);
        await sleep(wait);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
      return await res.json();
    } catch (err) {
      if (attempt >= retries) throw err;
      console.log(`  retry ${attempt + 1} after error: ${err.message}`);
      await sleep(backoffMs * (attempt + 1));
    }
  }
}

export async function downloadFile(url, dest, { timeout = 300000 } = {}) {
  const fs = await import("node:fs");
  const res = await fetch(url, {
    headers: { "User-Agent": "albionwebb-static-site/1.0" },
    signal: AbortSignal.timeout(timeout),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return buf.length;
}

export { sleep };
