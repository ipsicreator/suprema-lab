const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../학원용앱/src/components/StudentDetail.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Add imports if not present
if (!content.includes('inquiryMatchingTemplates')) {
  const oldImport = "import {\n  ArrowLeft, FileSearch, Save, FileText, RefreshCw, Sparkles, History, ClipboardList, ChevronRight, BarChart3, Target, Printer, Upload, Send,\n  Square, Plus, Trash2, Calendar, CheckCircle2, AlertCircle, X, ExternalLink\n} from 'lucide-react';";
  const newImport = "import {\n  ArrowLeft, FileSearch, Save, FileText, RefreshCw, Sparkles, History, ClipboardList, ChevronRight, BarChart3, Target, Printer, Upload, Send,\n  Square, Plus, Trash2, Calendar, CheckCircle2, AlertCircle, X, ExternalLink, FlaskConical, Scale, BookOpen, Lightbulb, Check, Copy\n} from 'lucide-react';\nimport {\n  ConsultantRecommendation,\n  INQUIRY_METHODOLOGY_GUIDES,\n  CURATED_MATCHING_TEMPLATES\n} from '../lib/inquiryMatchingTemplates';";

  if (!content.includes(oldImport)) {
    // try matching with \r\n
    const oldImportCRLF = oldImport.replace(/\n/g, '\r\n');
    if (content.includes(oldImportCRLF)) {
      content = content.replace(oldImportCRLF, newImport.replace(/\n/g, '\r\n'));
    } else {
      console.error('Could not find oldImport in target');
      process.exit(1);
    }
  } else {
    content = content.replace(oldImport, newImport);
  }
  console.log('Imports added successfully');
}

// 2. Update activeView state
const oldState = "const [activeView, setActiveView] = useState<'analysis' | 'planner' | 'evaluation'>('analysis');";
const newState = "const [activeView, setActiveView] = useState<'analysis' | 'planner' | 'evaluation' | 'recommendation'>('analysis');";
if (content.includes(oldState)) {
  content = content.replace(oldState, newState);
  console.log('activeView state updated');
}

// 3. Add recommendation states
const stateAnchor = "const [printEval, setPrintEval] = useState<any>(null);";
const recStates = `const [printEval, setPrintEval] = useState<any>(null);

  // Recommendations & AI Matching States
  const [recommendationRecord, setRecommendationRecord] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<ConsultantRecommendation[]>([]);
  const [activeRecCategory, setActiveRecCategory] = useState<'all' | 'science' | 'social' | 'ai' | 'general'>('all');
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [editingRecId, setEditingRecId] = useState<string | null>(null);
  const [printRec, setPrintRec] = useState<ConsultantRecommendation | 'all' | null>(null);

  // Form States for Recommendation
  const [recCategory, setRecCategory] = useState<'science' | 'social' | 'ai' | 'general'>('science');
  const [recSubject, setRecSubject] = useState('');
  const [recTopicTitle, setRecTopicTitle] = useState('');
  const [recBookTitle, setRecBookTitle] = useState('');
  const [recBookAuthor, setRecBookAuthor] = useState('');
  const [recBookPublisher, setRecBookPublisher] = useState('');
  const [recCoreConcept, setRecCoreConcept] = useState('');
  const [recSetukDraft, setRecSetukDraft] = useState('');
  const [recConsultantTip, setRecConsultantTip] = useState('');
  const [autoAddPlanner, setAutoAddPlanner] = useState(true);
  const [autoAddPlannerWeek, setAutoAddPlannerWeek] = useState(1);
  const [isSavingRec, setIsSavingRec] = useState(false);
  const [modalTab, setModalTab] = useState<'guide' | 'templates' | 'form'>('templates');`;

if (content.includes(stateAnchor) && !content.includes('recommendationRecord')) {
  content = content.replace(stateAnchor, recStates);
  console.log('Recommendation states added');
}

// 4. Update loadHistory to load recommendations
const loadHistoryAnchor = "setEvaluationHistory(evals);";
const recLoadHistory = `setEvaluationHistory(evals);

      // Load recommendation data
      const rec = records.find(r => r.content?.dataType === 'recommendations');
      setRecommendationRecord(rec);
      if (rec && Array.isArray(rec.content?.items)) {
        setRecommendations(rec.content.items);
      } else {
        try {
          const local = localStorage.getItem(\`suprima_recommendations:\${identity}:\${studentData.id}\`);
          if (local) setRecommendations(JSON.parse(local));
          else setRecommendations([]);
        } catch { setRecommendations([]); }
      }`;

if (content.includes(loadHistoryAnchor) && !content.includes("dataType === 'recommendations'")) {
  content = content.replace(loadHistoryAnchor, recLoadHistory);
  console.log('loadHistory updated');
}

// 5. Update reset in useEffect
const resetAnchor = "setPrintEval(null); setUserKeywords(['', '', '']); setActiveView('analysis');";
const newReset = "setPrintEval(null); setRecommendationRecord(null); setRecommendations([]); setPrintRec(null); setIsRecModalOpen(false); setUserKeywords(['', '', '']); setActiveView('analysis');";
if (content.includes(resetAnchor)) {
  content = content.replace(resetAnchor, newReset);
  console.log('useEffect reset updated');
}

// 6. Add Recommendation Functions before render
const fnAnchor = "const handlePdfUpload = async";
const recFunctions = `// Save Recommendation Data to PocketBase and localStorage
  const saveRecommendationsData = async (items: ConsultantRecommendation[]) => {
    if (!studentData?.id) return;
    const identity = sessionIdentity();
    try {
      localStorage.setItem(\`suprima_recommendations:\${identity}:\${studentData.id}\`, JSON.stringify(items));
    } catch {}

    const content = {
      dataType: 'recommendations',
      items
    };

    try {
      if (recommendationRecord) {
        await studentRecords(studentData.id).update(recommendationRecord.id, { content });
      } else {
        const created = await studentRecords(studentData.id).create({
          student_id: studentData.id,
          content
        });
        setRecommendationRecord(created);
      }
    } catch (err) {
      console.error('saveRecommendationsData error:', err);
    }
  };

  const handleOpenMatchModal = (category: 'science' | 'social' | 'ai' | 'general' = 'science', defaultTab: 'guide' | 'templates' | 'form' = 'templates') => {
    setEditingRecId(null);
    setRecCategory(category);
    setModalTab(defaultTab);
    const tmpl = CURATED_MATCHING_TEMPLATES.find(t => t.category === category);
    if (tmpl && defaultTab === 'form') {
      setRecSubject(tmpl.subject);
      setRecTopicTitle(tmpl.topicTitle);
      setRecBookTitle(tmpl.bookTitle);
      setRecBookAuthor(tmpl.bookAuthor || '');
      setRecBookPublisher(tmpl.bookPublisher || '');
      setRecCoreConcept(tmpl.coreConcept);
      setRecSetukDraft(tmpl.setukDraft);
      setRecConsultantTip(tmpl.consultantTip || '');
    } else {
      setRecSubject(category === 'science' ? '과학탐구실험 / 통합과학' : category === 'social' ? '사회·문화 / 경제' : category === 'ai' ? '정보 / 인공지능' : '공통');
      setRecTopicTitle('');
      setRecBookTitle('');
      setRecBookAuthor('');
      setRecBookPublisher('');
      setRecCoreConcept('');
      setRecSetukDraft('');
      setRecConsultantTip('');
    }
    setAutoAddPlanner(true);
    setAutoAddPlannerWeek(1);
    setIsRecModalOpen(true);
  };

  const handleApplyTemplate = (tmpl: ConsultantRecommendation) => {
    setRecCategory(tmpl.category);
    setRecSubject(tmpl.subject);
    setRecTopicTitle(tmpl.topicTitle);
    setRecBookTitle(tmpl.bookTitle);
    setRecBookAuthor(tmpl.bookAuthor || '');
    setRecBookPublisher(tmpl.bookPublisher || '');
    setRecCoreConcept(tmpl.coreConcept);
    setRecSetukDraft(tmpl.setukDraft);
    setRecConsultantTip(tmpl.consultantTip || '');
    setModalTab('form');
  };

  const handleSaveRecommendation = async () => {
    if (!recTopicTitle.trim()) {
      alert('탐구 주제명을 입력해 주세요.');
      return;
    }
    if (!recBookTitle.trim()) {
      alert('필수 연계 도서명을 입력해 주세요.');
      return;
    }
    if (!recSetukDraft.trim()) {
      alert('추천 세특 문장을 입력해 주세요.');
      return;
    }

    setIsSavingRec(true);
    try {
      let updated: ConsultantRecommendation[];
      const targetItem: ConsultantRecommendation = {
        id: editingRecId || Date.now().toString() + Math.random().toString(),
        category: recCategory,
        subject: recSubject || '교과 공통',
        topicTitle: recTopicTitle.trim(),
        bookTitle: recBookTitle.trim(),
        bookAuthor: recBookAuthor.trim(),
        bookPublisher: recBookPublisher.trim(),
        coreConcept: recCoreConcept.trim(),
        setukDraft: recSetukDraft.trim(),
        consultantTip: recConsultantTip.trim(),
        status: 'recommended',
        createdAt: new Date().toISOString().slice(0, 10)
      };

      if (editingRecId) {
        updated = recommendations.map(r => r.id === editingRecId ? targetItem : r);
      } else {
        updated = [targetItem, ...recommendations];
      }

      setRecommendations(updated);
      await saveRecommendationsData(updated);

      if (autoAddPlanner && !editingRecId) {
        await handleTransferRecToPlanner(targetItem, autoAddPlannerWeek);
      }

      alert(\`'\${targetItem.topicTitle}' 탐구·독서·세특이 성공적으로 매칭되었습니다!\`);
      setIsRecModalOpen(false);
    } catch (err) {
      console.error('handleSaveRecommendation error:', err);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSavingRec(false);
    }
  };

  const handleDeleteRecommendation = async (id: string) => {
    if (!window.confirm('이 추천 항목을 삭제하시겠습니까?')) return;
    const updated = recommendations.filter(r => r.id !== id);
    setRecommendations(updated);
    await saveRecommendationsData(updated);
  };

  const handleTransferRecToPlanner = async (rec: ConsultantRecommendation, week: number = 1) => {
    if (!studentData?.id) return;
    try {
      const records = await studentRecords(studentData.id).getFullList({
        filter: \`student_id = "\${studentData.id}"\`,
        sort: '-created',
      });
      const planner = records.find(r => r.content?.dataType === 'planner');
      const currentTasks = planner?.content?.tasks || plannerTasks || [];
      const currentNote = planner?.content?.consultantNote || feedbackNote || '';

      const categoryLabel = rec.category === 'science' ? '과학AI' : rec.category === 'social' ? '사회AI' : rec.category === 'ai' ? 'AI데이터' : '탐구';
      const newTask = {
        id: Date.now().toString() + Math.random().toString(),
        text: \`[\${categoryLabel}] \${rec.topicTitle} (도서: \${rec.bookTitle})\`,
        week,
        done: false,
      };
      const updatedTasks = [...currentTasks, newTask];
      const content = {
        dataType: 'planner',
        tasks: updatedTasks,
        consultantNote: currentNote
      };

      if (planner) {
        await studentRecords(studentData.id).update(planner.id, { content });
      } else {
        const created = await studentRecords(studentData.id).create({
          student_id: studentData.id,
          content
        });
        setPlannerRecord(created);
      }
      setPlannerTasks(updatedTasks);
    } catch (err) {
      console.error('Transfer to planner error:', err);
    }
  };

  const loadPreloadedExamples = async () => {
    if (!studentData?.id) return;
    const examples = CURATED_MATCHING_TEMPLATES.slice(0, 3).map(tmpl => ({
      ...tmpl,
      id: Date.now().toString() + Math.random().toString(),
      createdAt: new Date().toISOString().slice(0, 10)
    }));
    const updated = [...examples, ...recommendations];
    setRecommendations(updated);
    await saveRecommendationsData(updated);
    alert('대치 수프리마 엄선 과학·사회·AI 심화탐구 3종이 학생 추천으로 불러와졌습니다!');
  };

  // Listen to ADD_RECOMMENDATION event
  useEffect(() => {
    const handleAddRec = async (e: any) => {
      if (e.detail && studentData?.id) {
        const newRec: ConsultantRecommendation = {
          id: Date.now().toString() + Math.random().toString(),
          category: e.detail.category || 'general',
          subject: e.detail.subject || '공통',
          topicTitle: e.detail.topicTitle || '',
          bookTitle: e.detail.bookTitle || '',
          bookAuthor: e.detail.bookAuthor || '',
          bookPublisher: e.detail.bookPublisher || '',
          coreConcept: e.detail.coreConcept || '',
          setukDraft: e.detail.setukDraft || '',
          consultantTip: e.detail.consultantTip || '',
          status: 'recommended',
          createdAt: new Date().toISOString().slice(0, 10)
        };
        const updated = [newRec, ...recommendations];
        setRecommendations(updated);
        await saveRecommendationsData(updated);
        alert(\`'\${newRec.topicTitle}' 탐구·독서·세특이 학생 추천 목록에 추가되었습니다.\`);
      }
    };
    window.addEventListener('ADD_RECOMMENDATION', handleAddRec);
    return () => window.removeEventListener('ADD_RECOMMENDATION', handleAddRec);
  }, [studentData?.id, recommendations, recommendationRecord]);

  ${fnAnchor}`;

if (content.includes(fnAnchor) && !content.includes('saveRecommendationsData')) {
  content = content.replace(fnAnchor, recFunctions);
  console.log('Recommendation functions added');
}

// 7. Add header tab 4
const tabAnchor = `<button className={activeView === 'evaluation' ? 'active' : ''} onClick={() => setActiveView('evaluation')}><FileText size={16} /> 3. 성장 평가서</button>`;
const newTab = `<button className={activeView === 'evaluation' ? 'active' : ''} onClick={() => setActiveView('evaluation')}><FileText size={16} /> 3. 성장 평가서</button>
          <button className={activeView === 'recommendation' ? 'active' : ''} onClick={() => setActiveView('recommendation')}><Lightbulb size={16} /> 4. 탐구·독서·세특 추천 & AI 매칭</button>`;

if (content.includes(tabAnchor) && !content.includes("4. 탐구·독서·세특 추천")) {
  content = content.replace(tabAnchor, newTab);
  console.log('Tab 4 added');
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('Phase 1 completed');
