import Link from "next/link";
import { BuildCard } from "@/components/BuildCard";
import { builds, community, communityBuilds } from "@/lib/data";

export default function HomePage() {
  const top = [...builds]
    .sort((a, b) => (b.upvote_count ?? 0) - (a.upvote_count ?? 0))
    .slice(0, 6);

  const stats = [
    { n: String(builds.length), l: "билдов в каталоге" },
    { n: String(communityBuilds.length), l: "сборок от сообщества" },
    { n: String(community.modes.length), l: "режимов игры" },
    { n: "0", l: "регистраций и ключей" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* hero */}
      <section className="grid items-center gap-10 py-14 md:grid-cols-[1.15fr_1fr] md:py-20">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold/80">
            Неофициальный справочник Albion Online
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-text md:text-5xl">
            Билды для любого контента
            <span className="block text-gold-hi">и составы команд</span>
          </h1>
          <p className="mt-5 max-w-xl leading-relaxed text-muted">
            Проверенные сборки с русскими названиями — от Мистов и Хрустальной арены до ZvZ. Топ
            билдов сообщества с разбором слотов, умений и пассивов, а также готовые компы для
            группового PvP. Всё в браузере, без регистрации.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/builds"
              className="rounded bg-gold px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-gold-hi"
            >
              Каталог билдов
            </Link>
            <Link
              href="/builds2"
              className="rounded border border-line px-5 py-2.5 text-sm font-bold text-text transition-colors hover:border-gold/60 hover:text-gold-hi"
            >
              Топ билдов
            </Link>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-4 border-t border-line pt-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.l}>
                <dt className="num text-2xl text-gold-hi">{s.n}</dt>
                <dd className="text-xs leading-snug text-muted">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-lg border border-line bg-panel p-5">
          <h2 className="font-display text-lg text-gold-hi">Что внутри</h2>
          <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted">
            <li>· Билды с русскими названиями предметов и умений</li>
            <li>· Разбор экипировки в виде манекена и пассивов</li>
            <li>· Топ сборок сообщества по голосам, с фильтром по режимам</li>
            <li>· Составы команд для группового PvP с ролями участников</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/builds2"
              className="rounded border border-line bg-ink-2 px-3 py-1.5 text-xs text-text transition-colors hover:border-gold/50 hover:text-gold-hi"
            >
              Топ билдов →
            </Link>
            <Link
              href="/builds"
              className="rounded border border-line bg-ink-2 px-3 py-1.5 text-xs text-text transition-colors hover:border-gold/50 hover:text-gold-hi"
            >
              Каталог →
            </Link>
          </div>
        </div>
      </section>

      {/* popular builds */}
      <section className="border-t border-line py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-text">Популярные билды</h2>
            <p className="mt-1 text-sm text-muted">
              Сборки с наибольшим числом голосов от сообщества
            </p>
          </div>
          <Link href="/builds" className="shrink-0 text-sm text-gold hover:text-gold-hi">
            Все {builds.length} →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {top.map((b) => (
            <BuildCard key={b.slug} build={b} />
          ))}
        </div>
      </section>

      {/* how it works */}
      <section className="border-t border-line py-12">
        <h2 className="font-display text-2xl text-text">Как это работает</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <Step
            n="01"
            title="Выбирайте билд"
            text="Каталог отфильтрован по контенту: Мисты, арены, данжи, ZvZ. Внутри — русские названия предметов, состав сета и способности."
          />
          <Step
            n="02"
            title="Изучайте разбор"
            text="На странице билда — раскладка экипировки «манекеном», выбранные умения и пассивы, описание от автора."
          />
          <Step
            n="03"
            title="Собирайте группу"
            text="Для групповых билдов показан состав команды: роли участников и их сборки, чтобы собрать сыгранный комп."
          />
        </div>
      </section>
    </div>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel p-5">
      <span className="num text-xs text-gold/70">{n}</span>
      <h3 className="mt-2 font-display text-lg text-gold-hi">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
    </div>
  );
}
