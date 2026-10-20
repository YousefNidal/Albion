import type { Metadata } from "next";
import { AvalonMaps } from "@/components/AvalonMaps";
import { avalonMaps } from "@/lib/data";

export const metadata: Metadata = {
  title: "Карты Дорог Авалона",
  description:
    "Все 400 карт Дорог Авалона Albion Online: поиск по названию, фильтр по тиру и ресурсам — сундуки, камень, дерево, шкура, руда и подземелья.",
};

export default function AvalonMapsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="space-y-4">
        <h1 className="font-display text-4xl tracking-tight text-text sm:text-5xl">
          Карты Дорог Авалона
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted">
          Все <span className="num text-gold">{avalonMaps.maps.length}</span> карт Дорог Авалона:
          поиск по названию и фильтр по тиру для маршрутов к ресурсам, сундукам и подземельям.
          Данные{" "}
          <a
            href={avalonMaps.source}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:text-gold-hi"
          >
            albiononlinebuilds.com
          </a>
          .
        </p>
      </div>

      <div className="mt-8">
        <AvalonMaps maps={avalonMaps.maps} />
      </div>

      <section className="mt-12 grid gap-6 border-t border-line pt-10 md:grid-cols-3">
        <InfoCard
          title="Тиры карт"
          text="Карты бывают трёх тиров — T4, T6 и T8 — от них зависят качество ресурсов и сложность подземелий. Выше тир — лучше лут и выше конкуренция."
        />
        <InfoCard
          title="Ресурсы"
          text="На карте могут быть узлы добычи (камень, дерево, шкура, руда), сундуки (зелёный и синий) и входы в подземелья (соло или группа). Цифры на карточке показывают количество узлов каждого типа."
        />
        <InfoCard
          title="Как пользоваться"
          text="Ищите карту по названию, фильтруйте по тиру или щёлкайте по иконкам ресурсов, чтобы оставить только карты с ними. Карточка ведёт на страницу карты с полным изображением."
        />
      </section>
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel p-5">
      <h2 className="font-display text-lg text-gold-hi">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
    </div>
  );
}
