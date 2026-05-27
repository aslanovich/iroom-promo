import { CheckoutPage } from "@/components/checkout-page";
import { getCmsContent } from "@/lib/cms";

export default async function Page() {
  const content = await getCmsContent();
  return <CheckoutPage content={content} />;
}
