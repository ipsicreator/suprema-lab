const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const filename = path.resolve('app/components/UserInfoForm.tsx');
const loaded = new Module(filename, module);
loaded.paths = module.paths;
const originalRequire = loaded.require.bind(loaded);
loaded.require = name => name.endsWith('.css') ? {} : originalRequire(name);
loaded._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, filename);
const { normalizeSavedUserInfo } = loaded.exports;

test('malformed saved profile values cannot replace string or subject fields', () => {
  assert.equal(normalizeSavedUserInfo(null), null);
  assert.equal(normalizeSavedUserInfo('invalid'), null);
  assert.equal(normalizeSavedUserInfo([]), null);
  const parsed = normalizeSavedUserInfo({ schoolName: {}, studentName: ['bad'], parsedSubjects: {}, studentIndex: Infinity });
  assert.deepEqual(parsed, {});
});

test('stored subject and analysis collections are validated before rendering', () => {
  const parsed = normalizeSavedUserInfo({
    studentName: '학생', parsedSubjects: [null, { subject: '국어', grade: 2, unit: 3 }, { subject: {}, grade: 2, unit: 3 }, { subject: '수학', grade: '오류', unit: 3 }],
    studentAnalysis: { keyKeywords: ['탐구', null, {}], majorSuitability: {}, comprehensiveOpinion: '확인된 의견' },
  });
  assert.equal(parsed.studentName, '학생');
  assert.deepEqual(parsed.parsedSubjects, [{ subject: '국어', grade: 2, unit: 3 }]);
  assert.deepEqual(parsed.studentAnalysis, { keyKeywords: ['탐구'], comprehensiveOpinion: '확인된 의견' });
});
