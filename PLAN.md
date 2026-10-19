# PLAN 14th October 2026 (rewritten 18 October 2026)

Branch: `madebyjoe-2.0`. One page that promotes the 5 entities.

## Our Content
joe.graphics:https://joe.graphics
fromtheroot.studio:https://fromtheroot.studio
syntheticlabs.xyz:https://syntheticlabs.xyz
cerebral.studio:https://cerebral.studio
automatedigital.ai:https://automatedigital.ai

## Direction change (17 Oct 2026)
The cipher.tv 3D ring was scrapped. The ring prototype is kept for reference in `archive/ring_prototype.html`.
New reference = trends from Awwwards Sites of the Day, Sep–Oct 2026.

## Awwwards research (12 Sites of the Day, 19 Sep – 16 Oct 2026)
| Site | Date | What it shows |
|---|---|---|
| huyml.co | 14 Oct | Giant name type, `01 / 19` project index, red #FF4949 on #181818 |
| heronaiapp.com | 12 Oct | Preloader, storytelling scroll, orange #F15534 on #282828 |
| nickho-motorsports.nl | 11 Oct | Scroll-driven 3D, GSAP |
| mariavasilyeva.com | 9 Oct | Preloader, hover effects, annotations |
| odysseeclinic.com.au | 8 Oct | Minimal, 2 colours, transitions |
| twks.ch | 7 Oct | Mono, loader, accordion, 404 |
| jesperlandberg.com | 29 Sep | Infinite scroll, WebGL, black/white |
| meermohsin.me | 26 Sep | Cinematic hero scroll + footer |
| gilhuybrecht.com | 21 Sep | Info-dense header columns (availability, services, recognition), image grid |
| boc.studio | 19 Sep | Marquee band with logo + meta, orange #FF4421 on #0D0E0E |
| lxlcreative.co.uk | 17 Sep | Orange #FF5121 on #27201D, transitions |
| offforum.com | 16 Oct | Video hero, clean gallery |

Trends we use:
1. **Two-colour palette, signal orange on near-black** (4 of 12). Our old orange `#f74f14` fits, so we keep it.
2. **Oversized type**: full-width wordmark, big section titles, giant footer mark.
3. **Small mono meta labels**: `(01)`, `01 / 05`, local clock, info columns in the header.
4. **Video inside type**: a video pill inside the hero wordmark.
5. **Index list + cursor-follow hover preview**.
6. **Sticky stacked panels**: each entity is a full-screen chapter that slides over the last one.
7. **Marquee band**, **word-by-word scroll reveal**, **custom cursor with labels**, **magnetic buttons**, **preloader with %**, **Lenis smooth scroll**.

## Built (18 Oct 2026)
- `index.html`: one page: preloader → hero → index list → marquee → 5 chapters → How it fits → Selected brands → About → Contact → footer.
- `css/main.css`: tokens, layout, responsive (stack below 1000 px), reduced motion.
- `js/main.js`: Lenis, GSAP ScrollTrigger + SplitText, loader tied to real loading, hover preview, pill cycler, sticky stack, lazy video (plays only while visible), copy-email toast, London clock.
- `js/hero-gl.js`: raw WebGL. The hero background plays the same video as the hero pill as a one-colour 4 px Bayer dither, dimmed behind the heading, and cross-fades when the pill changes. Near the mouse the cells get finer and turn signal orange. Pauses off-screen.
- Motion language: text types in (chars fade up from a soft blur), elements focus in (blur 10px to 0), media and the preloader dissolve with the same Bayer dither.
- `js/vendor/`: GSAP 3.13 (+ ScrollTrigger, SplitText), Lenis 1.3.4. No CDN.
- `fonts/`: Inter Tight (variable), Instrument Serif (+ italic), Geist Mono. Self-hosted, latin only.
- `media/v2/`: 5 videos + posters, 4.8 MB total, lazy-loaded. Source: each entity's own site media (no screen recordings, no site UI).
- Old site moved to `archive/index_v1.html`.

Each entity chapter uses its own brand colours:
| Site | Role | Background | Accent | Main media |
|---|---|---|---|---|
| From the Root Studio | Studio (design & 3D) | #0b0b0b | #9db4ff | Netflix anamorphic billboard |
| Synthetic Labs | Lab | #f0efeb (light) | #1f4fd1 | Generative coral study |
| Cerebral | Hosting | #0f1309 | #c6f135 | Brand film |
| Automate Digital | Agency | #141933 | #ff6a2b | 3D workflow pipes + stats |
| joe.graphics | Personal design work | #05070c | #7fd6ff | The J logo film (from joe.graphics) |

Run: `python3 -m http.server 5173`, open `localhost:5173`.

## TASKS

### Must do before launch
- [ ] Joe checks all copy (About text, Cerebral text, brand list, each quote)
- [ ] New OG image (`img/OG.jpg`) from the new hero
- [ ] `.htaccess`: long cache for `.mp4`, `.jpg`, `.woff2`, `.js`, `.css` (CSS/JS use `?v=` strings)
- [ ] Test on real iOS Safari and Android Chrome (autoplay, sticky, `svh`)
- [ ] Lighthouse: 90+ performance on mobile

### Nice to have
- [ ] Cerebral: cleaner footage without site UI text, when available
- [ ] Per-entity favicon/logo marks in the index rows
- [ ] Sound toggle for the films
- [ ] Update README for 2.0
- [ ] Open PR `madebyjoe-2.0` → `main`; merge deploys via cPanel

## Copy rules (18 Oct 2026)
- Never say "entities" on the site. Just list the five by name.
- Chapters stay lean: name, one quote, 3 tags (or stats), one button, one video.
- No em-dashes anywhere.
