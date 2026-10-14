import fs from 'node:fs';
import crypto from 'node:crypto';

// The drawing is traced and simplified from the orthographic CAD side reference.
// A new CAD source needs a new reference/drawing, rather than silently reusing it.
const expectedSource='9797eed4e9f7d5e9476537885c5474c649876b0f3822f6cec0b2e0f8c9244f87';
const source=fs.readFileSync('dist/assets/cad/tong-quan.bin');
if(crypto.createHash('sha256').update(source).digest('hex')!==expectedSource)throw new Error('CAD changed: redraw truck-side.svg from the updated side reference first.');
const meta=JSON.parse(fs.readFileSync('dist/assets/cad/tong-quan.json'));
const wheels=meta.meshes.filter(m=>/11\.00R20/.test(m.nativePart));
const axles=[...new Set(wheels.map(m=>m.center[2].toFixed(4)))].sort((a,b)=>Number(a)-Number(b));
if(axles.length!==2)throw new Error('The current drawing requires the two axles of the supplied vehicle.');
const wheelbase=Math.round((Number(axles[1])-Number(axles[0]))*1000);
const svg=fs.readFileSync('dist/assets/hero/truck-side.svg','utf8').trim();
const inline=svg.replace(/<svg[^>]*>/,`<svg class="field-truck scene-motion" viewBox="0 0 700 300" aria-hidden="true" data-source="Full_09_10_2.SLDASM" data-wheelbase-mm="${wheelbase}">`);
const page=fs.readFileSync('dist/index.html','utf8');
const pattern=/<svg class="field-truck scene-motion"[^>]*>[\s\S]*?<\/svg>/;
if(!pattern.test(page))throw new Error('Home truck slot was not found.');
fs.writeFileSync('dist/index.html',page.replace(pattern,inline));
console.log(JSON.stringify({source:meta.convertedFrom,tires:wheels.length,visibleAxles:axles.length,wheelbaseMm:wheelbase,svgBytes:Buffer.byteLength(svg)}));
