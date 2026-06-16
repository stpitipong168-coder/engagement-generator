"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  MessageCircleQuestion,
  Paintbrush,
  Hash,
  Lightbulb,
} from "lucide-react";
import {
  ENGAGEMENT_CATEGORIES,
  IMAGE_STYLES,
  type EngagementCategoryId,
  type ImageStyleId,
} from "@/lib/engagement-prompts";

export interface EngagementFormHandle {
  submit: () => void;
  isReady: boolean;
}

export interface EngagementFormData {
  category: EngagementCategoryId;
  choiceCount: number;
  imageStyle: ImageStyleId;
  customTopic?: string;
}

interface EngagementFormProps {
  onGenerate: (data: EngagementFormData) => void;
  isGenerating: boolean;
  onReadyChange?: (ready: boolean) => void;
}

export const EngagementForm = forwardRef<EngagementFormHandle, EngagementFormProps>(
  function EngagementForm({ onGenerate, isGenerating, onReadyChange }, ref) {
    const [category, setCategory] = useState<EngagementCategoryId>("riddle");
    const [choiceCount, setChoiceCount] = useState(4);
    const [imageStyle, setImageStyle] = useState<ImageStyleId>("3d-cartoon");
    const [customTopic, setCustomTopic] = useState("");

    const handleSubmit = () => {
      onGenerate({
        category,
        choiceCount,
        imageStyle,
        customTopic: customTopic.trim() || undefined,
      });
    };

    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
      isReady: true,
    }));

    if (onReadyChange) onReadyChange(true);

    return (
      <div className="space-y-4">
        {/* Category */}
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-0">
            <div className="flex items-center gap-2.5 border-b px-4 py-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-500/10">
                <MessageCircleQuestion className="h-3.5 w-3.5 text-orange-500" />
              </div>
              <span className="text-sm font-medium">หมวดหมู่คอนเทนต์</span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ENGAGEMENT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      category === cat.id
                        ? "border-orange-500 bg-orange-500/10 ring-1 ring-orange-500/30"
                        : "border-muted bg-muted/20 hover:bg-muted/40"
                    }`}
                  >
                    <span className={`text-sm font-medium ${category === cat.id ? "text-orange-400" : ""}`}>
                      {cat.label}
                    </span>
                    <p className="mt-0.5 text-xs text-muted-foreground">{cat.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Choice Count */}
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-0">
            <div className="flex items-center gap-2.5 border-b px-4 py-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10">
                <Hash className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <span className="text-sm font-medium">จำนวนตัวเลือก</span>
              <span className="ml-auto rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                {choiceCount}
              </span>
            </div>
            <div className="p-4">
              <Slider
                value={[choiceCount]}
                onValueChange={(val) => setChoiceCount(Array.isArray(val) ? val[0] : val)}
                min={2}
                max={6}
                step={1}
                className="w-full"
              />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Image Style */}
        <Card className="border-l-4 border-l-pink-500">
          <CardContent className="p-0">
            <div className="flex items-center gap-2.5 border-b px-4 py-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-pink-500/10">
                <Paintbrush className="h-3.5 w-3.5 text-pink-500" />
              </div>
              <span className="text-sm font-medium">สไตล์ภาพ</span>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-1.5">
                {IMAGE_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setImageStyle(style.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      imageStyle === style.id
                        ? "border-pink-500 bg-pink-500/10 text-pink-400"
                        : "border-muted bg-muted/30 text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {style.label}
                    <span className="ml-1 text-[10px] opacity-60">({style.description})</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

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
                placeholder="ปล่อยว่างให้ AI คิดเอง หรือใส่หัวข้อ เช่น อาหาร, รถยนต์, สัตว์เลี้ยง..."
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                rows={2}
                className="resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  },
);
