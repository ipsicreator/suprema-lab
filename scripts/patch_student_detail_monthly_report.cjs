const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, '../학원용앱/src/components/StudentDetail.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Add Email Mailing States after printEval
const stateTarget = `  const [printEval, setPrintEval] = useState<any>(null);`;
const stateReplacement = `  const [printEval, setPrintEval] = useState<any>(null);

  // Email Mailing States for Monthly Activity Report
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailTarget, setEmailTarget] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [targetEvalForEmail, setTargetEvalForEmail] = useState<any>(null);`;

if (!content.includes('emailModalOpen')) {
  content = content.replace(stateTarget, stateReplacement);
}

// 2. Add Handler Functions (handleAutoFillFromActions, handleOpenEmailModal, handleSendEvaluationEmail)
const handlerInsertionPoint = `  // Save Evaluation\n  const handleSaveEvaluation = async () => {`;
const handlerCode = `  // Auto-Fill Evaluation from Consultant Execution Items
  const handleAutoFillFromActions = () => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;
    const isSpring = curMonth >= 3 && curMonth <= 8;
    const termLabel = \`\${curYear}학년도 \${isSpring ? '1학기' : '2학기'} (\${curMonth}월)\`;

    if (!evalTitle) {
      setEvalTitle(\`\${curMonth}월 학습 및 탐구 정기 활동 보고서\`);
    }
    if (!evalSemester) {
      setEvalSemester(termLabel);
    }

    // 1. 밀착 플래너 과제 수행률 집계
    const totalTasks = plannerTasks.length;
    const doneTasks = plannerTasks.filter(t => t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 100;

    let attitudeText = \`[밀착 플래너 과제 이행률: \${completionRate}% (\${doneTasks}/\${totalTasks}건 완료)]\\n\`;
    if (totalTasks > 0) {
      attitudeText += \`• 주차별 학습 계획을 성실히 이행하였으며, 과제 제출 기한을 철저히 준수함.\\n\`;
    } else {
      attitudeText += \`• 주간 단위 학습 목표를 능동적으로 수립하고 수업 집중도 및 질의응답 참여도가 우수함.\\n\`;
    }
    if (feedbackNote) {
      attitudeText += \`• 담당 컨설턴트 관찰 소견: \${feedbackNote}\\n\`;
    }
    attitudeText += \`• 자기주도적 학습 태도가 확립되어 시험 대비 집중력이 꾸준히 향상되고 있음.\`;
    setEvalAttitude(attitudeText);

    // 2. 심화 탐구 및 카카오 도서 DB 연계 세특 활동 집계
    let inquiryText = \`[희망 진로: \${hopeMajor || '종합 학문 계열'}]\\n\`;
    if (recommendations.length > 0) {
      inquiryText += \`[카카오 도서 DB 연계 탐구 및 세특 배정 현황]\\n\`;
      recommendations.slice(0, 3).forEach((r, idx) => {
        inquiryText += \`• (\${idx + 1}) [\${r.subject}] \${r.topicTitle}\\n  - 필독서: 《\${r.bookTitle}》 (\${r.bookAuthor || '공통'})\\n\`;
      });
      inquiryText += \`• 나이스 기재 기준에 맞춘 3단계(동기-과정-변화) 심화 탐구 보고서 작성을 성공적으로 완수함.\`;
    } else {
      inquiryText += \`• 교과 개념 심화 연계 탐구 보고서 작성을 지도 중이며, 카카오 도서 DB 기반 맞춤 필독서 및 3단계 세특 문장을 검수함.\`;
    }
    setEvalInquiry(inquiryText);

    // 3. 차월 입시 및 코칭 중점 계획 수립
    let planText = \`[차월 입시 및 학습 코칭 로드맵]\\n\`;
    planText += \`1. 취약 과목 성적 보완을 위한 주차별 문제풀이 점검 및 오답 클리닉 진행\\n\`;
    planText += \`2. 학교 생활기록부 기재 마감 대비 담당 교사 피드백 반영 및 세특 3단계 문장 최종 다듬기\\n\`;
    planText += \`3. 학기 종료(\${isSpring ? '8월' : '익년 2월'}) 기준 학부모 1:1 심층 상담 및 차기 입시 목표 대학 라인 점검\`;
    setEvalPlan(planText);
  };

  const handleOpenEmailModal = (evalRecord: any) => {
    if (!evalRecord) return;
    setTargetEvalForEmail(evalRecord);
    setEmailSubject(\`[대치수프리마] \${studentData?.name || '학생'} \${evalRecord.content.title || '월간 성장 평가서'}\`);
    setEmailMessage(\`안녕하세요. 대치수프리마 대입전략연구소 담당 컨설턴트입니다.\\n\${studentData?.name || '학생'}의 \${evalRecord.content.title || '월간 정기 활동 보고서'}를 전달해 드립니다.\\n\\n가정에서도 학생의 성장을 함께 격려해 주시기 바랍니다.\`);
    setEmailModalOpen(true);
  };

  const handleSendEvaluationEmail = async () => {
    if (!emailTarget.trim() || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(emailTarget.trim())) {
      alert('올바른 수신자 이메일 주소를 입력해 주세요.');
      return;
    }
    if (!targetEvalForEmail) return;

    setIsSendingEmail(true);
    try {
      const response = await fetch(\`\${SUPREMA_LAB_URL}/api/send-email\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailTarget.trim(),
          subject: emailSubject.trim(),
          reportType: 'monthly_evaluation',
          reportData: {
            dataType: 'evaluation',
            studentName: studentData?.name,
            title: targetEvalForEmail.content.title,
            evalType: targetEvalForEmail.content.evalType,
            semester: targetEvalForEmail.content.semester,
            date: targetEvalForEmail.content.date,
            attitude: targetEvalForEmail.content.attitude,
            inquiry: targetEvalForEmail.content.inquiry,
            plan: targetEvalForEmail.content.plan,
            message: emailMessage,
            consultantName: '대치 수프리마 담당 컨설턴트'
          }
        })
      });

      const resJson = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(resJson?.error?.message || resJson?.error || resJson?.message || '이메일 발송에 실패했습니다.');
      }

      alert(\`✅ \${emailTarget} 주소로 월간 활동 보고서가 성공적으로 발송되었습니다!\`);
      setEmailModalOpen(false);
      setEmailTarget('');
    } catch (err: any) {
      alert(\`이메일 발송 실패: \${err?.message || '네트워크 오류가 발생했습니다.'}\`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Save Evaluation
  const handleSaveEvaluation = async () => {`;

if (!content.includes('handleAutoFillFromActions')) {
  // Normalize both CRLF and LF
  content = content.replace(/\r\n/g, '\n');
  content = content.replace(handlerInsertionPoint, handlerCode);
}

// 3. Update Header Tabs to show 4 ordered steps:
// 1. 학생부·성적 분석, 2. 밀착 플래너, 3. 탐구·독서·세특 추천, 4. 월간 활동 보고서 (A4출력/메일링)
const oldTabs = `<div className="header-tabs">
          <button className={activeView === 'analysis' ? 'active' : ''} onClick={() => setActiveView('analysis')}><Sparkles size={16} /> 1. 학생부 분석</button>
          <button className={activeView === 'planner' ? 'active' : ''} onClick={() => setActiveView('planner')}><ClipboardList size={16} /> 2. 밀착 플래너</button>
          <button className={activeView === 'evaluation' ? 'active' : ''} onClick={() => setActiveView('evaluation')}><FileText size={16} /> 3. 성장 평가서</button>
          <button className={activeView === 'recommendation' ? 'active' : ''} onClick={() => setActiveView('recommendation')}><Lightbulb size={16} /> 4. 탐구·독서·세특 추천 & AI 매칭</button>
        </div>`;

const newTabs = `<div className="header-tabs">
          <button className={activeView === 'analysis' ? 'active' : ''} onClick={() => setActiveView('analysis')}><Sparkles size={16} /> 1. 학생부·성적 분석</button>
          <button className={activeView === 'planner' ? 'active' : ''} onClick={() => setActiveView('planner')}><ClipboardList size={16} /> 2. 밀착 플래너</button>
          <button className={activeView === 'recommendation' ? 'active' : ''} onClick={() => setActiveView('recommendation')}><Lightbulb size={16} /> 3. 탐구·독서·세특 추천 & AI 매칭</button>
          <button className={activeView === 'evaluation' ? 'active' : ''} onClick={() => setActiveView('evaluation')}><FileText size={16} /> 4. 월간 활동 보고서 (A4출력/메일링)</button>
        </div>`;

content = content.replace(oldTabs, newTabs);

// 4. In Evaluation Editor, insert Auto-fill button above form-grid
const oldEditorHeader = `<div className="form-title" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{selectedEval ? '성장 평가서 수정' : '새로운 성장 평가서 작성'}</h4>
                </div>`;

const newEditorHeader = `<div className="form-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#fff' }}>{selectedEval ? '월간 활동 보고서 수정' : '새로운 월간 활동 보고서 작성'}</h4>
                  <button
                    type="button"
                    onClick={handleAutoFillFromActions}
                    className="btn-secondary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      fontSize: '0.8rem',
                      background: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    title="플래너 과제 달성률 및 배정된 도서·세특 데이터를 평가서 항목에 자동으로 요약 반영합니다."
                  >
                    <Sparkles size={14} /> ⚡ 실행 항목 데이터 자동 집계 및 반영 (Auto-Fill)
                  </button>
                </div>`;

content = content.replace(oldEditorHeader, newEditorHeader);

// 5. In selectedEval action buttons, add Email button
const oldActionButtons = `<div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setPrintEval(selectedEval)}
                      className="icon-action-btn"
                      title="PDF 출력/인쇄"
                    >
                      <Printer size={16} />
                    </button>`;

const newActionButtons = `<div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleOpenEmailModal(selectedEval)}
                      className="icon-action-btn"
                      style={{ color: '#38bdf8' }}
                      title="학부모/학생 이메일(메일링) 발송"
                    >
                      <Send size={16} />
                    </button>
                    <button
                      onClick={() => setPrintEval(selectedEval)}
                      className="icon-action-btn"
                      title="PDF 출력/인쇄"
                    >
                      <Printer size={16} />
                    </button>`;

content = content.replace(oldActionButtons, newActionButtons);

// 6. In printEval preview controls, add Email button
const oldPrintControls = `<div className="print-controls" style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn-primary"
                onClick={() => window.print()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.88rem' }}
              >
                <Printer size={14} /> 즉시 인쇄 (A4)
              </button>`;

const newPrintControls = `<div className="print-controls" style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => handleOpenEmailModal(printEval)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.88rem', color: '#38bdf8', borderColor: 'rgba(56,189,248,0.4)' }}
              >
                <Send size={14} /> 학부모/학생 메일 발송
              </button>
              <button
                className="btn-primary"
                onClick={() => window.print()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.88rem' }}
              >
                <Printer size={14} /> 즉시 인쇄 (A4)
              </button>`;

content = content.replace(oldPrintControls, newPrintControls);

// 7. Add Email Mailing Modal before closing tag of component
const modalSnippet = `
      {/* Email Mailing Modal */}
      {emailModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={20} color="#38bdf8" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>월간 활동 보고서 메일 발송</h3>
              </div>
              <button type="button" onClick={() => setEmailModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px' }}>수신자 이메일 (학부모 또는 학생)</label>
                <input
                  type="email"
                  value={emailTarget}
                  onChange={(e) => setEmailTarget(e.target.value)}
                  placeholder="parent@example.com"
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px' }}>메일 제목</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px' }}>담당 컨설턴트 전달 메모</label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={4}
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.86rem', lineHeight: 1.5 }}
                />
              </div>

              <div style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', padding: '10px 12px', fontSize: '0.8rem', color: '#38bdf8' }}>
                💡 본사 이메일 발송 서버(Resend)를 통해 대치수프리마 정규 브랜딩 HTML 양식으로 안전하게 전달됩니다.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={() => setEmailModalOpen(false)}
                className="btn-secondary"
                disabled={isSendingEmail}
                style={{ padding: '8px 16px' }}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSendEvaluationEmail}
                disabled={isSendingEmail}
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px', background: '#0284c7', borderColor: '#0284c7', fontWeight: 700 }}
              >
                <Send size={14} /> {isSendingEmail ? '발송 중...' : '✉️ 보고서 메일 즉시 전송'}
              </button>
            </div>
          </div>
        </div>
      )}
`;

if (!content.includes('Email Mailing Modal')) {
  content = content.replace('    </div>\n  );\n};\n\nexport default StudentDetail;', `${modalSnippet}    </div>\n  );\n};\n\nexport default StudentDetail;`);
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Successfully patched StudentDetail.tsx with monthly report auto-fill and email mailing modal!');
