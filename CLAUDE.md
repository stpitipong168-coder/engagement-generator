# Engagement Puzzle Generator — CLAUDE.md

## Project Overview
Thai Facebook engagement puzzle image generator. Each puzzle type produces a **1:1 square image** ready to post on Facebook, with a **caption** for copy-paste. Goal: make people stop scrolling, look at the image, and comment their answer.

Owner is a Thai FB content creator (non-coder). Needs 60–100 unique images/month.

---

## Tech Stack
- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- AI text: OpenRouter → `claude-sonnet-4-5`
- AI image: OpenRouter → `google/gemini-3-pro-image-preview` (Nano Banana Pro) or `google/gemini-3.1-flash-image-preview` (Nano Banana 2)
- Canvas rendering: client-side `canvas` API (for canvas-based puzzle types)

---

## Puzzle Types & Current Status

### 1. หาของซ่อน (find-hidden) ✅ Canvas
- Grid of repeated chars/numbers, with a few "hidden" different ones
- **Difficulty comes from SIMILAR SHAPE** — hidden char is SAME COLOR as all others, not red/highlighted
- **8 background themes** rotated randomly: blue, yellow, mint, lavender, peach, slate, teal, rose
- Data flows: API → `canvasData` (with `theme` field) → client `generateFindHiddenImage()`
- Key: AI picks `mainChar`/`hiddenChar` that look visually similar (e.g. 98 vs 96, Q vs O)

### 2. ทายภาพ X พยางค์ (rebus-word) ✅ AI Image
- AI picks an X-syllable Thai word, breaks into rebusElements (image + char)
- **ALL image-type objects are MERGED into one surreal chimera creature** (e.g. ข้าว+ปลา+แกะ = fish-sheep standing on rice)
- NOT side-by-side layout — one unified surreal photorealistic image
- Prompt: `buildRebusWordMergedImagePrompt()` in `lib/puzzle-types.ts`
- Answer shown via "เปิดเฉลย" button

### 3. นับ X กี่ตัว (count-items) ✅ AI Image
- AI generates image with animals/objects, some hidden/overlapping
- Viewer counts and comments
- Uses `buildAIPuzzleImagePrompt()` + `buildCountItemsPrompt()`

### 4. คณิตคิดเร็ว (math-challenge) ✅ Canvas
- Arithmetic equation, "ห้ามใช้เครื่องคิดเลข"
- **6 rotating background themes**: wood, chalkboard, paper, pink, blue, purple
- Theme randomly assigned per generation in route.ts
- Data flows: API → `canvasData` (with `theme` field) → client `generateMathChallengeImage()`

### 5. สำนวนไทย (proverb-rebus) ⚠️ AI Image — Partially Working
- Rebus puzzle: each image = initial consonant of Thai object name → decode to proverb
- **CRITICAL BUG**: Gemini AI cannot render Thai combining chars (ิ ี ึ ั ็ ่ ้) as standalone glyphs — it adds phantom base consonants
- **WORKAROUND**: Bank only contains proverbs using standalone vowels (า ะ เ แ โ ใ ไ อ)
- Current bank has 6 proverbs (see `PROVERB_BANK` in `lib/puzzle-types.ts`)
- Exclude mechanism: `lastProverb` in localStorage → `excludeProverb` param prevents repeat
- **DO NOT add proverbs with combining chars** until the rendering bug is fixed
- สำนวนไทย improvements PAUSED — fix other types first

---

## Key Files
```
lib/puzzle-types.ts        — All prompt builders, PROVERB_BANK, type definitions
lib/canvas-puzzles.ts      — Client-side canvas renderers (find-hidden, math, proverb canvas)
app/api/content/generate-puzzle/route.ts  — Main API route
app/page.tsx               — UI, form handling, canvas trigger
components/puzzle/puzzle-form.tsx         — Puzzle type selector + options form
```

---

## Critical Constraints

### Gemini AI Image Rendering
- ❌ Combining Thai chars (ิ ี ึ ั ็ ่ ้) render WITH phantom base consonants
- ✅ Standalone chars (า ะ เ แ โ ใ ไ อ) render correctly
- ✅ All Thai consonant letters (ก-ฮ) render fine as text
- Workaround attempts: shape descriptions (∩ for ิ), Thai-language instructions — partially tested

### PROVERB_BANK object → consonant mapping
```
frog/rooster = ก   lotus = บ   mouse = น   monkey = ล   star = ด
tiger = ส   snake = ง   buffalo = ค   horse = ม   pig = ห
giant demon = ย   turtle = ต   mountain = ภ
```

### Facebook Safety
- All prompts include `FB_SAFE_RULE` — mandatory in every prompt (text + image)
- No nudity, violence, alcohol, drugs — must pass FB Community Standards

---

## Design Decisions (do not revert without reason)

1. **หาของซ่อน hidden char = SAME color (#1a1a1a) as main chars** — difficulty from shape similarity, not color. Previously was red (#CC0000) which made it too obvious.

2. **ทายภาพ uses MERGED CHIMERA image** (not side-by-side grid). The visual concept is a single surreal creature made of all syllable-objects fused together. buildRebusWordMergedImagePrompt() handles this.

3. **คณิตคิดเร็ว has 6 background themes** rotated randomly — prevents repetitive-looking posts.

4. **PROVERB_BANK is hardcoded** — AI must pick from this list only. AI generating its own proverbs caused hallucinated/fake proverbs. Bank validates via exact name match.

5. **No canvas hybrid for proverb-rebus** — attempted (Image #47) but AI drew grid lines + wrong object count. Reverted to pure AI image.

6. **customTopic for สำนวนไทย** = topic hint for AI selection, NOT a specific proverb name. The field needs UI clarification (pending).

---

## Pending / Known Issues
- สำนวนไทย: combining char rendering in AI images (PAUSED)
- สำนวนไทย: customTopic field should show chip-selector of bank proverbs (not text input)
- สำนวนไทย: only 6 proverbs in bank — insufficient for 100 images/month variety
- ทายภาพ: no explicit answer shown on image — answer reveal only via button
