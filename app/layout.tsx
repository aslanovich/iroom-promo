import type { Metadata } from "next";
import { CartProvider } from "@/components/cart-context";
import { getCmsContent } from "@/lib/cms";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getCmsContent();
  return {
    title: settings.title,
    description: settings.description,
    keywords: settings.keywords,
    icons: settings.favicon ? { icon: settings.favicon } : undefined,
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
