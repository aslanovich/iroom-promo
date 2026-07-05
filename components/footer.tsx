import Link from "next/link";
import type { SiteSettings } from "@/lib/cms";

export function Footer({ settings }: { settings?: SiteSettings }) {
  const logo = settings?.logo || "/assets/iroom_logo.svg";
  const siteName = settings?.siteName || "iRoom";
  const email = settings?.email || "admin@iroom.su";

  return (
    <footer className="site-footer">
      <Link className="footer-brand" href="/" aria-label="iRoom">
        <img src={logo} alt={siteName} />
      </Link>
      <span>{settings?.footerWorkHours || "Ежедневно с 10:00 до 21:00"}</span>
      <a href={`mailto:${email}`}>{email}</a>
      <Link href="/privacy">Политика конфиденциальности</Link>
      <span>{settings?.footerCopyright || "©Айрум. Все права защищены"}</span>
      <a href="#top" aria-label="Наверх">↑</a>
    </footer>
  );
}
