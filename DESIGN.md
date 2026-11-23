---
name: MedWise
description: Clinical decision support and ECG learning for doctors, in one calm, exact system.
colors:
  ward-navy: "#1a1c49"
  ward-navy-raised: "#262a55"
  monitor-teal: "#18ab97"
  monitor-teal-ink: "#0b7466"
  monitor-teal-wash: "#e3f6f3"
  chart-gold: "#e2a946"
  chart-gold-wash: "#fbf1dd"
  chart-gold-ink: "#7a5410"
  white: "#ffffff"
  cool-surface: "#f4f6f8"
  slate-muted: "#5f6485"
  hairline: "#e2e5ee"
  hairline-strong: "#c7cbdb"
  ecg-paper: "#fff6f2"
  correct-green: "#1d7f55"
  wrong-red: "#c03d2b"
typography:
  display:
    fontFamily: "Chivo, system-ui, sans-serif"
    fontSize: "clamp(38px, 3.24vw + 25.4px, 72px)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Chivo, system-ui, sans-serif"
    fontSize: "clamp(30px, 1.72vw + 23.3px, 48px)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Chivo, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  card-title:
    fontFamily: "Chivo, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Chivo, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  small:
    fontFamily: "Chivo, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Chivo, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.08em"
  mono:
    fontFamily: "Chivo Mono, ui-monospace, Menlo, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "8px"
  md: "12px"
  lg: "20px"
  full: "999px"
spacing:
  s-1: "4px"
  s-2: "8px"
  s-3: "12px"
  s-4: "16px"
  s-5: "24px"
  s-6: "32px"
  s-7: "48px"
  s-8: "64px"
  s-9: "96px"
  s-10: "128px"
components:
  button-primary:
    backgroundColor: "{colors.ward-navy}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: "0 20px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ward-navy}"
    rounded: "{rounded.sm}"
    padding: "0 20px"
    height: "44px"
  button-accent:
    backgroundColor: "{colors.monitor-teal}"
    textColor: "{colors.ward-navy}"
    rounded: "{rounded.sm}"
    padding: "0 20px"
    height: "44px"
  card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.lg}"
    padding: "24px"
  chip:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ward-navy}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "28px"
  chip-accent:
    backgroundColor: "{colors.monitor-teal-wash}"
    textColor: "{colors.monitor-teal-ink}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "28px"
  chip-gold:
    backgroundColor: "{colors.chart-gold-wash}"
    textColor: "{colors.chart-gold-ink}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "28px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ward-navy}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
---

# Design System: MedWise

## Overview

**Creative North Star: "The Ward Round Notebook"**

MedWise looks like the notebook a careful senior keeps on rounds: navy ink on white, written for a doctor between patients. Teal marks the answer or the live trace, and gold marks the point worth remembering. The ECG paper, pink-grid and warm, is the one place the page changes material, because that is where the reading happens.

The system is calm and exact rather than loud. One sans-serif family (Chivo) carries everything from the hero to the caliper readout, with Chivo Mono for numbers that are measured. Density follows the surface. The landing page breathes, with one idea per screen. The ECG course is a narrow, card-based column built for short sessions on a phone. The clinical tools put scanability first. Depth is a hairline border plus a very soft navy shadow, never a heavy drop shadow.

The `/app` sepsis tool still uses an older look: Inter with Libre Baskerville, blue `#004a80`, and square uppercase buttons with wide letter-spacing. That look is **legacy**. New work on `/app` moves it toward this system and never extends the old look.

**Key Characteristics:**
- Navy ink on white and cool grey; teal and gold used sparingly and with meaning
- One type family (Chivo), with Chivo Mono for measured values
- Soft corners on one scale (8 / 12 / 20 px)
- Hairline borders and faint navy-tinted shadows; flat at rest
- ECG paper as the single warm surface
- Real clinical material (real ECGs, real guideline rules) as the imagery

## Colors

A restrained navy-and-white palette in which teal and gold each have one job.

### Primary
- **Ward Navy** (`{colors.ward-navy}`): all text, headings, primary buttons, the logo ink and the inverted (dark) sections. It is the voice of the product.
- **Ward Navy Raised** (`{colors.ward-navy-raised}`): surfaces sitting on a navy section, such as cards inside a dark band.

### Secondary
- **Monitor Teal** (`{colors.monitor-teal}`): the accent. Use it for the answer, the active state, progress fills, the live ECG trace on the landing page, the focus ring and the accent button. It is a fill colour, not a text colour on white.
- **Monitor Teal Ink** (`{colors.monitor-teal-ink}`): teal dark enough for text and icons on white (links in an accent chip, "you are here").
- **Monitor Teal Wash** (`{colors.monitor-teal-wash}`): background of accent chips and selected rows.

### Tertiary
- **Chart Gold** (`{colors.chart-gold}`): the highlighter. Use it for the eyebrow dot, the rule under a key point, and Pro or locked markers. Use it rarely.
- **Chart Gold Wash / Ink** (`{colors.chart-gold-wash}` / `{colors.chart-gold-ink}`): gold chips ("Pro", "Student or Pro"), where the ink keeps text legible.

### Neutral
- **White** (`{colors.white}`): cards, header, inputs and the landing page ground.
- **Cool Surface** (`{colors.cool-surface}`): the app background behind cards and the alternate landing band.
- **Slate Muted** (`{colors.slate-muted}`): secondary text, captions, eyebrows and meta lines.
- **Hairline / Hairline Strong** (`{colors.hairline}` / `{colors.hairline-strong}`): card borders and dividers; the strong one marks secondary-button borders and hover borders.
- **ECG Paper** (`{colors.ecg-paper}`): ground for every ECG tracing, with a 5 mm major grid (`rgb(224 122 110 / .32)`) and a 1 mm minor grid (`rgb(242 184 176 / .35)`).

### Feedback
- **Correct Green** (`{colors.correct-green}`) and **Wrong Red** (`{colors.wrong-red}`): only for graded answers, completed units and errors. Never decorative.

### Named Rules
**The One Job Rule.** Teal means "this is the answer / this is live / this is active"; gold means "remember this / this is premium". A colour used outside its job is a bug.

**The Warm Paper Rule.** ECG paper pink appears only under an ECG tracing. No other surface is warm.

## Typography

**Display Font:** Chivo (with system-ui, sans-serif)
**Body Font:** Chivo (with system-ui, sans-serif)
**Label/Mono Font:** Chivo Mono (with ui-monospace, Menlo)

**Character:** One sober grotesque does every job, so hierarchy comes from size, weight and tracking, not from mixing families. Large headings use a light 400 weight with tight tracking and read as calm authority. Chivo Mono marks anything that was measured: heart rate, intervals, timers, scores.

### Hierarchy
- **Display** (400, `clamp(38px, 3.24vw + 25.4px, 72px)`, 1.04, -0.03em): landing hero and closing statement only.
- **Headline** (400, `clamp(30px, 1.72vw + 23.3px, 48px)`, 1.1): landing section headings. In the ECG app, page titles run 30 to 44 px at weight 500 with -0.02em tracking.
- **Title** (500, 24 px, 1.2): card and panel headings, unit and level names.
- **Card title** (500, 18 px, 1.3): list items and small card heads.
- **Body** (400, 16 px, 1.55): running text, kept to about 62ch.
- **Small** (400, 14 px, 1.5): meta lines, captions, the footer.
- **Label** (500, 12 px, uppercase, 0.08em): eyebrows above headings, often with the gold dot.
- **Mono** (Chivo Mono): measurements, timers, scores, unit numbers, with tabular figures.

### Named Rules
**The Measured Mono Rule.** A number that came from a calliper, a clock or a score is set in Chivo Mono. Prose numbers stay in Chivo.

**The Single Family Rule.** No second display face. Serif and "font-display" classes map to Chivo.

## Layout

- **Spacing:** one scale, 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 px (`{spacing.s-1}` to `{spacing.s-10}`).
- **Landing page:** page gutter of 16 px on phones, 48 px from 640 px and 80 px from 1024 px. Each section holds one idea and fits in one screen, with a 48 px heading-to-content gap (32 px on phones). Cards sit 16 px apart (24 px on desktop).
- **ECG app:** a centred column at most 1152 px wide (`max-w-6xl`) with 16 px side padding. The white header is 64 px tall. On phones, desktop navigation becomes a bottom tab bar. Content is stacked white cards on the cool surface.
- **Clinical tools:** dense, table-like lists (bed, plan, review day) for scanning at a glance.
- **Breakpoints:** 640 px (tablet), 768 px (`md`, app layout switch) and 1024 px (desktop).

## Elevation & Depth

The system is flat at rest, with depth from borders and tone rather than shadow. Cards carry a hairline border and an almost invisible navy-tinted shadow. Interactive cards lift 2 px on hover, where the shadow deepens and the border strengthens. Product frames on the landing page (app windows) use one long, soft shadow so they read as objects on the page.

### Shadow Vocabulary
- **Card rest** (`box-shadow: 0 1px 2px rgb(26 28 73 / .04), 0 8px 24px -12px rgb(26 28 73 / .08)`): every card.
- **Card lift** (`box-shadow: 0 2px 4px rgb(26 28 73 / .05), 0 16px 32px -14px rgb(26 28 73 / .16)`): hover on a linked card, with `translateY(-2px)`.
- **Product frame** (`box-shadow: 0 30px 60px -30px color-mix(in oklab, #1a1c49 40%, transparent)`): app-window mockups on the landing page.

### Named Rules
**The Lift Means Link Rule.** Only something you can click lifts. Static cards never move.

## Shapes

The corners are soft on one scale: 8 px for buttons, inputs and small panels, 12 px for inner panels and ECG frames, and 20 px for cards and large containers. Chips and status pills are fully rounded. Dividers are 1 px hairlines. The only patterned surface is the ECG grid. Avatars, the eyebrow dot and progress markers are circles.

## Components

### Buttons
Buttons are quiet and solid, with one clear primary on each view.
- **Shape:** gently rounded (`{rounded.sm}`), 44 px tall, 20 px side padding, 15 px medium text, no uppercase.
- **Primary:** Ward Navy fill with white text. Hover mixes 16% white into the navy, and press scales to 0.98.
- **Secondary:** white with a Hairline Strong border and navy text. Hover tints the fill faintly and darkens the border.
- **Accent:** Monitor Teal fill with navy text, for the one "start" action on a teal-led surface.
- **Arrow:** primary links can carry a trailing "→" that nudges 3 px right on hover.
- **Focus:** a 2 px Monitor Teal outline offset 2 px, on every control.

### Chips
- **Neutral:** white, hairline border, navy 12 px medium text, 28 px tall.
- **Accent:** Monitor Teal Wash with Monitor Teal Ink text, for "You are here" and positive states.
- **Gold:** Chart Gold Wash with Chart Gold Ink text, for Pro and locked markers, often with a lock icon.

### Cards / Containers
- **Corner Style:** `{rounded.lg}` (20 px).
- **Background:** white on the cool surface.
- **Shadow Strategy:** Card rest, and Card lift when linked (see Elevation & Depth).
- **Border:** 1 px Hairline.
- **Internal Padding:** 20 to 24 px; list rows inside a card have 14 px vertical padding and hairline separators.

### Inputs / Fields
- **Style:** white, 1 px Hairline border, `{rounded.sm}`, 10 × 12 px padding, 14 px text; label above in 12 px medium Slate Muted.
- **Focus:** the border turns Ward Navy, and the global teal focus ring applies.
- **Answer options** (quiz, drill, exam): full-width bordered rows. When selected they take a navy border, a 5% navy fill and semibold text. When graded they turn Correct Green or Wrong Red.

### Navigation
- **Header:** white, 64 px, logo mark plus wordmark at the left and text links at the right. The current page is navy, and other links are Slate Muted.
- **Phones:** a fixed bottom tab bar with icon and label; the active tab is navy.
- **Landing:** a centred nav with a dropdown menu for modules ("Live now" and "In development" groups), and one navy action at the right.

### ECG Viewer (signature)
A real 12-lead tracing on ECG paper inside a 12 px frame, with calipers you can drag to measure. Readouts appear in Chivo Mono. On the landing page a live lead II trace sweeps across in Monitor Teal, with a heart-rate badge.

### Progress
Thin 6 px rounded bars on a Hairline track, filled with Monitor Teal. Completed units show a Correct Green disc with a check; locked units show a lock on Cool Surface.

## Do's and Don'ts

### Do:
- **Do** set all text in Ward Navy (`#1a1c49`) or Slate Muted (`#5f6485`). Teal text on white must use Monitor Teal Ink (`#0b7466`).
- **Do** keep one primary (navy) button per view and pair it with at most one secondary.
- **Do** put every ECG on ECG paper with the 5 mm / 1 mm grid, at 25 mm/s and 10 mm/mV.
- **Do** set measured values (bpm, ms, timers, scores) in Chivo Mono with tabular figures.
- **Do** use the 8 / 12 / 20 px radius scale and the 4-to-128 px spacing scale; nothing in between.
- **Do** keep a visible 2 px teal focus ring on every interactive element and honour `prefers-reduced-motion`.

### Don't:
- **Don't** extend the legacy `/app` look (Inter, Libre Baskerville, `#004a80`, square uppercase buttons with wide tracking) to any new screen.
- **Don't** use Monitor Teal (`#18ab97`) as body text on white; it fails contrast.
- **Don't** use Chart Gold for anything but highlights and Pro markers.
- **Don't** use warm or pink surfaces anywhere except under an ECG.
- **Don't** add heavy drop shadows, gradients on buttons or glassy blur panels.
- **Don't** add a second typeface.
- **Don't** make static cards lift on hover.
