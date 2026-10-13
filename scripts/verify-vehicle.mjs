import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

for(const [slug,rawName,source,bodies,parts] of [
 ['than-xe','than-xe','Full_09_10_2.step',211,144],
 ['tong-quan','full-vehicle','Full_09_10_2-all.step',428,296]
]){
 const meta=JSON.parse(fs.readFileSync(`dist/assets/cad/${slug}.json`));
 const bytes=fs.readFileSync(`dist/assets/cad/${slug}.bin`);
 const buffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
 assert.equal(meta.illustrative,false);assert.equal(meta.meshCount,bodies);assert.equal(meta.sourcePartCount,parts);
 assert.equal(meta.parts.length,parts);assert.ok(meta.parts.every(p=>p.bodyCount>0));
 assert.equal(meta.parts.reduce((s,p)=>s+p.bodyCount,0),bodies);
 assert.equal(meta.groups.reduce((s,g)=>s+g.count,0),bodies);
 const rawPath=`.cache/${rawName}-import.json`;
 const raw=fs.existsSync(rawPath)?JSON.parse(fs.readFileSync(rawPath)):null;
 if(raw)assert.equal(raw.meshes.length,bodies);
 let triangles=0,maxError=0,maxNormalError=0,end=0;
 const center=meta.bounds.min.map((v,i)=>(v+meta.bounds.max[i])/2);
 const actualCounts=new Map();
 for(const [id,m] of meta.meshes.entries()){
  assert.equal(m.id,id);assert.equal(m.originalMeshId,id);
  assert.ok(m.name&&m.label&&m.nativeComponent&&m.nativePart);
  assert.ok(!/[A-Z]:\\/i.test(JSON.stringify(m)),'Do not publish local filesystem paths.');
  assert.ok(meta.groups.some(g=>g.id===m.group));
  actualCounts.set(m.nativeComponent,(actualCounts.get(m.nativeComponent)||0)+1);
  for(const range of [m.positions,m.normals,m.indices]){
   assert.equal(range.offset,end);assert.equal(range.count%3,0);end+=range.count*4;
  }
  const pos=new Float32Array(buffer,m.positions.offset,m.positions.count);
  const nor=new Float32Array(buffer,m.normals.offset,m.normals.count);
  const idx=new Uint32Array(buffer,m.indices.offset,m.indices.count);
  assert.equal(pos.length,nor.length);
  for(const v of pos)assert.ok(Number.isFinite(v));for(const v of nor)assert.ok(Number.isFinite(v));
  for(const i of idx)assert.ok(i<pos.length/3);triangles+=idx.length/3;
  if(raw){
   const original=raw.meshes[id];assert.deepEqual(Array.from(idx),original.index.array);
   for(let k=0;k<pos.length;k+=3){
    const restored=[-pos[k+2]*1000+center[0],pos[k+1]*1000+center[1],pos[k]*1000+center[2]];
    const restoredNormal=[-nor[k+2],nor[k+1],nor[k]];
    for(let j=0;j<3;j++){
     maxError=Math.max(maxError,Math.abs(restored[j]-original.attributes.position.array[k+j]));
     maxNormalError=Math.max(maxNormalError,Math.abs(restoredNormal[j]-original.attributes.normal.array[k+j]));
    }
   }
  }
 }
 assert.equal(end,bytes.length);assert.equal(triangles,meta.triangles);
 for(const p of meta.parts)assert.equal(actualCounts.get(p.instance),p.bodyCount);
 assert.ok(maxError<.001,'Web geometry must retain STEP assembly positions to Float32 precision.');
 assert.ok(maxNormalError<1e-6);
 assert.deepEqual(meta.initialHidden,meta.meshes.filter(m=>m.sourceHidden).map(m=>m.id));
 if(slug==='tong-quan'){
  assert.deepEqual(meta.groups.map(g=>g.id),['than-xe','thung-chinh','thung-phu']);
  assert.equal(meta.groups.find(g=>g.id==='than-xe').count,211);
  assert.equal(meta.initialHidden.length,2);
 }else assert.equal(meta.groups.length,7);
 if(fs.existsSync(`.cache/${source}`))assert.equal(meta.sourceSHA256,crypto.createHash('sha256').update(fs.readFileSync(`.cache/${source}`)).digest('hex'));
 console.log(`PASS ${slug}: ${bodies} bodies / all ${parts} source parts mapped; ${triangles} triangles; valid buffers, names, groups, visibility and STEP hash. Assembly-position error ${maxError.toFixed(6)} mm${raw?'':' (raw STEP comparison unavailable)'}.`);
}
