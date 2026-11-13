const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module'), ts = require('typescript');
function load(file, mocks = {}) {
  const name = path.resolve(file), mod = new Module(name, module); mod.paths = module.paths;
  const ordinary = mod.require.bind(mod); mod.require = id => id in mocks ? mocks[id] : ordinary(id);
  mod._compile(ts.transpileModule(fs.readFileSync(name, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, name);
  return mod.exports;
}
class AcademyBridgeError extends Error { constructor(status, message) { super(message); this.status = status; } }
const api = load('lib/academy/assignments.ts', { '@/lib/academy/bridge': { AcademyBridgeError } });
const actor = { userId: 'user00000000001', academyId: 'academy-a', role: 'admin' };
const studentId = 'student00000001', consultantId = 'profile00000001', userId = 'user00000000002';
function fixture() {
  const state = {
    student: { id: studentId, name: '테스트 학생', academy_id: 'academy-a', assigned_consultant: '', updated: '2026-11-13 00:00:00.000Z', privatePhone: 'not-returned' },
    profile: { id: consultantId, name: '테스트 담당자', academy_id: 'academy-a', role: 'consultant', user: userId, privateEmail: 'not-returned' },
    studentSchema: { fields: [{ name: 'assigned_consultant', type: 'relation', collectionId: 'profiles', maxSelect: 1 }] },
    profileSchema: { id: 'profiles', fields: [{ name: 'user', type: 'relation', collectionId: 'users', maxSelect: 1 }, {name:'admin_id',type:'text'}] }, writes: [], touched: 0, duplicate: false,
  };
  const db = {
    collections: { getOne: async name => { state.touched++; return name === 'suprima_students' ? state.studentSchema : name === 'users' ? {id:'users'} : state.profileSchema; } },
    filter: (template, values) => template.replace(/\{:(\w+)\}/g, (_, key) => JSON.stringify(values[key])),
    collection(name) { return {
      getOne: async id => { state.touched++; return name === 'users' ? { id } : name === 'suprima_students' ? state.student : state.profile; },
      getList: async () => { state.touched++; return { totalItems: state.duplicate ? 2 : 1, items: [{ id: consultantId }] }; },
      getFullList: async () => { state.touched++; return name === 'suprima_students' ? [state.student] : [state.profile]; },
      update: async (id, data) => { state.writes.push({ name, id, data }); return { ...state.student, ...data, updated: '2026-11-13 00:00:01.000Z' }; },
    }; },
  };
  return { db, state };
}
const input = () => ({ studentId, consultantId, expectedUpdated: '2026-11-13 00:00:00.000Z' });
test('assignment API requires managers before inspecting backend and validates exact relation schema', async () => {
  const { db, state } = fixture();
  for (const role of ['consultant', 'student', '']) await assert.rejects(api.readAcademyAssignments(db, { ...actor, role }), e => e.status === 403);
  assert.equal(state.touched, 0);
  for (const field of [undefined, { name: 'assigned_consultant', type: 'text' }, { name: 'assigned_consultant', type: 'relation', collectionId: 'users', maxSelect: 1 }, { name: 'assigned_consultant', type: 'relation', collectionId: 'profiles', maxSelect: 9 }]) {
    state.studentSchema.fields = field ? [field] : [];
    await assert.rejects(api.requireAssignmentSchema(db), e => e.status === 503);
  }
});
test('assignment input rejects identity changes, forged fields and missing optimistic state', () => {
  assert.deepEqual(api.parseAssignmentInput(input()), input());
  assert.equal(api.parseAssignmentInput({ ...input(), consultantId: '' }).consultantId, '');
  for (const value of [null, [], { ...input(), academy_id: 'foreign' }, { ...input(), role: 'master' }, { ...input(), expectedUpdated: '' }, { ...input(), studentId: '../foreign' }, { ...input(), consultantId: ['forged'] }]) assert.throws(() => api.parseAssignmentInput(value), e => e.status === 400);
});
test('assignment relation validation supports the live legacy schema/options layout', async () => {
  const {db,state}=fixture();
  state.studentSchema={schema:[{name:'assigned_consultant',type:'relation',options:{collectionId:'profiles',maxSelect:1}}]};
  state.profileSchema={id:'profiles',schema:[{name:'user',type:'relation',options:{collectionId:'users',maxSelect:1}},{name:'admin_id',type:'text'}]};
  assert.deepEqual(await api.requireAssignmentSchema(db),{field:'assigned_consultant',maxSelect:1,links:['user']});
  state.profileSchema.schema[0].options.collectionId='wrong-auth';
  await assert.rejects(api.requireAssignmentSchema(db),e=>e.status===503);
});
test('foreign academy students and foreign or nonconsultant targets cannot be assigned', async () => {
  const { db, state } = fixture();
  state.student.academy_id = 'academy-b';
  await assert.rejects(api.assignAcademyStudent(db, actor, input()), e => e.status === 403);
  state.student.academy_id = 'academy-a'; state.profile.academy_id = 'academy-b';
  await assert.rejects(api.assignAcademyStudent(db, actor, input()), e => e.status === 403);
  state.profile.academy_id = 'academy-a'; state.profile.role = 'admin';
  await assert.rejects(api.assignAcademyStudent(db, actor, input()), e => e.status === 403);
  assert.equal(state.writes.length, 0);
});
test('unlinked or ambiguous consultant profiles and stale state cannot mutate assignments', async () => {
  const { db, state } = fixture();
  state.profile.user = ''; state.profile.admin_id = userId;
  await assert.rejects(api.assignAcademyStudent(db, actor, input()), e => e.status === 403);
  state.profile.user = userId; state.duplicate = true;
  await assert.rejects(api.assignAcademyStudent(db, actor, input()), e => e.status === 403);
  state.duplicate = false; state.student.updated = 'newer';
  await assert.rejects(api.assignAcademyStudent(db, actor, input()), e => e.status === 409);
  assert.equal(state.writes.length, 0);
});
test('same-academy manager updates only assigned_consultant and can explicitly unassign', async () => {
  const { db, state } = fixture();
  const assigned = await api.assignAcademyStudent(db, actor, input());
  assert.equal(assigned.assigned_consultant, consultantId);
  assert.deepEqual(state.writes, [{ name: 'suprima_students', id: studentId, data: { assigned_consultant: consultantId } }]);
  await api.assignAcademyStudent(db, actor, { ...input(), consultantId: '' });
  assert.deepEqual(state.writes[1].data, { assigned_consultant: '' });
});
test('assignment lists expose only selected fields and fail closed on foreign backend rows', async () => {
  const { db, state } = fixture();
  const result = await api.readAcademyAssignments(db, actor);
  assert.deepEqual(Object.keys(result.students[0]).sort(), ['assigned_consultant', 'id', 'name', 'updated']);
  assert.deepEqual(Object.keys(result.consultants[0]).sort(), ['id', 'name', 'role']);
  assert.equal(JSON.stringify(result).includes('not-returned'), false);
  state.profile.user = ''; assert.equal((await api.readAcademyAssignments(db, actor)).consultants.length, 0);
  state.student.academy_id = 'academy-b';
  await assert.rejects(api.readAcademyAssignments(db, actor), e => e.status === 503);
});
test('assignment route authenticates before backend, denies hostile origins and redacts unexpected errors', async () => {
  let authenticated = false, backend = 0;
  const bridge = {
    AcademyBridgeError,
    academyCors(request) { if (request.headers.get('origin') === 'https://evil.test') throw new AcademyBridgeError(403, '출처 거부'); return new Headers({ 'Access-Control-Allow-Origin': 'https://consultantapp.vercel.app', 'Cache-Control': 'no-store' }); },
    requireAcademyUser: async () => { if (!authenticated) throw new AcademyBridgeError(401, '로그인 필요'); return actor; },
    readAcademyJson: async request => request.json(),
  };
  class NextResponse extends Response { static json(body, init) { return Response.json(body, init); } }
  const route = load('app/api/academy/assignments/route.ts', { 'next/server': { NextResponse }, '@/lib/academy/bridge': bridge, '@/lib/academy/assignments': { ...api, readAcademyAssignments: async () => { throw new Error('private-db-credential'); } }, '@/lib/pocketbaseAdmin': { hasPocketBaseAdmin: () => true, pbAdmin: async () => { backend++; return {}; } } });
  const req = origin => new Request('https://suprema-lab.vercel.app/api/academy/assignments', { headers: { origin } });
  assert.equal((await route.GET(req('https://evil.test'))).status, 403); assert.equal(backend, 0);
  assert.equal((await route.GET(req('https://consultantapp.vercel.app'))).status, 401); assert.equal(backend, 0);
  authenticated = true;
  const error = await route.GET(req('https://consultantapp.vercel.app')); assert.equal(error.status, 503); assert.equal((await error.text()).includes('private-db-credential'), false);
  const options = await route.OPTIONS(req('https://consultantapp.vercel.app')); assert.equal(options.status, 204); assert.ok(options.headers.get('Access-Control-Allow-Methods').includes('PATCH'));
});
