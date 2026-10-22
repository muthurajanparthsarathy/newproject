const { chromium } = require('C:/Users/1404/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
 const browser = await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const page = await browser.newPage({viewport:{width:1440,height:1000}});
 console.log('browser ready'); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:3000',{waitUntil:'domcontentloaded',timeout:120000});
 console.log('page loaded'); await page.waitForFunction(()=>window.__studioGl, {timeout:60000});
 console.log('webgl ready'); await page.waitForTimeout(3000);
 for (const g of [10,12,15,18,23,33,36]) {
  await page.evaluate(g=> { const section=document.querySelector('[aria-label="Inside the Prova Media studio"]'); const svh=g<=8?g/8*110:110+(g-8)*24; window.scrollTo({top:section.offsetTop+svh*innerHeight/100,behavior:'instant'}); },g);
  await page.waitForTimeout(3000);
  await page.waitForFunction(g=>Math.abs(window.__studioClock.current-g)<0.15,g,{timeout:60000}); console.log('capture',g); await page.screenshot({timeout:20000,path:'.codex-preview/accessories-'+g+'.png'});
 }
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>window.scrollTo(0,0)); await page.waitForTimeout(3000);
 console.log('capture'); await page.screenshot({timeout:20000,path:'.codex-preview/characters-mobile.png'});
 console.log(JSON.stringify({errors,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)}));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});



