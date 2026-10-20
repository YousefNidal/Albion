import type { Metadata } from "next";
import { CatalogGrid } from "@/components/CatalogGrid";
import { builds } from "@/lib/data";

export const metadata: Metadata = {
  title: "Каталог билдов",
  description:
    "Билды Albion Online по контенту: Мисты, Хрустальная арена, ZvZ, данжи, фарм фейма — с русскими названиями и ценами.",
};

export default function BuildsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl text-text">Каталог билдов</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        {builds.length} сборок из albiononlinegrind.com, отсортированных по голосам сообщества.
        Названия и описания переведены на русский; оригиналы сохранены на странице билда.
      </p>
      <div className="mt-8">
        <CatalogGrid />
      </div>
    </div>
  );
}
