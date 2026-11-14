const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../학원용앱/src/components/ExplorationModule.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

const oldBtn = `                      <button 
                        className="btn-primary" 
                        style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('TRANSFER_TO_PLANNER', { detail: { title: s.title } }));
                          window.dispatchEvent(new CustomEvent('NAVIGATE_TO', { detail: 'planner' }));
                        }}
                      >
                        <Calendar size={18} />
                        이 주제를 플래너로 즉시 전송하기
                      </button>`;

const newBtn = `                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '16px' }}>
                        <button
                          type="button"
                          className="btn-primary"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', border: 'none', padding: '10px 12px', fontSize: '0.82rem', fontWeight: 700 }}
                          onClick={() => {
                            if (!studentData?.id) {
                              alert('대시보드에서 매칭할 학생을 먼저 선택해 주세요.');
                              return;
                            }
                            const category = genSubject.includes('과학') ? 'science' : genSubject.includes('사회') ? 'social' : genSubject.includes('정보') ? 'ai' : 'general';
                            window.dispatchEvent(new CustomEvent('ADD_RECOMMENDATION', {
                              detail: {
                                category,
                                subject: genSubject,
                                topicTitle: s.title,
                                bookTitle: s.reading?.bookTitle || '추천 연계 도서',
                                bookAuthor: '',
                                bookPublisher: '',
                                coreConcept: s.objective || s.reading?.reason || '',
                                setukDraft: s.output || '',
                                consultantTip: \`탐구 진행 단계: \${(s.activitySteps || []).join(' → ')}\`
                              }
                            }));
                          }}
                        >
                          <Sparkles size={15} />
                          {studentData?.name ? \`\${studentData.name} 학생 추천 매칭\` : '학생 추천 매칭'}
                        </button>
                        <button 
                          type="button"
                          className="btn-secondary" 
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 12px', fontSize: '0.82rem' }}
                          onClick={() => {
                            window.dispatchEvent(new CustomEvent('TRANSFER_TO_PLANNER', { detail: { title: s.title } }));
                            window.dispatchEvent(new CustomEvent('NAVIGATE_TO', { detail: 'planner' }));
                          }}
                        >
                          <Calendar size={15} />
                          플래너 전송
                        </button>
                      </div>`;

const oldBtnNorm = oldBtn.replace(/\r\n/g, '\n');
const contentNorm = content.replace(/\r\n/g, '\n');

if (contentNorm.includes(oldBtnNorm)) {
  const updated = contentNorm.replace(oldBtnNorm, newBtn.replace(/\r\n/g, '\n'));
  fs.writeFileSync(targetPath, updated, 'utf8');
  console.log('ExplorationModule updated successfully');
} else {
  console.error('Could not find oldBtn in ExplorationModule');
  process.exit(1);
}
