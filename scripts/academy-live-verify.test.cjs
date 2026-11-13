const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module'), ts = require('typescript');
function load(file, mocks = {}) {
 const filename = path.resolve(file), mod = new Module(filename, module); mod.paths = module.paths;
 const ordinary = mod.require.bind(mod); mod.require = key => Object.hasOwn(mocks, key) ? mocks[key] : ordinary(key);
 mod._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText,filename);
 return mod.exports;
}
const next = { NextResponse: { json: (body, init) => Response.json(body, init) } };
test('live verification route authenticates administrator and origin before touching storage', async () => {
 let storage = 0;
 for (const error of ['UNAUTHORIZED','FORBIDDEN']) {
  const route = load('app/api/platform/admin/academy/verify/route.ts', {
   'next/server': next, '@/lib/http/same-origin': {assertSameOrigin(){}}, '@/lib/server-auth': { requireAdminOrThrow: async()=>{throw new Error(error)} },
   '@/lib/pocketbaseAdmin': {hasPocketBaseAdmin:()=>{storage++;return true},pbAdmin:async()=>{storage++;}}, '@/lib/academy/verify': {verifyAcademyAccess:async()=>{storage++;}},
  });
  assert.equal((await route.POST(new Request('https://owned.test'))).status,error==='UNAUTHORIZED'?401:403);
 }
 assert.equal(storage,0);
 const cross = load('app/api/platform/admin/academy/verify/route.ts', {
  'next/server':next, '@/lib/http/same-origin':{assertSameOrigin(){throw new Error('CROSS_ORIGIN')}},'@/lib/server-auth':{requireAdminOrThrow:async()=>{storage++;}}, '@/lib/pocketbaseAdmin':{},'@/lib/academy/verify':{},
 });
 assert.equal((await cross.POST(new Request('https://owned.test'))).status,403);assert.equal(storage,0);
});
function service(schema){return load('lib/academy/verify.ts', {'@/lib/academy/assignments':{requireAssignmentSchema:schema,assignAcademyStudent:async()=>{}},'@/lib/academy/bridge':{requireAcademyUser:async()=>{}},pocketbase:class{}}).verifyAcademyAccess;}
test('live verifier refuses unconfigured schema before creating any account or row',async()=>{
 let writes=0;const run=service(async()=>{throw new Error('private backend detail')});
 const result=await run({collection(){writes++;throw new Error('must not touch')}});
 assert.equal(result.success,false);assert.equal(writes,0);assert.equal(result.cleanup.attempted,0);assert.equal(result.cleanup.complete,true);assert.equal(JSON.stringify(result).includes('private backend'),false);
});
test('parallel partial fixture failures finish and cleanup only exact created fixture IDs',async()=>{
 const run=service(async()=>{});let index=0;const made=[],deleted=[],submitted=[];let failDelete=false;
 const db={baseURL:'https://private-backend.test',collections:{getOne:async()=>({listRule:'restricted',viewRule:'restricted'})},collection(collection){return{
  create:async(data)=>{const n=index++;submitted.push({collection,id:data.id});await new Promise(resolve=>setTimeout(resolve,n===0?20:0));if(n===2)throw new Error('private token and password');const row={id:data.id};made.push({collection,id:row.id,data});return row;},
  delete:async(id)=>{deleted.push({collection,id});if(failDelete)throw new Error('private error');return true;}
 }}};
 const result=await run(db);
 assert.equal(result.success,false);assert.equal(made.length,4);assert.equal(deleted.length,5);assert.deepEqual(deleted.map(x=>x.id).sort(),submitted.map(x=>x.id).sort());assert.ok(made.every(row=>deleted.some(item=>item.id===row.id)));assert.ok(deleted.every(x=>x.collection==='users'));
 assert.equal(result.cleanup.complete,true);assert.equal(result.cleanup.attempted,5);assert.equal(result.cleanup.failed,0);
 for(const value of made){assert.match(value.data.email,/@example\.invalid$/);assert.ok(value.data.password.length>=32);assert.equal(value.data.password,value.data.passwordConfirm);assert.equal(JSON.stringify(result).includes(value.data.password),false);assert.equal(JSON.stringify(result).includes(value.data.email),false);}
 assert.equal(JSON.stringify(result).includes('private'),false);
 failDelete=true;index=0;made.length=0;deleted.length=0;
 const failed=await run(db);assert.equal(failed.success,false);assert.equal(failed.cleanup.complete,false);assert.equal(failed.cleanup.failed,5);
});
test('live verifier blocks empty public rules before creating fixtures',async()=>{
 const run=service(async()=>{});let writes=0;const result=await run({collections:{getOne:async()=>({listRule:'',viewRule:''})},collection(){writes++;}});
 assert.equal(result.success,false);assert.equal(result.cleanup.attempted,0);assert.equal(writes,0);
});
test('verification route returns actual failure status without echoing infrastructure data',async()=>{
 const route=load('app/api/platform/admin/academy/verify/route.ts', {'next/server':next,'@/lib/http/same-origin':{assertSameOrigin(){}},'@/lib/server-auth':{requireAdminOrThrow:async()=>{}},'@/lib/pocketbaseAdmin':{hasPocketBaseAdmin:()=>true,pbAdmin:async()=>({})},'@/lib/academy/verify':{verifyAcademyAccess:async()=>({success:false,checks:[{name:'real-denial-check',passed:false}],cleanup:{complete:true}})}});
 const response=await route.POST(new Request('https://owned.test'));assert.equal(response.status,409);assert.equal((await response.json()).checks[0].passed,false);
});

test('lost create responses still cleanup predetermined IDs and treat missing rows as cleaned',async()=>{
 const run=service(async()=>{});const stored=new Map(),attempted=[],deleted=[];let sequence=0;
 const db={baseURL:'https://test.invalid',collections:{getOne:async()=>({listRule:'restricted',viewRule:'restricted'})},collection(collection){return{
  create:async(data)=>{attempted.push(data.id);const n=sequence++;if(n===1)throw {status:400,data:{data:{email:{message:'private email'}}}};stored.set(data.id,{...data});if(n===2)throw {status:0};return {id:data.id};},
  delete:async(id)=>{deleted.push(id);if(!stored.delete(id))throw {status:404};return true;}
 }}};
 const result=await run(db);assert.equal(result.success,false);assert.equal(result.cleanup.complete,true);assert.equal(stored.size,0);assert.deepEqual(deleted.sort(),attempted.sort());assert.ok(attempted.every(id=>/^[a-f0-9]{15}$/.test(id)));assert.equal(result.failure.setupStep,'users');assert.equal(result.failure.backendStatus,400);assert.deepEqual(result.failure.invalidFieldNames,['email']);assert.equal(JSON.stringify(result).includes('private email'),false);
});
