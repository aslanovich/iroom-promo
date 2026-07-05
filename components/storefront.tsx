"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { CmsContent, PromoBannerContent } from "@/lib/cms";
import { sections as fallbackSections, type Product } from "@/data/catalog";
import { CartDrawer } from "@/components/cart-drawer";
import { formatPrice, useCart } from "@/components/cart-context";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { useBodyState } from "@/components/use-body-state";

const flyProductToCart = (image: HTMLImageElement | null) => {
  const findVisibleElement = (selector: string) =>
    Array.from(document.querySelectorAll<HTMLElement>(selector)).find((element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    });

  const cartTarget =
    findVisibleElement(".mobile-cart-toggle") ||
    findVisibleElement(".mobile-cart-fly-target") ||
    findVisibleElement(".cart-link");
  const shakeTarget = findVisibleElement(".mobile-cart-toggle") || cartTarget;

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
    if (!shakeTarget) return;
    shakeTarget.classList.remove("is-shaking");
    void shakeTarget.offsetWidth;
    shakeTarget.classList.add("is-shaking");
  }, 610);
};

function ProductCard({ product, onOpen }: { product: Product; onOpen: (product: Product) => void }) {
  const { has, toggle } = useCart();
  const isAdded = has(product.id);
  const imageRef = useRef<HTMLImageElement>(null);

  return (
    <article className="product-card" data-category={product.category} onClick={() => onOpen(product)}>
      <div className="product-card-media">
        <img ref={imageRef} src={product.image} alt={product.name} />
      </div>
      <div className="product-card-body">
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
      </div>
    </article>
  );
}

function SplitText({
  as: Tag = "h2",
  className = "",
  text,
}: {
  as?: "h1" | "h2";
  className?: string;
  text: string;
}) {
  const lines = text.split(/\s*[—-]\s*/).filter(Boolean);
  return (
    <Tag className={`split-heading reveal-heading${className ? ` ${className}` : ""}`}>
      {lines.map((line, index) => (
        <span className="split-heading-line" key={`${line}-${index}`} style={{ "--line-index": index } as CSSProperties}>
          <span>{index > 0 ? `— ${line}` : line}</span>
        </span>
      ))}
    </Tag>
  );
}

function PromoBanner({ banner }: { banner: PromoBannerContent }) {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bannerNode = bannerRef.current;
    if (!bannerNode) return;

    let frame = 0;
    let pointerFrame = 0;
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const updateScroll = () => {
      frame = 0;
      const rect = bannerNode.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const progress = Math.max(-1, Math.min(1, (viewport / 2 - (rect.top + rect.height / 2)) / viewport));
      bannerNode.style.setProperty("--promo-scroll", progress.toFixed(3));
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateScroll);
    };
    const animatePointer = () => {
      pointer.x += (pointer.targetX - pointer.x) * 0.08;
      pointer.y += (pointer.targetY - pointer.y) * 0.08;
      bannerNode.style.setProperty("--promo-pointer-x", pointer.x.toFixed(3));
      bannerNode.style.setProperty("--promo-pointer-y", pointer.y.toFixed(3));
      if (Math.abs(pointer.targetX - pointer.x) > 0.001 || Math.abs(pointer.targetY - pointer.y) > 0.001) {
        pointerFrame = window.requestAnimationFrame(animatePointer);
      } else {
        pointerFrame = 0;
      }
    };
    const requestPointer = () => {
      if (!pointerFrame) pointerFrame = window.requestAnimationFrame(animatePointer);
    };
    const handlePointerMove = (event: PointerEvent) => {
      const rect = bannerNode.getBoundingClientRect();
      pointer.targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      requestPointer();
    };
    const handlePointerLeave = () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
      requestPointer();
    };

    updateScroll();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    bannerNode.addEventListener("pointermove", handlePointerMove);
    bannerNode.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      bannerNode.removeEventListener("pointermove", handlePointerMove);
      bannerNode.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <section className="promo-hero" aria-label="Акция iRoom">
      <div className="promo-banner" ref={bannerRef}>
        <img className="promo-banner-word" src={banner.titleSvg} alt="" aria-hidden="true" />
        <img className="promo-banner-phone" src={banner.image} alt="" />
        <div className="promo-banner-copy">
          <p>{banner.eyebrow}</p>
          <SplitText as="h1" text={banner.text} />
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
      {serviceItems.map((item) => (
        <a href={`#${item.id}`} id={item.id} key={item.id}>
          <strong>{item.title}</strong>
          <span>{item.text}</span>
        </a>
      ))}
    </section>
  );
}

const serviceItems = [
  { id: "delivery", title: "Доставка", text: "За сутки по Москве, отправка по всей России!" },
  { id: "payment", title: "Оплата", text: "0% платежи от регионов, работаем с юр. лицами!" },
  { id: "warranty", title: "Гарантия", text: "1 год на всю технику!" },
  { id: "service", title: "Сервис", text: "Ремонт и трейд-ин" },
  { id: "contacts", title: "Контакты", text: "Работаем каждый день с 10:00 до 21:00" },
];

const memoryOptions = ["256 ГБ", "512 ГБ", "1 ТБ"];
const connectionOptions = ["dual-SIM", "SIM + eSIM"];
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

const variantIdPart = (value: string) =>
  value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/^-|-$/g, "");

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

function TextOptions({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="product-options">
      <h3>{title}</h3>
      <p>
        {options.map((option) => (
          <button className={value === option ? "is-selected" : ""} type="button" key={option} onClick={() => onChange(option)}>
            {option}
          </button>
        ))}
      </p>
    </div>
  );
}

function ColorOptions({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="product-options">
      <h3>Цвет</h3>
      <div className="color-dots">
        {colorOptions.map((option) => (
          <button
            aria-label={option.label}
            className={value === option.value ? "is-selected" : ""}
            key={option.value}
            onClick={() => onChange(option.value)}
            style={{ background: option.value, "--color-dot": option.value } as CSSProperties}
            type="button"
          >
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

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
  const selectedProduct = useMemo<Product | null>(() => {
    if (!product) return null;
    const variantTitle = `${productModelName} ${memory}, ${selectedColorLabel}, ${selectedConnectionLabel}`;
    return {
      ...product,
      id: [
        product.id,
        variantIdPart(memory),
        variantIdPart(selectedColorLabel),
        variantIdPart(selectedConnectionLabel),
      ].join("__"),
      name: variantTitle,
      description: `${memory}, ${selectedColorLabel}, ${selectedConnectionLabel}`,
      image: image || product.image,
      model: productModelName,
      memory,
      colorName: selectedColorLabel,
      colorHex: color,
      connection,
    };
  }, [color, connection, image, memory, product, productModelName, selectedColorLabel, selectedConnectionLabel]);

  useEffect(() => {
    if (!product) return;
    setImage(product.image);
    setMemory(product.memory || "512 ГБ");
    setColor(product.colorHex || "#f06f35");
    setConnection(product.connection || "dual-SIM");
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
                      if (!selectedProduct) return;
                      flyProductToCart(document.querySelector<HTMLImageElement>(".product-modal-hero > img"));
                      add(selectedProduct);
                    }}
                  >
                    В корзину
                  </button>
                  <button className="ghost-pill" type="button">
                    Быстрая покупка
                  </button>
                </>
              )}
              <TextOptions title="Память" options={memoryOptions} value={memory} onChange={setMemory} />
              <ColorOptions value={color} onChange={setColor} />
              <TextOptions title="Связь" options={connectionOptions} value={connection} onChange={setConnection} />
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
  const sections = content.sections.length ? content.sections : fallbackSections;
  const settings = content.settings;
  const [isCartOpen, setCartOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  useBodyState({ isCartOpen, isMenuOpen, isModalOpen: Boolean(activeProduct) });

  useEffect(() => {
    const revealNodes = Array.from(document.querySelectorAll<HTMLElement>(".reveal-heading, .product-card"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.16 },
    );
    revealNodes.forEach((node, index) => {
      node.style.setProperty("--reveal-index", String(index % 8));
      observer.observe(node);
    });
    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    let frame = 0;
    const updateCards = () => {
      frame = 0;
      document.querySelectorAll<HTMLElement>(".product-card").forEach((card) => {
        const image = card.querySelector<HTMLElement>("img");
        if (!image) return;
        const rect = card.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const center = rect.top + rect.height / 2;
        const progress = (center - window.innerHeight / 2) / window.innerHeight;
        card.style.setProperty("--parallax-y", `${Math.max(-18, Math.min(18, progress * -34)).toFixed(2)}px`);
        card.style.setProperty("--scroll-blur", `${Math.min(1.2, Math.abs(progress) * 1.2).toFixed(2)}px`);
      });
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateCards);
    };
    updateCards();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [sections]);

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
        onMenuClose={() => {
          setMenuOpen(false);
          setCartOpen(false);
        }}
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
              <div className="section-heading-wrap">
                <SplitText text={section.title} />
                <span className="section-count">{section.products.length}</span>
              </div>
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
    </>
  );
}
