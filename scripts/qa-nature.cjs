const assert=require('node:assert/strict');
let playwright;try{playwright=require('playwright')}catch{playwright=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')}
const fs=require('node:fs');
(async()=>{
 fs.mkdirSync('qa',{recursive:true});
 const browser=await playwright.chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader']});
 const base=process.env.TEST_URL||'http://127.0.0.1:4173';
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'}),errors=[],requests=[];page.setDefaultTimeout(90000);page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.route('https://fonts.gstatic.com/**',r=>r.abort());
  await page.addInitScript(()=>sessionStorage.setItem('explorer-theme','dark'));
  await page.goto(base);await page.waitForFunction(()=>window.homeDrive?.getState().running);
  assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('dark')),false);
  assert.equal(await page.locator('.module-card.ready').count(),4);assert.equal(await page.locator('.module-card.pending').count(),1);
  assert.equal(await page.evaluate(()=>window.homeDrive.getState().dimension),'2d');assert.equal(await page.locator('#hero-scene canvas').count(),0);
  assert.equal(requests.some(url=>/three\.module|assets\/hero\/truck\.(bin|json)/.test(url)),false,'Home must not download Three.js or CAD hero meshes');
  const transforms=()=>page.locator('.field-trees,.road-markings,.truck-wheel').evaluateAll(items=>items.map(e=>getComputedStyle(e).transform));
  const start=await transforms();await page.waitForTimeout(250);assert.notDeepEqual(await transforms(),start,'Scenery and wheels must move');
  const image1=await page.locator('#hero-scene-view').screenshot();await page.waitForTimeout(350);const image2=await page.locator('#hero-scene-view').screenshot();assert.notDeepEqual(image1,image2,'Animation must visibly change pixels');
  await page.locator('#scene-toggle').click();assert.equal(await page.evaluate(()=>window.homeDrive.getState().paused),true);await page.waitForTimeout(80);const paused=await transforms();await page.waitForTimeout(350);assert.deepEqual(await transforms(),paused,'Pause must freeze all moving scenery and wheels');
  await page.locator('#scene-toggle').click();await page.waitForTimeout(250);assert.notDeepEqual(await transforms(),paused);await page.locator('#scene-toggle').click();
  for(const [width,height] of [[1920,1080],[1920,900],[1440,1000],[1440,768],[1280,720],[768,1024],[390,844],[320,740],[390,640]]){
   await page.setViewportSize({width,height});await page.waitForTimeout(200);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   const scene=await page.locator('#hero-scene').boundingBox();assert.ok(scene.width>width*.94,`Scene must span nearly the full width at ${width}`);assert.ok(scene.height>height*.80||scene.height>height-140,`Scene must fill most of the screen at ${width}x${height}`);
   const lines=await page.locator('h1').evaluate(e=>e.getBoundingClientRect().height/parseFloat(getComputedStyle(e).lineHeight));assert.ok(lines<2.2,`Headline must fit two lines at ${width}`);
   const copy=await page.locator('.hero-copy').boundingBox(),truck=await page.locator('.truck-position').boundingBox();assert.ok(truck.y>copy.y+copy.height+10,`Truck and text must not overlap at ${width}`);
   const button=await page.locator('#scene-toggle').boundingBox();assert.ok(button.y+button.height<height,`Pause must be on the first screen at ${width}`);
   await page.screenshot({path:`qa/drive-2d-${width}x${height}.png`});
  }
  await page.setViewportSize({width:1440,height:1000});await page.locator('#theme').click();await page.waitForFunction(()=>document.body.classList.contains('dark'));await page.waitForFunction(()=>!document.documentElement.classList.contains('glass-theme-transition'));await page.screenshot({path:'qa/drive-2d-dark.png',fullPage:true});
  await page.locator('a.card-link[href*="module=thung-phu"]').click();await page.waitForFunction(()=>window.modelExplorer);assert.equal(await page.evaluate(()=>window.modelExplorer.getState().meshCount),122);assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('dark')),true);
  assert.equal(await page.locator('.module-tab').count(),5);assert.equal(await page.locator('#module-tabs').evaluate(e=>getComputedStyle(e).position),'fixed');await page.locator('#explode').fill('100');await page.locator('#explode').dispatchEvent('input');await page.waitForFunction(()=>window.modelExplorer.getState().explode>.99);await page.locator('#reset').click();
  await page.locator('.back-home').click();await page.waitForFunction(()=>window.homeDrive?.getState().ready);assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('dark')),true);
  await page.locator('#catalog').scrollIntoViewIfNeeded();await page.waitForFunction(()=>!window.homeDrive.getState().inView);await page.waitForTimeout(80);const offscreen=await transforms();await page.waitForTimeout(300);assert.deepEqual(await transforms(),offscreen,'Offscreen animation must freeze');
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base);await page.waitForFunction(()=>window.homeDrive?.getState().ready);assert.equal(await page.evaluate(()=>window.homeDrive.getState().running),false);assert.equal(await page.locator('.scene-motion').evaluateAll(items=>items.every(e=>getComputedStyle(e).animationName==='none')),true);await page.screenshot({path:'qa/drive-2d-reduced.png'});
  const still=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await still.route('https://fonts.googleapis.com/**',r=>r.abort());await still.route('https://fonts.gstatic.com/**',r=>r.abort());await still.goto(base);assert.ok(await still.locator('.field-truck').isVisible());assert.equal(await still.locator('.scene-motion').evaluateAll(items=>items.every(e=>getComputedStyle(e).animationPlayState==='paused')),true);await still.screenshot({path:'qa/drive-2d-no-script.png'});await still.close();
  assert.deepEqual(errors,[]);console.log('PASS: nearly full-screen 2D scene at nine viewport sizes, visible wheel/scenery motion, pause/resume, offscreen freeze, reduced motion, no-script illustration, no 3D downloads on Home, white/green and dark themes, 4/5 gallery and working CAD explorer.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
