import fs from 'node:fs';import {renderCompany} from './worker.mjs';
const data=JSON.parse(fs.readFileSync(new URL('seed-leads.json',import.meta.url)));fs.mkdirSync(new URL('public/qa/',import.meta.url),{recursive:true});
for(const [key,category] of [['01-nailsy','nail_salon'],['02-tastyc','restaurant'],['03-grand-restaurant','restaurant_cafe'],['04-elysia','hair_beauty_salon']]){
 const lead=data.find(l=>l.category===category)||{business_name:'PicPulse Restaurant Design Preview',category,address:'Location awaiting confirmation',area:'Colombo',business_services:'Menu consultation; Table inquiries'};
 const source=fs.readFileSync(new URL('public/templates/'+key+'/index.html',import.meta.url),'utf8');fs.writeFileSync(new URL('public/qa/'+key+'.html',import.meta.url),renderCompany(source,lead,'http://127.0.0.1:8098'));
}
