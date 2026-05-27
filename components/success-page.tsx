"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { promoCode } from "@/data/catalog";
import type { CmsContent } from "@/lib/cms";
import { CartDrawer } from "@/components/cart-drawer";
import { Footer } from "@/components/footer";
import { useCart } from "@/components/cart-context";
import { Header } from "@/components/header";

export function SuccessPage({ content }: { content?: CmsContent }) {
  const { clear } = useCart();
  const actionPromoCode = content?.settings.promoCode || promoCode;
  const [isCartOpen, setCartOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    clear();
  }, [clear]);

  useEffect(() => {
    document.body.classList.add("success-page");
    document.body.classList.toggle("is-cart-open", isCartOpen);
    document.body.classList.toggle("is-menu-open", isMenuOpen);
    return () => {
      document.body.classList.remove("success-page", "is-cart-open", "is-menu-open");
    };
  }, [isCartOpen, isMenuOpen]);

  return (
    <>
      <Header
        withCategories={false}
        sections={content?.sections}
        settings={content?.settings}
        isMenuOpen={isMenuOpen}
        onCartOpen={() => setCartOpen(true)}
        onMenuClose={() => setMenuOpen(false)}
        onMenuToggle={() => setMenuOpen((value) => !value)}
      />
      <main className="success-main">
        <h1>Заказ создан</h1>
        <p>Благодарим вас за оформление заказа в iRoom.</p>
        <p>Мы вышлем вам электронное письмо со ссылкой для оплаты, включая стоимость доставки.</p>
        <p>Также даём вам промокод для участия в акции</p>
        <strong className="success-promo-code">{actionPromoCode}</strong>
        <Link className="outline-button" href="/">На Главную</Link>
      </main>
      <Footer settings={content?.settings} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
