"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  description?: string;
}

export function PageHeader({ icon: Icon, iconColor, title, description }: PageHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-muted", iconColor)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}
