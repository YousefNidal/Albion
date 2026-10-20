import { CommunityList } from "./CommunityList";
import { CommunityTabs } from "./CommunityTabs";
import { community, communityBuilds } from "@/lib/data";
import type { CommunityBuild } from "@/lib/types";

const dateFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function CommunityShell({
  builds,
  active,
}: {
  builds: CommunityBuild[];
  active: string;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="space-y-4">
        <h1 className="font-display text-4xl tracking-tight text-text sm:text-5xl">
          Топ билдов Albion Online
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted">
          Билды сообщества по голосам за всё время — соло PvP, групповые подземелья, коррапты и
          другое. Данные{" "}
          <a
            href={community.source}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:text-gold-hi"
          >
            albiononlinebuilds.com
          </a>{" "}
          на {dateFmt.format(new Date(community.fetchedAt))}. Откройте карточку — там полный разбор
          слотов: экипировка, выбранные умения и пассивы, описание от автора.
        </p>
      </div>

      <div className="mt-8">
        <CommunityTabs modes={community.modes} active={active} />
        <p className="mt-3 text-xs text-muted">
          найдено: <span className="num text-gold">{builds.length}</span> из{" "}
          <span className="num">{communityBuilds.length}</span>
        </p>
        <div className="mt-4">
          <CommunityList builds={builds} />
        </div>
      </div>

      <p className="mt-8 text-xs leading-relaxed text-muted">
        Голоса, тир-листы и состав билдов принадлежат их авторам и сайту albiononlinebuilds.com;
        здесь — статический снимок для удобного просмотра. Пустые слоты на карточке означают, что
        предмет в сборке не указан. Чтобы освежить данные, запустите{" "}
        <code className="rounded bg-ink-2 px-1 py-0.5 text-[11px] text-text">npm run fetch:builds2</code>{" "}
        и пересоберите сайт.
      </p>
    </div>
  );
}
