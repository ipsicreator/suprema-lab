const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const ts = require('typescript');
function load(file, replacements={}) { const name=path.resolve(file);const m=new Module(name,module);m.paths=module.paths;const original=m.require.bind(m);m.require=id=>id in replacements?replacements[id]:original(id);m._compile(ts.transpileModule(fs.readFileSync(name,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,name);return m.exports; }
const next={NextResponse:{json:(body,init)=>Response.json(body,init)}};
test('mail reports escape untrusted HTML and reject invalid recipients before sending',async()=>{
 const saved=process.env.RESEND_API_KEY;process.env.RESEND_API_KEY='isolated-test';const sent=[];
 try {
 const route=load('app/api/send-email/route.ts',{'next/server':next,resend:{Resend:class{emails={send:async body=>{sent.push(body);return {data:{id:'test'},error:null};}}}}});
 const request=body=>new Request('http://localhost/api/send-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 assert.equal((await route.POST(request({email:'invalid',subject:'report'}))).status,400);assert.equal(sent.length,0);
 assert.equal((await route.POST(request({email:'test@example.test',subject:'report',reportData:{text:'</pre><img src=x onerror=alert(1)>'}}))).status,200);
 assert.ok(!sent[0].html.includes('<img'));assert.ok(sent[0].html.includes('&lt;img'));
 assert.equal((await route.POST(request({email:'test@example.test',subject:'bad\r\nheader'}))).status,400);
 }finally{if(saved===undefined)delete process.env.RESEND_API_KEY;else process.env.RESEND_API_KEY=saved;}
});
test('PocketBase cached admin reauthenticates expired tokens and never retries wrong credentials on legacy endpoint',async()=>{
 const keys=['PB_URL','PB_ADMIN_EMAIL','PB_ADMIN_PASSWORD'];const saved=keys.map(k=>process.env[k]);keys.forEach((k,i)=>process.env[k]=['http://backend.test','admin@test','test-password'][i]);
 let calls=0,legacy=0,fail=false;let instance;const oldFetch=global.fetch;global.fetch=async()=>{legacy++;return Response.json({token:'legacy',admin:{id:'test'}});};
 class PB{constructor(){instance=this;}authStore={isValid:false,save:()=>{this.authStore.isValid=true;}};collection(){return {authWithPassword:async()=>{calls++;if(fail)throw {status:400};this.authStore.isValid=true;}};}}
 try{const {pbAdmin}=load('lib/pocketbaseAdmin.ts',{pocketbase:PB});await pbAdmin();instance.authStore.isValid=false;await pbAdmin();assert.equal(calls,2);instance.authStore.isValid=false;fail=true;await assert.rejects(pbAdmin());assert.equal(legacy,0);}finally{global.fetch=oldFetch;keys.forEach((k,i)=>{if(saved[i]===undefined)delete process.env[k];else process.env[k]=saved[i];});}
});
test('PDF storage configuration requires administrator authorization before backend access',async()=>{
 let touched=0;
 const route=load('app/api/diagnosis/upload-configure/route.ts',{'next/server':next,'@/lib/server-auth':{requireAdminOrThrow:async()=>{throw new Error('FORBIDDEN');}},'@/lib/pocketbaseAdmin':{hasPocketBaseAdmin:()=>{touched++;return true;},pbAdmin:async()=>{touched++;}}});
 assert.equal((await route.POST()).status,403);assert.equal(touched,0);
});
test('PDF storage configuration locks records and protects file downloads',async()=>{
 let update;
 const pb={collections:{getOne:async()=>({id:'privateupload01',fields:[{name:'file',type:'file'}]}),update:async(id,values)=>{update=values;}}};
 const route=load('app/api/diagnosis/upload-configure/route.ts',{'next/server':next,'@/lib/server-auth':{requireAdminOrThrow:async()=>({email:'admin@test'})},'@/lib/pocketbaseAdmin':{hasPocketBaseAdmin:()=>true,pbAdmin:async()=>pb}});
 assert.equal((await route.POST()).status,200);assert.equal(update.viewRule,null);assert.equal(update.listRule,null);assert.equal(update.fields[0].protected,true);
});
test('PDF AI receives extraction instructions and GPA is computed from validated records',async()=>{
 const previous=process.env.GEMINI_API_KEY;process.env.GEMINI_API_KEY='isolated-test';let sent;const oldFetch=global.fetch;
 const pb={collection:()=>({getOne:async()=>({id:'testrecord00001',file:'test.pdf'})}),files:{getToken:async()=>'test-token',getURL:()=> 'http://files.test/test.pdf'},authStore:{token:'test-token'}};
 global.fetch=async(url,init)=>{if(String(url).includes('files.test'))return new Response(Buffer.from('%PDF-test'));sent=JSON.parse(init.body);return Response.json({candidates:[{content:{parts:[{text:JSON.stringify({success:true,gpa:9,subjects:[{subject:'수학',unit:3,grade:2},{subject:'국어',unit:1,grade:4}],studentAnalysis:{}})}]}}]});};
 try{const route=load('app/api/diagnosis/upload-pdf-record/route.ts',{'next/server':next,'@/lib/pocketbaseAdmin':{hasPocketBaseAdmin:()=>true,pbAdmin:async()=>pb},'@/lib/pdf-parser':{extractTextFromPDFBuffer:()=>'',calculateGPAFromText:()=>({success:false,message:'fallback',subjects:[],gpa:0})}});const response=await route.POST(new Request('http://localhost/api/diagnosis/upload-pdf-record',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({recordId:'testrecord00001',gradingSystem:'9-level'})}));const data=await response.json();assert.equal(data.success,true);assert.ok(sent.contents[0].parts.some(part=>typeof part.text==='string'&&part.text.includes('추측')&&part.text.includes('9-level')));assert.equal(data.gpa,2.5);}finally{global.fetch=oldFetch;if(previous===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=previous;}
});
