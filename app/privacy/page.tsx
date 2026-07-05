import { PrivacyPage } from "@/components/privacy-page";
import { getCmsContent } from "@/lib/cms";

export default async function Page() {
  const content = await getCmsContent();
  return <PrivacyPage content={content} />;
}
