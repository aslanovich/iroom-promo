import { NextResponse } from "next/server";
import { promoCode } from "@/data/catalog";
import { getOrderRecipientEmail } from "@/lib/cms";

type OrderFields = Record<string, string>;

const orderFieldLabels: Array<[keyof OrderFields, string]> = [
  ["name", "Имя"],
  ["phone", "Телефон"],
  ["email", "Email"],
  ["telegram", "Telegram"],
  ["delivery", "Доставка"],
  ["city", "Город"],
  ["address", "Адрес"],
  ["promo", "Промокод клиента"],
];

const fieldLine = (fields: OrderFields, key: keyof OrderFields, label: string) => `${label}: ${fields[key] || "-"}`;

const buildOrderText = (fields: OrderFields) => {
  const customerLines = orderFieldLabels.map(([key, label]) => fieldLine(fields, key, label));

  return [
    "Новый заказ iRoom",
    "",
    ...customerLines,
    `Промокод акции: ${fields.action_promo_code || promoCode}`,
    "",
    "Товары:",
    fields.order_details || "-",
    "",
    `Итого: ${fields.order_total || "-"}`,
  ].join("\n");
};

const sendWithResend = async (fields: OrderFields) => {
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
