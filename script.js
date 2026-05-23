const CART_KEY = "iroom_cart";
const formatPrice = (value) => `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
const parsePrice = (value) => Number(value.replace(/[^\d]/g, ""));
const cartStorage = (() => {
  const memory = { value: "[]" };
  const cookieStorage = {
    getItem: (key) => {
      const match = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]*)`));
      return match ? decodeURIComponent(match[1]) : null;
    },
    setItem: (key, value) => {
      document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=604800; SameSite=Lax`;
    },
    removeItem: (key) => {
      document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
    },
  };
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("__iroom_test", "1");
      localStorage.removeItem("__iroom_test");
      return localStorage;
    }
  } catch {
    return typeof document !== "undefined" ? cookieStorage : {
      getItem: () => memory.value,
      setItem: (_key, value) => {
        memory.value = value;
      },
      removeItem: () => {
        memory.value = "[]";
      },
    };
  }
  return typeof document !== "undefined" ? cookieStorage : {
    getItem: () => memory.value,
    setItem: (_key, value) => {
      memory.value = value;
    },
    removeItem: () => {
      memory.value = "[]";
    },
  };
})();

const readCart = () => {
  try {
    return JSON.parse(cartStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
};

let cart = readCart();

const saveCart = () => {
  cartStorage.setItem(CART_KEY, JSON.stringify(cart));
};

const cartQuantity = () => cart.reduce((sum, item) => sum + item.qty, 0);
const cartTotal = () => cart.reduce((sum, item) => sum + item.price * item.qty, 0);

const getProductPayload = (button) => {
  const card = button.closest("[data-category]");
  const image = card.querySelector("img");

  return {
    id: button.dataset.add,
    name: button.dataset.add,
    description: card.querySelector("p")?.textContent.trim() || "",
    price: parsePrice(card.querySelector(".price-row strong").textContent),
    image: image?.getAttribute("src") || "",
  };
};

const shakeCartButton = () => {
  document.querySelectorAll("[data-cart-button], .mobile-cta button").forEach((button) => {
    button.classList.remove("is-shaking");
    void button.offsetWidth;
    button.classList.add("is-shaking");
  });
};

const splitHeading = (heading) => {
  if (heading.dataset.splitReady === "true") return;
  const text = heading.textContent.trim();
  if (!text) return;

  const words = text.split(/\s+/);
  heading.textContent = "";
  heading.classList.add("split-heading");

  const measurers = words.map((word, index) => {
    const span = document.createElement("span");
    span.textContent = index === words.length - 1 ? word : `${word} `;
    span.style.display = "inline-block";
    heading.append(span);
    return span;
  });

  const lines = [];
  measurers.forEach((span) => {
    const top = Math.round(span.offsetTop);
    const current = lines.find((line) => line.top === top);
    if (current) current.words.push(span.textContent);
    else lines.push({ top, words: [span.textContent] });
  });

  heading.textContent = "";
  lines.forEach((line, index) => {
    const outer = document.createElement("span");
    const inner = document.createElement("span");
    outer.className = "split-heading-line";
    outer.style.setProperty("--line-index", index);
    inner.textContent = line.words.join("").trimEnd();
    outer.append(inner);
    heading.append(outer);
  });

  heading.dataset.splitReady = "true";
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
);

const setupMotion = () => {
  document.querySelectorAll("h1, .section-title h2, .catalog-nav h2, .service-details h2").forEach((heading) => {
    splitHeading(heading);
    revealObserver.observe(heading);
  });

  document.querySelectorAll(".product-card").forEach((card, index) => {
    card.style.transitionDelay = `${(index % 8) * 70}ms`;
    revealObserver.observe(card);
  });
};

let lastScrollY = window.scrollY;
let scrollVelocity = 0;
let parallaxTicking = false;

const updateProductParallax = () => {
  const currentY = window.scrollY;
  scrollVelocity = Math.abs(currentY - lastScrollY);
  lastScrollY = currentY;

  document.querySelectorAll(".product-card").forEach((card) => {
    const rect = card.getBoundingClientRect();
    if (rect.bottom < -120 || rect.top > window.innerHeight + 120) return;
    const progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
    const y = Math.max(-18, Math.min(18, progress * -34));
    const blur = Math.min(3, scrollVelocity / 18);
    card.style.setProperty("--parallax-y", `${y.toFixed(2)}px`);
    card.style.setProperty("--scroll-blur", `${blur.toFixed(2)}px`);
  });

  window.clearTimeout(updateProductParallax.blurTimer);
  updateProductParallax.blurTimer = window.setTimeout(() => {
    document.querySelectorAll(".product-card").forEach((card) => card.style.setProperty("--scroll-blur", "0px"));
  }, 120);

  parallaxTicking = false;
};

const requestParallax = () => {
  if (parallaxTicking) return;
  parallaxTicking = true;
  requestAnimationFrame(updateProductParallax);
};

const flyProductToCart = (button, onImpact) => {
  const sourceImage = button.closest("[data-category]")?.querySelector("img");
  const target = document.querySelector("[data-cart-button]");
  if (!sourceImage || !target) {
    onImpact();
    return;
  }

  const from = sourceImage.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const clone = sourceImage.cloneNode(true);
  clone.className = "fly-to-cart";
  clone.style.left = `${from.left}px`;
  clone.style.top = `${from.top}px`;
  clone.style.width = `${from.width}px`;
  clone.style.height = `${from.height}px`;
  document.body.append(clone);

  const endX = to.left + to.width / 2 - (from.left + from.width / 2);
  const endY = to.top + to.height / 2 - (from.top + from.height / 2);

  const animation = clone.animate(
    [
      { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1, filter: "blur(0px)" },
      { transform: `translate3d(${endX * 0.52}px, ${endY - 90}px, 0) scale(0.72)`, opacity: 0.86, filter: "blur(1px)", offset: 0.62 },
      { transform: `translate3d(${endX}px, ${endY}px, 0) scale(0.12)`, opacity: 0, filter: "blur(2px)" },
    ],
    { duration: 760, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
  );

  window.setTimeout(onImpact, 610);
  animation.finished.finally(() => clone.remove());
};

const setCartOpen = (isOpen) => {
  const panel = document.querySelector("[data-cart-panel]");
  if (!panel) return;
  panel.classList.toggle("is-open", isOpen);
  panel.setAttribute("aria-hidden", String(!isOpen));
};

const renderLineItem = (item, mode = "cart") => `
  <li class="${mode === "checkout" ? "summary-item" : "cart-item"}" data-id="${item.id}">
    <div class="cart-item-main">
      <div class="cart-thumb">
        ${item.image ? `<img src="${item.image}" alt="">` : ""}
      </div>
      <div class="cart-copy">
        <p>${item.name}</p>
        <small>${item.description}</small>
        <div class="qty-control" aria-label="Количество ${item.name}">
          <button type="button" data-qty="dec">-</button>
          <span>${item.qty}</span>
          <button type="button" data-qty="inc">+</button>
        </div>
      </div>
    </div>
    <div class="cart-item-side">
      <strong>${formatPrice(item.price * item.qty)}</strong>
      <button type="button" data-remove>Удалить</button>
    </div>
  </li>
`;

const bindCartControls = (root = document) => {
  root.querySelectorAll("[data-qty]").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest("[data-id]");
      const item = cart.find((entry) => entry.id === row.dataset.id);
      if (!item) return;
      item.qty += button.dataset.qty === "inc" ? 1 : -1;
      if (item.qty < 1) {
        cart = cart.filter((entry) => entry.id !== item.id);
      }
      saveCart();
      renderCart();
    });
  });

  root.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      const row = button.closest("[data-id]");
      cart = cart.filter((entry) => entry.id !== row.dataset.id);
      saveCart();
      renderCart();
    });
  });
};

const renderCart = () => {
  const quantity = cartQuantity();
  document.querySelectorAll("[data-cart-count]").forEach((counter) => {
    counter.textContent = quantity > 0 ? String(quantity) : "";
    counter.classList.toggle("is-empty", quantity === 0);
  });

  document.querySelectorAll("[data-cart-total]").forEach((total) => {
    total.textContent = formatPrice(cartTotal());
  });

  document.querySelectorAll("[data-cart-empty]").forEach((empty) => {
    empty.hidden = cart.length > 0;
  });

  document.querySelectorAll("[data-checkout-link]").forEach((link) => {
    link.classList.toggle("is-disabled", cart.length === 0);
  });

  document.querySelectorAll("[data-cart-list]").forEach((list) => {
    list.innerHTML = cart.map((item) => renderLineItem(item)).join("");
    bindCartControls(list);
  });

  document.querySelectorAll("[data-order-summary]").forEach((list) => {
    list.innerHTML = cart.length
      ? cart.map((item) => renderLineItem(item, "checkout")).join("")
      : `<li class="summary-empty">Корзина пока пустая. Вернитесь в каталог и добавьте товары.</li>`;
    bindCartControls(list);
  });

  const orderDetails = document.querySelector("[name='order_details']");
  if (orderDetails) {
    orderDetails.value = cart
      .map((item) => `${item.name} x ${item.qty} - ${formatPrice(item.price * item.qty)}`)
      .join("\n");
  }

  const orderTotal = document.querySelector("[name='order_total']");
  if (orderTotal) {
    orderTotal.value = formatPrice(cartTotal());
  }

  document.querySelectorAll("[data-order-total]").forEach((total) => {
    total.textContent = formatPrice(cartTotal());
  });
};

const expandProductSections = (targetCount = 16) => {
  document.querySelectorAll("[data-section] .wide-grid").forEach((grid) => {
    const sourceCards = Array.from(grid.querySelectorAll(".product-card"));
    if (!sourceCards.length || sourceCards.length >= targetCount) return;

    for (let index = sourceCards.length; index < targetCount; index += 1) {
      const source = sourceCards[index % sourceCards.length];
      const clone = source.cloneNode(true);
      clone.classList.remove("is-visible");
      clone.style.transitionDelay = "";
      grid.append(clone);
    }
  });
};

expandProductSections();

document.querySelectorAll("[data-cart-open]").forEach((button) => {
  button.addEventListener("click", () => setCartOpen(true));
});

document.querySelectorAll("[data-cart-close]").forEach((button) => {
  button.addEventListener("click", () => setCartOpen(false));
});

document.querySelector("[data-cart-panel]")?.addEventListener("click", (event) => {
  if (event.target === event.currentTarget) setCartOpen(false);
});

document.querySelectorAll("[data-add]").forEach((button) => {
  button.addEventListener("click", () => {
    const payload = getProductPayload(button);
    const existing = cart.find((item) => item.id === payload.id);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...payload, qty: 1 });
    }

    saveCart();
    flyProductToCart(button, () => {
      renderCart();
      shakeCartButton();
    });
  });
});

const categoryLinks = Array.from(document.querySelectorAll("[data-anchor-category]"));
const setActiveCategory = (category) => {
  categoryLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.anchorCategory === category);
  });
};

categoryLinks.forEach((link) => {
  link.addEventListener("click", () => setActiveCategory(link.dataset.anchorCategory));
});

if (categoryLinks.length) {
  const sections = Array.from(document.querySelectorAll("[data-section]"));
  let categoryTicking = false;

  const updateActiveCategoryByScroll = () => {
    const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
    const marker = window.scrollY + headerHeight + 48;
    const current = sections.reduce((active, section) => {
      return section.offsetTop <= marker ? section : active;
    }, null);

    setActiveCategory(window.scrollY < 260 || !current ? "all" : current.dataset.section);
    categoryTicking = false;
  };

  window.addEventListener("scroll", () => {
    if (categoryTicking) return;
    categoryTicking = true;
    requestAnimationFrame(updateActiveCategoryByScroll);
  }, { passive: true });

  window.addEventListener("load", updateActiveCategoryByScroll);
  updateActiveCategoryByScroll();
}

const deadlineNode = document.querySelector("[data-countdown-days]");
if (deadlineNode) {
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 2);
  deadlineNode.textContent = String(Math.max(1, Math.ceil((deadline - new Date()) / 86400000))).padStart(2, "0");
}

document.querySelector("[data-checkout-form]")?.addEventListener("submit", (event) => {
  renderCart();
  if (!cart.length) {
    event.preventDefault();
    window.location.href = "index.html";
    return;
  }
});

document.querySelectorAll("[data-phone-mask]").forEach((input) => {
  input.addEventListener("input", () => {
    const digits = input.value.replace(/\D/g, "").replace(/^7|^8/, "").slice(0, 10);
    const parts = [];
    if (digits.length > 0) parts.push(`(${digits.slice(0, 3)}`);
    if (digits.length >= 3) parts[0] += ")";
    if (digits.length > 3) parts.push(` ${digits.slice(3, 6)}`);
    if (digits.length > 6) parts.push(`-${digits.slice(6, 8)}`);
    if (digits.length > 8) parts.push(`-${digits.slice(8, 10)}`);
    input.value = parts.join("");
  });
});

if (document.body.dataset.page === "success") {
  cartStorage.removeItem(CART_KEY);
  cart = [];
}

renderCart();
setupMotion();
updateProductParallax();
window.addEventListener("scroll", requestParallax, { passive: true });
window.addEventListener("resize", () => {
  document.querySelectorAll(".split-heading").forEach((heading) => {
    heading.dataset.splitReady = "false";
    splitHeading(heading);
    heading.classList.add("is-visible");
  });
  requestParallax();
});
