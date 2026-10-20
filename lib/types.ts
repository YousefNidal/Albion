export interface Build {
  id: number;
  slug: string;
  created_at: string;
  updated_at: string;
  title: string;
  title_ru: string | null;
  description: string | null;
  description_ru: string | null;
  category: string;
  author: string | null;
  tags: string[] | null;
  upvote_count: number | null;
  youtube_ids: string[] | null;
  recommended_traits: string[] | null;
  weapon_id: string | null;
  weapon_skills: string[] | null;
  helmet_id: string | null;
  helmet_skills: string[] | null;
  helmet_id_alt: string | null;
  helmet_alt_skills: string[] | null;
  chest_id: string | null;
  chest_skills: string[] | null;
  chest_id_alt: string | null;
  chest_alt_skills: string[] | null;
  boots_id: string | null;
  boots_skills: string[] | null;
  boots_id_alt: string | null;
  boots_alt_skills: string[] | null;
  cape_id: string | null;
  cape_id_alt: string | null;
  offhand_id: string | null;
  offhand_id_alt: string | null;
  food_id: string | null;
  food_alt: string | null;
  potion_id: string | null;
  potion_alt: string | null;
}

export interface PoolEntry {
  id: string;
  cat: PoolCat;
  tier: number;
  ench: number;
}

export type PoolCat =
  | "weapon"
  | "helmet"
  | "chest"
  | "boots"
  | "cape"
  | "material"
  | "resource"
  | "food"
  | "potion"
  | "mount";

export interface PriceRow {
  item_id: string;
  city: string;
  quality: number;
  sell_price_min: number | null;
  buy_price_max: number | null;
  sell_price_max?: number | null;
  sell_price_avg?: number | null;
  buy_price_min?: number | null;
  buy_price_avg?: number | null;
  timestamp?: string;
}

/** item_id -> city -> quote */
export type Quotes = Map<string, Map<string, Quote>>;

export interface Quote {
  sell: number | null;
  buyMax: number | null;
}

export interface DirectFlip {
  kind: "direct";
  id: string;
  cat: PoolCat;
  tier: number;
  ench: number;
  buyPrice: number;
  buyCity: string;
  sellPrice: number;
  sellCity: string;
  profit: number;
  roi: number;
}

export interface UpgradeFlip {
  kind: "upgrade";
  id: string;
  cat: PoolCat;
  tier: number;
  ench: number;
  baseId: string;
  buyPrice: number;
  buyCity: string;
  mats: { id: string; qty: number; price: number }[];
  matCost: number;
  sellPrice: number;
  sellCity: string;
  profit: number;
  roi: number;
}

export type Flip = DirectFlip | UpgradeFlip;

/** Snapshot of a build from albiononlinebuilds.com (data/builds2.json). */
export interface CommunityBuild {
  slug: string;
  title: string;
  modes: string[];
  tag: string | null;
  /** 10 slots: bag, head, cape, weapon, armor, offhand, potion, shoes, food, mount */
  items: (string | null)[];
  upvotes: number;
  tier: string | null;
  tierList: string | null;
  author: string | null;
  authorRegion: string | null;
  createdAt: number | null;
  updatedAt: number | null;
}

export interface CommunityData {
  source: string;
  fetchedAt: string;
  modes: CommunityMode[];
  builds: CommunityBuild[];
}

export interface CommunityMode {
  slug: string;
  label: string;
}

/** Per-build page payload from albiononlinebuilds.com (data/builds2-details.json). */
export interface CommunityBuildDetail extends CommunityBuild {
  description: string;
  /** Chosen spells per slot (usually only weapon/armor/helmet/boots). */
  spells: string[][];
  /** Chosen passive per slot. */
  passives: (string | null)[];
  missing?: boolean;
}

export interface CommunityDetailsData {
  fetchedAt: string;
  builds: Record<string, CommunityBuildDetail>;
}

/** Team composition ("комп") from api.albiononlinebuilds.com. */
export interface CommunityCompMember {
  id: string;
  slug: string;
  tag: string | null;
  items: (string | null)[];
  upvotes: number;
}

export interface CommunityComp {
  id: string;
  slug: string;
  name: string;
  mode: string | null;
  modes: string[];
  description: string | null;
  upvotes: number;
  authorName: string | null;
  tier: string | null;
  tierList: string | null;
  members: CommunityCompMember[];
}

/** Member enriched for rendering (title/internal link resolved server-side). */
export interface CommunityCompMemberView extends CommunityCompMember {
  title: string | null;
  internal: boolean;
}

export interface CommunityCompView extends Omit<CommunityComp, "members"> {
  members: CommunityCompMemberView[];
}

export interface CommunityCompsData {
  source: string;
  fetchedAt: string;
  byBuild: Record<string, string[]>;
  comps: Record<string, CommunityComp>;
}
