// Native links keep their normal behavior; the glass lens follows hover/focus and the current route.
export function mountExplorerDock(){
 if(document.body.classList.contains('preview'))return;
 const dock=document.getElementById('module-tabs'),tabs=[...dock.querySelectorAll('.module-tab')];
 const active=dock.querySelector('.current'),rail=document.getElementById('explode-panel'),viewport=document.getElementById('viewport');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),precise=matchMedia('(hover: hover) and (pointer: fine)'),phone=matchMedia('(max-width:800px)');
 let hovered=null,frame=0;
 function lens(tab=active){
  dock.style.setProperty('--dock-left',tab.offsetLeft+'px');
  dock.style.setProperty('--dock-width',tab.offsetWidth+'px');
 }
 let previous=-1;
 try{previous=Number(sessionStorage.getItem('model-dock-from')??-1);sessionStorage.removeItem('model-dock-from')}catch{}
 lens(!reduced.matches&&tabs[previous]?tabs[previous]:active);
 dock.classList.add('dock-lens-ready');
 if(previous>=0&&!reduced.matches){dock.getBoundingClientRect();requestAnimationFrame(()=>requestAnimationFrame(()=>lens()))}
 tabs.forEach(tab=>{
  tab.addEventListener('pointerenter',()=>{if(!precise.matches||reduced.matches)return;hovered=tab;dock.classList.toggle('dock-previewing',tab!==active);lens(tab)});
  tab.addEventListener('focus',()=>{dock.classList.toggle('dock-previewing',tab!==active);lens(tab)});
  tab.addEventListener('click',event=>{
   if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   try{sessionStorage.setItem('model-dock-from',String(tabs.indexOf(active)))}catch{}
   lens(tab);
  });
 });
 function settle(){hovered=null;dock.classList.remove('dock-previewing');lens()}
 dock.addEventListener('pointerleave',settle);
 dock.addEventListener('focusout',event=>{if(!dock.contains(event.relatedTarget))settle()});
 function placeRail(){
  frame=0;const rect=viewport.getBoundingClientRect(),dockRect=dock.getBoundingClientRect();
  if(!phone.matches){rail.style.removeProperty('top');rail.classList.toggle('rail-off',rect.bottom<80||rect.top>innerHeight-80);return}
  // On phones, only occupy the visible model area below its view buttons and above the dock.
  const top=Math.max(12,rect.top+105),bottom=Math.min(rect.bottom-28,dockRect.top-14),height=rail.getBoundingClientRect().height;
  const room=bottom-top>=height;
  rail.classList.toggle('rail-off',!room);
  if(room)rail.style.top=(top+bottom)/2+'px';
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(placeRail)}
 new ResizeObserver(()=>{lens(hovered||active);schedule()}).observe(dock);
 new ResizeObserver(schedule).observe(viewport);
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});
 window.visualViewport?.addEventListener('resize',schedule,{passive:true});phone.addEventListener('change',schedule);
 addEventListener('pageshow',()=>{settle();schedule()});
 reduced.addEventListener('change',()=>{settle();schedule()});
 schedule();
}
