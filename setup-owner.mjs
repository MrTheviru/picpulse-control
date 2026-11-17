import http from 'node:http';
import {randomBytes,createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
const nonce=randomBytes(24).toString('hex');
let busy=false,finished=false;
const markup=`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>PicPulse owner setup</title><style>body{font:16px system-ui;background:#10141b;color:#f4f5f7;max-width:580px;margin:8vh auto;padding:24px}label{display:block;margin-top:25px}input{display:block;box-sizing:border-box;width:100%;padding:14px;margin-top:8px;border:1px solid #4a5263;border-radius:8px;background:#202633;color:white}button{background:#d8f28e;border:0;border-radius:8px;padding:14px 22px;margin-top:26px;font-weight:700}p{line-height:1.6;color:#bdc7d7}#result{white-space:pre-wrap}</style><h1>Set up PicPulse access</h1><p>This setup page runs only on this Mac. Your password is hashed before storage. The automation key connects n8n to PicPulse; save it in your password manager and use the same key when creating the n8n Bearer credential.</p><form><label>Dashboard password (at least 12 characters)<input name="password" type="password" minlength="12" required autocomplete="new-password"></label><label>Confirm dashboard password<input name="confirm" type="password" required autocomplete="new-password"></label><label>Automation API key (choose at least 32 characters)<input name="apiKey" type="password" minlength="32" required autocomplete="off"></label><input type="hidden" name="nonce" value="${nonce}"><button>Save access settings to Cloudflare</button></form><p id="result"></p><script>document.querySelector('form').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),o=Object.fromEntries(f);if(o.password!==o.confirm){document.querySelector('#result').textContent='Passwords must match.';return}const b=e.target.querySelector('button');b.disabled=true;document.querySelector('#result').textContent='Saving securely to Cloudflare…';try{const r=await fetch('/configure',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(o)});const j=await r.json();document.querySelector('#result').textContent=j.message;if(r.ok){e.target.reset();e.target.hidden=true}else b.disabled=false}catch{document.querySelector('#result').textContent='Setup failed. Please try again.';b.disabled=false}};</script>`;
const server=http.createServer(async(req,res)=>{
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
 if(req.method==='GET'&&req.url==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(finished?'<h1>PicPulse access is configured. You can close this local setup page.</h1>':markup);return}
 res.setHeader('Content-Type','application/json');
 if(req.method!=='POST'||req.url!=='/configure'||req.headers.origin!=='http://127.0.0.1:8099'){res.writeHead(403);res.end('{"message":"Request refused"}');return}
 let body='';for await(const chunk of req){body+=chunk;if(body.length>12000){res.writeHead(413);res.end('{"message":"Request too large"}');return}}
 try{
  const data=JSON.parse(body);if(finished||busy||data.nonce!==nonce)throw Error('Setup unavailable');
  if(typeof data.password!=='string'||data.password.length<12||data.password!==data.confirm||typeof data.apiKey!=='string'||data.apiKey.length<32)throw Error('Use a matching password of at least 12 characters and an API key of at least 32 characters.');
  busy=true;
  const secrets={ADMIN_PASSWORD_HASH:createHash('sha256').update(data.password).digest('hex'),API_KEY:data.apiKey,SESSION_SECRET:randomBytes(48).toString('hex')};
  const child=spawn(process.execPath,['node_modules/wrangler/bin/wrangler.js','secret','bulk'],{cwd:import.meta.dirname,stdio:['pipe','pipe','pipe']});
  child.stdout.resume();child.stderr.resume();child.stdin.end(JSON.stringify(secrets));
  const code=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('close',resolve)});
  if(code!==0)throw Error('Cloudflare did not save the access settings. Please try again.');
  finished=true;res.end(JSON.stringify({message:'Access settings saved successfully. Open the hosted PicPulse dashboard and sign in with your password. Keep your automation key for the n8n connection.'}));console.log('Owner access configured successfully. No credentials logged.');
 }catch(e){res.writeHead(400);res.end(JSON.stringify({message:e.message}))}finally{busy=false}
});
server.listen(8099,'127.0.0.1',()=>console.log('Owner setup: http://127.0.0.1:8099/'));
setTimeout(()=>server.close(),30*60*1000).unref();
