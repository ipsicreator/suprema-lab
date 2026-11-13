const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const Module=require('node:module');const ts=require('typescript');
function load(relative){const f=path.resolve(relative);const m=new Module(f,module);m.paths=module.paths;m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,f);return m.exports;}
const {diagnoseAdmissionRange}=load('lib/utils/admission/admissionDiagnosis.ts');
test('no evidence produces a held decision, not appropriate',()=>assert.equal(diagnoseAdmissionRange(2,[]).finalLevel,'판단 보류'));
test('missing 2026 retains 2025/2024 weights of 0.3 and 0.2',()=>assert.equal(diagnoseAdmissionRange(2,[{year:2025,cutoff50:2,cutoff70:2},{year:2024,cutoff50:4,cutoff70:4}]).safeCutoff,2.8));
test('missing years contribute no artificial appropriate score',()=>assert.equal(diagnoseAdmissionRange(1,[{year:2024,cutoff50:1.8,cutoff70:null}]).finalLevel,'매우 안정'));
test('invalid student grades and non-grade cutoffs cannot produce an assessment',()=>{
 assert.equal(diagnoseAdmissionRange(NaN,[{year:2026,cutoff50:2,cutoff70:3}]).finalLevel,'판단 보류');
 assert.equal(diagnoseAdmissionRange(2,[{year:2026,cutoff50:30,cutoff70:-1}]).finalLevel,'판단 보류');
});
const {resolveAdmissionRow,buildYearCutoffs,validateDiagnosisInput}=load('lib/admissions/diagnosis.ts');
const row={univ:'대학(서울)',dept:'수학과',type:'학생부교과',name:'일반',cutoff26_70:2.5,cutoff25:2.8,reference25:'최종등록자평균'};
const choice={university:'대학(서울)',department:'수학과',admission_type:'학생부교과',track_name:'일반'};
test('campus and track names must match and conflicting evidence stays unresolved',()=>{
 assert.equal(resolveAdmissionRow({...choice,university:'대학(분교)'},[row]),null);
 assert.equal(resolveAdmissionRow({...choice,track_name:'다른전형'},[row]),null);
 assert.equal(resolveAdmissionRow(choice,[row,{...row,cutoff26_70:4}]),null);
 assert.equal(resolveAdmissionRow(choice,[row]),row);
});
test('averages are not fabricated as 50/70 percentiles',()=>{
 const years=buildYearCutoffs(row);assert.equal(years[0].cutoff70,2.5);assert.equal(years[1].cutoff50,null);assert.equal(years[1].cutoff70,null);
});
test('invalid shape, invalid grades and missing target fields are rejected',()=>{
 for(const studentIndex of ['',0,10,'not a number','2x',null])assert.throws(()=>validateDiagnosisInput({studentIndex,choices:[choice]}));
 assert.throws(()=>validateDiagnosisInput({studentIndex:2,choices:{length:1}}));
 assert.throws(()=>validateDiagnosisInput({studentIndex:2,choices:[{}]}));
 assert.equal(validateDiagnosisInput({studentIndex:'2.5',choices:[choice]}).studentIndex,2.5);
});
