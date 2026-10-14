// The Home scene is an inline 2D illustration: no WebGL or model downloads.
const panel=document.getElementById('hero-scene');
const toggle=document.getElementById('scene-toggle');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduced.matches,inView=true,pageActive=true;
const header=document.querySelector('.site-header');
const fit=()=>panel.style.setProperty('--home-header-height',Math.ceil(header.getBoundingClientRect().height)+'px');
fit();
if('ResizeObserver' in window)new ResizeObserver(fit).observe(header);

function sync(){
 const running=!paused&&!reduced.matches&&inView&&!document.hidden&&pageActive;
 panel.classList.toggle('scene-running',running);
 panel.classList.toggle('scene-paused',!running);
 toggle.hidden=reduced.matches;
 toggle.setAttribute('aria-pressed',String(paused));
 toggle.setAttribute('aria-label',paused?'Tiếp tục cảnh xe chuyển động':'Tạm dừng cảnh xe chuyển động');
 toggle.title=paused?'Tiếp tục hoạt cảnh':'Tạm dừng hoạt cảnh';
 toggle.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true">${paused?'<path d="m8 5 11 7-11 7Z" fill="currentColor"/>':'<path d="M8 6v12m8-12v12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>'}</svg>`;
}
toggle.addEventListener('click',()=>{paused=!paused;sync()});
reduced.addEventListener('change',()=>{paused=reduced.matches;sync()});
document.addEventListener('visibilitychange',sync);
if('IntersectionObserver' in window){
 new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync()},{threshold:.05}).observe(panel);
}
addEventListener('pagehide',()=>{pageActive=false;sync()});
addEventListener('pageshow',()=>{pageActive=true;sync()});
// Read-only state for visual QA; animation timing comes from the browser.
window.homeDrive={getState:()=>({ready:true,dimension:'2d',paused,inView,running:panel.classList.contains('scene-running')})};
sync();
