// api/eitaa-bot.js

const BOT_TOKEN = process.env.EITA_TOKEN; // توکن ربات ایتا
const API_BASE = `https://api.eitaa.com/bot${BOT_TOKEN}`; // آدرس API ربات ایتا

// تابع برای ارسال پیام به ایتا
async function sendMessage(chat_id, text, extra = {}) {
  await fetch(`${API_BASE}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id,
      text,
      ...extra,
    }),
  });
}

// این تابع برای دریافت و پردازش پیام از ایتا
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("OK");

  const update = req.body;
  const msg = update.message;
  if (!msg) return res.status(200).json({ ok: true });

  const chatId = msg.chat.id;
  const text = msg.text || "";

  // مرحله خوش‌آمدگویی
  if (text === "/start") {
    await sendMessage(chatId, "سلام 👋 من چت‌بات هوش مصنوعی هستم.");
    await sendMessage(chatId, "چگونه می‌توانم به شما کمک کنم؟");
    return res.status(200).json({ ok: true });
  }

  // بقیه پیام‌ها رو بفرست به ChatGPT
  const resp = await fetch(`${req.headers.origin}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  }).then(r => r.json());

  await sendMessage(chatId, resp.answer || "نتونستم جواب بگیرم 😔");
  return res.status(200).json({ ok: true });
}
