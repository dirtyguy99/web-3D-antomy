import {modules,moduleUrl} from './catalog.js';
export function mountNavigation(current){
 const index=modules.findIndex(m=>m.id===current.id),previous=modules[(index-1+modules.length)%modules.length],next=modules[(index+1)%modules.length];
 document.getElementById('module-tabs').innerHTML=modules.map(m=>`<a class="module-tab ${m.id===current.id?'current':''}" href="${moduleUrl(m.id)}" ${m.id===current.id?'aria-current="page"':''} title="${m.title} · ${m.status}"><span class="tab-number">${m.number}</span><span>${m.title}</span><span class="status-dot ${m.ready?'':'waiting'}" aria-label="${m.status}"></span></a>`).join('');
 document.getElementById('explorer-pager').innerHTML=`<a class="pager-link" href="${moduleUrl(previous.id)}" aria-label="Mục trước: ${previous.title}"><span class="pager-arrow">←</span><span><small>MỤC TRƯỚC</small><strong>${previous.title}</strong></span></a><a class="pager-home" href="./">Home <span>⌂</span></a><a class="pager-link next" href="${moduleUrl(next.id)}" aria-label="Mục tiếp theo: ${next.title}"><span><small>MỤC TIẾP THEO</small><strong>${next.title}</strong></span><span class="pager-arrow">→</span></a>`;
 document.getElementById('assembly-context').innerHTML=current.overview?'<span class="assembly-hint">Chọn một chi tiết trên xe để đi tới cụm tương ứng.</span>':`<a class="overview-link" href="${moduleUrl('tong-quan')}"><span>▧</span> Xem trên toàn xe <span>↗</span></a>`;
 // Show the active route when the horizontal navigation overflows on a phone.
 requestAnimationFrame(()=>{const active=document.querySelector('.module-tab.current');const container=document.getElementById('module-tabs');if(active)container.scrollLeft=Math.max(0,active.offsetLeft-container.offsetLeft-24);});
}
export function componentLink(part){
 const target=modules.find(m=>m.id===part.component);
 return target?`<a class="component-link" href="${moduleUrl(target.id)}" aria-label="Mở trang ${target.title}">Mở ${target.title} ↗</a>`:'';
}
