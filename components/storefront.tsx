"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CmsContent, PromoBannerContent } from "@/lib/cms";
import { sections as fallbackSections, type Product } from "@/data/catalog";
import { CartDrawer } from "@/components/cart-drawer";
import { formatPrice, useCart } from "@/components/cart-context";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

const flyProductToCart = (image: HTMLImageElement | null) => {
  const cartTarget = document.querySelector<HTMLElement>(".cart-link");
  if (!image || !cartTarget) return;

  const start = image.getBoundingClientRect();
  const end = cartTarget.getBoundingClientRect();
  const clone = image.cloneNode(true) as HTMLImageElement;
  clone.className = "fly-product-image";
  clone.style.left = `${start.left}px`;
  clone.style.top = `${start.top}px`;
  clone.style.width = `${start.width}px`;
  clone.style.height = `${start.height}px`;
  document.body.append(clone);

  const deltaX = end.left + end.width / 2 - (start.left + start.width / 2);
  const deltaY = end.top + end.height / 2 - (start.top + start.height / 2);
  clone.animate(
    [
      { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1, filter: "blur(0)" },
      { transform: `translate3d(${deltaX * 0.52}px, ${deltaY - 90}px, 0) scale(0.72)`, opacity: 0.86, filter: "blur(1px)", offset: 0.62 },
      { transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.12)`, opacity: 0, filter: "blur(2px)" },
    ],
    { duration: 760, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
  ).finished.finally(() => clone.remove());

  window.setTimeout(() => {
    cartTarget.classList.remove("is-shaking");
    void cartTarget.offsetWidth;
    cartTarget.classList.add("is-shaking");
  }, 610);
};

function ProductCard({ product, onOpen }: { product: Product; onOpen: (product: Product) => void }) {
  const { has, toggle } = useCart();
  const isAdded = has(product.id);
  const imageRef = useRef<HTMLImageElement>(null);

  return (
    <article className="product-card is-visible" data-category={product.category} onClick={() => onOpen(product)}>
      <img ref={imageRef} src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <div className="price-row">
        <strong>{formatPrice(product.price)}</strong>
        <button
          className={isAdded ? "is-added" : ""}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            if (!isAdded) flyProductToCart(imageRef.current);
            toggle(product);
          }}
        >
          {isAdded ? "Добавлено" : "В корзину"}
        </button>
      </div>
    </article>
  );
}

function PromoBanner({ banner }: { banner: PromoBannerContent }) {
  return (
    <section className="promo-hero" aria-label="Акция iRoom">
      <div className="promo-banner">
        <img className="promo-banner-word" src={banner.titleSvg} alt="" aria-hidden="true" />
        <img className="promo-banner-phone" src={banner.image} alt="" />
        <div className="promo-banner-copy">
          <p>{banner.eyebrow}</p>
          <h1>{banner.text}</h1>
        </div>
        <div className="promo-banner-action">
          <p>{banner.buttonCaption}</p>
          <a href={banner.buttonHref}>{banner.buttonLabel}</a>
        </div>
      </div>
    </section>
  );
}

function ServiceStrip() {
  return (
    <section className="service-strip" aria-label="Преимущества">
      <a href="#delivery" id="delivery"><strong>Доставка</strong><span>За сутки по Москве, отправка по всей России!</span></a>
      <a href="#payment" id="payment"><strong>Оплата</strong><span>0% платежи от регионов, работаем с юр. лицами!</span></a>
      <a href="#warranty" id="warranty"><strong>Гарантия</strong><span>1 год на всю технику!</span></a>
      <a href="#service" id="service"><strong>Сервис</strong><span>Ремонт и трейд-ин</span></a>
      <a href="#contacts" id="contacts"><strong>Контакты</strong><span>Работаем каждый день с 10:00 до 21:00</span></a>
    </section>
  );
}

const colorOptions = [
  { value: "#f06f35", label: "Orange" },
  { value: "#e9e5dc", label: "Natural" },
  { value: "#2f333d", label: "Deep Blue" },
  { value: "#f2f2f2", label: "Silver" },
];

const connectionLabels: Record<string, string> = {
  "dual-SIM": "Dual-Sim",
  "SIM + eSIM": "SIM + eSIM",
};

const getProductModelName = (product: Product | null) => {
  if (!product) return "iPhone";
  if (product.model) return product.model;
  return product.name
    .replace(/Apple\s*/i, "")
    .replace(/,\s*.*/, "")
    .replace(/\s+eSIM\b/i, "")
    .replace(/\s+\d+\s?(?:GB|ГБ|TB|ТБ)\b/i, "")
    .trim();
};

export function ProductModal({
  product,
  onClose,
  readonly = false,
}: {
  product: Product | null;
  onClose: () => void;
  readonly?: boolean;
}) {
  const { add } = useCart();
  const [image, setImage] = useState(product?.image || "");
  const [memory, setMemory] = useState("512 ГБ");
  const [color, setColor] = useState("#f06f35");
  const [connection, setConnection] = useState("dual-SIM");
  const scrollRef = useRef<HTMLDivElement>(null);
  const thumbs = useMemo(() => [product?.image, "/assets/restore/iphone-1.jpg", "/assets/restore/iphone-2.jpg"].filter(Boolean) as string[], [product]);
  const productModelName = getProductModelName(product);
  const selectedColorLabel = colorOptions.find((option) => option.value === color)?.label || "Orange";
  const selectedConnectionLabel = connectionLabels[connection] || connection;
  const productDisplayTitle = `${productModelName} ${selectedColorLabel} ${selectedConnectionLabel}`;

  useEffect(() => {
    if (!product) return;
    setImage(product.image);
    setMemory(product.memory || "512 ГБ");
    setColor(product.colorHex || "#f06f35");
    setConnection("dual-SIM");
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [product]);

  return (
    <aside className={`product-modal${product ? " is-open" : ""}`} aria-hidden={!product} onClick={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <div className={`product-modal-card${readonly ? " is-readonly" : ""}`}>
        <button className="close-pill product-modal-close" type="button" onClick={onClose}>
          Закрыть
        </button>
        <div className="product-modal-scroll" ref={scrollRef}>
          <div className="product-modal-title">
            <h2>{productDisplayTitle}</h2>
            <span>{memory}</span>
          </div>
          <div className="product-modal-hero">
            <div className="product-modal-thumbs">
              {thumbs.map((src) => (
                <img src={src} alt="" key={src} onClick={() => setImage(src)} />
              ))}
            </div>
            {image ? <img src={image} alt={product?.name || ""} /> : null}
          </div>
          <div className="product-modal-content">
            <section className="product-modal-buy">
              <strong>{formatPrice(product?.price || 0)}</strong>
              <small>{formatPrice(product?.basePrice || 125490)}</small>
              {readonly ? null : (
                <>
                  <button
                    className="black-pill"
                    type="button"
                    onClick={() => {
                      if (!product) return;
                      flyProductToCart(document.querySelector<HTMLImageElement>(".product-modal-hero > img"));
                      add(product);
                    }}
                  >
                    В корзину
                  </button>
                  <button className="ghost-pill" type="button">
                    Быстрая покупка
                  </button>
                </>
              )}
              <div className="product-options">
                <h3>Память</h3>
                <p>
                  {["256 ГБ", "512 ГБ", "1 ТБ"].map((option) => (
                    <button className={memory === option ? "is-selected" : ""} type="button" key={option} onClick={() => setMemory(option)}>
                      {option}
                    </button>
                  ))}
                </p>
              </div>
              <div className="product-options">
                <h3>Цвет</h3>
                <div className="color-dots">
                  {colorOptions.map((option) => (
                    <button
                      aria-label={option.label}
                      className={color === option.value ? "is-selected" : ""}
                      key={option.value}
                      onClick={() => setColor(option.value)}
                      style={{ background: option.value }}
                      type="button"
                    />
                  ))}
                </div>
              </div>
              <div className="product-options">
                <h3>Связь</h3>
                <p>
                  {["dual-SIM", "SIM + eSIM"].map((option) => (
                    <button
                      className={connection === option ? "is-selected" : ""}
                      type="button"
                      key={option}
                      onClick={() => setConnection(option)}
                    >
                      {option}
                    </button>
                  ))}
                </p>
              </div>
            </section>
            <section className="product-modal-details">
              <h3>Описание</h3>
              {product?.descriptionImage ? <img className="product-description-image" src={product.descriptionImage} alt="" /> : null}
              <p>
                {product?.detailsDescription ||
                  `${product?.name || "iPhone"} - акционная модель из витрины iRoom. Подробные характеристики, варианты памяти и цвета можно уточнить у менеджера перед оформлением заказа.`}
              </p>
              <h3>Основные характеристики</h3>
              <dl>
                {(product?.specs?.length ? product.specs : [
                  { label: "Серия", value: productDisplayTitle },
                  { label: "Память", value: memory },
                  { label: "Процессор", value: "A18 Pro" },
                  { label: "Диагональ", value: "6,7\"" },
                  { label: "Камера", value: "48 Мп + 12 Мп + 12 Мп" },
                  { label: "Связь", value: connection },
                ]).map((spec) => (
                  <div key={`${spec.label}-${spec.value}`}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>
                ))}
              </dl>
            </section>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function Storefront({ content }: { content: CmsContent }) {
  const { quantity } = useCart();
  const sections = content.sections.length ? content.sections : fallbackSections;
  const settings = content.settings;
  const [isCartOpen, setCartOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  useEffect(() => {
    document.body.classList.toggle("is-cart-open", isCartOpen);
    document.body.classList.toggle("is-menu-open", isMenuOpen);
    document.body.classList.toggle("is-modal-open", Boolean(activeProduct));
  }, [activeProduct, isCartOpen, isMenuOpen]);

  return (
    <>
      <Header
        sections={sections}
        settings={settings}
        isMenuOpen={isMenuOpen}
        onCartOpen={() => {
          setMenuOpen(false);
          setCartOpen(true);
        }}
        onMenuClose={() => setMenuOpen(false)}
        onMenuToggle={() => {
          setCartOpen(false);
          setMenuOpen((value) => !value);
        }}
      />
      <main id="top">
        <PromoBanner banner={content.promoBanner} />

        {sections.map((section) => (
          <section className="category-section" data-section id={section.id} key={section.id}>
            <div className="section-title">
              <h2>
                {section.title}
                <span className="section-count">{section.products.length}</span>
              </h2>
            </div>
            <div className="wide-grid">
              <figure className="section-video-cover">
                <video src={section.cover} autoPlay muted loop playsInline preload="metadata" />
              </figure>
              {section.products.map((product) => (
                <ProductCard product={product} key={product.id} onOpen={setActiveProduct} />
              ))}
            </div>
          </section>
        ))}
        <ServiceStrip />
      </main>
      <Footer settings={settings} />
      <ProductModal product={activeProduct} onClose={() => setActiveProduct(null)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
      <div className="mobile-cta">
        <button type="button" onClick={() => setCartOpen(true)}>
          Корзина <span>{quantity || ""}</span>
        </button>
        <a href="tel:+74955404900">Позвонить</a>
      </div>
    </>
  );
}
