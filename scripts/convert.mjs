import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const raw=JSON.parse(fs.readFileSync('.cache/import.json','utf8'));
const groups=[
 {id:'shell',title:'Vỏ & máng thùng',short:'Vỏ thùng',description:'Các tấm vách bên, tấm che và máng thùng tạo nên hình dạng bao ngoài của cụm thùng phụ.'},
 {id:'frame',title:'Khung gia cường',short:'Khung',description:'Hệ thanh gia cường, thanh ngang và tai treo liên kết các vùng kết cấu của thùng.'},
 {id:'press',title:'Cụm bàn ép',short:'Bàn ép',description:'Cụm Assem1 gồm tấm bàn ép, các thanh gia cường, tai, chốt, bạc lót và bàn trượt.'},
 {id:'scraper',title:'Cụm bàn cào',short:'Bàn cào',description:'Cụm Assem2 gồm tấm che lưỡi cào và các tai bàn cào. Chọn từng chi tiết để xem hình dạng thực tế.'},
 {id:'hydraulic',title:'Hệ xi lanh',short:'Xi lanh',description:'Các ống và lõi xi lanh có trong bản lắp. Trang này thể hiện hình học tại tư thế xuất STEP; chưa mô phỏng hành trình làm việc.'},
 {id:'lid',title:'Nắp & cơ cấu quay',short:'Nắp thùng',description:'Nắp thùng sau, thanh quay, con lăn và các chi tiết dẫn hướng liên quan.'},
 {id:'rails',title:'Ray & thanh trượt',short:'Ray trượt',description:'Các ray và thanh trượt nằm dọc hai bên thùng, thể hiện đúng vị trí trong mô hình nguồn.'}
];
const classify=n=>/^3_/.test(n)?'press':/^1_/.test(n)?'scraper':/xi_lanh/.test(n)?'hydraulic':/4_02_/.test(n)?'rails':/4_0[67]_/.test(n)?'lid':/tam_vach|4_10_|4_13_/.test(n)?'shell':'frame';
const words={tam:'tấm',tai:'tai',ban:'bàn',ep:'ép',thanh:'thanh',gia:'gia',cuong:'cường',doc:'dọc',ngang:'ngang',bac:'bạc',lot:'lót',chot:'chốt',co:'cố',dinh:'định',truot:'trượt',vach:'vách',ngoai:'ngoài',ben:'bên',trai:'trái',phai:'phải',thung:'thùng',sau:'sau',phu:'phụ',chan:'chắn',duong:'đường',rac:'rác',xi:'xi',lanh:'lanh',nang:'nâng',ray:'ray',nap:'nắp',con:'con',lan:'lăn',quay:'quay',che:'che',cau:'cấu',ong:'ống',loi:'lõi',treo:'treo',tren:'trên',mang:'máng',luoi:'lưỡi',cao:'cào',GC:'gia cường'};
const label=n=>{let mirror=n.startsWith('Mirror');let tokens=n.replace(/^Mirror/,'').replace(/^\d+_\d+_/,'').split('_');let v=tokens.map(t=>words[t]||t).join(' ');v=v.replace('cố cấu','cơ cấu');return v.charAt(0).toUpperCase()+v.slice(1)+(mirror?' · đối xứng':'')};
const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
for(const m of raw.meshes)m.attributes.position.array.forEach((v,i)=>{min[i%3]=Math.min(min[i%3],v);max[i%3]=Math.max(max[i%3],v)});
const center=min.map((v,i)=>(v+max[i])/2),chunks=[];let offset=0;
function append(array,Type){const a=new Type(array);const b=Buffer.from(a.buffer);const range={offset,count:a.length};chunks.push(b);offset+=b.length;return range;}
const meshes=raw.meshes.map((m,id)=>{
 const p=m.attributes.position.array,n=m.attributes.normal.array;const pos=[],nor=[],lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
 for(let k=0;k<p.length;k+=3){const v=[(p[k+2]-center[2])/1000,(p[k+1]-center[1])/1000,-(p[k]-center[0])/1000];pos.push(...v);nor.push(n[k+2],n[k+1],-n[k]);v.forEach((x,j)=>{lo[j]=Math.min(lo[j],x);hi[j]=Math.max(hi[j],x)})}
 return {id,name:m.name,label:label(m.name),group:classify(m.name),min:lo,max:hi,center:lo.map((v,i)=>(v+hi[i])/2),size:lo.map((v,i)=>(hi[i]-v)*1000),positions:append(pos,Float32Array),normals:append(nor,Float32Array),indices:append(m.index.array,Uint32Array),triangles:m.index.array.length/3};
});
for(const g of groups)g.count=meshes.filter(m=>m.group===g.id).length;
const meta={source:'ban test thung phu.STEP',sourceSHA256:crypto.createHash('sha256').update(fs.readFileSync('../ban test thung phu.STEP')).digest('hex'),units:'mm',meshCount:meshes.length,uniqueNames:new Set(meshes.map(m=>m.name)).size,triangles:meshes.reduce((s,m)=>s+m.triangles,0),bounds:{min,max,size:[max[2]-min[2],max[1]-min[1],max[0]-min[0]]},groups,meshes};
fs.mkdirSync('dist/vendor',{recursive:true});fs.mkdirSync('dist/assets',{recursive:true});
fs.writeFileSync('dist/assets/model.bin',Buffer.concat(chunks));fs.writeFileSync('dist/assets/model.json',JSON.stringify(meta));
for(const name of ['three.module.js','three.core.js'])fs.copyFileSync(path.join('node_modules/three/build',name),path.join('dist/vendor',name));
fs.copyFileSync('node_modules/three/examples/jsm/controls/OrbitControls.js','dist/vendor/OrbitControls.js');
fs.copyFileSync('node_modules/three/LICENSE','dist/vendor/THREE-LICENSE.txt');
console.log(JSON.stringify({count:meta.meshCount,unique:meta.uniqueNames,triangles:meta.triangles,size:meta.bounds.size,bytes:offset,groups:groups.map(g=>[g.id,g.count])},null,2));
