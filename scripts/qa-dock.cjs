const assert=require('node:assert/strict');
let playwright;try{playwright=require('playwright')}catch{playwright=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')}
const fs=require('node:fs');
(async()=>{
 fs.mkdirSync('qa',{recursive:true});
 const browser=await playwright.chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
 page.setDefaultTimeout(90000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base=process.env.TEST_URL||'http://127.0.0.1:4173';
 // Layout and controls must also work with the declared fallback font, offline.
 await page.route('https://fonts.googleapis.com/**',route=>route.abort());
 await page.route('https://fonts.gstatic.com/**',route=>route.abort());
 await page.goto(base+'/explorer.html?module=tong-quan');await page.waitForFunction(()=>window.modelExplorer);
 await page.locator('#viewport').scrollIntoViewIfNeeded();await page.waitForTimeout(900);
 await page.screenshot({path:'qa/dock-initial.png'});
 async function dockGeometry(){
  return page.evaluate(()=>{const dock=document.getElementById('module-tabs'),box=dock.getBoundingClientRect();return{fixed:getComputedStyle(dock).position,center:box.x+box.width/2,bottom:innerHeight-box.bottom,width:box.width,overflow:document.documentElement.scrollWidth>innerWidth,items:[...dock.querySelectorAll('.module-tab')].map(tab=>{const rect=tab.getBoundingClientRect();return{x:rect.left,right:rect.right,y:rect.top,bottom:rect.bottom,w:rect.width,h:rect.height}})}});
 }
 const geometry=await dockGeometry();assert.equal(geometry.fixed,'fixed');assert.ok(Math.abs(geometry.center-720)<1);assert.ok(geometry.bottom>=12&&geometry.bottom<=24);assert.equal(geometry.items.length,5);assert.equal(geometry.overflow,false);
 for(const item of geometry.items){assert.ok(item.w>=44&&item.h>=44);assert.ok(item.x>=0&&item.right<=1440);}
 let range=await page.locator('#explode').boundingBox();assert.ok(range.height>range.width*3);assert.ok(range.x>1440-100);
 await page.locator('#reset').click();await page.waitForTimeout(500);
 range=await page.locator('#explode').boundingBox();
 await page.mouse.move(range.x+range.width/2,range.y+range.height-10);await page.mouse.down();await page.mouse.move(range.x+range.width/2,range.y+10,{steps:12});await page.mouse.up();
 assert.ok(Number(await page.locator('#explode').inputValue())>=98,'Dragging upward must separate the assembly');
 await page.waitForFunction(()=>window.modelExplorer.getState().explode>.97);
 await page.locator('#explode').focus();await page.keyboard.press('End');assert.equal(await page.locator('#explode').inputValue(),'100');await page.keyboard.press('ArrowDown');assert.equal(await page.locator('#explode').inputValue(),'99');await page.keyboard.press('ArrowUp');assert.equal(await page.locator('#explode').inputValue(),'100');await page.keyboard.press('Home');assert.equal(await page.locator('#explode').inputValue(),'0');
 assert.equal(await page.locator('#explode').getAttribute('aria-valuetext'),'0% · Lắp ráp');
 await page.locator('#play').click();await page.waitForFunction(()=>window.modelExplorer.getState().explode>.02);await page.locator('#play').click();assert.equal(await page.locator('#play').getAttribute('aria-pressed'),'false');await page.locator('#reset').click();await page.waitForTimeout(800);
 const before=await page.locator('.dock-lens').evaluate(e=>getComputedStyle(e).transform);
 await page.locator('#viewport').focus();await page.mouse.move(5,5);await page.locator('.module-tab[href*="module=thung-chinh"]').hover();await page.waitForFunction(()=>document.getElementById('module-tabs').classList.contains('dock-previewing'));await page.waitForFunction(previous=>getComputedStyle(document.querySelector('.dock-lens')).transform!==previous,before);await page.mouse.move(5,5);await page.waitForTimeout(550);
 await page.screenshot({path:'qa/dock-desktop-light.png'});
 await page.locator('#theme').scrollIntoViewIfNeeded();await page.locator('#theme').click();await page.waitForFunction(()=>document.body.classList.contains('dark'));await page.waitForFunction(()=>!document.documentElement.classList.contains('glass-theme-transition'));await page.locator('#viewport').scrollIntoViewIfNeeded();await page.waitForTimeout(500);await page.screenshot({path:'qa/dock-desktop-dark.png'});
 console.log('PASS desktop: centered fixed dock, five targets, right vertical slider, native drag/keyboard, play/stop, liquid lens hover, light/dark.');
 for(const width of [768,390,320]){
  await page.setViewportSize({width,height:844});await page.locator('#viewport').scrollIntoViewIfNeeded();await page.waitForTimeout(500);
  const mobile=await dockGeometry();assert.equal(mobile.overflow,false);assert.ok(Math.abs(mobile.center-width/2)<1);
  for(const item of mobile.items){assert.ok(item.x>=0&&item.right<=width);assert.ok(item.w>=44&&item.h>=44);}
  assert.equal(await page.locator('#explode-panel').isVisible(),true,`Slider must be reachable while viewing 3D at ${width}px`);
  const panel=await page.locator('#explode-panel').boundingBox(),dock=await page.locator('#module-tabs').boundingBox(),model=await page.locator('#viewport').boundingBox();assert.ok(panel.x+panel.width<=width);assert.ok(panel.y+panel.height<dock.y);assert.ok(model.x+model.width<=panel.x,'The model must have its own space beside the slider');
  const vertical=await page.locator('#explode').boundingBox();await page.mouse.click(vertical.x+vertical.width/2,vertical.y+vertical.height*.45);assert.ok(Number(await page.locator('#explode').inputValue())>35);await page.locator('#reset').click();await page.waitForTimeout(500);await page.screenshot({path:`qa/dock-${width}.png`});
 }
 await page.locator('.module-tab[href*="module=thung-phu"]').click();await page.waitForFunction(()=>window.modelExplorer?.getState().meshCount===122);assert.equal(await page.locator('.module-tab[aria-current="page"]').count(),1);assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('dark')),true);
 const aligned=await page.evaluate(()=>{const tab=document.querySelector('.module-tab.current'),lens=document.querySelector('.dock-lens');return Math.abs(tab.getBoundingClientRect().left-lens.getBoundingClientRect().left)});assert.ok(aligned<2);
 console.log('PASS responsive: 768/390/320px, no overflow or dock overlap, all five targets, real mobile slider input, native route and theme persistence.');
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/explorer.html?module=thung-phu');await page.waitForFunction(()=>window.modelExplorer);await page.locator('#viewport').scrollIntoViewIfNeeded();await page.locator('#play').click();await page.waitForFunction(()=>window.modelExplorer.getState().explode===1);await page.locator('#reset').click();await page.waitForFunction(()=>window.modelExplorer.getState().explode===0);
 await page.goto(base+'/explorer.html?module=thung-phu&preview=1');await page.waitForFunction(()=>window.modelExplorer);assert.equal(await page.locator('#module-tabs').isVisible(),false);assert.equal(await page.locator('#explode-panel').isVisible(),false);assert.equal(await page.locator('#viewport').evaluate(e=>e.clientHeight),844);assert.equal(await page.locator('#viewport').evaluate(e=>e.clientWidth),320);
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS reduced motion and clean thumbnail preview; no page errors.');
})().catch(e=>{console.error(e);process.exit(1)});
