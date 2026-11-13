const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const net = require('node:net');
const { spawn } = require('node:child_process');
const { gzipSync } = require('node:zlib');
const nativeFetch=globalThis.fetch;
async function fetch(url, options){try{return await nativeFetch(url, {...options, headers: { ...options?.headers, Connection: "close" }});}catch(error){throw new Error('HTTP failure: '+(options?.method||'GET')+' '+new URL(url).pathname,{cause:error});}}

(async () => {
 const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'admission-http-'));
 const port = await new Promise(resolve => { const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));}); });
 const base = `http://127.0.0.1:${port}`;
 const secret='isolated-admission-integration-test-secret';
 const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{cwd:process.cwd(),windowsHide:true,env:{...process.env,AUTH_SECRET:secret,NEXTAUTH_SECRET:secret,ADMIN_EMAILS:'admin@example.test',ADMISSIONS_STORAGE_DIR:temp,PB_URL:'',NEXT_PUBLIC_PB_URL:'',PB_ADMIN_EMAIL:'',PB_ADMIN_PASSWORD:'',VERCEL:''},stdio:['ignore','pipe','pipe']});
 let logs='';child.stdout.on('data',d=>{logs+=d;});child.stderr.on('data',d=>{logs+=d;});
 try {
  let ready=false;for(let i=0;i<80;i++){try{if((await fetch(base+'/api/admissions')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,250));}
  assert.ok(ready,'Server did not start: '+logs.slice(-1000));
  const {encode}=await import('next-auth/jwt');
  const cookie=async email=>'authjs.session-token='+await encode({token:{email,name:'Integration Test'},secret,salt:'authjs.session-token'});
  const admin=await cookie('admin@example.test'),other=await cookie('other@example.test');
  const endpoint=base+'/api/platform/admin/admissions';
  assert.equal((await fetch(endpoint)).status,401);
  assert.equal((await fetch(endpoint,{headers:{Cookie:other}})).status,403);
  const initial=await (await fetch(base+'/api/admissions')).json();
  const preview=async(rows,name='test.csv',extra={})=>{const form=new FormData();form.set('action','preview');form.set('fileName',name);form.set('sheetName','전체');form.set('file',new Blob([gzipSync(JSON.stringify(rows))]),'data.gz');return fetch(endpoint,{method:'POST',headers:{Cookie:admin,...extra},body:form});};
  const mutate=async(action,id)=>fetch(endpoint,{method:'PUT',headers:{Cookie:admin,'Content-Type':'application/json'},body:JSON.stringify({action,id})});
  const row={univ:'검증대학교',dept:'수학과',type:'학생부교과',name:'일반전형',cutoff26:2.5,reference26:'최종등록자70%컷'};
  assert.equal((await preview([row],'test.csv',{Origin:'https://untrusted.example'})).status,403);
  assert.equal((await preview([{univ:'대학'}])).status,400);
  const firstResponse=await preview([row]);assert.equal(firstResponse.status,200,await firstResponse.clone().text());const first=await firstResponse.json();
  assert.deepEqual((await (await fetch(base+'/api/admissions')).json()).rows,initial.rows,'Preview must not publish');
  assert.equal((await mutate('publish',first.draftId)).status,200);
  const applied=await fetch(base+'/api/admissions');assert.equal(applied.headers.get('content-encoding'),'gzip');assert.equal((await applied.json()).rows[0].univ,row.univ);
  const second=await (await preview([{...row,univ:'두번째대학교'}])).json();assert.equal((await mutate('publish',second.draftId)).status,200);
  assert.equal((await mutate('rollback',first.draftId)).status,200);assert.equal((await (await fetch(base+'/api/admissions')).json()).rows[0].univ,row.univ);
  const history=await(await fetch(endpoint,{headers:{Cookie:admin}})).json();assert.equal(history.current.id,first.draftId);assert.equal(history.history.length,2);
  const diagnosis=await fetch(base+'/api/diagnosis',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({studentIndex:2.5,choices:[{university:row.univ,department:row.dept,admission_type:row.type,track_name:row.name}]})});
  assert.equal(diagnosis.status,200);assert.equal((await diagnosis.json()).results[0].y26,'2.50');
  assert.equal((await mutate('publish','not-a-real-id')).status,400);
  assert.equal((await(await fetch(endpoint,{headers:{Cookie:admin}})).json()).current.id,first.draftId);
  const workbook=process.argv.slice(2).find(value=>/\.xlsx$/i.test(value));
  if(workbook){
   const Module=require('node:module'),ts=require('typescript'),XLSX=require('xlsx');const filename=path.resolve('lib/admissions/import.ts');const m=new Module(filename,module);m.paths=module.paths;m._compile(ts.transpileModule(await fs.readFile(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,filename);
   const parsed=m.exports.parseWorkbook(XLSX.readFile(workbook));const result=await preview(parsed.rows,path.basename(workbook));assert.equal(result.status,200,await result.clone().text());const draft=await result.json();assert.equal(draft.preview.rowCount,26410);assert.equal(draft.preview.universityCount,164);assert.equal((await mutate('publish',draft.draftId)).status,200);
   const response=await fetch(base+'/api/admissions');assert.equal(response.headers.get('content-encoding'),'gzip');assert.equal((await response.json()).rows.length,26410);
   console.log('PASS: V7.24 full workbook -> authenticated preview -> publish -> compressed live dataset (26,410 rows, 164 universities)');
  }
  assert.equal((await fetch(base+'/api/platform/admin/access',{headers:{Cookie:admin}})).status,200);
  assert.equal((await fetch(base+'/api/platform/admin/access',{headers:{Cookie:other}})).status,403);
  assert.equal((await fetch(base+'/api/diagnosis/upload-configure',{method:'POST'})).status,401);
  assert.equal((await fetch(base+'/api/platform/history?type=diagnosis')).status,401);
  const invalid=await fetch(base+'/api/diagnosis',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({studentIndex:'abc',choices:[{university:'A',department:'B',admission_type:'C',track_name:'D'}]})});assert.equal(invalid.status,400);
  const unmatched=await fetch(base+'/api/diagnosis',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({studentIndex:2,choices:[{university:'대학(다른캠퍼스)',department:'B',admission_type:'C',track_name:'D'}]})});assert.equal((await unmatched.json()).results[0].level,'판단 보류');
  if(process.argv.includes('--browser')){assert.ok(workbook,'Supply workbook for browser test');await require('./app-browser-smoke.cjs')({base,adminCookie:admin,workbook});}
  console.log('PASS: unauthorized/forbidden/cross-origin rejection, invalid row protection, private preview, publication, history, rollback, diagnosis API data linkage, admin access and invalid-input handling');
 } catch(error) { console.error(logs.slice(-3000)); throw error; } finally {
  child.kill();await new Promise(resolve=>{if(child.exitCode!==null)return resolve();child.once('exit',resolve);setTimeout(resolve,5000);});
  await fs.rm(temp,{recursive:true,force:true});
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
