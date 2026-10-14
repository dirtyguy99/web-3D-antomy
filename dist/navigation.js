import {modules,moduleUrl} from './catalog.js';
import {mountExplorerDock} from './explorer-dock.js';
import {mountSiteNavigation} from './site-header.js';
const dockIcons={
 'tong-quan':'<path d="M3 15V8h12v7m0-5h4l3 4v3h-3M3 17h2m4 0h6"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
 'thung-phu':'<path d="M5 4h11l3 4v11H5Zm0 0 3 4h11M8 8v11m0-6h6m-6 3h8"/>',
 'thung-chinh':'<path d="m4 7 8-4 8 4v10l-8 4-8-4Zm0 0 8 4 8-4M12 11v10"/>',
 'than-xe':'<path d="M3 15V8h6l3 6h9v3h-3m-7 0H8m-5 0h1M9 8v6H3"/><circle cx="6" cy="17" r="2"/><circle cx="16" cy="17" r="2"/>',
 'cap-nang':'<path d="M5 20V8l4-4m10 16V8l-4-4M5 12l4 3h6l4-3M9 15v5m6-5v5"/><circle cx="5" cy="8" r="1.5"/><circle cx="19" cy="8" r="1.5"/>'
};
const dockLabels={'tong-quan':'Toàn xe','cap-nang':'Cặp nâng'};
export function mountNavigation(current){
 mountSiteNavigation(current.id);
 const index=modules.findIndex(m=>m.id===current.id),previous=modules[(index-1+modules.length)%modules.length],next=modules[(index+1)%modules.length];
 document.getElementById('module-tabs').innerHTML='<span class="dock-lens" aria-hidden="true"></span>'+modules.map(m=>`<a class="module-tab ${m.id===current.id?'current':''}" href="${moduleUrl(m.id)}" ${m.id===current.id?'aria-current="page"':''} aria-label="${m.title} · ${m.status}" title="${m.title} · ${m.status}"><svg class="dock-icon" viewBox="0 0 24 24" aria-hidden="true">${dockIcons[m.id]}</svg><span class="dock-label">${dockLabels[m.id]||m.title}</span></a>`).join('');
 document.getElementById('explorer-pager').innerHTML=`<a class="pager-link" href="${moduleUrl(previous.id)}" aria-label="Mục trước: ${previous.title}"><span class="pager-arrow">←</span><span><small>MỤC TRƯỚC</small><strong>${previous.title}</strong></span></a><a class="pager-home" href="./">Home <span>⌂</span></a><a class="pager-link next" href="${moduleUrl(next.id)}" aria-label="Mục tiếp theo: ${next.title}"><span><small>MỤC TIẾP THEO</small><strong>${next.title}</strong></span><span class="pager-arrow">→</span></a>`;
 document.getElementById('assembly-context').innerHTML=current.overview?'<span class="assembly-hint">Chọn một chi tiết trên xe để đi tới cụm tương ứng.</span>':`<a class="overview-link" href="${moduleUrl('tong-quan')}"><span>▧</span> Xem trên toàn xe <span>↗</span></a>`;
 mountExplorerDock();
}
export function componentLink(part){
 const target=modules.find(m=>m.id===part.component);
 return target?`<a class="component-link" href="${moduleUrl(target.id)}" aria-label="Mở trang ${target.title}">Mở ${target.title} ↗</a>`:'';
}
