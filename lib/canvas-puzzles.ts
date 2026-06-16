import type { FindHiddenData, MathChallengeData, ProverbRebusCanvasData } from "./puzzle-types";

type FHTheme = {
  draw: (ctx: CanvasRenderingContext2D, size: number) => void;
  text: string;
  gridLine: string;
  glow?: string; // optional glow color for neon
};

const FIND_HIDDEN_THEMES: Record<string, FHTheme> = {
  sky: {
    draw: (ctx, s) => { ctx.fillStyle = "#87CEEB"; ctx.fillRect(0, 0, s, s); },
    text: "#1a1a1a", gridLine: "rgba(0,0,0,0.06)",
  },
  sunset: {
    draw: (ctx, s) => {
      const g = ctx.createLinearGradient(0, 0, 0, s);
      g.addColorStop(0, "#FF6B6B"); g.addColorStop(0.45, "#FE8797");
      g.addColorStop(0.75, "#FFC2D4"); g.addColorStop(1, "#FFE4BA");
      ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
    },
    text: "#2D0010", gridLine: "rgba(0,0,0,0.07)",
  },
  space: {
    draw: (ctx, s) => {
      ctx.fillStyle = "#0D1117"; ctx.fillRect(0, 0, s, s);
      // deterministic stars via golden angle
      const phi = 2.39996; // golden angle in radians
      for (let i = 0; i < 260; i++) {
        const r = Math.sqrt(i / 260) * s * 0.72 + 30;
        const angle = i * phi;
        const x = s / 2 + Math.cos(angle) * r;
        const y = s / 2 + Math.sin(angle) * r;
        const br = (i % 5 === 0) ? 2 : (i % 3 === 0) ? 1.4 : 0.9;
        ctx.fillStyle = i % 7 === 0 ? "#AADDFF" : "#FFFFFF";
        ctx.globalAlpha = 0.4 + (i % 4) * 0.15;
        ctx.beginPath(); ctx.arc(x, y, br, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
    text: "#FFFFFF", gridLine: "rgba(255,255,255,0.08)",
  },
  polkadots: {
    draw: (ctx, s) => {
      ctx.fillStyle = "#FFFDE7"; ctx.fillRect(0, 0, s, s);
      const colors = ["#FF8A80","#82B1FF","#CCFF90","#FFD180","#EA80FC","#80D8FF"];
      const spacing = 110;
      let ci = 0;
      for (let row = 0; row < 11; row++) {
        for (let col = 0; col < 11; col++) {
          const x = col * spacing + (row % 2 === 0 ? 30 : 80);
          const y = row * spacing + 30;
          ctx.fillStyle = colors[ci % colors.length] + "55";
          ctx.beginPath(); ctx.arc(x, y, 35, 0, Math.PI * 2); ctx.fill();
          ci++;
        }
      }
    },
    text: "#1a1a1a", gridLine: "rgba(0,0,0,0.06)",
  },
  stripes: {
    draw: (ctx, s) => {
      ctx.fillStyle = "#F8F8F8"; ctx.fillRect(0, 0, s, s);
      const w = 48;
      ctx.fillStyle = "#E8F4FD";
      for (let i = -s; i < s * 2; i += w * 2) {
        ctx.save();
        ctx.translate(s / 2, s / 2);
        ctx.rotate(-Math.PI / 5);
        ctx.fillRect(i, -s, w, s * 3);
        ctx.restore();
      }
    },
    text: "#1a1a1a", gridLine: "rgba(0,0,0,0.06)",
  },
  chalkboard: {
    draw: (ctx, s) => {
      ctx.fillStyle = "#1B3A2D"; ctx.fillRect(0, 0, s, s);
      // chalk dust texture — horizontal smear lines
      ctx.strokeStyle = "rgba(255,255,255,0.04)"; ctx.lineWidth = 3;
      for (let y = 0; y < s; y += 14) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(s, y + 6); ctx.stroke();
      }
    },
    text: "#F0EDE0", gridLine: "rgba(255,255,255,0.1)",
  },
  graphpaper: {
    draw: (ctx, s) => {
      ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, s, s);
      const grid = 54;
      ctx.lineWidth = 1;
      for (let x = 0; x <= s; x += grid) {
        ctx.strokeStyle = x % (grid * 5) === 0 ? "rgba(70,130,180,0.35)" : "rgba(70,130,180,0.15)";
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, s); ctx.stroke();
      }
      for (let y = 0; y <= s; y += grid) {
        ctx.strokeStyle = y % (grid * 5) === 0 ? "rgba(70,130,180,0.35)" : "rgba(70,130,180,0.15)";
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(s, y); ctx.stroke();
      }
    },
    text: "#1A3A5C", gridLine: "rgba(70,130,180,0.12)",
  },
  neon: {
    draw: (ctx, s) => {
      const g = ctx.createRadialGradient(s * 0.5, s * 0.5, 0, s * 0.5, s * 0.5, s * 0.7);
      g.addColorStop(0, "#1A003A"); g.addColorStop(1, "#060010");
      ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
      // neon grid lines
      ctx.strokeStyle = "rgba(0,255,200,0.08)"; ctx.lineWidth = 1;
      for (let x = 0; x < s; x += 90) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,s); ctx.stroke(); }
      for (let y = 0; y < s; y += 90) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(s,y); ctx.stroke(); }
    },
    text: "#00FFD1", gridLine: "rgba(0,255,200,0.07)", glow: "#00FFD1",
  },
  autumn: {
    draw: (ctx, s) => {
      const g = ctx.createRadialGradient(s * 0.3, s * 0.3, 0, s * 0.6, s * 0.6, s);
      g.addColorStop(0, "#FFD54F"); g.addColorStop(0.4, "#FF8F00");
      g.addColorStop(0.75, "#E64A19"); g.addColorStop(1, "#4E342E");
      ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
    },
    text: "#1A0A00", gridLine: "rgba(0,0,0,0.1)",
  },
  ocean: {
    draw: (ctx, s) => {
      const g = ctx.createLinearGradient(0, 0, 0, s);
      g.addColorStop(0, "#0277BD"); g.addColorStop(0.5, "#0288D1");
      g.addColorStop(1, "#01579B");
      ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
      // wave lines
      ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 3;
      for (let y = 40; y < s; y += 60) {
        ctx.beginPath();
        for (let x = 0; x <= s; x += 8) {
          const wy = y + Math.sin((x / s) * Math.PI * 4 + y * 0.1) * 12;
          x === 0 ? ctx.moveTo(x, wy) : ctx.lineTo(x, wy);
        }
        ctx.stroke();
      }
    },
    text: "#FFFFFF", gridLine: "rgba(255,255,255,0.08)",
  },
};

const SIZE = 1080;
const FONT_FAMILY = "'Sarabun', 'TH Sarabun New', 'Thonburi', 'Leelawadee UI', Arial, sans-serif";
const BANNER_FONT_SIZE = 72;
const BANNER_PAD_X = 52;
const BANNER_PAD_Y = 28;
const BANNER_RADIUS = 16;
const BANNER_TOP = 36;

// Returns the bottom Y of the drawn banner
function drawBanner(ctx: CanvasRenderingContext2D, text: string): number {
  ctx.font = `bold ${BANNER_FONT_SIZE}px ${FONT_FAMILY}`;
  const textW = ctx.measureText(text).width;
  const bannerW = textW + BANNER_PAD_X * 2;
  const bannerH = BANNER_FONT_SIZE + BANNER_PAD_Y * 2;
  const bannerX = (SIZE - bannerW) / 2;
  const bannerY = BANNER_TOP;

  // Dark maroon gradient background
  const bgGrad = ctx.createLinearGradient(bannerX, bannerY, bannerX + bannerW, bannerY + bannerH);
  bgGrad.addColorStop(0, "#5A0000");
  bgGrad.addColorStop(0.45, "#8B0E0E");
  bgGrad.addColorStop(0.55, "#8B0E0E");
  bgGrad.addColorStop(1, "#5A0000");
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.roundRect(bannerX, bannerY, bannerW, bannerH, BANNER_RADIUS);
  ctx.fill();

  // Subtle top highlight
  const highlightGrad = ctx.createLinearGradient(bannerX, bannerY, bannerX, bannerY + bannerH * 0.45);
  highlightGrad.addColorStop(0, "rgba(255,255,255,0.12)");
  highlightGrad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = highlightGrad;
  ctx.beginPath();
  ctx.roundRect(bannerX, bannerY, bannerW, bannerH, BANNER_RADIUS);
  ctx.fill();

  // White-to-gold gradient text
  const textCenterY = bannerY + bannerH / 2;
  const textGrad = ctx.createLinearGradient(0, textCenterY - BANNER_FONT_SIZE / 2, 0, textCenterY + BANNER_FONT_SIZE / 2);
  textGrad.addColorStop(0, "#FFFFFF");
  textGrad.addColorStop(0.5, "#FFF5D6");
  textGrad.addColorStop(1, "#E8C060");
  ctx.fillStyle = textGrad;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, SIZE / 2, textCenterY);

  return bannerY + bannerH;
}

export function generateFindHiddenImage(data: FindHiddenData): string {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;

  const themeKey = data.theme ?? "sky";
  const theme = FIND_HIDDEN_THEMES[themeKey] ?? FIND_HIDDEN_THEMES.sky;

  theme.draw(ctx, SIZE);

  // Draw banner first to get bottomY
  const bannerBottom = drawBanner(ctx, data.headline);

  // Subtle grid lines
  ctx.strokeStyle = theme.gridLine;
  ctx.lineWidth = 1;
  const gridTop = bannerBottom + 12;
  const gridH = SIZE - gridTop - 12;
  const cellW = SIZE / data.cols;
  const cellH = gridH / data.rows;

  for (let c = 1; c < data.cols; c++) {
    ctx.beginPath();
    ctx.moveTo(c * cellW, gridTop);
    ctx.lineTo(c * cellW, SIZE - 8);
    ctx.stroke();
  }
  for (let r = 1; r < data.rows; r++) {
    ctx.beginPath();
    ctx.moveTo(0, gridTop + r * cellH);
    ctx.lineTo(SIZE, gridTop + r * cellH);
    ctx.stroke();
  }

  const hiddenSet = new Set(data.hiddenPositions.map(([r, c]) => `${r},${c}`));
  const fontSize = Math.min(Math.floor(cellW * 0.55), Math.floor(cellH * 0.62), 58);

  ctx.font = `bold ${fontSize}px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let r = 0; r < data.rows; r++) {
    for (let c = 0; c < data.cols; c++) {
      const x = c * cellW + cellW / 2;
      const y = gridTop + r * cellH + cellH / 2;
      const isHidden = hiddenSet.has(`${r},${c}`);
      // Same color for all — difficulty comes from similar shape, not color difference
      if (theme.glow) {
        ctx.shadowColor = theme.glow;
        ctx.shadowBlur = 14;
      }
      ctx.fillStyle = theme.text;
      ctx.fillText(isHidden ? data.hiddenChar : data.mainChar, x, y);
      ctx.shadowBlur = 0;
    }
  }

  return canvas.toDataURL("image/png");
}

type MathTheme = {
  bg1: string; bg2: string;
  cardFill: string; cardStroke: string;
  lineColor: string;
  eqColor: string; subColor: string; iconColor: string;
  grainColor: string;
};

const MATH_THEMES: Record<string, MathTheme> = {
  wood: {
    bg1: "#2C2416", bg2: "#1A1510",
    cardFill: "rgba(255,240,200,0.08)", cardStroke: "rgba(255,200,100,0.3)",
    lineColor: "rgba(255,180,80,0.25)",
    eqColor: "#F5E6C8", subColor: "#FF8C69", iconColor: "#FF8C69",
    grainColor: "rgba(255,220,150,0.04)",
  },
  chalkboard: {
    bg1: "#1B4332", bg2: "#0D2818",
    cardFill: "rgba(255,255,255,0.06)", cardStroke: "rgba(255,255,255,0.2)",
    lineColor: "rgba(255,255,255,0.15)",
    eqColor: "#FFFDE7", subColor: "#FFCC02", iconColor: "#FFCC02",
    grainColor: "rgba(255,255,255,0.02)",
  },
  paper: {
    bg1: "#F5F0E8", bg2: "#EAE4D6",
    cardFill: "rgba(255,255,255,0.6)", cardStroke: "rgba(100,80,60,0.25)",
    lineColor: "rgba(100,120,200,0.2)",
    eqColor: "#1A1A2E", subColor: "#C0392B", iconColor: "#C0392B",
    grainColor: "rgba(100,80,60,0.03)",
  },
  pink: {
    bg1: "#F8BBD9", bg2: "#F48FB1",
    cardFill: "rgba(255,255,255,0.35)", cardStroke: "rgba(180,40,120,0.2)",
    lineColor: "rgba(180,40,120,0.12)",
    eqColor: "#2D0A20", subColor: "#880E4F", iconColor: "#880E4F",
    grainColor: "rgba(255,255,255,0.08)",
  },
  blue: {
    bg1: "#1565C0", bg2: "#0D47A1",
    cardFill: "rgba(255,255,255,0.1)", cardStroke: "rgba(100,200,255,0.3)",
    lineColor: "rgba(100,200,255,0.2)",
    eqColor: "#FFFFFF", subColor: "#90CAF9", iconColor: "#90CAF9",
    grainColor: "rgba(255,255,255,0.03)",
  },
  purple: {
    bg1: "#4A148C", bg2: "#2D0057",
    cardFill: "rgba(255,255,255,0.08)", cardStroke: "rgba(200,150,255,0.3)",
    lineColor: "rgba(200,150,255,0.2)",
    eqColor: "#F3E5F5", subColor: "#CE93D8", iconColor: "#CE93D8",
    grainColor: "rgba(255,255,255,0.03)",
  },
};

export function generateMathChallengeImage(data: MathChallengeData): string {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;

  const theme = MATH_THEMES[data.theme ?? "wood"] ?? MATH_THEMES.wood;

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  bgGrad.addColorStop(0, theme.bg1);
  bgGrad.addColorStop(1, theme.bg2);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // Subtle texture lines
  ctx.strokeStyle = theme.grainColor;
  ctx.lineWidth = 2;
  for (let i = 0; i < SIZE; i += 18) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(SIZE, i + 30);
    ctx.stroke();
  }

  // Banner
  const bannerBottom = drawBanner(ctx, data.headline);

  const cardX = 80;
  const cardY = Math.max(bannerBottom + 60, 280);
  const cardW = SIZE - 160;
  const cardH = 300;

  ctx.fillStyle = theme.cardFill;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 16);
  ctx.fill();

  ctx.strokeStyle = theme.cardStroke;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Horizontal lines
  ctx.strokeStyle = theme.lineColor;
  ctx.lineWidth = 1.5;
  const lineY1 = cardY + cardH * 0.38;
  const lineY2 = cardY + cardH * 0.72;
  ctx.beginPath();
  ctx.moveTo(cardX + 30, lineY1);
  ctx.lineTo(cardX + cardW - 30, lineY1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cardX + 30, lineY2);
  ctx.lineTo(cardX + cardW - 30, lineY2);
  ctx.stroke();

  // Equation
  ctx.fillStyle = theme.eqColor;
  const eqFontSize = Math.min(88, Math.floor(cardW / (data.equation.length * 0.55)));
  ctx.font = `bold ${eqFontSize}px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(data.equation, SIZE / 2, cardY + cardH * 0.38);

  // Sub text
  ctx.fillStyle = theme.subColor;
  ctx.font = `bold 52px ${FONT_FAMILY}`;
  ctx.fillText("ห้ามใช้เครื่องคิดเลข", SIZE / 2, cardY + cardH * 0.72);

  // Icon
  ctx.fillStyle = theme.iconColor.replace(")", ",0.15)").replace("rgb", "rgba").replace("#", "rgba(").replace("F", "");
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  ctx.beginPath();
  ctx.roundRect(SIZE / 2 - 100, cardY + cardH + 30, 200, 90, 12);
  ctx.fill();

  ctx.fillStyle = theme.iconColor;
  ctx.font = `70px ${FONT_FAMILY}`;
  ctx.fillText("🧮❌", SIZE / 2, cardY + cardH + 76);

  return canvas.toDataURL("image/png");
}

// AI generates background + objects only; canvas draws banner + Thai chars (OS font = correct combining chars).
export async function generateProverbRebusCanvas(
  data: ProverbRebusCanvasData,
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;

  // Draw AI background (objects already positioned by AI)
  await new Promise<void>((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { ctx.drawImage(img, 0, 0, SIZE, SIZE); resolve(); };
    img.onerror = reject;
    img.src = data.backgroundImageDataUri;
  });

  // Cover top 16% with banner background color first (AI may have left it light)
  const BANNER_AREA = Math.round(SIZE * 0.16);
  const bgGrad = ctx.createLinearGradient(0, 0, 0, BANNER_AREA);
  bgGrad.addColorStop(0, "#5A0000");
  bgGrad.addColorStop(1, "#8B0E0E");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, SIZE, BANNER_AREA);

  // Draw banner text centered in the banner area
  const bannerFontSize = 72;
  ctx.font = `bold ${bannerFontSize}px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const textGrad = ctx.createLinearGradient(0, 0, 0, BANNER_AREA);
  textGrad.addColorStop(0, "#FFFFFF");
  textGrad.addColorStop(0.5, "#FFF5D6");
  textGrad.addColorStop(1, "#E8C060");
  ctx.fillStyle = textGrad;
  ctx.fillText(data.headline, SIZE / 2, BANNER_AREA / 2);

  const bannerBottom = BANNER_AREA;

  // Grid dimensions (must match buildProverbRebusBackgroundPrompt layout)
  const COLS = data.cols;
  const elements = data.rebusElements;
  const rows = Math.ceil(elements.length / COLS);
  const contentTop = bannerBottom + 10;
  const contentH = SIZE - contentTop - 10;
  const cellW = SIZE / COLS;
  const cellH = contentH / rows;

  // Draw Thai chars at their grid positions — OS font handles combining chars correctly
  elements.forEach((el, idx) => {
    if (el.type !== "char" || !el.char) return;

    const row = Math.floor(idx / COLS);
    const col = idx % COLS;
    const cx = col * cellW + cellW / 2;
    const cy = contentTop + row * cellH + cellH / 2;

    const charSize = Math.min(cellW * 0.68, cellH * 0.68, 200);

    // White halo for readability on any AI background
    ctx.shadowColor = "rgba(255,255,255,0.9)";
    ctx.shadowBlur = 22;
    ctx.font = `bold ${charSize}px ${FONT_FAMILY}`;
    ctx.fillStyle = "#111111";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(el.char, cx, cy);
    ctx.shadowBlur = 0;
  });

  return canvas.toDataURL("image/png");
}
