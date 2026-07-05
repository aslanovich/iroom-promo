"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { promoText, sections as fallbackSections, type ProductSection } from "@/data/catalog";
import type { SiteSettings } from "@/lib/cms";
import { phoneHref } from "@/lib/format";
import { useCart } from "@/components/cart-context";

type HeaderProps = {
  withCategories?: boolean;
  isMenuOpen?: boolean;
  onMenuToggle?: () => void;
  onCartOpen?: () => void;
  onMenuClose?: () => void;
  sections?: ProductSection[];
  settings?: SiteSettings;
};

export function Header({
  withCategories = true,
  isMenuOpen = false,
  onMenuToggle,
  onCartOpen,
  onMenuClose,
  sections = fallbackSections,
  settings,
}: HeaderProps) {
  const { quantity } = useCart();
  const pathname = usePathname();
  const hrefFor = (id: string) => (pathname === "/" ? `#${id}` : `/#${id}`);
  const phone = settings?.phone || "+7 495 540 49 00";
  const email = settings?.email || "admin@iroom.su";
  const logo = settings?.logo || "/assets/iroom_logo.svg";
  const tickerText = settings?.promoTicker || promoText;
  const mobileSections = sections.slice(0, 3);

  return (
    <header className="site-header">
      <div className="header-primary">
        <Link className="brand" href="/">
          <img src={logo} alt={settings?.siteName || "iRoom"} />
        </Link>
        {withCategories ? (
          <nav className="header-nav" aria-label="Категории товаров">
            {sections.map((section) => (
              <a key={section.id} href={hrefFor(section.id)}>
                {section.navTitle}
              </a>
            ))}
          </nav>
        ) : null}
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          onClick={onMenuToggle}
        >
          <span>Меню</span>
          <i aria-hidden="true" />
        </button>
        <div className="header-actions">
          <a href={phoneHref(phone)}>{phone}</a>
          <button className={`cart-link${quantity > 0 ? " is-active" : ""}`} type="button" onClick={onCartOpen}>
            Корзина <span className={`cart-count${quantity ? "" : " is-empty"}`}>{quantity || ""}</span>
          </button>
        </div>
      </div>

      <nav className="mobile-menu-panel" id="mobile-menu" aria-label="Мобильное меню">
        <div className="mobile-menu-links">
          {mobileSections.map((section) => (
            <a key={section.id} href={hrefFor(section.id)} onClick={onMenuClose}>
              {section.navTitle}
            </a>
          ))}
        </div>
        <div className="mobile-menu-contacts">
          <a href={phoneHref(phone)}>{phone}</a>
          <a href={`mailto:${email}`}>{email}</a>
        </div>
      </nav>

      <div className="mobile-top-panel">
        <Link className="mobile-brand" href="/" aria-label={settings?.siteName || "iRoom"}>
          <img src={logo} alt={settings?.siteName || "iRoom"} />
        </Link>
      </div>

      <div className={`mobile-bottom-bar${quantity > 0 ? " has-cart" : ""}`}>
        <div className="mobile-bottom-menu" aria-label="Быстрое меню">
          <button
            className="mobile-bottom-tab mobile-menu-toggle"
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={onMenuToggle}
          >
            <img src="/assets/categories.svg" alt="" />
            <span>Каталог</span>
          </button>
          <a className="mobile-bottom-tab" href={phoneHref(phone)}>
            <img src="/assets/call.svg" alt="" />
            <span>Позвонить</span>
          </a>
          <a className="mobile-bottom-tab" href={hrefFor("contacts")}>
            <img src="/assets/location.svg" alt="" />
            <span>Маршрут</span>
          </a>
        </div>
        {quantity > 0 ? (
          <button className="mobile-bottom-tab mobile-cart-toggle" type="button" onClick={onCartOpen}>
            <img src="/assets/cart.svg" alt="" />
            <span>Корзина</span>
            <b>{quantity}</b>
          </button>
        ) : null}
        <span className="mobile-cart-fly-target" aria-hidden="true" />
      </div>

      <div className="promo-ticker" aria-label="Информация по акции">
        <div className="promo-ticker-track">
          <span>{tickerText}</span>
          <span>{tickerText}</span>
        </div>
      </div>
    </header>
  );
}
