import fs from 'node:fs';
import crypto from 'node:crypto';
const raw=JSON.parse(fs.readFileSync('.cache/thung-chinh-import.json','utf8'));
const native=JSON.parse(fs.readFileSync('.cache/thung-chinh-components.json','utf8').replace(/^\uFEFF/,''));
const source=process.argv[2]||'.cache/THUNG CHINH.step';
const owners=new Map();function visit(node){for(const id of node.meshes)owners.set(id,node.name);node.children.forEach(visit)}visit(raw.root);
const basename=p=>p.split(/[/\\]/).pop();
const partName=c=>basename(c.path).replace(/\.SLDPRT$/i,'');
const leafParts=native.filter(c=>!c.suppressed&&c.documentType===1&&c.box);
const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
raw.meshes.forEach(m=>m.attributes.position.array.forEach((v,i)=>{min[i%3]=Math.min(min[i%3],v);max[i%3]=Math.max(max[i%3],v)}));
const center=min.map((v,i)=>(v+max[i])/2);
const partFor=raw.meshes.map((mesh,id)=>{
 const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];mesh.attributes.position.array.forEach((v,i)=>{lo[i%3]=Math.min(lo[i%3],v);hi[i%3]=Math.max(hi[i%3],v)});
 const owner=owners.get(id);
 let candidates=leafParts.filter(c=>c.name.split('/')[0].replace(/-\d+$/,'')===owner||partName(c)===owner);
 if(!candidates.length)candidates=leafParts;
 candidates=candidates.filter(c=>lo.every((v,i)=>v>=c.box[i]*1000-1&&hi[i]<=c.box[i+3]*1000+1));
 const named=candidates.filter(c=>partName(c)===mesh.name);if(named.length)candidates=named;
 candidates.sort((a,b)=>a.box.slice(0,3).reduce((v,x,i)=>v*(a.box[i+3]-x),1)-b.box.slice(0,3).reduce((v,x,i)=>v*(b.box[i+3]-x),1));
 if(!candidates.length)throw new Error(`No native part matched STEP body ${id} (${owner}).`);
 return candidates[0];
});
const labels=[[/01_01_/,'Khung thùng'],[/01_02_/,'Vách sàn'],[/01_03_.*trai/i,'Vách hông trái'],[/01_03_.*phai/i,'Vách hông phải'],[/01_04_/,'Vách mui'],[/01_05_/,'Thanh trượt'],[/01_06_/,'Vách đầu'],[/01_07_/,'Cầu thang'],[/01_08_/,'Thùng dầu'],[/01_09_/,'Trụ bàn xả'],[/02_01_/,'Bàn xả'],[/03_/,'Khung phụ']];
const labelFor=n=>labels.find(([pattern])=>pattern.test(n))?.[1]||n.replace(/\.STEP$/i,'');
const classify=n=>/01_01_/.test(n)?'frame':/01_0[2346]_/.test(n)?'shell':/01_05_/.test(n)?'rails':/02_01_/.test(n)?'press':/03_/.test(n)?'base':'equipment';
const groups=[{id:'shell',title:'Vách, sàn & mui',short:'Vỏ thùng'},{id:'frame',title:'Khung thùng',short:'Khung thùng'},{id:'press',title:'Cụm bàn xả',short:'Bàn xả'},{id:'rails',title:'Thanh trượt',short:'Thanh trượt'},{id:'base',title:'Khung phụ',short:'Khung phụ'},{id:'equipment',title:'Cầu thang & thùng dầu',short:'Phụ kiện'}];
const partCounts=new Map();partFor.forEach(p=>partCounts.set(p.name,(partCounts.get(p.name)||0)+1));
const used=new Map(),chunks=[];let offset=0;
function append(array,Type){const data=new Type(array),bytes=Buffer.from(data.buffer);const range={offset,count:data.length};chunks.push(bytes);offset+=bytes.length;return range;}
const meshes=raw.meshes.map((m,id)=>{
 const nativePart=partFor[id],name=partName(nativePart),bodyIndex=(used.get(nativePart.name)||0)+1;used.set(nativePart.name,bodyIndex);
 const p=m.attributes.position.array,n=m.attributes.normal.array,pos=[],nor=[],lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
 for(let k=0;k<p.length;k+=3){const v=[(p[k+2]-center[2])/1000,(p[k+1]-center[1])/1000,-(p[k]-center[0])/1000];pos.push(...v);nor.push(n[k+2],n[k+1],-n[k]);v.forEach((x,i)=>{lo[i]=Math.min(lo[i],x);hi[i]=Math.max(hi[i],x)})}
 const group=classify(name),bodyCenter=lo.map((v,i)=>(v+hi[i])/2),side=Math.sign(bodyCenter[0])||1;
 const explode=group==='shell'?(/01_03_/.test(name)?[side*.8,0,0]:/01_04_/.test(name)?[0,.75,0]:/01_02_/.test(name)?[0,-.45,0]:[0,0,.7]):group==='frame'?[0,.45,0]:group==='press'?[0,.2,-1.0]:group==='rails'?[side*.55,.1,0]:group==='base'?[0,-.65,0]:[side*.55,.1,.7];
 return {id,name:partCounts.get(nativePart.name)>1?`${name} / Body ${bodyIndex}`:name,label:labelFor(name)+(partCounts.get(nativePart.name)>1?` · thân ${bodyIndex}`:''),nativeComponent:nativePart.name,nativePart:basename(nativePart.path),group,explode,min:lo,max:hi,center:bodyCenter,size:lo.map((v,i)=>(hi[i]-v)*1000),positions:append(pos,Float32Array),normals:append(nor,Float32Array),indices:append(m.index.array,Uint32Array),triangles:m.index.array.length/3};
});
for(const g of groups)g.count=meshes.filter(m=>m.group===g.id).length;
const meta={source:'THUNG CHINH.step',convertedFrom:'THUNG CHINH.STEP.SLDASM',sourceSHA256:crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'),units:'mm',meshCount:meshes.length,sourcePartCount:leafParts.length,uniqueNames:new Set(meshes.map(m=>m.nativePart)).size,triangles:meshes.reduce((s,m)=>s+m.triangles,0),bounds:{min,max,size:[max[2]-min[2],max[1]-min[1],max[0]-min[0]]},groups,parts:leafParts.map(p=>({name:partName(p),instance:p.name,bodyCount:partCounts.get(p.name)||0})),suppressedParts:native.filter(c=>c.suppressed).map(c=>({name:basename(c.path),label:labelFor(basename(c.path))})),meshes};
if(meta.parts.some(p=>!p.bodyCount))throw new Error('At least one active native part is absent from the STEP output.');
fs.mkdirSync('dist/assets/cad',{recursive:true});fs.writeFileSync('dist/assets/cad/thung-chinh.json',JSON.stringify(meta));fs.writeFileSync('dist/assets/cad/thung-chinh.bin',Buffer.concat(chunks));
console.log(JSON.stringify({meshCount:meta.meshCount,sourcePartCount:meta.sourcePartCount,size:meta.bounds.size,triangles:meta.triangles,parts:meta.parts,suppressedParts:meta.suppressedParts,groups:groups.map(g=>[g.title,g.count]),bytes:offset},null,2));
