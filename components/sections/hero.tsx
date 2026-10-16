"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, Code2, Globe2, Camera, Megaphone, Pause, Play, MousePointer2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./hero.module.css";

const scenes = [
  { id: "web", label: "Websites", icon: Globe2, title: "For your next\nbig launch.", description: "A website that feels like your brand. Built to turn first impressions into your next customer.", caption: "From a blank canvas to your brand’s new home.", detail: "DESIGN / BUILD / LAUNCH" },
  { id: "film", label: "Films & photos", icon: Camera, title: "For stories\nworth watching.", description: "Brand films, product photography and scroll-stopping reels. Make people feel something before they buy.", caption: "Your story. A different perspective.", detail: "CONCEPT / SHOOT / EDIT" },
  { id: "marketing", label: "Digital marketing", icon: Megaphone, title: "For your next\nbig audience.", description: "Search, social and campaigns that connect your brand with the right people — and give them a reason to act.", caption: "From being seen to being remembered.", detail: "SEARCH / SOCIAL / GROW" },
  { id: "software", label: "Software", icon: Code2, title: "For a smarter\nway to work.", description: "Custom apps, billing tools and connected workflows. Less busywork. More room for your business to grow.", caption: "Big ideas. Beautifully connected.", detail: "BUILD / CONNECT / SCALE" },
];
const DURATION = 6500;
const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const running = !paused && !reduced && visible;
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    let inView = true;
    const sync = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); }, { threshold: 0.15 });
    observer.observe(section);
    document.addEventListener("visibilitychange", sync);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, []);
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setActive((n) => (n + 1) % scenes.length), DURATION);
    return () => window.clearTimeout(timer);
  }, [active, running]);
  const scene = scenes[active];
  return (
    <section ref={root} className={styles.hero} aria-label="One solution for your brand" data-paused={!running} data-reduced={!!reduced}>
      <div className={styles.inner}>
        <div className={styles.content}>
          <div className={styles.eyebrow}><span /> ONE TEAM. EVERY POSSIBILITY.</div>
          <h1 className={styles.headline}>One solution<span className={styles.dot}>.</span><span className="sr-only"> Websites, films, digital marketing and custom software.</span></h1>
          <div className={styles.changingTitle} aria-hidden="true">
            <AnimatePresence mode="wait" initial={false}>
              <motion.h2 key={scene.id} initial={{ opacity: 0, y: reduced ? 0 : 20, filter: reduced ? "none" : "blur(5px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: reduced ? 0 : -12 }} transition={{ duration: reduced ? 0 : 0.4, ease }}>{scene.title}</motion.h2>
            </AnimatePresence>
          </div>
          <div className={styles.description}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p key={scene.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.22 }}>{scene.description}</motion.p>
            </AnimatePresence>
          </div>
          <div className={styles.actions}>
            <Button href="/contact" size="lg">Let’s build your next <ArrowUpRight size={17} /></Button>
            <a className={styles.workLink} href="/portfolio">Explore our work <ArrowRight size={16} /></a>
          </div>
          <div className={styles.signature}><span className={styles.signatureMark}>p<span>m</span></span><span>Creative minds. Connected thinking.<br /><strong>Made in Coimbatore. Built for everywhere.</strong></span></div>
        </div>
        <div className={styles.visualColumn}>
          <div className={styles.stage} aria-hidden="true">
            <div className={styles.orbit} /><div className={styles.orbitTwo} />
            <span className={styles.stageLabel}>THE PROVA PERSPECTIVE</span>
            <span className={styles.sceneNumber}>0{active + 1}<span> / 04</span></span>
            <AnimatePresence initial={false}>
              <motion.div key={scene.id} className={styles.scene} initial={{ opacity: 0, scale: reduced ? 1 : 0.87, y: reduced ? 0 : 28, filter: reduced ? "none" : "blur(8px)" }} animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, scale: reduced ? 1 : 1.1, y: reduced ? 0 : -20, filter: reduced ? "none" : "blur(8px)" }} transition={{ duration: reduced ? 0 : 0.9, ease }}>
                {active === 0 && <WebScene />}
                {active === 1 && <FilmScene />}
                {active === 2 && <MarketingScene />}
                {active === 3 && <SoftwareScene />}
              </motion.div>
            </AnimatePresence>
            <div className={styles.stageFooter}><span>{scene.detail}</span><span className={styles.liveDot} /> IN MOTION</div>
          </div>
          <div className={styles.caption}><span className={styles.captionLine} />{scene.caption}
            {/* Scenes change on their own, so keep a way to pause them (WCAG 2.2.2). */}
            <button type="button" className={styles.pause} onClick={() => setPaused(!paused)} disabled={!!reduced} aria-label={reduced ? "Animation disabled by reduced motion preference" : paused ? "Play hero animation" : "Pause hero animation"}>{paused || reduced ? <Play size={16} /> : <Pause size={16} />}</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function WebScene() {
  return <div className={styles.webScene}>
    <div className={styles.laptop}>
      <div className={styles.lid}><div className={styles.webcam} /><div className={styles.screen}>
        <div className={styles.browser}><i /><i /><i /><span>your-next-big-thing.com</span><Plus size={9} /></div>
        <div className={styles.miniSite}><div className={styles.miniNav}><b>form<span>®</span></b><span>Spaces &nbsp; Objects &nbsp; About</span><ArrowUpRight size={12} /></div><div className={styles.miniBody}><div><small>LESS, BUT BETTER.</small><h3>A little space.<br />A lot of possibility.</h3><p>Thoughtfully made for the way you live.</p><span className={styles.miniButton}>Explore the collection ↗</span></div><div className={styles.sculpture}><div /><i /><b /></div></div><div className={styles.miniBottom}>DESIGNED TO FEEL DIFFERENT <span>01 — 03</span></div></div>
      </div></div><div className={styles.keyboard}><div className={styles.keys} /><div className={styles.trackpad} /></div><div className={styles.laptopEdge} />
    </div>
    <div className={`${styles.floatingNote} ${styles.webNote}`}><span className={styles.noteIcon}><Check size={17} /></span><span>Ready for your next chapter<strong>Beautiful. Fast. Yours.</strong></span></div>
    <MousePointer2 className={styles.cursor} size={29} fill="#2563eb" />
    <div className={styles.groundShadow} />
  </div>;
}
function FilmScene() {
  return <div className={styles.filmScene}>
    <div className={styles.filmStrip}><div><span>01 / THE IDEA</span><div className={styles.filmLandscape} /></div><div><span>02 / THE FEELING</span><div className={styles.filmPortrait} /></div></div>
    <Image src="/hero/cinema-camera.png" alt="" width={900} height={675} className={styles.camera} />
    <div className={styles.focusFrame}><i /><i /><i /><i /><span><b /> REC <span>00:00:04</span></span></div>
    <div className={styles.flash} />
    <div className={`${styles.floatingNote} ${styles.filmNote}`}><span className={styles.noteIcon}><Play size={16} fill="currentColor" /></span><span>Make every frame matter<strong>From the first frame. To the last.</strong></span></div>
    <div className={styles.timeline}><span>YOUR STORY</span><div>{Array.from({length: 26}, (_, i) => <i key={i} style={{ height: `${12 + ((i * 17) % 27)}px` }} />)}</div><b /></div>
  </div>;
}
function MarketingScene() {
  return <div className={styles.marketingScene}>
    <div className={styles.campaignRing} /><div className={styles.campaignRingTwo} />
    <div className={styles.phone}><div className={styles.phoneIsland} /><div className={styles.phoneHeader}><span className={styles.brandAvatar}>f.</span><b>form.studio<small>Sponsored · Made for you</small></b><span>•••</span></div><div className={styles.adCreative}><small>MAKE ROOM FOR</small><h3>something<br /><em>extraordinary.</em></h3><div className={styles.adSculpture} /><span>THE EVERYDAY, REIMAGINED.</span></div><div className={styles.adAction}>Find your everyday favourite <ArrowUpRight size={13} /></div><div className={styles.phoneSocial}>♡ &nbsp; ◇ &nbsp; ↗ <span>▱</span></div><p>A fresh perspective for your feed.<br /><b>Make it yours. #FindYourForm</b></p></div>
    <div className={styles.growthCard}><div><span className={styles.noteIcon}><ArrowUpRight size={18} /></span><small>THE RIGHT DIRECTION</small></div><h3>More connection.<br /><span>More possibility.</span></h3><svg viewBox="0 0 260 100"><defs><linearGradient id="hero-chart-fill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#38bdf8" stopOpacity=".3" /><stop offset="1" stopColor="#38bdf8" stopOpacity="0" /></linearGradient></defs><path d="M0 90 C30 90 26 65 55 69 S90 85 115 51 S157 69 180 36 S218 47 255 9 L255 100 L0 100Z" fill="url(#hero-chart-fill)" /><path className={styles.chartLine} d="M0 90 C30 90 26 65 55 69 S90 85 115 51 S157 69 180 36 S218 47 255 9" fill="none" stroke="#2563eb" strokeWidth="3" /><circle cx="255" cy="9" r="5" fill="#2563eb" /></svg><div className={styles.channelTags}><span>Search</span><span>Social</span><span>Strategy</span></div></div>
    <div className={`${styles.floatingNote} ${styles.audienceNote}`}><span className={styles.audienceAvatars}><i>A</i><i>S</i><i>M</i></span><span>Meet your next audience<strong>Right people. Real connection.</strong></span></div>
  </div>;
}
function SoftwareScene() {
  return <div className={styles.softwareScene}><div className={styles.dashboard}><div className={styles.dashSidebar}><span className={styles.appLogo}>p.</span>{[Globe2, Code2, Megaphone, Camera].map((Icon,i)=><Icon key={i} size={16} />)}</div><div className={styles.dashBody}><div className={styles.dashHeader}><span>Workspace <small>/ Overview</small></span><span className={styles.userAvatar}>P</span></div><div className={styles.dashWelcome}><small>LESS FRICTION. MORE FLOW.</small><h3>Everything, in sync.</h3><p>Your business. Working beautifully.</p></div><div className={styles.dashStats}><div><span>Projects</span><b>12 <small>active</small></b></div><div><span>Workflows</span><b>08 <small>connected</small></b></div><div><span>Your time</span><b>Back <Check size={14} /></b></div></div><div className={styles.taskList}>{["Website launch", "Campaign assets", "Customer follow-up"].map((title,i)=><div key={title}><span className={styles.taskCheck}><Check size={12} /></span><span>{title}</span><small>{i === 2 ? "Automated" : "Complete"}</small></div>)}</div><div className={styles.workflow}><span>Idea</span><ArrowRight size={13}/><span>Build</span><ArrowRight size={13}/><span>Connected</span></div></div></div><div className={`${styles.floatingNote} ${styles.codeNote}`}><span className={styles.noteIcon}><Code2 size={20} /></span><span>Built around your business<strong>Your workflow. Your software.</strong></span></div><div className={`${styles.floatingNote} ${styles.syncNote}`}><span className={styles.noteIcon}><Check size={17} /></span><span>Less busywork.<strong>More space to grow.</strong></span></div></div>;
}
