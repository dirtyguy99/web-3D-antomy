const assert=require('node:assert/strict');
let playwright;try{playwright=require('playwright')}catch{playwright=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')}
const fs=require('fs');
(async()=>{
fs.mkdirSync('qa',{recursive:true});
const browser=await playwright.chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1050},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const base=process.env.TEST_URL||'http://localhost:4173';await page.goto(base);await page.waitForFunction(()=>document.querySelectorAll('.module-card').length===5);
assert.equal(await page.locator('.module-card.ready').count(),2);assert.equal(await page.locator('.module-card.pending').count(),3);
assert.equal(await page.locator('img').evaluateAll(images=>images.every(i=>i.complete&&i.naturalWidth>0)),true,'All five 3D thumbnails must load');
const actualModels=new Set(['thung-phu','thung-chinh']);
for(const [id,count] of [['tong-quan',333],['thung-phu',122],['thung-chinh',74],['than-xe',93],['cap-nang',44]]){
 await page.locator(`a.card-link[href*="module=${id}"]`).click();await page.waitForFunction(()=>window.modelExplorer);assert.equal(await page.evaluate(()=>window.modelExplorer.getState().meshCount),count);assert.equal(await page.locator('#module-switch').inputValue(),id);
 assert.equal(await page.locator('#pending-notice').isVisible(),!actualModels.has(id));
 if(!actualModels.has(id))assert.equal(await page.locator('#stat-size').textContent(),'Chờ dữ liệu CAD');
 if(id==='thung-chinh'){assert.equal(await page.locator('#source-note').isVisible(),true);assert.match(await page.locator('#source-note').textContent(),/Trụ bàn xả/);assert.equal(await page.locator('#source-file').textContent(),'THUNG CHINH.step');}
 await page.locator('.group-select').first().click();await page.locator('[data-part]').first().click();assert.notEqual(await page.evaluate(()=>window.modelExplorer.getState().selected),null);await page.locator('#isolate').click();assert.equal(await page.evaluate(()=>window.modelExplorer.getState().visible),1);
 await page.locator('#reset').click();await page.locator('#explode').fill('100');await page.locator('#explode').dispatchEvent('input');await page.waitForFunction(()=>window.modelExplorer.getState().explode===1);
 await page.screenshot({path:`qa/${id}-desktop.png`,fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,id+' mobile overflow');
 await page.screenshot({path:`qa/${id}-mobile.png`,fullPage:true});
 await page.locator('.back-home').click();await page.waitForFunction(()=>document.querySelectorAll('.module-card').length===5);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Home mobile overflow');await page.setViewportSize({width:1440,height:1050});
}
await page.goto(base+'/explorer.html?module=thung-phu');await page.waitForFunction(()=>window.modelExplorer);await page.locator('#module-switch').selectOption('cap-nang');await page.waitForURL('**module=cap-nang');await page.waitForFunction(()=>window.modelExplorer);assert.equal(await page.locator('#module-title').textContent(),'Cặp nâng thùng rác.');
await page.goto(base);await page.waitForFunction(()=>document.querySelectorAll('.module-card').length===5);await page.locator('#theme').click();assert.equal(await page.locator('body').evaluate(b=>b.classList.contains('dark')),true);await page.screenshot({path:'qa/home-dark.png',fullPage:true});
assert.deepEqual(errors,[]);await browser.close();console.log('PASS: Home cards, thumbnails, all five routes, actual/pending labels, selection, isolate, reset, explode, Home links, module switch, dark theme, phone overflow; no browser errors.');
})().catch(e=>{console.error(e);process.exit(1)});
