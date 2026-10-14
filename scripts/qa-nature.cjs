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
  assert.equal(await page.locator('.brand span').textContent(),'MÔ HÌNH 3D XE ÉP RÁC');
  assert.deepEqual(await page.locator('.site-nav a').allTextContents(),['Home','Tổng quan 3D','Thùng phụ','Thùng chính','Thân xe','Cặp nâng thùng rác']);
  assert.equal(await page.locator('#scene-toggle').textContent(),'');assert.ok(await page.locator('#scene-toggle').getAttribute('aria-label'));
  assert.equal(await page.evaluate(()=>window.homeDrive.getState().dimension),'2d');assert.equal(await page.locator('#hero-scene canvas').count(),0);
  const cad=JSON.parse(fs.readFileSync('dist/assets/cad/tong-quan.json'));
  const tires=cad.meshes.filter(m=>/11\.00R20/.test(m.nativePart));
  const axles=[...new Set(tires.map(m=>m.center[2].toFixed(4)))].map(Number).sort((a,b)=>a-b);
  const drawnAxles=await page.locator('.truck-wheel').evaluateAll(items=>items.map(e=>e.parentElement.transform.baseVal.consolidate().matrix.e));
  assert.equal(drawnAxles.length,axles.length,'Side drawing must use the two actual CAD axles, not an invented third axle');
  const wheelbase=axles[1]-axles[0];assert.equal(Number(await page.locator('.field-truck').getAttribute('data-wheelbase-mm')),Math.round(wheelbase*1000));
  assert.ok(Math.abs((drawnAxles[1]-drawnAxles[0])-wheelbase*1400/8.6)<1,'Drawn wheel spacing must match the CAD side projection');
  assert.equal(requests.some(url=>/three\.module|assets\/hero\/truck\.(bin|json)/.test(url)),false,'Home must not download Three.js or CAD hero meshes');
  const transforms=()=>page.locator('.field-trees,.road-markings,.truck-wheel').evaluateAll(items=>items.map(e=>getComputedStyle(e).transform));
  const start=await transforms();await page.waitForTimeout(250);assert.notDeepEqual(await transforms(),start,'Scenery and wheels must move');
  const image1=await page.locator('#hero-scene-view').screenshot();await page.waitForTimeout(350);const image2=await page.locator('#hero-scene-view').screenshot();assert.notDeepEqual(image1,image2,'Animation must visibly change pixels');
  await page.locator('#scene-toggle').click();assert.equal(await page.evaluate(()=>window.homeDrive.getState().paused),true);await page.waitForTimeout(80);const paused=await transforms();await page.waitForTimeout(350);assert.deepEqual(await transforms(),paused,'Pause must freeze all moving scenery and wheels');
  await page.locator('#scene-toggle').click();await page.waitForTimeout(250);assert.notDeepEqual(await transforms(),paused);await page.locator('#scene-toggle').click();
  for(const [width,height] of [[1920,1080],[1920,900],[1440,1000],[1440,768],[1280,720],[768,1024],[390,844],[320,740],[390,640]]){
   await page.setViewportSize({width,height});await page.waitForTimeout(200);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   const scene=await page.locator('#hero-scene').boundingBox(),header=await page.locator('.site-header').boundingBox();assert.ok(scene.width>width*.94,`Scene must span nearly the full width at ${width}`);assert.ok(scene.height>=height-header.height-1,`Scene must fill the available screen at ${width}x${height}`);
   assert.ok(Math.abs(scene.x)<1&&Math.abs(scene.width-width)<1,`Scene must reach both edges at ${width}`);assert.equal(await page.locator('#hero-scene').evaluate(e=>getComputedStyle(e).borderRadius),'0px');
   const rows=await page.locator('.module-row').evaluateAll(items=>items.map(e=>{
    const row=e.getBoundingClientRect(),image=e.querySelector('.card-visual').getBoundingClientRect(),copy=e.querySelector('.card-content').getBoundingClientRect();
    return{row:{x:row.x,y:row.y,w:row.width,bottom:row.bottom},image:{x:image.x,y:image.y},copy:{x:copy.x,y:copy.y}};
   }));
   assert.equal(rows.length,5);
   for(let i=0;i<rows.length;i++){
    if(i)assert.ok(rows[i].row.y>rows[i-1].row.bottom+15,'Every module must have its own row');
    if(width>800)assert.ok(i%2?rows[i].image.x>rows[i].copy.x:rows[i].image.x<rows[i].copy.x,'Images must alternate left/right');
    else assert.ok(rows[i].image.y<rows[i].copy.y,'Phone sections must place the image above its description');
   }
   const nav=await page.locator('.site-nav a').evaluateAll(items=>items.map(e=>{const r=e.getBoundingClientRect();return{left:r.left,right:r.right,height:r.height}}));for(const link of nav){assert.ok(link.left>=0&&link.right<=width&&link.height>=44,'All six menu links must fit and be easy to tap');}
   const lines=await page.locator('h1').evaluate(e=>e.getBoundingClientRect().height/parseFloat(getComputedStyle(e).lineHeight));assert.ok(lines<2.2,`Headline must fit two lines at ${width}`);
   const copy=await page.locator('.hero-copy').boundingBox(),truck=await page.locator('.truck-position').boundingBox();assert.ok(truck.y>copy.y+copy.height+10,`Truck and text must not overlap at ${width}`);
   const button=await page.locator('#scene-toggle').boundingBox();assert.ok(button.y+button.height<height,`Pause must be on the first screen at ${width}`);
   const theme=await page.locator('#theme').boundingBox();assert.equal(await page.locator('#theme').evaluate(e=>getComputedStyle(e).position),'fixed');assert.ok(theme.width>=44&&theme.height>=44);assert.ok(width-theme.x-theme.width>=11&&width-theme.x-theme.width<=25);assert.ok(height-theme.y-theme.height>=11&&height-theme.y-theme.height<=25);
   await page.screenshot({path:`qa/drive-2d-${width}x${height}.png`});
  }
  await page.setViewportSize({width:1440,height:1000});const corner=await page.locator('#theme').boundingBox();await page.locator('#catalog').scrollIntoViewIfNeeded();assert.deepEqual(await page.locator('#theme').boundingBox(),corner,'Theme button must stay fixed while scrolling');await page.locator('#theme').click();await page.waitForFunction(()=>document.body.classList.contains('dark'));await page.waitForFunction(()=>!document.documentElement.classList.contains('glass-theme-transition'));await page.screenshot({path:'qa/drive-2d-dark.png',fullPage:true});
  await page.locator('.home-nav a[href*="module=thung-chinh"]').click();await page.waitForFunction(()=>window.modelExplorer);assert.equal(await page.evaluate(()=>window.modelExplorer.getState().meshCount),74);assert.equal(await page.locator('.brand span').textContent(),'MÔ HÌNH 3D XE ÉP RÁC');
  await page.locator('.back-home').click();await page.waitForFunction(()=>window.homeDrive);await page.locator('.home-nav a[href*="module=thung-phu"]').click();await page.waitForFunction(()=>window.modelExplorer);assert.equal(await page.evaluate(()=>window.modelExplorer.getState().meshCount),122);assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('dark')),true);
  assert.equal(await page.locator('.module-tab').count(),5);assert.equal(await page.locator('#module-tabs').evaluate(e=>getComputedStyle(e).position),'fixed');await page.locator('#explode').fill('100');await page.locator('#explode').dispatchEvent('input');await page.waitForFunction(()=>window.modelExplorer.getState().explode>.99);await page.locator('#reset').click();
  for(const width of [1440,768,390,320]){
   await page.setViewportSize({width,height:844});await page.locator('#viewport').scrollIntoViewIfNeeded();await page.waitForTimeout(200);
   const dock=await page.locator('#module-tabs').boundingBox(),theme=await page.locator('#theme').boundingBox();
   const overlaps=theme.x<dock.x+dock.width&&theme.x+theme.width>dock.x&&theme.y<dock.y+dock.height&&theme.y+theme.height>dock.y;
   assert.equal(overlaps,false,`Theme switch must not cover any module at ${width}px`);assert.ok(Math.abs(dock.x+dock.width/2-width/2)<1,'Module dock stays centered');
   assert.equal(await page.locator('#explode-panel').isVisible(),true);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.screenshot({path:`qa/theme-explorer-${width}.png`});
  }
  await page.locator('.back-home').click();await page.waitForFunction(()=>window.homeDrive?.getState().ready);assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('dark')),true);
  await page.locator('#catalog').scrollIntoViewIfNeeded();await page.waitForFunction(()=>!window.homeDrive.getState().inView);await page.waitForTimeout(80);const offscreen=await transforms();await page.waitForTimeout(300);assert.deepEqual(await transforms(),offscreen,'Offscreen animation must freeze');
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base);await page.waitForFunction(()=>window.homeDrive?.getState().ready);assert.equal(await page.evaluate(()=>window.homeDrive.getState().running),false);assert.equal(await page.locator('.scene-motion').evaluateAll(items=>items.every(e=>getComputedStyle(e).animationName==='none')),true);await page.screenshot({path:'qa/drive-2d-reduced.png'});
  const still=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await still.route('https://fonts.googleapis.com/**',r=>r.abort());await still.route('https://fonts.gstatic.com/**',r=>r.abort());await still.goto(base);assert.ok(await still.locator('.field-truck').isVisible());assert.equal(await still.locator('.scene-motion').evaluateAll(items=>items.every(e=>getComputedStyle(e).animationPlayState==='paused')),true);await still.screenshot({path:'qa/drive-2d-no-script.png'});await still.close();
  assert.deepEqual(errors,[]);console.log('PASS: full-bleed 2D scene, icon-only pause/resume, truck brand, six usable menu links, five separate alternating sections at nine viewport sizes, real main/auxiliary hopper routes, motion/fallbacks, floating theme and unchanged CAD controls.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
