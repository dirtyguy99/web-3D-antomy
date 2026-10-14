import fs from 'node:fs';
import crypto from 'node:crypto';
const source='dist/assets/cad/tong-quan';
const meta=JSON.parse(fs.readFileSync(source+'.json'));
const bytes=fs.readFileSync(source+'.bin'),buffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
const hidden=new Set(meta.initialHidden||[]),groups=new Map();
const wheels=[],cell=.06;
function category(m){
 if(/11\.00R20/.test(m.nativePart))return 'wheel-'+m.id;
 if(/^dau\.STEP/i.test(m.nativePart))return 'cabin';
 return m.component==='than-xe'?'chassis':m.component;
}
for(const mesh of meta.meshes){
 if(hidden.has(mesh.id))continue;
 const key=category(mesh),isWheel=key.startsWith('wheel-');
 if(!groups.has(key))groups.set(key,{name:key,positions:[],normals:[],indices:[],center:isWheel?mesh.center:[0,0,0]});
 const group=groups.get(key),positions=new Float32Array(buffer,mesh.positions.offset,mesh.positions.count),normals=new Float32Array(buffer,mesh.normals.offset,mesh.normals.count),indices=new Uint32Array(buffer,mesh.indices.offset,mesh.indices.count);
 const clusters=new Map(),remap=[],vertices=[];
 for(let i=0;i<positions.length;i+=3){
  const p=[positions[i],positions[i+1],positions[i+2]],n=[normals[i],normals[i+1],normals[i+2]];
  const label=p.map(v=>Math.round(v/cell)).join(',')+'|'+n.map(v=>Math.round(v*3)).join(',');
  let vertex=clusters.get(label);
  if(vertex===undefined){vertex=vertices.length;clusters.set(label,vertex);vertices.push({p:[0,0,0],n:[0,0,0],count:0})}
  remap.push(vertex);const v=vertices[vertex];v.count++;for(let j=0;j<3;j++){v.p[j]+=p[j];v.n[j]+=n[j]}
 }
 const start=group.positions.length/3;
 for(const v of vertices){const length=Math.hypot(...v.n)||1;for(let j=0;j<3;j++){group.positions.push(v.p[j]/v.count-group.center[j]);group.normals.push(v.n[j]/length)}}
 const seen=new Set();
 for(let i=0;i<indices.length;i+=3){const ids=[remap[indices[i]],remap[indices[i+1]],remap[indices[i+2]]];if(new Set(ids).size<3)continue;const face=[...ids].sort((a,b)=>a-b).join(',');if(seen.has(face))continue;seen.add(face);group.indices.push(...ids.map(id=>id+start))}
 if(isWheel)wheels.push(key);
}
let offset=0;const chunks=[];
function append(values,Type){const array=new Type(values),chunk=Buffer.from(array.buffer),range={offset,count:array.length};chunks.push(chunk);offset+=chunk.length;return range}
const meshes=[...groups.values()].map(g=>({name:g.name,center:g.center,positions:append(g.positions,Float32Array),normals:append(g.normals,Float32Array),indices:append(g.indices,Uint32Array),triangles:g.indices.length/3}));
const result={source:'Full_09_10_2.SLDASM',sourceModelSHA256:crypto.createHash('sha256').update(bytes).digest('hex'),displayOnly:true,clusterSizeMeters:cell,groundOffset:meta.bounds.size[1]/2000,wheels,meshes,triangles:meshes.reduce((s,m)=>s+m.triangles,0)};
fs.mkdirSync('dist/assets/hero',{recursive:true});fs.writeFileSync('dist/assets/hero/truck.json',JSON.stringify(result));fs.writeFileSync('dist/assets/hero/truck.bin',Buffer.concat(chunks));
console.log(JSON.stringify({meshes:meshes.length,triangles:result.triangles,bytes:offset,wheels:wheels.length},null,2));
