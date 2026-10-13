const {chromium}=require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs');
(async()=>{
fs.mkdirSync('qa',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1200},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text())});
await page.goto('http://localhost:4173',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.modelExplorer,{timeout:60000});await page.waitForTimeout(1600);
console.log('INITIAL',await page.evaluate(()=>window.modelExplorer.getState()));await page.screenshot({path:'qa/desktop.png',fullPage:true});
await page.locator('#shell-toggle').click();console.log('HIDE SHELL',await page.evaluate(()=>window.modelExplorer.getState()));await page.waitForTimeout(400);await page.screenshot({path:'qa/inside.png'});
await page.locator('[data-group="press"]').click();await page.locator('[data-part="4"]').click();console.log('SELECT',await page.evaluate(()=>window.modelExplorer.getState()));
await page.locator('#isolate').click();await page.waitForTimeout(1200);console.log('ISOLATE',await page.evaluate(()=>window.modelExplorer.getState()));await page.screenshot({path:'qa/isolated.png'});
await page.locator('#reset').click();await page.locator('#explode').fill('100');await page.locator('#explode').dispatchEvent('input');await page.waitForTimeout(1600);console.log('EXPLODED',await page.evaluate(()=>window.modelExplorer.getState()));await page.screenshot({path:'qa/exploded.png'});
await page.locator('#theme').click();await page.waitForTimeout(400);await page.screenshot({path:'qa/dark.png'});
await page.locator('#theme').click();await page.locator('#reset').click();await page.locator('#search').fill('xi lanh');console.log('SEARCH',await page.locator('[data-part]').count());await page.locator('#search').fill('zzzzz');console.log('EMPTY',await page.locator('.empty').textContent());await page.locator('#reset').click();
await page.setViewportSize({width:390,height:844});await page.waitForTimeout(1200);await page.screenshot({path:'qa/mobile.png',fullPage:true});console.log('MOBILE OVERFLOW',await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth));
console.log('ERRORS',JSON.stringify(errors));await browser.close();if(errors.length)process.exitCode=1;
})();
