import fs from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
import {modules} from '../dist/catalog.js';

if(modules.find(m=>m.id==='tong-quan').ready){
 console.log('Overview uses the real vehicle assembly. Run scripts/convert-vehicle.mjs overview to update its CAD data.');
 process.exit(0);
}

// This is an illustrative placement, not an assembly inferred from CAD mates.
// Existing geometry is reused as a visual reference; the full assembly is pending.
const components=[
 {id:'than-xe',title:'Thân xe',meta:'dist/assets/demo/than-xe.json',bin:'dist/assets/demo/than-xe.bin',scale:[1,1,1],position:[0,0,0],angle:0,explode:[0,-.45,0]},
 {id:'thung-chinh',title:'Thùng chính',meta:'dist/assets/cad/thung-chinh.json',bin:'dist/assets/cad/thung-chinh.bin',scale:[.90,.86,.90],position:[0,.60,.70],angle:Math.PI,explode:[0,1.2,0]},
 {id:'thung-phu',title:'Thùng phụ',meta:'dist/assets/model.json',bin:'dist/assets/model.bin',scale:[.87,.70,.46],position:[0,.70,3.27],angle:Math.PI,explode:[0,.35,1.35]},
 {id:'cap-nang',title:'Cặp nâng thùng rác',meta:'dist/assets/demo/cap-nang.json',bin:'dist/assets/demo/cap-nang.bin',scale:[.84,.84,.84],position:[0,-.48,4.61],angle:Math.PI,explode:[0,.1,2.3]}
];
const transformed=[];const box=new T.Box3();
for(const component of components){
 const source=JSON.parse(fs.readFileSync(component.meta));const file=fs.readFileSync(component.bin);const buffer=file.buffer.slice(file.byteOffset,file.byteOffset+file.byteLength);
 const rotation=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),component.angle);
 const matrix=new T.Matrix4().compose(new T.Vector3(...component.position),rotation,new T.Vector3(...component.scale));
 for(const m of source.meshes){const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(new Float32Array(buffer,m.positions.offset,m.positions.count).slice(),3));geo.setAttribute('normal',new T.BufferAttribute(new Float32Array(buffer,m.normals.offset,m.normals.count).slice(),3));geo.setIndex(new T.BufferAttribute(new Uint32Array(buffer,m.indices.offset,m.indices.count).slice(),1));geo.applyMatrix4(matrix);geo.computeBoundingBox();box.union(geo.boundingBox);transformed.push({component,m,geo});}
}
const center=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3());let offset=0;const chunks=[];
function append(array,Type){const data=new Type(array),bytes=Buffer.from(data.buffer);const range={offset,count:data.length};chunks.push(bytes);offset+=bytes.length;return range;}
const meshes=transformed.map(({component,m,geo},id)=>{geo.translate(-center.x,-center.y,-center.z);geo.computeBoundingBox();const min=geo.boundingBox.min.toArray(),max=geo.boundingBox.max.toArray();return {id,name:m.name,label:m.label,component:component.id,group:component.id,color:m.color||null,shell:m.group==='shell',explode:component.explode,min,max,center:geo.boundingBox.getCenter(new T.Vector3()).toArray(),size:max.map((v,i)=>(v-min[i])*1000),positions:append(geo.attributes.position.array,Float32Array),normals:append(geo.attributes.normal.array,Float32Array),indices:append(geo.index.array,Uint32Array),triangles:geo.index.count/3};});
const result={source:'Minh họa lắp ráp tổng thể — chờ mô hình CAD toàn xe',illustrative:true,units:'illustrative',meshCount:meshes.length,uniqueNames:new Set(meshes.map(m=>m.name)).size,triangles:meshes.reduce((s,m)=>s+m.triangles,0),bounds:{size:size.toArray().map(v=>v*1000)},groups:components.map(c=>({id:c.id,title:c.title,short:c.title,count:meshes.filter(m=>m.group===c.id).length})),meshes};
fs.mkdirSync('dist/assets/demo',{recursive:true});fs.writeFileSync('dist/assets/demo/tong-quan.json',JSON.stringify(result));fs.writeFileSync('dist/assets/demo/tong-quan.bin',Buffer.concat(chunks));console.log(`Overview: ${meshes.length} reference pieces in ${result.groups.length} component groups; illustrative placement only.`);
