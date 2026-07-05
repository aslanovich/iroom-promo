"use client";

import { useState } from "react";
import { CartDrawer } from "@/components/cart-drawer";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { useBodyState } from "@/components/use-body-state";
import type { CmsContent } from "@/lib/cms";

export function PrivacyPage({ content }: { content?: CmsContent }) {
  const [isCartOpen, setCartOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);

  useBodyState({ pageClass: "privacy-page", isCartOpen, isMenuOpen });

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
      <Footer settings={content?.settings} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
