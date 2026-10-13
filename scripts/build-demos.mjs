import fs from 'node:fs';
import * as T from '../dist/vendor/three.module.js';
fs.mkdirSync('dist/assets/demo',{recursive:true});
function builder(id){const parts=[];
 const add=(label,group,geo,position=[0,0,0],color=null,explode=[0,0,0],rotation=null)=>{if(rotation)geo.applyMatrix4(new T.Matrix4().makeRotationFromEuler(new T.Euler(...rotation)));geo.translate(...position);parts.push({label,group,geo,color,explode});return geo};
 const box=(label,group,size,position,color,explode)=>add(label,group,new T.BoxGeometry(...size),position,color,explode);
 const rod=(label,group,start,end,r,color,explode)=>{const a=new T.Vector3(...start),b=new T.Vector3(...end),d=b.clone().sub(a);const g=new T.CylinderGeometry(r,r,d.length(),24);g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),d.normalize()));return add(label,group,g,a.add(b).multiplyScalar(.5).toArray(),color,explode)};
 const cylinder=(label,group,r,length,position,color,explode,rotation=[0,0,Math.PI/2])=>add(label,group,new T.CylinderGeometry(r,r,length,32),position,color,explode,rotation);
 function finish(groups){const whole=new T.Box3();for(const p of parts){p.geo.computeBoundingBox();whole.union(p.geo.boundingBox)}const center=whole.getCenter(new T.Vector3()),size=whole.getSize(new T.Vector3());let offset=0;const chunks=[];const append=(arr,Type)=>{const data=new Type(arr),bytes=Buffer.from(data.buffer);const entry={offset,count:data.length};chunks.push(bytes);offset+=bytes.length;return entry};
 const meshes=parts.map((p,i)=>{p.geo.translate(-center.x,-center.y,-center.z);p.geo.computeBoundingBox();const bb=p.geo.boundingBox,lo=bb.min.toArray(),hi=bb.max.toArray(),pos=p.geo.attributes.position.array;let indices=p.geo.index?.array;if(!indices)indices=Array.from({length:pos.length/3},(_,j)=>j);return {id:i,name:`MINH_HOA_${String(i+1).padStart(3,'0')}`,label:p.label,group:p.group,color:p.color,explode:p.explode,min:lo,max:hi,center:bb.getCenter(new T.Vector3()).toArray(),size:hi.map((v,j)=>(v-lo[j])*1000),positions:append(pos,Float32Array),normals:append(p.geo.attributes.normal.array,Float32Array),indices:append(indices,Uint32Array),triangles:indices.length/3}});
 const meta={source:'Minh họa 3D — chưa có dữ liệu CAD của người dùng',illustrative:true,units:'illustrative',meshCount:meshes.length,uniqueNames:meshes.length,triangles:meshes.reduce((s,m)=>s+m.triangles,0),bounds:{size:size.toArray().map(v=>v*1000)},groups:groups.map(g=>({...g,count:meshes.filter(m=>m.group===g.id).length})),meshes};
 fs.writeFileSync(`dist/assets/demo/${id}.json`,JSON.stringify(meta));fs.writeFileSync(`dist/assets/demo/${id}.bin`,Buffer.concat(chunks));console.log(`${id}: ${meshes.length} illustrative pieces`)}
 return {add,box,rod,cylinder,finish};}
const steel=0xa5b39c,panel=0xc5cdbd,graphite=0x545e55,chrome=0x9aa79a,glass=0x677c78,rubber=0x414842;
{
 const {box,rod,cylinder,finish}=builder('thung-chinh');
 box('Sàn khoang chứa','shell',[2.35,.08,4.8],[0,.7,0],panel,[0,-.35,0]);
 box('Vách đầu thùng','shell',[2.35,2.2,.055],[0,1.85,2.37],panel,[0,.15,.7]);
 box('Tấm mái thùng','shell',[2.35,.065,4.8],[0,2.99,0],panel,[0,.7,0]);
 for(const side of [-1,1]){
  box(`Vách bên ${side<0?'trái':'phải'}`,'shell',[.045,2.25,4.8],[side*1.18,1.85,0],panel,[side*.7,0,0]);
  for(const y of [.77,2.9])box('Thanh dọc khung thùng','frame',[.09,.1,4.9],[side*1.24,y,0],steel,[side*.7,0,0]);
  for(let k=0;k<7;k++)box('Thanh đứng gia cường','frame',[.10,2.22,.075],[side*1.245,1.84,-2.31+k*.77],steel,[side*.7,0,0]);
  box('Dầm khung đỡ','base',[.16,.25,5],[side*.70,.48,0],graphite,[0,-.5,0]);
  for(const z of [-1.9,1.9]){box('Tai liên kết khung','base',[.18,.17,.22],[side*.7,.22,z],steel,[0,-.5,0]);cylinder('Chốt liên kết','base',.048,.28,[side*.7,.22,z],chrome,[0,-.5,0]);}
 }
 for(let k=0;k<6;k++)box('Dầm ngang đỡ sàn','base',[2.15,.13,.12],[0,.60,-2.25+k*.9],steel,[0,-.5,0]);
 box('Tấm bàn đẩy minh họa','press',[2.06,1.92,.075],[0,1.82,.95],steel,[0,.3,-.8]);
 for(const x of [-.9,0,.9])box('Gân đứng bàn đẩy','press',[.09,1.86,.10],[x,1.82,1.035],graphite,[0,.3,-.8]);
 for(const y of [1.04,2.62])box('Gân ngang bàn đẩy','press',[2.1,.10,.10],[0,y,1.10],graphite,[0,.3,-.8]);
 for(const side of [-1,1])box('Thanh dẫn hướng','rails',[.11,.13,4.6],[side*1.02,1.0,0],graphite,[side*.4,.2,0]);
 finish([{id:'shell',title:'Vỏ khoang chứa',short:'Vỏ thùng'},{id:'frame',title:'Khung gia cường',short:'Khung'},{id:'base',title:'Khung đỡ & liên kết',short:'Khung đỡ'},{id:'press',title:'Bàn đẩy minh họa',short:'Bàn đẩy'},{id:'rails',title:'Thanh dẫn hướng',short:'Dẫn hướng'}]);
}
{
 const {add,box,rod,cylinder,finish}=builder('than-xe');
 for(const side of [-1,1])box('Dầm dọc chassis','frame',[.17,.25,6.4],[side*.60,.88,.15],graphite,[side*.5,0,0]);
 for(let k=0;k<8;k++)box('Dầm ngang chassis','frame',[1.27,.15,.13],[0,.88,-2.7+k*.8],steel,[0,.2,0]);
 const shape=new T.Shape();shape.moveTo(1.2,.80);shape.lineTo(3.15,.80);shape.lineTo(3.15,1.82);shape.lineTo(2.72,2.70);shape.lineTo(1.2,2.70);shape.closePath();const cab=new T.ExtrudeGeometry(shape,{depth:2.1,bevelEnabled:true,bevelThickness:.035,bevelSize:.04,bevelSegments:2,steps:1});cab.rotateY(Math.PI/2);cab.translate(-1.05,0,0);add('Vỏ cabin minh họa','shell',cab,[0,0,0],panel,[0,.8,-.6]);
 box('Kính chắn gió','cabin',[1.85,.58,.045],[0,2.23,-2.947],glass,[0,.8,-.6]);
 for(const side of [-1,1]){
  box('Kính cửa cabin','cabin',[.025,.59,.89],[side*1.087,2.24,-1.96],glass,[0,.8,-.6]);
  box('Tay nắm cửa','cabin',[.035,.045,.18],[side*1.1,1.8,-1.72],graphite,[0,.8,-.6]);
  box('Bậc lên cabin','cabin',[.27,.085,1.04],[side*1.12,.79,-1.95],graphite,[0,.8,-.6]);
  rod('Tay gương','cabin',[side*1.05,2.34,-2.68],[side*1.36,2.34,-2.68],.028,graphite,[0,.8,-.6]);
  box('Gương chiếu hậu','cabin',[.08,.28,.17],[side*1.36,2.36,-2.68],graphite,[0,.8,-.6]);
  box('Đèn trước','cabin',[.40,.16,.035],[side*.64,1.21,-3.185],0xd5dbcb,[0,.8,-.6]);
 }
 box('Cản trước','cabin',[2.28,.18,.18],[0,.88,-3.18],graphite,[0,.8,-.6]);box('Lưới trước','cabin',[1.02,.33,.045],[0,1.47,-3.181],graphite,[0,.8,-.6]);
 for(let k=0;k<5;k++)box('Nan lưới trước','cabin',[.96,.026,.018],[0,1.35+k*.06,-3.214],steel,[0,.8,-.6]);
 for(const z of [-2.13,1.39,2.54]){
  rod('Cầu xe minh họa','axles',[-1.13,.59,z],[1.13,.59,z],.09,graphite,[0,-.25,0]);
  cylinder('Vỏ vi sai','axles',.20,.37,[0,.59,z],graphite,[0,-.25,0]);
  for(const side of [-1,1]){
   cylinder('Lốp xe','wheels',.55,.31,[side*1.015,.57,z],rubber,[side*.75,-.05,0]);
   cylinder('Vành bánh xe','wheels',.32,.322,[side*1.02,.57,z],chrome,[side*.75,-.05,0]);
   cylinder('Moay ơ','wheels',.13,.35,[side*1.025,.57,z],graphite,[side*.75,-.05,0]);
   for(let k=0;k<6;k++){const angle=k*Math.PI/3;cylinder('Bu lông bánh xe','wheels',.025,.355,[side*1.028,.57+Math.sin(angle)*.23,z+Math.cos(angle)*.23],graphite,[side*.75,-.05,0]);}
  }
 }
 box('Thùng nhiên liệu minh họa','equipment',[.45,.43,.9],[-.94,.73,-.02],steel,[-.7,0,0]);
 box('Hộp bên chassis','equipment',[.43,.39,.68],[.94,.72,-.05],graphite,[.7,0,0]);
 finish([{id:'shell',title:'Vỏ cabin',short:'Vỏ cabin'},{id:'cabin',title:'Chi tiết cabin',short:'Cabin'},{id:'frame',title:'Khung gầm',short:'Chassis'},{id:'axles',title:'Cầu xe minh họa',short:'Cầu xe'},{id:'wheels',title:'Bánh xe',short:'Bánh xe'},{id:'equipment',title:'Thiết bị bên khung',short:'Thiết bị'}]);
}
{
 const {box,rod,cylinder,finish}=builder('cap-nang');
 for(const side of [-1,1]){
  const x=side*.64;
  box('Trụ giá nâng','frame',[.14,1.9,.17],[x,1.08,.43],graphite,[side*.35,.1,.3]);
  box('Chân giá nâng','frame',[.26,.12,.7],[x,.16,.30],steel,[side*.35,.1,.3]);
  rod('Tay nâng dưới','arms',[x,.74,.32],[x,1.03,-.77],.09,steel,[side*.5,.4,0]);
  rod('Tay nâng trên','arms',[x,1.65,.32],[x,1.68,-.8],.07,steel,[side*.5,.4,0]);
  rod('Giá tiếp xúc thùng','arms',[x,1.03,-.77],[x,1.68,-.8],.065,graphite,[side*.5,.4,0]);
  rod('Ống xi lanh minh họa','hydraulic',[x,.52,.27],[x,.98,-.18],.075,graphite,[side*.85,.1,0]);
  rod('Lõi xi lanh minh họa','hydraulic',[x,.98,-.18],[x,1.31,-.5],.034,chrome,[side*.85,.1,0]);
  for(const yz of [[.74,.32],[1.03,-.77],[1.65,.32],[1.68,-.8]])cylinder('Chốt tay nâng','arms',.10,.24,[x,...yz],chrome,[side*.5,.4,0]);
 }
 for(const y of [.25,1.93])box('Thanh ngang giá đỡ','frame',[1.45,.13,.17],[0,y,.43],graphite,[0,.1,.3]);
 rod('Trục liên kết hai tay','arms',[-.8,.74,.32],[.8,.74,.32],.09,chrome,[0,.4,0]);
 box('Thanh kẹp minh họa','arms',[1.42,.10,.10],[0,1.39,-.82],graphite,[0,.4,0]);
 box('Đáy thùng rác minh họa','shell',[1.33,.075,.94],[0,.37,-1.39],0x839982,[0,-.10,-.7]);
 for(const side of [-1,1])box('Vách bên thùng rác','shell',[.048,1.20,.95],[side*.665,.985,-1.39],0x839982,[0,-.10,-.7]);
 for(const z of [-1.87,-.91])box('Vách trước sau thùng rác','shell',[1.36,1.2,.05],[0,.985,z],0x839982,[0,-.10,-.7]);
 box('Nắp thùng rác','lid',[1.48,.085,1.08],[0,1.65,-1.39],0x536953,[0,.65,-.7]);
 for(const side of [-1,1]){
  for(const z of [-1.77,-1.04]){cylinder('Bánh thùng rác','bin-wheels',.11,.085,[side*.51,.21,z],rubber,[0,-.10,-.7]);box('Giá bánh thùng rác','bin-wheels',[.07,.14,.07],[side*.51,.29,z],chrome,[0,-.10,-.7]);}
  box('Gân vách thùng rác','shell',[.055,.98,.075],[side*.7,1.0,-1.20],0x6c856c,[0,-.10,-.7]);
  box('Tai kẹp thùng rác','shell',[.16,.16,.075],[side*.60,1.46,-.85],0x6c856c,[0,-.10,-.7]);
 }
 finish([{id:'frame',title:'Giá đỡ',short:'Giá đỡ'},{id:'arms',title:'Cặp tay nâng & chốt',short:'Tay nâng'},{id:'hydraulic',title:'Xi lanh minh họa',short:'Xi lanh'},{id:'shell',title:'Thùng rác minh họa',short:'Thùng rác'},{id:'lid',title:'Nắp thùng rác',short:'Nắp'},{id:'bin-wheels',title:'Bánh thùng rác',short:'Bánh thùng'}]);
}
