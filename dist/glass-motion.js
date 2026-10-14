// Small, compositor-friendly motion for the existing Liquid Glass interface.
// All content is visible before this module runs. Navigation remains native.
function initGlassMotion(){
 if(document.body.classList.contains('preview'))return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const precise=matchMedia('(hover: hover) and (pointer: fine)');
 const easing='cubic-bezier(.22,1,.36,1)';
 const running=new Set();
 function animate(element,frames,options={}){
  if(reduced.matches||!element?.isConnected||typeof element.animate!=='function')return;
  const animation=element.animate(frames,{duration:620,easing,...options});
  running.add(animation);animation.finished.catch(()=>{}).finally(()=>running.delete(animation));
  return animation;
 }
 const surfaces=[...document.querySelectorAll('.collection-note,.module-card,.module-tabs,.workbench,.explode-rail')];
 for(const surface of surfaces){
  surface.classList.add('glass-reflective');
  const sheen=document.createElement('span');sheen.className='glass-sheen';sheen.setAttribute('aria-hidden','true');
  const light=document.createElement('span');light.className='glass-sheen-light';sheen.append(light);surface.append(sheen);
  let frame=0,x=0,y=0;
  function move(event){
   if(reduced.matches||!precise.matches||event.pointerType==='touch')return;
   const box=surface.getBoundingClientRect();x=event.clientX-box.left;y=event.clientY-box.top;
   surface.classList.add('glass-hover');
   if(!frame)frame=requestAnimationFrame(()=>{frame=0;light.style.transform='translate3d('+x+'px,'+y+'px,0)';});
  }
  surface.addEventListener('pointermove',move,{passive:true});
  surface.addEventListener('pointerleave',()=>surface.classList.remove('glass-hover'),{passive:true});
 }

 // Entrances vary with the content, once per visit and only once visible.
 const seen=new WeakSet();
 const entrances=[...document.querySelectorAll('.hero-copy h1,.hero-copy>p,.hero-link,.collection-note,.catalog-heading,.module-card,.home-how,.intro>div,.assembly-context,.pending-notice,.workbench,.technical,.explorer-pager')];
 function enter(element,index){
  if(seen.has(element))return;seen.add(element);
  if(element.matches('.module-card')){
   animate(element,[{opacity:.35,transform:'translateY(24px)'},{opacity:1,transform:'translateY(0)'}],{duration:760,delay:index%2*70});
   const image=element.querySelector('.model-image');
   if(image)animate(image,[{transform:'scale(1.035)'},{transform:'scale(1)'}],{duration:1100,delay:60});
  }else if(element.matches('.collection-note,.workbench')){
   animate(element,[{opacity:.4,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:800});
  }else{
   animate(element,[{opacity:.3,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:600,delay:index%3*60});
  }
 }
 let observer;
 if('IntersectionObserver' in window){
  observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){enter(entry.target,entrances.indexOf(entry.target));observer.unobserve(entry.target);}}, {threshold:.12});
  entrances.forEach(element=>observer.observe(element));
 }

 // A short optical pulse for taps; no pointer capture or delayed click handling.
 document.addEventListener('pointerdown',event=>{
  if(reduced.matches||event.button!==0)return;
  const target=event.target.closest('button,.module-card,.overview-link,.pager-home,.module-tab,.hero-link,.component-link');
  if(!target||target.disabled)return;
  target.classList.add('glass-press-target');
  const bounds=target.getBoundingClientRect();
  const layer=document.createElement('span');layer.className='glass-ripple-bound';layer.setAttribute('aria-hidden','true');
  const ripple=document.createElement('span');ripple.className='glass-ripple';
  ripple.style.left=(event.clientX-bounds.left-40)+'px';ripple.style.top=(event.clientY-bounds.top-40)+'px';
  layer.append(ripple);target.append(layer);
  const animation=animate(ripple,[{opacity:.65,transform:'scale(.15)'},{opacity:0,transform:'scale(3.2)'}],{duration:500});
  if(animation)animation.finished.catch(()=>{}).finally(()=>layer.remove());else layer.remove();
 },{passive:true});

 // Selection details settle into place without moving the canvas or the tree.
 const selection=document.getElementById('selection');
 let selectionObserver;
 if(selection){
  selectionObserver=new MutationObserver(()=>animate(selection,[{opacity:.55,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:260}));
  selectionObserver.observe(selection,{childList:true});
 }

 // Native snapshot transition makes the light/dark switch a smooth glass reveal.
 const theme=document.getElementById('theme');
 if(theme&&typeof theme.onclick==='function'){
  const changeTheme=theme.onclick;
  theme.onclick=function(event){
   if(reduced.matches||typeof document.startViewTransition!=='function')return changeTheme.call(this,event);
   if(document.documentElement.classList.contains('glass-theme-transition'))return changeTheme.call(this,event);
   const box=this.getBoundingClientRect(),x=box.left+box.width/2,y=box.top+box.height/2;
   const radius=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
   document.documentElement.classList.add('glass-theme-transition');
   let changed=false,transition;
   const update=()=>{changed=true;changeTheme.call(this,event);};
   try{transition=document.startViewTransition(update)}catch{
    document.documentElement.classList.remove('glass-theme-transition');if(!changed)update();return;
   }
   transition.ready.then(()=>animate(document.documentElement,[{clipPath:'circle(0px at '+x+'px '+y+'px)'},{clipPath:'circle('+radius+'px at '+x+'px '+y+'px)'}],{duration:520,easing,pseudoElement:'::view-transition-new(root)'})).catch(()=>{});
   transition.finished.catch(()=>{}).finally(()=>document.documentElement.classList.remove('glass-theme-transition'));
  };
 }
 reduced.addEventListener('change',()=>{
  if(reduced.matches){for(const animation of running)animation.cancel();for(const surface of surfaces)surface.classList.remove('glass-hover');}
 });
 // Settled pages restored from the back-forward cache need no second entrance.
 addEventListener('pagehide',()=>{for(const animation of running)animation.cancel();for(const surface of surfaces)surface.classList.remove('glass-hover');});
 document.documentElement.classList.add('glass-motion-ready');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initGlassMotion,{once:true});else initGlassMotion();
