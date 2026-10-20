export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto max-w-6xl px-4 py-8 text-xs leading-relaxed text-muted">
        <p>
          Сайт не связан с Sandbox Interactive GmbH. Билды предоставлены{" "}
          <a
            href="https://albiononlinegrind.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold/90 hover:text-gold-hi"
          >
            albiononlinegrind.com
          </a>
          , а топ билдов и составы команд — из{" "}
          <a
            href="https://www.albiononlinebuilds.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold/90 hover:text-gold-hi"
          >
            albiononlinebuilds.com
          </a>
          . Изображения предметов принадлежат Sandbox Interactive GmbH.
        </p>
        <p className="mt-2">© {new Date().getFullYear()} · Сделано для игроков Альбиона</p>
      </div>
    </footer>
  );
}
