from pathlib import Path
import json,uuid,copy
ROOT=Path(__file__).resolve().parent
BASE=json.loads((ROOT.parent/'picpulse-pilot/n8n/picpulse-workflow.json').read_text())
w=copy.deepcopy(BASE);w['name']='PicPulse Control — Four Template Websites';w['active']=False
w.pop('id',None);w.pop('versionId',None);w.pop('pinData',None)
for n in w['nodes']:n.pop('credentials',None)
remove={'Connected lead feed?','Fetch permitted leads','Use saved Colombo leads','Filter, deduplicate and rank','Check website bundle'}
w['nodes']=[n for n in w['nodes'] if n['name'] not in remove]
w['connections']={name:conn for name,conn in w['connections'].items() if name not in remove}
for name,conn in w['connections'].items():
 for branch in conn.get('main',[]):branch[:]=[edge for edge in branch if edge['node'] not in remove]
nodes={n['name']:n for n in w['nodes']}
def edge(a,b,output=0):
 branches=w['connections'].setdefault(a,{'main':[]})['main']
 while len(branches)<=output:branches.append([])
 branches[output].append({'node':b,'type':'main','index':0})
def node(name,kind,params,pos):
 n={'id':str(uuid.uuid4()),'name':name,'type':'n8n-nodes-base.'+kind,'typeVersion':4.2 if kind=='httpRequest' else 2,'position':pos,'parameters':params}
 w['nodes'].append(n);nodes[name]=n;return name
def http(name,route,body,pos,method='POST'):
 return node(name,'httpRequest',{'method':method,'url':"={{ $('PicPulse settings').first().json.consoleUrl + '"+route+"' }}",'authentication':'genericCredentialType','genericAuthType':'httpBearerAuth',**({'sendBody':True,'specifyBody':'json','jsonBody':body} if method=='POST' else {}),'options':{'timeout':120000}},pos)
nodes['PicPulse settings']['parameters']['jsCode']="""return [{json:{
 mode:'preview', consoleUrl:'https://picpulse-control.thevirulakwan.workers.dev',
 hostingConnected:false,gmailConnected:false,sendEmails:false,publicLinksVerified:false,
 maxWebsitesPerRun:10,maxEmailsPerRun:3,
 netlifySiteId:'433289d3-11d7-44c9-a5c3-6abfcaec7814',
 setupPriceLKR:20000,quarterlyPriceLKR:4000,optOutEmails:[]
}}];"""
fetch=http('Read dashboard businesses','/api/state','',[480,100],'GET');edge('PicPulse settings',fetch)
select=node('Select eligible business records','code',{'jsCode':"""const cfg=$('PicPulse settings').first().json;
const rows=$input.first().json.leads||[];
return rows.filter(r=>!r.data.official_website_url&&!r.data.opt_out&&(r.website_status!=='published'||r.data.needs_rebuild)).slice(0,cfg.maxWebsitesPerRun).map(r=>({json:{...r.data,id:r.id,name:r.data.business_name||r.data.name,email:r.data.business_email||'',email_verified:r.data.email_verified===true,template:r.template,pagePath:'/prospects/'+r.id+'.html'}}));"""},[700,100]);edge(fetch,select)
build=nodes['Build websites from PicPulse templates'];build['type']='n8n-nodes-base.httpRequest';build['typeVersion']=4.2
build['parameters']={'method':'POST','url':"={{ $('PicPulse settings').first().json.consoleUrl + '/api/build' }}",'authentication':'genericCredentialType','genericAuthType':'httpBearerAuth','sendBody':True,'specifyBody':'json','jsonBody':"={{ {lead_id:$json.id} }}",'options':{'timeout':120000}}
edge(select,build['name']);w['connections'][build['name']]={'main':[]}
pack=node('Package personalized company pages','code',{'jsCode':"""const binary={};const results=$input.all();const leads=$('Select eligible business records').all().map(x=>x.json);let n=0;
for(const r of results){const d=r.json;if(!d.html||!d.id)throw Error('Template service did not return a company page');binary['file'+n++]={data:Buffer.from(d.html).toString('base64'),fileName:'prospects/'+d.id+'.html',mimeType:'text/html',fileExtension:'html'};}
if(!n)throw Error('No company pages returned');
return [{json:{cfg:$('PicPulse settings').first().json,leads,binaryFields:Object.keys(binary).join(','),websiteCount:n},binary}];"""},[1480,100]);edge(build['name'],pack);edge(pack,'Package deployable ZIP')
for name in ['Publish ZIP to Netlify — connect credential','Read deployment status — connect credential']:
 nodes[name]['parameters']['genericAuthType']='httpBearerAuth'
report=node('Prepare deployment status events','code',{'jsCode':"""const d=$input.first().json;return $('Package personalized company pages').first().json.leads.map(l=>({json:{lead_id:l.id,type:'published',site_url:d.siteUrl.replace(/\\/$/,'')+l.pagePath,deployment_state:'ready',event_id:'deploy-'+d.deployId+'-'+l.id}}));"""},[3610,60])
eventNode=http('Record website publication in dashboard','/api/events',"={{ $json }}",[3830,60])
ready=w['connections']['Deployment is live?']['main'][0];ready[:]=[x for x in ready if x['node']!='Prepare eligible outreach'];edge('Deployment is live?',report,0);edge(report,eventNode);edge(eventNode,'Prepare eligible outreach')
outreach=nodes['Prepare eligible outreach']['parameters']['jsCode'];outreach=outreach.replace('const d=$input.first().json;','const d=$(\'Validate live deployment\').last().json;').replace("$('Build websites from PicPulse templates')","$('Package personalized company pages')").replace('cfg.sendEmails===true&&cfg.gmailConnected===true','cfg.sendEmails===true&&cfg.gmailConnected===true&&cfg.publicLinksVerified===true')
nodes['Prepare eligible outreach']['parameters']['jsCode']=outreach
claim=http('Claim outreach once in dashboard','/api/claim-send',"={{ {lead_id:$('Process emails one at a time').item.json.id,campaign:'initial'} }}",[5100,120]);
existing=w['connections']['Already contacted?']['main'][1];existing[:]=[x for x in existing if x['node']!='Send PicPulse offer — connect Gmail'];edge('Already contacted?',claim,1)
gate=node('Outreach claim allowed?','if',{'conditions':{'options':{'caseSensitive':True,'leftValue':'','typeValidation':'strict','version':2},'conditions':[{'id':str(uuid.uuid4()),'leftValue':'={{ $json.allowed }}','rightValue':'','operator':{'type':'boolean','operation':'true','singleValue':True}}],'combinator':'and'},'options':{}},[5300,120]);nodes[gate]['typeVersion']=2.2
edge(claim,gate);edge(gate,'Send PicPulse offer — connect Gmail',0);edge(gate,'Skip duplicate outreach',1)
nodes['Record confirmed email result']['parameters']['jsCode']="""const r=$input.first().json;if(!r.id||!r.threadId)throw Error('Gmail send not confirmed');return [{json:{...$('Process emails one at a time').item.json,status:'accepted_by_gmail',gmailMessageId:r.id,gmailThreadId:r.threadId,sentAt:new Date().toISOString()}}];"""
mailReport=http('Record Gmail acceptance in dashboard','/api/events',"={{ {lead_id:$json.id,type:'email_sent',message_id:$json.gmailMessageId,thread_id:$json.gmailThreadId,recipient:$json.email,subject:$json.subject,body:$json.message,event_id:'gmail-'+$json.gmailMessageId} }}",[5600,40]);w['connections']['Record confirmed email result']={'main':[]};edge('Record confirmed email result',mailReport);edge(mailReport,'Process emails one at a time')
for n in w['nodes']:
 if n['type']=='n8n-nodes-base.stickyNote': n['parameters']['content']='# PicPulse Control\nFour company templates are rendered by your authenticated dashboard. Select the console Bearer Auth credential on dashboard HTTP nodes, Netlify Bearer Auth on hosting nodes, and Gmail OAuth on Gmail nodes.\n\nThis portable workflow is inactive. Hosting and Gmail nodes are disabled; configure and test before enabling. Public URL verification and verified recipient details are required for sends. No secrets are included.'
(ROOT/'n8n-four-template-workflow.json').write_text(json.dumps(w,indent=2))
# A manual/polled inbox bridge can run independently from website generation.
reply={'name':'PicPulse Control — Gmail Reply Monitor','nodes':[],'connections':{},'active':False,'settings':{'timezone':'Asia/Colombo','executionOrder':'v1'}}
def rn(name,kind,params,pos,version=2,disabled=False):
 reply['nodes'].append({'id':str(uuid.uuid4()),'name':name,'type':'n8n-nodes-base.'+kind,'typeVersion':version,'position':pos,'parameters':params,'disabled':disabled})
def re(a,b):reply['connections'][a]={'main':[[{'node':b,'type':'main','index':0}]]}
rn('Check inbox manually','manualTrigger',{},[0,0],1)
rn('Every 15 minutes — disabled','scheduleTrigger',{'rule':{'interval':[{'field':'minutes','minutesInterval':15}]}},[0,200],1.2,True)
rn('Console settings','code',{'jsCode':"return [{json:{consoleUrl:'https://picpulse-control.thevirulakwan.workers.dev'}}];"},[230,80]);re('Check inbox manually','Console settings');re('Every 15 minutes — disabled','Console settings')
rn('Read tracked outreach threads','httpRequest',{'method':'GET','url':"={{ $('Console settings').first().json.consoleUrl + '/api/outbound-threads' }}",'authentication':'genericCredentialType','genericAuthType':'httpBearerAuth','options':{'timeout':30000}},[400,80],4.2);re('Console settings','Read tracked outreach threads')
rn('Read recent inbox messages','gmail',{'resource':'message','operation':'getAll','returnAll':False,'limit':50,'simplify':True,'filters':{'q':'in:inbox newer_than:2d'}},[580,80],2.1,True);re('Read tracked outreach threads','Read recent inbox messages')
rn('Only tracked business replies','code',{'jsCode':"const known=new Set($('Read tracked outreach threads').first().json.threads||[]);return $input.all().filter(x=>known.has(x.json.threadId));"},[780,80]);re('Read recent inbox messages','Only tracked business replies')
rn('Read matched reply content','gmail',{'resource':'message','operation':'get','messageId':'={{ $json.id }}','simplify':False},[980,80],2.1,True);re('Only tracked business replies','Read matched reply content')
rn('Normalize reply data','code',{'jsCode':"""function content(p){if(!p)return '';if(p.mimeType==='text/plain'&&p.body?.data)return Buffer.from(p.body.data,'base64').toString('utf8');const plain=(p.parts||[]).map(content).filter(Boolean).join('\\n');if(plain)return plain;if(p.mimeType==='text/html'&&p.body?.data)return Buffer.from(p.body.data,'base64').toString('utf8').replace(/<[^>]+>/g,' ');return '';}
return $input.all().filter(x=>x.json.id&&x.json.threadId).map(x=>{const m=x.json;const headers=Object.fromEntries((m.payload?.headers||[]).map(h=>[h.name.toLowerCase(),h.value]));return {json:{message_id:m.id,thread_id:m.threadId,sender:headers.from||'',subject:headers.subject||'',body:content(m.payload)||m.snippet||'',received_at:m.internalDate?new Date(Number(m.internalDate)).toISOString():new Date().toISOString()}}});"""},[1180,80]);re('Read matched reply content','Normalize reply data')
rn('Record and match replies','httpRequest',{'method':'POST','url':"={{ $('Console settings').first().json.consoleUrl + '/api/replies' }}",'authentication':'genericCredentialType','genericAuthType':'httpBearerAuth','sendBody':True,'specifyBody':'json','jsonBody':'={{ $json }}','options':{'timeout':30000}},[1380,80],4.2);re('Normalize reply data','Record and match replies')
(ROOT/'n8n-reply-monitor.json').write_text(json.dumps(reply,indent=2))
print('Prepared inactive website workflow and reply monitor; existing cloud workflow unchanged.')
