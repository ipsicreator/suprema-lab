import fs from 'fs';
import path from 'path';

interface Topic {
  title: string;
  direction: string;
  books: string[];
  papers: string[];
  data_sources: string[];
  conclusion_seed: string;
}

interface TopicBank {
  [subject: string]: Topic[];
}

let topicBank: TopicBank | null = null;

function loadTopicBank(): TopicBank {
  if (topicBank) return topicBank;
  try {
    const dataPath = path.join(process.cwd(), 'data', 'topic_bank.json');
    const data = fs.readFileSync(dataPath, 'utf-8');
    topicBank = JSON.parse(data) as TopicBank;
    return topicBank;
  } catch (error) {
    console.error('Failed to load topic bank:', error);
    throw new Error('Topic bank data not found');
  }
}

function normalizeTokens(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,./()]+/)
    .filter((t) => t.length > 1);
}

type UniversityGuides = { universities: Record<string, { focus: string[]; majors: Record<string, { recommended_subjects: string[] }> }> };
let universityGuides: UniversityGuides | null = null;

function loadUniversityGuides(): UniversityGuides {
  if (universityGuides) return universityGuides;
  try {
    const dataPath = path.join(process.cwd(), 'data', 'university_guides.json');
    const data = fs.readFileSync(dataPath, 'utf-8');
    universityGuides = JSON.parse(data) as UniversityGuides;
    return universityGuides;
  } catch (error) {
    console.error('Failed to load university guides:', error);
    return { universities: {} };
  }
}

function calculateRelevanceScore(
  topic: Topic,
  keywords: string[],
  careerHint: string,
  targetGoal: string,
  grade: 'middle' | 'high'
): { score: number; tip: string } {
  const corpus = `${topic.title} ${topic.direction} ${topic.books.join(
    ' '
  )} ${topic.papers.join(' ')} ${topic.conclusion_seed}`.toLowerCase();
  const guides = loadUniversityGuides();

  let score = 0;
  let tip = "";

  // 1. Keyword matching
  if (keywords.length > 0) {
    const tokens = normalizeTokens(keywords.join(' '));
    let matchCount = 0;
    const uniqueMatches = new Set<string>();
    tokens.forEach(token => {
      if (corpus.includes(token)) {
        matchCount++;
        uniqueMatches.add(token);
      }
    });
    score += (matchCount * 10) + (uniqueMatches.size * 20);
  }

  // 2. University/Major Goal Linkage
  if (targetGoal) {
    let bestUnivMatch = "";
    let bestMajorMatch = "";

    // Find university and major from targetGoal string (e.g., "서울대 컴공")
    for (const univName of Object.keys(guides.universities)) {
      if (targetGoal.includes(univName.substring(0, 3))) { // Match "서울대" with "서울대학교"
        bestUnivMatch = univName;
        break;
      }
    }

    if (bestUnivMatch) {
      const univData = guides.universities[bestUnivMatch];
      // Evaluation Focus Match
      univData.focus.forEach((f: string) => {
        if (corpus.includes(f.toLowerCase())) score += 30;
      });

      // Major-specific Recommended Subjects Match
      for (const major of Object.keys(univData.majors)) {
        if (targetGoal.includes(major.substring(0, 2))) {
          bestMajorMatch = major;
          const recSubjects = univData.majors[major].recommended_subjects;
          const matchedSubjects = recSubjects.filter((s: string) => corpus.includes(s.toLowerCase()));
          score += matchedSubjects.length * 20;
          if (matchedSubjects.length > 0) {
            tip = `[${bestUnivMatch} ${major}] 권장 과목(${matchedSubjects.join(', ')}) 역량을 강조하기 좋습니다.`;
          }
          break;
        }
      }
    }
    
    const goalTokens = normalizeTokens(targetGoal);
    const matchedGoal = goalTokens.filter(token => corpus.includes(token)).length;
    score += matchedGoal * 25;
  }

  // 3. Career hint matching
  if (careerHint) {
    const careerTokens = normalizeTokens(careerHint);
    const matchedCareer = careerTokens.filter((token) =>
      corpus.includes(token)
    ).length;
    score += matchedCareer * 15;
  }

  // 4. Grade-appropriate complexity
  const complexityKeywords = {
    high: ['통계', '알고리즘', '모델', '분석', '시뮬레이션', '최적화', '효율', '공학', '융합'],
    middle: ['실험', '관찰', '조사', '비교', '기초', '이해', '체험'],
  };
  const gradeKeywords = complexityKeywords[grade];
  const complexityMatch = gradeKeywords.filter((kw) => corpus.includes(kw)).length;
  score += complexityMatch * 10;

  score += (topic.books.length + topic.papers.length) * 5;

  return { score, tip };
}

export function recommendTopics(
  subject: string,
  interests: string[],
  careerHint: string = '',
  targetGoal: string = '',
  grade: 'middle' | 'high' = 'high',
  count: number = 5
): (Topic & { tip?: string })[] {
  const bank = loadTopicBank();
  const subjectTopics = bank[subject] || [];

  if (subjectTopics.length === 0) {
    return [];
  }

  const scored = subjectTopics.map((topic) => {
    const { score, tip } = calculateRelevanceScore(topic, interests, careerHint, targetGoal, grade);
    return { score, tip, topic };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored
    .slice(0, Math.max(count, 1))
    .map(({ topic, tip }) => ({ ...topic, tip }));
}

export function getAllSubjects(): string[] {
  const bank = loadTopicBank();
  return Object.keys(bank);
}
