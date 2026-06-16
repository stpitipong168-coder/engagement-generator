const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
}

export async function chatCompletion(
  messages: ChatMessage[],
  options: OpenRouterOptions = {},
): Promise<string> {
  const {
    model = process.env.OPENROUTER_IDEA_MODEL || "anthropic/claude-sonnet-4-5",
    temperature = 0.7,
    maxTokens = 1024,
    apiKey = process.env.OPENROUTER_IDEA_API_KEY || process.env.OPENROUTER_API_KEY,
  } = options;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY ยังไม่ได้ตั้งค่า — กรุณาใส่ใน .env.local");
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "",
      "X-Title": "Engagement Generator",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter HTTP ${response.status}: ${text.slice(0, 200)}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`OpenRouter error: ${data.error.message ?? JSON.stringify(data.error)}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter ไม่ได้ส่งข้อความกลับมา — ลองใหม่อีกครั้ง");
  return content;
}
