const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
function load(file,mocks={}){const name=path.resolve(file),m=new Module(name,module);m.paths=module.paths;const ordinary=m.require.bind(m);m.require=id=>id in mocks?mocks[id]:ordinary(id);m._compile(ts.transpileModule(fs.readFileSync(name,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,name);return m.exports;}
const api=load('lib/academy/security.ts');
function schema(legacy=false){
 const rel=(name,target)=>({name,type:'relation',required:false,...(legacy?{options:{collectionId:target,maxSelect:1}}:{collectionId:target,maxSelect:1})});
 const col=(name,fields)=>({id:'collection-'+name,name,type:name==='users'?'auth':'base',indexes:[],listRule:'',viewRule:'',createRule:'',updateRule:'',deleteRule:'',[legacy?'schema':'fields']:fields});
 return [col('users',[]),col('suprima_profiles',[rel('user','collection-users'),{name:'admin_id',type:'text'},{name:'academy_id',type:'text'},{name:'role',type:'text'}]),col('suprima_licenses',[{name:'academy_id',type:'text'},{name:'active',type:'bool'}]),col('suprima_students',[{name:'academy_id',type:'text'},{name:'consultant_id',type:'text'}]),col('suprima_pdf_analyses',[legacy?{name:'student_id',type:'text'}:rel('student_id','collection-suprima_students'),{name:'file',type:'file',...(legacy?{options:{maxSelect:1}}:{maxSelect:1})}])];
}
function fixture({legacy=false,fail=false,ambiguous=false}={}){
 const collections=schema(legacy),trace=[],initial=structuredClone(collections);let revision;
 const db={collections:{getOne:async id=>{trace.push('get:'+id);const value=collections.find(row=>row.id===id||row.name===id);if(!value)throw{status:404};return structuredClone(value);},create:async data=>{trace.push('backup-schema');const row={id:'revision-collection',...data};collections.push(row);return row;},update:async(id,patch)=>{trace.push('update:'+id);if(fail&&id==='collection-suprima_licenses'&&patch.listRule!=='')throw{status:400,response:{data:{listRule:{message:'SECRET server password'}}}};const row=collections.find(row=>row.id===id);Object.assign(row,structuredClone(patch));return row;}},collection:name=>({getFullList:async()=>ambiguous?[{id:'profile-a',user:'user-a'},{id:'profile-b',user:'user-a'}]:[{id:'profile-a',user:'user-a',admin_id:'legacy-shared'}],create:async data=>{trace.push('backup-save');revision=structuredClone(data);return{id:'backup'};},update:async(_id,data)=>{trace.push('revision:'+data.state);Object.assign(revision,data);return{id:'backup',...revision};}})};
 return{db,collections,initial,trace,revision:()=>revision};
}
test('academy security generates tenant-bound rules using only canonical user and single consultant relation',()=>{
 const plan=api.buildAcademySecurityPlan(schema());assert.equal(plan.length,4);
 const profiles=plan.find(row=>row.name==='suprima_profiles'),students=plan.find(row=>row.name==='suprima_students'),analyses=plan.find(row=>row.name==='suprima_pdf_analyses');
 assert.match(profiles.after.listRule,/actor\.user \?= @request.auth.id/);assert.ok(!profiles.after.listRule.includes('admin_id'));
 for(const patch of plan){for(const key of ['listRule','viewRule','createRule','updateRule','deleteRule'])assert.notEqual(patch.after[key],'');}
 assert.equal(profiles.after.updateRule,null);assert.equal(profiles.after.deleteRule,null);
 assert.match(students.after.listRule,/actor\.academy_id \?= academy_id/);assert.match(students.after.listRule,/license\.active \?= true/);assert.match(students.after.listRule,/assigned_consultant \?= @collection.suprima_profiles:actor.id/);
 assert.match(students.after.updateRule,/@request.body.academy_id:isset = false/);assert.match(students.after.updateRule,/@request.body.assigned_consultant = assigned_consultant/);
 assert.equal(students.after.fields.at(-1).collectionId,'collection-suprima_profiles');assert.equal(students.after.fields.at(-1).maxSelect,1);
 assert.equal(analyses.after.fields.find(item=>item.name==='file').protected,true);assert.match(analyses.after.updateRule,/@request.body.student_id = student_id/);
 assert.match(profiles.after.indexes.at(-1),/CREATE UNIQUE INDEX.*WHERE user != ''/);
});
test('legacy schema options and text analysis join preserve original storage and request.data syntax',()=>{
 const plan=api.buildAcademySecurityPlan(schema(true)),students=plan.find(row=>row.name==='suprima_students'),analyses=plan.find(row=>row.name==='suprima_pdf_analyses');
 assert.ok(students.after.schema);assert.equal(students.after.fields,undefined);assert.deepEqual(students.before.schema,students.after.schema.slice(0,-1));assert.equal(students.after.schema.at(-1).options.maxSelect,1);
 assert.match(students.after.updateRule,/@request.data.academy_id:isset/);assert.ok(!students.after.updateRule.includes(':changed'));
 assert.match(analyses.after.listRule,/@collection.suprima_students:student.id \?= student_id/);assert.match(analyses.after.listRule,/@collection.suprima_students:student.assigned_consultant/);assert.equal(analyses.after.schema.find(item=>item.name==='file').options.protected,true);
});
test('invalid or alternate relation schema never produces a migration',()=>{
 for(const mutate of [cols=>{cols[1].fields.find(row=>row.name==='user').collectionId='other';},cols=>{cols[4].fields=[];},cols=>{cols[3].fields.push({name:'another_staff',type:'relation',collectionId:'collection-suprima_profiles',maxSelect:1});},cols=>{cols[3].fields.find(row=>row.name==='academy_id').type='number';}]){const cols=schema();mutate(cols);assert.throws(()=>api.buildAcademySecurityPlan(cols),/SCHEMA_REQUIRES_REVIEW/);}
});
test('configuration saves private rollback snapshot before schema or rule changes and is idempotent',async()=>{
 for(const legacy of [false,true]){const f=fixture({legacy});const result=await api.configureAcademySecurity(f.db);assert.equal(result.changedCollections,4);assert.ok(f.trace.indexOf('backup-save')<f.trace.findIndex(value=>value.startsWith('update:')));assert.equal(f.revision().state,'applied');assert.ok(!JSON.stringify(f.revision()).includes('authToken'));const revisionCol=f.collections.find(item=>item.name===api.SECURITY_REVISION_COLLECTION);for(const key of ['listRule','viewRule','createRule','updateRule','deleteRule'])assert.equal(revisionCol[key],null);assert.equal((await api.configureAcademySecurity(f.db)).alreadyConfigured,true);}
});
test('failed rules restore all applied schema and rules and expose only safe diagnostics',async()=>{
 const f=fixture({fail:true});await assert.rejects(api.configureAcademySecurity(f.db),error=>{assert.equal(error.message,'ACADEMY_CONFIGURATION_ROLLED_BACK');assert.equal(error.phase,'rules');assert.equal(error.collection,'suprima_licenses');assert.equal(error.backendStatus,400);assert.deepEqual(error.invalidFields,['listRule']);assert.ok(!JSON.stringify(error).includes('SECRET'));return true;});
 for(const original of f.initial)assert.deepEqual(f.collections.find(item=>item.id===original.id),original);assert.equal(f.revision().state,'rolled_back');
});
test('ambiguous canonical accounts are denied with impossible rules without deleting any profiles',async()=>{
 const f=fixture({ambiguous:true});const result=await api.configureAcademySecurity(f.db);assert.equal(result.quarantined,true);assert.equal(result.ambiguousProfiles,1);for(const col of f.collections.filter(row=>row.name.startsWith('suprima_')))for(const key of ['listRule','viewRule','createRule','updateRule','deleteRule'])assert.equal(col[key],'@request.auth.id = "" && @request.auth.id != ""');assert.deepEqual(f.collections.find(row=>row.name==='suprima_profiles').indexes,[]);
});
test('configure route authenticates before backend and rejects cross-origin requests without data leakage',async()=>{
 let touched=0;const make=authError=>load('app/api/platform/admin/academy/configure/route.ts',{'next/server':{NextResponse:{json:(body,init)=>Response.json(body,init)}},'@/lib/http/same-origin':{assertSameOrigin:req=>{if(req.headers.get('origin')!=='https://lab.test')throw new Error('CROSS_ORIGIN');}},'@/lib/server-auth':{requireAdminOrThrow:async()=>{if(authError)throw new Error(authError);}},'@/lib/pocketbaseAdmin':{hasPocketBaseAdmin:()=>{touched++;return true;},pbAdmin:async()=>{touched++;return{};}},'@/lib/academy/security':{configureAcademySecurity:async()=>{throw Object.assign(new Error('ACADEMY_CONFIGURE_FAILED'),{phase:'rules',collection:'suprima_students',backendStatus:400,invalidFields:['updateRule']});}}});
 for(const [auth,status]of [['UNAUTHORIZED',401],['FORBIDDEN',403]]){const r=await make(auth).POST(new Request('https://lab.test/api',{method:'POST',headers:{origin:'https://lab.test'}}));assert.equal(r.status,status);assert.equal(touched,0);}
 const foreign=await make().POST(new Request('https://lab.test/api',{method:'POST',headers:{origin:'https://evil.test'}}));assert.equal(foreign.status,403);assert.equal(touched,0);
 const failure=await make().POST(new Request('https://lab.test/api',{method:'POST',headers:{origin:'https://lab.test'}}));assert.equal(failure.status,500);assert.equal((await failure.json()).phase,'rules');
});
