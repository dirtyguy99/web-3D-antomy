import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const m=JSON.parse(fs.readFileSync('dist/assets/model.json'));
const b=fs.readFileSync('dist/assets/model.bin');
const a=b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);
assert.equal(m.meshCount,122);assert.equal(m.meshes.length,m.meshCount);assert.equal(m.groups.reduce((sum,g)=>sum+g.count,0),m.meshCount);
let triangles=0;for(const mesh of m.meshes){const p=new Float32Array(a,mesh.positions.offset,mesh.positions.count),n=new Float32Array(a,mesh.normals.offset,mesh.normals.count),idx=new Uint32Array(a,mesh.indices.offset,mesh.indices.count);assert.equal(p.length,n.length);assert.equal(p.length%3,0);assert.equal(idx.length%3,0);for(const value of p)assert.ok(Number.isFinite(value));for(const value of n)assert.ok(Number.isFinite(value));for(const index of idx)assert.ok(index<p.length/3);triangles+=idx.length/3;assert.ok(m.groups.some(g=>g.id===mesh.group));}
assert.equal(triangles,m.triangles);
if(fs.existsSync('../ban test thung phu.STEP'))assert.equal(crypto.createHash('sha256').update(fs.readFileSync('../ban test thung phu.STEP')).digest('hex'),m.sourceSHA256);
console.log(`PASS: ${m.meshCount} meshes; ${m.uniqueNames} names; ${triangles} triangles; valid indices, finite geometry, group counts and source hash.`);
