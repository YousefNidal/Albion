import { GEAR_SLOT_RU, itemIcon, itemName } from "@/lib/labels";
import type { CommunityBuildDetail } from "@/lib/types";

/**
 * Paper-doll layout of a build:
 *
 *   [Сумка]   [Шлем]    [Плащ]
 *   [Оффхенд] [Броня]   [Оружие]
 *   [Зелье]   [Ботинки] [Еда]
 *               [Маунт]
 */
const ROWS = [
  [0, 1, 2],
  [5, 4, 3],
  [6, 7, 8],
  [9],
];

export function BuildPaperDoll({ build }: { build: CommunityBuildDetail }) {
  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      {ROWS.map((row) => (
        <div key={row.join()} className="grid grid-cols-3 gap-x-3">
          {row.length === 1 ? (
            <>
              <div />
              <DollSlot build={build} index={row[0]} />
              <div />
            </>
          ) : (
            row.map((index) => <DollSlot key={index} build={build} index={index} />)
          )}
        </div>
      ))}
    </div>
  );
}

function DollSlot({ build, index }: { build: CommunityBuildDetail; index: number }) {
  const id = build.items[index];
  const name = id ? itemName(id) : null;
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span className="text-[10px] uppercase tracking-wide text-muted">
        {GEAR_SLOT_RU[index]}
      </span>
      <span
        className={`grid h-16 w-16 place-items-center rounded-lg sm:h-[72px] sm:w-[72px] ${
          id ? "border border-line bg-panel-2" : "border border-dashed border-line/70 bg-ink-2/30"
        }`}
        title={name ?? `${GEAR_SLOT_RU[index]}: не указано`}
      >
        {id ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={itemIcon(id)}
            alt=""
            width={64}
            height={64}
            loading="lazy"
            className="h-14 w-14 sm:h-16 sm:w-16"
          />
        ) : (
          <span className="text-[10px] text-muted/50">пусто</span>
        )}
      </span>
      <span className="min-h-[2.4em] text-xs leading-tight text-text">
        {name ?? <span className="text-muted/50">—</span>}
      </span>
    </div>
  );
}
