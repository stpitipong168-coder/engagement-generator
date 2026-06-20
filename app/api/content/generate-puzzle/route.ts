import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/openrouter";
import { generateImage } from "@/lib/image-generator";
import {
  PUZZLE_TYPES,
  PROVERB_BANK,
  FIND_HIDDEN_PAIRS,
  FIND_HIDDEN_CAPTIONS,
  buildRebusWordPrompt,
  buildCountItemsPrompt,
  buildMathChallengePrompt,
  buildMathBackgroundPrompt,
  MATH_HOOKS,
  MATH_SUBS,
  MATH_AI_SCENES,
  buildProverbRebusPrompt,
  buildProverbRebusAIImagePrompt,
  buildRebusWordImagePrompt,
  buildAIPuzzleImagePrompt,
  type RebusElement,
} from "@/lib/puzzle-types";

const MATH_THEMES = ["notebook", "wood", "chalkboard", "vintage", "graph", "kraft"] as const;
type MathThemeId = (typeof MATH_THEMES)[number];

const REBUS_BANNER_STYLES = [
  // Bottom pill badge with Thai ornament
  `Position: centered pill-shaped badge at the BOTTOM of the image (bottom 14%), width ~72% of image, height ~12%.
  Style: dark maroon (#6B0000) fill, gold Thai floral ornaments on left and right inside the badge, rounded ends.
  Font: bold white Thai text, large, centered inside badge.`,

  // Bottom full-width dark strip
  `Position: full-width horizontal strip at the VERY BOTTOM edge of the image, height = bottom 13%.
  Style: solid dark maroon (#7B0000) background, no decorations.
  Font: extra-bold white Thai text, large, centered.`,

  // Bottom gradient strip with glow
  `Position: full-width horizontal strip at the VERY BOTTOM edge, height = bottom 13%.
  Style: gradient from deep red (#8B0000) to dark maroon (#4A0000), left to right.
  Font: bold white Thai text with very subtle golden outline, large, centered.`,

  // Top traditional Thai fabric banner
  `Position: horizontal fabric banner hanging at the TOP of the image, spanning edge to edge, height = top 14%.
  Style: traditional Thai-style red cloth/fabric texture, gold rope or tassel accents at the corners.
  Font: bold white Thai text, large, centered on the fabric.`,

  // Bottom dark strip with thin gold border line
  `Position: full-width horizontal strip at the VERY BOTTOM edge, height = bottom 13%.
  Style: very dark maroon (#3D0000) background, thin gold line along the top edge of the strip.
  Font: bold white Thai text, large, centered.`,

  // Top floating pill badge — does NOT touch the edges
  `Position: floating pill-shaped badge near the TOP of the image, centered horizontally, with ~4% margin from the top edge and NOT touching the left or right edges (width ~55% of image).
  Style: deep red (#B22222 to #8B0000) gradient fill, decorative gold/cream border around the pill shape with subtle ornamental corner flourishes.
  Font: bold white Thai text, very large, centered inside the badge. NO text outside the badge.`,
] as const;

const FIND_HIDDEN_THEMES = ["sky", "sunset", "space", "polkadots", "stripes", "chalkboard", "graphpaper", "neon", "autumn", "ocean"] as const;
type FindHiddenThemeId = (typeof FIND_HIDDEN_THEMES)[number];

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const maxDuration = 120;

function parseJSON(raw: string): Record<string, unknown> {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("AI ไม่ได้ส่ง JSON กลับมา — ลองใหม่อีกครั้ง");
  return JSON.parse(match[0]);
}

function randomHiddenPositions(
  rows: number,
  cols: number,
  count: number,
): [number, number][] {
  const positions: [number, number][] = [];
  const used = new Set<string>();
  let attempts = 0;
  while (positions.length < count && attempts < 500) {
    attempts++;
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    const key = `${r},${c}`;
    if (!used.has(key)) {
      used.add(key);
      positions.push([r, c]);
    }
  }
  return positions;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      puzzleType,
      customTopic,
      syllableCount = 3,
      difficulty = "medium",
      mathBgStyle = "canvas",
      model,
      aspectRatio = "1:1",
      excludeProverb,
      excludeFindPair,
      excludeWord,
      excludeWords,
      excludeSubject,
      excludeEquation,
    } = body;

    const typeDef = PUZZLE_TYPES.find((p) => p.id === puzzleType);
    if (!typeDef) {
      return NextResponse.json({ error: "Invalid puzzle type" }, { status: 400 });
    }

    // ===== CANVAS TYPES =====

    if (puzzleType === "find-hidden") {
      // Pick from hardcoded bank (no AI needed) — exclude last used pair
      const available = excludeFindPair
        ? FIND_HIDDEN_PAIRS.filter((p) => p.mainChar !== excludeFindPair)
        : [...FIND_HIDDEN_PAIRS];
      const pair = pickRandom(available.length > 0 ? available : FIND_HIDDEN_PAIRS);

      // Grid size variation
      const rows = 9 + Math.floor(Math.random() * 3); // 9–11
      const cols = 7 + Math.floor(Math.random() * 4); // 7–10
      const hiddenCount = 1 + Math.floor(Math.random() * 3); // 1–3

      const captionFn = pickRandom(FIND_HIDDEN_CAPTIONS);

      return NextResponse.json({
        method: "canvas",
        puzzleType: "find-hidden",
        canvasData: {
          mainChar: pair.mainChar,
          hiddenChar: pair.hiddenChar,
          rows,
          cols,
          hiddenPositions: randomHiddenPositions(rows, cols, hiddenCount),
          headline: pair.headline,
          theme: pickRandom(FIND_HIDDEN_THEMES) as FindHiddenThemeId,
        },
        caption: captionFn(pair.hiddenChar),
        answer: pair.hiddenChar,
      });
    }

    if (puzzleType === "math-challenge") {
      const raw = await chatCompletion(
        [{ role: "user", content: buildMathChallengePrompt(difficulty, excludeEquation) }],
        { temperature: 0.7 },
      );
      const data = parseJSON(raw);

      const theme = pickRandom(MATH_THEMES) as MathThemeId;

      // "สวย (AI)" mode: AI paints a photoreal scene, canvas overlays the text.
      let backgroundImageDataUri: string | undefined;
      if (mathBgStyle === "ai") {
        const scenePrompt = buildMathBackgroundPrompt(pickRandom(MATH_AI_SCENES));
        backgroundImageDataUri = await generateImage({ prompt: scenePrompt, aspectRatio, model });
      }

      return NextResponse.json({
        method: "canvas",
        puzzleType: "math-challenge",
        canvasData: {
          equation: String(data.equation),
          answer: Number(data.answer),
          headline: pickRandom(MATH_HOOKS),
          subText: pickRandom(MATH_SUBS),
          theme,
          ...(backgroundImageDataUri ? { backgroundImageDataUri } : {}),
        },
        caption: String(data.caption),
        answer: Number(data.answer),
      });
    }

    // ===== AI IMAGE TYPES =====

    const genIdea = async (prompt: string) =>
      parseJSON(await chatCompletion([{ role: "user", content: prompt }], { temperature: 0.9, maxTokens: 1024 }));

    let idea: Record<string, unknown>;
    if (puzzleType === "rebus-word") {
      const excluded = Array.isArray(excludeWords) ? [...excludeWords] : excludeWord ? [excludeWord] : [];
      // AI sometimes miscounts syllables — retry (rotating category) before giving up
      let attempt = 0;
      do {
        idea = await genIdea(buildRebusWordPrompt(syllableCount, customTopic, excluded));
        const list = Array.isArray(idea.syllableList) ? idea.syllableList : [];
        if (list.length === syllableCount) break;
        if (idea.targetWord) excluded.push(String(idea.targetWord)); // avoid the bad word next try
      } while (++attempt < 3);
    } else if (puzzleType === "count-items") {
      idea = await genIdea(buildCountItemsPrompt(customTopic, excludeSubject));
    } else {
      idea = await genIdea(buildProverbRebusPrompt(customTopic, excludeProverb));
    }

    // ===== PROVERB-REBUS: pure AI all-in-one (standalone chars only in bank) =====
    if (puzzleType === "proverb-rebus") {
      if (!idea.headline || !idea.caption || !idea.proverb) {
        return NextResponse.json(
          { error: "AI สร้างไอเดียไม่สมบูรณ์ — ลองใหม่อีกครั้ง" },
          { status: 500 },
        );
      }

      const bankEntry = PROVERB_BANK.find(
        (p) => p.proverb === String(idea.proverb),
      );
      if (!bankEntry) {
        return NextResponse.json(
          {
            error: `AI เลือกสำนวนนอกรายการ ("${idea.proverb}") — ลองใหม่อีกครั้ง`,
          },
          { status: 500 },
        );
      }

      const imagePrompt = buildProverbRebusAIImagePrompt(
        bankEntry.rebusElements,
        String(idea.headline),
        bankEntry.imageDescription,
      );

      const imageDataUri = await generateImage({ prompt: imagePrompt, aspectRatio, model });

      return NextResponse.json({
        method: "ai",
        puzzleType: "proverb-rebus",
        imageDataUri,
        headline: String(idea.headline),
        caption: String(idea.caption),
        imagePrompt,
        answer: bankEntry.proverb,
        meaning: bankEntry.meaning,
      });
    }

    if (!idea.headline || !idea.imageDescription || !idea.caption) {
      return NextResponse.json(
        { error: "AI สร้างไอเดียไม่สมบูรณ์ — ลองใหม่อีกครั้ง" },
        { status: 500 },
      );
    }

    // ===== REBUS-WORD: merged chimera image =====
    if (puzzleType === "rebus-word") {
      // Validate syllable count — AI must include syllableList matching requested count
      const syllableList = Array.isArray(idea.syllableList) ? idea.syllableList : [];
      if (syllableList.length > 0 && syllableList.length !== syllableCount) {
        return NextResponse.json(
          { error: `AI เลือกคำ "${idea.targetWord}" (${syllableList.length} พยางค์) แทนที่จะเป็น ${syllableCount} พยางค์ — กดสร้างใหม่อีกครั้ง` },
          { status: 500 },
        );
      }

      const rebusElements = Array.isArray(idea.rebusElements)
        ? (idea.rebusElements as RebusElement[])
        : [];

      const bannerStyle = pickRandom(REBUS_BANNER_STYLES);
      const imagePrompt = buildRebusWordImagePrompt(
        rebusElements,
        String(idea.headline),
        String(idea.imageDescription),
        bannerStyle,
      );

      // ทายภาพ X พยางค์ always uses Nano Banana 2 (per owner's request)
      const imageDataUri = await generateImage({
        prompt: imagePrompt,
        aspectRatio,
        model: "google/gemini-3.1-flash-image-preview",
      });

      return NextResponse.json({
        method: "ai",
        puzzleType: "rebus-word",
        imageDataUri,
        headline: String(idea.headline),
        caption: String(idea.caption),
        imagePrompt,
        answer: String(idea.targetWord ?? ""),
      });
    }

    // ===== COUNT-ITEMS: AI image =====
    const imagePrompt = buildAIPuzzleImagePrompt(
      String(idea.headline),
      String(idea.imageDescription),
      typeDef.label,
      undefined,
    );

    const imageDataUri = await generateImage({
      prompt: imagePrompt,
      aspectRatio,
      model,
    });

    const answer = puzzleType === "count-items" ? Number(idea.count) : undefined;

    return NextResponse.json({
      method: "ai",
      puzzleType,
      imageDataUri,
      headline: String(idea.headline),
      caption: String(idea.caption),
      imagePrompt,
      answer,
      ...(puzzleType === "count-items" ? { subject: String(idea.subject ?? "") } : {}),
    });
  } catch (error) {
    console.error("generate-puzzle error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 },
    );
  }
}
