const assert=require('node:assert/strict');
let playwright;try{playwright=require('playwright')}catch{playwright=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')}
const fs=require('node:fs');
(async()=>{
 fs.mkdirSync('qa',{recursive:true});
 const browser=await playwright.chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'}),errors=[];page.setDefaultTimeout(90000);page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.route('https://fonts.gstatic.com/**',r=>r.abort());
  await page.addInitScript(()=>sessionStorage.setItem('explorer-theme','dark'));
  const base=process.env.TEST_URL||'http://127.0.0.1:4173';await page.goto(base);await page.waitForFunction(()=>window.homeDrive?.getState().ready);
  assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('dark')),false,'New palette must initially open in white/green');
  assert.equal(await page.locator('.module-card.ready').count(),4);assert.equal(await page.locator('.module-card.pending').count(),1);
  assert.equal(await page.evaluate(()=>window.homeDrive.getState().wheels),6);await page.waitForFunction(()=>window.homeDrive.getState().time>.2);
  const start=await page.evaluate(()=>window.homeDrive.getState());await page.waitForFunction(angle=>window.homeDrive.getState().wheelAngle>angle+.2,start.wheelAngle);
  const image1=await page.locator('#hero-scene-view').screenshot();await page.waitForTimeout(350);const image2=await page.locator('#hero-scene-view').screenshot();assert.notDeepEqual(image1,image2,'Driving must visibly change the rendered scene');
  await page.locator('#scene-toggle').click();assert.equal(await page.evaluate(()=>window.homeDrive.getState().paused),true);const paused=await page.evaluate(()=>window.homeDrive.getState().time);await page.waitForTimeout(350);assert.equal(await page.evaluate(()=>window.homeDrive.getState().time),paused);
  await page.locator('#scene-toggle').click();await page.waitForFunction(t=>window.homeDrive.getState().time>t+.1,paused);await page.locator('#scene-toggle').click();
  await page.locator('#theme').click();await page.waitForFunction(()=>document.body.classList.contains('dark'));await page.waitForFunction(()=>!document.documentElement.classList.contains('glass-theme-transition'));await page.screenshot({path:'qa/nature-home-dark.png',fullPage:true});
  for(const width of [1440,768,390,320]){await page.setViewportSize({width,height:1000});await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);const lines=await page.locator('h1').evaluate(e=>e.getBoundingClientRect().height/parseFloat(getComputedStyle(e).lineHeight));assert.ok(lines<2.2,`Hero headline at ${width}px must fit two lines`);await page.screenshot({path:`qa/nature-checked-${width}.png`});}
  await page.setViewportSize({width:1440,height:1000});await page.locator('a.card-link[href*="module=thung-phu"]').click();await page.waitForFunction(()=>window.modelExplorer);assert.equal(await page.evaluate(()=>window.modelExplorer.getState().meshCount),122);assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('dark')),true);
  assert.equal(await page.locator('.module-tab').count(),5);assert.equal(await page.locator('#module-tabs').evaluate(e=>getComputedStyle(e).position),'fixed');await page.locator('#explode').fill('100');await page.locator('#explode').dispatchEvent('input');await page.waitForFunction(()=>window.modelExplorer.getState().explode>.99);await page.locator('#reset').click();await page.screenshot({path:'qa/nature-explorer.png'});
  await page.locator('.back-home').click();await page.waitForFunction(()=>window.homeDrive?.getState().ready);assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('dark')),true);
  await page.locator('#catalog').scrollIntoViewIfNeeded();await page.waitForFunction(()=>!window.homeDrive.getState().inView);const offscreen=await page.evaluate(()=>window.homeDrive.getState().time);await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>window.homeDrive.getState().time),offscreen,'Offscreen scenery must stop drawing');
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base);await page.waitForFunction(()=>window.homeDrive?.getState().ready);assert.equal(await page.evaluate(()=>window.homeDrive.getState().paused),true);assert.equal(await page.evaluate(()=>window.homeDrive.getState().time),0);
  await page.route('**/assets/hero/truck.bin',r=>r.abort());await page.goto(base);await page.waitForFunction(()=>document.querySelector('#scene-toggle').hidden);assert.equal(await page.locator('#hero-scene-view img').evaluate(e=>e.complete&&e.naturalWidth>0),true);assert.equal(await page.locator('.module-card').count(),5);
  assert.deepEqual(errors,[]);console.log('PASS: real vehicle, six rolling wheels, visible animation, pause/resume, offscreen pause, reduced motion, poster fallback, white/green default, forest dark mode, 4/5 ready gallery, four responsive widths, working explorer and glass dock.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
