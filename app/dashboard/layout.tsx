import { Suspense, type ReactNode } from "react";
import DashboardAccount, {
  DashboardAccountSkeleton,
} from "@/app/components/dashboard/DashboardAccount";
import DashboardSidebar from "@/app/components/dashboard/DashboardSidebar";

/**
 * Shell for the authenticated area: a fixed side rail on desktop that becomes
 * an off-canvas drawer on mobile. The account block streams in behind
 * `<Suspense>` because it reads the session; the per-page auth guard
 * (401 -> login) lives in each page.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar>
        <Suspense fallback={<DashboardAccountSkeleton />}>
          <DashboardAccount />
        </Suspense>
      </DashboardSidebar>

      <main id="main" className="min-h-screen flex-1 pt-20 lg:pl-64 lg:pt-10">
        {children}
      </main>
    </div>
  );
}
