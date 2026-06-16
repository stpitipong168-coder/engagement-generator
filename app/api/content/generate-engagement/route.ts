import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/openrouter";
import { generateImage } from "@/lib/image-generator";
import {
  buildIdeaPrompt,
  buildImagePrompt,
  ENGAGEMENT_CATEGORIES,
} from "@/lib/engagement-prompts";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      category,
      choiceCount = 4,
      imageStyle = "3d-cartoon",
      customTopic,
      model,
      aspectRatio = "1:1",
    } = body;

    // Validate
    const categoryObj = ENGAGEMENT_CATEGORIES.find((c) => c.id === category);
    if (!categoryObj) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    if (choiceCount < 2 || choiceCount > 6) {
      return NextResponse.json({ error: "Choice count must be 2-6" }, { status: 400 });
    }

    // Step 1: AI คิดไอเดีย
    const ideaPrompt = buildIdeaPrompt(categoryObj.label, categoryObj.id, choiceCount, customTopic || undefined);

    const ideaRaw = await chatCompletion(
      [{ role: "user", content: ideaPrompt }],
      { temperature: 0.9, maxTokens: 1024 },
    );

    // Parse JSON จาก response
    let idea: {
      headline: string;
      choices: string[];
      caption: string;
      imageDescription: string;
    };

    try {
      const jsonMatch = ideaRaw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      idea = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json(
        { error: "AI ไม่สามารถสร้างไอเดียได้ — ลองใหม่อีกครั้ง", raw: ideaRaw },
        { status: 500 },
      );
    }

    if (!idea.headline || !idea.choices || !idea.caption || !idea.imageDescription) {
      return NextResponse.json(
        { error: "AI สร้างไอเดียไม่สมบูรณ์ — ลองใหม่อีกครั้ง" },
        { status: 500 },
      );
    }

    // Step 2: สร้างภาพ
    const imagePrompt = buildImagePrompt(
      idea.headline,
      idea.choices,
      idea.imageDescription,
      imageStyle,
      categoryObj.id,
    );

    const imageDataUri = await generateImage({
      prompt: imagePrompt,
      aspectRatio,
      model: model || undefined,
    });

    return NextResponse.json({
      imageDataUri,
      headline: idea.headline,
      choices: idea.choices,
      caption: idea.caption,
      imagePrompt,
    });
  } catch (error) {
    console.error("Generate engagement error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 },
    );
  }
}
