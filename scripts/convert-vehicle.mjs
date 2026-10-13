import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const mode=process.argv[2]||'chassis';
if(!['chassis','overview'].includes(mode))throw new Error('Usage: node scripts/convert-vehicle.mjs chassis|overview');
const overview=mode==='overview',slug=overview?'tong-quan':'than-xe';
const raw=JSON.parse(fs.readFileSync(`.cache/${overview?'full-vehicle':'than-xe'}-import.json`));
const native=JSON.parse(fs.readFileSync('.cache/full-vehicle-components.json','utf8').replace(/^\uFEFF/,''));
const source=overview?'.cache/Full_09_10_2-all.step':'.cache/Full_09_10_2.step';
const basename=p=>p.split(/[/\\]/).pop();
const partName=c=>basename(c.path).replace(/\.SLDPRT$/i,'');
const normalize=n=>n.replace(/\.SLD(?:ASM|PRT)$/i,'').replace(/-\d+$/,'').replace(/\.STEP$/i,'').toLowerCase();
const isChassis=c=>c.name.includes('/CO SO.STEP-')||/^dau\.STEP$/i.test(partName(c));
const leaves=native.filter(c=>!c.suppressed&&c.documentType===1&&c.box&&(overview||isChassis(c)));
const owners=new Map();
function visit(node,ancestors=[]){const names=[...ancestors,node.name].filter(Boolean);for(const id of node.meshes)owners.set(id,names.map(normalize));for(const child of node.children)visit(child,names)}visit(raw.root);

const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
const assigned=new Map();
const rows=raw.meshes.map((m,id)=>{
 const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
 m.attributes.position.array.forEach((v,i)=>{lo[i%3]=Math.min(lo[i%3],v);hi[i%3]=Math.max(hi[i%3],v);min[i%3]=Math.min(min[i%3],v);max[i%3]=Math.max(max[i%3],v)});
 const candidates=leaves.filter(c=>lo.every((v,i)=>v>=c.box[i]*1000-1&&hi[i]<=c.box[i+3]*1000+1));
 if(!candidates.length)throw new Error(`No native part contains body ${id} (${m.name}); bounds ${JSON.stringify([lo,hi])}`);
 const meshName=normalize(m.name),owner=owners.get(id)||[];
 const score=c=>{
  const segments=c.name.split('/').map(normalize);
  if(meshName&&normalize(partName(c))===meshName)return 1000;
  if(owner.includes(normalize(partName(c))))return 900;
  return segments.reduce((s,name,index)=>owner.includes(name)?Math.max(s,index+1):s,0);
 };
 const best=Math.max(...candidates.map(score));
 const finalists=candidates.filter(c=>score(c)===best);
 const volume=c=>c.box.slice(0,3).reduce((v,x,i)=>v*Math.max(c.box[i+3]-x,1e-9),1);
 finalists.sort((a,b)=>{
  // Coincident copies of the same part can have identical names and bounds in STEP.
  // Distribute their exported bodies without discarding either assembly instance.
  const coincident=partName(a)===partName(b)&&a.box.every((v,i)=>Math.abs(v-b.box[i])<1e-8);
  return coincident?(assigned.get(a.name)||0)-(assigned.get(b.name)||0):volume(a)-volume(b);
 });
 const selected=finalists[0];assigned.set(selected.name,(assigned.get(selected.name)||0)+1);
 return {m,id,native:selected,candidateCount:finalists.length};
});
const counts=new Map();for(const row of rows)counts.set(row.native.name,(counts.get(row.native.name)||0)+1);
const missing=leaves.filter(p=>!counts.has(p.name));
if(missing.length){fs.writeFileSync(`.cache/${slug}-unmapped-parts.json`,JSON.stringify(missing,null,2));throw new Error(`${missing.length} native part instances have no mapped body. Inspect .cache/${slug}-unmapped-parts.json before publishing.`)}
const center=min.map((v,i)=>(v+max[i])/2),chunks=[];let offset=0;
function append(array,Type){const typed=new Type(array),bytes=Buffer.from(typed.buffer);const range={offset,count:typed.length};chunks.push(bytes);offset+=bytes.length;return range;}
function component(c){return isChassis(c)?'than-xe':c.name.startsWith('ban test thung phu-')?'thung-phu':'thung-chinh'}
function classify(c){
 const name=partName(c);
 if(/^dau\.STEP$/i.test(name))return 'cabin';
 if(/11\.00R20/i.test(name))return 'wheels';
 if(/cau_sau/i.test(name))return 'axles';
 if(/nhip|Bat_nhi/i.test(c.name+' '+name))return 'suspension';
 if(/hex bolt/i.test(name))return 'fasteners';
 if(/Dam_chinh|U135x300x16/i.test(name))return 'frame';
 return 'equipment';
}
const words={tam:'tấm',tai:'tai',ban:'bàn',ep:'ép',thanh:'thanh',gia:'gia',cuong:'cường',doc:'dọc',ngang:'ngang',bac:'bạc',lot:'lót',chot:'chốt',co:'cơ',dinh:'định',truot:'trượt',vach:'vách',ngoai:'ngoài',ben:'bên',trai:'trái',phai:'phải',thung:'thùng',sau:'sau',phu:'phụ',xi:'xi',lanh:'lanh',nang:'nâng',ray:'ray',nap:'nắp',con:'con',lan:'lăn',quay:'quay',che:'che',cau:'cấu',ong:'ống',loi:'lõi',treo:'treo',tren:'trên',mang:'máng',luoi:'lưỡi',cao:'cào',san:'sàn',mui:'mui',dau:'dầu',xa:'xả',khung:'khung',nhip:'nhíp'};
function label(c){
 const n=partName(c);
 if(/^dau\.STEP$/i.test(n))return 'Cabin';
 if(/11\.00R20/i.test(n))return 'Bánh xe 11.00R20';
 if(/cau_sau/i.test(n))return 'Cầu sau';
 if(/Dam_chinh_2/i.test(n))return 'Dầm chính 2';
 if(/Dam_chinh/i.test(n))return 'Dầm chính';
 if(/hex bolt/i.test(n))return 'Bu lông ISO 4016';
 if(/^Bat_nhi2/i.test(n))return 'Bát nhíp';
 if(/^U135x300x16/i.test(n))return 'Dầm U135 × 300 × 16';
 const text=n.replace(/\.STEP$/i,'').replace(/_Default_As Machined_$/i,'').replace(/^(Mirror)?\d+_\d+_/,'').replace(/_/g,' ').split(' ').map(w=>words[w.toLowerCase()]||w).join(' ');
 return text.charAt(0).toUpperCase()+text.slice(1);
}
const groups=overview?[
 {id:'than-xe',title:'Thân xe',short:'Thân xe'},
 {id:'thung-chinh',title:'Thùng chính',short:'Thùng chính'},
 {id:'thung-phu',title:'Thùng phụ',short:'Thùng phụ'}
]:[
 {id:'cabin',title:'Cabin & thân vỏ',short:'Cabin'},
 {id:'frame',title:'Dầm & khung gầm',short:'Khung gầm'},
 {id:'axles',title:'Cầu xe',short:'Cầu xe'},
 {id:'suspension',title:'Nhíp & giá liên kết',short:'Hệ nhíp'},
 {id:'wheels',title:'Bánh xe',short:'Bánh xe'},
 {id:'equipment',title:'Phụ kiện khung gầm',short:'Phụ kiện'},
 {id:'fasteners',title:'Bu lông & chi tiết ghép',short:'Chi tiết ghép'}
];
const used=new Map();
const meshes=rows.map(({m,id,native:c},index)=>{
 const name=partName(c),bodyIndex=(used.get(c.name)||0)+1;used.set(c.name,bodyIndex);
 const p=m.attributes.position.array,n=m.attributes.normal.array,pos=[],nor=[],lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
 for(let i=0;i<p.length;i+=3){const v=[(p[i+2]-center[2])/1000,(p[i+1]-center[1])/1000,-(p[i]-center[0])/1000];pos.push(...v);nor.push(n[i+2],n[i+1],-n[i]);v.forEach((x,j)=>{lo[j]=Math.min(lo[j],x);hi[j]=Math.max(hi[j],x)})}
 const bodyCenter=lo.map((v,i)=>(v+hi[i])/2),side=Math.sign(bodyCenter[0])||1,section=classify(c),module=component(c),group=overview?module:section;
 const explode=overview?({'than-xe':[0,-.5,0],'thung-chinh':[0,1.3,0],'thung-phu':[0,.3,-1.45]})[module]:({cabin:[0,.85,.7],frame:[side*.12,.25,0],axles:[0,-.45,0],suspension:[side*.5,-.2,0],wheels:[side*.85,.05,0],equipment:[side*.5,.2,0],fasteners:[side*.3,.35,0]})[section];
 const isShell=section==='cabin'||/01_0[2346]_|tam_vach|4_10_|4_13_/i.test(name);
 return {id:index,originalMeshId:id,name:counts.get(c.name)>1?`${name} / Body ${bodyIndex}`:name,label:label(c)+(counts.get(c.name)>1?` · thân ${bodyIndex}`:''),nativeComponent:c.name,nativePart:basename(c.path),component:module,group,shell:isShell,sourceHidden:c.visibility===0,color:section==='wheels'?0x414842:null,explode,min:lo,max:hi,center:bodyCenter,size:lo.map((v,i)=>(hi[i]-v)*1000),positions:append(pos,Float32Array),normals:append(nor,Float32Array),indices:append(m.index.array,Uint32Array),triangles:m.index.array.length/3};
});
for(const g of groups)g.count=meshes.filter(m=>m.group===g.id).length;
const hidden=overview?meshes.filter(m=>m.sourceHidden).map(m=>m.id):[];
const meta={source:path.basename(source),convertedFrom:'Full_09_10_2.SLDASM',sourceSHA256:crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'),units:'mm',illustrative:false,meshCount:meshes.length,sourcePartCount:leaves.length,uniqueNames:new Set(meshes.map(m=>m.nativePart)).size,triangles:meshes.reduce((s,m)=>s+m.triangles,0),bounds:{min,max,size:[max[2]-min[2],max[1]-min[1],max[0]-min[0]]},groups:groups.filter(g=>g.count),parts:leaves.map(p=>({name:partName(p),instance:p.name,bodyCount:counts.get(p.name),sourceHidden:p.visibility===0})),initialHidden:hidden,meshes};
if(overview)meta.sourceNote='Bản tổng thể dùng vị trí lắp trong Full_09_10_2.SLDASM. Các chi tiết đang ẩn riêng trong nguồn được ẩn lúc mở trang; bấm Hiện lại tất cả để xem đầy đủ. Mục cặp nâng vẫn chờ mô hình riêng.';
fs.mkdirSync('dist/assets/cad',{recursive:true});fs.writeFileSync(`dist/assets/cad/${slug}.json`,JSON.stringify(meta));fs.writeFileSync(`dist/assets/cad/${slug}.bin`,Buffer.concat(chunks));
console.log(JSON.stringify({slug,meshes:meta.meshCount,sourcePartCount:meta.sourcePartCount,triangles:meta.triangles,binaryBytes:offset,size:meta.bounds.size,groups:meta.groups.map(g=>[g.id,g.count]),initiallyHidden:hidden.length},null,2));
