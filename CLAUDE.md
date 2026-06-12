# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Single-page personal portfolio for "Ayato — Security Researcher" (content in Brazilian Portuguese). Pure static site: vanilla HTML, CSS, and JS with **no build step, no package manager, no dependencies, no tests**. Only Google Fonts are loaded from the network.

## Running / previewing

There is nothing to build. Open `index.html` directly, or serve the folder so relative asset paths and the audio element behave:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Files

- `index.html` — all markup, single page, anchor-linked sections (`#home`, `#about`, `#skills`, `#projects`, `#contact`). Inline `<script type="application/ld+json">` holds Person schema; `<head>` carries the SEO/OG/Twitter meta.
- `styles.css` — all styling. Top `:root` block is the design-token system (see below); everything downstream references those vars.
- `script.js` — all behavior, split into IIFEs (one per concern). No framework.
- `images/image1–5.jpg` (+ `.webp` siblings) — `image1` hero bg, `image2` avatar/logo, `image3` skills bg, `image4` contact banner, `image5` favicon. `image3/4/5` are otherwise spare. Each content `<img>` is wrapped in `<picture>` serving WebP with a JPG fallback; `picture{display:contents}` keeps the wrapper layout-transparent so existing `.hero-bg img` / `.banner img` selectors still match. `images/og.jpg` is a 1200×630 social-share card. Regenerate WebP/og with ImageMagick (`magick`) if source JPGs change.
- `music.mp3` — ambient track for the autoplay-with-fade feature.

## Architecture notes

**Design tokens drive everything.** Colors, fonts, easing curves (`--spring`, `--out`), and the fluid gutter (`--gut`) live in `:root` in `styles.css`. The palette is a deliberate "ink + porcelain + cobalt" theme tied to a character/blue-rose motif (vines, petals, hand-drawn SVG rose separators). When changing visuals, edit tokens first rather than hardcoding values, and keep the blue-rose / halo aesthetic consistent.

**`script.js` is N independent IIFEs**, each self-contained — no shared globals, no exports. Concerns: custom cursor + hero parallax (pointer-only, gated by `isTouch`), nav scroll state + mobile drawer, IntersectionObserver reveal animations (`.rv*` classes add `.in` when in view), smooth-scroll for `#` links, scrollspy (`.nav-links a` get `.active`/`aria-current`), and ambient music. Add new behavior as a new IIFE in the same style.

**Touch vs pointer.** `isTouch` is computed once and adds `body.touch`; cursor and parallax are disabled on touch. Respect this gate for any pointer-driven effect.

**Reveal animations** depend on elements carrying `.rv`, `.rv-l`, `.rv-r`, or being `#rose` / `.vine-sec`. New animated-in content must use those classes to be observed.

**Ambient music** (`script.js` bottom IIFE): fades 0→0.45 over 3s, plays ~35s, fades out and stops. Autoplay is unlocked on first user gesture (`pointerdown`/`keydown`/`touchstart`/`scroll`); a discreet toggle persists an off-state in `localStorage` under key `bgm`.

**Accessibility / motion.** `prefers-reduced-motion` is honored in CSS. Keep `aria-label`/`aria-current`/`aria-pressed` and the skip link intact when editing nav, the music toggle, or decorative SVGs (`aria-hidden`).

## Conventions

- Brazilian Portuguese for all user-facing copy.
- Vanilla only — do not introduce a framework, bundler, or npm dependency.
- Canonical / OG / Twitter / JSON-LD URLs point at the GitHub Pages deploy `https://ayatotenshipj-boop.github.io/portfolio/`. Update these together if the deploy target changes.
- `--fg-faint` must stay ≥4.5:1 against `--ink` (it carries real text: footer, `.smeta`, `.rose-cap`). Don't darken it back toward the old `#475069` (failed WCAG AA at 2.5:1).
