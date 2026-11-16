import AdminOnly from "../components/auth/AdminOnly";
import RequireAuth from "../components/auth/RequireAuth";
import AdminDashboardHub from "./AdminDashboardHub";

export default function AdminPage() {
  const academyAppUrl = process.env.NEXT_PUBLIC_ACADEMY_APP_URL || "https://consultantapp.vercel.app";

  return (
    <main className="min-h-screen bg-[#faf8f5] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <RequireAuth>
          <AdminOnly>
            <AdminDashboardHub academyAppUrl={academyAppUrl} />
          </AdminOnly>
        </RequireAuth>
      </div>
    </main>
  );
}
