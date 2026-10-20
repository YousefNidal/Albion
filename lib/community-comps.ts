import compsRaw from "@/data/builds2-comps.json";
import { communityBuilds } from "./data";
import type { CommunityCompView, CommunityCompsData } from "./types";

/**
 * Team compositions for a community build (server-only). Members are enriched
 * with the internal build title / link target so the client component does not
 * need the whole builds dataset.
 */

const data = compsRaw as unknown as CommunityCompsData;
const buildsBySlug = new Map(communityBuilds.map((b) => [b.slug, b]));

export const COMMUNITY_COMPS_FETCHED_AT = data.fetchedAt ? new Date(data.fetchedAt) : null;

export function compsForBuild(slug: string): CommunityCompView[] {
  const ids = [...new Set(data.byBuild[slug] ?? [])];
  const comps: CommunityCompView[] = [];
  for (const id of ids) {
    const comp = data.comps[id];
    if (!comp || comp.members.length === 0) continue;
    comps.push({
      ...comp,
      members: comp.members.map((m) => {
        const build = buildsBySlug.get(m.slug);
        return {
          ...m,
          title: build?.title ?? null,
          internal: Boolean(build),
        };
      }),
    });
  }
  return comps.sort((a, b) => b.upvotes - a.upvotes);
}
