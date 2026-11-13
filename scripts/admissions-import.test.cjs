const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const ts = require('typescript');
const XLSX = require('xlsx');
const filename = path.resolve('lib/admissions/import.ts');
const loaded = new Module(filename, module);
loaded.paths = module.paths;
loaded._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,filename);
const { parseWorkbook, normalizeRows } = loaded.exports;
const headers=['대학교','모집단위명','전형유형','전형명','2026학년도\r\n입결(등급)','2026학년도 기준'];
const workbook=(rows)=>{const w=XLSX.utils.book_new();XLSX.utils.book_append_sheet(w,XLSX.utils.aoa_to_sheet(rows),'전체');return w;};
test('V7.24 title rows, multiline headers and percentile basis are recognized',()=>{
 const result=parseWorkbook(workbook([['입시 검색기'],[],headers,['테스트대','수학과','학생부교과','일반',2.3,'최종등록자70%컷']]));
 assert.equal(result.rows.length,1);assert.equal(result.rows[0].univ,'테스트대');assert.equal(result.rows[0].cutoff26_70,2.3);assert.equal(result.rows[0].cutoff26_50,null);
});
test('missing columns or an incomplete row cannot replace the dataset',()=>{
 assert.throws(()=>parseWorkbook(workbook([['제목'],['설명']])));
 assert.throws(()=>parseWorkbook(workbook([headers,['테스트대',null,'교과','일반',2,'평균']])));
 assert.throws(()=>normalizeRows([]));
});
test('average and multiple subgroup grades are not fabricated as percentile cutoffs',()=>{
 const r=parseWorkbook(workbook([headers,['테스트대','A','교과','일반',2.1,'평균'],['테스트대','B','교과','일반','남:5.60\n여:4.40','최종등록자70%컷']]));
 assert.equal(r.rows[0].cutoff26_50,null);assert.equal(r.rows[0].cutoff26_70,null);assert.equal(r.rows[1].cutoff26,null);assert.equal(r.rows[1].cutoff26_text,'남:5.60\n여:4.40');assert.ok(r.warningCount>0);
});
test('server validation rejects forged values and out-of-range grade cutoffs',()=>{
 assert.throws(()=>normalizeRows([{univ:'A',dept:'B',type:'C',name:'D',cutoff26_70:99}]));
 assert.throws(()=>normalizeRows([{univ:{},dept:'B',type:'C',name:'D'}]));
});
test('canonical JSON roundtrip retains all rows, text, and explicit percentile values',()=>{
 const first=parseWorkbook(workbook([headers,['A','B','C','D',2.3,'최종등록자70%컷']]));
 const second=normalizeRows(JSON.parse(JSON.stringify(first.rows)));
 assert.deepEqual(second.rows,first.rows);
});
