"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Eye, ImageIcon, Download } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface ImagePreviewProps {
  imageUrl: string | null;
  isGenerating: boolean;
  onRegenerate: () => void;
  modelLabel?: string;
}

export function ImagePreview({
  imageUrl,
  isGenerating,
  onRegenerate,
  modelLabel = "Gemini Pro Image",
}: ImagePreviewProps) {
  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      // Sequential number persisted in localStorage
      const next = parseInt(localStorage.getItem("puzzle-count") || "0") + 1;
      localStorage.setItem("puzzle-count", String(next));
      const filename = `puzzle${next}.jpg`;

      // Convert to JPG via canvas (adds white bg, no transparency issues)
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = imageUrl;
      });

      const cvs = document.createElement("canvas");
      cvs.width = img.naturalWidth || img.width;
      cvs.height = img.naturalHeight || img.height;
      const ctx2d = cvs.getContext("2d")!;
      ctx2d.fillStyle = "#FFFFFF";
      ctx2d.fillRect(0, 0, cvs.width, cvs.height);
      ctx2d.drawImage(img, 0, 0);

      const jpgUrl = cvs.toDataURL("image/jpeg", 0.93);
      const blob = await (await fetch(jpgUrl)).blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 500);

      toast.success(`บันทึก ${filename} ไปที่ Downloads แล้ว`);
    } catch {
      toast.error("ดาวน์โหลดไม่สำเร็จ — ลองกด 'ดูรูปเต็ม' แล้วบันทึกเองแทนครับ");
    }
  };

  const handleViewFull = () => {
    if (!imageUrl) return;
    window.open(imageUrl, "_blank");
  };

  return (
    <Card className="border-l-4 border-l-emerald-500">
      <CardContent className="p-0">
        <div className="flex items-center gap-2.5 border-b px-4 py-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10">
            <Eye className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <span className="text-sm font-medium">ตัวอย่างภาพ</span>
          <Badge variant="secondary" className="ml-auto text-xs">
            {modelLabel}
          </Badge>
        </div>

        <div className="space-y-4 p-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border bg-muted/50">
            {isGenerating ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted-foreground/30 border-t-primary" />
                <p className="text-sm">กำลังสร้างภาพ...</p>
              </div>
            ) : imageUrl ? (
              <Image
                src={imageUrl}
                alt="Generated image"
                fill
                className="object-contain"
                unoptimized
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                <ImageIcon className="h-12 w-12 opacity-30" />
                <p className="text-sm">ยังไม่มีภาพ — เลือกประเภทปริศนาแล้วกดสร้าง</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              disabled={isGenerating || !imageUrl}
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5 text-amber-500" />
              Regenerate
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!imageUrl}
            >
              <Download className="mr-2 h-3.5 w-3.5 text-green-500" />
              ดาวน์โหลด
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleViewFull}
              disabled={!imageUrl}
            >
              <Eye className="mr-2 h-3.5 w-3.5 text-sky-500" />
              ดูรูปเต็ม
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
