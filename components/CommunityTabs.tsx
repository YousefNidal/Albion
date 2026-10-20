import Link from "next/link";

export function CommunityTabs({
  modes,
  active,
}: {
  modes: { slug: string; label: string }[];
  active: string;
}) {
  return (
    <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line pb-3 text-sm">
      <Link
        href="/builds2"
        className={
          active === "all" ? "text-gold-hi" : "text-muted transition-colors hover:text-text"
        }
      >
        Все билды
      </Link>
      {modes.map((m) => (
        <Link
          key={m.slug}
          href={`/builds2/${m.slug}`}
          className={
            active === m.slug ? "text-gold-hi" : "text-muted transition-colors hover:text-text"
          }
        >
          {m.label}
        </Link>
      ))}
    </nav>
  );
}
