import fs from 'node:fs';
import occtFactory from 'occt-import-js';
const occt = await occtFactory();
const result = occt.ReadStepFile(fs.readFileSync('../ban test thung phu.STEP'), {linearUnit:'millimeter',linearDeflectionType:'absolute_value',linearDeflection:0.5,angularDeflection:0.25});
if(!result.success) throw new Error('STEP import failed');
fs.mkdirSync('.cache',{recursive:true});
fs.writeFileSync('.cache/import.json',JSON.stringify(result));
const rows=result.meshes.map((m,id)=>{
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 m.attributes.position.array.forEach((v,i)=>{min[i%3]=Math.min(min[i%3],v);max[i%3]=Math.max(max[i%3],v)});
 return {id,name:m.name,vertices:m.attributes.position.array.length/3,triangles:m.index.array.length/3,min:min.map(Math.round),max:max.map(Math.round),color:m.color};
});
fs.writeFileSync('.cache/summary.json',JSON.stringify({root:result.root,rows},null,2));
console.log(JSON.stringify({root:result.root,rows},null,2));
