import { NextResponse } from 'next/server';
import pb from '@/lib/pocketbase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    // 1. Get the latest pdf_analysis for this user
    // Note: We need to find the student associated with the user first, 
    // but in some flows user_id is directly used or via student_id.
    // Based on PB_STANDARD, we should look for students where user_id matches.
    const student = await pb.collection('suprema_students').getFirstListItem(pb.filter("user_id = {:userId}", { userId })).catch(() => null);
    
    if (!student) {
      return NextResponse.json({ keywords: [] });
    }

    const latestAnalysis = await pb.collection('suprema_pdf_analyses').getFirstListItem(pb.filter("student_id = {:studentId}", { studentId: student.id }), {
      sort: '-created',
    }).catch(() => null);

    if (!latestAnalysis || !latestAnalysis.content) {
      return NextResponse.json({ keywords: [] });
    }

    // 2. Extract keywords from analysis content
    // The content usually has a structure like { summary: { keywords: [...] } } or similar
    // We'll look for common keyword fields or extract from summary text.
    let keywords: string[] = [];
    const raw: unknown = latestAnalysis.content;
    const content = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
    const analysis: Record<string, unknown> = content.analysis && typeof content.analysis === 'object' ? content.analysis as Record<string, unknown> : {};

    if (content.keywords && Array.isArray(content.keywords)) {
      keywords = content.keywords.filter((value): value is string => typeof value === "string");
    } else if (Array.isArray(analysis.core_competencies)) {
      keywords = analysis.core_competencies.filter((value): value is string => typeof value === "string");
    } else if (typeof content.summary === "string") {
      // Fallback: simple split if summary exists
      keywords = content.summary.split(/[\s,]+/).filter((s: string) => s.length > 1).slice(0, 5);
    }

    // Take top 2
    return NextResponse.json({ keywords: keywords.slice(0, 2) });
  } catch (error: unknown) {
    console.error('Failed to fetch keywords:', error);
    return NextResponse.json({ keywords: [] });
  }
}
