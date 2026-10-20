import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <p className="font-display text-6xl text-gold-hi">404</p>
      <h1 className="mt-4 font-display text-2xl text-text">Страница не найдена</h1>
      <p className="mt-2 text-sm text-muted">
        Возможно, билд удалён или адрес набран с ошибкой.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded bg-gold px-5 py-2.5 text-sm font-bold text-ink hover:bg-gold-hi"
      >
        На главную
      </Link>
    </div>
  );
}
