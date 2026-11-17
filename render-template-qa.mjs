import fs from 'node:fs';
import {renderCompany,chooseTemplate} from './worker.mjs';
const keys=['01-nailsy','02-tastyc','03-grand-restaurant','04-elysia'];
const leads=JSON.parse(fs.readFileSync('seed-leads.json'));
const contacts=JSON.parse(fs.readFileSync('email-primary-observations.json'));
fs.mkdirSync('public/qa',{recursive:true});
for(const [i,id] of ['PP-L004','PP-L013','PP-L011','PP-L002'].entries()){
  const lead={...leads.find(l=>l.id===id),...contacts.find(l=>l.id===id)};
  const key=keys[i];
  const markup=renderCompany(fs.readFileSync('public/templates/'+key+'/index.html','utf8'),lead,'http://127.0.0.1:8098');
  if (/\{\{[A-Z_0-9]+\}\}/.test(markup)) throw Error('Unresolved template field: '+key);
  fs.writeFileSync('public/qa/'+key+'.html',markup);
}
console.log('Rendered four QA pages. public/qa is excluded from deployment.');
for(const id of ['PP-L002','PP-L004','PP-L005','PP-L012','PP-L015']){
 const lead={...leads.find(l=>l.id===id),...contacts.find(l=>l.id===id)};
 const markup=renderCompany(fs.readFileSync('public/templates/'+chooseTemplate(lead)+'/index.html','utf8'),lead,'http://127.0.0.1:8098');
 fs.writeFileSync('public/qa/'+id+'.html',markup);
}
console.log('Rendered five public-company review fixtures.');
