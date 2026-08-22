import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { HelpCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow flex flex-col items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center gap-6">
        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900/20">
          <HelpCircle size={48} className="stroke-[1.5]" />
        </div>

        <div className="flex flex-col gap-2 max-w-md">
          <h1 className="text-4xl font-extrabold tracking-tight">Page Not Found</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            The page you are looking for doesn&apos;t exist or was moved. Check the URL or browse the solved problems catalog.
          </p>
        </div>

        <Link
          href="/problems"
          className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md shadow-indigo-600/10"
        >
          <ArrowLeft size={16} />
          <span>Browse Problems</span>
        </Link>
      </main>

      <Footer />
    </div>
  );
}
