import Link from "next/link";
import SubmissionForm from "@/components/SubmissionForm";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="bg-gradient-to-br from-brand-700 to-brand-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-14 text-center">
          <p className="uppercase tracking-widest text-brand-100 text-xs font-semibold mb-3">
            Build with AI · Code for Communities
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">People's Priorities</h1>
          <p className="text-brand-100 text-lg">AI for Constituency Development Planning</p>
          <p className="mt-4 text-brand-50/90 max-w-2xl mx-auto text-sm">
            Submit development suggestions by voice, text, or photo — in English, Hindi, or Telugu.
            Every submission is analyzed and combined with local demographic and infrastructure data
            to help your MP prioritize what matters most.
          </p>
          <Link
            href="/dashboard"
            className="inline-block mt-6 bg-white text-brand-700 font-medium px-5 py-2.5 rounded-full text-sm hover:bg-brand-50 transition"
          >
            View MP Dashboard →
          </Link>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 py-12">
        <SubmissionForm />
      </section>

      <footer className="text-center text-xs text-slate-400 pb-8">
        Built for the Build with AI: Code for Communities hackathon.
      </footer>
    </main>
  );
}
