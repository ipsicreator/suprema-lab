const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),Module=require('node:module'),path=require('node:path'),ts=require('typescript');
function setup({authError,storage=true,backendError}={}){
 let touched=0;
 const data={users:[{id:'user-a'},{id:'user-b'}],suprima_profiles:[{id:'profile-a',academy_id:'private-academy-a',role:'consultant',user:'user-a',admin_id:'user-a',name:'PRIVATE STUDENT',email:'private-person@example.test'},{id:'profile-b',academy_id:'private-academy-b',role:'consultant',admin_id:'user-b'},{id:'profile-duplicate',academy_id:'private-academy-a',role:'admin',user:'user-a'},{id:'profile-missing',role:'admin'}],suprima_students:[{id:'student-a',academy_id:'private-academy-a',consultant:'profile-a'},{id:'student-b',academy_id:'private-academy-a',consultant:'profile-b'}],suprima_licenses:[],suprima_pdf_analyses:[]};
 const schema=name=>({id:'collection-'+name,name,type:name==='users'?'auth':'base',authToken:{secret:'SECRET-TOKEN'},oauth2:{providers:[{clientSecret:'SECRET-CLIENT'}]},fields:[{name:'id',type:'text'},...(name==='suprima_profiles'?[{name:'academy_id',type:'text'},{name:'role',type:'text'},{name:'user',type:'relation',collectionId:'collection-users',maxSelect:1},{name:'admin_id',type:'relation',collectionId:'collection-users',maxSelect:1}]:[]),...(name==='suprima_students'?[{name:'academy_id',type:'text'},{name:'consultant_id',type:'text'},{name:'consultant',type:'relation',collectionId:'collection-suprima_profiles',maxSelect:1,options:{secret:'SECRET-FIELD'}}]:[])],listRule:'email="private-person@example.test"',viewRule:null,createRule:'',updateRule:null,deleteRule:null});
 const pb={collections:{getOne:async name=>{touched++;if(backendError)throw backendError;return schema(name);}},collection:name=>({getList:async()=>({totalItems:data[name].length,items:[]}),getFullList:async()=>data[name]})};
 const replacements={'next/server':{NextResponse:{json:(body,options)=>Response.json(body,options)}},'@/lib/server-auth':{requireAdminOrThrow:async()=>{if(authError)throw new Error(authError);}},'@/lib/pocketbaseAdmin':{hasPocketBaseAdmin:()=>{touched++;return storage;},pbAdmin:async()=>pb}};
 const filename=path.resolve('app/api/platform/admin/academy/route.ts'),m=new Module(filename,module);m.paths=module.paths;const original=m.require.bind(m);m.require=id=>id in replacements?replacements[id]:original(id);m._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,filename);return {route:m.exports,touched:()=>touched,data};
}
test('academy audit authenticates the headquarters administrator before backend reads',async()=>{for(const [code,status]of [['UNAUTHORIZED',401],['FORBIDDEN',403],['ADMIN_NOT_CONFIGURED',503]]){const fixture=setup({authError:code});const response=await fixture.route.GET();assert.equal(response.status,status);assert.equal(fixture.touched(),0);assert.equal(response.headers.get('Cache-Control'),'no-store');}});
test('academy audit exposes only schema projections and aggregate assignment/link consistency',async()=>{const previous=process.env.ACADEMY_STUDENT_CONSULTANT_FIELD;process.env.ACADEMY_STUDENT_CONSULTANT_FIELD='consultant';try{const fixture=setup();const response=await fixture.route.GET();assert.equal(response.status,200);const data=await response.json(),text=JSON.stringify(data);for(const secret of ['SECRET-TOKEN','SECRET-CLIENT','SECRET-FIELD','PRIVATE STUDENT','private-person@example.test','private-academy-a','private-academy-b','profile-a','student-a'])assert.ok(!text.includes(secret),secret);assert.deepEqual(data.assignment.relationCandidates,['consultant']);assert.equal(data.assignment.configuredFieldVerified,true);assert.equal(data.assignment.invalidAssignments,1);assert.equal(data.profileLinks.unlinkedProfiles,1);assert.equal(data.profileLinks.unknownUserLinks,0);assert.equal(data.profileLinks.conflictingProfileLinks,0);assert.equal(data.profileLinks.ambiguousUsers,1);assert.equal(data.academies.reduce((sum,item)=>sum+item.students,0),2);assert.equal(data.collections[0].rules.listRule,'email="[redacted-email]"');assert.equal(data.collections[0].rules.createRule,'');assert.equal(data.collections[0].rules.viewRule,null);}finally{if(previous===undefined)delete process.env.ACADEMY_STUDENT_CONSULTANT_FIELD;else process.env.ACADEMY_STUDENT_CONSULTANT_FIELD=previous;}});
test('academy audit never returns backend errors or configured credentials',async()=>{const fixture=setup({backendError:new Error('https://private.test?password=SECRET-FAIL')});const response=await fixture.route.GET();assert.equal(response.status,500);assert.ok(!(await response.text()).includes('SECRET-FAIL'));const unavailable=setup({storage:false});assert.equal((await unavailable.route.GET()).status,503);});

test('academy audit distinguishes canonical user membership from legacy admin ownership and legacy text assignments',async()=>{
 const fixture=setup();fixture.data.users=[{id:'owner'},{id:'canonical-a'},{id:'canonical-b'}];
 fixture.data.suprima_profiles=[
  {id:'profile-owner',academy_id:'private-academy-a',role:'admin',user:'owner',admin_id:'owner'},
  {id:'profile-a',academy_id:'private-academy-a',role:'consultant',user:'canonical-a',admin_id:'owner'},
  {id:'profile-b',academy_id:'private-academy-a',role:'consultant',user:'canonical-b',admin_id:'owner'},
  {id:'profile-legacy',academy_id:'private-academy-a',role:'consultant',admin_id:'owner'},
  {id:'profile-unknown',academy_id:'private-academy-a',role:'consultant',user:'deleted-user',admin_id:'owner'},
 ];
 fixture.data.suprima_students=[
  {id:'s1',academy_id:'private-academy-a',consultant_id:'profile-a'},
  {id:'s2',academy_id:'private-academy-a',consultant_id:'profile-legacy'},
  {id:'s3',academy_id:'private-academy-a',consultant_id:'profile-unknown'},
  {id:'s4',academy_id:'other-academy',consultant_id:'profile-b'},
  {id:'s5',academy_id:'private-academy-a',consultant_id:'missing-profile'},
  {id:'s6',academy_id:'private-academy-a',consultant_id:''},
 ];
 const response=await fixture.route.GET(),data=await response.json();assert.equal(response.status,200);
 assert.deepEqual(data.profileLinks.fields,{user:{populated:4,matchingUsers:3},admin_id:{populated:5,matchingUsers:5}});
 assert.deepEqual(data.profileLinks.roles.consultant,{profiles:4,canonicalUser:3,canonicalUserMatching:2,legacyOnly:1,sameUserBoth:0,distinctLinks:3});
 assert.equal(data.profileLinks.ambiguousUsers,1);assert.equal(data.profileLinks.canonicalAmbiguousUsers,0);
 assert.deepEqual(data.assignment.legacyAssignment,{fieldExists:true,fieldType:'text',populated:5,validProfileAssignments:3,invalidProfileAssignments:2,noUniqueCanonicalUser:2,usableAssignments:1});
 const text=JSON.stringify(data);for(const privateValue of ['profile-a','canonical-a','deleted-user','private-academy-a'])assert.ok(!text.includes(privateValue));
 fixture.data.suprima_profiles.push({id:'profile-clone',academy_id:'private-academy-a',role:'consultant',user:'canonical-a'});
 const second=await(await fixture.route.GET()).json();assert.equal(second.profileLinks.canonicalAmbiguousUsers,1);assert.equal(second.assignment.legacyAssignment.noUniqueCanonicalUser,3);assert.equal(second.assignment.legacyAssignment.usableAssignments,0);
});
