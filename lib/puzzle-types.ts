// ============================================================
// FACEBOOK SAFETY RULE — กฎบังคับสำหรับทุก prompt ในไฟล์นี้
// และทุก prompt ที่จะเพิ่มในอนาคต
//
// ⚠️  ต้องใส่ ${FB_SAFE_RULE} ใน prompt ทุกตัวโดยไม่มีข้อยกเว้น
// ⚠️  ใส่ทั้งใน text prompt (AI คิดไอเดีย) และ image prompt (AI วาดภาพ)
// ============================================================
export const FB_SAFE_RULE = `
[Facebook Safety — บังคับทุก prompt ห้ามละเมิดเด็ดขาด]
- ห้ามเลือกคำ/สำนวน/หัวข้อที่ต้องแสดงภาพร่างกายมนุษย์ส่วนใดก็ตาม (ก้น หน้าอก อวัยวะเพศ หรือส่วนที่อาจมองว่าไม่เหมาะสม)
- ห้ามมีเนื้อหาทางเพศ ความรุนแรง เลือด ยาเสพติด แอลกอฮอล์ หรือสิ่งผิดกฎหมาย
- ต้องเหมาะสมสำหรับทุกช่วงอายุ ผ่าน Facebook Community Standards 100%
- ถ้าเนื้อหาที่คิดอยู่มีความเสี่ยงแม้เพียงเล็กน้อย ให้เปลี่ยนหัวข้อทันทีโดยไม่ต้องถาม`;

// ============================================================

export const PUZZLE_TYPES = [
  {
    id: "find-hidden",
    label: "หาของซ่อน",
    emoji: "🔍",
    description: "กริดตัวเลข/ตัวอักษร ซ่อนสิ่งที่ต่างไว้ให้หา",
    method: "canvas" as const,
  },
  {
    id: "rebus-word",
    label: "ทายภาพ X พยางค์",
    emoji: "🧩",
    description: "รูปภาพที่รวมกันออกเสียงเป็นคำ — ให้คนทาย",
    method: "ai" as const,
  },
  {
    id: "count-items",
    label: "นับ X กี่ตัว",
    emoji: "🔢",
    description: "ภาพสัตว์/วัตถุหลายชิ้น บางซ่อน บางซ้อน — ให้คนนับ",
    method: "ai" as const,
  },
  {
    id: "math-challenge",
    label: "คณิตคิดเร็ว",
    emoji: "🧮",
    description: "โจทย์คำนวณที่ดูยาก แต่คิดได้ — ห้ามใช้เครื่องคิดเลข",
    method: "canvas" as const,
  },
] as const;

export type PuzzleTypeId = (typeof PUZZLE_TYPES)[number]["id"];

// Canvas puzzle data types (returned from API, rendered client-side)
export type FindHiddenFormat = "find" | "count" | "different";

export interface FindHiddenData {
  mainChar: string;
  // Each hidden cell carries its own char so a grid can mix several odd values
  // (needed for the "หาตัวที่ไม่ใช่" format). For find/count all chars are the same.
  hidden: { r: number; c: number; char: string }[];
  rows: number;
  cols: number;
  headline: string;
  theme?: "sky" | "sunset" | "space" | "polkadots" | "stripes" | "chalkboard" | "graphpaper" | "neon" | "autumn" | "ocean" | "bubbles" | "confetti" | "blueprint" | "hearts" | "honeycomb" | "notebook" | "wood" | "kraft" | "candy" | "mintdots" | "lavender";
}

export interface MathChallengeData {
  equation: string;
  answer: number;
  headline: string;
  subText?: string;
  theme?: "notebook" | "wood" | "chalkboard" | "vintage" | "graph" | "kraft";
  // When set, the canvas paints this AI-generated scene as the background
  // and overlays the equation text on top (AI background mode).
  backgroundImageDataUri?: string;
}

// Photoreal scene prompts for the "สวย (AI)" background mode. The AI must draw
// ONLY the surface/scene with an empty middle — the canvas overlays all text,
// so the image must contain NO numbers or letters.
export const MATH_AI_SCENES: readonly string[] = [
  "a real dark green school chalkboard inside a warm wooden frame, faint chalk dust and a few colourful tiny chalk doodles (stars, hearts) only in the far corners",
  "a top-down view of an open lined school notebook page, soft natural light, a yellow pencil and a small eraser resting near the bottom corner",
  "a hanging wooden signboard with carved rounded edges, against a cozy cafe wall with soft bokeh lights in the background",
  "a vintage cream parchment poster with aged paper texture, decorative ornate corners and a thin classic border frame",
  "a sheet of light blue graph/grid paper on a wooden desk, a ruler and a colourful sticky note in one corner",
  "a brown kraft-paper card pinned to a cork board with colourful push-pins and a little washi-tape strip in the corner",
];

export function buildMathBackgroundPrompt(scene: string): string {
  return `Create a 1:1 square photorealistic BACKGROUND image for a Thai Facebook math puzzle post.
${FB_SAFE_RULE}

Scene: ${scene}

CRITICAL RULES:
- The CENTER 60% of the image MUST be clean and empty (no objects, no clutter) — text will be added later on top.
- Absolutely NO text, NO numbers, NO letters, NO equations, NO digits anywhere in the image.
- Decorations/props only near the edges and corners; keep them subtle so overlaid text stays readable.
- Bright, colourful, eye-catching, high quality. Square 1:1 composition.`;
}

// Rotating banks so the on-image text never looks repetitive.
// headline = top banner hook, subText = challenge line under the equation.
export const MATH_HOOKS: readonly string[] = [
  "ทดสอบ IQ",
  "คณิตคิดเร็ว",
  "ใครตอบได้ช่วยที",
  "ท้าให้คิด!",
  "วัดไอคิวกันหน่อย",
  "ข้อนี้ตอบถูกไหม",
  "ใครเก่งเลขช่วยที",
  "ลองคิดดูสิ!",
  "เกมคณิตคิดเร็ว",
  "ใครฉลาดตอบเลย",
];

export const MATH_SUBS: readonly string[] = [
  "ห้ามใช้เครื่องคิดเลข",
  "ให้เวลา 10 วินาที",
  "ให้เวลา 20 วินาที",
  "คิดในใจเท่านั้น",
  "ตอบให้ไวที่สุด",
  "ห้ามกดเครื่องคิดเลขนะ",
  "ใครตอบถูกคอมเมนต์เลย",
  "คิดออกไหมเอ่ย?",
];

// ===== PROMPT BUILDERS =====
// ⚠️  ทุก function ต้องมี ${FB_SAFE_RULE} เสมอ — ทั้ง text prompt และ image prompt

// Pre-defined pair bank — visually similar char pairs that make the puzzle fun
// Using hardcoded bank eliminates AI repetition entirely
export const FIND_HIDDEN_PAIRS: ReadonlyArray<{
  mainChar: string;
  hiddenChar: string;
  headline: string;
}> = [
  { mainChar: "98", hiddenChar: "96", headline: "หาเลข 96 ให้เจอ" },
  { mainChar: "6",  hiddenChar: "9",  headline: "หาเลข 9 ให้เจอ" },
  { mainChar: "E",  hiddenChar: "F",  headline: "หา F ให้เจอ" },
  { mainChar: "B",  hiddenChar: "8",  headline: "หา 8 ให้เจอ" },
  { mainChar: "88", hiddenChar: "68", headline: "หาเลข 68 ให้เจอ" },
  { mainChar: "S",  hiddenChar: "5",  headline: "หา 5 ให้เจอ" },
  { mainChar: "M",  hiddenChar: "N",  headline: "หา N ให้เจอ" },
  { mainChar: "66", hiddenChar: "99", headline: "หาเลข 99 ให้เจอ" },
  { mainChar: "ป",  hiddenChar: "บ",  headline: "หา บ ให้เจอ" },
  { mainChar: "ฝ",  hiddenChar: "ฟ",  headline: "หา ฟ ให้เจอ" },
  { mainChar: "น",  hiddenChar: "ม",  headline: "หา ม ให้เจอ" },
  { mainChar: "P",  hiddenChar: "R",  headline: "หา R ให้เจอ" },
  { mainChar: "19", hiddenChar: "79", headline: "หาเลข 79 ให้เจอ" },
  { mainChar: "Z",  hiddenChar: "2",  headline: "หา 2 ให้เจอ" },
  { mainChar: "C",  hiddenChar: "G",  headline: "หา G ให้เจอ" },
  { mainChar: "3",  hiddenChar: "8",  headline: "หาเลข 8 ให้เจอ" },
  { mainChar: "H",  hiddenChar: "M",  headline: "หา M ให้เจอ" },
  { mainChar: "86", hiddenChar: "88", headline: "หาเลข 88 ให้เจอ" },
  { mainChar: "W",  hiddenChar: "V",  headline: "หา V ให้เจอ" },
  { mainChar: "96", hiddenChar: "69", headline: "หาเลข 69 ให้เจอ" },
  { mainChar: "9",  hiddenChar: "6",  headline: "หาเลข 6 ให้เจอ" },
  { mainChar: "D",  hiddenChar: "0",  headline: "หา 0 ให้เจอ" },
  { mainChar: "1",  hiddenChar: "7",  headline: "หา 7 ให้เจอ" },
  { mainChar: "ก",  hiddenChar: "า",  headline: "หา า ให้เจอ" },
  { mainChar: "36", hiddenChar: "38", headline: "หาเลข 38 ให้เจอ" },
  { mainChar: "V",  hiddenChar: "Y",  headline: "หา Y ให้เจอ" },
  { mainChar: "17", hiddenChar: "71", headline: "หาเลข 71 ให้เจอ" },
  { mainChar: "ด",  hiddenChar: "ต",  headline: "หา ต ให้เจอ" },
  { mainChar: "O",  hiddenChar: "D",  headline: "หา D ให้เจอ" },
];

// 3-digit numbers for the "หาตัวที่ไม่ใช่ X" format — variants look similar but differ
export const FIND_DIFFERENT_BANK: ReadonlyArray<{ main: string; variants: string[] }> = [
  { main: "553", variants: ["535", "355", "533", "335"] },
  { main: "717", variants: ["771", "177", "711"] },
  { main: "808", variants: ["880", "088", "800"] },
  { main: "696", variants: ["669", "966", "699"] },
  { main: "121", variants: ["112", "211", "122"] },
  { main: "858", variants: ["885", "588", "558"] },
  { main: "343", variants: ["334", "433", "344"] },
  { main: "626", variants: ["662", "266", "622"] },
  { main: "989", variants: ["899", "998", "988"] },
  { main: "474", variants: ["447", "744", "477"] },
];

const pickOne = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Headline phrasing varies per format so posts never look templated.
export function buildFindHiddenHeadline(format: FindHiddenFormat, target: string): string {
  if (format === "count") {
    return pickOne([
      `ในภาพมี ${target} กี่ตัว`,
      `ในภาพมีตัว ${target} กี่ตัว`,
      `นับ ${target} ได้กี่ตัว`,
      `มี ${target} ทั้งหมดกี่ตัว`,
    ]);
  }
  if (format === "different") {
    return pickOne([
      `หาตัวที่ไม่ใช่ ${target}`,
      `หาเลขอื่นที่ไม่ใช่ ${target}`,
      `ตัวไหนไม่ใช่ ${target}`,
      `หาตัวแปลกปลอมที่ไม่ใช่ ${target}`,
    ]);
  }
  return pickOne([
    `หา ${target} ให้เจอ`,
    `หา ${target} ให้เจออยู่ตรงไหน`,
    `${target} ซ่อนอยู่ตรงไหน`,
    `หาตัว ${target} ให้เจอ`,
  ]);
}

export function buildFindHiddenCaption(format: FindHiddenFormat, target: string): string {
  if (format === "count") {
    return pickOne([
      `🔢 ในภาพมี ${target} กี่ตัว? นับให้ดีแล้วคอมเมนต์เลย!`,
      `👀 ลองนับสิ มี ${target} ทั้งหมดกี่ตัว? ตอบในคอมเมนต์!`,
      `🧐 สายตาดีไหม? นับ ${target} ให้ครบแล้วบอกมาเลย!`,
      `🎯 ใครนับ ${target} ได้ครบบ้าง? คอมเมนต์จำนวนเลย!`,
    ]);
  }
  if (format === "different") {
    return pickOne([
      `🔍 มีตัวที่ไม่ใช่ ${target} ซ่อนอยู่! หาให้เจอแล้วคอมเมนต์!`,
      `👁️ ตาเฉียบไหม? หาตัวที่ไม่ใช่ ${target} ในภาพให้เจอ!`,
      `🧐 ในภาพมีตัวแปลกปลอมที่ไม่ใช่ ${target} หาเจอไหม คอมเมนต์เลย!`,
      `🎯 หาเลขอื่นที่ไม่ใช่ ${target} ให้เจอ คอมเมนต์ตำแหน่งเลย!`,
    ]);
  }
  return pickOne([
    `👀 มี ${target} ซ่อนอยู่ในภาพ หาเจอมั้ย? คอมเมนต์บอกเลย!`,
    `🔍 สายตาดีไหม? หา ${target} ในกลุ่มให้เจอสิ! คอมเมนต์เฉลย`,
    `🧐 จะหาเจอมั้ย? ${target} ซ่อนแอบอยู่ในภาพ แชร์ถ้าหาเจอ!`,
    `🏆 ใครหาเจอก่อน? มี ${target} ซ่อนอยู่ในนี้ คอมเมนต์ตำแหน่ง!`,
  ]);
}

// Rotating category pool so each generation is nudged toward a different theme
// instead of always landing on popular food words.
const REBUS_WORD_CATEGORIES: readonly string[] = [
  "อาหารคาว (เช่น ผัดไทย กุ้งเผา)",
  "ขนม/ของหวาน (เช่น ขนมครก ทองหยอด)",
  "ผลไม้ (เช่น มะม่วง น้อยหน่า)",
  "สัตว์ (เช่น เสือดาว ช้างน้อย)",
  "ของใช้ในบ้าน (เช่น พัดลม ไม้กวาด)",
  "สถานที่/ธรรมชาติ (เช่น น้ำตก ภูเขา)",
  "อาชีพ (เช่น ชาวนา หมอฟัน)",
  "เครื่องครัว (เช่น กระทะ ตะหลิว)",
  "เครื่องแต่งกาย (เช่น หมวกฟาง รองเท้า)",
  "ผัก (เช่น ผักบุ้ง แตงกวา)",
];

export function buildRebusWordPrompt(syllableCount: number, customTopic?: string, excludeWords?: string[]): string {
  const category = REBUS_WORD_CATEGORIES[Math.floor(Math.random() * REBUS_WORD_CATEGORIES.length)];
  const topicLine = customTopic
    ? `หมวดคำที่กำหนด: "${customTopic}"`
    : `หมวดคำรอบนี้: ${category} — เลือกคำในแนวนี้ที่คนไทยทั่วไปรู้จัก`;
  const recent = (excludeWords ?? []).filter(Boolean);
  const excludeLine = recent.length
    ? `\n⚠️ ห้ามใช้คำเหล่านี้ (เพิ่งใช้ไปแล้ว) ให้คิดคำใหม่ที่แตกต่าง: ${recent.map((w) => `"${w}"`).join(", ")}`
    : "";

  const syllableExamples: Record<number, { ok: string[]; wrong: string[] }> = {
    2: {
      ok: ["ปลาทู (ปลา|ทู)", "แมวดำ (แมว|ดำ)", "หมูทอด (หมู|ทอด)", "กล้วยไข่ (กล้วย|ไข่)"],
      wrong: ["ต้มยำกุ้ง = 3 พยางค์ ผิด", "ข้าวผัดกุ้ง = 3 พยางค์ ผิด"],
    },
    3: {
      ok: ["ต้มยำกุ้ง (ต้ม|ยำ|กุ้ง)", "ข้าวผัดกุ้ง (ข้าว|ผัด|กุ้ง)", "กล้วยบวชชี (กล้วย|บวช|ชี)", "หมูกระทะ (หมู|กระ|ทะ)"],
      wrong: ["ส้มตำ = 2 พยางค์ ผิด", "ปลาทู = 2 พยางค์ ผิด", "กล้วยทอด = 2 พยางค์ ผิด"],
    },
    4: {
      ok: ["กระเพราหมูสับ (กระ|เพรา|หมู|สับ)", "มะละกอสุก (มะ|ละ|กอ|สุก)", "ข้าวมันไก่ทอด (ข้าว|มัน|ไก่|ทอด)"],
      wrong: ["ต้มยำกุ้ง = 3 พยางค์ ผิด", "ปลาร้า = 2 พยางค์ ผิด"],
    },
    5: {
      ok: ["ผัดกะเพราหมูสับ (ผัด|กะ|เพรา|หมู|สับ)", "ลาบเป็ดอีสานเผ็ด (ลาบ|เป็ด|อี|สาน|เผ็ด)", "ข้าวโพดอบเนยเค็ม (ข้าว|โพด|อบ|เนย|เค็ม)"],
      wrong: ["กระเพราหมูสับ = 4 พยางค์ ผิด", "ข้าวผัดกุ้ง = 3 พยางค์ ผิด"],
    },
    6: {
      ok: ["ก๋วยเตี๋ยวต้มยำกุ้งน้ำ (ก๋วย|เตี๋ยว|ต้ม|ยำ|กุ้ง|น้ำ)", "มะม่วงน้ำปลาหวานดำ (มะ|ม่วง|น้ำ|ปลา|หวาน|ดำ)", "ปลาหมึกนึ่งมะนาวเผ็ด (ปลา|หมึก|นึ่ง|มะ|นาว|เผ็ด)"],
      wrong: ["ผัดกะเพราหมูสับ = 5 พยางค์ ผิด", "กระเพราหมูสับ = 4 พยางค์ ผิด"],
    },
  };

  const ex = syllableExamples[syllableCount] ?? syllableExamples[3];

  return `คุณเป็นผู้เชี่ยวชาญปริศนาภาษาไทย สร้างโจทย์ "ทายภาพ ${syllableCount} พยางค์"
${FB_SAFE_RULE}

⚠️ กฎสำคัญที่สุด 2 ข้อ:
1. คำที่เลือกต้องมีพยางค์ครบ ${syllableCount} พยางค์เท่านั้น — นับก่อนตอบเสมอ
2. ทุกพยางค์ต้องใช้ type "image" เท่านั้น — ห้ามใช้ type "char" เด็ดขาด ต้องหาวัตถุแทนทุกพยางค์

ตัวอย่างคำ ${syllableCount} พยางค์ที่ถูก (ดู "วิธีนับพยางค์" เท่านั้น ⚠️ ห้ามตอบซ้ำกับตัวอย่างเหล่านี้ ต้องคิดคำใหม่): ${ex.ok.join(", ")}
ตัวอย่างที่ผิด (ห้ามใช้): ${ex.wrong.join(", ")}

วิธีแทนพยางค์ด้วยรูปวัตถุ — คิดจากเสียง:
- "ส้ม" → orange fruit
- "ลิง" → monkey
- "ครก" → mortar and pestle
- "ไทย" → Thai flag หรือ Thai temple
- "ผัด" → frying pan with spatula
- "กุ้ง" → shrimp
- "ข้าว" → pile of white rice
เลือกคำที่พยางค์ทุกตัวมีวัตถุที่แสดงเสียงได้ชัดเจน

${topicLine}${excludeLine}

ตอบ JSON เท่านั้น ห้ามมีข้อความอื่น:
{
  "targetWord": "คำที่ต้องทาย",
  "syllableList": ["พยางค์ที่1", "พยางค์ที่2", ...],
  "rebusElements": [
    {"type": "image", "object": "ชื่อวัตถุ (ภาษาอังกฤษ สำหรับวาด)"}
  ],
  "headline": "ทายภาพ ${syllableCount} พยางค์",
  "imageDescription": "ภาษาอังกฤษ: [thematic background scene related to the word]. Each object is a high-quality illustration — no text labels anywhere.",
  "caption": "แคปชั่น Facebook ชวนทาย ไม่เฉลยคำตอบ (มี emoji)"
}

ก่อนตอบ: (1) นับพยางค์ใน syllableList — ต้องได้ ${syllableCount} พยางค์พอดี (2) ตรวจว่า rebusElements ทุกตัวเป็น type "image" เท่านั้น`;
}

// ===== COUNT-ITEMS variety pools — rotated so images never look the same =====
export const COUNT_ART_STYLES: readonly string[] = [
  "high-quality photorealistic photography, natural lighting",
  "cute glossy 3D render (Pixar / Blender style)",
  "hand-drawn cartoon illustration with bold clean outlines and flat vivid colours",
  "soft dreamy watercolour painting",
  "detailed colored-pencil storybook illustration",
  "vintage black-ink line engraving / etching on warm parchment",
  "rich oil painting with visible brush strokes",
  "kawaii glossy sticker art with subtle outlines",
];

export const COUNT_COMPOSITIONS: readonly string[] = [
  "scattered naturally throughout a detailed scene, several partially hidden behind furniture or plants, a few overlapping",
  "stacked into a tall cuddly pyramid pile, climbing on top of one another, with one or two tiny babies tucked between them",
  "arranged in a tidy 3x3 grid of separate spots, where a couple of the spots secretly include a small baby half-hidden behind the adult",
  "clustered tightly into one big group hug in the centre, with small ones peeking out between the bigger ones",
  "a clever symmetric / mirror-image arrangement that makes it genuinely hard to tell how many there really are",
  "spread across a colourful patterned background (a flower field, starry sky or garden) with a few cleverly camouflaged to blend in",
];

export const COUNT_SETTINGS: readonly string[] = [
  "a cozy living room", "a sunny flower garden", "a rustic farm with hay",
  "a green forest clearing", "a tidy kitchen", "a child's bedroom",
  "a city park", "a sandy beach", "a clean pastel studio backdrop",
];

export const COUNT_BANNER_STYLES: ReadonlyArray<(h: string) => string> = [
  (h) => `A full-width horizontal banner at the VERY TOP (top 12%), solid dark maroon (#6B0000→#8B1515), centred bold WHITE Thai text reading EXACTLY: "${h}". Banner fully visible edge to edge.`,
  (h) => `A decorative RED RIBBON banner at the BOTTOM of the image (bottom 14%), shaped like a curved award ribbon with folded ends, centred bold WHITE Thai text reading EXACTLY: "${h}". The scene fills the area above it.`,
  (h) => `NO banner box. At the VERY TOP, large bold Thai text with a soft white outline so it stays readable on any background — render EXACTLY: "${h}" (up to two centred lines).`,
  (h) => `A centred rounded-rectangle RED pill banner near the TOP (about top 14%), glossy maroon (#8B0000) with rounded ends, centred bold WHITE Thai text reading EXACTLY: "${h}".`,
];

export function buildCountItemsPrompt(
  customTopic?: string,
  excludeSubjects?: string[],
  composition?: string,
  setting?: string,
): string {
  const topicLine = customTopic
    ? `สัตว์/วัตถุที่กำหนด: "${customTopic}"`
    : "เลือกสัตว์หรือวัตถุที่น่าสนใจและหลากหลาย เช่น แมว สุนัข ลูกหมู เป็ด กระต่าย นกแก้ว ม้า ลูกเป็ด แกะ";
  const recent = (excludeSubjects ?? []).filter(Boolean);
  const excludeLine = recent.length
    ? `\n⚠️ ห้ามใช้สิ่งเหล่านี้ (เพิ่งใช้ไปแล้ว) เลือกอันใหม่ที่ต่าง: ${recent.map((w) => `"${w}"`).join(", ")}`
    : "";
  const comp = composition ?? COUNT_COMPOSITIONS[0];
  const scn = setting ?? COUNT_SETTINGS[0];

  return `สร้างโจทย์ "นับ X กี่ตัว" สำหรับ Facebook engagement
${FB_SAFE_RULE}

${topicLine}${excludeLine}

กฎสำคัญ:
- จำนวนต้องทำให้นับยาก (7-15 ตัว)
- บางตัวซ่อนอยู่ บางตัวซ้อนทับกัน บางตัวมีขนาดเล็ก
- imageDescription ต้องอิงองค์ประกอบและฉากที่กำหนดให้รอบนี้ (เพื่อให้ภาพไม่ซ้ำเดิม)

องค์ประกอบภาพรอบนี้ (composition): ${comp}
ฉากรอบนี้ (setting): ${scn}

ตอบ JSON เท่านั้น ห้ามมีข้อความอื่น:
{
  "subject": "สิ่งที่ต้องนับ (ภาษาไทย)",
  "count": จำนวนจริงในภาพ,
  "headline": "เลือกสุ่ม 1 แบบ: 'ในภาพมี[subject]กี่ตัว' / 'คุณเห็น[subject]กี่ตัว?' / 'ฉันเห็น[subject] [count] ตัว คุณเห็นกี่ตัว?' / 'นับ[subject]ให้หน่อย มีกี่ตัว?'",
  "imageDescription": "อธิบายภาพ ภาษาอังกฤษ: [count] [subject] arranged as — ${comp} — set in ${scn}. Some partially hidden, some overlapping, varied sizes.",
  "caption": "แคปชั่น Facebook ชวนนับแล้วคอมเมนต์ ไม่บอกคำตอบ (มี emoji)"
}`;
}

export function buildMathChallengePrompt(difficulty: string, excludeEquation?: string): string {
  const diffMap: Record<string, string> = {
    easy: "บวกลบง่ายๆ แต่มีตัวเลขหลายตัวทำให้สับสน เช่น 90+80+90-50",
    medium: "ผสมบวกลบคูณ ต้องระวังลำดับการคิด เช่น 2+3×4-1",
    hard: "มีเศษส่วน หรือยกกำลัง หรือลำดับซับซ้อน ท้าทาย",
  };
  const excludeLine = excludeEquation ? `\n⚠️ ห้ามใช้โจทย์ "${excludeEquation}" — เพิ่งใช้ไปแล้ว สร้างโจทย์ใหม่` : "";

  return `สร้างโจทย์ "คณิตคิดเร็ว" สำหรับ Facebook engagement
${FB_SAFE_RULE}

ระดับ: ${diffMap[difficulty] || diffMap.medium}${excludeLine}

ตอบ JSON เท่านั้น ห้ามมีข้อความอื่น:
{
  "equation": "สมการ เช่น '90 + 80 + 90 - 50' (ใช้ช่องว่างระหว่าง operator)",
  "answer": คำตอบที่ถูกต้อง (ตัวเลข),
  "headline": "สมการ + ' = ?'  เช่น '90+80+90-50 = ?'",
  "caption": "แคปชั่น Facebook ชวนให้คำนวณแล้วคอมเมนต์ ไม่บอกคำตอบ (มี emoji)"
}`;
}

// Pre-verified proverb bank — only proverbs with standalone-char vowels (า ะ เ แ โ ใ ไ อ)
// ห้ามเพิ่มสำนวนที่มี ิ ี ึ ั ็ ่ ้ — combining chars ทำให้ AI render ผิด
// Object → consonant mapping: frog/rooster=ก, lotus=บ, mouse=น, monkey=ล, star=ด,
//   tiger=ส, snake=ง, buffalo=ค, horse=ม, pig=ห, giant demon=ย, turtle=ต, mountain=ภ
export const PROVERB_BANK: Array<{
  proverb: string;
  meaning: string;
  rebusElements: RebusElement[];
  imageDescription: string;
}> = [
  {
    proverb: "กบในกะลา",
    meaning: "คนที่มีความรู้น้อย แต่คิดว่าตัวเองรู้ดีที่สุด",
    rebusElements: [
      { type: "image", object: "frog" },            // ก
      { type: "image", object: "lotus flower" },    // บ
      { type: "char", char: "ใ" },                 // ใ
      { type: "image", object: "mouse" },           // น
      { type: "image", object: "rooster" },         // ก
      { type: "char", char: "ะ" },                 // ะ
      { type: "image", object: "monkey" },          // ล
      { type: "char", char: "า" },                 // า
    ],
    imageDescription: "warm cream/beige background with a simple coconut shell in bottom corner",
  },
  {
    proverb: "ดาบสองคม",
    meaning: "สิ่งที่มีทั้งประโยชน์และโทษในตัวเดียวกัน",
    rebusElements: [
      { type: "image", object: "star" },            // ด
      { type: "char", char: "า" },                 // า
      { type: "image", object: "lotus flower" },   // บ
      { type: "image", object: "tiger" },           // ส
      { type: "char", char: "อ" },                 // อ
      { type: "image", object: "snake" },           // ง
      { type: "image", object: "buffalo" },         // ค
      { type: "image", object: "horse" },           // ม
    ],
    imageDescription: "pale sage green background, clean and minimal",
  },
  {
    proverb: "หมาหยอกไก่",
    meaning: "แกล้งทำเป็นเพื่อน แต่หวังร้ายในใจ",
    rebusElements: [
      { type: "image", object: "pig" },             // ห (หมา)
      { type: "image", object: "horse" },           // ม (หมา)
      { type: "char", char: "า" },                 // า
      { type: "image", object: "pig" },             // ห (หยอก)
      { type: "image", object: "giant demon" },     // ย (หยอก)
      { type: "char", char: "อ" },                 // อ
      { type: "image", object: "rooster" },         // ก (หยอก)
      { type: "char", char: "ไ" },                 // ไ (ไก่)
      { type: "image", object: "rooster" },         // ก (ไก่)
    ],
    imageDescription: "warm sunny farmyard, golden straw ground, soft blue sky background",
  },
  {
    proverb: "ปากหมาหางเสือ",
    meaning: "คนที่แสดงออกเป็นมิตรแต่มีอันตรายซ่อนอยู่ คาดเดาไม่ได้",
    rebusElements: [
      { type: "image", object: "fish" },            // ป (ปาก)
      { type: "char", char: "า" },                 // า
      { type: "image", object: "rooster" },         // ก (ปาก)
      { type: "image", object: "pig" },             // ห (หมา)
      { type: "image", object: "horse" },           // ม (หมา)
      { type: "char", char: "า" },                 // า
      { type: "image", object: "pig" },             // ห (หาง)
      { type: "char", char: "า" },                 // า
      { type: "image", object: "snake" },           // ง (หาง)
      { type: "char", char: "เ" },                 // เ (เสือ)
      { type: "image", object: "tiger" },           // ส (เสือ)
    ],
    imageDescription: "misty jungle background, soft golden light filtering through trees",
  },
  {
    proverb: "หมาสองหาง",
    meaning: "คนที่เล่นสองฝ่าย พูดอีกอย่างทำอีกอย่าง ไม่น่าไว้ใจ",
    rebusElements: [
      { type: "image", object: "pig" },             // ห (หมา)
      { type: "image", object: "horse" },           // ม (หมา)
      { type: "char", char: "า" },                 // า
      { type: "image", object: "tiger" },           // ส (สอง)
      { type: "char", char: "อ" },                 // อ
      { type: "image", object: "snake" },           // ง (สอง)
      { type: "image", object: "pig" },             // ห (หาง)
      { type: "char", char: "า" },                 // า
      { type: "image", object: "snake" },           // ง (หาง)
    ],
    imageDescription: "light pastel lavender background, soft and clean",
  },
  {
    proverb: "โลภมากลาภหาย",
    meaning: "การโลภมากเกินไปจะทำให้เสียสิ่งที่มีอยู่แล้ว",
    rebusElements: [
      { type: "char", char: "โ" },                 // โ (โลภ)
      { type: "image", object: "monkey" },          // ล (โลภ)
      { type: "image", object: "mountain" },        // ภ (โลภ)
      { type: "image", object: "horse" },           // ม (มาก)
      { type: "char", char: "า" },                 // า
      { type: "image", object: "rooster" },         // ก (มาก)
      { type: "image", object: "monkey" },          // ล (ลาภ)
      { type: "char", char: "า" },                 // า
      { type: "image", object: "mountain" },        // ภ (ลาภ)
      { type: "image", object: "pig" },             // ห (หาย)
      { type: "char", char: "า" },                 // า
      { type: "image", object: "giant demon" },     // ย (หาย)
    ],
    imageDescription: "dark dramatic background with scattered glowing gold coins and jewels",
  },
];

// Object → emoji for the canvas-rendered proverb rebus. The object name implies a
// Thai word whose FIRST consonant is the decoded letter (e.g. frog=กบ→ก).
export const OBJECT_EMOJI: Record<string, string> = {
  "frog": "🐸",          // กบ → ก
  "rooster": "🐓",        // ไก่ → ก
  "lotus flower": "🪷",   // บัว → บ
  "mouse": "🐭",          // หนู → น
  "monkey": "🐒",         // ลิง → ล
  "star": "⭐",           // ดาว → ด
  "tiger": "🐅",          // เสือ → ส
  "snake": "🐍",          // งู → ง
  "buffalo": "🐃",        // ควาย → ค
  "horse": "🐴",          // ม้า → ม
  "pig": "🐷",            // หมู → ห
  "giant demon": "👹",    // ยักษ์ → ย
  "fish": "🐟",           // ปลา → ป
  "mountain": "⛰️",       // ภูเขา → ภ
  "turtle": "🐢",         // เต่า → ต
};

// Rotating banner hooks + captions for proverb-rebus (no answer revealed)
export const PROVERB_HOOKS: readonly string[] = [
  "ทายสำนวนจากภาพ",
  "ภาพนี้คือสำนวนอะไร",
  "ถอดรหัสเป็นสำนวนไทย",
  "สำนวนนี้คืออะไรเอ่ย",
  "เก่งไทยช่วยทายที!",
];

export const PROVERB_CAPTIONS: readonly string[] = [
  "🧩 ภาพนี้ซ่อนสำนวนไทยอะไร? ถอดรหัสแล้วคอมเมนต์เลย!",
  "🤔 ทายสำนวนจากภาพให้ออก! ใครรู้คอมเมนต์เลย",
  "📜 รูปพวกนี้รวมเป็นสำนวนไทยว่าอะไร? ตอบในคอมเมนต์!",
  "🎯 ใครเก่งภาษาไทย? ถอดรหัสภาพนี้เป็นสำนวนให้หน่อย!",
  "👀 อ่านภาพออกไหม? นี่คือสำนวนไทยสุดฮิต ทายเลย!",
];

export function buildProverbRebusPrompt(customTopic?: string, excludeProverb?: string): string {
  const topicLine = customTopic
    ? `เลือกสำนวนที่เหมาะกับหมวด: "${customTopic}"`
    : "เลือกสำนวนที่เหมาะกับผู้ฟังทุกเพศทุกวัย";

  const excludeLine = excludeProverb
    ? `\n⚠️ ห้ามเลือก "${excludeProverb}" — เพิ่งใช้ไปแล้ว เลือกอันอื่น`
    : "";

  const proverbList = PROVERB_BANK.map(
    (p, i) => `${i + 1}. "${p.proverb}" — ${p.meaning}`,
  ).join("\n");

  return `เลือกสำนวนไทยจากรายการที่กำหนดเท่านั้น ห้ามคิดสำนวนเองเด็ดขาด
${FB_SAFE_RULE}

${topicLine}${excludeLine}

รายการสำนวนที่อนุญาต:
${proverbList}

ตอบ JSON เท่านั้น ห้ามมีข้อความอื่น:
{
  "proverb": "คัดลอกชื่อสำนวนจากรายการด้านบนตรงๆ อย่าแก้ไข",
  "meaning": "ความหมายจากรายการ",
  "headline": "สำนวนไทย",
  "caption": "แคปชั่น Facebook ถามให้คนทายสำนวนจากภาพปริศนา ไม่เฉลย ดึงดูดความสนใจ มี emoji"
}`;
}

export interface RebusElement {
  type: "image" | "char";
  object?: string;
  char?: string;
}

function describeCharElement(char: string): string {
  // Combining chars: describe as standalone shapes so AI does NOT add a phantom base consonant
  const shapes: Record<string, string> = {
    "ิ": `standalone floating black arch mark (draw ONLY a small ∩ inverted-U shape in bold black — NO Thai consonant letter, just the arch alone)`,
    "ี": `standalone floating black oval loop (draw ONLY a small closed oval ◯ in bold black — NO Thai consonant letter)`,
    "ึ": `standalone floating black curl stroke (draw ONLY a small reversed-6 or swirling stroke in bold black — NO Thai consonant letter)`,
    "ั": `standalone floating black circle-with-tail mark (draw ONLY a tiny circle with curved descender in bold black — NO Thai consonant letter)`,
    "็": `standalone floating small black diamond ◆ (draw ONLY a tiny diamond dot in bold black — NO Thai consonant letter)`,
    "้": `standalone floating black downward-hook mark (draw ONLY a small angled v-hook stroke in bold black — NO Thai consonant letter)`,
    "่": `standalone floating black short bar mark (draw ONLY a small flat horizontal bar in bold black — NO Thai consonant letter)`,
    "้า": `standalone Thai vowel mark: draw a right-curved vertical stroke "า" with a small downward-hook "้" floating above its peak — ONE combined black symbol, NO Thai consonant letter`,
    "่า": `standalone Thai vowel mark: draw a right-curved vertical stroke "า" with a tiny flat bar "่" above — ONE combined black symbol, NO Thai consonant letter`,
  };
  return shapes[char]
    ?? `large bold standalone Thai character "${char}" — same visual size as the animal illustrations, absolutely NO phantom base consonant added`;
}

// Scene-based image prompt for rebus-word — objects appear separately in one creative scene
export function buildRebusWordImagePrompt(
  rebusElements: RebusElement[],
  headline: string,
  imageDescription: string,
  bannerStyle: string,
): string {
  const imageObjects = rebusElements
    .filter((el) => el.type === "image" && el.object)
    .map((el) => el.object!);

  const objectList = imageObjects.map((o, i) => `  ${i + 1}. ${o}`).join("\n");

  return `Create a surreal photorealistic scene for a Thai word rebus puzzle on Facebook.
${FB_SAFE_RULE}

BANNER (mandatory):
${bannerStyle}
Banner text to display: "${headline}"

SCENE (fills the rest of the image):
All of these puzzle objects must appear together in ONE creative scene:
${objectList}

Scene rules:
- ALL objects above must be clearly visible and individually recognizable
- Objects stay SEPARATE — do NOT fuse or morph them into one creature
- Arrange them in a surreal, funny, or unexpected situation (e.g. stacked, interacting, coexisting in a strange scene)
- Each object must be large enough for viewers to identify it easily
- Background/setting: ${imageDescription}
- Photorealistic, high quality, cinematic composition, dramatic lighting

STRICTLY FORBIDDEN:
- ❌ ANY text, letters, numbers, or writing anywhere in the scene (only the banner may have text)
- ❌ Thai characters, Thai vowels, or Thai words on any surface, object, or background
- ❌ Name labels or captions next to any object
- ❌ Guide strips or reference rows showing objects separately

${FB_SAFE_RULE}`;
}

// Keep old name as alias for backward compatibility
export function buildRebusWordMergedImagePrompt(
  _targetWord: string,
  rebusElements: RebusElement[],
  headline: string,
  imageDescription: string,
  bannerStyle?: string,
): string {
  return buildRebusWordImagePrompt(rebusElements, headline, imageDescription, bannerStyle ?? "");
}

// Simple AI-all-in-one image prompt for proverb-rebus (light bg + free-floating elements + Thai chars)
export function buildProverbRebusAIImagePrompt(
  rebusElements: RebusElement[],
  headline: string,
  imageDescription: string,
): string {
  const n = rebusElements.length;
  const COLS = n <= 8 ? 4 : n <= 10 ? 5 : 6;
  const rows: string[][] = [];
  for (let i = 0; i < n; i += COLS) {
    const row = rebusElements.slice(i, i + COLS).map((el) =>
      el.type === "image"
        ? `[draw ${el.object}]`
        : describeCharElement(el.char ?? ""),
    );
    rows.push(row);
  }
  const rowLines = rows
    .map((r, i) => `  Row ${i + 1}: ${r.join("  ")}`)
    .join("\n");

  return `Create a Thai proverb rebus puzzle image for Facebook.
${FB_SAFE_RULE}

BANNER (mandatory, draw first):
- Full-width banner at the very top edge, height = top 14% of image
- Dark maroon background (#6B0000 to #8B1515) with subtle Thai floral/geometric pattern on left and right sides
- Centered white Thai text: "${headline}"

BACKGROUND:
${imageDescription}

PUZZLE ELEMENTS — ${rows.length} row(s), freely floating, evenly spaced, NO grid lines or boxes:
${rowLines}

ELEMENT RULES:
- Animal/object illustrations: large, detailed, clear, centered in their slot — NO name labels
- Thai consonant/vowel characters: large bold black standalone glyphs, same visual size as illustrations
- Diacritic shape marks (arch ∩, oval, hook, bar): draw ONLY the shape itself in large bold black — absolutely NO Thai consonant letter may appear next to or below a diacritic shape
- All elements have equal spacing between them in each row
- Rows are vertically centered in the space below the banner

${FB_SAFE_RULE}`;
}

// ===== WORD REBUS ("คำนี้คือคำว่าอะไร") — AI photorealistic, matches owner's examples =====
export const WORD_REBUS_TITLES: readonly string[] = [
  "คำนี้คือคำว่าอะไร",
  "คำนี้คือคำว่า",
  "ทายคำจากภาพ",
];

export const WORD_REBUS_SCENES: readonly string[] = [
  "a deep night sky with a glowing full moon and scattered stars above a vast sea of soft moonlit clouds",
  "a sheet of vintage cream-coloured lined notebook paper",
  "old aged parchment paper with wooden railway tracks running along the bottom edge",
  "a dramatic overcast rainy sky over a misty river and distant mountains",
  "warm cream paper with a soft golden radial glow in the centre",
  "a serene golden Thai temple courtyard at dusk with soft bokeh lights",
];

export const WORD_REBUS_BANNERS: ReadonlyArray<(title: string) => string> = [
  (t) => `A full-width solid DARK MAROON banner (#6B0000→#8B1010) across the very top (top 14%), centred heavy-bold WHITE Thai text with a subtle dark outline reading EXACTLY: "${t}".`,
  (t) => `A glossy RED SATIN RIBBON banner draped across the top with folded ends and fabric sheen, centred heavy-bold Thai text in a WHITE-to-GOLD gradient reading EXACTLY: "${t}".`,
  (t) => `A full-width RED banner across the top decorated with golden Thai ornamental patterns (ลายไทย) on both sides, centred heavy-bold WHITE Thai text reading EXACTLY: "${t}".`,
];

// Photorealistic example-matching prompt: AI draws objects + floating Thai glyphs + banner + scene.
export function buildWordRebusImagePrompt(
  rebusElements: RebusElement[],
  title: string,
  bannerStyle: string,
  scene: string,
): string {
  const n = rebusElements.length;
  const seq = rebusElements
    .map((el, i) =>
      el.type === "image"
        ? `  ${i + 1}. a PHOTOREALISTIC cut-out illustration of ${el.object} (full colour, no text label)`
        : `  ${i + 1}. the Thai glyph "${el.char}" — ${describeCharElement(el.char ?? "")}`,
    )
    .join("\n");
  const rowRule = n > 6 ? "split evenly into TWO horizontal rows" : "all in ONE horizontal row";

  return `Create a high-quality Thai "guess the word" rebus puzzle image for Facebook.
${FB_SAFE_RULE}

BANNER (draw first, fully visible, correct Thai spelling):
${bannerStyle}

BACKGROUND SCENE (fills the whole image behind everything):
${scene}

PUZZLE ELEMENTS — read LEFT to RIGHT in this EXACT order, ${rowRule}:
${seq}

STRICT RULES:
- Object illustrations: photorealistic, richly detailed, full colour, cleanly cut out with a soft natural drop shadow, slightly varied sizes, floating directly on the background scene — NO white boxes, NO cards, NO name labels.
- Thai glyphs: render the EXACT character shown, very large and bold. On dark scenes use WHITE glyphs with a black outline; on light scenes use solid BLACK glyphs. NEVER add an extra/phantom Thai consonant beside a vowel or tone mark.
- Even spacing between every element; elements vertically centred in the area below the banner.
- Only the banner title and these puzzle glyphs may contain text — no other words, captions, or watermarks.
- Square 1:1 composition, premium and eye-catching.

${FB_SAFE_RULE}`;
}

// Reference map so the text model can decompose a custom word into objects + Thai marks.
const REBUS_OBJECT_HINTS = `ก: rooster(ไก่)/frog(กบ) | ข: egg(ไข่) | ค: buffalo(ควาย) | ง: snake(งู) | จ: plate(จาน) | ช: elephant(ช้าง) | ด: star(ดาว) | ต: turtle(เต่า) | ท: soldier(ทหาร) | น: mouse(หนู)/bird(นก) | บ: lotus(บัว)/house(บ้าน) | ป: fish(ปลา) | ผ: bee(ผึ้ง) | ฝ: rain cloud(ฝน) | พ: golden offering tray พาน/fan(พัด) | ฟ: teeth(ฟัน) | ม: horse(ม้า) | ย: giant yaksha demon(ยักษ์) | ร: boat(เรือ) | ล: monkey(ลิง) | ส: tiger(เสือ) | ห: pig(หมู)/dog(หมา)/bear(หมี) | อ: large jar โอ่ง | ภ: mountain(ภูเขา) | จ: plate(จาน)`;

// Text-model prompt: break a Thai word into ordered rebus elements (objects + standalone Thai marks)
export function buildWordRebusIdeaPrompt(customWord: string): string {
  return `คุณเป็นผู้เชี่ยวชาญปริศนาอักษรไทย แตกคำว่า "${customWord}" ออกเป็น "rebus" สำหรับเกมทายคำ
${FB_SAFE_RULE}

วิธีคิด: ไล่ทีละพยัญชนะ/สระของคำ
⚠️ กฎเหล็ก:
- พยัญชนะทุกตัว → ต้องเป็น type "image" (วัตถุที่ชื่อขึ้นต้นด้วยพยัญชนะนั้น) เท่านั้น ห้ามใส่พยัญชนะเป็น type "char" เด็ดขาด
- type "char" → ใช้ได้เฉพาะ สระลอยตัว (า ะ เ แ โ ใ ไ อ) เท่านั้น ห้ามใส่ ิ ี ึ ั ็ ่ ้ (AI วาดไม่ได้)
- ถ้าพยัญชนะไหนหาวัตถุยาก ก็ยังต้องเลือกวัตถุจากแผนที่ด้านล่างให้ได้ ห้ามข้ามและห้ามใช้ char แทน
- ห้ามใช้วัตถุที่เป็นตัวคำตอบเอง (เช่น คำว่า "เสือ" ห้ามใช้รูปเสือ)
- ถ้าคำมีวรรณยุกต์/สระลอยซับซ้อนที่วาดไม่ได้ ให้ตอบ {"rebusElements": []} เพื่อบอกว่าทำคำนี้ไม่ได้

แผนที่วัตถุ→พยัญชนะ (เลือกใช้ได้): ${REBUS_OBJECT_HINTS}

ตอบ JSON เท่านั้น:
{
  "targetWord": "${customWord}",
  "rebusElements": [ {"type":"image","object":"english object name"} หรือ {"type":"char","char":"สระ/วรรณยุกต์ไทยตัวเดียว"} ... เรียงซ้ายไปขวา ],
  "caption": "แคปชั่น Facebook ชวนทายคำ ไม่เฉลย (มี emoji)"
}`;
}

export interface ProverbRebusCanvasData {
  rebusElements: RebusElement[];
  headline: string;
  theme?: string;
}

// Background-only image prompt — AI draws objects, canvas draws Thai chars + banner
export function buildProverbRebusBackgroundPrompt(
  rebusElements: RebusElement[],
  imageDescription: string,
  cols: number,
): string {
  const rows = Math.ceil(rebusElements.length / cols);

  const slotLines: string[] = [];
  for (let r = 0; r < rows; r++) {
    const cells: string[] = [];
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const el = idx < rebusElements.length ? rebusElements[idx] : null;
      if (el?.type === "image") {
        cells.push(`draw ${el.object}`);
      } else {
        cells.push("leave blank");
      }
    }
    slotLines.push(`  Row ${r + 1}: ${cells.join(" | ")}`);
  }

  return `Create a flat-style illustration background for a Thai puzzle card.
${FB_SAFE_RULE}

BACKGROUND: ${imageDescription}
The top 16% of the image must be plain light background (reserved for a banner added later — leave empty).

OBJECT GRID — ${rows} rows × ${cols} columns, filling the lower 84% of the image:
${slotLines.join("\n")}

Rules:
- "draw X": large, detailed, colorful cartoon illustration of X, centered in the cell, filling ~75% of the cell
- "leave blank": show only the background color/texture — no objects, no marks, no shapes
- Absolutely NO Thai text, NO letters, NO numbers, NO banner anywhere in the image
- Objects must be instantly recognizable — cute cartoon style, bold outlines
- No labels or captions next to any object

${FB_SAFE_RULE}`;
}

// Generates a grid-based image prompt: AI draws background + objects only, canvas draws Thai text
export function buildProverbRebusGridImagePrompt(
  imageDescription: string,
  rebusElements: RebusElement[],
  headline: string,
): string {
  const COLS = 4;
  const rows = Math.ceil(rebusElements.length / COLS);

  const gridRows: string[] = [];
  for (let r = 0; r < rows; r++) {
    const cells: string[] = [];
    for (let c = 0; c < COLS; c++) {
      const idx = r * COLS + c;
      if (idx >= rebusElements.length) {
        cells.push(`cell-${idx + 1}: empty`);
      } else {
        const el = rebusElements[idx];
        cells.push(
          el.type === "image"
            ? `cell-${idx + 1}: [draw ${el.object} illustration, large and centered]`
            : `cell-${idx + 1}: BLANK — leave completely empty, no object, no text`,
        );
      }
    }
    gridRows.push(`  Row ${r + 1}: ${cells.join(" | ")}`);
  }

  return `Create a Thai Facebook puzzle background image. Style: photorealistic illustration.
${FB_SAFE_RULE}

MANDATORY BANNER (draw first, before any other element):
- Full-width dark maroon (#6B0000 to #8B1515) banner at the very top, spanning edge to edge, height = top 12% of image
- Centered white Thai text inside: "${headline}"
- Banner must be fully visible at all times

BACKGROUND SCENE (fills entire area below banner):
${imageDescription}

PUZZLE GRID — ${rows} rows × ${COLS} columns, evenly spaced below banner:
${gridRows.join("\n")}

CRITICAL:
- Place illustrated objects ONLY in cells labeled "draw [object]"
- All other cells must remain completely empty (blank area showing background only)
- Objects must be large, detailed, recognizable — centered in their cell
- Absolutely NO Thai letters, text, captions, or labels anywhere in the image
${FB_SAFE_RULE}`;
}

// ⚠️  ทุก image prompt ต้องมี FB_SAFE_RULE เสมอ — ห้ามสร้าง function นี้แบบใหม่โดยไม่ใส่
export function buildAIPuzzleImagePrompt(
  headline: string,
  imageDescription: string,
  puzzleLabel: string,
  opts?: { rebusElements?: RebusElement[]; artStyle?: string; bannerStyle?: string },
): string {
  const rebusElements = opts?.rebusElements;
  const artStyle = opts?.artStyle ?? "high-quality photorealistic illustration";
  const bannerInstruction =
    opts?.bannerStyle ??
    `A full-width horizontal banner at the VERY TOP (top 12%), solid dark maroon (#6B0000→#8B1515), centred bold WHITE Thai text reading EXACTLY: "${headline}". Banner fully visible edge to edge.`;
  // Build explicit element-by-element instruction for rebus types
  let rebusInstruction = "";
  if (rebusElements && rebusElements.length > 0) {
    const list = rebusElements
      .map((el, i) =>
        el.type === "image"
          ? `  ${i + 1}. [DRAW ILLUSTRATION of: ${el.object}]`
          : `  ${i + 1}. [RENDER THAI TEXT "${el.char}" as large bold black Thai typography — these are actual Thai text characters, NOT an object or illustration]`,
      )
      .join("\n");

    rebusInstruction = `
REBUS ELEMENTS — render in this EXACT LEFT-TO-RIGHT ORDER (split into 2 rows if more than 5 elements):
${list}

CRITICAL RULES FOR ELEMENTS:
- Items marked [DRAW ILLUSTRATION] must be drawn as recognizable illustrated objects
- Items marked [RENDER THAI TEXT] must appear as ACTUAL THAI TEXT printed in large bold black font — render the exact characters shown, do not draw them as objects, do not omit them
- NO text labels or captions next to illustrated objects
- Spacing between elements must be even and clear`;
  }

  return `Create a Thai Facebook engagement puzzle image. Visual style: ${artStyle}.

PUZZLE TYPE: ${puzzleLabel}

BANNER / TITLE (MANDATORY — render first, fully visible, correct Thai spelling):
${bannerInstruction}

PUZZLE CONTENT:
${imageDescription}
${rebusInstruction}

REQUIREMENTS:
- Square 1:1 composition
- Make it genuinely fun and a little tricky — some items overlapping, partially hidden, or varied in size
- Any Thai text must be crisp and correctly spelled
- No extra captions, watermarks, or stray text beyond the title above
- High visual quality — eye-catching enough to stop the scroll

BACKGROUND RULES:
- Do NOT put white cards / drop-shadow boxes / framed panels behind individual items
- The background may be a full thematic scene OR a clean solid/pastel colour, whichever suits the composition — but it must look intentional and tidy, never a plain white void with floating boxes

${FB_SAFE_RULE}
ADDITIONALLY FOR IMAGE GENERATION:
- NO nudity, partial nudity, or exposed human body parts of any kind (no lips, mouth close-ups, bare feet, buttocks, chest, genitals)
- NO violence, gore, blood, or disturbing imagery
- NO alcohol, cigarettes, drugs, or illegal content
- If any element risks violating the above, replace it with a safe symbolic object instead`;
}
