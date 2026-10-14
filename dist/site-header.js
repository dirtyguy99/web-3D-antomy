import {modules,moduleUrl} from './catalog.js';

// Both pages use the same destinations and labels, including the pending lift.
export function mountSiteNavigation(current='home'){
 const nav=document.querySelector('.site-nav');
 if(!nav)return;
 const items=[{id:'home',label:'Home',href:'./'},...modules.map(m=>({id:m.id,label:m.overview?'Tổng quan 3D':m.title,href:moduleUrl(m.id)}))];
 nav.innerHTML=items.map(item=>`<a href="${item.href}" data-module="${item.id}" ${item.id==='home'&&current!=='home'?'class="back-home"':''} ${item.id===current?'aria-current="page"':''}>${item.label}</a>`).join('');
}
