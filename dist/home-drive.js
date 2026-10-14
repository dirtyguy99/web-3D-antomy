import * as THREE from 'three';

const panel=document.getElementById('hero-scene'),view=document.getElementById('hero-scene-view'),toggle=document.getElementById('scene-toggle');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer,scene,camera,truck,wheels=[],moving=[],frameId=0,last=0,time=0,inView=true,paused=reduced.matches,ready=false;
function button(){toggle.disabled=!ready;toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'Tiếp tục cảnh xe chuyển động':'Tạm dừng cảnh xe chuyển động');toggle.innerHTML=`<span aria-hidden="true">${paused?'▷':'Ⅱ'}</span><span>${paused?'Tiếp tục cảnh':'Tạm dừng cảnh'}</span>`}
function render(){if(renderer)renderer.render(scene,camera)}
function schedule(){if(ready&&!paused&&inView&&!document.hidden&&!frameId)frameId=requestAnimationFrame(frame)}
function frame(now){frameId=0;const dt=last?Math.min((now-last)/1000,.05):0;last=now;time+=dt;
 for(const mesh of wheels)mesh.rotation.x+=dt*2.4/.534;
 truck.position.y=truck.userData.groundOffset+Math.sin(time*3.1)*.012;
 for(const item of moving){item.position.x-=dt*item.userData.speed;if(item.position.x<item.userData.low)item.position.x+=item.userData.span}
 render();schedule();
}
function pause(value){paused=value;last=0;button();if(paused&&frameId){cancelAnimationFrame(frameId);frameId=0}schedule()}
toggle.addEventListener('click',()=>pause(!paused));reduced.addEventListener('change',()=>pause(reduced.matches));
document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden&&frameId){cancelAnimationFrame(frameId);frameId=0}else schedule()});
function resize(){if(!renderer)return;const width=view.clientWidth,height=view.clientHeight;renderer.setSize(width,height);camera.aspect=width/height;
 const distance=width<450?1.18:1;camera.position.set(11.5*distance,7.7*distance,13.8*distance);camera.lookAt(0,1.8,0);camera.updateProjectionMatrix();render();
}
function object(geometry,color,position,scale=[1,1,1]){const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,roughness:.92}));mesh.position.set(...position);mesh.scale.set(...scale);mesh.castShadow=true;mesh.receiveShadow=true;return mesh}
function loop(item,span=100,speed=2.4){item.userData={...item.userData,speed,span,low:-span/2};moving.push(item);scene.add(item)}
async function init(){try{
 const [metaResponse,binaryResponse]=await Promise.all([fetch('./assets/hero/truck.json'),fetch('./assets/hero/truck.bin')]);
 if(!metaResponse.ok||!binaryResponse.ok)throw new Error('Hero model unavailable');const meta=await metaResponse.json(),binary=await binaryResponse.arrayBuffer();
 renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.4));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.17;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.domElement.setAttribute('aria-hidden','true');view.append(renderer.domElement);
 scene=new THREE.Scene();scene.background=new THREE.Color(0xeaf6e9);scene.fog=new THREE.Fog(0xeaf6e9,30,85);camera=new THREE.PerspectiveCamera(36,1,.1,150);
 scene.add(new THREE.HemisphereLight(0xfffdf5,0x78a56a,2));const sun=new THREE.DirectionalLight(0xfff6d9,3.4);sun.position.set(-10,18,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:1,far:60});sun.shadow.normalBias=.06;sun.shadow.bias=-.0002;scene.add(sun);
 const fill=new THREE.DirectionalLight(0xf0fff2,.8);fill.position.set(8,7,-8);scene.add(fill);
 const field=object(new THREE.PlaneGeometry(180,130),0x74ad51,[0,-.04,0]);field.rotation.x=-Math.PI/2;field.castShadow=false;scene.add(field);
 const road=object(new THREE.PlaneGeometry(140,5.9),0xb5c1a8,[0,.005,0]);road.rotation.x=-Math.PI/2;road.castShadow=false;scene.add(road);
 for(const z of [-2.65,2.65]){const edge=object(new THREE.PlaneGeometry(140,.08),0xf8f7dc,[0,.013,z]);edge.rotation.x=-Math.PI/2;edge.castShadow=false;scene.add(edge)}
 const lane=new THREE.PlaneGeometry(2,.075);for(let i=0;i<25;i++){const dash=object(lane,0xf9f6dc,[i*4-50,.017,0]);dash.rotation.x=-Math.PI/2;dash.castShadow=false;loop(dash)}
 const leaf=new THREE.IcosahedronGeometry(1,1),trunk=new THREE.CylinderGeometry(.10,.18,1,6);
 let seed=721;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<38;i++){
  const tree=new THREE.Group(),x=i*2.8-50,z=-7-random()*22,height=2.7+random()*3.7;
  tree.position.set(x,0,z);tree.add(object(trunk,0x84684a,[0,height*.35,0],[1,height*.7,1]));
  for(const [j,color] of [0x4a8844,0x629c50,0x7aac5c].entries()){tree.add(object(leaf,color,[(j-1)*height*.17,height*(.70+j*.06),j*.18],[height*.33,height*.36,height*.30]))}
  loop(tree,106.4);
 }
 for(let i=0;i<8;i++){const hill=object(new THREE.SphereGeometry(1,20,10),i%2?0x8ebd69:0x9cc979,[i*18-65,-2,-35-random()*18],[16,6+random()*3,12]);hill.castShadow=false;loop(hill,160,.45)}
 const sunDisc=new THREE.Mesh(new THREE.SphereGeometry(2.9,24,16),new THREE.MeshBasicMaterial({color:0xfff2b7}));sunDisc.position.set(-29,22,-52);scene.add(sunDisc);
 const blade=new THREE.ConeGeometry(.12,.38,3),grass=new THREE.InstancedMesh(blade,new THREE.MeshStandardMaterial({color:0x5b953f,roughness:1}),300),matrix=new THREE.Matrix4();
 for(let i=0;i<300;i++){matrix.compose(new THREE.Vector3(random()*120-60,.16,3.9+random()*18),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),random()*Math.PI),new THREE.Vector3(1,1+random(),1));grass.setMatrixAt(i,matrix)}grass.receiveShadow=true;loop(grass,240);const nextGrass=grass.clone();nextGrass.position.x=120;loop(nextGrass,240);
 truck=new THREE.Group();truck.rotation.y=Math.PI/2;truck.position.y=meta.groundOffset;truck.userData.groundOffset=meta.groundOffset;
 const colors={cabin:0xf5fff7,chassis:0x425644,'thung-chinh':0x3e8352,'thung-phu':0x6c9a59};
 for(const m of meta.meshes){
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(binary,m.positions.offset,m.positions.count),3));geometry.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(binary,m.normals.offset,m.normals.count),3));geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(binary,m.indices.offset,m.indices.count),1));
  const wheel=m.name.startsWith('wheel-'),mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:wheel?0x26372a:colors[m.name],roughness:wheel?.95:.62,metalness:wheel?.05:.12,side:THREE.DoubleSide}));mesh.position.set(...m.center);mesh.castShadow=true;mesh.receiveShadow=true;truck.add(mesh);if(wheel)wheels.push(mesh);
 }
 scene.add(truck);ready=true;button();resize();panel.classList.add('scene-ready');
 new ResizeObserver(resize).observe(view);new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;last=0;if(!inView&&frameId){cancelAnimationFrame(frameId);frameId=0}else schedule()},{threshold:.05}).observe(panel);
 renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();pause(true);ready=false;button();panel.classList.remove('scene-ready')});
 addEventListener('pagehide',()=>{if(frameId)cancelAnimationFrame(frameId);frameId=0});addEventListener('pageshow',()=>{last=0;schedule()});
 // Read-only diagnostics for scene QA; no controls or model internals exposed.
 window.homeDrive={getState:()=>({ready,paused,time,wheels:wheels.length,wheelAngle:wheels[0]?.rotation.x,triangles:meta.triangles,drawCalls:renderer.info.render.calls,inView}),};
 schedule();
}catch(error){button();toggle.hidden=true;console.warn('Home scene uses its poster:',error.message)}}
button();init();
