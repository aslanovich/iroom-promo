import { allProducts as fallbackProducts, promoCode, promoText, sections as fallbackSections, type Product, type ProductSection } from "@/data/catalog";

export type SiteSettings = {
  siteName: string;
  title: string;
  description: string;
  keywords: string;
  favicon?: string;
  logo: string;
  phone: string;
  email: string;
  telegram?: string;
  promoTicker: string;
  promoCode: string;
  footerWorkHours: string;
  footerCopyright: string;
};

export type PromoBannerContent = {
  eyebrow: string;
  text: string;
  titleSvg: string;
  buttonLabel: string;
  buttonHref: string;
  buttonCaption: string;
  image: string;
};

export type CmsContent = {
  settings: SiteSettings;
  promoBanner: PromoBannerContent;
  sections: ProductSection[];
  products: Product[];
};

type DirectusItem = Record<string, unknown>;

const fallbackSettings: SiteSettings = {
  siteName: "iRoom",
  title: "iRoom",
  description: "Интернет-магазин техники Apple",
  keywords: "iRoom, Apple, iPhone, AirPods, аксессуары",
  logo: "/assets/iroom_logo.svg",
  phone: "+7 495 540 49 00",
  email: "admin@iroom.su",
  telegram: "@iroomstore",
  promoTicker: promoText,
  promoCode,
  footerWorkHours: "Ежедневно с 10:00 до 21:00",
  footerCopyright: "©Айрум. Все права защищены",
};

const fallbackOrderRecipientEmail = process.env.ORDER_RECIPIENT || "kerim.aslanovich@gmail.com";

const fallbackPromoBanner: PromoBannerContent = {
  eyebrow: "Розыгрыш iPhone",
  text: "Покупай товары — участвуй автоматически. Чем больше заказов, тем больше шансов на победу.",
  titleSvg: "/assets/banner_vector_header.svg",
  buttonLabel: "смотреть товары",
  buttonHref: "#iphone-17-pro",
  buttonCaption: "Доставляем по России и в любую точку Республики Дагестан",
  image: "/assets/promo-iphone.png",
};

const directusUrl = process.env.DIRECTUS_URL?.replace(/\/$/, "");
const directusToken = process.env.DIRECTUS_STATIC_TOKEN || process.env.DIRECTUS_TOKEN;

const assetUrl = (value: unknown, fallback = "") => {
  if (!value) return fallback;
  if (typeof value === "string") {
    if (value.startsWith("http") || value.startsWith("/")) return value;
    return directusUrl ? `${directusUrl}/assets/${value}` : fallback;
  }
  if (typeof value === "object" && value && "id" in value) {
    return assetUrl((value as { id?: unknown }).id, fallback);
  }
  return fallback;
};

const stringValue = (item: DirectusItem, keys: string[], fallback = "") => {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  return fallback;
};

const numberValue = (item: DirectusItem, keys: string[], fallback = 0) => {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim()) return Number(value.replace(/\s/g, "")) || fallback;
  }
  return fallback;
};

const directusFetch = async <T,>(path: string, params?: Record<string, string>) => {
  if (!directusUrl) return null;
  const url = new URL(`${directusUrl}${path}`);
  Object.entries(params || {}).forEach(([key, value]) => url.searchParams.set(key, value));
  try {
    const response = await fetch(url, {
      headers: directusToken ? { Authorization: `Bearer ${directusToken}` } : undefined,
      next: { revalidate: 60 },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { data?: T };
    return payload.data ?? null;
  } catch {
    return null;
  }
};

const firstItem = (item?: DirectusItem | DirectusItem[] | null) => Array.isArray(item) ? item[0] : item;

const normalizeSettings = (rawItem?: DirectusItem | DirectusItem[] | null): SiteSettings => {
  const item = firstItem(rawItem);
  return ({
  ...fallbackSettings,
  siteName: item ? stringValue(item, ["site_name", "siteName", "name"], fallbackSettings.siteName) : fallbackSettings.siteName,
  title: item ? stringValue(item, ["title", "seo_title"], fallbackSettings.title) : fallbackSettings.title,
  description: item ? stringValue(item, ["description", "seo_description"], fallbackSettings.description) : fallbackSettings.description,
  keywords: item ? stringValue(item, ["keywords", "seo_keywords"], fallbackSettings.keywords) : fallbackSettings.keywords,
  favicon: item ? assetUrl(item.favicon, fallbackSettings.favicon) : fallbackSettings.favicon,
  logo: item ? assetUrl(item.logo, fallbackSettings.logo) : fallbackSettings.logo,
  phone: item ? stringValue(item, ["phone", "contact_phone"], fallbackSettings.phone) : fallbackSettings.phone,
  email: item ? stringValue(item, ["email", "contact_email"], fallbackSettings.email) : fallbackSettings.email,
  telegram: item ? stringValue(item, ["telegram", "contact_telegram"], fallbackSettings.telegram) : fallbackSettings.telegram,
  promoTicker: item ? stringValue(item, ["promo_ticker", "ticker_text"], fallbackSettings.promoTicker) : fallbackSettings.promoTicker,
  promoCode: item ? stringValue(item, ["promo_code", "action_promo_code"], fallbackSettings.promoCode) : fallbackSettings.promoCode,
  footerWorkHours: item ? stringValue(item, ["footer_work_hours", "work_hours"], fallbackSettings.footerWorkHours) : fallbackSettings.footerWorkHours,
  footerCopyright: item ? stringValue(item, ["footer_copyright", "copyright"], fallbackSettings.footerCopyright) : fallbackSettings.footerCopyright,
  });
};

const normalizePromoBanner = (item?: DirectusItem | null): PromoBannerContent => ({
  eyebrow: item ? stringValue(item, ["eyebrow", "subtitle"], fallbackPromoBanner.eyebrow) : fallbackPromoBanner.eyebrow,
  text: item ? stringValue(item, ["text", "description"], fallbackPromoBanner.text) : fallbackPromoBanner.text,
  titleSvg: item ? assetUrl(item.title_svg || item.titleSvg, fallbackPromoBanner.titleSvg) : fallbackPromoBanner.titleSvg,
  buttonLabel: item ? stringValue(item, ["button_label", "buttonLabel"], fallbackPromoBanner.buttonLabel) : fallbackPromoBanner.buttonLabel,
  buttonHref: item ? stringValue(item, ["button_href", "buttonHref"], fallbackPromoBanner.buttonHref) : fallbackPromoBanner.buttonHref,
  buttonCaption: item ? stringValue(item, ["button_caption", "buttonCaption"], fallbackPromoBanner.buttonCaption) : fallbackPromoBanner.buttonCaption,
  image: item ? assetUrl(item.image, fallbackPromoBanner.image) : fallbackPromoBanner.image,
});

const normalizeSection = (item: DirectusItem): Omit<ProductSection, "products"> & { sort: number } => {
  const id = stringValue(item, ["slug", "id"], "section");
  return {
    id,
    category: stringValue(item, ["category", "slug"], id) as ProductSection["category"],
    title: stringValue(item, ["title", "name"], id),
    navTitle: stringValue(item, ["nav_title", "navTitle", "title", "name"], id),
    cover: assetUrl(item.cover || item.video_cover || item.videoCover, "/assets/video_cover/iphone_video_cover.mp4"),
    sort: numberValue(item, ["sort", "order"], 500),
  };
};

const normalizeProduct = (item: DirectusItem): Product & { sectionId: string; sort: number } => {
  const sectionValue = item.section || item.category;
  const sectionId = typeof sectionValue === "object" && sectionValue
    ? stringValue(sectionValue as DirectusItem, ["slug", "id"], "iphone-17-pro")
    : String(sectionValue || "iphone-17-pro");
  return {
    id: stringValue(item, ["slug", "id"], stringValue(item, ["name", "title"], "product").toLowerCase().replace(/[^a-z0-9а-яё]+/gi, "-")),
    category: sectionId as Product["category"],
    name: stringValue(item, ["title", "name"], "iPhone"),
    description: stringValue(item, ["short_description", "description"], ""),
    price: numberValue(item, ["sale_price", "discount_price", "price"], 0),
    image: assetUrl(item.image || item.main_image, "/assets/restore/iphone-1.jpg"),
    model: stringValue(item, ["model"], ""),
    colorName: stringValue(item, ["color_name", "colorName"], ""),
    colorHex: stringValue(item, ["color_hex", "colorHex"], ""),
    memory: stringValue(item, ["memory"], ""),
    basePrice: numberValue(item, ["base_price", "old_price"], 0),
    detailsDescription: stringValue(item, ["details_description", "long_description", "description_text"], ""),
    descriptionImage: assetUrl(item.description_image || item.description_media, ""),
    specs: Array.isArray(item.specs || item.characteristics)
      ? ((item.specs || item.characteristics) as DirectusItem[]).map((spec) => ({
          label: stringValue(spec, ["label", "name", "title"], ""),
          value: stringValue(spec, ["value", "text"], ""),
        })).filter((spec) => spec.label || spec.value)
      : [],
    sectionId,
    sort: numberValue(item, ["sort", "order"], 500),
  };
};

const fallbackContent: CmsContent = {
  settings: fallbackSettings,
  promoBanner: fallbackPromoBanner,
  sections: fallbackSections,
  products: fallbackProducts,
};

export const getCmsContent = async (): Promise<CmsContent> => {
  const [settingsItem, promoItem, sectionItems, productItems] = await Promise.all([
    directusFetch<DirectusItem | DirectusItem[]>("/items/site_settings"),
    directusFetch<DirectusItem | DirectusItem[]>("/items/promo_banner"),
    directusFetch<DirectusItem[]>("/items/product_sections", { sort: "sort", fields: "*.*" }),
    directusFetch<DirectusItem[]>("/items/products", { sort: "sort", fields: "*,section.*,specs.*" }),
  ]);

  const settings = normalizeSettings(settingsItem);
  const promoBanner = normalizePromoBanner(firstItem(promoItem));
  if (!sectionItems?.length || !productItems?.length) return { ...fallbackContent, settings, promoBanner };

  const products = productItems.map(normalizeProduct).sort((a, b) => a.sort - b.sort);
  const sections = sectionItems
    .map(normalizeSection)
    .sort((a, b) => a.sort - b.sort)
    .map((section) => ({
      ...section,
      products: products.filter((product) => product.sectionId === section.id),
    }))
    .filter((section) => section.products.length > 0);

  return sections.length ? { settings, promoBanner, sections, products } : { ...fallbackContent, settings, promoBanner };
};

export const getOrderRecipientEmail = async () => {
  const item = firstItem(await directusFetch<DirectusItem | DirectusItem[]>("/items/site_settings"));
  return item ? stringValue(item, ["order_recipient_email", "recipient_email"], fallbackOrderRecipientEmail) : fallbackOrderRecipientEmail;
};
