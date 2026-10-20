import Link from "next/link";
import { NavLink } from "./NavLink";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/92 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-8 px-4">
        <Link href="/" className="font-display text-lg tracking-wide text-gold-hi">
          АЛЬБИОН<span className="ml-2 text-muted">/ справочник</span>
        </Link>
        <nav className="flex gap-6">
          <NavLink href="/builds">Билды</NavLink>
          <NavLink href="/builds2">Топ билдов</NavLink>
        </nav>
      </div>
    </header>
  );
}
