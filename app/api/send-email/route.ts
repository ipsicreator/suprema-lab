import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

type SendEmailBody = {
  email?: string;
  subject?: string;
  reportType?: string;
  reportData?: unknown;
};

const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM || "Suprema Platform <onboarding@resend.dev>";

function escapeHtml(value: unknown): string {
  if (value == null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function serializeReportData(reportData: unknown): string {
  try {
    return JSON.stringify(reportData, null, 2) ?? "";
  } catch {
    return "[unserializable report data]";
  }
}

function isAllowedOrigin(origin: string | null, requestUrl: string): boolean {
  if (!origin) return true;
  try {
    const currentOrigin = new URL(requestUrl).origin;
    if (origin === currentOrigin) return true;
  } catch {
    return false;
  }
  const allowed = new Set(["https://consultantapp.vercel.app"]);
  for (const entry of (process.env.ACADEMY_APP_ORIGINS || "").split(",")) {
    try {
      const u = new URL(entry.trim());
      if (["http:", "https:"].includes(u.protocol) && u.origin === entry.trim()) {
        allowed.add(u.origin);
      }
    } catch {}
  }
  return allowed.has(origin);
}

function renderMonthlyEvaluationHtml(data: any): string {
  const studentName = escapeHtml(data.studentName || "학생");
  const evalTitle = escapeHtml(data.title || "학습 및 탐구 성장 평가서");
  const evalType = escapeHtml(
    data.evalType === "monthly" ? "월말 정기 평가" :
    data.evalType === "quarterly" ? "분기 집중 평가" :
    data.evalType === "semester" ? "학기 종합 평가" : "성장 평가서"
  );
  const semester = escapeHtml(data.semester || "정규 관리 학기");
  const date = escapeHtml(data.date || new Date().toLocaleDateString("ko-KR"));
  const attitude = escapeHtml(data.attitude || "기록된 내용이 없습니다.");
  const inquiry = escapeHtml(data.inquiry || "기록된 내용이 없습니다.");
  const plan = escapeHtml(data.plan || "기록된 내용이 없습니다.");
  const consultantName = escapeHtml(data.consultantName || "대치 수프리마 전문 컨설턴트");
  const consultantMessage = data.message ? escapeHtml(data.message) : "";

  return `
    <div style="max-width: 680px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #7a1212 0%, #4a0b0b 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
        <span style="display: inline-block; background: rgba(255,255,255,0.18); color: #fef08a; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-bottom: 10px; letter-spacing: 0.5px;">
          대치 수프리마 대입전략연구소 정기 리포트
        </span>
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.3;">
          ${evalTitle}
        </h1>
        <p style="margin: 8px 0 0 0; font-size: 13px; color: #fecdd3;">
          학생의 학업 성취도와 탐구 역량 성장을 체계적으로 진단하여 전달합니다.
        </p>
      </div>

      <!-- Main Body -->
      <div style="padding: 28px 24px;">
        <!-- Student Info Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <tbody>
            <tr style="background: #f8fafc;">
              <td style="width: 18%; padding: 10px 12px; font-weight: 700; color: #475569; border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">학생명</td>
              <td style="width: 32%; padding: 10px 12px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">${studentName}</td>
              <td style="width: 18%; padding: 10px 12px; font-weight: 700; color: #475569; border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">평가 구분</td>
              <td style="width: 32%; padding: 10px 12px; font-weight: 600; color: #7a1212; border-bottom: 1px solid #e2e8f0;">${evalType}</td>
            </tr>
            <tr>
              <td style="padding: 10px 12px; font-weight: 700; color: #475569; border-right: 1px solid #e2e8f0; background: #f8fafc;">기준 학기</td>
              <td style="padding: 10px 12px; color: #334155; border-right: 1px solid #e2e8f0;">${semester}</td>
              <td style="padding: 10px 12px; font-weight: 700; color: #475569; border-right: 1px solid #e2e8f0; background: #f8fafc;">발행 일자</td>
              <td style="padding: 10px 12px; color: #334155;">${date}</td>
            </tr>
          </tbody>
        </table>

        ${consultantMessage ? `
          <div style="margin-bottom: 24px; padding: 14px 16px; background: #fdf2f2; border-left: 4px solid #7a1212; border-radius: 6px;">
            <div style="font-size: 12px; font-weight: 700; color: #7a1212; margin-bottom: 4px;">💌 담당 컨설턴트 전달 사항</div>
            <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.6; white-space: pre-wrap;">${consultantMessage}</p>
          </div>
        ` : ""}

        <!-- Section 1: 학습 태도 및 참여도 -->
        <div style="margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; background: #ffffff;">
          <div style="display: flex; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
            <span style="display: inline-block; width: 22px; height: 22px; border-radius: 50%; background: #e0f2fe; color: #0369a1; text-align: center; line-height: 22px; font-size: 12px; font-weight: 700; margin-right: 8px;">1</span>
            <h3 style="margin: 0; font-size: 15px; font-weight: 700; color: #0f172a;">학습 태도 및 수업 참여도 분석</h3>
          </div>
          <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.7; white-space: pre-wrap;">${attitude}</p>
        </div>

        <!-- Section 2: 주제 탐구 및 수행 역량 -->
        <div style="margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; background: #ffffff;">
          <div style="display: flex; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
            <span style="display: inline-block; width: 22px; height: 22px; border-radius: 50%; background: #e0f2fe; color: #0369a1; text-align: center; line-height: 22px; font-size: 12px; font-weight: 700; margin-right: 8px;">2</span>
            <h3 style="margin: 0; font-size: 15px; font-weight: 700; color: #0f172a;">주제 탐구 및 과제 수행 역량 평가</h3>
          </div>
          <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.7; white-space: pre-wrap;">${inquiry}</p>
        </div>

        <!-- Section 3: 향후 중점 계획 -->
        <div style="margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; background: #ffffff;">
          <div style="display: flex; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
            <span style="display: inline-block; width: 22px; height: 22px; border-radius: 50%; background: #e0f2fe; color: #0369a1; text-align: center; line-height: 22px; font-size: 12px; font-weight: 700; margin-right: 8px;">3</span>
            <h3 style="margin: 0; font-size: 15px; font-weight: 700; color: #0f172a;">향후 학습 및 입시 코칭 중점 계획</h3>
          </div>
          <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.7; white-space: pre-wrap;">${plan}</p>
        </div>

        <!-- Official Sign / Seal -->
        <div style="border-top: 2px solid #0f172a; padding-top: 20px; margin-top: 28px; text-align: center;">
          <p style="margin: 0 0 16px 0; font-size: 13px; color: #475569;">
            위와 같이 학생의 학업 성장을 진단하고 차월 입시 코칭 계획을 보고합니다.
          </p>
          <div style="margin-bottom: 16px;">
            <span style="font-size: 16px; font-weight: 800; color: #0f172a; vertical-align: middle;">
              대치수프리마 입시&amp;코칭센터
            </span>
            <span style="display: inline-block; margin-left: 10px; width: 36px; height: 36px; border: 2px solid #dc2626; border-radius: 50%; color: #dc2626; font-size: 12px; font-weight: 900; line-height: 34px; text-align: center; vertical-align: middle;">
              인
            </span>
          </div>
          <p style="margin: 0; font-size: 12px; color: #64748b;">
            담당 컨설턴트: <strong>${consultantName}</strong>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.6;">
        <p style="margin: 0 0 4px 0; font-weight: 700; color: #334155;">대치수프리마 대입전략연구소</p>
        <p style="margin: 0 0 2px 0;">대표 : 이기욱 대표컨설턴트 | 메일 : suprimalab@gmail.com | 고객지원 : 010-2370-1077 (문자전용)</p>
        <p style="margin: 0 0 2px 0;">사업자등록번호: 369-81-03608 | 통신판매업신고번호: 2026-서울강남-01984호</p>
        <p style="margin: 0;">주소: 서울특별시 강남구 대치동 906-22 동관빌딩 4층 대치수프리마 대입전략연구소</p>
        <p style="margin: 6px 0 0 0; color: #94a3b8;">Copyright &copy; 2026 대치수프리마 대입전략연구소. All rights reserved.</p>
      </div>
    </div>
  `;
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") || "";
  const headers = new Headers({
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  });
  if (origin && isAllowedOrigin(origin, req.url)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }
  return new NextResponse(null, { status: 204, headers });
}

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin");
    if (!isAllowedOrigin(origin, req.url)) {
      return NextResponse.json({ error: "허용되지 않은 요청입니다." }, { status: 403 });
    }

    const corsHeaders: Record<string, string> = {};
    if (origin && isAllowedOrigin(origin, req.url)) {
      corsHeaders["Access-Control-Allow-Origin"] = origin;
      corsHeaders["Vary"] = "Origin";
    }

    const rawBody = await req.text();
    if (Buffer.byteLength(rawBody) > 1024 * 1024) {
      return NextResponse.json({ error: "보고서 크기를 줄여 주세요." }, { status: 413, headers: corsHeaders });
    }

    let body: SendEmailBody;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "올바른 JSON 요청이 필요합니다." }, { status: 400, headers: corsHeaders });
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "올바른 요청이 필요합니다." }, { status: 400, headers: corsHeaders });
    }

    const email = String(body.email ?? "").trim();
    const subject = String(body.subject ?? "").trim();

    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "올바른 이메일 주소를 입력하세요." }, { status: 400, headers: corsHeaders });
    }
    if (!subject || subject.length > 200 || /[\r\n]/.test(subject)) {
      return NextResponse.json({ error: "메일 제목은 줄바꿈 없이 200자 이내로 입력하세요." }, { status: 400, headers: corsHeaders });
    }

    if (!resendApiKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY is not configured", message: "메일 발송 환경변수가 설정되지 않았습니다." },
        { status: 500, headers: corsHeaders },
      );
    }

    const resend = new Resend(resendApiKey);

    let htmlContent: string;
    const isMonthlyEvaluation =
      body.reportType === "monthly_evaluation" ||
      (body.reportData && typeof body.reportData === "object" && (body.reportData as any).dataType === "evaluation");

    if (isMonthlyEvaluation && body.reportData && typeof body.reportData === "object") {
      htmlContent = renderMonthlyEvaluationHtml(body.reportData);
    } else {
      htmlContent = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f1720;">
          <h2 style="margin:0 0 12px;">Suprema Platform 결과보고서</h2>
          <p style="margin:0 0 16px;">요청하신 내용을 아래에 정리했습니다.</p>
          <pre style="white-space:pre-wrap; background:#f8f5ef; padding:16px; border-radius:12px; border:1px solid #eadfce;">${escapeHtml(serializeReportData(body.reportData))}</pre>
        </div>
      `;
    }

    const { data, error } = await resend.emails.send({
      from: resendFrom,
      to: [email],
      subject,
      html: htmlContent,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400, headers: corsHeaders });
    }

    return NextResponse.json({
      ok: true,
      message: "이메일 발송이 완료되었습니다.",
      email,
      subject,
      id: data?.id ?? null,
    }, { headers: corsHeaders });
  } catch {
    return NextResponse.json({ error: "Failed to process email request" }, { status: 500 });
  }
}
