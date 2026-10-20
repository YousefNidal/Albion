import buildsRaw from "@/data/builds.raw.json";
import communityRaw from "@/data/builds2.json";
import avalonMapsRaw from "@/data/avalon-maps.json";
import flipPoolRaw from "@/data/flip-pool.json";
import type { AvalonMapsData, Build, CommunityData, PoolEntry } from "./types";

export * from "./labels";

export const builds = buildsRaw as unknown as Build[];
export const buildBySlug = new Map(builds.map((b) => [b.slug, b]));

export const community = communityRaw as unknown as CommunityData;
export const communityBuilds = community.builds;
export const COMMUNITY_FETCHED_AT = new Date(community.fetchedAt);

export const avalonMaps = avalonMapsRaw as unknown as AvalonMapsData;

export const pool = flipPoolRaw as unknown as {
  counts: Record<string, number>;
  items: PoolEntry[];
};
