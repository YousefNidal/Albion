import detailsRaw from "@/data/builds2-details.json";
import { communityBuilds } from "./data";
import type { CommunityBuildDetail, CommunityDetailsData } from "./types";

/**
 * Server-only access to the per-build snapshot (items + chosen spells/passives
 * + description). Falls back to the list snapshot if a build has no detail yet.
 */

const details = detailsRaw as unknown as CommunityDetailsData;

export const COMMUNITY_DETAILS_FETCHED_AT = details.fetchedAt
  ? new Date(details.fetchedAt)
  : null;

export const communityDetailSlugs = communityBuilds.map((b) => b.slug);

export function communityBuildDetail(slug: string): CommunityBuildDetail | null {
  const build = communityBuilds.find((b) => b.slug === slug);
  if (!build) return null;
  const detail = details.builds[slug];
  if (detail && !detail.missing) return detail;
  return {
    ...build,
    description: "",
    spells: Array.from({ length: 10 }, () => []),
    passives: Array.from({ length: 10 }, () => null),
  };
}
