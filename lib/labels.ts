import communityModesRaw from "@/data/builds2-modes.json";
import itemsLocaleRaw from "@/data/items-locale.json";
import spellsLocaleRaw from "@/data/spells-locale.json";
import type { AvalonResourceKey, Build, CommunityMode, PoolCat } from "./types";

/**
 * Pure label/icon helpers shared by server and client components.
 * Kept in its own module so client bundles do not pull the big datasets
 * (builds, flip pool, build details) that live in lib/data.ts.
 */

const itemsLocale = itemsLocaleRaw as Record<string, string>;
const spellsLocale = spellsLocaleRaw as Record<string, string>;

export function itemRu(id: string): string | null {
  return itemsLocale[id] ?? null;
}

export function spellRu(id: string): string | null {
  return spellsLocale[id] ?? null;
}

/** "T8_2H_DUALSWORD" -> "2H Dualsword" (for ids without a RU name). */
export function prettyItemId(id: string): string {
  return id
    .replace(/^T\d+_/, "")
    .replace(/@\d+$/, "")
    .split("_")
    .map((w) => (w.length > 2 ? w[0] + w.slice(1).toLowerCase() : w))
    .join(" ");
}

/** RU name with graceful fallback to a prettified id like T8_MAIN_AXE. */
export function itemName(id: string): string {
  return itemsLocale[id] ?? prettyItemId(id);
}

/** RU spell/passive name, falling back to a prettified internal id. */
export function spellName(id: string): string {
  return spellsLocale[id] ?? prettyItemId(id);
}

export function itemIcon(id: string): string {
  return `https://render.albiononline.com/v1/item/${encodeURIComponent(id)}.png`;
}

export function spellIcon(id: string): string {
  return `https://render.albiononline.com/v1/spell/${encodeURIComponent(id)}.png`;
}

export const communityModes = communityModesRaw as unknown as CommunityMode[];
const communityModeLabels = new Map(communityModes.map((m) => [m.slug, m.label]));

export function communityModeRu(slug: string): string {
  if (slug === "uncategorized") return "Без категории";
  return communityModeLabels.get(slug) ?? slug;
}

/** Slot order in albiononlinebuilds.com item arrays. */
export const GEAR_SLOT_RU = [
  "Сумка",
  "Шлем",
  "Плащ",
  "Оружие",
  "Броня",
  "Оффхенд",
  "Зелье",
  "Ботинки",
  "Еда",
  "Маунт",
] as const;

export const POOL_CAT_RU: Record<PoolCat, string> = {
  weapon: "Оружие",
  helmet: "Шлемы",
  chest: "Броня (грудь)",
  boots: "Ботинки",
  cape: "Плащи",
  material: "Руны, души, реликвии",
  resource: "Ресурсы",
  food: "Еда",
  potion: "Зелья",
  mount: "Маунты",
};

export const POOL_CATS = Object.keys(POOL_CAT_RU) as PoolCat[];

export const BUILD_CAT_RU: Record<string, string> = {
  FAME_FARM_SOLO: "Фарм фейма (соло)",
  MISTS_SOLO: "Мисты (соло)",
  OPEN_WORLD: "Открытый мир",
  CORRUPTED_DUNGEON: "Искажённые данжи",
  FAME_FARM_GROUP: "Фарм фейма (группа)",
  GANK_SOLO: "Ганк (соло)",
  SMALL_SCALE: "Смаллскейл",
  CRYSTAL_ARENA: "Хрустальная арена",
  FAME_FARM_GROUP_AVALON: "Фарм в Авалоне (группа)",
  ZVZ: "ZvZ",
  GANK_GROUP: "Ганк (группа)",
  HELLGATE_2V2: "Хеллгейт 2v2",
  MISTS_DUO: "Мисты (дуо)",
  TRACKING_SOLO: "Трекинг (соло)",
  ABYSSAL_DEPTHS_2V2: "Бездна 2v2",
  ABYSSAL_DEPTHS_3V3: "Бездна 3v3",
  GATHERING: "Добыча",
  GANK_DUO: "Ганк (дуо)",
  BOMB_SQUAD: "Бомб-сквад",
  WORLD_BOSS: "Мировые боссы",
  HCE: "HCE",
  HELLGATE_5V5: "Хеллгейт 5v5",
  TRACKING_GROUP: "Трекинг (группа)",
  CRYSTAL_ARENA_1V1: "Хрустальная арена 1v1",
};

export const buildCatRu = (c: string): string => BUILD_CAT_RU[c] ?? c;

export const TRAIT_RU: Record<string, string> = {
  "cooldown-rate": "Скорость перезарядки",
  "ability-damage": "Урон от способностей",
  "defense-vs-all": "Защита от всего",
  mob_fame: "Фейм мобов",
  "resilience-penetration": "Пробитие стойкости",
  "max-health": "Здоровье",
};

export function buildTitle(b: Build): string {
  return b.title_ru || b.title;
}

export function buildDesc(b: Build): string | null {
  return b.description_ru || b.description;
}

export const AVALON_RESOURCE_RU: Record<AvalonResourceKey, string> = {
  green: "Зелёный сундук",
  blue: "Синий сундук",
  rock: "Камень",
  wood: "Дерево",
  hide: "Шкура",
  ore: "Руда",
  dg_solo: "Соло-подземелье",
  dg_group: "Групповое подземелье",
};

export const AVALON_RESOURCE_ORDER: AvalonResourceKey[] = [
  "green",
  "blue",
  "rock",
  "wood",
  "hide",
  "ore",
  "dg_solo",
  "dg_group",
];

export const AVALON_TIERS = ["T4", "T6", "T8"] as const;

/** Local icon in public/avalon-icons. */
export function avalonIcon(key: AvalonResourceKey): string {
  return `/avalon-icons/${key}.webp`;
}

/** Map preview image hosted by the source site. */
export function avalonMapImage(name: string): string {
  return `https://www.albiononlinebuilds.com/avalon-maps/${encodeURIComponent(name)}.webp`;
}
