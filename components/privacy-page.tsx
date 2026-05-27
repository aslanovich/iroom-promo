"use client";

import { useEffect, useState } from "react";
import { CartDrawer } from "@/components/cart-drawer";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export function PrivacyPage() {
  const [isCartOpen, setCartOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add("privacy-page");
    document.body.classList.toggle("is-cart-open", isCartOpen);
    document.body.classList.toggle("is-menu-open", isMenuOpen);
    return () => {
      document.body.classList.remove("privacy-page", "is-cart-open", "is-menu-open");
    };
  }, [isCartOpen, isMenuOpen]);

  return (
    <>
      <Header
        withCategories={false}
        isMenuOpen={isMenuOpen}
        onCartOpen={() => setCartOpen(true)}
        onMenuClose={() => setMenuOpen(false)}
        onMenuToggle={() => setMenuOpen((value) => !value)}
      />
      <main className="privacy-main">
        <h1>Политика конфиденциальности</h1>
        <p>
          Настоящая страница является временной заглушкой. Здесь будет размещена политика обработки персональных данных
          iRoom, включая состав собираемых данных, цели обработки, сроки хранения и порядок обращения пользователей.
        </p>
        <p>
          Мы используем данные, которые пользователь оставляет при оформлении заказа, только для связи, подготовки заказа,
          доставки, оплаты и клиентской поддержки. Полный юридический текст будет добавлен перед публичным запуском.
        </p>
      </main>
      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
