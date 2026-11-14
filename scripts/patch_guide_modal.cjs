const fs = require('fs');
const path = require('path');

// 1. Update InquiryGuide.tsx
const inquiryPath = path.resolve(__dirname, '../학원용앱/src/components/InquiryGuide.tsx');
let inquiryContent = fs.readFileSync(inquiryPath, 'utf8');

if (!inquiryContent.includes('ConsultantGuideModal')) {
  inquiryContent = inquiryContent.replace(
    "import './InquiryGuide.css';",
    "import ConsultantGuideModal from './ConsultantGuideModal';\nimport './InquiryGuide.css';"
  );

  inquiryContent = inquiryContent.replace(
    "const [selectedTemplate, setSelectedTemplate] = useState<ConsultantRecommendation | null>(null);",
    "const [selectedTemplate, setSelectedTemplate] = useState<ConsultantRecommendation | null>(null);\n  const [isGuideBookModalOpen, setIsGuideBookModalOpen] = useState(false);"
  );

  const oldPill = `<div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>`;
  const newPill = `<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsGuideBookModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.8rem', borderColor: '#f59e0b', color: '#f59e0b' }}
            >
              <BookOpen size={14} /> 📄 사회·과학 AI 활용 가이드북 확인 & 다운로드
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>`;

  inquiryContent = inquiryContent.replace(oldPill, newPill);

  const endTag = `      {/* Matching Modal from Inquiry Guide */}`;
  inquiryContent = inquiryContent.replace(
    endTag,
    `<ConsultantGuideModal isOpen={isGuideBookModalOpen} onClose={() => setIsGuideBookModalOpen(false)} />\n\n      ${endTag}`
  );

  fs.writeFileSync(inquiryPath, inquiryContent, 'utf8');
  console.log('InquiryGuide wired with ConsultantGuideModal');
}

// 2. Update StudentDetail.tsx
const detailPath = path.resolve(__dirname, '../학원용앱/src/components/StudentDetail.tsx');
let detailContent = fs.readFileSync(detailPath, 'utf8');

if (!detailContent.includes('ConsultantGuideModal')) {
  detailContent = detailContent.replace(
    "import './StudentDetail.css';",
    "import ConsultantGuideModal from './ConsultantGuideModal';\nimport './StudentDetail.css';"
  );

  detailContent = detailContent.replace(
    "const [printRec, setPrintRec] = useState<ConsultantRecommendation | 'all' | null>(null);",
    "const [printRec, setPrintRec] = useState<ConsultantRecommendation | 'all' | null>(null);\n  const [isGuideBookModalOpen, setIsGuideBookModalOpen] = useState(false);"
  );

  // Add button to recommendation header action bar
  const actionBtnAnchor = `<button\n                  type="button"\n                  className="btn-primary"\n                  onClick={() => handleOpenMatchModal('science')}`;
  const actionBtnAnchorNorm = actionBtnAnchor.replace(/\n/g, '\r\n');

  const guideBtn = `<button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsGuideBookModalOpen(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.82rem', borderColor: '#f59e0b', color: '#f59e0b' }}
                >
                  <BookOpen size={15} /> 📄 사회·과학 AI 활용 가이드북
                </button>\n                `;

  if (detailContent.includes(actionBtnAnchorNorm)) {
    detailContent = detailContent.replace(actionBtnAnchorNorm, guideBtn.replace(/\n/g, '\r\n') + actionBtnAnchorNorm);
  } else if (detailContent.includes(actionBtnAnchor)) {
    detailContent = detailContent.replace(actionBtnAnchor, guideBtn + actionBtnAnchor);
  }

  // Render modal at end
  const modalEndAnchor = `{/* Print Recommendation Modal (A4) */}`;
  detailContent = detailContent.replace(
    modalEndAnchor,
    `<ConsultantGuideModal isOpen={isGuideBookModalOpen} onClose={() => setIsGuideBookModalOpen(false)} />\n\n      ${modalEndAnchor}`
  );

  fs.writeFileSync(detailPath, detailContent, 'utf8');
  console.log('StudentDetail wired with ConsultantGuideModal');
}
