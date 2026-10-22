const { chromium } = require('C:/Users/1404/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:3000',{waitUntil:'domcontentloaded',timeout:120000});
 await page.waitForFunction(()=>window.__studioWorld?.ready,null,{timeout:60000});
 for(const g of [43,44.7,46,23,11]){
 await page.evaluate(g=>{const s=document.querySelector('[aria-label="Inside the Prova Media studio"]');window.scrollTo({top:s.offsetTop+(110+(g-8)*24)*innerHeight/100,behavior:'instant'});},g);
 await page.waitForFunction(g=>Math.abs(window.__studioClock.current-g)<0.05,g,{timeout:60000});
 await page.waitForTimeout(1500);
 await page.screenshot({path:'.codex-preview/motion-'+g+'.png',timeout:20000});
 console.log('captured',g);
 if(g===43){
 const sample=()=>{const p=window.__studioWorld.portraits.find(p=>p.role==='social');const a=p.body.geometry.attributes.position;return {values:Array.from(a.array),anchor:p.phoneAnchor.position.toArray(),phoneHidden:!p.phoneAnchor.visible,liveScreen:p.phoneScreen.visible};};
 const first=await page.evaluate(sample);await page.waitForTimeout(1400);const second=await page.evaluate(sample);
 const maxMotion=Math.max(...first.values.map((v,i)=>Math.abs(v-second.values[i])));
 console.log(JSON.stringify({maxMotion,anchorMoves:JSON.stringify(first.anchor)!==JSON.stringify(second.anchor),phoneHidden:second.phoneHidden,liveScreen:second.liveScreen}));
 if(maxMotion<0.001||!second.phoneHidden||!second.liveScreen)throw Error('Motion or phone check failed');
 }
 }
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(1500);await page.screenshot({path:'.codex-preview/motion-mobile.png'});
 console.log(JSON.stringify({errors,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)}));
 if(errors.length)throw Error('Browser errors');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
