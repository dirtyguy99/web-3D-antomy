const {chromium}=require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://localhost:4173/explorer.html?module=thung-phu');await page.waitForFunction(()=>window.modelExplorer);await page.waitForTimeout(1200);
const state=()=>page.evaluate(()=>window.modelExplorer.getState());
await page.screenshot({path:'qa/final-desktop.png',fullPage:true});
const box=await page.locator('#viewport').boundingBox();await page.mouse.click(box.x+box.width*.51,box.y+box.height*.47);assert.notEqual((await state()).selected,null,'raycast selection');
await page.locator('#isolate').click();assert.equal((await state()).visible,1);await page.waitForTimeout(800);await page.screenshot({path:'qa/final-closeup.png'});
await page.locator('#reset').click();await page.locator('#shell-toggle').click();assert.equal((await state()).visible,118);await page.locator('#show-all').click();assert.equal((await state()).visible,122);
await page.locator('[data-view="side"]').click();assert.equal((await state()).view,'side');await page.locator('[data-view="top"]').click();assert.equal((await state()).view,'top');await page.locator('#reset').click();
await page.locator('#explode').fill('100');await page.locator('#explode').dispatchEvent('input');await page.waitForFunction(()=>window.modelExplorer.getState().explode>.99,{},{timeout:30000});await page.screenshot({path:'qa/final-exploded.png'});
const downloadPromise=page.waitForEvent('download');await page.locator('#capture').click();const download=await downloadPromise;await download.saveAs('qa/export.png');assert.equal(download.suggestedFilename(),'thung-phu-bung-lap-rap.png');
await page.locator('#theme').click();await page.waitForTimeout(500);await page.screenshot({path:'qa/final-dark.png'});
await page.locator('#theme').click();await page.locator('#reset').click();await page.locator('#edges').click();assert.equal((await state()).edges,false);await page.locator('#reset').click();
await page.setViewportSize({width:390,height:844});await page.waitForTimeout(1400);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:'qa/final-mobile.png',fullPage:true});
const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await reduced.goto('http://localhost:4173/explorer.html?module=thung-phu');await reduced.waitForFunction(()=>window.modelExplorer);await reduced.locator('#play').click();await reduced.waitForFunction(()=>window.modelExplorer.getState().explode===1);await reduced.screenshot({path:'qa/final-mobile-exploded.png',fullPage:true});
assert.deepEqual(errors,[]);console.log('PASS: canvas picking, isolation, shell visibility, reset, views, explode completion, PNG download, edges, mobile overflow, reduced motion; no page errors.');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

