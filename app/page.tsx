"use client";

import { useState, useCallback, useRef } from "react";
import { PuzzleForm, type PuzzleFormData, type PuzzleFormHandle } from "@/components/puzzle/puzzle-form";
import { ImagePreview } from "@/components/image-preview";
import { IMAGE_MODELS, type ImageModelId } from "@/lib/image-generator";
import { PUZZLE_TYPES } from "@/lib/puzzle-types";
import { generateFindHiddenImage, generateMathChallengeImage, generateProverbRebusCanvas } from "@/lib/canvas-puzzles";
import type { FindHiddenData, MathChallengeData, ProverbRebusCanvasData } from "@/lib/puzzle-types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Puzzle, Cpu, Copy, Check, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { toast } from "sonner";

interface GenerationResult {
  method: "canvas" | "ai";
  puzzleType: string;
  imageDataUri?: string;
  canvasData?: FindHiddenData | MathChallengeData | ProverbRebusCanvasData;
  headline?: string;
  caption: string;
  imagePrompt?: string;
  answer?: string | number;
  meaning?: string;
}

export default function HomePage() {
  const [selectedModel, setSelectedModel] = useState<ImageModelId>(IMAGE_MODELS[0].id);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [editedCaption, setEditedCaption] = useState("");
  const [copied, setCopied] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [lastPayload, setLastPayload] = useState<PuzzleFormData | null>(null);
  const formRef = useRef<PuzzleFormHandle>(null);

  const currentModelLabel = IMAGE_MODELS.find((m) => m.id === selectedModel)?.label || "Unknown";

  const handleGenerate = useCallback(
    async (data: PuzzleFormData) => {
      setIsGenerating(true);
      setLastPayload(data);
      setShowAnswer(false);
      setImageUrl(null);
      setResult(null);

      try {
        const ls = localStorage;
        const excludeProverb   = data.puzzleType === "proverb-rebus" ? (ls.getItem("lastProverb") ?? undefined) : undefined;
        const excludeFindPair  = data.puzzleType === "find-hidden"   ? (ls.getItem("lastFindPair") ?? undefined) : undefined;
        const excludeWord      = data.puzzleType === "rebus-word"    ? (ls.getItem("lastRebusWord") ?? undefined) : undefined;
        const excludeSubject   = data.puzzleType === "count-items"   ? (ls.getItem("lastCountSubject") ?? undefined) : undefined;
        const excludeEquation  = data.puzzleType === "math-challenge" ? (ls.getItem("lastMathEq") ?? undefined) : undefined;

        const res = await fetch("/api/content/generate-puzzle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            model: selectedModel,
            aspectRatio: "1:1",
            ...(excludeProverb  ? { excludeProverb }  : {}),
            ...(excludeFindPair ? { excludeFindPair }  : {}),
            ...(excludeWord     ? { excludeWord }      : {}),
            ...(excludeSubject  ? { excludeSubject }   : {}),
            ...(excludeEquation ? { excludeEquation }  : {}),
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Generation failed");
        }

        const r: GenerationResult = await res.json();
        setResult(r);
        setEditedCaption(r.caption);
        if (r.puzzleType === "proverb-rebus" && r.answer)  localStorage.setItem("lastProverb", String(r.answer));
        if (r.puzzleType === "find-hidden"   && r.canvasData) localStorage.setItem("lastFindPair", (r.canvasData as {mainChar:string}).mainChar);
        if (r.puzzleType === "rebus-word"    && r.answer)  localStorage.setItem("lastRebusWord", String(r.answer));
        if (r.puzzleType === "count-items"   && r.answer !== undefined) localStorage.setItem("lastCountSubject", String((r as {subject?: string}).subject ?? r.answer));
        if (r.puzzleType === "math-challenge" && r.canvasData) localStorage.setItem("lastMathEq", (r.canvasData as {equation:string}).equation);

        if (r.method === "canvas" && r.canvasData) {
          let dataUrl: string;
          if (r.puzzleType === "find-hidden") {
            dataUrl = generateFindHiddenImage(r.canvasData as FindHiddenData);
          } else {
            dataUrl = generateMathChallengeImage(r.canvasData as MathChallengeData);
          }
          setImageUrl(dataUrl);
        } else if (r.imageDataUri) {
          setImageUrl(r.imageDataUri);
        }

        toast.success("สร้างปริศนาสำเร็จ!");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "สร้างไม่สำเร็จ");
      } finally {
        setIsGenerating(false);
      }
    },
    [selectedModel],
  );

  const handleRegenerate = useCallback(() => {
    if (lastPayload) handleGenerate(lastPayload);
  }, [lastPayload, handleGenerate]);

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(editedCaption);
    setCopied(true);
    toast.success("คัดลอกแคปชั่นแล้ว");
    setTimeout(() => setCopied(false), 2000);
  };

  const puzzleTypeDef = result
    ? PUZZLE_TYPES.find((p) => p.id === result.puzzleType)
    : null;

  const hasAnswer =
    result?.answer !== undefined &&
    result.answer !== null &&
    result.answer !== "";

  const answerLabel =
    result?.puzzleType === "count-items"
      ? `จำนวนจริง: ${result.answer} ตัว`
      : result?.puzzleType === "math-challenge"
        ? `คำตอบ: ${result.answer}`
        : result?.puzzleType === "rebus-word"
          ? `คำตอบ: ${result.answer}`
          : result?.puzzleType === "proverb-rebus"
            ? `สำนวน: ${result.answer}`
            : "";

  return (
    <div>
      <div className="mb-6">
        <PageHeader
          icon={Puzzle}
          iconColor="text-red-700"
          title="MetaPuzz"
          description="สร้างปริศนา/เกม ที่ภาพ = ปริศนา — ชวนให้คนหยุดดูและคอมเมนต์ตอบ"
        />
      </div>

      <div className="grid gap-5 pb-24 md:grid-cols-2">
        {/* ฝั่งซ้าย — ฟอร์ม */}
        <div className="space-y-4">
          {/* AI Model (สำหรับ type ที่ใช้ AI) */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-0">
              <div className="flex items-center gap-2.5 border-b px-4 py-2.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10">
                  <Cpu className="h-3.5 w-3.5 text-blue-500" />
                </div>
                <span className="text-sm font-medium">AI Model (สำหรับปริศนาที่ใช้ AI วาดภาพ)</span>
              </div>
              <div className="flex flex-wrap gap-1.5 p-4">
                {IMAGE_MODELS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedModel(m.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      selectedModel === m.id
                        ? "border-blue-500 bg-blue-500/10 text-blue-400"
                        : "border-muted bg-muted/30 text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {m.label}
                    <span className="ml-1 text-[10px] opacity-60">({m.description})</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <PuzzleForm ref={formRef} onGenerate={handleGenerate} isGenerating={isGenerating} />

          <Button
            className="w-full gap-2 border-0 bg-gradient-to-r from-red-700 to-red-500 text-white shadow-md shadow-red-700/20 transition-shadow hover:from-red-800 hover:to-red-600 hover:shadow-lg hover:shadow-red-700/30"
            onClick={() => formRef.current?.submit()}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Puzzle className="mr-1 h-4 w-4" />
            )}
            {isGenerating ? "กำลังสร้างปริศนา..." : "สร้างปริศนา"}
          </Button>
        </div>

        {/* ฝั่งขวา — Preview + ผลลัพธ์ */}
        <div className="space-y-4 md:sticky md:top-4 md:max-h-[calc(100vh-6rem)] md:self-start md:overflow-y-auto">
          {/* Answer reveal */}
          {result && !isGenerating && hasAnswer && (
            <Card className="border-l-4 border-l-red-700">
              <CardContent className="p-0">
                <div className="flex items-center gap-2.5 border-b px-4 py-2.5">
                  <span className="text-sm font-medium">เฉลย</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-7 gap-1 px-2 text-xs"
                    onClick={() => setShowAnswer((v) => !v)}
                  >
                    {showAnswer ? (
                      <EyeOff className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                    {showAnswer ? "ซ่อน" : "เปิดเฉลย"}
                  </Button>
                </div>
                <div className="p-4">
                  {showAnswer ? (
                    <p className="text-base font-bold text-foreground">{answerLabel}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">กดเปิดเฉลยเมื่อพร้อม</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <ImagePreview
            imageUrl={imageUrl}
            isGenerating={isGenerating}
            onRegenerate={handleRegenerate}
            modelLabel={
              result?.method === "canvas"
                ? `⚡ Canvas (${puzzleTypeDef?.label || ""})`
                : currentModelLabel
            }
          />

          {/* Caption */}
          {result && !isGenerating && (
            <Card className="border-l-4 border-l-violet-500">
              <CardContent className="p-0">
                <div className="flex items-center gap-2.5 border-b px-4 py-2.5">
                  <span className="text-sm font-medium">แคปชั่น Facebook</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-7 gap-1 px-2 text-xs"
                    onClick={handleCopyCaption}
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {copied ? "คัดลอกแล้ว" : "คัดลอก"}
                  </Button>
                </div>
                <div className="p-4">
                  <Textarea
                    value={editedCaption}
                    onChange={(e) => setEditedCaption(e.target.value)}
                    rows={3}
                    className="resize-none text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
