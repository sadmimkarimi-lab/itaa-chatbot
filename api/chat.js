// api/chat.js
export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      message: "ChatGPT API آماده است 🚀",
    });
  }

  if (req.method === "POST") {
    try {
      const { text, chatHistory = [] } = req.body || {};
      if (!text) {
        return res.status(400).json({ ok: false, error: "متن خالی است" });
      }

      // ایجاد تاریخچه جدید چت
      const newChatHistory = [
        ...chatHistory,
        { role: "user", content: text },
      ];
      
      // درخواست به OpenAI با مدل gpt-4 و تاریخچه چت
      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4",  // یا مدل دیگر موردنظر
          messages: newChatHistory,
          max_tokens: 150, // حداکثر تعداد کلمات
          temperature: 0.7, // میزان خلاقیت
          top_p: 1,         // تنظیمات دیگر
          frequency_penalty: 0.5,
          presence_penalty: 0.5
        }),
      });

      const data = await openaiRes.json();
      const answer =
        data.choices?.[0]?.message?.content?.trim() ||
        "جوابی نگرفتم.";

      // ارسال پاسخ جدید به‌همراه تاریخچه جدید
      return res.status(200).json({
        ok: true,
        answer,
        chatHistory: [...newChatHistory, { role: "assistant", content: answer }],
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ ok: false, error: "server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
