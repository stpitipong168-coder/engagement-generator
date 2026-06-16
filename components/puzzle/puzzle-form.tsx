"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb, Puzzle, Shuffle } from "lucide-react";
import { PUZZLE_TYPES, PROVERB_BANK, type PuzzleTypeId } from "@/lib/puzzle-types";

export interface PuzzleFormHandle {
  submit: () => void;
}

export interface PuzzleFormData {
  puzzleType: PuzzleTypeId;
  customTopic?: string;
  syllableCount?: number;
  difficulty?: string;
}

interface PuzzleFormProps {
  onGenerate: (data: PuzzleFormData) => void;
  isGenerating: boolean;
}

const DIFFICULTY_OPTIONS = [
  { id: "easy", label: "ง่าย" },
  { id: "medium", label: "กลาง" },
  { id: "hard", label: "ยาก" },
];

const SYLLABLE_OPTIONS = [2, 3, 4, 5, 6];

export const PuzzleForm = forwardRef<PuzzleFormHandle, PuzzleFormProps>(
  function PuzzleForm({ onGenerate, isGenerating }, ref) {
    const [puzzleType, setPuzzleType] = useState<PuzzleTypeId>("find-hidden");
    const [customTopic, setCustomTopic] = useState("");
    const [syllableCount, setSyllableCount] = useState(3);
    const [difficulty, setDifficulty] = useState("medium");

    useImperativeHandle(ref, () => ({
      submit: () =>
        onGenerate({
          puzzleType,
          customTopic: customTopic.trim() || undefined,
          syllableCount,
          difficulty,
        }),
    }));

    return (
      <div className="space-y-4">
        {/* Puzzle Type */}
        <Card className="border-l-4 border-l-red-700">
          <CardContent className="p-0">
            <div className="flex items-center gap-2.5 border-b px-4 py-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-700/10">
                <Puzzle className="h-3.5 w-3.5 text-red-700" />
              </div>
              <span className="text-sm font-medium">ประเภทปริศนา</span>
            </div>
            <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2">
              {PUZZLE_TYPES.map((pt) => (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => setPuzzleType(pt.id)}
                  disabled={isGenerating}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    puzzleType === pt.id
                      ? "border-red-700 bg-red-700/10 ring-1 ring-red-700/30"
                      : "border-muted bg-muted/20 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{pt.emoji}</span>
                    <span
                      className={`text-sm font-medium ${puzzleType === pt.id ? "text-red-600" : ""}`}
                    >
                      {pt.label}
                    </span>
                    <span className="ml-auto rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {pt.method === "canvas" ? "⚡ เร็ว" : "🤖 AI"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{pt.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Type-specific options */}
        {puzzleType === "rebus-word" && (
          <Card className="border-l-4 border-l-violet-500">
            <CardContent className="p-0">
              <div className="border-b px-4 py-2.5">
                <span className="text-sm font-medium">จำนวนพยางค์</span>
              </div>
              <div className="flex gap-2 p-4">
                {SYLLABLE_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSyllableCount(n)}
                    disabled={isGenerating}
                    className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                      syllableCount === n
                        ? "border-violet-500 bg-violet-500/10 text-violet-400"
                        : "border-muted bg-muted/30 text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {n} พยางค์
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {puzzleType === "math-challenge" && (
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="p-0">
              <div className="border-b px-4 py-2.5">
                <span className="text-sm font-medium">ระดับความยาก</span>
              </div>
              <div className="flex gap-2 p-4">
                {DIFFICULTY_OPTIONS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id)}
                    disabled={isGenerating}
                    className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                      difficulty === d.id
                        ? "border-amber-500 bg-amber-500/10 text-amber-400"
                        : "border-muted bg-muted/30 text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Custom Topic */}
        <Card className="border-l-4 border-l-cyan-500">
          <CardContent className="p-0">
            <div className="flex items-center gap-2.5 border-b px-4 py-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/10">
                <Lightbulb className="h-3.5 w-3.5 text-cyan-500" />
              </div>
              <span className="text-sm font-medium">หัวข้อกำหนดเอง</span>
              <span className="ml-auto text-xs text-muted-foreground">ไม่บังคับ</span>
            </div>
            <div className="p-4">
              <Textarea
                placeholder={
                  puzzleType === "find-hidden"
                    ? "เช่น ตัวเลขเกี่ยวกับปี, ตัวอักษรคล้ายกัน..."
                    : puzzleType === "rebus-word"
                      ? "เช่น อาหาร, สัตว์, ของใช้ในบ้าน..."
                      : puzzleType === "count-items"
                        ? "เช่น แมวดำ, สุนัข, นกแก้ว..."
                        : puzzleType === "proverb-rebus"
                          ? "เช่น สำนวนเกี่ยวกับสัตว์, ความสัมพันธ์..."
                          : "ปล่อยว่างให้ AI คิดเอง..."
                }
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                rows={2}
                disabled={isGenerating}
                className="resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  },
);
