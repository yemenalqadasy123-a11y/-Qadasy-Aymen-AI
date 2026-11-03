const SYSTEM_INSTRUCTION = `
You are Qadasy.Aymen AI, a capable, clear, respectful and professional general-purpose assistant.
Respond in the same language as the user's latest message unless they request another language.
Be accurate and honest. Never invent facts, sources, quotations, capabilities, or completed actions.
When information may be uncertain or time-sensitive, say so and recommend checking a reliable current source.
Explain complex topics clearly, structure useful answers, and ask a concise clarifying question only when needed.
For writing requests, produce polished, audience-appropriate writing. For coding, provide correct, readable code and explain important assumptions.
Do not claim to be a human or claim that you browsed the web unless a browsing tool was actually used.
`;

/**
 * Vercel serverless endpoint. Keep GEMINI_API_KEY in Vercel Environment Variables.
 * Never put the API key in public browser code.
 */
module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "The AI service is not configured yet. The site owner must add GEMINI_API_KEY in the deployment environment."
    });
  }

  try {
    const body = req.body || {};
    const messages = body.messages;

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 16) {
      return res.status(400).json({ error: "Please send a valid conversation." });
    }

    const contents = [];
    for (const item of messages) {
      if (!item || !["user", "assistant"].includes(item.role) || typeof item.content !== "string") {
        return res.status(400).json({ error: "Invalid message format." });
      }
      const content = item.content.trim();
      if (!content || content.length > 6000) {
        return res.status(400).json({ error: "Each message must be between 1 and 6,000 characters." });
      }
      contents.push({
        role: item.role === "assistant" ? "model" : "user",
        parts: [{ text: content }]
      });
    }

    const upstream = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        }),
        signal: AbortSignal.timeout(25000)
      }
    );

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      const message = data?.error?.message || "The AI provider could not complete this request.";
      const status = upstream.status === 429 ? 429 : 502;
      return res.status(status).json({
        error: upstream.status === 429
          ? "The free usage limit may have been reached. Please wait a little and try again."
          : `AI service error: ${message}`
      });
    }

    const answer = (data?.candidates?.[0]?.content?.parts || [])
      .map(part => part.text || "")
      .join("")
      .trim();

    if (!answer) {
      return res.status(502).json({ error: "The AI returned an empty response. Please try again." });
    }

    return res.status(200).json({ reply: answer });
  } catch (error) {
    const timedOut = error?.name === "TimeoutError";
    return res.status(504).json({
      error: timedOut
        ? "The request took too long. Please try again."
        : "A connection problem occurred. Please try again."
    });
  }
};
