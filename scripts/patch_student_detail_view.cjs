const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../학원용앱/src/components/StudentDetail.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

if (content.includes("recommendation-view-container")) {
  console.log('Recommendation view already added');
  process.exit(0);
}

const anchor = `      {activeView === 'evaluation' && (`;
if (!content.includes(anchor)) {
  console.error('Could not find evaluation anchor');
  process.exit(1);
}

const recommendationJSX = `      {activeView === 'recommendation' && (
        <div className="recommendation-view-container glass-panel" style={{ padding: '24px', flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Banner & AI Matching Center */}
          <div className="rec-header-banner" style={{ background: 'linear-gradient(135deg, rgba(139,26,26,0.2) 0%, rgba(30,41,59,0.6) 100%)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ background: '#8b1a1a', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>대치 수프리마 AI 매칭 센터</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>학생: <strong style={{ color: '#fff' }}>{studentData?.name}</strong></span>
                </div>
                <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lightbulb size={22} color="#f59e0b" />
                  교과 연계 심화탐구 · 필수독서 · 세특 추천 & 학생 매칭
                </h2>
                <p style={{ margin: '6px 0 0 0', fontSize: '0.86rem', color: '#cbd5e1' }}>
                  탑재된 과학 AI, 사회 AI, AI 데이터 분석 프롬프트 도구를 활용하여 학생 맞춤형 [탐구주제 + 연계독서 + 3단계 세특]을 정교하게 매칭하고 밀착 플래너와 연동합니다.
                </p>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleOpenMatchModal('science')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', border: 'none', padding: '8px 14px', fontSize: '0.82rem', fontWeight: 700 }}
                >
                  <FlaskConical size={15} /> 🧪 과학 AI 탐구 매칭
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleOpenMatchModal('social')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', border: 'none', padding: '8px 14px', fontSize: '0.82rem', fontWeight: 700 }}
                >
                  <Scale size={15} /> ⚖️ 사회 AI 탐구 매칭
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleOpenMatchModal('ai')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', border: 'none', padding: '8px 14px', fontSize: '0.82rem', fontWeight: 700 }}
                >
                  <Sparkles size={15} /> 🤖 AI 데이터분석 매칭
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => handleOpenMatchModal('general', 'form')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.82rem' }}
                >
                  <Plus size={15} /> 직접 추천 등록
                </button>
                {recommendations.length > 0 && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setPrintRec('all')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.82rem', borderColor: '#38bdf8', color: '#38bdf8' }}
                  >
                    <Printer size={15} /> 추천서 인쇄 (A4)
                  </button>
                )}
              </div>
            </div>

            {/* Embedded AI Tools Fast Launch Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', fontSize: '0.8rem' }}>
              <span style={{ color: '#94a3b8', fontWeight: 600 }}>탑재된 AI 도구 열기:</span>
              <a
                href="https://jinhak.esteacher.kr/sciencetam.html"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', background: 'rgba(16,185,129,0.1)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.3)' }}
              >
                🧪 과학 교과 탐구 가이드 ↗
              </a>
              <a
                href="https://jinhak.esteacher.kr/socialtam.html"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#fbbf24', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', background: 'rgba(245,158,11,0.1)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.3)' }}
              >
                ⚖️ 사회 교과 탐구 가이드 ↗
              </a>
              <a
                href="https://jinhak.esteacher.kr/ai_prompt.html"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#a78bfa', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', background: 'rgba(139,92,246,0.1)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(139,92,246,0.3)' }}
              >
                🤖 AI 데이터 분석·프롬프트 ↗
              </a>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('NAVIGATE_TO', { detail: 'exploration' }))}
                style={{ background: 'transparent', border: 'none', color: '#38bdf8', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}
              >
                💡 주제탐구활동 생성기로 이동
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={\`btn-secondary \${activeRecCategory === 'all' ? 'active' : ''}\`}
                onClick={() => setActiveRecCategory('all')}
                style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px', background: activeRecCategory === 'all' ? '#1e293b' : 'rgba(255,255,255,0.04)', color: activeRecCategory === 'all' ? '#fff' : '#94a3b8', border: activeRecCategory === 'all' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.08)' }}
              >
                전체 ({recommendations.length})
              </button>
              <button
                type="button"
                className={\`btn-secondary \${activeRecCategory === 'science' ? 'active' : ''}\`}
                onClick={() => setActiveRecCategory('science')}
                style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px', background: activeRecCategory === 'science' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.04)', color: activeRecCategory === 'science' ? '#34d399' : '#94a3b8', border: activeRecCategory === 'science' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)' }}
              >
                🧪 과학 AI ({recommendations.filter(r => r.category === 'science').length})
              </button>
              <button
                type="button"
                className={\`btn-secondary \${activeRecCategory === 'social' ? 'active' : ''}\`}
                onClick={() => setActiveRecCategory('social')}
                style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px', background: activeRecCategory === 'social' ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)', color: activeRecCategory === 'social' ? '#fbbf24' : '#94a3b8', border: activeRecCategory === 'social' ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)' }}
              >
                ⚖️ 사회 AI ({recommendations.filter(r => r.category === 'social').length})
              </button>
              <button
                type="button"
                className={\`btn-secondary \${activeRecCategory === 'ai' ? 'active' : ''}\`}
                onClick={() => setActiveRecCategory('ai')}
                style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px', background: activeRecCategory === 'ai' ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)', color: activeRecCategory === 'ai' ? '#c084fc' : '#94a3b8', border: activeRecCategory === 'ai' ? '1px solid #8b5cf6' : '1px solid rgba(255,255,255,0.08)' }}
              >
                🤖 AI 데이터분석 ({recommendations.filter(r => r.category === 'ai').length})
              </button>
              <button
                type="button"
                className={\`btn-secondary \${activeRecCategory === 'general' ? 'active' : ''}\`}
                onClick={() => setActiveRecCategory('general')}
                style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '8px', background: activeRecCategory === 'general' ? '#1e293b' : 'rgba(255,255,255,0.04)', color: activeRecCategory === 'general' ? '#60a5fa' : '#94a3b8', border: activeRecCategory === 'general' ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)' }}
              >
                📚 일반 ({recommendations.filter(r => r.category === 'general').length})
              </button>
            </div>

            {recommendations.length === 0 && (
              <button
                type="button"
                className="btn-primary"
                onClick={loadPreloadedExamples}
                style={{ padding: '6px 12px', fontSize: '0.8rem', background: '#334155' }}
              >
                <Sparkles size={14} /> 대치 수프리마 추천 예시 3종 불러오기
              </button>
            )}
          </div>

          {/* Recommendations List Grid */}
          {recommendations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Lightbulb size={40} style={{ color: '#64748b', marginBottom: '12px' }} />
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#cbd5e1' }}>등록된 탐구·독서·세특 추천이 없습니다</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.86rem', color: '#64748b' }}>
                상단의 [🧪 과학 AI 탐구 매칭], [⚖️ 사회 AI 탐구 매칭], [🤖 AI 데이터분석 매칭] 버튼을 누르면 정교화된 프로세스를 통해 학생 맞춤형 탐구를 즉시 배정할 수 있습니다.
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={loadPreloadedExamples}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Sparkles size={16} /> 대치 수프리마 추천 예시 3종 즉시 불러오기
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: '16px' }}>
              {recommendations
                .filter(r => activeRecCategory === 'all' || r.category === activeRecCategory)
                .map((rec) => {
                  const categoryBadgeColor = rec.category === 'science' ? '#10b981' : rec.category === 'social' ? '#f59e0b' : rec.category === 'ai' ? '#8b5cf6' : '#3b82f6';
                  const categoryBadgeLabel = rec.category === 'science' ? '🧪 과학 AI 탐구' : rec.category === 'social' ? '⚖️ 사회 AI 탐구' : rec.category === 'ai' ? '🤖 AI 데이터분석' : '📚 일반 교과';

                  return (
                    <article key={rec.id} className="rec-card glass-panel" style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '18px', background: 'rgba(15,23,42,0.6)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {/* Card Header */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <span style={{ background: \`\${categoryBadgeColor}22\`, color: categoryBadgeColor, border: \`1px solid \${categoryBadgeColor}66\`, fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                              {categoryBadgeLabel}
                            </span>
                            <span style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px' }}>
                              {rec.subject}
                            </span>
                            <span style={{ color: '#64748b', fontSize: '0.72rem' }}>{rec.createdAt}</span>
                          </div>
                          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.4 }}>
                            {rec.topicTitle}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecommendation(rec.id)}
                          style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                          title="삭제"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Section 1: 필수 연계 독서 */}
                      <div style={{ background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <BookOpen size={14} /> STEP 1. 필수 연계 독서 · 핵심 개념
                          </span>
                        </div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
                          📖 {rec.bookTitle} {rec.bookAuthor && <span style={{ color: '#94a3b8', fontWeight: 400 }}>({rec.bookAuthor}{rec.bookPublisher ? \` / \${rec.bookPublisher}\` : ''})</span>}
                        </p>
                        {rec.coreConcept && (
                          <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                            {rec.coreConcept}
                          </p>
                        )}
                      </div>

                      {/* Section 2: 추천 세특 문장 */}
                      <div style={{ background: 'rgba(215,194,165,0.08)', border: '1px solid rgba(215,194,165,0.25)', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Sparkles size={14} /> STEP 2. 추천 세특 기재 문장 (생기부용)
                          </span>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                              navigator.clipboard.writeText(rec.setukDraft);
                              alert('세특 문장이 복사되었습니다.');
                            }}
                            style={{ padding: '2px 8px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Copy size={12} /> 복사
                          </button>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.84rem', color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {rec.setukDraft}
                        </p>
                      </div>

                      {/* Section 3: 컨설턴트 코칭 노트 */}
                      {rec.consultantTip && (
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '10px 12px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '2px' }}>
                            📋 컨설턴트 지도 조언 (변인통제 / 통계 / 실행 팁):
                          </span>
                          <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                            {rec.consultantTip}
                          </p>
                        </div>
                      )}

                      {/* Card Footer Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', marginTop: 'auto' }}>
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => handleTransferRecToPlanner(rec, 1)}
                          style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Calendar size={14} /> 밀착 플래너 과제로 전송
                        </button>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                              setEditingRecId(rec.id);
                              setRecCategory(rec.category);
                              setRecSubject(rec.subject);
                              setRecTopicTitle(rec.topicTitle);
                              setRecBookTitle(rec.bookTitle);
                              setRecBookAuthor(rec.bookAuthor || '');
                              setRecBookPublisher(rec.bookPublisher || '');
                              setRecCoreConcept(rec.coreConcept);
                              setRecSetukDraft(rec.setukDraft);
                              setRecConsultantTip(rec.consultantTip || '');
                              setModalTab('form');
                              setIsRecModalOpen(true);
                            }}
                            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => setPrintRec(rec)}
                            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                          >
                            <Printer size={13} /> 인쇄
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Recommendation Create / Edit / Matching Modal */}
      {isRecModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="modal-content glass-panel" style={{ width: '100%', maxWidth: '850px', maxHeight: '90vh', background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Modal Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b' }}>
                  {recCategory === 'science' ? '🧪 과학 교과 AI 심화탐구 매칭' : recCategory === 'social' ? '⚖️ 사회 교과 AI 심화탐구 매칭' : recCategory === 'ai' ? '🤖 AI 데이터 분석·프롬프트 매칭' : '📚 일반 탐구 추천'}
                </span>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '1.2rem', color: '#fff' }}>
                  {studentData?.name} 학생 맞춤 심화탐구 매칭
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRecModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 24px' }}>
              <button
                type="button"
                onClick={() => setModalTab('templates')}
                style={{ padding: '12px 18px', background: 'transparent', border: 'none', borderBottom: modalTab === 'templates' ? '2px solid #38bdf8' : 'none', color: modalTab === 'templates' ? '#38bdf8' : '#94a3b8', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}
              >
                1. 수프리마 엄선 템플릿 선택
              </button>
              <button
                type="button"
                onClick={() => setModalTab('guide')}
                style={{ padding: '12px 18px', background: 'transparent', border: 'none', borderBottom: modalTab === 'guide' ? '2px solid #38bdf8' : 'none', color: modalTab === 'guide' ? '#38bdf8' : '#94a3b8', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}
              >
                2. 4단계 정교화 프로세스 가이드
              </button>
              <button
                type="button"
                onClick={() => setModalTab('form')}
                style={{ padding: '12px 18px', background: 'transparent', border: 'none', borderBottom: modalTab === 'form' ? '2px solid #38bdf8' : 'none', color: modalTab === 'form' ? '#38bdf8' : '#94a3b8', fontWeight: 700, cursor: 'pointer', fontSize: '0.88rem' }}
              >
                3. 상세 내용 편집 및 매칭 확인
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              {/* Tab 1: Templates */}
              {modalTab === 'templates' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8' }}>
                    원하시는 템플릿의 <strong>[이 템플릿 적용하기]</strong>를 클릭하면 [3. 상세 내용 편집] 폼으로 자동 채워지며, 학생에게 즉시 매칭할 수 있습니다.
                  </p>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {CURATED_MATCHING_TEMPLATES
                      .filter(t => t.category === recCategory || recCategory === 'general')
                      .map(t => (
                        <div key={t.id} style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '16px', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8' }}>{t.subject}</span>
                            <button
                              type="button"
                              className="btn-primary"
                              onClick={() => handleApplyTemplate(t)}
                              style={{ padding: '4px 12px', fontSize: '0.78rem' }}
                            >
                              이 템플릿 적용하기
                            </button>
                          </div>
                          <h4 style={{ margin: 0, fontSize: '0.98rem', color: '#fff' }}>{t.topicTitle}</h4>
                          <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
                            <strong style={{ color: '#38bdf8' }}>📖 연계 도서:</strong> {t.bookTitle} ({t.bookAuthor})
                          </div>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
                            {t.setukDraft}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Guide */}
              {modalTab === 'guide' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {recCategory !== 'general' && INQUIRY_METHODOLOGY_GUIDES[recCategory] && (
                    <div>
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', color: '#38bdf8' }}>
                        {INQUIRY_METHODOLOGY_GUIDES[recCategory].title}
                      </h4>
                      <p style={{ margin: '0 0 16px 0', fontSize: '0.86rem', color: '#94a3b8' }}>
                        {INQUIRY_METHODOLOGY_GUIDES[recCategory].subtitle}
                      </p>

                      <div style={{ display: 'grid', gap: '12px' }}>
                        {INQUIRY_METHODOLOGY_GUIDES[recCategory].steps.map(step => (
                          <div key={step.stepNum} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '14px', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                              <span style={{ background: '#8b1a1a', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                                STEP {step.stepNum}
                              </span>
                              <strong style={{ color: '#fff', fontSize: '0.92rem' }}>{step.name}</strong>
                            </div>
                            <p style={{ margin: '0 0 6px 0', fontSize: '0.84rem', color: '#cbd5e1' }}>{step.description}</p>
                            <div style={{ fontSize: '0.78rem', color: '#fbbf24', background: 'rgba(245,158,11,0.08)', padding: '6px 10px', borderRadius: '6px' }}>
                              🔍 체크포인트: {step.checkPoint}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(56,189,248,0.06)', borderRadius: '10px', border: '1px solid rgba(56,189,248,0.2)' }}>
                        <strong style={{ color: '#38bdf8', fontSize: '0.86rem', display: 'block', marginBottom: '6px' }}>
                          💡 컨설턴트 정교화 코칭 팁:
                        </strong>
                        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                          {INQUIRY_METHODOLOGY_GUIDES[recCategory].consultingTips.map((tip, idx) => (
                            <li key={idx}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setModalTab('templates')}
                    style={{ marginTop: '10px' }}
                  >
                    확인 후 템플릿 선택으로 이동
                  </button>
                </div>
              )}

              {/* Tab 3: Form */}
              {modalTab === 'form' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>카테고리</label>
                      <select
                        value={recCategory}
                        onChange={(e) => setRecCategory(e.target.value as any)}
                        style={{ width: '100%', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '0.88rem' }}
                      >
                        <option value="science">🧪 과학 AI 탐구</option>
                        <option value="social">⚖️ 사회 AI 탐구</option>
                        <option value="ai">🤖 AI 데이터분석</option>
                        <option value="general">📚 일반 교과</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>교과목</label>
                      <input
                        type="text"
                        value={recSubject}
                        onChange={(e) => setRecSubject(e.target.value)}
                        placeholder="예: 물리학Ⅰ / 화학 / 사회·문화 / 정보"
                        style={{ width: '100%', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>탐구 주제명 (연구 질문 / 가설)</label>
                    <input
                      type="text"
                      value={recTopicTitle}
                      onChange={(e) => setRecTopicTitle(e.target.value)}
                      placeholder="예: 미세플라스틱의 생체 축적 메커니즘과 친환경 바이오필터 소재의 흡착 효율 비교 실험"
                      style={{ width: '100%', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '0.88rem', fontWeight: 600 }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>필수 연계 도서명</label>
                      <input
                        type="text"
                        value={recBookTitle}
                        onChange={(e) => setRecBookTitle(e.target.value)}
                        placeholder="예: 침묵의 봄"
                        style={{ width: '100%', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>저자</label>
                      <input
                        type="text"
                        value={recBookAuthor}
                        onChange={(e) => setRecBookAuthor(e.target.value)}
                        placeholder="예: 레이첼 카슨"
                        style={{ width: '100%', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '0.88rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>출판사</label>
                      <input
                        type="text"
                        value={recBookPublisher}
                        onChange={(e) => setRecBookPublisher(e.target.value)}
                        placeholder="예: 에코리브르"
                        style={{ width: '100%', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '0.88rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>도서 핵심 개념 및 탐구 동기 요약</label>
                    <textarea
                      value={recCoreConcept}
                      onChange={(e) => setRecCoreConcept(e.target.value)}
                      rows={2}
                      placeholder="도서의 핵심 이론 및 탐구 질문으로 확장된 배경을 간략히 요약합니다."
                      style={{ width: '100%', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                      추천 세특 기재 문장 (생기부 3단계: 동기 → 심화탐구/실험/데이터 → 성장 역량)
                    </label>
                    <textarea
                      value={recSetukDraft}
                      onChange={(e) => setRecSetukDraft(e.target.value)}
                      rows={4}
                      placeholder="[교과목]으로 시작하여 학생의 주도적 탐구 과정과 역량이 드러나는 완성형 문장 작성"
                      style={{ width: '100%', background: '#1e293b', border: '1px solid rgba(245,158,11,0.4)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '0.88rem', lineHeight: 1.5 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>컨설턴트 코칭 조언 (변인 통제, 오차 분석, KOSIS 통계, 코딩 조언 등)</label>
                    <input
                      type="text"
                      value={recConsultantTip}
                      onChange={(e) => setRecConsultantTip(e.target.value)}
                      placeholder="학생 지도 시 유의할 실험 조건이나 데이터 출처 조언"
                      style={{ width: '100%', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <input
                      type="checkbox"
                      id="autoPlanner"
                      checked={autoAddPlanner}
                      onChange={(e) => setAutoAddPlanner(e.target.checked)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <label htmlFor="autoPlanner" style={{ fontSize: '0.85rem', color: '#fff', cursor: 'pointer', flex: 1 }}>
                      이 추천을 학생의 밀착 플래너 과제로 자동 연동 등록
                    </label>
                    {autoAddPlanner && (
                      <select
                        value={autoAddPlannerWeek}
                        onChange={(e) => setAutoAddPlannerWeek(Number(e.target.value))}
                        style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px', padding: '3px 8px', fontSize: '0.8rem' }}
                      >
                        <option value={1}>1주차</option>
                        <option value={2}>2주차</option>
                        <option value={3}>3주차</option>
                        <option value={4}>4주차</option>
                      </select>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsRecModalOpen(false)}
                style={{ padding: '8px 16px' }}
              >
                취소
              </button>
              {modalTab !== 'form' ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setModalTab('form')}
                  style={{ padding: '8px 20px' }}
                >
                  입력 폼으로 이동
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSaveRecommendation}
                  disabled={isSavingRec}
                  style={{ padding: '8px 24px', fontWeight: 700 }}
                >
                  {isSavingRec ? '매칭 저장 중...' : '학생에게 즉시 매칭 & 추천 저장'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Print Recommendation Modal (A4) */}
      {printRec && (
        <div className="print-modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1100, overflow: 'auto', padding: '30px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '210mm', display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>추천서 인쇄 미리보기</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => window.print()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
              >
                <Printer size={15} /> 즉시 인쇄 (A4)
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setPrintRec(null)}
                style={{ padding: '8px 16px' }}
              >
                닫기
              </button>
            </div>
          </div>

          <div className="print-page A4 print-section" style={{ width: '210mm', minHeight: '297mm', background: '#fff', color: '#1e293b', padding: '20mm', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
            <div className="print-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 16px 0', letterSpacing: '2px', borderBottom: '2px double #1e293b', paddingBottom: '8px', color: '#0f172a' }}>
                심화탐구 · 독서 · 세특 맞춤 추천서
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #94a3b8', fontSize: '0.88rem' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '15%', background: '#f8fafc', fontWeight: 700, padding: '7px', border: '1px solid #94a3b8', textAlign: 'center' }}>학생명</td>
                    <td style={{ width: '35%', padding: '7px', border: '1px solid #94a3b8' }}>{studentData?.name}</td>
                    <td style={{ width: '15%', background: '#f8fafc', fontWeight: 700, padding: '7px', border: '1px solid #94a3b8', textAlign: 'center' }}>컨설팅 과정</td>
                    <td style={{ width: '35%', padding: '7px', border: '1px solid #94a3b8' }}>
                      {serviceTerm === '6month' ? '6개월 (수시 올인원 풀케어)' : serviceTerm === '3month' ? '3개월 (학기 집중 관리)' : '1개월 (속성 진단)'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ background: '#f8fafc', fontWeight: 700, padding: '7px', border: '1px solid #94a3b8', textAlign: 'center' }}>희망 진로</td>
                    <td style={{ padding: '7px', border: '1px solid #94a3b8' }}>{hopeMajor || '종합 학문'}</td>
                    <td style={{ background: '#f8fafc', fontWeight: 700, padding: '7px', border: '1px solid #94a3b8', textAlign: 'center' }}>발행일자</td>
                    <td style={{ padding: '7px', border: '1px solid #94a3b8' }}>{new Date().toISOString().slice(0, 10)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="print-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(printRec === 'all' ? recommendations : [printRec]).map((item, index) => (
                <div key={item.id} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '14px', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#8b1a1a' }}>
                      추천 {index + 1}. [{item.subject}] ({item.category === 'science' ? '과학AI' : item.category === 'social' ? '사회AI' : item.category === 'ai' ? 'AI데이터분석' : '교과탐구'})
                    </span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{item.topicTitle}</span>
                  </div>
                  <div style={{ marginBottom: '8px', fontSize: '0.84rem' }}>
                    <strong style={{ color: '#0369a1' }}>📖 필수 연계 독서:</strong> {item.bookTitle} ({item.bookAuthor || '공통'}{item.bookPublisher ? \` / \${item.bookPublisher}\` : ''})
                    {item.coreConcept && <p style={{ margin: '3px 0 0 0', color: '#475569', fontSize: '0.8rem' }}>- 핵심 요약: {item.coreConcept}</p>}
                  </div>
                  <div style={{ marginBottom: '6px', fontSize: '0.84rem' }}>
                    <strong style={{ color: '#b45309' }}>💡 추천 세특 문장:</strong>
                    <p style={{ margin: '3px 0 0 0', color: '#1e293b', fontSize: '0.82rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{item.setukDraft}</p>
                  </div>
                  {item.consultantTip && (
                    <div style={{ fontSize: '0.8rem', color: '#64748b', background: '#fff', padding: '6px 10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                      <strong>📋 지도 조언:</strong> {item.consultantTip}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="print-footer" style={{ borderTop: '2px solid #0f172a', paddingTop: '15px', marginTop: '20px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: '#475569' }}>위와 같이 학생의 학업 성장 및 학생부 종합전형을 위한 맞춤 심화탐구를 추천합니다.</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>대치수프리마 입시&코칭센터</span>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px red solid', color: 'red', fontWeight: 900, display: 'grid', placeItems: 'center', fontSize: '0.8rem', transform: 'rotate(-10deg)', userSelect: 'none' }}>인</div>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.5, borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                <p style={{ margin: '2px 0' }}>대표 : 이기욱 대표컨설턴트 | 메일 : suprimalab@gmail.com | 연락처 : 010-2370-1077(문자전송)</p>
                <p style={{ margin: '2px 0' }}>소재지 : 서울시 강남구 테헤란로 326 B1F</p>
                <p style={{ margin: '2px 0' }}>네이버 밴드 : band.us/@suprima | 블로그 : blog.naver.com/gouniv_hifive | 인스타그램 : suprima_ipsicreator</p>
              </div>
            </div>
          </div>
        </div>
      )}

`;

content = content.replace(anchor, recommendationJSX + anchor);
fs.writeFileSync(targetPath, content, 'utf8');
console.log('Recommendation JSX injected successfully into StudentDetail.tsx');
