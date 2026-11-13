const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
let session={user:{email:'admin@example.test',name:'Admin'}};let writes=0;
const f=path.resolve('src/lib/server-auth.ts');const m=new Module(f,module);m.paths=module.paths;m.require=(id)=>id==='../../auth'?{auth:async()=>session}:id==='@/lib/platform-store'?{upsertUserBySession:async()=>{writes++;throw Error('read-only filesystem');}}:require(id);
m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);
const original={NODE_ENV:process.env.NODE_ENV,AUTH_SECRET:process.env.AUTH_SECRET,NEXTAUTH_SECRET:process.env.NEXTAUTH_SECRET,ADMIN_EMAILS:process.env.ADMIN_EMAILS};
test('admin authorization works without a writable application filesystem',async()=>{
 process.env.NODE_ENV='production';process.env.AUTH_SECRET='test';process.env.ADMIN_EMAILS='admin@example.test';assert.equal((await m.exports.requireAdminOrThrow()).email,'admin@example.test');assert.equal(writes,0);
 session={user:{email:'other@example.test'}};await assert.rejects(m.exports.requireAdminOrThrow(),/FORBIDDEN/);
 session=null;await assert.rejects(m.exports.requireAdminOrThrow(),/UNAUTHORIZED/);
});
test('production admin authorization fails closed without a secret',async()=>{
 delete process.env.AUTH_SECRET;delete process.env.NEXTAUTH_SECRET;await assert.rejects(m.exports.requireAdminOrThrow(),/AUTH_NOT_CONFIGURED/);
 for(const [k,v] of Object.entries(original))if(v===undefined)delete process.env[k];else process.env[k]=v;
});
