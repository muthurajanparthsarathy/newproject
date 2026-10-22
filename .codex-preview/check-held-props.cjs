const { chromium } = require('C:/Users/1404/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
try{
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.goto('http://localhost:3000',{waitUntil:'domcontentloaded',timeout:120000});
await page.waitForFunction(()=>window.__studioWorld?.ready,null,{timeout:60000});
await page.evaluate(()=>{const s=document.querySelector('[aria-label="Inside the Prova Media studio"]');window.scrollTo({top:s.offsetTop+(110+4*24)*innerHeight/100,behavior:'instant'});});
await page.waitForFunction(()=>Math.abs(window.__studioClock.current-12)<.05);
const sample=()=>{const p=window.__studioWorld.portraits.find(p=>p.role==='presenter');const a=p.body.geometry.attributes.position;const uv=p.body.geometry.attributes.uv;let grip=[];for(let i=0;i<a.count;i++){if(uv.getX(i)>.76&&uv.getY(i)>.63&&uv.getY(i)<.80)grip.push(a.getX(i),a.getY(i));}return grip;};
const a=await page.evaluate(sample);await page.waitForTimeout(1600);const b=await page.evaluate(sample);
const motion=Math.max(...a.map((v,i)=>Math.abs(v-b[i])));
const hidden=await page.evaluate(()=>({bottle:!window.__studioWorld.presenter.bottle.visible,headphones:!window.__studioWorld.editor.headphones.visible,stylus:!window.__studioWorld.designer.stylus.visible}));
console.log(JSON.stringify({gripMotion:motion,hidden}));
if(motion<.002||Object.values(hidden).some(v=>!v))throw Error('Held accessory regression');
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
