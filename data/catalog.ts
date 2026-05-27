export type CategoryId = "iphone" | "airpods" | "accessories" | string;

export type Product = {
  id: string;
  category: CategoryId;
  name: string;
  description: string;
  price: number;
  image: string;
  model?: string;
  colorName?: string;
  colorHex?: string;
  memory?: string;
  basePrice?: number;
  detailsDescription?: string;
  descriptionImage?: string;
  specs?: { label: string; value: string }[];
};

export type ProductSection = {
  id: string;
  category: CategoryId;
  title: string;
  navTitle: string;
  cover: string;
  products: Product[];
};

const sourceProducts = [
  ["iphone-1", "Apple iPhone 17 Pro 512GB, Cosmic Orange", 159990, "/assets/restore/iphone-1.jpg"],
  ["iphone-2", "Apple iPhone 17 Pro Max 512GB, Deep Blue", 174990, "/assets/restore/iphone-2.jpg"],
  ["iphone-3", "Apple iPhone 17 Pro Max 256GB, Deep Blue", 148990, "/assets/restore/iphone-3.jpg"],
  ["iphone-4", "Apple iPhone 17 Pro 256GB, Deep Blue", 134990, "/assets/restore/iphone-4.jpg"],
  ["iphone-5", "Apple iPhone 17 Pro Max 512GB, Cosmic Orange", 174990, "/assets/restore/iphone-5.jpg"],
  ["iphone-6", "Apple iPhone 17 Pro Max 256GB, Silver", 148990, "/assets/restore/iphone-6.jpg"],
  ["iphone-7", "Apple iPhone 17 Pro Max 256GB, Cosmic Orange", 148990, "/assets/restore/iphone-7.jpg"],
  ["iphone-8", "Apple iPhone 17 Pro 256GB, Silver", 134990, "/assets/restore/iphone-8.jpg"],
  ["iphone-9", "Apple iPhone 17 Pro 256GB, Cosmic Orange", 134990, "/assets/restore/iphone-9.jpg"],
  ["iphone-10", "Apple iPhone 17 Pro Max 512GB, Silver", 174990, "/assets/restore/iphone-10.jpg"],
  ["iphone-11", "Apple iPhone 17 Pro eSIM 512GB, Cosmic Orange", 149990, "/assets/restore/iphone-11.jpg"],
  ["iphone-12", "Apple iPhone Air eSIM 256GB, Space Black", 109990, "/assets/restore/iphone-12.jpg"],
] as const;

const makeProducts = (category: CategoryId, offset = 0): Product[] =>
  Array.from({ length: 16 }, (_, index) => {
    const source = sourceProducts[(index + offset) % sourceProducts.length];
    return {
      id: `${category}-${index + 1}-${source[0]}`,
      category,
      name: source[1],
      description: "restore: смартфоны Apple",
      price: source[2],
      image: source[3],
    };
  });

export const sections: ProductSection[] = [
  {
    id: "iphone-17-pro",
    category: "iphone",
    title: "iPhone 17 Pro",
    navTitle: "iPhone",
    cover: "/assets/video_cover/iphone_video_cover.mp4",
    products: makeProducts("iphone", 0),
  },
  {
    id: "airpods",
    category: "airpods",
    title: "AirPods",
    navTitle: "AirPods",
    cover: "/assets/video_cover/airpod_video_cover.mp4",
    products: makeProducts("airpods", 2),
  },
  {
    id: "accessories",
    category: "accessories",
    title: "Аксессуары",
    navTitle: "Аксессуары",
    cover: "/assets/video_cover/vision_video_cover.mp4",
    products: makeProducts("accessories", 6),
  },
];

export const allProducts = sections.flatMap((section) => section.products);

export const promoText =
  "Пожалуйста, оформляйте заказы заранее и звоните за 2 часа до приезда, чтобы мы успели подготовить заказ к выдаче. Ждём вас в гости! По вопросам качества обслуживания или сотрудничества пишите напрямую директору в телеграм — @romanovich_95 или почту admin@iroom.su. Для быстрого оформления заказов пишите в телеграм @iroomstore. Наш сайт с техникой Apple — iroom.su";

export const promoCode = "IROOM182JUNE532ACTION14";
