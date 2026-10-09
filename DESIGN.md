---
name: Echo
description: In-DOM prompt compiler for large language models
colors:
  primary: "#131e33"
  primary-hover: "#0b1324"
  accent-blue: "#0284c7"
  accent-blue-text: "#026aa2"
  accent-cyan: "#0ea5e9"
  accent-cyan-glow: "#38bdf8"
  neutral-bg: "#fbfcfd"
  neutral-surface: "#ffffff"
  neutral-subtle: "#f4f6f9"
  ink-primary: "#0b1324"
  ink-navy: "#131e33"
  ink-muted: "#52617a"
  ink-faint: "#8a99b0"
  border-light: "#e5e9f0"
  border-strong: "#0b1324"
  semantic-success: "#15803d"
  semantic-success-bg: "#dcfce7"
  semantic-success-border: "#bbf7d0"
  semantic-error: "#9f1239"
  semantic-error-bg: "#fff1f2"
  semantic-error-border: "#fecdd3"
  semantic-alert-text: "#881337"
  semantic-alert-line: "#f43f5e"
  semantic-chip-red: "#b91c1c"
  semantic-chip-red-bg: "#fee2e2"
  semantic-chip-red-dark: "#991b1b"
  semantic-chip-strike: "#dc2626"
  semantic-chip-blue-bg: "#e0f2fe"
  semantic-pulse-green: "#10b981"
  terminal-bg: "#0f172a"
  terminal-border: "#1e293b"
  terminal-scrollbar: "#334155"
  terminal-scrollbar-hover: "#475569"
  syntax-comment: "#64748b"
  syntax-deliverable: "#34d399"
  syntax-bullet: "#cbd5e1"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "clamp(2.375rem, 6.2vw, 4.75rem)"
    fontWeight: 900
    lineHeight: 1.04
    letterSpacing: "-0.05em"
  headline:
    fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 2.25rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.35
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "-0.01em"
  caption:
    fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.08em"
  micro:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0.04em"
  chip:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.02em"
rounded:
  none: "0px"
  micro: "2px"
  xs: "3px"
  sm: "4px"
  md: "6px"
  base: "8px"
  card: "10px"
  lg: "12px"
  xl: "20px"
  full: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  xxl: "64px"
components:
  link-action:
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.none}"
    padding: "0px 0px 3px 0px"
  btn-preset:
    backgroundColor: "{colors.neutral-subtle}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
  card-surface:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.lg}"
    padding: "32px"
---

# Design System: Echo

## Overview

**Creative North Star: "The Acoustic Spec Sheet"**

Echo treats prompt engineering not as casual conversation, but as precise compilation. The visual language brings the rigor of Swiss editorial design into harmony with dynamic kinetic resonance: a gallery-grade light canvas contrasted against deep marine navy and sharp geometric architectural slabs.

The aesthetic rejects generic dark SaaS boilerplate, muddy drop shadows, neon pills, and centered blog templates. In their place is asymmetric typography, staggered content alignments, razor-thin technical divider rules, and an interactive 3-slab monogram centerpiece that physically responds to cursor velocity and perspective tilt.

**Key Characteristics:**
- High-contrast gallery canvas (`#fbfcfd` / `#ffffff`) paired with authoritative deep marine navy (`#131e33`).
- Understated editorial typography: oversized tight-leaded display headlines balanced by monospace technical specs (`JetBrains Mono`).
- Minimalist text anchor actions rather than clunky, colored pill buttons in navigation and headers.
- Kinetic responsiveness: harmonic acoustic soundwave canvas, 3D perspective parallax, and live terminal compilation scanlines.

## Colors

A crisp, high-contrast palette anchored in maritime navy and pure gallery whites, with electric cyan reserved strictly for kinetic focus.

### Primary
- **Marine Navy** (`#131e33`): Foundational brand color representing structure, authority, and architectural mass. Used for the kinetic monogram sculpture, dominant headlines, and strong borders.
- **Deep Obsidian** (`#0b1324`): Primary text ink and dark syntax terminal background.

### Secondary
- **Electric Blue** (`#0284c7`): Technical accents, focus states, active kickers, and compilation action links.
- **Resonance Cyan** (`#0ea5e9`): Ambient laser scanline sweep, hover shimmers, and scroll progress indicators.

### Neutral
- **Gallery White** (`#ffffff`): Pure surface background for cards, workbenches, and high-readability zones.
- **Canvas Paper** (`#fbfcfd`): Overall page background, establishing crisp editorial contrast.
- **Cool Mist** (`#f4f6f9`): Subtle secondary background for table headers, inactive tabs, and chip presets.
- **Muted Slate** (`#52617a`): Secondary body text, captions, and de-emphasized metadata.
- **Faint Border** (`#e5e9f0`): 1px structural dividing lines across panels and tables.

### Semantic & Browser Surfaces
- **Airtight Success** (`#15803d` text, `#dcfce7` surface, `#bbf7d0` border): Clarity 100/100 state, verified contract chips.
- **Distraction Flag** (`#9f1239` text, `#fff1f2` surface, `#fecdd3` border): Real-time prompt diagnostics and filler alerts.
- **Accessible Accent Text** (`#026aa2`): High-contrast WCAG AA (4.8:1) compliant blue text for sub-18px inline labels on white canvas.
- **Terminal Syntax Ramp**: Slate comments (`#64748b`), Resonance Cyan headings (`#38bdf8`), Emerald deliverables (`#34d399`), and Muted Slate bullets (`#cbd5e1`).
- **Themed Browser Surfaces**: Selection highlight (`#0284c7` / `#ffffff`), Code selection (`#0ea5e9` / `#0b1324`), Caret (`#0284c7`), and custom thin scrollbars.

### Named Rules
**The 5% Cyan Rule.** Resonance Cyan and Electric Blue are precision instruments, not wallpaper. They occupy less than 5% of any given viewport surface to ensure compilation signals retain high attention priority.

**The Contrast Floor Rule.** All text elements strictly enforce WCAG AA minimum contrast floors: >= 4.5:1 for body and small bold text, and >= 3:1 for large display elements. Small blue text on white surfaces uses `#026aa2` (4.8:1) rather than raw accent `#0284c7` (3.7:1).

## Typography

**Display & Body Font:** Plus Jakarta Sans (with -apple-system, BlinkMacSystemFont, sans-serif)  
**Label & Code Font:** JetBrains Mono (with ui-monospace, monospace)  

**Character:** Technical elegance paired with Swiss editorial restraint. Plus Jakarta Sans provides crisp geometric sans-serif curves with tight negative letter-spacing, while JetBrains Mono provides unambiguous typographic clarity for code contracts and diagnostics.

### Hierarchy
- **Display** (Weight 900, `clamp(2.75rem, 6vw, 4.75rem)`, line-height 1.02, tracking -0.05em): Hero headline; commands immediate intellectual focus.
- **Headline** (Weight 800, 36px / 2.25rem, line-height 1.15, tracking -0.03em): Feature section headlines and laboratory title.
- **Title** (Weight 800, 20px / 1.25rem, line-height 1.35, tracking -0.02em): Card headings, installation steps, and statement quotes.
- **Body** (Weight 400/500, 16px / 1rem, line-height 1.6, tracking -0.01em): Descriptive paragraphs, limited to optimal reading widths (max-width ~620px).
- **Label** (Weight 700, 12px–13px, tracking 0.08em, uppercase): Section kickers, step counters (`01 / DECONSTRUCT`), and terminal metadata.

### Named Rules
**The Strict Kicker Rule.** Section kickers are always set in uppercase JetBrains Mono with 0.08em letter-spacing and primary/accent coloration. They announce technical taxonomy before human prose.

## Layout

An asymmetric spatial model built on a max-width container of 1300px with generous vertical rhythm (90px–120px between sections).

- **Asymmetry over Centering**: Hero pairs left-aligned oversized typography with the right-aligned kinetic sculpture. Feature 01 aligns text left / visual right, while Feature 02 reverses the order (visual left / text right).
- **Indented Philosophy Slabs**: Key axioms and quotes indent to the right with vertical marine navy accent rules.
- **Workbench Split Screen**: The laboratory workbench splits evenly 50/50 between raw human input (light background `#fafcff`) and compiled contract output (dark syntax terminal `#0f172a`).

## Elevation & Depth

Echo avoids muddy drop shadows in favor of crisp tonal layering and sharp 1px borders.

Depth is achieved through high-contrast figure-ground relationships:
- **Surface Elevation**: Light panels rest directly on the `#fbfcfd` canvas bordered by `#e5e9f0` and an ultra-soft ambient bloom (`0 10px 30px rgba(0, 0, 0, 0.03)`).
- **Sculpture Elevation**: The dark marine monogram card uses deep volumetric shadow (`0 24px 60px rgba(19, 30, 51, 0.25)`) to project forward into the 3D space.

### Named Rules
**The Tonal Layering Rule.** Surfaces are separated by value contrast and 1px hairline rules, never by heavy black drop shadows.

## Shapes

The form language is strictly geometric, governed by the unrounded rectilinear slabs of the brand monogram:

- **Monogram Slabs**: 0px border-radius, pure sharp 90-degree right angles with stepped notched offsets.
- **Interactive Action Links**: 0px border-radius with a 2px horizontal underline that translates on hover.
- **Cards & Slabs**: Moderate 8px to 12px radius, framing technical content cleanly without looking toy-like.
- **Sculpture Centerpiece**: 20px radius enclosing concentric acoustic contour rings.

## Components

### Buttons & Action Links
- **Action Links (`.text-action-link`)**: Understated editorial text with a 2px marine navy underline. On hover, shifts color to Electric Blue and translates +4px along the X-axis.
- **Preset Chips (`.preset-btn`)**: Subtle 4px radius buttons with light borders (`#e5e9f0`). On hover, inverts to deep navy background with white text.

### Interactive Monogram Sculpture (`#monogram-sculpture`)
- **Composition**: Exact 3-piece geometry: stepped top slab, floating middle rectangle, and mirror stepped bottom slab with zero connecting spine.
- **Interaction**: Mouse movement applies perspective 3D tilt (`rotateX`, `rotateY`) and opposing horizontal slab translation. Clicks emit expanding acoustic shockwave rings across the canvas.

### Laboratory Terminal (`.lab-text-output`)
- **Terminal Styling**: Background `#0f172a` with `#1e293b` border and 12.5px JetBrains Mono typography.
- **Compilation Laser**: Glowing cyan scanline sweeps vertically down the terminal during compilation (`@keyframes scanlineSweep`).
- **Streaming Reveal**: Progressive line-by-line contract streaming.

### Clarity Score Chips (`.score-chip`)
- **Messy State**: `#fee2e2` background with `#b91c1c` text.
- **Airtight State**: `#dcfce7` background with `#15803d` text. Features smooth animated counter tick and green celebration pulse ping (`@keyframes scorePing`) on reaching 100/100.

### Attention Diff Chips (`.diff-chip-removed`)
- **Attention Filter**: Red light background `#fee2e2` with dynamic animated strike-through line sweeping left-to-right when scrolled into view.

## Do's and Don'ts

### Do:
- **Do** maintain a clean, crisp gallery white canvas (`#fbfcfd` / `#ffffff`) contrasted against deep marine navy (`#131e33`).
- **Do** use editorial text hyperlinks (`Download Extension ↓`, `GitHub ↗`) with subtle underline interactions for navigation.
- **Do** preserve the exact 3-piece geometry of the stepped "E" monogram with sharp 90-degree right angles.
- **Do** pair Plus Jakarta Sans for editorial narrative with JetBrains Mono for technical specifications.
- **Do** ensure prompt compilation happens in-DOM and in-browser with zero external latency or telemetry.

### Don't:
- **Don't** add generic SaaS boilerplate tropes: muddy glowing drop shadows, rounded neon pill buttons, or dark-mode templates.
- **Don't** connect the three slabs of the "E" monogram with a vertical spine; they must remain independent stepped geometric elements.
- **Don't** use centered generic blog layouts; maintain asymmetric left/right staggered diagonal rhythm.
- **Don't** reintroduce verbose marketing pill tags ("Acoustic prompt compilation for large language models").
