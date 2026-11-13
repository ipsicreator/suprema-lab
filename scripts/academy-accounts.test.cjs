const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
function load(file,mocks={}){const name=path.resolve(file),mod=new Module(name,module);mod.paths=module.paths;const ordinary=mod.require.bind(mod);mod.require=id=>id in mocks?mocks[id]:ordinary(id);mod._compile(ts.transpileModule(fs.readFileSync(name,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,name);return mod.exports;}
const accounts=load('lib/academy/accounts.ts');
const profileId='profile00000001',userId='user00000000001';
const provision=()=>({action:'provision',academyId:'academy-a',name:'담당자',role:'consultant',email:'staff@example.test',password:'test-password-123!'});
function fixture(){const state={profile:{id:profileId,role:'consultant',academy_id:'academy-a',user:userId,name:'담당자'},created:[],updates:[],deletes:[],duplicate:false,emailExists:false,failProfile:false,profileLinkedAfterFailure:false};const db={collections:{getOne:async name=>name==='users'?{id:'users'}:{schema:[{name:'user',type:'relation',options:{collectionId:'users',maxSelect:1}}]}},filter:(s,v)=>s.replace(/\{:(\w+)\}/g,(_,k)=>JSON.stringify(v[k])),collection(name){return{
 getFullList:async()=>name==='users'?[{id:userId,email:'staff@example.test',password:'never-return'}]:name==='suprima_profiles'?[state.profile]:[{academy_id:'academy-a'}],
 getOne:async id=>{if(name==='users'){if(id===userId)return{id:userId,email:'staff@example.test'};const made=state.created.find(item=>item.name==='users'&&item.data.id===id);if(made)return{id,email:made.data.email};throw{status:404};}if(id===profileId)return state.profile;throw{status:404};},
 getList:async(_p,_n,options)=>{if(name==='users')return{totalItems:state.emailExists?1:0,items:state.emailExists?[{id:userId}]:[]};if(state.created.some(item=>item.name==='users'&&options.filter.includes(item.data.id)))return{totalItems:state.profileLinkedAfterFailure?1:0,items:state.profileLinkedAfterFailure?[{id:profileId}]:[]};return{totalItems:state.duplicate?2:1,items:[{id:profileId}]};},
 create:async data=>{state.created.push({name,data});if(name==='suprima_profiles'&&state.failProfile)throw Error('private-backend');return{id:data.id};},
 update:async(id,data)=>{state.updates.push({name,id,data});if(name==='suprima_profiles'&&state.failProfile)throw Error('private-backend');return{id};},
 delete:async id=>{state.deletes.push({name,id});return true;},
};}};return{db,state};}
test('master account input is strict and passwords have bounded strength without echo',()=>{
 assert.equal(accounts.parseAcademyAccountInput(provision()).role,'consultant');
 for(const value of [{...provision(),role:'master'},{...provision(),password:'short'},{...provision(),password:'x'.repeat(129)},{...provision(),password:'bad\npassword123'},{...provision(),user:userId},{action:'change-password',profileId,newPassword:'password-123456!',email:'forged@example.test'}])assert.throws(()=>accounts.parseAcademyAccountInput(value),e=>e.status===400);
});
test('roster exposes only authorized account fields, never hashes or passwords',async()=>{const{db}=fixture();const value=await accounts.readAcademyAccounts(db);assert.deepEqual(value.academies,[{id:'academy-a',label:'academy-a'}]);assert.equal(value.profiles[0].status,'linked');assert.equal(value.profiles[0].email,'staff@example.test');assert.equal(JSON.stringify(value).includes('never-return'),false);});
test('provision cannot create arbitrary academies, master roles, foreign or already linked profiles',async()=>{
 const{db,state}=fixture();
 await assert.rejects(accounts.manageAcademyAccount(db,accounts.parseAcademyAccountInput({...provision(),academyId:'foreign'})),e=>e.status===400);
 await assert.rejects(accounts.manageAcademyAccount(db,accounts.parseAcademyAccountInput({...provision(),profileId})),e=>e.status===409);
 state.profile.user='';state.profile.role='master';await assert.rejects(accounts.manageAcademyAccount(db,accounts.parseAcademyAccountInput({...provision(),profileId})),e=>e.status===403);
 state.profile.role='consultant';state.profile.academy_id='academy-b';await assert.rejects(accounts.manageAcademyAccount(db,accounts.parseAcademyAccountInput({...provision(),profileId})),e=>e.status===403);
 assert.equal(state.created.length,0);
});
test('new accounts link only the selected existing unlinked consultant or a new nonmaster profile',async()=>{
 const{db,state}=fixture();state.profile.user='';
 assert.deepEqual(await accounts.manageAcademyAccount(db,accounts.parseAcademyAccountInput({...provision(),profileId})),{ok:true});
 assert.match(state.created[0].data.id,/^[a-z0-9]{15}$/);assert.deepEqual(state.updates,[{name:'suprima_profiles',id:profileId,data:{user:state.created[0].data.id}}]);
 assert.deepEqual(Object.keys(state.created[0].data).sort(),['email','id','password','passwordConfirm']);
 const fresh=fixture();await accounts.manageAcademyAccount(fresh.db,accounts.parseAcademyAccountInput({...provision(),role:'admin'}));
 assert.match(fresh.state.created[1].data.id,/^[a-z0-9]{15}$/);assert.deepEqual(fresh.state.created[1].data,{id:fresh.state.created[1].data.id,name:'담당자',role:'admin',academy_id:'academy-a',user:fresh.state.created[0].data.id});
});
test('existing emails reject provisioning and failed links clean up only an unlinked newly created account',async()=>{
 const first=fixture();first.state.emailExists=true;await assert.rejects(accounts.manageAcademyAccount(first.db,accounts.parseAcademyAccountInput(provision())),e=>e.status===409);assert.equal(first.state.created.length,0);
 for(const linked of [false,true]){const{db,state}=fixture();state.failProfile=true;state.profileLinkedAfterFailure=linked;await assert.rejects(accounts.manageAcademyAccount(db,accounts.parseAcademyAccountInput(provision())),e=>e.status===503);assert.deepEqual(state.deletes,linked?[]:[{name:'users',id:state.created[0].data.id}]);}
});
test('password changes reject master and shared accounts and update only password confirmation',async()=>{
 const{db,state}=fixture(),input=accounts.parseAcademyAccountInput({action:'change-password',profileId,newPassword:'replacement-123!'});
 state.profile.role='master';await assert.rejects(accounts.manageAcademyAccount(db,input),e=>e.status===403);
 state.profile.role='consultant';state.duplicate=true;await assert.rejects(accounts.manageAcademyAccount(db,input),e=>e.status===409);assert.equal(state.updates.length,0);
 state.duplicate=false;assert.deepEqual(await accounts.manageAcademyAccount(db,input),{ok:true});assert.deepEqual(state.updates,[{name:'users',id:userId,data:{password:'replacement-123!',passwordConfirm:'replacement-123!'}}]);
});
test('missing canonical schema or creator-only legacy links cannot change account passwords',async()=>{
 const{db,state}=fixture(),input=accounts.parseAcademyAccountInput({action:'change-password',profileId,newPassword:'replacement-123!'});
 state.profile.admin_id=userId;state.profile.user='';
 await assert.rejects(accounts.manageAcademyAccount(db,input),e=>e.status===409);assert.equal(state.updates.length,0);
 db.collections.getOne=async name=>name==='users'?{id:'users'}:{schema:[{name:'admin_id',type:'text'}]};
 await assert.rejects(accounts.manageAcademyAccount(db,accounts.parseAcademyAccountInput(provision())),e=>e.status===503);assert.equal(state.created.length,0);
});
test('lost user-create responses clean up the exact generated unlinked account only',async()=>{
 const{db,state}=fixture(),ordinary=db.collection;
 db.collection=name=>{const service=ordinary(name);if(name==='users'){const create=service.create;service.create=async data=>{await create(data);throw Error('lost-private-response');};}return service;};
 await assert.rejects(accounts.manageAcademyAccount(db,accounts.parseAcademyAccountInput(provision())),e=>e.status===503);
 assert.equal(state.created.length,1);assert.match(state.created[0].data.id,/^[a-z0-9]{15}$/);assert.deepEqual(state.deletes,[{name:'users',id:state.created[0].data.id}]);assert.notEqual(state.deletes[0].id,userId);
});
test('master accounts route authenticates and checks origin before backend; bounds and redacts requests',async()=>{
 let permitted=false,provider='google',backend=0;const{db}=fixture();
 class NextResponse extends Response{static json(body,init){return Response.json(body,init);}}
 const route=load('app/api/platform/admin/academy/accounts/route.ts',{'next/server':{NextResponse},'@/lib/server-auth':{requireAdminOrThrow:async()=>{if(!permitted)throw Error('FORBIDDEN');return{userId:'master@example.test:'+provider};}},'@/lib/http/same-origin':{assertSameOrigin:request=>{if(request.headers.get('origin')!=='https://suprema-lab.vercel.app')throw Error('CROSS_ORIGIN');}},'@/lib/pocketbaseAdmin':{hasPocketBaseAdmin:()=>true,pbAdmin:async()=>{backend++;return db;}},'@/lib/academy/accounts':{...accounts,manageAcademyAccount:async()=>{throw Error('private-password-and-db-error');}}});
 const req=(body,origin='https://suprema-lab.vercel.app')=>new Request('https://suprema-lab.vercel.app/api/platform/admin/academy/accounts',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:typeof body==='string'?body:JSON.stringify(body)});
 assert.equal((await route.GET()).status,403);assert.equal((await route.POST(req(provision()))).status,403);assert.equal(backend,0);
 permitted=true;assert.equal((await route.POST(req(provision(),'https://evil.test'))).status,403);assert.equal(backend,0);
 provider='kakao';assert.equal((await route.GET()).status,403);assert.equal(backend,0);provider='google';
 assert.equal((await route.POST(req('x'.repeat(17000)))).status,413);
 const error=await route.POST(req(provision()));assert.equal(error.status,503);assert.equal((await error.text()).includes('private-password'),false);
 const roster=await route.GET();assert.equal(roster.status,200);assert.equal(roster.headers.get('cache-control'),'no-store');
});
