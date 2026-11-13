import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const runtime = "nodejs";
export const maxDuration = 60;

// 입력값의 해시를 생성하여 중복 및 일관성 체크
function generateHash(data: unknown) {
  return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userKeywords, department, studentRecord, academyId } = body || {};
    if (!Array.isArray(userKeywords) || !userKeywords.every(item => typeof item === 'string') || userKeywords.length > 20 || typeof department !== 'string' || typeof studentRecord !== 'string' || studentRecord.length > 100_000) {
      return NextResponse.json({ error: '키워드·학과·활동 내용을 확인해 주세요.' }, { status: 400 });
    }
    
    // [표준 규칙 적용] 라이선스 체크
    const { checkLicense } = await import('@/lib/auth');
    const isLicensed = await checkLicense(academyId || "demo_academy");
    if (!isLicensed) {
      return NextResponse.json({ error: '유효한 라이선스가 없습니다.' }, { status: 403 });
    }

    // 로직 설계 핵심: 데이터 일관성 체크를 위한 입력 해시 생성
    const inputHash = generateHash({ userKeywords, department, studentRecord });

    const pb = (await import('@/lib/pocketbase')).default;

    // 1단계: DB에서 기존에 누적된 동일한 결과가 있는지 확인 (일관성 유지)
    try {
      const existingRecord = await pb.collection('suprema_pdf_analyses').getFirstListItem(`input_hash="${inputHash}"`);
      if (existingRecord) {
        console.log('Existing consistent record found in DB.');
        return NextResponse.json(typeof existingRecord.content === "string" ? JSON.parse(existingRecord.content) : existingRecord.content);
      }
    } catch {
      // 기록이 없는 경우 새로 생성 진행
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'AI 분석 환경변수가 설정되지 않았습니다.' }, { status: 503 });
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    // 2단계: AI 분석 및 융합 로직 가동
    const analysisPrompt = `
      입시 전문가로서 다음 기록을 분석하여 핵심 키워드 2개를 추출하고, 
      사용자 키워드(${userKeywords.join(', ')})와 융합한 심화 탐구 및 연계 독서를 제안해주세요.

      기록: ${studentRecord}
      학과: ${department}

      응답 형식 (JSON):
      {
        "extractedKeywords": ["키워드1", "키워드2"],
        "proposedTopic": "심화 탐구 제목",
        "explorationPath": "탐구 수행 방법",
        "recommendedBooks": [
          { "title": "도서명", "author": "저자", "reason": "이유" }
        ]
      }
    `;

    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: analysisPrompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!res.ok) return NextResponse.json({ error: 'AI 분석 요청에 실패했습니다. 잠시 후 다시 시도해 주세요.' }, { status: 502 });
    const data = await res.json();
    const parsed = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || "{}");

    // 세특 생성
    const finalPrompt = `위 탐구 '${parsed.proposedTopic}'를 바탕으로 500자 내외의 세특 문안을 작성해주세요.`;
    const finalRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }] })
    });
    if (!finalRes.ok) return NextResponse.json({ error: 'AI 결과 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.' }, { status: 502 });
    const finalData = await finalRes.json();
    const specialRecord = finalData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const finalResult = { ...parsed, specialRecord };

    // 3단계: 결과값 DB 누적 (매번 달라지지 않게 자산화)
    try {
      await pb.collection('suprema_pdf_analyses').create({
        student_name: "통합사용자",
        analysis_type: "AI_EXPLORATION",
        input_hash: inputHash, // 일관성 체크용 필드
        content: JSON.stringify(finalResult),
        created_at: new Date().toISOString()
      });
    } catch (pbError) {
      console.warn('DB Accumulation Failed:', pbError);
    }

    return NextResponse.json(finalResult);

  } catch (error) {
    console.error('AI Data Accumulation Error:', error);
    return NextResponse.json({ error: '데이터 처리 중 오류 발생' }, { status: 500 });
  }
}
