import assert from 'node:assert/strict';
import fs from 'node:fs';
const base='https://picpulse-control.thevirulakwan.workers.dev';
const pages=await Promise.all(['PP-L002','PP-L004','PP-L005','PP-L012','PP-L015'].map(async id=>{
 const r=await fetch(base+'/samples/'+id),html=await r.text();
 assert.equal(r.status,200);
 assert.ok(html.includes('pp-service-showcase'));
 assert.ok(html.includes('presentation.js?v=20261016-1'));
 if(['PP-L004','PP-L012'].includes(id)){
  assert.ok(!html.includes('section-appointment'));
  assert.ok(/<video[^>]*controls/.test(html));
  assert.ok(!html.includes('w-lightbox'));
 }
 assert.ok(!html.includes('{{SERVICE_SHOWCASE}}'));
 const photos=[...html.matchAll(/(?:src|data-service-photo)="([^"]+)"/g)].map(m=>m[1]).filter(u=>u.includes('/templates/')&&(/service_image|homepage_image|UErHQFC|jUcTFY|sIpRxc|DnrKSi|yCe0ij|H2AI3|srUAXJ/.test(u)));
 assert.ok(photos.length);
 return {id,status:r.status,services:(html.match(/class="pp-service-(?:card|detail)"/g)||[]).length,photos:[...new Set(photos)]};
}));
const photos=[...new Set(pages.flatMap(p=>p.photos))];
await Promise.all(photos.map(async url=>assert.equal((await fetch(url,{method:'HEAD'})).status,200,url)));
const privateChecks=await Promise.all(['/api/state','/samples/PP-L001'].map(async path=>{
 const status=(await fetch(base+path)).status;assert.equal(status,401);return {path,status};
}));
const result={verified_at:new Date().toISOString(),pages,photo_assets_verified:photos.length,privateChecks};
fs.writeFileSync('template-review/service-live-checks.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
