const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const now=()=>new Date().toISOString();
const safeURL=v=>{try{let u=new URL(v);return u.protocol==='https:'?u.href:''}catch{return ''}};
const phone=v=>String(v||'').replace(/[^+0-9]/g,'');
function serviceShowcase(key,services,images,contact,origin){
 const nails='/templates/01-nailsy/assets/cdn.prod.website-files.com/64955fc7b431e096dc683699/';
 const hair='/templates/04-elysia/assets/framerusercontent.com/images/';
 const picture=(service,index)=>{
  const label=String(typeof service==='string'?service:service.name||'');
  const approved=images.find(i=>String(i.service||'').toLowerCase()===label.toLowerCase());
  if(approved)return {url:approved.url,alt:approved.alt||label,reference:false};
  let file='UErHQFCZfIAGWxaXH6aF8zA79Io.webp';
  if(/nail|manicure|pedicure|gel|acrylic/i.test(label))file='srUAXJque77uaD43sG5dNiFWc0.webp';
  else if(/colo[u]?r|highlight/i.test(label))file='jUcTFY8UZox8AjdLrVCpbeRnOw.jpg';
  else if(/keratin|smooth|straight/i.test(label))file='sIpRxc0uk2o6BFvNn86IT4lDtc4.webp';
  else if(/treat|moistur|repair/i.test(label))file='DnrKSiFjx2mhHLAIcKJbSukW5w.webp';
  else if(/facial|bridal|dressing|makeup/i.test(label))file='yCe0ijSZZsR4ROzdB7wBYk50TOs.webp';
  else if(/massage|wax/i.test(label))file='H2AI3icA9JsywENS6aH45g4CEM.jpg';
  const url=key==='01-nailsy'&&!/bridal|dressing/i.test(label)?origin+nails+(index%2?'685e6374de21abbe31012137_homepage_image.webp':'685e64ba96776530640b042b_service_image.webp'):origin+hair+file;
  return {url,alt:label+' — template design reference',reference:true};
 };
 if(!services.length)return '<p>Contact the team for current services.</p>';
 if(key==='01-nailsy'){
  const first=picture(services[0],0);
  return '<div class="pp-nail-services"><div class="pp-service-accordion" data-pp-reveal>'+services.map((s,i)=>{
   const label=typeof s==='string'?s:s.name,photo=picture(s,i);
   return `<details class="pp-service-detail" name="pp-nail-services" data-service-photo="${esc(photo.url)}" data-service-alt="${esc(photo.alt)}" data-service-reference="${photo.reference}" ${i===0?'open':''}><summary><span class="pp-service-number">${String(i+1).padStart(2,'0')}</span><span class="pp-service-label">${esc(label)}</span><span class="pp-service-plus" aria-hidden="true">+</span></summary><div class="pp-service-body">${s.description?`<p>${esc(s.description)}</p>`:'<p>Contact our team for availability, options and current prices.</p>'}${s.price_verified&&s.price?`<p>${esc(s.price)}</p>`:''}<a href="${esc(contact)}" class="pp-service-link">Ask about this service ↗</a></div></details>`;
  }).join('')+`</div><figure class="pp-nail-service-photo" data-pp-reveal><img src="${esc(first.url)}" alt="${esc(first.alt)}" width="700" height="850"><figcaption>${first.reference?'Template photo · design reference':'Business photo'}</figcaption></figure></div>`;
 }
 return '<div class="pp-salon-services">'+services.map((s,i)=>{
  const label=typeof s==='string'?s:s.name,p=picture(s,i);
  return `<article class="pp-service-card" data-pp-reveal><figure><img loading="lazy" src="${esc(p.url)}" alt="${esc(p.alt)}" width="700" height="800"><figcaption>${p.reference?'Template photo · design reference':'Business photo'}</figcaption></figure><div class="pp-service-copy"><span class="pp-service-number">${String(i+1).padStart(2,'0')}</span><h3>${esc(label)}</h3>${s.description?`<p>${esc(s.description)}</p>`:''}${s.price_verified&&s.price?`<p>${esc(s.price)}</p>`:''}<a class="pp-service-link" href="${esc(contact)}">Ask about this service ↗</a></div></article>`;
 }).join('')+'</div>';
}
export function chooseTemplate(l){
 const choice=l.template_override;
 if(['01-nailsy','02-tastyc','03-grand-restaurant','04-elysia'].includes(choice))return choice;
 const cat=(l.category||'').toLowerCase();
 if(/nail/.test(cat))return '01-nailsy';
 if(/hair|salon|beauty/.test(cat))return '04-elysia';
 if(/restaurant|cafe|café|burger/.test(cat))return /cafe|café|burger/.test(cat+' '+(l.business_name||l.name||'')+' '+(l.business_services||''))?'03-grand-restaurant':'02-tastyc';
 throw Error('Unsupported category. Select an allowed business category.');
}
export function renderCompany(template,l,origin){
 const name=l.business_name||l.name;
 if(!name)throw Error('Business name required');
 const tel=phone(l.business_phone||l.phone), wa=phone(l.whatsapp_number).replace(/^\+/,''), email=l.business_email||l.email||'';
 const emailOK=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
 const link=(url,label)=>url?`<a class="pp-contact" href="${esc(url)}">${esc(label)}</a>`:'';
 const address=l.address||l.area||'Contact the business for its location';
 const cleanCopy=v=>String(v||'').replace(/\s*\(per[^)]*\)/gi,'').trim();
 const services=Array.isArray(l.services)?l.services:String(l.business_services||'').split(';').filter(Boolean).map(s=>({name:cleanCopy(s)}));
 const serviceHTML=services.length?'<div class="pp-grid">'+services.map(s=>`<div class="pp-card"><h3>${esc(typeof s==='string'?s:s.name)}</h3>${s.price_verified&&s.price?`<p>${esc(s.price)}</p>`:''}${s.description?`<p>${esc(s.description)}</p>`:''}</div>`).join('')+'</div>':'<p>Contact the business for its current services or menu.</p>';
 const booking=safeURL(l.booking_url), contact=booking||(wa?'https://wa.me/'+wa:tel?'tel:'+tel:emailOK?'mailto:'+email:'#pp-details');
 const logo=l.logo_verified?safeURL(l.logo_url):'';
 const stackedBrand=name.match(/^(.+?)\s+(Beauty Solution World)$/i);
 const wordmark=stackedBrand?`<span class="pp-wordmark pp-wordmark-stack"><span class="pp-brand-title">${esc(stackedBrand[1])}</span><span class="pp-brand-subtitle">${esc(stackedBrand[2])}</span></span>`:`<span class="pp-wordmark">${esc(name)}</span>`;
 const brand=logo?`<img src="${esc(logo)}" alt="${esc(name)}" width="220" height="50">`:wordmark;
 const initials=Array.from(name).slice(0,60).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="80" viewBox="0 0 400 80"><rect width="400" height="80" fill="white"/><text x="6" y="50" font-size="${name.length>24?17:25}" font-family="Arial" fill="#222">${esc(initials)}</text></svg>`;
 const images=(l.approved_images||[]).filter(i=>i.permission==='owner_supplied'||i.permission==='licensed').map(i=>({...i,url:safeURL(i.url)})).filter(i=>i.url);
 const hours=(l.opening_hours||[]).filter(h=>h.verified===true);
 const missing=['business_phone','business_email','address'].filter(k=>!l[k]);
 if(!logo)missing.push('approved business logo');if(!hours.length)missing.push('verified opening hours');
 const values={NAME:esc(name),AREA:esc(l.area||''),ADDRESS:esc(address),EMAIL_TEXT:esc(emailOK?email:'Contact us to confirm email'),PHONE_TEXT:esc(l.business_phone||l.phone||'Contact number to confirm'),DESCRIPTION:esc(l.description||`Explore ${name}${l.area?' in '+l.area:''}. Contact the business for current services, availability and prices.`),LOGO:esc(logo||'data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(svg)))),CONTACT:esc(contact),TEL:esc(tel?'tel:'+tel:'#pp-details'),MAILTO:esc(emailOK?'mailto:'+email:'#pp-details'),MENU_LABEL:/restaurant|cafe|burger/.test(l.category||'')?'Menu and inquiries':'Services and appointments',SERVICES:serviceHTML,DIRECTIONS:link(safeURL(l.google_maps_url),'Get directions'),CONTACT_LINKS:link(tel?'tel:'+tel:'',l.business_phone||tel)+link(wa?'https://wa.me/'+wa:'','WhatsApp inquiry')+link(emailOK?'mailto:'+email:'',email)+(booking?link(booking,'Booking service'):'')||'<p>Business contact details need confirmation.</p>',HOURS:hours.length?hours.map(h=>`<p>${esc(h.day)} ${esc(h.hours)}</p>`).join(''):'<p>Contact the business to confirm opening hours.</p>',SOCIALS:link(safeURL(l.instagram_url),'Instagram')+link(safeURL(l.facebook_url),'Facebook'),GALLERY:images.length?'<h3>Business gallery</h3><div class="pp-gallery">'+images.map(i=>`<img loading="lazy" src="${esc(i.url)}" alt="${esc(i.alt||name)}">`).join('')+'</div>':'',MISSING_NOTE:esc(missing.length?'Awaiting confirmation: '+missing.join(', ')+'.':'Business details supplied; owner approval still required.')};
 values.BRAND=brand;values.SERVICE_NAV=/restaurant|cafe|burger/.test(l.category||'')?'Menu':'Services';
 const templateKey=template.match(/data-pp-template="([^"]+)"/)?.[1]||chooseTemplate(l);
 values.SERVICE_SHOWCASE=serviceShowcase(templateKey,services,images,contact,origin);
 const features=services.map(s=>cleanCopy(typeof s==='string'?s:s.name)).filter(Boolean);
 for(let i=1;i<=6;i++)values['FEATURE_'+i]=esc(features[i-1]||['Menu favourites','Visit us','For good company','Something to enjoy','Plan your visit','Contact our team'][i-1]);
 return template.replaceAll('/templates/',origin+'/templates/').replace(/\{\{([A-Z_0-9]+)\}\}/g,(_,k)=>values[k]??'');
}
async function digest(s){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function sign(value,key){let k=await crypto.subtle.importKey('raw',new TextEncoder().encode(key),{name:'HMAC',hash:'SHA-256'},false,['sign']);return [...new Uint8Array(await crypto.subtle.sign('HMAC',k,new TextEncoder().encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function authenticated(req,env){
 if(env.LOCAL_DEV==='1')return true;
 if(env.API_KEY&&req.headers.get('Authorization')==='Bearer '+env.API_KEY)return true;
 const match=(req.headers.get('Cookie')||'').match(/(?:^|;\s*)picpulse_session=([^;]+)/);
 if(!match||!env.SESSION_SECRET)return false;
 const [expires,signature]=match[1].split('.');return Number(expires)>Date.now()&&signature===await sign(expires,env.SESSION_SECRET);
}
async function event(db,leadId,type,detail,id=crypto.randomUUID()){
 await db.prepare('INSERT OR IGNORE INTO events VALUES(?,?,?,?,?)').bind(id,leadId,type,JSON.stringify(detail),now()).run();
}
async function saveLead(db,lead,upload=null){
 let id=String(lead.id||lead.lead_id||'');if(!/^[a-zA-Z0-9_-]{1,80}$/.test(id))throw Error('Invalid lead ID');
 if(!(lead.business_name||lead.name))throw Error('Missing business name');
 let old=await db.prepare('SELECT * FROM leads WHERE id=?').bind(id).first();
 const identityKey=v=>String(v||'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,'');
 const identityPhone=v=>String(v||'').replace(/\D/g,'').replace(/^(?:0094|94|0)/,'');
 if(upload&&old){
  const d=JSON.parse(old.data),sameName=identityKey(d.business_name||d.name)===identityKey(lead.business_name||lead.name);
  const tel=identityPhone(lead.business_phone),samePhone=tel&&tel===identityPhone(d.business_phone);
  const place=lead.google_place_id||lead.place_id,prior=d.google_place_id||d.place_id,samePlace=place&&place===prior;
  if(!sameName&&!samePhone&&!samePlace){
   const label=String((lead.business_name||lead.name)+'-'+(lead.area||'')).toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,45);
   id='LEAD-'+label+'-'+(await digest(identityKey(lead.business_name||lead.name)+'|'+identityKey(lead.area))).slice(0,10);
   old=await db.prepare('SELECT * FROM leads WHERE id=?').bind(id).first();
  }
 }
 if(upload&&!old){
  const key=identityKey;
  const name=key(lead.business_name||lead.name),area=key(lead.area),tel=identityPhone(lead.business_phone),place=lead.google_place_id||lead.place_id;
  const duplicate=upload.existing.find(r=>{
   const d=JSON.parse(r.data),other=d.google_place_id||d.place_id;
   if(place&&other)return place===other;
   if(key(d.business_name||d.name)!==name)return false;
   const priorPhone=identityPhone(d.business_phone),differentPhones=tel&&priorPhone&&tel!==priorPhone;
   return !!(tel&&tel===priorPhone)||!!(area&&key(d.area)===area&&!differentPhones);
  });
  if(duplicate){id=duplicate.id;old=await db.prepare('SELECT * FROM leads WHERE id=?').bind(id).first();}
 }
 const previous=old?JSON.parse(old.data):{};
 let incoming={...lead};
 if(upload){
  for(const k of ['email_verified','outreach_approved','details_approved','logo_verified','public_preview'])delete incoming[k];
  incoming=Object.fromEntries(Object.entries(incoming).filter(([,v])=>v!==''&&v!==null&&v!==undefined));
 }
 const merged={...previous,...incoming,id,opt_out:previous.opt_out===true||lead.opt_out===true};
 if(upload){
  const changedEmail=(merged.business_email||'').toLowerCase()!==(previous.business_email||'').toLowerCase();
  if(!old||changedEmail){merged.email_verified=false;merged.outreach_approved=false;}
  if(!old){merged.public_preview=false;merged.logo_verified=false;merged.details_approved=false;}
  if(merged.logo_url!==previous.logo_url)merged.logo_verified=false;
  if(upload.approveOutreach===true&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(merged.business_email||'')&&safeURL(incoming.email_source_url)){
   merged.email_verified=true;merged.outreach_approved=true;merged.email_source_url=safeURL(incoming.email_source_url);
   merged.email_verification_method='owner_confirmed_upload';merged.email_verified_at=now();
  }
  merged.import_source='nightly_upload';
  merged.lead_id=id;
 }
 const fields=['business_name','address','area','business_services','business_phone','whatsapp_number','business_email','logo_url','logo_verified','approved_images','opening_hours','template_override'];
 merged.needs_rebuild=old&&['built','published'].includes(old.website_status)&&fields.some(k=>JSON.stringify(previous[k]??'')!==JSON.stringify(merged[k]??''));
 const template=chooseTemplate(merged);
 await db.prepare("INSERT INTO leads(id,data,template,updated_at) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,template=excluded.template,updated_at=excluded.updated_at").bind(id,JSON.stringify(merged),template,now()).run();
 if(upload){const index=upload.existing.findIndex(r=>r.id===id),value={id,data:JSON.stringify(merged)};if(index>=0)upload.existing[index]=value;else upload.existing.push(value);}
 return id;
}
export async function handle(req,env){
 const url=new URL(req.url),path=url.pathname,origin=url.origin,db=env.DB;
 if(path==='/health')return json({ok:true,mode:env.LOCAL_DEV==='1'?'local_preview':'hosted',time:now()});
 if((path.startsWith('/templates/')&&!path.endsWith('/index.html'))||['/dashboard.css','/dashboard.js','/login.html','/excel-import.js','/vendor/jszip.min.js'].includes(path))return env.ASSETS.fetch(req);
 if(path==='/api/login'&&req.method==='POST'){
  if(!env.ADMIN_PASSWORD_HASH||!env.SESSION_SECRET)return json({error:'Owner login is not configured'},503);
  const key=await digest((req.headers.get('CF-Connecting-IP')||'local')+env.SESSION_SECRET),time=Date.now();
  let rate=await db.prepare('SELECT * FROM login_limits WHERE key=?').bind(key).first();
  if(rate&&rate.reset_at>time&&rate.attempts>=5)return json({error:'Too many attempts. Try again in 5 minutes.'},429);
  await db.prepare('INSERT INTO login_limits VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN reset_at<? THEN 1 ELSE attempts+1 END,reset_at=CASE WHEN reset_at<? THEN excluded.reset_at ELSE reset_at END').bind(key,time+300000,time,time).run();
  const {password}=await req.json();if(await digest(String(password||''))!==env.ADMIN_PASSWORD_HASH)return json({error:'Incorrect password'},401);
  const exp=String(time+8*3600000),cookie=exp+'.'+await sign(exp,env.SESSION_SECRET);
  return new Response('{"ok":true}',{headers:{'Content-Type':'application/json','Set-Cookie':`picpulse_session=${cookie}; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`}});
 }
 const auth=await authenticated(req,env);
 if(path.startsWith('/samples/')){
  const id=path.split('/')[2];const row=await db.prepare('SELECT * FROM leads WHERE id=?').bind(id).first();if(!row)return json({error:'Not found'},404);
  const lead=JSON.parse(row.data);if(!auth&&lead.public_preview!==true)return json({error:'This sample is private'},401);
  const source=await env.ASSETS.fetch(new Request(origin+'/templates/'+row.template+'/index.html'));
  return new Response(renderCompany(await source.text(),lead,origin),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer'}});
 }
 if(!auth){if(path.startsWith('/api/'))return json({error:'Owner authentication required'},401);return env.ASSETS.fetch(new Request(origin+'/login.html'))}
 if(req.method!=='GET'&&req.method!=='HEAD'&&!req.headers.get('Authorization')){
  const incoming=req.headers.get('Origin');if(incoming!==origin)return json({error:'Origin check failed'},403);
 }
 if(path==='/api/state'){
  const rows=(await db.prepare('SELECT * FROM leads ORDER BY updated_at DESC').all()).results;
  const leads=rows.map(r=>({...r,data:JSON.parse(r.data)}));
  const automated=await db.prepare("SELECT COUNT(*) AS count FROM events WHERE type='building' AND detail LIKE '%\"actor\":\"automation\"%'").first();
  const sentOffers=(await db.prepare("SELECT m.id,m.lead_id,m.thread_id,m.sender AS recipient,m.subject,m.body,m.created_at,json_extract(l.data,'$.business_name') AS business_name,l.email_status FROM messages m LEFT JOIN leads l ON l.id=m.lead_id WHERE m.direction='outbound' ORDER BY m.created_at DESC LIMIT 500").all()).results;
  const sentTotal=await db.prepare("SELECT COUNT(*) AS count FROM messages WHERE direction='outbound'").first();
  return json({leads,sent_offers:sentOffers,sent_total:sentTotal.count,events:(await db.prepare('SELECT * FROM events ORDER BY created_at DESC LIMIT 100').all()).results,messages:(await db.prepare('SELECT * FROM messages ORDER BY created_at DESC LIMIT 100').all()).results,mode:env.LOCAL_DEV==='1'?'local_preview':'hosted',n8n_connected:!!env.N8N_WEBSITE_WORKFLOW_URL||!!env.N8N_RUN_URL||automated.count>0,reply_monitor_configured:!!env.N8N_REPLY_WORKFLOW_URL,n8n_run_enabled:!!env.N8N_RUN_URL&&!!(env.N8N_RUN_TOKEN||env.API_KEY),automatic_sending:env.AUTOMATIC_SENDING_ENABLED==='1'});
 }
 if(path==='/api/outbound-threads')return json({threads:(await db.prepare("SELECT DISTINCT thread_id FROM messages WHERE direction='outbound'").all()).results.map(x=>x.thread_id)});
 if(path==='/api/leads'&&req.method==='POST'){
  const body=await req.json();const leads=Array.isArray(body)?body:body.leads||[body];if(leads.length>100)throw Error('Import at most 100 leads at a time');
  for(const l of leads){chooseTemplate(l);if(!/^[a-zA-Z0-9_-]{1,80}$/.test(String(l.id||l.lead_id||''))||!(l.business_name||l.name))throw Error('Invalid lead ID or missing business name')}
  const upload=body.source==='nightly_upload'?{approveOutreach:body.approve_verified_outreach===true,existing:(await db.prepare('SELECT id,data FROM leads').all()).results}:null;
  const ids=[];for(const l of leads)ids.push(await saveLead(db,l,upload));await event(db,null,'leads_imported',{count:ids.length,source:upload?'nightly_upload':'api'});
  let automation={requested:false};
  if(upload&&body.run_after_import===true){
   try{
    if(!env.N8N_RUN_URL||!(env.N8N_RUN_TOKEN||env.API_KEY))throw Error('n8n connection not configured');
    const r=await fetch(env.N8N_RUN_URL,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+(env.N8N_RUN_TOKEN||env.API_KEY)},body:JSON.stringify({action:'process_queued',lead_ids:ids,source:'nightly_upload'})});
    if(!r.ok)throw Error('n8n did not accept the run');
    automation={requested:true};await event(db,null,'run_requested',{source:'nightly_upload',count:ids.length});
   }catch(e){automation={requested:false,error:e.message};await event(db,null,'automation_start_failed',{message:e.message});}
  }
  return json({ids,automation});
 }
 if(path==='/api/build'&&req.method==='POST'){
  const {lead_id}=await req.json();const row=await db.prepare('SELECT * FROM leads WHERE id=?').bind(lead_id).first();if(!row)return json({error:'Unknown lead'},404);
  await db.prepare("UPDATE leads SET website_status='building',updated_at=? WHERE id=?").bind(now(),lead_id).run();await event(db,lead_id,'building',{template:row.template,actor:req.headers.get('Authorization')==='Bearer '+env.API_KEY?'automation':'owner'});
  try{
   const source=await env.ASSETS.fetch(new Request(origin+'/templates/'+row.template+'/index.html'));if(!source.ok)throw Error('Template file missing');
   const markup=renderCompany(await source.text(),JSON.parse(row.data),origin);
   if(/\{\{[A-Z_]+\}\}/.test(markup))throw Error('Unresolved personalization field');
   const builtData={...JSON.parse(row.data),needs_rebuild:false};await db.prepare("UPDATE leads SET website_status='built',data=?,updated_at=? WHERE id=?").bind(JSON.stringify(builtData),now(),lead_id).run();await event(db,lead_id,'built',{template:row.template});
   return json({id:lead_id,template:row.template,html:markup,preview_url:origin+'/samples/'+lead_id,missing_details:!JSON.parse(row.data).details_approved});
  }catch(e){await db.prepare("UPDATE leads SET website_status='error',updated_at=? WHERE id=?").bind(now(),lead_id).run();await event(db,lead_id,'error',{message:e.message});throw e}
 }
 if(path==='/api/events'&&req.method==='POST'){
  const data=await req.json();const {lead_id,type}=data;const row=await db.prepare('SELECT * FROM leads WHERE id=?').bind(lead_id).first();if(!row)return json({error:'Unknown lead'},404);
  if(data.event_id&&await db.prepare('SELECT id FROM events WHERE id=?').bind(data.event_id).first())return json({duplicate:true});
  if(['publishing','published','error'].includes(type)){
   if(type==='published'&&(!safeURL(data.site_url)||data.deployment_state!=='ready'))throw Error('A ready deployment and HTTPS site URL are required');
   const l=JSON.parse(row.data);
   if(data.public_preview===true){
    if(env.AUTOMATIC_SENDING_ENABLED!=='1'||l.email_verified!==true||l.outreach_approved!==true||l.opt_out||l.official_website_url||!safeURL(l.email_source_url))throw Error('Verified, approved outreach is required before automatic publication');
    l.public_preview=true;
   }
   if(data.site_url)l.site_url=safeURL(data.site_url);
   await db.prepare('UPDATE leads SET website_status=?,data=?,updated_at=? WHERE id=?').bind(type,JSON.stringify(l),now(),lead_id).run();
  }else if(type==='email_sent'){
   if(!data.message_id||!data.thread_id)throw Error('Gmail message and thread ID required');
   await db.prepare("UPDATE leads SET email_status='accepted_by_gmail',updated_at=? WHERE id=?").bind(now(),lead_id).run();
   await db.prepare('INSERT OR IGNORE INTO messages VALUES(?,?,?,?,?,?,?,?)').bind(data.message_id,lead_id,data.thread_id,'outbound',data.recipient||'',data.subject||'',data.body||'',now()).run();
   await db.prepare("UPDATE send_locks SET status='sent' WHERE lead_id=?").bind(lead_id).run();
  }else if(['email_held','email_error','bounced'].includes(type))await db.prepare('UPDATE leads SET email_status=?,updated_at=? WHERE id=?').bind(type,now(),lead_id).run();
  else throw Error('Unsupported event type');
  await event(db,lead_id,type,data,data.event_id);return json({ok:true});
 }
 if(path==='/api/replies'&&req.method==='POST'){
  const m=await req.json();if(!m.message_id||!m.thread_id)throw Error('Reply IDs required');
  const known=await db.prepare("SELECT lead_id FROM messages WHERE thread_id=? AND direction='outbound'").bind(m.thread_id).first();
  const id=known?.lead_id||null;
  const sender=String(m.sender||''),body=String(m.body||'').slice(0,20000);
  const result=await db.prepare('INSERT OR IGNORE INTO messages VALUES(?,?,?,?,?,?,?,?)').bind(m.message_id,id,m.thread_id,'inbound',sender,m.subject||'',body,m.received_at||now()).run();
  if(id&&result.meta.changes){
   const row=await db.prepare('SELECT data FROM leads WHERE id=?').bind(id).first();const l=JSON.parse(row.data),email=l.business_email||l.email||'';
   const address=sender.match(/<([^<>]+)>/)?.[1]||sender.trim();
   const verifiedSender=address.toLowerCase()===email.toLowerCase()&&!!email;
   const bounced=/mailer-daemon|postmaster/i.test(address)&&/delivery|undeliver|failure|returned/i.test((m.subject||'')+' '+body);
   const optout=verifiedSender&&/\b(unsubscribe|no thanks|stop emailing|remove me|do not contact)\b/i.test(body);
   if(optout){l.opt_out=true;await db.prepare('UPDATE leads SET data=? WHERE id=?').bind(JSON.stringify(l),id).run()}
   await db.prepare("UPDATE leads SET email_status=?,updated_at=? WHERE id=?").bind(bounced?'bounced':optout?'opted_out':verifiedSender?'replied':'reply_needs_review',now(),id).run();await event(db,id,bounced?'bounced':optout?'opted_out':'reply_received',{message_id:m.message_id,verified_sender:verifiedSender});
  }return json({matched:!!id});
 }
 if(path==='/api/claim-send'&&req.method==='POST'){
  const {lead_id,campaign}=await req.json();const row=await db.prepare('SELECT * FROM leads WHERE id=?').bind(lead_id).first();if(!row)return json({allowed:false,reason:'Unknown lead'});
  const l=JSON.parse(row.data),email=l.business_email||l.email||'';
  if(l.opt_out||l.outreach_approved===false||l.official_website_url||l.email_verified!==true||!email||row.website_status!=='published'||l.public_preview!==true)return json({allowed:false,reason:'Recipient, publication, public access or suppression gate not passed'});
  const result=await db.prepare("INSERT OR IGNORE INTO send_locks VALUES(?,?,'claimed',?)").bind(lead_id,campaign||'initial',now()).run();
  return json({allowed:result.meta.changes===1,reason:result.meta.changes===1?'Claimed':'Existing claim. Reconcile Gmail before another send.'});
 }
 if(path==='/api/run'&&req.method==='POST'){
  if(!env.N8N_RUN_URL||!(env.N8N_RUN_TOKEN||env.API_KEY))return json({error:'n8n connection not configured'},409);
  const payload=await req.json();const r=await fetch(env.N8N_RUN_URL,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+(env.N8N_RUN_TOKEN||env.API_KEY)},body:JSON.stringify(payload)});
  if(!r.ok){await event(db,null,'automation_start_failed',{status:r.status,source:'dashboard'});return json({error:'n8n did not accept the run (HTTP '+r.status+'). Check the workflow and n8n account status.'},502)}await event(db,null,'run_requested',payload);return json({accepted:true});
 }
 if(path.startsWith('/api/'))return json({error:'Not found'},404);
 return env.ASSETS.fetch(req);
}
export default{async fetch(req,env){try{return await handle(req,env)}catch(e){return json({error:e.message||'Request failed'},400)}}};
