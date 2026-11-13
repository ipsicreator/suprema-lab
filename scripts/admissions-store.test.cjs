const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const source = path.resolve('lib/admissions/store.ts');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'admissions-store-'));
const originalCwd = process.cwd();
const originalVercel = process.env.VERCEL;
const cloud = { enabled: false, client: null };
const loaded = new Module(source, module);
loaded.paths = module.paths;
loaded.require = function(name) {
  if (name.includes('pocketbaseAdmin')) return { hasPocketBaseAdmin: () => cloud.enabled, pbAdmin: async () => cloud.client };
  if (name.endsWith('admissionData.json')) return [{ univ: null, dept: null, type: null, name: null }];
  if (name === './import') return { normalizeRows: rows => ({ rows }) };
  return module.require(name);
};
if (fs.existsSync(source)) loaded._compile(ts.transpileModule(fs.readFileSync(source, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, source);
const store = loaded.exports;
const rows = [{ univ: '검증대학교', dept: '수학과', type: '학생부교과', name: '일반전형', region: '서울', subRegion: '서울', track: '자연', cutoff26: 2.3, cutoff26_50: null, cutoff26_70: 2.3, cutoff25: null, cutoff24: null, req: '' }];

test('staging is private; publish persists and rollback restores an immutable revision', async () => {
  process.chdir(temp);
  delete process.env.VERCEL;
  try {
    assert.equal(typeof store.stageAdmissions, 'function');
    assert.deepEqual(await store.getActiveAdmissions(), []);
    const first = await store.stageAdmissions(rows, { fileName: '첫째.xlsx', sheetName: '전체', actor: 'admin@example.com' });
    assert.deepEqual(await store.getActiveAdmissions(), []);
    assert.deepEqual((await store.getAdmissionRevisions()).history, []);
    await store.publishAdmissions(first.id, 'admin@example.com');
    assert.deepEqual(await store.getActiveAdmissions(), rows);
    const secondRows = [{ ...rows[0], cutoff26: 3 }];
    const second = await store.stageAdmissions(secondRows, { fileName: '둘째.csv', sheetName: 'Sheet1', actor: 'admin@example.com' });
    await store.publishAdmissions(second.id, 'admin@example.com');
    assert.equal((await store.getActiveAdmissions())[0].cutoff26, 3);
    await store.publishAdmissions(first.id, 'admin@example.com');
    assert.equal((await store.getActiveAdmissions())[0].cutoff26, 2.3);
    assert.equal((await store.getAdmissionRevisions()).history.length, 2);
    await assert.rejects(() => store.publishAdmissions('../escape', 'admin@example.com'));
    assert.equal((await store.getActiveAdmissions())[0].cutoff26, 2.3);
  } finally { process.chdir(originalCwd); }
});

test('Vercel never writes a local revision when durable storage is missing', async () => {
  process.chdir(temp);
  process.env.VERCEL = '1';
  try {
    assert.equal(typeof store.stageAdmissions, 'function');
    await assert.rejects(() => store.stageAdmissions(rows, { fileName: 'test.xlsx', sheetName: '전체', actor: 'admin@example.com' }), /ADMISSIONS_STORAGE_NOT_CONFIGURED/);
  } finally {
    process.chdir(originalCwd);
    if (originalVercel === undefined) delete process.env.VERCEL; else process.env.VERCEL = originalVercel;
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('cloud drafts stay private and a failed publish leaves the active revision unchanged', async () => {
  const definitions = new Map();
  const records = new Map();
  const files = new Map();
  const originalFetch = global.fetch;
  const activeName = 'suprema_admission_active';
  let failPointerUpdate = false;
  const missing = () => Object.assign(new Error('not found'), { status: 404 });
  cloud.client = {
    collections: {
      getOne: async name => { if (!definitions.has(name)) throw missing(); return definitions.get(name); },
      create: async definition => { definitions.set(definition.name, definition); return definition; },
    },
    collection: name => ({
      getOne: async id => { const r = records.get(name + ':' + id); if (!r) throw missing(); return r; },
      create: async input => {
        const r = input instanceof FormData ? Object.fromEntries(input.entries()) : { ...input };
        const key = name + ':' + r.id;
        if (records.has(key)) throw Object.assign(new Error('duplicate'), { status: 400 });
        if (r.file instanceof Blob) { files.set(r.id, r.file); r.file = 'admissions.json.gz'; }
        records.set(key, r);
        return r;
      },
      update: async (id, values) => {
        if (name === activeName && failPointerUpdate) throw Object.assign(new Error('storage unavailable'), { status: 500 });
        const key = name + ':' + id;
        if (!records.has(key)) throw missing();
        const result = { ...records.get(key), ...values };
        records.set(key, result);
        return result;
      },
    }),
    files: { getToken: async () => 'test-token', getURL: r => 'https://pb.invalid/' + r.id },
  };
  cloud.enabled = true;
  global.fetch = async url => new Response(await files.get(String(url).split('/').pop()).arrayBuffer());
  try {
    assert.deepEqual(await store.getActiveAdmissions(), []);
    const first = await store.stageAdmissions(rows, { fileName: 'first.xlsx', sheetName: '전체', actor: 'admin@example.com' });
    for (const definition of definitions.values()) {
      for (const rule of ['listRule', 'viewRule', 'createRule', 'updateRule', 'deleteRule']) assert.equal(definition[rule], null);
    }
    assert.equal(definitions.get('suprema_admission_revisions').fields.find(f => f.name === 'file').protected, true);
    assert.deepEqual((await store.getAdmissionRevisions()).history, []);
    await store.publishAdmissions(first.id, 'admin@example.com');
    assert.equal((await store.getActiveAdmissions())[0].cutoff26, 2.3);
    const second = await store.stageAdmissions([{ ...rows[0], cutoff26: 4 }], { fileName: 'second.csv', sheetName: 'Sheet1', actor: 'admin@example.com' });
    failPointerUpdate = true;
    await assert.rejects(() => store.publishAdmissions(second.id, 'admin@example.com'), /storage unavailable/);
    assert.equal((await store.getActiveAdmissions())[0].cutoff26, 2.3);
    assert.equal((await store.getAdmissionRevisions()).history.length, 1);
    failPointerUpdate = false;
    await store.publishAdmissions(second.id, 'admin@example.com');
    assert.equal((await store.getAdmissionRevisions()).current.id, second.id);
    await store.publishAdmissions(first.id, 'admin@example.com');
    assert.equal((await store.getActiveAdmissions())[0].cutoff26, 2.3);
  } finally { cloud.enabled = false; cloud.client = null; global.fetch = originalFetch; }
});
