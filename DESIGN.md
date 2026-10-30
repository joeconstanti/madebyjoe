---
name: madebyjoe
description: Technical, experimental portfolio system for Joe's design and technology work.
colors:
  ink: "#0e0d0c"
  paper: "#ecebe6"
  signal: "#f74f14"
  muted-paper: "rgba(236, 235, 230, 0.65)"
  fine-line: "rgba(236, 235, 230, 0.14)"
typography:
  display:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "clamp(44px, 7vw, 128px)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.055em"
  body:
    fontFamily: "Inter Tight, system-ui, sans-serif"
    fontSize: "clamp(14px, 1vw, 16px)"
    fontWeight: 400
    lineHeight: 1.45
  editorial:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(22px, 2.1vw, 36px)"
    fontWeight: 400
    lineHeight: 1.05
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0.04em"
spacing:
  page-gutter: "clamp(16px, 1.8vw, 28px)"
  grid-gap: "clamp(12px, 1.2vw, 20px)"
rounded:
  pill: "999px"
  media: "6px"
---

# Design System: madebyjoe

## Overview

**Creative North Star: "The Moving Image Atelier."**

The existing portfolio pairs large type and moving project imagery with a technical, experimental sensibility. A dark ground and warm paper text let the work carry attention; vivid signal orange marks selected emphasis and active interactions. This documents the incumbent system rather than setting a new visual direction.

Typography combines a tightly tracked sans-serif for display and interface text, an italic serif for editorial contrast, and a monospaced face for labels and metadata. Motion is used for transitions and previews, while the page remains arranged on a consistent grid.

**Key Characteristics:**
- Dark ink ground with warm paper text and vivid signal orange accents
- Oversized, compact sans-serif display type
- Video and project imagery as primary visual material
- Monospaced labels and metadata
- Responsive 12-column composition with purposeful motion

## Colors

The palette is mostly warm near-black and off-white, with one vivid orange accent. Values below match the source variables in `css/main.css`.

### Primary
- **Vivid Signal Orange** (`#f74f14`): Emphasis, interactive highlights, and selected graphic bands.

### Neutral
- **Ink** (`#0e0d0c`): Main page and loader background.
- **Paper** (`#ecebe6`): Main text on dark surfaces.
- **Muted Paper** (`rgba(236, 235, 230, 0.65)`): Supporting text.
- **Fine Line** (`rgba(236, 235, 230, 0.14)`): Dividers and subtle outlines.

### Named Rules
**The Signal Rule.** Use orange for emphasis and interaction within the existing warm neutral palette; do not turn it into a broad multicolor scheme.

## Typography

**Display Font:** Inter Tight (with system sans-serif fallback)  
**Body Font:** Inter Tight (with system sans-serif fallback)  
**Editorial Font:** Instrument Serif (with Georgia fallback)  
**Label/Mono Font:** Geist Mono (with ui-monospace fallback)

**Character:** Condensed spacing and large scale give the display type a compact, assertive presence. Instrument Serif adds a contrasting editorial note, while Geist Mono keeps small labels technical and legible. The overall voice is technical and experimental.

### Hierarchy
- **Display** (400, `clamp(44px, 7vw, 128px)`, line-height `.95`): Main hero statement.
- **Section heading** (500, `clamp(44px, 7vw, 120px)`, line-height `.86`): Major portfolio section titles.
- **Project name** (500, `clamp(52px, 7.4vw, 136px)`, line-height `.84`): Project chapter titles.
- **Body** (400, `clamp(14px, 1vw, 16px)`, line-height `1.45`): Reading copy and supporting information.
- **Editorial accent** (Instrument Serif italic, `clamp(22px, 2.1vw, 36px)`, line-height `1.05`): Short quotations and emphasis.
- **Label** (Geist Mono, 11px, uppercase, `.04em` tracking): Navigation, captions, and metadata.

## Layout

The main composition uses a 12-column grid with a responsive gutter of `clamp(16px, 1.8vw, 28px)` and column gap of `clamp(12px, 1.2vw, 20px)`. Large viewport project chapters can occupy the full viewport and stack; text and media share the grid. The hero fills at least the small viewport height. At narrower widths, columns and spacing adapt to preserve readable copy and prominent media. Section spacing is fluid and generous, with thin rules organizing lists and chapter metadata.

## Elevation & Depth

Depth comes from a mix of media, motion, and overlays. Full-bleed video and image cropping carry most of the visual weight, while transitions, overlapping fixed navigation, and translucent hero treatments add layers. There is no general shadow system.

## Shapes

The system is predominantly square-edged and open, with thin rules instead of enclosing cards. Pill controls and tags use fully rounded ends; video frames have a subtle 6px radius. Preserve these distinct uses rather than rounding every region.

## Components

### Navigation and labels
- **Character:** Compact technical metadata over the work.
- **Typography:** Uppercase Geist Mono with `.04em` tracking.
- **Behavior:** Header remains fixed; interactive underlines reveal through a horizontal scale transition.

### Project rows
- **Character:** Open editorial index with a strong typographic name.
- **Shape:** Full-width rows divided by fine rules.
- **Interaction:** Orange background expands on hover, with text and arrow responding to pointer movement.

### Project chapters
- **Character:** Large media-led showcases.
- **Layout:** Text and tags sit beside a large video frame on wide screens; adapt at smaller sizes.
- **Actions:** Pill-shaped links use the current foreground/background colors and reveal the signal accent on hover.

### Buttons and tags
- **Character:** Tactile and expressive, with interaction conveyed through motion, shape, and the signal accent.
- **Shape:** Pill buttons and tags (`999px`).
- **States:** Preserve clear focus outlines and the existing hover transitions.

## Do's and Don'ts

- Keep video and project imagery central to the portfolio's identity.
- Keep type hierarchy, warm neutral palette, and signal orange aligned with the source CSS.
- Preserve the 12-column grid logic and fluid spacing when changing layout.
- Retain visible keyboard focus treatment and reduced-motion behavior already present in the implementation.
- Do not introduce unsupported visual tokens, brand claims, or project content while documenting or refining this system.
