const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module'), ts = require('typescript');
const bridgeFile = 'lib/academy/bridge.ts';
const uid = 'verified-user';
function setup({ admin = [], user = [], adminError, userError } = {}) {
  const queries = []; let licenseReads = 0;
  class PB {
    authStore = { save: () => {} };
    filter = (source, values) => source.replace('{:id}', JSON.stringify(values.id)).replace('{:academy}', JSON.stringify(values.academy));
    collection(name) {
      if (name === 'users') return { authRefresh: async () => ({ record: { id: uid, collectionName: 'users' } }) };
      if (name === 'suprima_profiles') return { getList: async (_page, _perPage, options) => {
        const field = options.filter.startsWith('admin_id=') ? 'admin_id' : 'user'; queries.push(field);
        const error = field === 'admin_id' ? adminError : userError;
        if (error !== undefined) throw { status: error };
        return { items: field === 'admin_id' ? admin : user };
      } };
      if (name === 'suprima_licenses') return { getFirstListItem: async () => { licenseReads++; return { academy_id: 'academy1', active: true }; } };
      throw Error('Unexpected collection');
    }
  }
  const filename = path.resolve(bridgeFile), m = new Module(filename, module); m.paths = module.paths;
  const original = m.require.bind(m); m.require = name => name === 'pocketbase' ? PB : name === '@/lib/pocketbaseAdmin' ? { hasPocketBaseAdmin: () => false } : original(name);
  m._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, filename);
  return { bridge: m.exports, queries, licenseReads: () => licenseReads };
}
async function withBackend(run) { const old = process.env.PB_URL; process.env.PB_URL = 'https://pb.test'; try { await run(); } finally { if (old === undefined) delete process.env.PB_URL; else process.env.PB_URL = old; } }
const req = () => new Request('https://suprema-lab.vercel.app/api/academy/ai', { headers: { Authorization: 'Bearer verified-token' } });
const profile = { id: 'profile1', admin_id: uid, user: uid, academy_id: 'academy1', role: 'consultant' };

test('legacy creator admin_id never grants academy login ownership', () => withBackend(async () => {
  const context = setup({ admin: [{ ...profile, user: undefined }], user: [] });
  await assert.rejects(context.bridge.requireAcademyUser(req()), error => error.status === 403);
  assert.deepEqual(context.queries, ['user']); assert.equal(context.licenseReads(), 0);
}));
test('canonical user relation accepts one profile regardless of legacy creator text', () => withBackend(async () => {
  const context = setup({ admin: [{ ...profile, id: 'other' }], user: [{ ...profile, admin_id: 'shared-creator' }] });
  assert.equal((await context.bridge.requireAcademyUser(req())).academyId, 'academy1');
  assert.deepEqual(context.queries, ['user']); assert.equal(context.licenseReads(), 1);
}));
test('duplicate user profiles and inconsistent returned user ownership fail closed', () => withBackend(async () => {
  for (const user of [[profile, { ...profile, id: 'profile2' }], [{ ...profile, user: 'someone-else' }]]) {
    const context = setup({ user });
    await assert.rejects(context.bridge.requireAcademyUser(req()), error => error.status === 403);
    assert.deepEqual(context.queries, ['user']); assert.equal(context.licenseReads(), 0);
  }
}));
test('missing user schema, permission and network failures never fall back to admin_id', () => withBackend(async () => {
  for (const [status, expected] of [[400, 503], [404, 403], [403, 403], [0, 503]]) {
    const context = setup({ userError: status, admin: [profile] });
    await assert.rejects(context.bridge.requireAcademyUser(req()), error => error.status === expected);
    assert.deepEqual(context.queries, ['user']); assert.equal(context.licenseReads(), 0);
  }
}));

test('a valid password-session master cannot use academy business APIs', () => withBackend(async () => {
  const context = setup({user:[{...profile,role:'master'}]});
  await assert.rejects(context.bridge.requireAcademyUser(req()), error=>error.status===403 && error.message==='마스터는 Google 로그인으로 접속해 주세요.');
  assert.equal(context.licenseReads(),0);
}));
