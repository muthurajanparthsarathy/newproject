# 3D studio hero — Scenes 1–5 (shoot → edit → design → social media → digital marketing)

The home page hero (`components/studio3d/StudioHero.tsx`) is a pinned, scroll-driven 3D studio built with
Three.js + React Three Fiber. One continuous camera travels from the video shoot to the editing desk
(F01–F14, global story 8–29%), the graphic-design workstation (Scene 3, 29–40%), the social media corner
(Scene 4, 40–50%) and the advertising desk (Scene 5, 50–60%), ending on the web & app desk where Scene 6
will begin. Visitors with
reduced motion, without WebGL, or whose GPU loses the context get the previous 2D hero
(`components/sections/hero.tsx`).

## Scene 3 — poster & creative design (29–40%)

**Layout.** The studio is a ring: zones sit along the curved wall (centre (3.2, 0, 6.6), radius 10) and
face it, with the camera travelling inside. The design workstation is at ring angle 2.2286 rad
(desk ≈ (10.12, 0, 1.25)), right of the edit platform by the daylight windows; the social-media corner
for Scene 4 is further round at 1.75 rad (≈ (11.27, 0, 5.14)). Helpers: `ringPoint`, `ringOut`,
`DESIGN_THETA`, `SOCIAL_THETA` in `environment.ts`. The wall was extended to wrap behind both zones.

| Beat | Story % | What happens | Camera |
| --- | --- | --- | --- |
| 3.1 | 29–31 | Shoot assets arrive in the design app ("From Shoot ✓"); designer reaches for the stylus | Pull back from the edit monitor, track right, three-quarter on his left |
| 3.2 | 31–34 | Stylus strokes on the pen display drive the poster: product placed, circle, wave, swoosh, droplets, headline typed, tagline, button | Round behind him to his right shoulder; monitor, pen display and hand in view |
| 3.3 | 34–37 | Typography resized, palette changes from draft teal to brand blue/amber, shapes snap into alignment, two alternative layouts and tool cards float beside the monitor, main layout selected | ~25° orbit and pull back |
| 3.4 | 37–40 | Finished poster rises from the monitor as a 3D card, glows, "Approved" badge; alternatives recede | Push in, hold, start turning towards the social corner |

**Same product.** `poster.ts → ProductShot` renders the actual 3D bottle (same mesh and materials as the
shoot) once into a transparent texture; every poster copy uses it, so the product identity never changes.
Backgrounds and typography are canvases redrawn from the story position (`PosterArt`), stacked with the
product as planes (`PosterView`) on the monitor, on the pen display, on the rising card and on the two
alternative layouts. The design app UI is `designUi.ts`; the stylus path (shared by the hand, the stylus
and the on-screen cursor) is `designPen.ts`; the performance is `DesignerAct` in `choreography.ts`.

**Designer identity.** The brief asks for "the male character wearing glasses at the upper-right
workstation in the original reference", but that reference image has not been supplied, and the Scene 3
storyboard image shows a woman. The written rule was followed: a male proxy with round tortoiseshell
glasses, short side-parted hair and stubble — deliberately distinct from the editor (Muthurajan's
rectangular glasses and quiff). If the reference shows Muthurajan at the design desk, swap the two
appearance blocks in `studioWorld.ts`.

**Handoff to Scene 4.** At 40% the poster is approved and the camera begins turning; the social-media
manager (female proxy, curly hair, royal-blue tee — the woman from the storyboard) is already seated at
her corner scrolling her phone (`SocialManagerAct`). Her phone and laptop show static feed/calendar
screens; Scene 4 will animate the poster into the feed.

## Scenes 4–5 — social media and digital marketing (40–60%)

**Layout.** Further round the ring: social corner at 1.75 rad (manager faces *into* the room), the
advertising desk at `MARKETING_THETA` 1.25 rad and the web & app desk at `WEB_THETA` 0.78 rad (both face the
wall, like the design desk). `zonePoint(theta, radius, facing, x, y, z)` in `environment.ts` gives a point in
a zone's own frame (x = that person's left, z = the way they face); the camera keys (`S`, `M`, `W` helpers in
`cameraPath.ts`) and all floating UI are blocked with it. The wall now runs on to 0.45 rad; the daylight
window band continues behind the social corner and a shadowless fill spot lights the new zones (the sun
cannot reach the inside of that part of the wall). A low storage unit between the social and marketing
zones is the foreground the camera skims past in the transition.

| Beat | Story % | What happens | Camera |
| --- | --- | --- | --- |
| 4.1 | 40–42 | The approved poster card (the same object from 3.4) and the finished reel (live footage, graded 9:16, edit captions) fly over her head into a floating "Final assets" preview, then dive into her phone; a notification arrives; she reviews | Pull back from the poster, follow the card round, three-quarter from her right |
| 4.2 | 42–45 | Taps select poster and reel, Next, caption types, three platform toggles, Publish → progress → "Published"; floating success badge | Medium close-up: face, phone, tapping hand |
| 4.3 | 45–48 | The post expands out of the phone into feed, reel and wide layouts; like/comment/share bubbles pop in small groups; a comment arrives and she replies; small fist pump | Pull back, gentle orbit to her front |
| 4.4 | 48–50 | Illustrative content-performance dashboard (trend draws, counters count up); she points at it | Slide right, push in |
| → | 49.3–50.9 | Campaign card leaves the dashboard, travels across the studio and is absorbed by the ads monitor | Track with the card past the storage unit |
| 5.1 | 50–52 | Ads Manager: "waiting for creative" slot → ad draft with the same poster, platforms; "Set up campaign" clicked | Swing behind her chair to a right-rear three-quarter |
| 5.2 | 52–55 | Objective, keyword typed, three audience chips, three placements, example budget drag, Launch → "Campaign launched" | Over her right shoulder (mouse hand in view), push in |
| 5.3 | 55–58 | Illustrative analytics panel rises from the monitor, blue line draws, three metric cards assemble; she points; approving nod | Arc out to her right side, slight dolly in |
| 5.4 | 58–60 | Audience map: reach rings, pins, connection arcs, segment chips; she gestures across it; three "Website visit" badges fly to the developer's site preview | Wider three-quarter, then follow the badges to the web desk |

**One source of truth for hands and screens.** `PHONE_TAPS` / `fingerAt` (`socialUi.ts`) drive both the
manager's fingertip and every tap on her phone; `ADS_CLICKS` / `cursorAt` (`marketingUi.ts`) drive the
on-screen cursor, the physical mouse on the desk and the specialist's clicking finger.

**Same campaign everywhere.** `composeFinalPoster` (`poster.ts`) flattens the approved poster once, reading the
bottle back from the same product render (tone-mapped to match), so the phone, post cards, ad preview and
website preview show exactly the 3D poster. The reel cards use the live footage feed (rendered only while a
reel is on screen).

**Honest numbers.** Every dashboard figure is labelled "Illustrative example", "Illustrative demo data",
"Example segments" or "example"; the budget slider says "Example only"; an HTML note ("Dashboard figures are
illustrative examples, not client results.") shows whenever dashboards are on screen. No growth-percentage
claims are shown.

**Characters.** Social media manager: long dark wavy hair (`curlyLong`), royal-blue tee, jeans (from the
storyboard). Marketing specialist: female, dark hair in a high ponytail (new `ponytail` hair), royal-blue tee.
Developer (Scene 6, idle typing): male, short hair, royal-blue tee. All are proxies (see below).
Scenes 1–3 now show image portraits (`characterPortrait.ts`) in place of their rigs; these three stay as
animated rigs because Scenes 4–5 depend on their hands (phone taps, mouse clicks, pointing) and on the
phone being in her hand. The original
"master" studio image was still not supplied, so identities follow the written brief and the storyboard.

**Changed for continuity.** The social station's ring light was removed (from every Scene 4 angle it sat
edge-on in front of her face); the tall plant between the design and social zones became a low bush (it
filled the 4.1 frame); the female proxy's chest spheres were softened (read badly in close-up).

**Scene 6 handoff.** At 60% the camera has followed the website visits round to the web & app desk; the
developer is typing (`DeveloperAct`), his screens are static (`webUi.ts`). Scene 6 can take over from the
last camera key in `cameraPath.ts`.

## Stage A — asset and technical audit (as found)

| Item | Status |
| --- | --- |
| Framework | Next.js 16.2.4 (App Router, Turbopack), React 19.2, TypeScript, Tailwind 4, npm |
| Animation libraries | framer-motion 12 (existing). Added: `three` 0.186, `@react-three/fiber` 9.8, `@types/three` |
| GSAP / ScrollTrigger | Not added. The site already pins sections with CSS `position: sticky` plus a scroll-progress read; the 3D hero uses the same pattern, which is deterministic and needs no extra library |
| GLB / glTF models | None in the repository |
| Rigged characters / animation clips | None |
| Blender | Not installed on this machine, so no scripted asset pipeline was run |
| Reference images | 14-frame storyboard (camera + acting). The "original studio" master image was **not** supplied; character identities were taken from `public/one-team/*.png` and `remaining-image-prompts.md` |
| Logo | `public/logo.png` (real logo, RGBA). Used on a framed sign behind the editor — not on T-shirts (the file is a lit render, not a flat mark) |

## What is real and functional

- **One connected 3D world**: shoot zone around (0, 0, 0), edit zone around (7, 0, −1), joined by a
  curved cyclorama wall, platforms with blue light strips, glass partition, plants, pendant lamps,
  daylight windows, a foreground LED stand that bridges the camera move.
- **Equipment** built as real geometry: cinema camera on a fluid-head tripod (pan/tilt, turning focus
  ring, record button, tally light, field monitor), softboxes with spotlights, stool with footrest,
  side table, unbranded blue bottle, edit desk with two monitors, keyboard, moving mouse, laptop,
  headphones, mug, office chair, phone on a stand.
- **Shared footage**: a second camera at the cinema camera's lens renders the presenter into a texture.
  The field monitor (live, REC, playback), the flying transfer cards, the editor's preview, the vertical
  reel and the desk phone all show **the same rendered footage**. After recording stops, the presenter is
  briefly re-posed at the recorded moment so playback shows the take, not her current pose.
- **Editing interface** animated in stages (canvas textures, redrawn only when the story moves):
  import into media bin (F10), razor cuts / trims / clip swap (F11), colour wheels + scopes + a
  before/after grading wipe in a shader (F12), animated captions and a motion-graphics badge (F13),
  playback, 16:9 → 9:16 reframe, export progress and "Ready to post" (F14).
- **Camera**: Catmull-Rom position spline + separate look-target spline, monotone timing so each key is
  hit exactly at its story percent, FOV keyed per shot, a horizontal film offset that keeps subjects
  clear of the headline column on desktop, and a portrait adaptation on phones.
- **Scroll behaviour**: one global story value (0–100; this milestone uses 0–29) drives everything as a
  pure function, so reverse scrolling, fast scrolling, stopping anywhere and landing mid-page all
  reconstruct the correct state. Idle loops (breathing, blinking, typing taps) use wall-clock time.
  "Skip to services" jumps past the section.
- **Text** is real HTML (h1 / h2 / p) fading and rising per beat — never baked into the 3D scene.
- **Performance / accessibility**: canvas lazy-loaded client-side with a poster; rendering pauses when
  the section is off screen; low-power tier (touch devices, ≤ 4 cores or ≤ 4 GB) drops shadows, caps
  pixel ratio at 1.25 and renders footage at lower resolution every other frame; adaptive pixel ratio if
  the first seconds run under ~40 fps; only sizeable objects cast shadows (≈ 415 draw calls / 232k
  triangles on desktop); error boundary + context-loss fallback to the 2D hero.

## What uses temporary (proxy) assets

**All three characters are procedural proxy rigs** (`components/studio3d/humanoid.ts`), built from
primitives in code. They have a real joint hierarchy, two-bone arm IK (hands land on tripod grips,
buttons, the mouse, headphone cups), seated/standing leg poses, head look-at, blinking, smiling and a
small mouth movement. They are **not** production characters and do not match the animated-film look of
the reference art. Specifically missing versus final quality:

- Sculpted faces, hair grooms and cloth (current hair is instanced spheres / simple shells)
- Skinned meshes (joints are rigid parts; elbows/knees use fill spheres)
- Individual fingers (hands are palm + finger block + thumb)
- Authored animation clips (current motion is procedural IK/FK keyed to the storyboard)

| Character | Identity used | Proxy file |
| --- | --- | --- |
| A — Cinematographer | Surya: thick curly black hair, full beard with goatee, black smartwatch, royal-blue tee, dark trousers, white sneakers | `studioWorld.ts` → `cinematographer` |
| B — UGC presenter | Long wavy brown hair, white tee, blue jeans (filmed creator, not a Prova employee) | `presenter` |
| C — Editor | Muthurajan: swept-up quiff, thin rectangular glasses, short chin beard, royal-blue tee, dark trousers | `editor` |
| D — Graphic designer (Scene 3) | Male, round tortoiseshell glasses, short side-parted hair, stubble, royal-blue tee | `designerLook` |
| E — Social media manager (Scene 4) | Female, long dark wavy hair, royal-blue tee, jeans | `socialManager` |
| F — Marketing specialist (Scene 5) | Female, dark hair in a high ponytail, royal-blue tee | `marketer` |
| G — Web & app developer (Scene 6, idle) | Male, short dark hair, royal-blue tee | `developer` |

## Replacing proxies with final characters (Blender plan)

1. **Model** each character in Blender at real scale (~1.75–1.8 m), stylised animated-film proportions,
   matching `public/one-team/*` art: royal-blue crew-neck tee with the small white abstract emblem,
   trousers per brand decision (the brief says dark trousers; the existing art uses beige chinos),
   white sneakers. Keep the bottle unbranded.
2. **Rig** with a standard humanoid skeleton (Rigify or Mixamo naming). Required bones and the joint
   names the choreography drives:

   | Choreography joint | Typical bone |
   | --- | --- |
   | hips / spine / chest / neck / head | Hips / Spine / Spine2 / Neck / Head |
   | shoulderL/R, upperArmL/R, forearmL/R, handL/R | LeftShoulder, LeftArm, LeftForeArm, LeftHand (and Right) |
   | fingersL/R, thumbL/R | finger chain roots (drive with a curl blend) |
   | thighL/R, shinL/R, footL/R | LeftUpLeg, LeftLeg, LeftFoot (and Right) |

3. **Facial controls**: shape keys for `blink_L/R`, `smile`, `mouth_open`, `brow_up` (map to
   `setFace(blink, smile, open, brow)`).
4. **Optional authored clips** (export as glTF animations): tripod adjust, focus pull, thumbs-up, record
   press, playback review (A); pick up bottle, present, demonstrate, wave (B); headphones on, typing,
   mouse work, lean back (C). These can replace or blend with the procedural IK per beat.
5. **Export** GLB with Draco/Meshopt compression and KTX2 textures; place under `public/models/`.
6. **Swap-in**: implement a loader that maps the GLB skeleton's bones onto the `Humanoid.joints` record
   (same names as above). `choreography.ts` only talks to joints, IK targets and `setFace`, so the
   performance timing does not need rewriting. Check rest-pose axes: the proxy bones point along −Y
   with the palm normal on +Z.

## Timeline reference

| Frame | Story % | Action | Camera |
| --- | --- | --- | --- |
| Intro | 0–8 | Brand headline over the studio | Wide establishing |
| F01 | 8–9 | Studio established | Wide dolly forward |
| F02 | 9–10 | Cameraman adjusts tripod | Side tracking |
| F03 | 10–12 | Focus check, presenter picks up bottle, thumbs-up | Three-quarter orbit |
| F04 | 12–14 | Record pressed (12.45), demonstration begins | Over the shoulder |
| F05 | 14–16 | Recording in progress | Push in to monitor |
| F06 | 16–18 | Stop (16.3), playback review, presenter waves | Playback close-up |
| F07 | 18–19 | Transfer started from the monitor | Hold, lateral exit |
| F08 | 19–20 | Footage cards travel | Rightward tracking past the LED stand |
| F09 | 20–21 | Edit station revealed, laptop receives files | Three-quarter approach |
| F10 | 21–23 | Import, headphones on, clip dragged to timeline | Dolly to editor |
| F11 | 23–24 | Cuts, trims, rearrange | Over-the-shoulder zoom |
| F12 | 24–26 | Colour grade with comparison wipe | Monitor close-up |
| F13 | 26–27 | Captions and motion graphics | Pan across screen |
| F14 | 27–29 | 9:16 playback, export complete, phone plays reel | Gentle pull back |
| 3.1–3.4 | 29–40 | Poster design (see Scene 3 above) | |
| 4.1–4.4 | 40–50 | Social media handling (see Scenes 4–5 above) | |
| 5.1–5.4 | 50–60 | Digital marketing (see Scenes 4–5 above) | |

Scroll lengths live in `components/studio3d/timeline.ts` (`SCROLL`); camera keys in `cameraPath.ts`;
performances in `choreography.ts`; screen states in `editorUi.ts`, `designUi.ts`, `socialUi.ts`,
`marketingUi.ts` and `webUi.ts`; scene 4–5 objects in `socialScene.ts` and `marketingScene.ts`.

## Next milestones

- Replace proxy characters with production GLBs (plan above).
- Scenes 6–8 (websites/apps, e-commerce, automation) and the final overview on the same timeline
  (60–100%), extending the same ring of zones and camera spline from the 60% key.
- Further optimisation: merge static props into a few draw calls per material, bake ambient occlusion.
