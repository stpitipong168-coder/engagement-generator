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
  {
    id: "proverb-rebus",
    label: "สำนวนไทย",
    emoji: "📜",
    description: "ปริศนารูปภาพ+พยัญชนะไทย — ถอดรหัสเป็นสำนวน",
    method: "ai" as const,
  },
] as const;

export type PuzzleTypeId = (typeof PUZZLE_TYPES)[number]["id"];

// Canvas puzzle data types (returned from API, rendered client-side)
export interface FindHiddenData {
  mainChar: string;
  hiddenChar: string;
  rows: number;
  cols: number;
  hiddenPositions: [number, number][];
  headline: string;
  theme?: "sky" | "sunset" | "space" | "polkadots" | "stripes" | "chalkboard" | "graphpaper" | "neon" | "autumn" | "ocean";
}

export interface MathChallengeData {
  equation: string;
  answer: number;
  headline: string;
  theme?: "wood" | "chalkboard" | "paper" | "pink" | "blue" | "purple";
}

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

// Caption templates — rotated randomly, no AI needed
export const FIND_HIDDEN_CAPTIONS: ReadonlyArray<(h: string) => string> = [
  (h) => `👀 มี ${h} ซ่อนอยู่ในภาพ หาเจอมั้ย? คอมเมนต์บอกเลย!`,
  (h) => `🔍 สายตาดีไหม? หา ${h} ซ่อนอยู่ในกลุ่มให้เจอสิ! คอมเมนต์เฉลย`,
  (h) => `👁️ ท้าทาย! หา ${h} ให้เจอ แล้ว comment บอก row กับ column นะ`,
  (h) => `🧐 จะหาเจอมั้ย? มี ${h} ซ่อนแอบอยู่ในภาพ แชร์ถ้าหาเจอ!`,
  (h) => `🎯 ตาเฉียบไหม? ลองหา ${h} สิ! คนแรกที่เจอ comment ได้เลย`,
  (h) => `👀 มีแค่จุดเดียว! ${h} ซ่อนอยู่ไหน หาเจอแล้วบอก!`,
  (h) => `🔎 ฝึกสมาธิ! หา ${h} ให้เจอในภาพ comment เฉลยได้เลย!`,
  (h) => `🏆 ใครหาเจอก่อน? มี ${h} ซ่อนอยู่ในนี้ comment บอกตำแหน่ง!`,
];

export function buildRebusWordPrompt(syllableCount: number, customTopic?: string, excludeWord?: string): string {
  const topicLine = customTopic
    ? `หมวดคำที่กำหนด: "${customTopic}"`
    : "เลือกคำที่คนไทยทั่วไปรู้จัก เช่น อาหาร สัตว์ ของใช้ในบ้าน";
  const excludeLine = excludeWord ? `\n⚠️ ห้ามใช้คำว่า "${excludeWord}" — เพิ่งใช้ไปแล้ว เลือกคำใหม่` : "";

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

ตัวอย่างคำ ${syllableCount} พยางค์ที่ถูก: ${ex.ok.join(", ")}
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

export function buildCountItemsPrompt(customTopic?: string, excludeSubject?: string): string {
  const topicLine = customTopic
    ? `สัตว์/วัตถุที่กำหนด: "${customTopic}"`
    : "เลือกสัตว์หรือวัตถุที่น่าสนใจ เช่น แมวดำ, สุนัข, นก, ดอกไม้";
  const excludeLine = excludeSubject ? `\n⚠️ ห้ามใช้ "${excludeSubject}" — เพิ่งใช้ไปแล้ว เลือกอันใหม่` : "";

  return `สร้างโจทย์ "นับ X กี่ตัว" สำหรับ Facebook engagement
${FB_SAFE_RULE}

${topicLine}${excludeLine}

กฎสำคัญ:
- จำนวนต้องทำให้นับยาก (7-15 ตัว)
- บางตัวซ่อนอยู่ บางตัวซ้อนทับกัน บางตัวมีขนาดเล็ก
- สร้างความสงสัย เช่น ฉันเห็น X ตัว คุณเห็นกี่ตัว?

ตอบ JSON เท่านั้น ห้ามมีข้อความอื่น:
{
  "subject": "สิ่งที่ต้องนับ (ภาษาไทย)",
  "count": จำนวนจริงในภาพ,
  "headline": "ในภาพมี[subject]กี่ตัว หรือ คุณเห็น[subject]กี่ตัว",
  "imageDescription": "อธิบายภาพ ภาษาอังกฤษ: [subject]จำนวน [count] ตัว บางตัวซ่อนในฉาก บางตัวซ้อนทับ ฉากสวยงาม",
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

export interface ProverbRebusCanvasData {
  backgroundImageDataUri: string;
  rebusElements: RebusElement[];
  headline: string;
  cols: number;
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
  rebusElements?: RebusElement[],
): string {
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

  return `Create a Thai Facebook engagement puzzle image. Style: high-quality photorealistic illustration.

PUZZLE TYPE: ${puzzleLabel}

BANNER DESIGN (MANDATORY — draw this first, before anything else):
- A full-width horizontal banner must appear at the VERY TOP of the image spanning edge to edge
- The banner occupies the top 12% of the image height
- Background: solid dark maroon (#6B0000 to #8B1515) — no gaps, no missing corners
- Text inside banner: centered, medium-bold white Thai font — write EXACTLY this text: "${headline}"
- This banner MUST be present and fully visible. If space is tight, shrink the puzzle elements — never shrink or remove the banner.

PUZZLE CONTENT (the remaining 88% below the banner):
${imageDescription}
${rebusInstruction}

REQUIREMENTS:
- Square 1:1 composition
- All Thai letters/consonants/vowels in the content area must be rendered as crisp readable text
- No extra captions, watermarks, or decorative text beyond the banner headline
- High visual quality — engaging enough to make people stop scrolling

BACKGROUND RULES (CRITICAL):
- NO white boxes, white panels, white cards, or white rectangular backgrounds anywhere in the image
- NO drop-shadow boxes or framed containers around elements
- All illustrated objects and Thai letter characters must float DIRECTLY on the thematic background scene — no separate overlay panel
- The thematic background (landscape, kitchen, forest, etc.) fills the entire content area below the banner

${FB_SAFE_RULE}
ADDITIONALLY FOR IMAGE GENERATION:
- NO nudity, partial nudity, or exposed human body parts of any kind (no lips, mouth close-ups, bare feet, buttocks, chest, genitals)
- NO violence, gore, blood, or disturbing imagery
- NO alcohol, cigarettes, drugs, or illegal content
- If any element risks violating the above, replace it with a safe symbolic object instead`;
}
