import { NextResponse } from "next/server";
import { pbAdmin, hasPocketBaseAdmin } from "@/lib/pocketbaseAdmin";
import { extractTextFromPDFBuffer, calculateGPAFromText, type PDFAnalysisResult } from "@/lib/pdf-parser";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!hasPocketBaseAdmin()) {
    return NextResponse.json({ success: false, error: "pocketbase_not_configured" }, { status: 500 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const recordId = String(body?.recordId ?? "").trim();
  const gradingSystem = (String(body?.gradingSystem ?? "9-level") as "5-level" | "9-level") || "9-level";

  if (!/^[a-zA-Z0-9]{15}$/.test(recordId) || !["5-level", "9-level"].includes(gradingSystem)) {
    return NextResponse.json({ success: false, error: "recordId_required" }, { status: 400 });
  }

  try {
    const pb = await pbAdmin();
    const record = await pb.collection("suprema_pdf_uploads").getOne(recordId);
    const fileName = String(record?.file ?? "").trim();
    if (!fileName) {
      return NextResponse.json({ success: false, error: "file_missing" }, { status: 400 });
    }

    const fileToken = await pb.files.getToken();
    const fileUrl = pb.files.getURL(record, fileName, { token: fileToken });
    const res = await fetch(fileUrl, {
      headers: { Authorization: pb.authStore.token },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `file_download_failed_${res.status}` },
        { status: 502 },
      );
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length > 50 * 1024 * 1024) return NextResponse.json({ success: false, error: "PDF 파일 크기를 줄여 주세요." }, { status: 413 });

    let result: PDFAnalysisResult | null = null;
    let finalRawText = "";

    const geminiApiKey = process.env.GEMINI_API_KEY || "";
    if (geminiApiKey) {
      console.log("[PDF Parser] Running configured PDF analysis model.");
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-2.5-flash"}:generateContent?key=${geminiApiKey}`;
        const geminiRes = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            generationConfig: { responseMimeType: "application/json" },
            contents: [
              {
                parts: [
                  { text: `학생부 PDF에 실제 기록된 교과 성적만 추출하세요. 등급 체계는 ${gradingSystem}입니다. 과목명, 이수단위, 석차등급이 명확하게 읽히는 항목만 반환하고 보이지 않는 성적이나 이수단위를 추측하지 마세요. JSON 형식: {"success":true,"subjects":[{"subject":"과목명","unit":3,"grade":2}],"studentAnalysis":{},"message":"분석 결과"}. 성적을 읽을 수 없으면 {"success":false,"subjects":[],"studentAnalysis":{},"message":"성적 확인 필요"}로 응답하세요.` },
                  {
                    inlineData: {
                      mimeType: "application/pdf",
                      data: buffer.toString("base64"),
                    },
                  },
                ],
              },
            ],
          }),
        });

        if (geminiRes.ok) {
          const geminiJson = await geminiRes.json();
          const responseText = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) {
            const parsed = JSON.parse(responseText);
            const subjects = Array.isArray(parsed.subjects) ? parsed.subjects.filter((subject: Record<string, unknown>) => subject && typeof subject.subject === "string" && typeof subject.unit === "number" && subject.unit > 0 && subject.unit <= 30 && typeof subject.grade === "number" && subject.grade >= 1 && subject.grade <= (gradingSystem === "5-level" ? 5 : 9)) : [];
            if (parsed.success === true && subjects.length > 0 && subjects.length === parsed.subjects.length) {
              result = {
                success: true,
                gpa: Math.round(subjects.reduce((sum: number, subject: { unit: number; grade: number }) => sum + subject.unit * subject.grade, 0) / subjects.reduce((sum: number, subject: { unit: number }) => sum + subject.unit, 0) * 100) / 100,
                subjects,
                studentAnalysis: parsed.studentAnalysis && typeof parsed.studentAnalysis === "object" && !Array.isArray(parsed.studentAnalysis) ? parsed.studentAnalysis : undefined,
                message: parsed.message || "학생부 분석을 완료했습니다.",
              };
            }
          }
        }
      } catch (err) {
        console.error("[PDF Parser] Gemini API execution failed:", err);
      }
    }

    if (!result) {
      const clientExtractedText = String(body?.extractedText ?? "").trim();
      const text = clientExtractedText || extractTextFromPDFBuffer(buffer);
      finalRawText = text;
      result = calculateGPAFromText(text, gradingSystem);
    }

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.message,
        subjects: [],
        gpa: 0,
      });
    }

    return NextResponse.json({
      success: true,
      gpa: result.gpa,
      subjects: result.subjects,
      studentAnalysis: result.studentAnalysis,
      message: result.message,
      rawTextLength: finalRawText.length,
    });
  } catch (e: unknown) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "server_error" },
      { status: 500 },
    );
  }
}
