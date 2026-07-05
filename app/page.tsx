import { Storefront } from "@/components/storefront";
import { getCmsContent } from "@/lib/cms";

export default async function HomePage() {
  const content = await getCmsContent();
  return <Storefront content={content} />;
}
