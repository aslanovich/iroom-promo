"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { promoCode, type Product } from "@/data/catalog";
import type { CmsContent } from "@/lib/cms";
import { CartDrawer } from "@/components/cart-drawer";
import { formatPrice, useCart } from "@/components/cart-context";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProductModal } from "@/components/storefront";
import { useBodyState } from "@/components/use-body-state";

export function CheckoutPage({ content }: { content?: CmsContent }) {
  const { items, total } = useCart();
  const actionPromoCode = content?.settings.promoCode || promoCode;
  const [isCartOpen, setCartOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const orderDetails = useMemo(
    () => items.map((item) => `${item.name} x ${item.qty} - ${formatPrice(item.price * item.qty)}`).join("\n"),
    [items],
  );

  useBodyState({ pageClass: "checkout-page", isCartOpen, isMenuOpen, isModalOpen: Boolean(activeProduct) });

  const handlePhone = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, "").replace(/^8/, "7").slice(0, 11);
    const rest = digits.startsWith("7") ? digits.slice(1) : digits;
    const parts = [rest.slice(0, 3), rest.slice(3, 6), rest.slice(6, 8), rest.slice(8, 10)].filter(Boolean);
    event.target.value = `+7${parts.length ? ` ${parts.join(" ")}` : ""}`;
  };

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
      <main className="checkout-main">
        <h1>Оформление заказа</h1>
        <div className="checkout-grid">
          <form className="checkout-form" action="/api/order" method="POST">
            <input type="hidden" name="order_details" value={orderDetails} />
            <input type="hidden" name="order_total" value={formatPrice(total)} />
            <input type="hidden" name="action_promo_code" value={actionPromoCode} />

            <div className="field-row">
              <label className="line-field">
                <input name="name" type="text" placeholder=" " required />
                <span>Имя</span>
              </label>
              <label className="line-field">
                <input name="phone" type="tel" inputMode="tel" placeholder=" " required onChange={handlePhone} />
                <span>+7</span>
              </label>
            </div>
            <div className="field-row">
              <label className="line-field">
                <input name="email" type="email" placeholder=" " required />
                <span>Email</span>
              </label>
              <label className="line-field">
                <input name="telegram" type="text" placeholder=" " />
                <span>Телеграм (если есть)</span>
              </label>
            </div>

            <fieldset className="option-group">
              <legend>Доставка</legend>
              <label><input type="radio" name="delivery" value="Самовывоз" /> Самовывоз</label>
              <label><input type="radio" name="delivery" value="По Республике Дагестан" defaultChecked /> По Республике Дагестан</label>
              <label><input type="radio" name="delivery" value="По России" /> По России</label>
            </fieldset>

            <label className="line-field full">
              <input name="city" type="text" placeholder=" " />
              <span>Город</span>
            </label>
            <label className="line-field full">
              <input name="address" type="text" placeholder=" " />
              <span>Адрес доставки</span>
            </label>
            <label className="line-field full">
              <input name="promo" type="text" placeholder=" " />
              <span>Промокод</span>
            </label>

            <div className="payment-note">
              <strong>Сейчас оплата не требуется</strong>
              <p>После оформления заказа мы вышлем вам ссылку для оплаты по Email и в телеграм, включая стоимость доставки.</p>
            </div>

            <button className="checkout-submit" type="submit">Оформить заказ</button>
            <p className="legal-note">
              Нажимая кнопку Оформить заказ вы соглашаетесь с условиями{" "}
              <Link href="/privacy">Политики конфиденциальности</Link>, а также даете своё согласие на обработку{" "}
              <Link href="/privacy">персональных данных</Link>
            </p>
          </form>

          <aside className="order-summary">
            <div className="checkout-summary-card">
              <ul className="checkout-summary-list">
                {items.length ? items.map((item) => (
                  <li key={item.id}>
                    <button type="button" onClick={() => setActiveProduct(item)}>
                      <span>{item.name}</span>
                      <small>x {item.qty}</small>
                      <strong>{formatPrice(item.price * item.qty)}</strong>
                    </button>
                  </li>
                )) : <li className="summary-empty">Вернитесь в каталог и добавьте товары.</li>}
              </ul>
              <div className="cart-total summary-total">
                <span>Итого</span>
                <strong>{formatPrice(total)}</strong>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer settings={content?.settings} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
      <ProductModal product={activeProduct} onClose={() => setActiveProduct(null)} readonly />
    </>
  );
}
