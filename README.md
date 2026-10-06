# Kanishk's Portfolio

Static HTML, CSS, and JavaScript. Open `index.html` directly, or serve this directory with any static web host. The existing GitHub Pages configuration serves `main` from the repository root.

The home page opens with a personal Three.js studio featuring Kanishk's portrait and actual app screens. Scrolling reveals selected projects and shorter background chapters. `work.html` contains the full project collection with persistent category filters; `journey.html` contains the complete background. Light/dark themes, reading progress, section navigation, and a keyboard-accessible screenshot viewer are included. All project content and image links remain available without JavaScript, and motion respects reduced-motion preferences. See `DESIGN-NOTES.md` for the design research.

## Updating content

Edit `content.json`, then run:

```sh
node build.mjs
```

The content build uses Node's standard library and writes the home, Work, Journey, contact, and individual project pages. The published site needs no server, CDN, external font, or runtime package install. The prebuilt studio script and its embedded image textures work when opening the HTML locally.

To rebuild the Three.js scene after editing `studio-scene.mjs` or its image assets:

```sh
npm ci
npm run build
```

This uses the pinned Three.js and esbuild development dependencies. Scene controls support mouse and keyboard rotation, project clicks, and pause/play. A static portrait is shown when WebGL is unavailable.

Each project has `contribution`, `challenge`, `learning`, `results`, and `links` fields. Fill those in using your own words. Empty fields are omitted from the public page. `source` records where existing text and evidence came from; it is maintenance metadata and is not displayed.

Run `node build.mjs --check-content` to audit the four required narrative fields. This check intentionally fails while personal details are missing; it does not change the site. It checks completeness, not the truth of the claims.

The Investo and Prepxa repositories linked on the site contain their websites, not the iOS application source. No adoption figures or individual responsibilities were inferred from repository ownership. Existing portfolio prose was preserved. The Chord Clash and TalentIQ product descriptions come from their READMEs; Kanishk confirmed TalentIQ was a team project with J.B. Hunt. Prepxa and Investo text comes from their existing sites.

The contact page retains the existing Formspree endpoint. A browser without JavaScript uses the standard form submission. Email and telephone links use the contact details in `content.json`. Updating the email in that file does not change the Formspree account's recipient; verify its inbox configuration and receipt with a real message before submitting. Automated checks use mocked responses and do not contact you.

Current profile corrections come from Kanishk directly. Additional concise project, award, credential, and volunteering facts were checked against his public LinkedIn profile. Investo's sole technical developer role is explicitly stated there, not inferred from GitHub ownership. Individual project reflections remain blank where they have not been supplied.

## Before Submitting

See the accompanying submission checklist for the personal details still needed. A working website alone does not complete the Academy's requested project narratives.

## Assets

- `Profilepic.png`: existing portfolio portrait.
- Prepxa images: original screenshots from `Kanishksasi/Prepxa`.
- Investo images: public App Store screenshots for app `6761702116`.
- TalentIQ and Chord Clash images: screenshots of the linked public demos.
- Local icon definitions: Lucide, ISC license; see `assets/LUCIDE-LICENSE`.
- Three.js: MIT license; see `assets/THREE-LICENSE`.
