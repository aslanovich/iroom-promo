const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const recipient = "kerim.aslanovich@gmail.com";
const promoCode = "IROOM182JUNE532ACTION14";

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const readBody = (request) =>
  new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) request.destroy();
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });

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
    `Рассрочка: ${fields.installment || "-"}`,
    "",
    "Товары:",
    fields.order_details || "-",
    "",
    `Итого: ${fields.order_total || "-"}`,
  ].join("\n");

const sendMail = (fields) =>
  new Promise((resolve, reject) => {
    const message = [
      `To: ${recipient}`,
      "From: iroom-local@localhost",
      "Subject: Новый заказ iRoom",
      "Content-Type: text/plain; charset=UTF-8",
      "",
      buildOrderText(fields),
    ].join("\n");

    const sendmail = spawn("/usr/sbin/sendmail", ["-t"]);
    sendmail.stdin.end(message);
    sendmail.on("error", reject);
    sendmail.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`sendmail exited with code ${code}`));
    });
  });

const serveFile = (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const normalized = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(root, normalized === "/" ? "index.html" : normalized);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    response.writeHead(200, { "Content-Type": mime[path.extname(filePath)] || "application/octet-stream" });
    response.end(data);
  });
};

const server = http.createServer(async (request, response) => {
  if (request.method === "POST" && request.url === "/api/order") {
    try {
      const params = new URLSearchParams(await readBody(request));
      const fields = Object.fromEntries(params.entries());
      await sendMail(fields);
      response.writeHead(303, { Location: "/success.html" });
      response.end();
    } catch (error) {
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(`Не удалось отправить письмо: ${error.message}`);
    }
    return;
  }

  if (request.method === "GET" || request.method === "HEAD") {
    serveFile(request, response);
    return;
  }

  response.writeHead(405);
  response.end("Method not allowed");
});

server.listen(port, () => {
  console.log(`iRoom server running at http://localhost:${port}`);
});
