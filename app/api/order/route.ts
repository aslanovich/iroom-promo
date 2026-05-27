import { NextResponse } from "next/server";
import { promoCode } from "@/data/catalog";
import { getOrderRecipientEmail } from "@/lib/cms";

const buildOrderText = (fields: Record<string, string>) =>
  [
    "Новый заказ iRoom",
    "",
    `Имя: ${fields.name || "-"}`,
    `Телефон: ${fields.phone || "-"}`,
    `Email: ${fields.email || "-"}`,
    `Telegram: ${fields.telegram || "-"}`,
    `Доставка: ${fields.delivery || "-"}`,
    `Город: ${fields.city || "-"}`,
    `Адрес: ${fields.address || "-"}`,
    `Промокод клиента: ${fields.promo || "-"}`,
    `Промокод акции: ${fields.action_promo_code || promoCode}`,
    "",
    "Товары:",
    fields.order_details || "-",
    "",
    `Итого: ${fields.order_total || "-"}`,
  ].join("\n");

const sendWithResend = async (fields: Record<string, string>) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("В Vercel не задана переменная RESEND_API_KEY");
  }

  const recipient = await getOrderRecipientEmail();

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.ORDER_FROM || "iRoom <onboarding@resend.dev>",
      to: [recipient],
      subject: "Новый заказ iRoom",
      text: buildOrderText(fields),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend вернул ошибку ${response.status}: ${errorText}`);
  }
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const fields = Object.fromEntries(
      Array.from(formData.entries()).map(([key, value]) => [key, String(value)]),
    );
    await sendWithResend(fields);
    return NextResponse.redirect(new URL("/success", request.url), 303);
  } catch (error) {
    return new NextResponse(`Не удалось отправить заказ: ${(error as Error).message}`, { status: 500 });
  }
}
