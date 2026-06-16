const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-3.1-flash-image-preview";

export const IMAGE_MODELS = [
  { id: "google/gemini-3-pro-image-preview", label: "Nano Banana Pro", description: "คุณภาพสูง ราคาแพง" },
  { id: "google/gemini-3.1-flash-image-preview", label: "Nano Banana 2", description: "คุณภาพดี ราคาถูก" },
] as const;

export type ImageModelId = (typeof IMAGE_MODELS)[number]["id"];

export const ASPECT_RATIOS = [
  { id: "1:1", label: "1:1", description: "สี่เหลี่ยมจัตุรัส" },
  { id: "4:5", label: "4:5", description: "แนวตั้ง (IG/FB)" },
  { id: "16:9", label: "16:9", description: "แนวนอน" },
] as const;

export type AspectRatioId = (typeof ASPECT_RATIOS)[number]["id"];

interface GenerateImageOptions {
  prompt: string;
  aspectRatio?: string;
  model?: string;
}

export async function generateImage(
  options: GenerateImageOptions,
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
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
      model: options.model || DEFAULT_MODEL,
      modalities: ["image", "text"],
      messages: [{ role: "user", content: [{ type: "text", text: options.prompt }] }],
      image_config: {
        aspect_ratio: options.aspectRatio || "1:1",
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Image API HTTP ${response.status}: ${text.slice(0, 200)}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`Image AI error: ${data.error.message ?? JSON.stringify(data.error)}`);
  }

  // ดึง image จาก response
  const images = data.choices?.[0]?.message?.images;
  if (images && Array.isArray(images) && images.length > 0) {
    const url = images[0]?.image_url?.url;
    if (url) return url;
  }

  // บาง model อาจส่ง inline base64 ใน content
  const msgContent = data.choices?.[0]?.message?.content;
  if (typeof msgContent === "string" && msgContent.includes("data:image")) {
    const match = msgContent.match(/(data:image\/[^;]+;base64,[A-Za-z0-9+/=]+)/);
    if (match) return match[1];
  }

  throw new Error(`ไม่ได้รับภาพจาก AI — response: ${JSON.stringify(data).slice(0, 300)}`);
}
