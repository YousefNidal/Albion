import Link from "next/link";
import { buildCatRu, buildTitle, itemIcon, itemRu } from "@/lib/labels";
import type { Build } from "@/lib/types";

export function BuildCard({ build }: { build: Build }) {
  const weapon = build.weapon_id;
  return (
    <Link
      href={`/builds/${build.slug}`}
      className="group flex gap-4 rounded-lg border border-line bg-panel p-4 transition-colors hover:border-gold/60"
    >
      <div className="grid h-16 w-16 shrink-0 place-items-center rounded border border-line bg-ink-2">
        {weapon && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={itemIcon(weapon)}
            alt=""
            width={48}
            height={48}
            loading="lazy"
            className="h-12 w-12"
          />
        )}
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-base leading-snug text-text group-hover:text-gold-hi">
          {buildTitle(build)}
        </h3>
        <p className="mt-1 truncate text-xs text-muted">
          {buildCatRu(build.category)}
          {build.author ? ` · ${build.author}` : ""}
        </p>
        <p className="mt-1 text-xs text-muted">
          <span className="num text-gold/90">▲ {build.upvote_count ?? 0}</span>
          {weapon && <span className="ml-3">{itemRu(weapon) ?? ""}</span>}
        </p>
      </div>
    </Link>
  );
}
