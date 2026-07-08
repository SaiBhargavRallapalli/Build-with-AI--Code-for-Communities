import Link from "next/link";
import ThemeChart from "@/components/ThemeChart";
import PriorityTable from "@/components/PriorityTable";
import HotspotMap from "@/components/HotspotMapClient";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-brand-900">MP Dashboard</h1>
            <p className="text-sm text-slate-500">People's Priorities — Constituency Development Planning</p>
          </div>
          <Link href="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            ← Citizen portal
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Demand hotspots</h2>
          <HotspotMap />
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Recurring themes</h2>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <ThemeChart />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Ranked priorities — adjust weights to match your development plan
          </h2>
          <PriorityTable />
        </section>
      </div>
    </main>
  );
}
