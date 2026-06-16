export const ENGAGEMENT_CATEGORIES = [
  { id: "riddle", label: "ทายปริศนา / คำถามเชาว์", description: "ภาพปริศนาให้คิด เช่น ตัวไหนได้กินน้ำก่อน" },
  { id: "debate", label: "เลือกข้าง / ถกเถียง", description: "คำถามที่มีหลายมุมมอง ชวนให้ถกกัน" },
  { id: "would-you-rather", label: "คุณจะเลือกอะไร?", description: "เลือกระหว่าง 2+ สิ่ง" },
  { id: "vote", label: "โหวต / จัดอันดับ", description: "ให้คนโหวตเลือกสิ่งที่ชอบ" },
  { id: "guess-who", label: "ทายคำตอบ / ใครคือ...", description: "เช่น ใครคือมหาเศรษฐี, คนไหนเป็น..." },
  { id: "situation", label: "สถานการณ์สมมุติ", description: "ถ้าเจอสถานการณ์นี้ คุณจะทำยังไง" },
  { id: "filter", label: "ฟิลเตอร์ตัวเอง", description: "ตอบตามเดือนเกิด / ตัวเลข / ชื่อ → ได้ผลลัพธ์ของตัวเอง" },
  { id: "fill-blank", label: "เติมคำในช่องว่าง", description: "ให้คนคอมเมนต์เติมประโยคให้สมบูรณ์" },
  { id: "guess-price", label: "ราคาเท่าไหร่?", description: "โชว์ภาพสินค้า/สถานที่ ให้คนทายราคา" },
  { id: "true-or-fake", label: "จริงหรือมโน?", description: "ให้ทายว่าเรื่องราว/ภาพนี้เป็นจริงหรือแต่งขึ้น" },
  { id: "champ-in-group", label: "แชมป์ในกลุ่มคุณ", description: "ให้ tag เพื่อนที่ใช่กับคำถาม เช่น ใครมาสายที่สุด" },
  { id: "fortune", label: "ดวงรายสัปดาห์", description: "เลือกสัญลักษณ์/ไพ่ แล้วเฉลยดวงชะตา" },
  { id: "count-find", label: "เกมนับ/หาของ", description: "ภาพที่ต้องนับจำนวน หรือหาสิ่งที่ซ่อนอยู่" },
  { id: "like-dislike", label: "ชอบหรือไม่ชอบ?", description: "โชว์ภาพอาหาร/สถานที่ ให้แสดงความชอบ เช่น กิน/ไม่กิน" },
] as const;

export type EngagementCategoryId = (typeof ENGAGEMENT_CATEGORIES)[number]["id"];

export const IMAGE_STYLES = [
  { id: "3d-cartoon", label: "3D Cartoon", description: "ตัวการ์ตูน 3 มิติ สีสดใส" },
  { id: "realistic", label: "Realistic", description: "ภาพสมจริง เหมือนถ่ายจริง" },
  { id: "flat-illustration", label: "Flat Illustration", description: "ภาพวาดแบน สีพื้น" },
  { id: "anime", label: "Anime / Manga", description: "สไตล์อนิเมะญี่ปุ่น" },
  { id: "clay-3d", label: "Clay / Claymation", description: "ดินน้ำมัน 3 มิติ น่ารัก" },
  { id: "pixel-art", label: "Pixel Art", description: "พิกเซลอาร์ต เกมย้อนยุค" },
] as const;

export type ImageStyleId = (typeof IMAGE_STYLES)[number]["id"];

const STYLE_PROMPT_MAP: Record<string, string> = {
  "3d-cartoon": "3D cartoon Pixar-style characters, vibrant colors, smooth rendering, cute and expressive faces",
  "realistic": "photorealistic, high detail, natural lighting, like a real photograph",
  "flat-illustration": "flat design illustration, solid colors, minimal shadows, clean vector-like style",
  "anime": "anime/manga style, Japanese animation aesthetic, expressive eyes, cel-shaded",
  "clay-3d": "claymation style, clay figures, stop-motion look, soft textures, playful 3D",
  "pixel-art": "pixel art style, retro game aesthetic, 8-bit/16-bit look, chunky pixels",
};

const CATEGORY_EXTRA_INSTRUCTIONS: Record<string, string> = {
  "fortune": `
กฎพิเศษสำหรับหมวดดวง:
- headline ต้องเป็นคำถามชวนเลือก เช่น "เลือก 1 สัญลักษณ์ รับดวงสัปดาห์นี้เลย!"
- choices ต้องเป็น สัญลักษณ์ลึกลับ/วัตถุมงคล ให้คนเลือก เช่น: ลูกแก้ว, ไพ่ทาโรต์, ดาวตก, พระจันทร์, คริสตัล, ดอกไม้มงคล
- ห้ามใช้หมวดดวงเป็น choices (ห้ามใส่ ดวงความรัก/ดวงการเงิน/ดวงการงาน เป็น choices)
- caption ต้องบอกให้คนคอมเมนต์เลขของสัญลักษณ์ที่เลือก แล้วบอกว่าจะเฉลยดวงในคอมเมนต์
- imageDescription ต้องบรรยายบรรยากาศลึกลับ มีดวงดาว หมอก ไพ่ หรือวัตถุมงคลแต่ละชิ้นวางโดดเด่น มีหมายเลขกำกับชัดเจน`,
};

export function buildIdeaPrompt(
  category: string,
  categoryId: string,
  choiceCount: number,
  customTopic?: string,
): string {
  const topicInstruction = customTopic
    ? `หัวข้อที่กำหนด: "${customTopic}"`
    : "คิดหัวข้อที่น่าสนใจ เป็นกระแส หรือเกี่ยวกับชีวิตประจำวันที่คนทั่วไปสนใจ";

  const extraInstruction = CATEGORY_EXTRA_INSTRUCTIONS[categoryId] || "";

  return `คุณเป็นผู้เชี่ยวชาญสร้าง Engagement Content สำหรับเพจ Facebook ภาษาไทย

หมวดหมู่: ${category}
จำนวนตัวเลือก: ${choiceCount}
${topicInstruction}

สร้างไอเดียคอนเทนต์ 1 ชิ้น ที่ชวนให้คนคอมเมนต์ตอบ โดยตอบเป็น JSON เท่านั้น:
{
  "headline": "ข้อความหลักบนภาพ (สั้น กระชับ ดึงดูด ภาษาไทย)",
  "choices": ["ตัวเลือก 1", "ตัวเลือก 2", ...],
  "caption": "แคปชั่นสำหรับโพสต์ Facebook (1-2 บรรทัด ชวนให้คอมเมนต์ มี emoji)",
  "imageDescription": "อธิบายภาพที่ควรสร้างประกอบ (อธิบายฉาก ตัวละคร สิ่งของ ที่จะปรากฏในภาพ เป็นภาษาอังกฤษ)"
}

กฎ:
- headline ต้องสั้น จับใจ อ่านง่าย
- choices ต้องมีจำนวน ${choiceCount} ตัวเลือก
- แต่ละ choice สั้นกระชับ 1-3 คำ
- caption ต้องชวนให้คนอยากคอมเมนต์ตอบ
- imageDescription ต้องอธิบายองค์ประกอบภาพให้ละเอียด เพื่อ AI สร้างภาพได้ตรง
- ตอบ JSON เท่านั้น ห้ามมีข้อความอื่น
${extraInstruction}`;
}

const CATEGORY_IMAGE_STYLE_OVERRIDE: Record<string, string> = {
  "fortune": "mystical and magical atmosphere, deep purple and dark navy background with glowing golden stars, soft glowing light rays, elegant tarot card aesthetic, mysterious fog, sparkling magical particles, rich jewel tones",
};

export function buildImagePrompt(
  headline: string,
  choices: string[],
  imageDescription: string,
  imageStyle: string,
  categoryId?: string,
): string {
  const styleDesc = (categoryId && CATEGORY_IMAGE_STYLE_OVERRIDE[categoryId])
    || STYLE_PROMPT_MAP[imageStyle]
    || STYLE_PROMPT_MAP["3d-cartoon"];

  const choiceLabels = choices
    .map((c, i) => `${i + 1}. ${c}`)
    .join("\n");

  return `สร้างภาพ Engagement Content สำหรับ Facebook สไตล์: ${styleDesc}

ภาพต้องมีองค์ประกอบดังนี้:

1. **ข้อความหลัก (headline):** "${headline}"
   - แสดงเด่นชัดด้านบนของภาพ ตัวหนังสือใหญ่ อ่านง่าย สีสะดุดตา
   - ภาษาไทย ทุกตัวอักษรต้องถูกต้อง copy ตามที่ให้มาเป๊ะ ๆ

2. **ตัวเลือก:**
${choiceLabels}
   - แต่ละตัวเลือกต้องมีตัวเลข (1, 2, 3...) กำกับชัดเจน
   - แสดงเป็นภาพประกอบหรือไอคอนที่สื่อความหมายของแต่ละตัวเลือก

3. **องค์ประกอบภาพ:** ${imageDescription}

**กฎสำคัญ:**
- ภาพต้องสวยงาม สีสันสดใส ดึงดูดสายตา
- ข้อความภาษาไทยต้องถูกต้องทุกตัวอักษร ชัดเจน อ่านง่าย
- ตัวเลือกแต่ละข้อต้องแยกชัดเจน มีภาพประกอบ
- ห้ามมีข้อความอื่นนอกจากที่กำหนด
- Layout สะอาด ไม่รก ดูเป็นมืออาชีพ`;
}
