import { NextResponse } from 'next/server';
import { pbAdmin } from '@/lib/pocketbaseAdmin';
import { requireAdminOrThrow } from '@/lib/server-auth';

interface HistoryRecord {
  [key: string]: unknown;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    await requireAdminOrThrow();
    const pb = await pbAdmin();
    let history: HistoryRecord[] = [];
    if (type === 'setuk') {
      // setuk_history 컬렉션에서 데이터 가져오기
      history = await pb.collection('suprema_setuk_history').getFullList({
        sort: '-created',
      });
    } else if (type === 'diagnosis') {
      // diagnosis_sessions 컬렉션에서 데이터 가져오기
      history = await pb.collection('suprema_diagnosis_sessions').getFullList({
        sort: '-created',
        expand: 'support_choices_via_session_id',
      });
    }

    return NextResponse.json({ success: true, history });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error('History fetch error:', error);
    const status = message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : ["ADMIN_NOT_CONFIGURED", "AUTH_NOT_CONFIGURED"].includes(message) ? 503 : 500;
    return NextResponse.json({ success: false, error: status === 500 ? "이력을 불러오지 못했습니다." : message }, { status });
  }
}
