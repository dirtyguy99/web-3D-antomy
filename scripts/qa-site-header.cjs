const assert=require('node:assert/strict'),fs=require('node:fs');
let playwright;try{playwright=require('playwright')}catch{playwright=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')}
(async()=>{
 fs.mkdirSync('qa',{recursive:true});
 const browser=await playwright.chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
  page.setDefaultTimeout(90000);page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.route('https://fonts.gstatic.com/**',r=>r.abort());
  const base=process.env.TEST_URL||'http://127.0.0.1:4173',labels=['Home','Tổng quan 3D','Thùng phụ','Thùng chính','Thân xe','Cặp nâng thùng rác'];
  async function checkHeader(active){
   assert.deepEqual(await page.locator('.site-nav a').allTextContents(),labels);
   assert.equal(await page.locator('.site-nav [aria-current="page"]').count(),1);assert.equal(await page.locator('.site-nav [aria-current="page"]').getAttribute('data-module'),active);
   assert.equal(await page.locator('.brand svg').getAttribute('data-logo'),'garbage-truck');assert.equal(await page.locator('.brand svg circle').count(),2);
   for(const width of [1440,1100,768,390,320]){
    await page.setViewportSize({width,height:1000});await page.waitForTimeout(100);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
    const targets=await page.locator('.site-nav a').evaluateAll(items=>items.map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}}));
    for(let i=0;i<targets.length;i++){
     const r=targets[i];assert.ok(r.x>=0&&r.x+r.w<=width&&r.w>=44&&r.h>=44,'Each menu target must be on-screen and usable');
     for(const s of targets.slice(i+1))assert.equal(r.x<s.x+s.w&&r.x+r.w>s.x&&r.y<s.y+s.h&&r.y+r.h>s.y,false,'Menu targets must not overlap');
    }
    await page.screenshot({path:`qa/header-${active}-${width}.png`});
   }
  }
  await page.goto(base);await page.waitForFunction(()=>document.querySelectorAll('.module-card').length===5);await checkHeader('home');
  await page.locator('.site-nav a[data-module="than-xe"]').click();await page.waitForFunction(()=>window.modelExplorer);assert.equal(await page.evaluate(()=>window.modelExplorer.getState().meshCount),211);await checkHeader('than-xe');
  assert.equal(await page.locator('#module-switch').count(),0);
  await page.locator('#theme').click();assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('dark')),true);
  await page.locator('.site-nav a[data-module="cap-nang"]').click();await page.waitForFunction(()=>window.modelExplorer);assert.equal(await page.evaluate(()=>window.modelExplorer.getState().meshCount),44);assert.equal(await page.locator('#pending-notice').isVisible(),true);await checkHeader('cap-nang');
  assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('dark')),true);
  await page.locator('.site-nav a[data-module="thung-phu"]').focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>window.modelExplorer);assert.equal(await page.evaluate(()=>window.modelExplorer.getState().meshCount),122);assert.equal(await page.locator('.site-nav [aria-current="page"]').getAttribute('data-module'),'thung-phu');
  assert.equal(await page.locator('.module-tab.current').getAttribute('href'),'./explorer.html?module=thung-phu');
  await page.locator('.back-home').click();await page.waitForFunction(()=>window.homeDrive);assert.equal(await page.locator('.site-nav [aria-current="page"]').getAttribute('data-module'),'home');
  assert.deepEqual(errors,[]);console.log('PASS: shared six-link menu and truck logo at five widths, no target overlap/overflow, active route, actual chassis route, honest pending lift, keyboard navigation, Home return, preserved theme and bottom dock.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
