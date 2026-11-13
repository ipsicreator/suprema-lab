const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const { gunzipSync } = require('node:zlib');
const ts = require('typescript');
function load(file, replacements = {}) {
  const name = path.resolve(file), m = new Module(name, module); m.paths = module.paths;
  const original = m.require.bind(m); m.require = id => id in replacements ? replacements[id] : original(id);
  m._compile(ts.transpileModule(fs.readFileSync(name, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, name);
  return m.exports;
}
class NextResponse extends Response { static json(body, init) { return Response.json(body, init); } }
function bridge() { return load('lib/academy/bridge.ts', { '@/lib/pocketbaseAdmin': { hasPocketBaseAdmin: () => false } }); }
const request = (body, origin = 'https://consultantapp.vercel.app') => new Request('https://suprema-lab.vercel.app/api/academy/ai', { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('academy route rejects origin or missing login before processing data or calling generation', async () => {
  const helpers = bridge(); let auth = 0, generation = 0;
  const route = load('app/api/academy/ai/route.ts', { 'next/server': { NextResponse }, '@/lib/academy/bridge': { ...helpers, requireAcademyUser: async () => { auth++; throw new helpers.AcademyBridgeError(401, '로그인 필요'); }, generateAcademyResult: async () => { generation++; } } });
  const forbidden = await route.POST(request({}, 'https://evil.test'));
  assert.equal(forbidden.status, 403); assert.equal(auth, 0); assert.equal(forbidden.headers.get('Access-Control-Allow-Origin'), null);
  const unauthenticated = await route.POST(request({ operation: 'exploration-topics', subject: '수학' }));
  assert.equal(unauthenticated.status, 401); assert.equal(auth, 1); assert.equal(generation, 0);
  assert.equal(unauthenticated.headers.get('Access-Control-Allow-Origin'), 'https://consultantapp.vercel.app');
});

test('authenticated academy route validates input and returns direct JSON contract with preflight support', async () => {
  const helpers = bridge(); let generated;
  const expected = [{ title: '실행 제안', objective: '자료 조사', reading: { bookTitle: '', reason: '실재 도서 확인 필요' }, activitySteps: ['조사'], output: '보고서' }];
  const route = load('app/api/academy/ai/route.ts', { 'next/server': { NextResponse }, '@/lib/academy/bridge': { ...helpers, requireAcademyUser: async () => ({ userId: 'user', academyId: 'verified' }), generateAcademyResult: async input => { generated = input; return expected; } } });
  const options = await route.OPTIONS(new Request('https://suprema-lab.vercel.app/api/academy/ai', { method: 'OPTIONS', headers: { origin: 'https://consultantapp.vercel.app' } }));
  assert.equal(options.status, 204); assert.ok(options.headers.get('Access-Control-Allow-Headers').includes('Authorization'));
  const bad = await route.POST(request({ operation: 'extract-student-text', file: { data: 'abc', mimeType: 'application/pdf' } })); assert.equal(bad.status, 400); assert.equal(generated, undefined);
  const good = await route.POST(request({ operation: 'exploration-topics', subject: '수학', academyId: 'forged' }));
  assert.equal(good.status, 200); assert.deepEqual(await good.json(), expected); assert.equal(generated.data.academyId, undefined); assert.equal(good.headers.get('Cache-Control'), 'no-store');
});

test('academy admission read shares compressed data only with exact allowed origins', async () => {
  const helpers = bridge(); let reads = 0;
  const rows = [{ univ: '검증대학', dept: '학과', type: '교과', name: '전형' }];
  const route = load('app/api/admissions/route.ts', { 'next/server': { NextResponse }, '@/lib/admissions/store': { getActiveAdmissions: async () => { reads++; return rows; } }, '@/lib/academy/bridge': helpers });
  const forbidden = await route.GET(new Request('https://suprema-lab.vercel.app/api/admissions', { headers: { origin: 'https://evil.test' } }));
  assert.equal(forbidden.status, 403); assert.equal(reads, 0);
  const response = await route.GET(new Request('https://suprema-lab.vercel.app/api/admissions', { headers: { origin: 'https://consultantapp.vercel.app' } }));
  assert.equal(response.status, 200); assert.equal(response.headers.get('Content-Encoding'), 'gzip'); assert.equal(response.headers.get('Vary'), 'Accept-Encoding, Origin');
  assert.deepEqual(JSON.parse(gunzipSync(Buffer.from(await response.arrayBuffer())).toString()), { success: true, rows });
});
