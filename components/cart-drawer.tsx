"use client";

import Link from "next/link";
import { formatPrice, useCart } from "@/components/cart-context";

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, quantity, total, changeQty, remove } = useCart();

  return (
    <aside className={`cart-panel${isOpen ? " is-open" : ""}`} aria-hidden={!isOpen} onClick={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className="cart-card">
        <div className="cart-scroll">
          <div className="cart-head">
            <h2>
              Корзина <span>{quantity || ""}</span>
            </h2>
            <button type="button" onClick={onClose}>
              Закрыть
            </button>
          </div>
          {items.length ? null : <p className="cart-empty">Добавьте товары из витрины, чтобы перейти к оформлению заказа.</p>}
          <ul className="cart-list">
            {items.map((item) => (
              <li className="cart-item" data-id={item.id} key={item.id}>
                <div className="cart-item-main">
                  <div className="cart-thumb">
                    <img src={item.image} alt="" />
                  </div>
                  <div className="cart-copy">
                    <p>{item.name}</p>
                    <small>{item.description}</small>
                    <div className="qty-control" aria-label={`Количество ${item.name}`}>
                      <button type="button" onClick={() => changeQty(item.id, -1)}>
                        -
                      </button>
                      <span>{item.qty}</span>
                      <button type="button" onClick={() => changeQty(item.id, 1)}>
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <div className="cart-item-side">
                  <strong>{formatPrice(item.price * item.qty)}</strong>
                  <button type="button" onClick={() => remove(item.id)}>
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="cart-total">
            <span>Итого</span>
            <strong>{formatPrice(total)}</strong>
          </div>
        </div>
        <div className="cart-footer">
          <Link className={`cart-checkout${items.length ? "" : " is-disabled"}`} href="/checkout">
            К оформлению
          </Link>
        </div>
      </div>
    </aside>
  );
}
