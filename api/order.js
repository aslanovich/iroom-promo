const recipient = process.env.ORDER_RECIPIENT || "kerim.aslanovich@gmail.com";
const promoCode = "IROOM182JUNE532ACTION14";

const readRawBody = (request) =>
  new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body is too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });

const parseFields = async (request) => {
  if (request.body && typeof request.body === "object" && !Buffer.isBuffer(request.body)) {
    return request.body;
  }

  if (typeof request.body === "string") {
    return Object.fromEntries(new URLSearchParams(request.body).entries());
  }

  const rawBody = await readRawBody(request);
  return Object.fromEntries(new URLSearchParams(rawBody).entries());
};

const buildOrderText = (fields) =>
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

const sendWithResend = async (fields) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("В Vercel не задана переменная RESEND_API_KEY");
  }

  const text = buildOrderText(fields);
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
      text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend вернул ошибку ${response.status}: ${errorText}`);
  }
};

module.exports = async (request, response) => {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).send("Method not allowed");
    return;
  }

  try {
    const fields = await parseFields(request);
    await sendWithResend(fields);
    response.writeHead(303, { Location: "/success.html" });
    response.end();
  } catch (error) {
    response.status(500).send(`Не удалось отправить заказ: ${error.message}`);
  }
};
