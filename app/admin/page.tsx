import Link from "next/link";
import PdfStorageSetup from "./PdfStorageSetup";
import AdminOnly from "../components/auth/AdminOnly";
import RequireAuth from "../components/auth/RequireAuth";

export default function AdminPage() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
      <RequireAuth><AdminOnly>
        <p style={{ color: "#8b1a1a", fontSize: 14, fontWeight: 700 }}>수프리마 랩</p>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: "8px 0 28px" }}>관리자 홈</h1>
        <div style={{ display: "grid", gap: 16 }}>
          <Link href="/admin/admissions" style={{ display: "block", padding: 28, borderRadius: 14, border: "1px solid #e8dfd3", background: "white" }}>
            <h2 style={{ fontSize: 21, fontWeight: 750, marginBottom: 8 }}>입시 데이터 관리</h2>
            <p style={{ color: "#71665e", fontSize: 15 }}>엑셀·CSV 업로드, 검증, 서비스 반영과 이전 버전 복원</p>
          </Link>
          <Link href={process.env.NEXT_PUBLIC_ACADEMY_APP_URL || "https://consultantapp.vercel.app"} target="_blank" rel="noopener noreferrer" style={{ display: "block", padding: 28, borderRadius: 14, border: "1px solid #e8dfd3", background: "white" }}>
            <h2 style={{ fontSize: 21, fontWeight: 750, marginBottom: 8 }}>학원용 관리 앱</h2>
            <p style={{ color: "#71665e", fontSize: 15 }}>소속 학원과 담당 학생의 상담·분석 업무를 진행합니다.</p>
          </Link>
          <Link href="/admin/pricing" style={{ display: "block", padding: 28, borderRadius: 14, border: "1px solid #e8dfd3", background: "white" }}>
            <h2 style={{ fontSize: 21, fontWeight: 750, marginBottom: 8 }}>가격·결제 관리</h2>
            <p style={{ color: "#71665e", fontSize: 15 }}>이용 가격 설정 및 결제내역 확인</p>
          </Link>
          <Link href="/admin/academy" style={{ display: "block", padding: 28, borderRadius: 14, border: "1px solid #e8dfd3", background: "white" }}>
            <h2 style={{ fontSize: 21, fontWeight: 750, marginBottom: 8 }}>학원 권한·학생 배정 점검</h2>
            <p style={{ color: "#71665e", fontSize: 15 }}>실제 저장소의 학원별 역할과 학생 배정 상태를 확인합니다.</p>
          </Link>
          <Link href="/admin/activities" style={{display:"block",padding:28,borderRadius:14,border:"1px solid #e8dfd3",background:"white"}}><h2 style={{fontSize:21,fontWeight:750}}>학생 개인 활동 · 계정 연결</h2><p>학생 찾기, 연결 코드 등록, 탐구·세특·독서와 수정 이력 조회</p></Link>
          <PdfStorageSetup />
        </div>
      </AdminOnly></RequireAuth>
    </main>
  );
}

