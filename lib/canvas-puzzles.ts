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
  style: "notebook" | "wood" | "chalkboard" | "vintage" | "graph" | "kraft";
  bg1: string; bg2: string;
  eqColor: string; subColor: string;
  dividerColor: string;
  shadow: string;        // text-shadow color so digits stay legible on texture
};

const MATH_THEMES: Record<string, MathTheme> = {
  notebook: {
    style: "notebook",
    bg1: "#FFFDF5", bg2: "#FBE7CC",
    eqColor: "#15388C", subColor: "#C0392B",
    dividerColor: "rgba(21,56,140,0.30)",
    shadow: "rgba(255,255,255,0.65)",
  },
  wood: {
    style: "wood",
    bg1: "#6E4C2B", bg2: "#3C2716",
    eqColor: "#FBE9C8", subColor: "#FFC777",
    dividerColor: "rgba(255,220,160,0.32)",
    shadow: "rgba(0,0,0,0.55)",
  },
  chalkboard: {
    style: "chalkboard",
    bg1: "#23402F", bg2: "#15261D",
    eqColor: "#FFFDE7", subColor: "#FFD54F",
    dividerColor: "rgba(255,255,255,0.30)",
    shadow: "rgba(0,0,0,0.45)",
  },
  vintage: {
    style: "vintage",
    bg1: "#ECE0C4", bg2: "#D6C096",
    eqColor: "#2A2416", subColor: "#B23A2E",
    dividerColor: "rgba(60,48,28,0.30)",
    shadow: "rgba(255,250,235,0.55)",
  },
  graph: {
    style: "graph",
    bg1: "#FFFFFF", bg2: "#EBF2FF",
    eqColor: "#14488A", subColor: "#C62828",
    dividerColor: "rgba(20,72,138,0.25)",
    shadow: "rgba(255,255,255,0.70)",
  },
  kraft: {
    style: "kraft",
    bg1: "#C9A877", bg2: "#A8844E",
    eqColor: "#3A2414", subColor: "#8C2D0E",
    dividerColor: "rgba(58,36,20,0.32)",
    shadow: "rgba(255,240,210,0.40)",
  },
};

// Paints a realistic textured background for the chosen math theme.
function drawMathBackground(ctx: CanvasRenderingContext2D, theme: MathTheme): void {
  const bgGrad = ctx.createLinearGradient(0, 0, 0, SIZE);
  bgGrad.addColorStop(0, theme.bg1);
  bgGrad.addColorStop(1, theme.bg2);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, SIZE, SIZE);

  switch (theme.style) {
    case "notebook": {
      // Horizontal ruled lines + a red left margin line
      ctx.strokeStyle = "rgba(70,110,200,0.22)";
      ctx.lineWidth = 2;
      for (let y = 210; y < SIZE; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(SIZE, y);
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(205,70,70,0.35)";
      ctx.beginPath();
      ctx.moveTo(120, 0);
      ctx.lineTo(120, SIZE);
      ctx.stroke();
      break;
    }
    case "wood": {
      // Wavy grain streaks, light and dark
      for (let i = 0; i < 26; i++) {
        const y = (i / 26) * SIZE + 8;
        const light = i % 2 === 0;
        ctx.strokeStyle = light ? "rgba(190,140,85,0.10)" : "rgba(40,24,12,0.22)";
        ctx.lineWidth = light ? 6 : 3;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.quadraticCurveTo(SIZE * 0.5, y + (light ? 22 : -18), SIZE, y + 6);
        ctx.stroke();
      }
      drawVignette(ctx, "rgba(20,12,6,0.45)");
      break;
    }
    case "chalkboard": {
      // Chalk dust specks + thin chalk frame
      for (let i = 0; i < 420; i++) {
        ctx.fillStyle = `rgba(255,255,255,${0.015 + Math.random() * 0.04})`;
        ctx.fillRect(Math.random() * SIZE, Math.random() * SIZE, 2, 2);
      }
      ctx.strokeStyle = "rgba(255,255,255,0.18)";
      ctx.lineWidth = 3;
      ctx.strokeRect(36, 36, SIZE - 72, SIZE - 72);
      break;
    }
    case "vintage": {
      // Faint aged stains + corner vignette
      for (let i = 0; i < 5; i++) {
        const sx = Math.random() * SIZE;
        const sy = Math.random() * SIZE;
        const r = 120 + Math.random() * 160;
        const stain = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
        stain.addColorStop(0, "rgba(150,110,60,0.10)");
        stain.addColorStop(1, "rgba(150,110,60,0)");
        ctx.fillStyle = stain;
        ctx.fillRect(0, 0, SIZE, SIZE);
      }
      drawVignette(ctx, "rgba(110,80,40,0.40)");
      break;
    }
    case "graph": {
      // Fine grid + bolder major grid lines
      ctx.strokeStyle = "rgba(120,160,220,0.20)";
      ctx.lineWidth = 1;
      for (let p = 0; p <= SIZE; p += 40) {
        ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, SIZE); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(SIZE, p); ctx.stroke();
      }
      ctx.strokeStyle = "rgba(120,160,220,0.40)";
      ctx.lineWidth = 2;
      for (let p = 0; p <= SIZE; p += 200) {
        ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, SIZE); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(SIZE, p); ctx.stroke();
      }
      break;
    }
    case "kraft": {
      // Paper fibre specks
      for (let i = 0; i < 700; i++) {
        const dark = Math.random() > 0.5;
        ctx.fillStyle = dark ? "rgba(90,60,30,0.10)" : "rgba(255,240,210,0.10)";
        ctx.fillRect(Math.random() * SIZE, Math.random() * SIZE, 3, 2);
      }
      drawVignette(ctx, "rgba(60,38,18,0.32)");
      break;
    }
  }
}

function drawVignette(ctx: CanvasRenderingContext2D, edge: string): void {
  const g = ctx.createRadialGradient(SIZE / 2, SIZE / 2, SIZE * 0.32, SIZE / 2, SIZE / 2, SIZE * 0.72);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, edge);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
}

// Colourful decorations near the edges so the fast/canvas backgrounds don't look plain.
// Kept to corners/margins so they never clash with the centred equation.
function drawMathDecor(ctx: CanvasRenderingContext2D, theme: MathTheme): void {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  switch (theme.style) {
    case "notebook": {
      // Spiral binding rings down the left edge
      for (let y = 130; y < SIZE - 70; y += 104) {
        ctx.strokeStyle = "rgba(150,150,160,0.85)";
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(58, y, 17, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.font = "84px " + FONT_FAMILY;
      ctx.fillText("✏️", SIZE - 96, SIZE - 92);
      break;
    }
    case "wood": {
      // Brass screws in the four corners
      for (const [sx, sy] of [[64, 64], [SIZE - 64, 64], [64, SIZE - 64], [SIZE - 64, SIZE - 64]]) {
        ctx.fillStyle = "rgba(70,46,22,0.9)";
        ctx.beginPath(); ctx.arc(sx, sy, 16, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(255,225,170,0.5)";
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(sx - 10, sy - 10); ctx.lineTo(sx + 10, sy + 10); ctx.stroke();
      }
      break;
    }
    case "chalkboard": {
      // Warm wooden frame + little chalk doodles in the corners
      ctx.strokeStyle = "rgba(120,78,40,0.95)";
      ctx.lineWidth = 30;
      ctx.strokeRect(15, 15, SIZE - 30, SIZE - 30);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.font = "62px " + FONT_FAMILY;
      ctx.fillText("➗", 96, 120);
      ctx.fillText("✓", SIZE - 96, 120);
      ctx.fillText("➕", 96, SIZE - 110);
      ctx.font = "84px " + FONT_FAMILY;
      ctx.fillText("🍎", SIZE - 110, SIZE - 110);
      break;
    }
    case "vintage": {
      // Ornate flourishes in the corners
      ctx.fillStyle = "rgba(150,52,40,0.85)";
      ctx.font = "70px " + FONT_FAMILY;
      ctx.fillText("❦", 92, 116);
      ctx.fillText("❦", SIZE - 92, 116);
      ctx.fillText("❦", 92, SIZE - 104);
      ctx.fillText("❦", SIZE - 92, SIZE - 104);
      break;
    }
    case "graph": {
      // Yellow sticky note in the top-right corner
      ctx.save();
      ctx.translate(SIZE - 130, 150);
      ctx.rotate(0.12);
      ctx.shadowColor = "rgba(0,0,0,0.2)";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#FFE680";
      ctx.fillRect(-70, -70, 140, 140);
      ctx.restore();
      ctx.font = "70px " + FONT_FAMILY;
      ctx.fillText("📌", 110, 120);
      break;
    }
    case "kraft": {
      // Washi-tape strips taping the corners
      for (const [tx, ty, rot, col] of [
        [120, 70, -0.5, "rgba(90,180,200,0.55)"],
        [SIZE - 120, SIZE - 70, -0.5, "rgba(230,120,150,0.55)"],
      ] as [number, number, number, string][]) {
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(rot);
        ctx.fillStyle = col;
        ctx.fillRect(-90, -26, 180, 52);
        ctx.restore();
      }
      ctx.font = "62px " + FONT_FAMILY;
      ctx.fillText("📌", SIZE - 90, 100);
      break;
    }
  }
  ctx.restore();
}

// Loads a data-URI image into the canvas context (full-bleed).
function drawImageCover(ctx: CanvasRenderingContext2D, src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { ctx.drawImage(img, 0, 0, SIZE, SIZE); resolve(); };
    img.onerror = reject;
    img.src = src;
  });
}

export async function generateMathChallengeImage(data: MathChallengeData): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;

  const theme = MATH_THEMES[data.theme ?? "notebook"] ?? MATH_THEMES.notebook;
  const aiMode = !!data.backgroundImageDataUri;

  if (aiMode) {
    await drawImageCover(ctx, data.backgroundImageDataUri!);
  } else {
    drawMathBackground(ctx, theme);
    drawMathDecor(ctx, theme);
  }

  // Top banner = catchy hook (varies each generation)
  drawBanner(ctx, data.headline);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Equation — large, centred, with "= ?" so viewers know to answer
  const eqText = `${data.equation} = ?`;
  const eqY = SIZE * 0.47;
  const eqFontSize = Math.max(46, Math.min(112, Math.floor((SIZE - 160) / (eqText.length * 0.52))));

  // On AI scenes the colours are unknown, so use universal white/gold text with
  // a dark plate + outline; on canvas themes use the matched theme colours.
  const eqColor = aiMode ? "#FFFFFF" : theme.eqColor;
  const subColor = aiMode ? "#FFE066" : theme.subColor;
  const dividerColor = aiMode ? "rgba(255,255,255,0.55)" : theme.dividerColor;
  const shadowColor = aiMode ? "rgba(0,0,0,0.9)" : theme.shadow;

  if (aiMode) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.36)";
    ctx.beginPath();
    ctx.roundRect(SIZE * 0.09, eqY - 155, SIZE * 0.82, 330, 28);
    ctx.fill();
    ctx.restore();
  }

  // Framing lines above and below the equation (engraved look)
  const frameW = SIZE * 0.66;
  ctx.strokeStyle = dividerColor;
  ctx.lineWidth = 3;
  for (const dy of [-(eqFontSize * 0.78), eqFontSize * 0.78]) {
    ctx.beginPath();
    ctx.moveTo((SIZE - frameW) / 2, eqY + dy);
    ctx.lineTo((SIZE + frameW) / 2, eqY + dy);
    ctx.stroke();
  }

  ctx.save();
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = aiMode ? 16 : 10;
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(0,0,0,0.8)";

  ctx.fillStyle = eqColor;
  ctx.font = `bold ${eqFontSize}px ${FONT_FAMILY}`;
  if (aiMode) { ctx.lineWidth = 9; ctx.strokeText(eqText, SIZE / 2, eqY); }
  ctx.fillText(eqText, SIZE / 2, eqY);

  // Challenge sub-line (varies each generation)
  const subStr = data.subText ?? "ห้ามใช้เครื่องคิดเลข";
  ctx.fillStyle = subColor;
  ctx.font = `bold 60px ${FONT_FAMILY}`;
  if (aiMode) { ctx.lineWidth = 7; ctx.strokeText(subStr, SIZE / 2, SIZE * 0.68); }
  ctx.fillText(subStr, SIZE / 2, SIZE * 0.68);
  ctx.restore();

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
