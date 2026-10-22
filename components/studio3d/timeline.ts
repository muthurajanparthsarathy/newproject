/**
 * The site's single story timeline, in percent (0–100) of the whole scroll story.
 * Built so far: the intro (0–8), scene 1 shoot (8–18), transfer (18–21), scene 2 edit (21–29),
 * scene 3 poster design (29–40), scene 4 social media (40–50) scene 5 digital marketing (50–60), scene 6 web development (60–70), scene 7 SEO (70–80), and the team finale (80–86).
 * Everything in the 3D studio is a pure function of this number, so scrolling
 * backwards, scrolling fast or landing mid-page always rebuilds the right state.
 */
export const STORY = {
  introEnd: 8,
  shootEnd: 18,
  transferEnd: 21,
  editEnd: 29,
  designEnd: 40,
  socialEnd: 50,
  marketingEnd: 60,
  webEnd: 70,
  seoEnd: 80,
  finaleEnd: 86,
} as const;

/** Where the currently built story ends. */
export const STORY_END = STORY.finaleEnd;

export type Frame = {
  id: string;
  from: number;
  to: number;
  action: string;
  camera: string;
  /** Short on-screen line for this beat (HTML overlay, never baked into 3D). */
  text: string;
};

/** Storyboard beats F01–F14 (see docs/3d-studio-hero.md). */
export const FRAMES: Frame[] = [
  { id: "F01", from: 8, to: 9, action: "Studio established", camera: "Wide dolly forward", text: "We shoot stories that sell." },
  { id: "F02", from: 9, to: 10, action: "Cameraman adjusts tripod", camera: "Side tracking", text: "Professional production." },
  { id: "F03", from: 10, to: 12, action: "Camera preparation", camera: "Three-quarter orbit", text: "Capture your brand the right way." },
  { id: "F04", from: 12, to: 14, action: "UGC demonstration begins", camera: "Over-the-shoulder move", text: "Authentic content for real people." },
  { id: "F05", from: 14, to: 16, action: "Recording in progress", camera: "Recording monitor push-in", text: "Made for your audience." },
  { id: "F06", from: 16, to: 18, action: "Recording stops", camera: "Playback monitor close-up", text: "Footage captured. Ready to edit." },
  { id: "F07", from: 18, to: 19, action: "Transfer begins", camera: "Monitor hold and lateral exit", text: "Sending footage to edit…" },
  { id: "F08", from: 19, to: 20, action: "Footage travels between stations", camera: "Rightward tracking", text: "From shoot to edit — same team." },
  { id: "F09", from: 20, to: 21, action: "Editor's station revealed", camera: "Three-quarter workstation approach", text: "Now it's time to create something amazing." },
  { id: "F10", from: 21, to: 23, action: "Editor receives footage", camera: "Dolly toward editor", text: "Let's bring your story to life." },
  { id: "F11", from: 23, to: 24, action: "Footage trimmed", camera: "Over-the-shoulder zoom", text: "Every frame with purpose." },
  { id: "F12", from: 24, to: 26, action: "Colour grade applied", camera: "Monitor close-up", text: "Professional edits. Stunning results." },
  { id: "F13", from: 26, to: 27, action: "Captions and graphics added", camera: "Subtle pan across screen", text: "Designed for impact." },
  { id: "F14", from: 27, to: 29, action: "Playback and export complete", camera: "Gentle pullback", text: "Ready to post. Ready to perform." },
  // Scene 3 — poster & creative design
  { id: "3.1", from: 29, to: 31, action: "Designer revealed, shoot assets arrive", camera: "Pull back, track right, three-quarter", text: "Creative designs for your brand." },
  { id: "3.2", from: 31, to: 34, action: "Poster drawn with stylus", camera: "Behind the right shoulder", text: "Stunning visuals that get attention." },
  { id: "3.3", from: 34, to: 37, action: "Typography, palette and layout variations", camera: "Gentle orbit and pull back", text: "Designs for posts, ads, and campaigns." },
  { id: "3.4", from: 37, to: 40, action: "Final poster rises, approved", camera: "Push in, then turn to social", text: "Ready to share across all platforms." },
  // Scene 4 — social media handling
  { id: "4.1", from: 40, to: 42, action: "Poster and reel arrive, manager reviews them on her phone", camera: "Pull back, curve to the social corner, three-quarter", text: "We create content that connects." },
  { id: "4.2", from: 42, to: 45, action: "Content selected, platforms chosen, published", camera: "Close on her face, phone and hand", text: "One click. All your platforms." },
  { id: "4.3", from: 45, to: 48, action: "Posts go live; likes, comments and shares; she replies", camera: "Pull back, gentle orbit", text: "We post. We engage. We grow with you." },
  { id: "4.4", from: 48, to: 50, action: "Illustrative content-performance dashboard", camera: "Slide right, push to the dashboard", text: "Real people. Real engagement." },
  // Scene 5 — digital marketing
  { id: "5.1", from: 50, to: 52, action: "Campaign card lands on the ads dashboard", camera: "Track past the storage unit, three-quarter", text: "Targeted campaigns for your business." },
  { id: "5.2", from: 52, to: 55, action: "Objective, audience, placements, example budget, launch", camera: "Behind her shoulder, push to the monitor", text: "Reach the right audience." },
  { id: "5.3", from: 55, to: 58, action: "Illustrative campaign analytics, she points at the chart", camera: "Arc to the analytics panel, slight dolly in", text: "Turn attention into opportunities." },
  { id: "5.4", from: 58, to: 60, action: "Audience map, website visits head to the web desk", camera: "Wider three-quarter, turn to web development", text: "Connect your brand with the people who matter." },
  // Scene 6 — web & app development
  { id: "6.1", from: 60, to: 62, action: "Campaign visitors reach the developer desk", camera: "Three-quarter workstation approach", text: "Turn attention into a useful digital experience." },
  { id: "6.2", from: 62, to: 65, action: "Developer builds the storefront", camera: "Move closer to code and working hands", text: "Built around your business." },
  { id: "6.3", from: 65, to: 68, action: "Desktop and mobile previews are reviewed", camera: "Ease back across the preview screens", text: "A consistent experience on every screen." },
  { id: "6.4", from: 68, to: 70, action: "Finished website preview and project invitation", camera: "Pull back to the complete workstation", text: "Ready to be found." },
  { id: "7.1", from: 70, to: 73, action: "SEO page review", camera: "Approach search workstation", text: "Help the right people find you." },
  { id: "7.2", from: 73, to: 76, action: "Page optimisation and search preview", camera: "Closer view of specialist and screens", text: "Useful content. Clear structure." },
  { id: "7.3", from: 76, to: 80, action: "Example search reporting", camera: "Ease back for the report", text: "Measure, learn and improve." },
];

/**
 * Scroll distance (in svh) each part of the pinned section takes. The intro is short;
 * each story percent gets a comfortable stretch; a short tail holds the final frame.
 */
export const SCROLL = { intro: 110, perPercent: 24, tail: 45 } as const;
export const SCROLL_SVH = SCROLL.intro + (STORY_END - STORY.introEnd) * SCROLL.perPercent + SCROLL.tail;

/** Story position for a scroll distance (in svh) into the pinned section. */
export function storyAt(svh: number) {
  if (svh <= 0) return 0;
  if (svh < SCROLL.intro) return (svh / SCROLL.intro) * STORY.introEnd;
  const g = STORY.introEnd + (svh - SCROLL.intro) / SCROLL.perPercent;
  return Math.min(STORY_END, g);
}

/** Scroll distance (in svh) at which the story reaches `g` (inverse of storyAt). */
export function scrollFor(g: number) {
  if (g <= STORY.introEnd) return (g / STORY.introEnd) * SCROLL.intro;
  return SCROLL.intro + (Math.min(g, STORY_END) - STORY.introEnd) * SCROLL.perPercent;
}

/** Shared between the scroll handler, the HTML overlays and the 3D scene. */
export type StoryClock = {
  /** Where the scroll position says the story is */
  target: number;
  /** Smoothed story position everything renders from */
  current: number;
};
