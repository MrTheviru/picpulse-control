const tag=(el,name)=>Array.from(el.getElementsByTagNameNS('*',name));
function xml(s){const doc=new DOMParser().parseFromString(s,'application/xml');if(doc.getElementsByTagName('parsererror').length)throw Error('Invalid spreadsheet XML');return doc}
function csv(s){const rows=[];let row=[],cell='',quote=false;for(let i=0;i<s.length;i++){let c=s[i];if(c==='"'){if(quote&&s[i+1]==='"'){cell+='"';i++}else quote=!quote}else if(c===','&&!quote){row.push(cell);cell=''}else if((c==='\n'||c==='\r')&&!quote){if(c==='\r'&&s[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell=''}else cell+=c}if(cell||row.length){row.push(cell);rows.push(row)}if(quote)throw Error('Unclosed CSV quote');return rows}
export async function readLeadFile(file){
 if(file.size>8*1024*1024)throw Error('Use a lead file smaller than 8 MB');
 if(/\.json$/i.test(file.name)){let d=JSON.parse(await file.text());return {records:Array.isArray(d)?d:d.leads,source:file.name}}
 let rows,source=file.name;
 if(/\.csv$/i.test(file.name))rows=csv((await file.text()).replace(/^\uFEFF/,''));
 else if(/\.xlsx$/i.test(file.name)){
  const zip=await JSZip.loadAsync(await file.arrayBuffer());
  const get=async name=>{const f=zip.file(name);if(!f)throw Error('Missing Excel entry '+name);const text=await f.async('string');if(text.length>12000000)throw Error('Spreadsheet is too large');return xml(text)};
  const book=await get('xl/workbook.xml'),rels=await get('xl/_rels/workbook.xml.rels');let sheets=tag(book,'sheet');const sheet=sheets.find(s=>s.getAttribute('name').toLowerCase()==='leads')||sheets[0];if(!sheet)throw Error('Workbook has no sheets');
  const id=sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id'),relation=tag(rels,'Relationship').find(r=>r.getAttribute('Id')===id);if(!relation)throw Error('Worksheet relationship is missing');
  let target=relation.getAttribute('Target');if(relation.getAttribute('TargetMode')==='External'||target.includes('..'))throw Error('External worksheet links are unsupported');target=target.startsWith('/')?target.slice(1):'xl/'+target;
  const shared=zip.file('xl/sharedStrings.xml')?tag(await get('xl/sharedStrings.xml'),'si').map(s=>tag(s,'t').map(t=>t.textContent).join('')):[];
  const doc=await get(target);rows=[];
  for(const r of tag(doc,'row')){const vals=[];for(const c of tag(r,'c')){const letters=(c.getAttribute('r')||'A').replace(/[0-9]/g,'');let col=0;for(const letter of letters)col=col*26+letter.charCodeAt(0)-64;let value=tag(c,'v')[0]?.textContent||'';const type=c.getAttribute('t');if(type==='s')value=shared[Number(value)]||'';else if(type==='inlineStr')value=tag(c,'t').map(t=>t.textContent).join('');else if(type==='b')value=value==='1';vals[col-1]=value}rows.push(vals);if(rows.length>501)throw Error('Import at most 500 rows per file')}
  source+= ' · '+sheet.getAttribute('name');
 }else throw Error('Please use .xlsx, .csv or .json. Save older .xls files as .xlsx first.');
 const first=rows.findIndex(r=>r.some(v=>String(v||'').trim()));if(first<0)throw Error('No spreadsheet data');const header=rows[first].map(v=>String(v||'').trim().toLowerCase().replace(/[\s-]+/g,'_'));const aliases={name:'business_name',company:'business_name',company_name:'business_name',phone:'business_phone',phone_number:'business_phone',email:'business_email',email_address:'business_email',location:'area',id:'lead_id',type:'category',logo:'logo_url'};
 const keys=header.map(k=>aliases[k]||k);if(!keys.includes('business_name')||!keys.includes('category'))throw Error('Include business_name (or name) and category columns');
 const records=rows.slice(first+1).filter(r=>r.some(v=>v!==undefined&&v!=='')).map(r=>Object.fromEntries(keys.map((k,i)=>[k,r[i]??'']).filter(([k])=>k)));
 return {records,source};
}
export function normalizeImport(records){
 if(!Array.isArray(records))throw Error('File must contain a list of business records');
 const valid=[],errors=[],seen=new Set();
 for(let i=0;i<records.length;i++){
  let r={...records[i]},name=String(r.business_name||r.name||'').trim(),cat=String(r.category||'').trim().toLowerCase().replace(/[\s-]+/g,'_');
  cat=({salon:'hair_beauty_salon',hair_salon:'hair_beauty_salon',beauty_salon:'hair_beauty_salon',restaurant:'restaurant_cafe',cafe:'restaurant_cafe',burger_shop:'burger_shop'})[cat]||cat;
  if(!name||!['nail_salon','hair_beauty_salon','restaurant_cafe','burger_shop'].includes(cat)){errors.push(`Row ${i+2}: business name or allowed category missing`);continue}
  let id=String(r.lead_id||r.id||('LEAD-'+(name+'-'+(r.area||'')).toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,65)));
  if(!/^[a-zA-Z0-9_-]{1,80}$/.test(id)||seen.has(id)){errors.push(`Row ${i+2}: invalid or duplicate lead ID ${id}`);continue}seen.add(id);
  for(const k of ['recent_activity_date','researched_on'])if(/^\d+(\.\d+)?$/.test(String(r[k]||'')))r[k]=new Date(Date.UTC(1899,11,30)+Number(r[k])*86400000).toISOString().slice(0,10);
  r={...r,id,lead_id:id,business_name:name,name,category:cat,business_phone:String(r.business_phone||''),business_email:String(r.business_email||'').trim(),email_verified:false,details_approved:false,logo_verified:false,public_preview:false};
  valid.push(r);
 }
 if(!valid.length)throw Error(errors.join('; ')||'No leads found');if(valid.length>100)throw Error('Import at most 100 businesses per batch');
 return {valid,errors};
}
