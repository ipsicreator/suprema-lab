"use client";
import { useState, useMemo } from 'react';
import { ArrowLeft, Compass, Printer, Save, CheckCircle2, Search, Filter } from 'lucide-react';
import { parseGpaTextToNumber } from '../../../../lib/utils/admission/admissionLines';
import AdmissionOfficerEvaluation from '../AdmissionOfficerEvaluation';
import { useAdmissionData } from "../data/useAdmissionData";

interface PositionDiagnosisProps {
  onBack?: () => void;
  studentData?: { id: string; name: string } | null;
}

export default function PositionDiagnosis({ onBack, studentData }: PositionDiagnosisProps) {
  const { rows: ADMISSION_DATA, loading: dataLoading, error: dataError } = useAdmissionData();
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedSubRegion, setSelectedSubRegion] = useState<string>('');
  const [selectedUniv, setSelectedUniv] = useState<string>('');
  const [selectedTrack, setSelectedTrack] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  const [hsType, setHsType] = useState<string>('일반고');
  const [isSaved, setIsSaved] = useState(false);

  const parsedGpa = useMemo(() => {
    if (!studentData?.id) return null;
    const savedInfo = JSON.parse(localStorage.getItem(`student_info_${studentData.id}`) || '{}');
    return savedInfo.gpa ? parseGpaTextToNumber(savedInfo.gpa) : null;
  }, [studentData]);

  // Cascading filters
  const regions = useMemo(() => Array.from(new Set(ADMISSION_DATA.map(d => d.region))).sort(), [ADMISSION_DATA]);
  
  const subRegions = useMemo(() => {
    if (!selectedRegion) return [];
    return Array.from(new Set(ADMISSION_DATA.filter(d => d.region === selectedRegion).map(d => d.subRegion))).sort();
  }, [selectedRegion, ADMISSION_DATA]);

  const univs = useMemo(() => {
    if (!selectedSubRegion) return [];
    return Array.from(new Set(ADMISSION_DATA.filter(d => d.region === selectedRegion && d.subRegion === selectedSubRegion).map(d => d.univ))).sort();
  }, [selectedRegion, selectedSubRegion, ADMISSION_DATA]);

  const tracks = useMemo(() => {
    if (!selectedUniv) return [];
    return Array.from(new Set(ADMISSION_DATA.filter(d => d.univ === selectedUniv).map(d => d.track))).sort();
  }, [selectedUniv, ADMISSION_DATA]);

  const depts = useMemo(() => {
    if (!selectedTrack) return [];
    return Array.from(new Set(ADMISSION_DATA.filter(d => d.univ === selectedUniv && d.track === selectedTrack).map(d => d.dept))).sort();
  }, [selectedUniv, selectedTrack, ADMISSION_DATA]);

  const types = useMemo(() => {
    if (!selectedDept) return [];
    return Array.from(new Set(ADMISSION_DATA.filter(d => d.univ === selectedUniv && d.track === selectedTrack && d.dept === selectedDept).map(d => d.type))).sort();
  }, [selectedUniv, selectedTrack, selectedDept, ADMISSION_DATA]);

  const filteredData = useMemo(() => {
    return ADMISSION_DATA.filter(d => {
      if (selectedRegion && d.region !== selectedRegion) return false;
      if (selectedSubRegion && d.subRegion !== selectedSubRegion) return false;
      if (selectedUniv && d.univ !== selectedUniv) return false;
      if (selectedTrack && d.track !== selectedTrack) return false;
      if (selectedDept && d.dept !== selectedDept) return false;
      if (selectedType && d.type !== selectedType) return false;
      return true;
    });
  }, [selectedRegion, selectedSubRegion, selectedUniv, selectedTrack, selectedDept, selectedType, ADMISSION_DATA]);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      {dataLoading && <p role="status">입시 데이터를 불러오는 중입니다.</p>}
      {dataError && <p role="alert" style={{ color: "#b91c1c" }}>{dataError}</p>}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', backgroundColor: '#fff', padding: '1.25rem 1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {onBack && (
            <button onClick={onBack} style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowLeft size={18} /> <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>뒤로가기</span>
            </button>
          )}
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Compass size={24} color="#3b82f6" /> 입시위치 진단
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.95rem' }}>
              {studentData ? `${studentData.name} 학생의 내신(${parsedGpa || '없음'})을 기준으로 합격 가능성을 진단합니다.` : '2027학년도 수시전형 입결 데이터를 조건별로 검색합니다.'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginRight: '1rem' }}>
            <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>고교 유형 (평가 보정용)</label>
            <select 
              value={hsType} 
              onChange={(e) => setHsType(e.target.value)}
              style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontWeight: 600, color: '#1e293b' }}
            >
              <option value="일반고">일반고 (전국/광역자사 포함)</option>
              <option value="특목고">특목고</option>
            </select>
          </div>
          <button onClick={handlePrint} style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '0.5rem', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 600 }}>
            <Printer size={18} /> 출력
          </button>
          <button onClick={handleSave} style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '0.5rem', backgroundColor: isSaved ? '#10b981' : '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}>
            {isSaved ? <><CheckCircle2 size={18} /> 저장됨</> : <><Save size={18} /> 저장</>}
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={20} color="#64748b" /> 검색 조건
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>광역</label>
            <select value={selectedRegion} onChange={e => { setSelectedRegion(e.target.value); setSelectedSubRegion(''); setSelectedUniv(''); setSelectedTrack(''); setSelectedDept(''); setSelectedType(''); }} style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1' }}>
              <option value="">전체</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>기초</label>
            <select value={selectedSubRegion} onChange={e => { setSelectedSubRegion(e.target.value); setSelectedUniv(''); setSelectedTrack(''); setSelectedDept(''); setSelectedType(''); }} disabled={!selectedRegion} style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1' }}>
              <option value="">전체</option>
              {subRegions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>대학교</label>
            <select value={selectedUniv} onChange={e => { setSelectedUniv(e.target.value); setSelectedTrack(''); setSelectedDept(''); setSelectedType(''); }} disabled={!selectedSubRegion} style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1' }}>
              <option value="">전체</option>
              {univs.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>계열</label>
            <select value={selectedTrack} onChange={e => { setSelectedTrack(e.target.value); setSelectedDept(''); setSelectedType(''); }} disabled={!selectedUniv} style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1' }}>
              <option value="">전체</option>
              {tracks.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>모집단위명</label>
            <select value={selectedDept} onChange={e => { setSelectedDept(e.target.value); setSelectedType(''); }} disabled={!selectedTrack} style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1' }}>
              <option value="">전체</option>
              {depts.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>전형유형</label>
            <select value={selectedType} onChange={e => setSelectedType(e.target.value)} disabled={!selectedDept} style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1' }}>
              <option value="">전체</option>
              {types.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <AdmissionOfficerEvaluation
          averageGrade={parsedGpa}
          strongestSubject={selectedDept || '전공 탐색 중'}
          weakestGrade={parsedGpa ? Math.ceil(parsedGpa) : null}
          subjectCount={filteredData.length}
          compact
        />
      </div>

      <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={20} color="#64748b" /> 검색 결과 ({filteredData.length}건)
        </h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.9rem' }}>
            <thead style={{ backgroundColor: '#f1f5f9' }}>
              <tr>
                <th style={{ padding: '0.75rem', borderBottom: '2px solid #cbd5e1' }}>대학교</th>
                <th style={{ padding: '0.75rem', borderBottom: '2px solid #cbd5e1' }}>계열</th>
                <th style={{ padding: '0.75rem', borderBottom: '2px solid #cbd5e1' }}>모집단위명</th>
                <th style={{ padding: '0.75rem', borderBottom: '2px solid #cbd5e1' }}>전형유형</th>
                <th style={{ padding: '0.75rem', borderBottom: '2px solid #cbd5e1' }}>전형명</th>
                <th style={{ padding: '0.75rem', borderBottom: '2px solid #cbd5e1', color: '#4f46e5' }}>26컷</th>
                <th style={{ padding: '0.75rem', borderBottom: '2px solid #cbd5e1' }}>25컷</th>
                <th style={{ padding: '0.75rem', borderBottom: '2px solid #cbd5e1' }}>24컷</th>
                <th style={{ padding: '0.75rem', borderBottom: '2px solid #cbd5e1' }}>수능최저/비고</th>
                <th style={{ padding: '0.75rem', borderBottom: '2px solid #cbd5e1' }}>내신격차(진단)</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(0, 100).map((row, idx) => {
                const cutoff = row.cutoff26 ?? row.cutoff25 ?? row.cutoff24 ?? null;
                let gapMsg = '-';
                let gapColor = '#64748b';
                
                if (parsedGpa && cutoff) {
                  const gap = parsedGpa - cutoff;
                  const maxGap = hsType === '특목고' ? 1.0 : 0.5;
                  
                  if (gap <= 0) {
                    gapMsg = `▼ ${Math.abs(gap).toFixed(2)} (안정/적정)`;
                    gapColor = '#16a34a';
                  } else if (gap <= maxGap) {
                    gapMsg = `▲ ${gap.toFixed(2)} (소신/역전가능)`;
                    gapColor = '#d97706';
                  } else {
                    gapMsg = `▲ ${gap.toFixed(2)} (위험/하향권장)`;
                    gapColor = '#dc2626';
                  }
                }

                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{row.univ}</td>
                    <td style={{ padding: '0.75rem', color: '#475569' }}>{row.track}</td>
                    <td style={{ padding: '0.75rem', color: '#334155' }}>{row.dept}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ padding: '0.25rem 0.5rem', backgroundColor: String(row.type || '').includes('종합') ? '#dbeafe' : '#f1f5f9', color: String(row.type || '').includes('종합') ? '#1d4ed8' : '#475569', borderRadius: '0.25rem', fontSize: '0.8rem' }}>
                        {row.type || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#475569' }}>{row.name}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#4f46e5' }}>{row.cutoff26 ? row.cutoff26.toFixed(2) : '-'}</td>
                    <td style={{ padding: '0.75rem', color: '#64748b' }}>{row.cutoff25 ? row.cutoff25.toFixed(2) : '-'}</td>
                    <td style={{ padding: '0.75rem', color: '#64748b' }}>{row.cutoff24 ? row.cutoff24.toFixed(2) : '-'}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.8rem', color: '#64748b', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.req}>{row.req || '-'}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: gapColor }}>{gapMsg}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredData.length > 100 && (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
              검색 결과가 너무 많습니다. 상단 필터를 이용해 조건을 좁혀주세요. (상위 100개만 표시됨)
            </div>
          )}
          {filteredData.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
              조건에 맞는 입결 데이터가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
