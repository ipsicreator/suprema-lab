const {test}=require('node:test');
const assert=require('node:assert/strict');
const {parseArgs,buildDiagnosisRows,buildCutoffRows}=require('./update_admission.js');
test('CLI requires an explicit source and defaults to validation without writing',()=>{
 assert.throws(()=>parseArgs([]));
 assert.deepEqual(parseArgs(['source.xlsx']),{workbookPath:'source.xlsx',sheetName:undefined,writeBundled:false});
 assert.equal(parseArgs(['source.xlsx','--write-bundled','--sheet=전체']).writeBundled,true);
 assert.equal(parseArgs(['source.xlsx','--sheet','전체']).sheetName,'전체');
 assert.throws(()=>parseArgs(['source.xlsx','other.xlsx']));
 assert.throws(()=>parseArgs(['source.xlsx','--unknown']));
});
test('CSV exports do not guess percentiles or relabel 2026 observations as 2027',()=>{
 const rows=[{univ:'테스트대',dept:'수학과',type:'교과',name:'일반',cutoff26:2,cutoff25:3,cutoff26_50:null,cutoff26_70:2.5,reference26:'최종등록자70%컷'}];
 const diagnosis=buildDiagnosisRows(rows)[0];assert.equal(diagnosis.year,2026);assert.equal(diagnosis.cutoff_score_50,'');assert.equal(diagnosis.cutoff_score_70,2.5);
 assert.deepEqual(buildCutoffRows(rows),[{year:2026,university:'테스트대',department:'수학과',admission_type:'교과',track_name:'일반',percentile_type:70,cutoff_score:2.5}]);
});
