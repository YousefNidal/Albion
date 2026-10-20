import buildsRaw from "@/data/builds.raw.json";
import communityRaw from "@/data/builds2.json";
import flipPoolRaw from "@/data/flip-pool.json";
import type { Build, CommunityData, PoolEntry } from "./types";

export * from "./labels";

export const builds = buildsRaw as unknown as Build[];
export const buildBySlug = new Map(builds.map((b) => [b.slug, b]));

export const community = communityRaw as unknown as CommunityData;
export const communityBuilds = community.builds;
export const COMMUNITY_FETCHED_AT = new Date(community.fetchedAt);

export const pool = flipPoolRaw as unknown as {
  counts: Record<string, number>;
  items: PoolEntry[];
};
