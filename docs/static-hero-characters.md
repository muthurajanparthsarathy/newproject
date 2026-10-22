# Static hero characters — 17 October 2026

## 22 October: social and marketing appearance restored

The current scene registration had restored procedural people for social,
marketing and development. All seven visible characters now use the detailed
image rigs again. Social reconnects `surya-phone` and its live screen to the
visible grip; the old separate phone stays hidden.

Marketing and development use `public/hero/characters/muthurajan-working.png`
and `muthurajan-working-back.png`. Built-in imagegen prompt: preserve Muthurajan's
identity, glasses, hair, blue shirt, beige trousers and shoes; seated working
pose with a slight forward lean, both forearms extended at desk height, one hand
typing and the other cupped over a mouse; matching front/rear three-quarter views;
person only on transparent alpha, no furniture or props. Source:
`public/hero/characters/muthurajan-seated.png`.

Scene 05 hand correction: removed palm-to-anchor deformation that stretched
forearms and pinched wrists during camera travel. The artwork keeps its natural
projected arm shape; depth is fitted along camera rays above the desktop.
Mouse, mouse pad and keyboard align below the hands after choreography.
The keyboard is narrower to leave space for the mouse hand. Breathing, head
motion, campaign screens, publish sequence and analytics remain active.
These are 2.5D illustrated characters, not fully rigged 3D humans.

Desktop checks cover story 43, 44.7, 51, 53, 56 and 59. Preview artifacts are
`.codex-preview/workstations-*.png`. A corrupt generated
`.next/dev/types/validator.ts` was removed after regeneration left it stale;
the production build then passed. No application route files were changed.

## Latest update: image-based character movement

The user subsequently requested movement and corrected the floating phone.
`characterPortrait.ts` now uses a subdivided image mesh with weighted breathing,
head tilts and wrist movement. Feet and workstation positions stay fixed. This is
subtle 2.5D image animation, not a full 3D skeletal performance. The front/rear
orientation fix remains active for each camera, including the footage camera.

The social character uses new `surya-phone.png` and `surya-phone-back.png` cutouts
in `public/hero/characters/`. The phone is visibly gripped in the source artwork.
The live social UI is mapped into the phone display and receives exactly the same
deformation as the hand. The old separate 3D phone is hidden; its content-transfer
anchor now follows the visible phone. Mirroring preserves readable screen text.

Generated with built-in imagegen from the existing seated Surya front/rear images.
Prompt: preserve identity, clothing, seated posture and full-body source style;
change arms to hold a black smartphone securely at chest height on image-right,
fingers wrapped around its edges, other index finger poised to tap. Front view has
a plain pale-blue display toward the viewer; rear view preserves the same grip
from behind. Person and held phone only, transparent background, no furniture,
floor, glow or separate props.

Validation: TypeScript and targeted lint passed. Browser checked story 43, 44.7,
46, 23 and 11 plus mobile: no page errors or horizontal overflow. Comparing two
frames confirmed vertex movement and a moving phone anchor, with the old phone
hidden and live display visible. Screenshots: `.codex-preview/motion-*.png`.

## Earlier static implementation (superseded by the movement update above)

The hero now displays still images of the same Surya and Muthurajan characters used
in “One team · Shoot to SEO”, replacing all seven visible procedural people.
The original One Team section and its source images are unchanged.

`characterPortrait.ts` renders transparent, depth-tested sprites at fixed workstation
positions. Their bodies never animate. Each character keeps the original rig's
workstation-facing yaw. Per render pass, the sprite selects a front or rear cutout
and mirrors it according to the direction of the workstation on screen. This fixes
the earlier front-only billboarding that made people look away from their desks.
The main camera and footage camera independently see the correct side.
The old rigs are invisible anchors only: their calculations still drive equipment,
the bottle, phone, mouse and stylus. Screens, scroll timing and camera paths remain intact.
Portrait load failure uses the existing hero error boundary / 2D fallback.

Assets live in `public/hero/characters/`. They were made with the built-in imagegen
tool from these existing images (not new character identities):

- `surya-standing.png` from `public/one-team/upload-surya.png`
- `surya-seated.png` from `public/one-team/edit-surya-v2.png`
- `muthurajan-seated.png` from `public/one-team/website-muthurajan.png`

Each has a matching `-back.png`, made with built-in imagegen from its front cutout.
Rear-view prompt: preserve exactly the same identity, clothing, full-body scale
and standing/seated pose; show a rear three-quarter view facing away toward upper
right, back of head and shirt, at most a tiny cheek profile. Transparent background,
person only, no chair, desk, headphones, equipment, floor, shadows or glow.

Prompt set: Extract only the named person on true transparent alpha. Preserve the
exact face, hair, beard/glasses, blue shirt, beige trousers, white shoes and detailed
illustrated source style. Remove background, glow, shadows, furniture, equipment,
screens and other objects. Keep the full body with small padding and no text.
Standing Surya: remove the phone and rest arms at his sides, three-quarter view.
Seated Surya and Muthurajan: preserve seated posture, complete obscured body parts,
remove headphones, rest hands on lap, three-quarter front/side view.

The presenter/social roles reuse Surya; design/marketing/developer reuse Muthurajan.
These are still illustrations matching the chosen section, not photographic people
or rotating 3D character models. Earlier proxy appearance notes in the studio guide
describe the hidden rigs, not the visible hero.

Validation: `npx tsc --noEmit`, ESLint on the three changed TypeScript files, and
`npm run build` passed. Headless Edge previews covered the intro and story positions
11, 22, 32, 43 and 54 plus a 390px mobile viewport, with no page errors or mobile
horizontal overflow. Preview images are in `.codex-preview/characters-*.png`.

Orientation correction: production build passed; browser snapshots at story 11,
23, 33, 43 and 54 confirmed the matching front/rear views, including the editor
facing his monitors. No page errors or mobile overflow. Corrected previews are
saved as `.codex-preview/orientation-*.png`.

## 22 October: held accessories in scenes 01, 02 and 03

- Presenter: `surya-bottle.png` and `surya-bottle-back.png`.
  The visible bottle and enclosing fingers share one arm transform. The hidden
  procedural bottle no longer renders in the studio or the filmed feed.
- Editor: `surya-headset.png` and `surya-headset-back.png`.
  Headphones are fitted to the ears in each view and move with the head artwork.
  The separately oriented procedural headset is hidden.
- Designer: `muthurajan-drawing.png` and `muthurajan-drawing-back.png`.
  The stylus is visibly gripped in the artwork; its independent procedural copy
  is hidden. Drawing motion follows the design timeline with small live strokes.
  The flat pen display is placed below the nib, the keyboard below the free hand,
  and the unused tablet stand is hidden. Depth keeps the pen above the poster.

Assets were created with the built-in image generation tool. Files are in
`public/hero/characters/`; existing source assets were preserved.

Prompt set (front and rear variants separately):
1. Edit the seated Surya source, preserving identity, clothing, composition,
   scale and facing direction. Add fitted matte black over-ear headphones,
   cups centered on ears and headband following the crown in the same perspective.
2. Edit the working Muthurajan source, preserving identity, full-body pose,
   scale and facing direction. Replace the mouse hand with a natural stylus
   grip between thumb and index supported by the middle finger, nib visible
   down-right. Preserve the extended forearms and relaxed other hand.
3. Edit seated Surya, preserving identity, clothing, framing and direction.
   Bend one arm to hold an upright cobalt blue reusable bottle at chest height,
   gray cap and plain white label band. Show fingers and thumb wrapping firmly
   around the bottle; other hand on lap. Character and held bottle only.
All six variants request transparent alpha, no glow, floor, furniture or shadow.

 
## Scene 06 implementation and inspection

Inspection found the prior story stopped at 60 (end of Scene 05). The developer
desk existed only as a handoff, with static screens and the marketing overlay.
Scene 06 now runs from 60 to 70 with four beats, its own text, camera approach,
code build-up, mobile layout review and a final contact link. Incoming marketing
notifications fade after arrival. Visible developer fingers have subtle typing
motion; the mouse and keyboard remain aligned through the camera sequence.
No later numbered scene currently exists in the timeline.

Verified desktop positions 60.5, 63, 66 and 69.8 and mobile Scene 06 at 390x844.
Screenshots: .codex-preview/developer-after-*.png and developer-mobile.png.
Build, TypeScript and targeted ESLint passed; no browser errors or horizontal
overflow in the preview checks.

 
## Scene 07 SEO and full-team ending

Added a dedicated SEO workstation at ring angle 0.28, reusing the detailed
working-character artwork and its hand/device alignment. The wall extends to
cover the new desk. Scene 07 runs from 70 to 80: page checks complete, a labelled
search preview is shown, and explicitly illustrative reporting animates.
No ranking or client-result claim is made by the example dashboard.

The ending runs from 80 to 86 and pulls back to the entire studio. The
“One team · Shoot to SEO” overlay includes contact and portfolio links.
Fog distance adapts during this overview so the farther mobile camera still
shows the team. Removed the earlier Scene 06 contact button in favour of this
final invitation.

Checked SEO at story 71, 74, 77.5 and 80, and the ending at 83 and 85.8.
Desktop/mobile previews have no browser errors or horizontal overflow.
The mobile final contact button successfully navigates to /contact.
Production build, TypeScript and targeted ESLint passed.
Preview scripts: check-seo.cjs, check-seo-mobile.cjs, check-finale-link.cjs.
