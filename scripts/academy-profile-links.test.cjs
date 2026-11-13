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

test('distinct profile links across admin_id and user reject ambiguous academy selection', () => withBackend(async () => {
  const context = setup({ admin: [{ ...profile, user: undefined }], user: [{ ...profile, id: 'profile2', admin_id: undefined, academy_id: 'academy2' }] });
  await assert.rejects(context.bridge.requireAcademyUser(req()), error => error.status === 403);
  assert.deepEqual(context.queries, ['admin_id', 'user']); assert.equal(context.licenseReads(), 0);
}));
test('same profile linked through both fields is deduplicated by profile ID', () => withBackend(async () => {
  const context = setup({ admin: [profile], user: [profile] });
  assert.equal((await context.bridge.requireAcademyUser(req())).academyId, 'academy1');
  assert.deepEqual(context.queries, ['admin_id', 'user']); assert.equal(context.licenseReads(), 1);
}));
test('unknown mapping field can use the other explicit mapping, permission and network failures cannot', () => withBackend(async () => {
  const supported = setup({ adminError: 400, user: [{ ...profile, admin_id: undefined }] });
  assert.equal((await supported.bridge.requireAcademyUser(req())).academyId, 'academy1');
  for (const [status, expected] of [[403, 403], [0, 503]]) {
    const denied = setup({ adminError: status, user: [profile] });
    await assert.rejects(denied.bridge.requireAcademyUser(req()), error => error.status === expected);
    assert.deepEqual(denied.queries, ['admin_id']); assert.equal(denied.licenseReads(), 0);
  }
  const secondaryDenied = setup({ admin: [profile], userError: 403 });
  await assert.rejects(secondaryDenied.bridge.requireAcademyUser(req()), error => error.status === 403);
  assert.equal(secondaryDenied.licenseReads(), 0);
}));
