import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

type SendEmailBody = {
  email?: string;
  subject?: string;
  reportData?: unknown;
};

const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM || "Suprema Platform <onboarding@resend.dev>";

function serializeReportData(reportData: unknown) {
  try {
    return JSON.stringify(reportData, null, 2) ?? "";
  } catch {
    return "[unserializable report data]";
  }
}

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin");
    if (origin && origin !== new URL(req.url).origin) return NextResponse.json({ error: "허용되지 않은 요청입니다." }, { status: 403 });
    const rawBody = await req.text();
    if (Buffer.byteLength(rawBody) > 1024 * 1024) return NextResponse.json({ error: "보고서 크기를 줄여 주세요." }, { status: 413 });
    let body: SendEmailBody;
    try { body = JSON.parse(rawBody); } catch { return NextResponse.json({ error: "올바른 JSON 요청이 필요합니다." }, { status: 400 }); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "올바른 요청이 필요합니다." }, { status: 400 });
    const email = String(body.email ?? "").trim();
    const subject = String(body.subject ?? "").trim();

    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "올바른 이메일 주소를 입력하세요." }, { status: 400 });
    if (!subject || subject.length > 200 || /[\r\n]/.test(subject)) return NextResponse.json({ error: "메일 제목은 줄바꿈 없이 200자 이내로 입력하세요." }, { status: 400 });
    if (!resendApiKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY is not configured", message: "메일 발송 환경변수가 설정되지 않았습니다." },
        { status: 500 },
      );
    }

    const resend = new Resend(resendApiKey);
    const { data, error } = await resend.emails.send({
      from: resendFrom,
      to: [email],
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f1720;">
          <h2 style="margin:0 0 12px;">Suprema Platform 결과보고서</h2>
          <p style="margin:0 0 16px;">요청하신 내용을 아래에 정리했습니다.</p>
          <pre style="white-space:pre-wrap; background:#f8f5ef; padding:16px; border-radius:12px; border:1px solid #eadfce;">${serializeReportData(body.reportData).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")}</pre>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      message: "이메일 발송이 완료되었습니다.",
      email,
      subject,
      id: data?.id ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Failed to process email request" }, { status: 500 });
  }
}
