"use client";

import { useState } from "react";
import Link from "next/link";
import RequireAuth from "../../components/auth/RequireAuth";
import AdminOnly from "../../components/auth/AdminOnly";

interface Plan {
  planId: string;
  name: string;
  monthlyPriceKrw: number;
  oneTimePriceKrw?: number;
  availableTermsMonths: number[];
}

export default function AdminPricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [orders, setOrders] = useState<Array<{
    orderId: string;
    userId: string;
    amountKrw: number;
    status: string;
    provider: string;
    billingType: string;
    termMonths: number;
    requestedAt: string;
    paidAt?: string;
  }>>([]);
  const [tab, setTab] = useState<"pricing" | "orders">("pricing");
  const [message, setMessage] = useState("");

  const loadPlans = async () => {
    const res = await fetch("/api/platform/billing");
    const data = await res.json();
    if (data?.success) setPlans(data.plans ?? []);
  };

  const loadOrders = async () => {
    const res = await fetch("/api/platform/admin/orders");
    const data = await res.json();
    if (data?.success) setOrders(data.orders ?? []);
    else setMessage(data?.error ?? "결제내역 조회 실패");
  };

  const handleUpdate = async (plan: Plan) => {
    const res = await fetch("/api/platform/billing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plan),
    });
    const data = await res.json();
    if (data?.success) {
      setMessage(`${plan.name} 가격이 저장되었습니다.`);
      loadPlans();
      return;
    }
    setMessage(data?.error ?? "저장 실패");
  };

  return (
    <main className="container" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
      <RequireAuth>
        <AdminOnly>
        <Link href="/admin/admissions" style={{ display: "inline-block", marginBottom: "1rem", color: "var(--suprima-burgundy)", fontWeight: 700 }}>입시 데이터 업로드 관리 →</Link>
        <h1 className="page-title" style={{ fontSize: "2rem", marginBottom: "1rem" }}>관리자 - 가격 설정</h1>
        <p className="page-subtitle">월 가격, 1회 가격, 허용 개월(1/3/6)을 수정할 수 있습니다.</p>
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
          <button
            className="btn-primary"
            type="button"
            onClick={async () => {
              setTab("pricing");
              await loadPlans();
            }}
          >
            가격설정
          </button>
          <button
            className="btn-primary"
            type="button"
            onClick={async () => {
              setTab("orders");
              await loadOrders();
            }}
          >
            결제내역 조회
          </button>
        </div>

        {tab === "pricing" && <div style={{ display: "grid", gap: "1rem" }}>
          {plans.length === 0 && (
            <button className="btn-primary" type="button" onClick={loadPlans}>
              가격정보 불러오기
            </button>
          )}
          {plans.map((plan, index) => (
            <div className="glass-card" key={plan.planId}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">플랜명</label>
                  <input
                    value={plan.name}
                    onChange={(e) => {
                      const next = [...plans];
                      next[index] = { ...plan, name: e.target.value };
                      setPlans(next);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">월 가격</label>
                  <input
                    type="number"
                    value={plan.monthlyPriceKrw}
                    onChange={(e) => {
                      const next = [...plans];
                      next[index] = { ...plan, monthlyPriceKrw: Number(e.target.value) };
                      setPlans(next);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">1회 가격</label>
                  <input
                    type="number"
                    value={plan.oneTimePriceKrw ?? 0}
                    onChange={(e) => {
                      const next = [...plans];
                      next[index] = { ...plan, oneTimePriceKrw: Number(e.target.value) };
                      setPlans(next);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">허용 개월</label>
                  <input
                    value={plan.availableTermsMonths.join(",")}
                    onChange={(e) => {
                      const values = e.target.value
                        .split(",")
                        .map((v) => Number(v.trim()))
                        .filter((v) => !Number.isNaN(v));
                      const next = [...plans];
                      next[index] = { ...plan, availableTermsMonths: values };
                      setPlans(next);
                    }}
                    placeholder="1,3,6"
                  />
                </div>
              </div>

              <button className="btn-primary" onClick={() => handleUpdate(plan)} type="button">
                저장
              </button>
            </div>
          ))}
        </div>}

        {tab === "orders" && (
          <div className="glass-card">
            <h2 style={{ marginBottom: "1rem" }}>결제내역</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "8px" }}>주문ID</th>
                    <th style={{ textAlign: "left", padding: "8px" }}>사용자</th>
                    <th style={{ textAlign: "left", padding: "8px" }}>결제타입</th>
                    <th style={{ textAlign: "left", padding: "8px" }}>개월</th>
                    <th style={{ textAlign: "left", padding: "8px" }}>금액</th>
                    <th style={{ textAlign: "left", padding: "8px" }}>상태</th>
                    <th style={{ textAlign: "left", padding: "8px" }}>요청시각</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderId}>
                      <td style={{ padding: "8px", borderTop: "1px solid var(--card-border)" }}>{order.orderId}</td>
                      <td style={{ padding: "8px", borderTop: "1px solid var(--card-border)" }}>{order.userId}</td>
                      <td style={{ padding: "8px", borderTop: "1px solid var(--card-border)" }}>{order.billingType}</td>
                      <td style={{ padding: "8px", borderTop: "1px solid var(--card-border)" }}>{order.termMonths}</td>
                      <td style={{ padding: "8px", borderTop: "1px solid var(--card-border)" }}>{order.amountKrw.toLocaleString()}원</td>
                      <td style={{ padding: "8px", borderTop: "1px solid var(--card-border)" }}>{order.status}</td>
                      <td style={{ padding: "8px", borderTop: "1px solid var(--card-border)" }}>{order.requestedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {message && <p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>{message}</p>}
        </AdminOnly>
      </RequireAuth>
    </main>
  );
}
