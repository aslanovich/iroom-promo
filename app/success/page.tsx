import { SuccessPage } from "@/components/success-page";
import { getCmsContent } from "@/lib/cms";

export default async function Page() {
  const content = await getCmsContent();
  return <SuccessPage content={content} />;
}
