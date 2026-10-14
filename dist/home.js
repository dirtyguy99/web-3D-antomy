import {modules,moduleUrl} from './catalog.js';
import {readTheme,saveTheme} from './theme.js';
document.body.classList.toggle('dark',readTheme());
const readyCount=modules.filter(m=>m.ready).length;
document.querySelector('.collection-count').innerHTML=String(readyCount).padStart(2,'0')+'<span>/ '+String(modules.length).padStart(2,'0')+'</span>'; // taste-skill-ignore: Keep the established real 04/05 model library count.
const track=document.querySelector('.collection-track');track.innerHTML=modules.map(m=>'<span class="'+(m.ready?'complete':'')+'"></span>').join('');track.setAttribute('aria-label',`${readyCount} trong ${modules.length} mục đã có mô hình`);
document.querySelector('.collection-caption').textContent=readyCount===modules.length?'Tất cả các mục đã có mô hình thực tế.':`${readyCount} mục có mô hình thực tế. ${modules.length-readyCount} mục còn lại có bản minh họa 3D.`;
const escapeHtml=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
document.getElementById('module-cards').innerHTML=modules.map((m,index)=>`
 <article id="home-${m.id}" class="module-card module-row ${m.ready?'ready':'pending'} ${index%2?'image-right':'image-left'}" aria-labelledby="heading-${m.id}">
  <a class="card-link" href="${moduleUrl(m.id)}" aria-label="${escapeHtml(m.action+' — '+m.title)}">
   <div class="card-visual">
    <div class="card-image-meta"><span class="card-number">${m.number} /</span><span class="model-origin">${escapeHtml(m.previewLabel)}</span></div>
    <img class="model-image" src="${m.preview}" alt="${escapeHtml((m.ready?'Mô hình thực tế của ':'Hình minh họa 3D của ')+m.title.toLowerCase())}" width="720" height="430" loading="${m.overview?'eager':'lazy'}">
    <span class="visual-corner" aria-hidden="true">↗</span><span class="visual-caption">${escapeHtml(m.subtitle)}</span>
   </div>
   <div class="card-content">
    <div class="card-title-row"><h3 id="heading-${m.id}">${escapeHtml(m.title)}</h3><span class="availability"><span class="status-dot"></span>${escapeHtml(m.status)}</span></div>
    <p class="card-description">${escapeHtml(m.description)}</p>
    <div class="card-tags">${m.tags.map(t=>`<span>${escapeHtml(t)}</span>`).join('')}</div>
    <ul class="card-details">${m.details.map(d=>`<li>${escapeHtml(d)}</li>`).join('')}</ul>
    <div class="card-action"><span>${escapeHtml(m.action)}</span><span class="action-arrow" aria-hidden="true">↗</span></div>
   </div>
  </a>
 </article>`).join('');
const theme=document.getElementById('theme');
theme.setAttribute('aria-label',readTheme()?'Chuyển giao diện sáng':'Chuyển giao diện tối');
theme.onclick=()=>{const dark=document.body.classList.toggle('dark');saveTheme(dark);theme.setAttribute('aria-label',dark?'Chuyển giao diện sáng':'Chuyển giao diện tối');};
