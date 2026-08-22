import { Github, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19] py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Attribution */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} DSA-Vault. All rights reserved. Built with{" "}
            <Heart size={12} className="inline text-rose-500 fill-rose-500" /> by Abhijeet Singh Rana.
          </p>
          <p className="text-xs text-slate-400 max-w-md">
            Disclaimer: This is an independent developer project and is not affiliated with,
            endorsed by, or officially connected to LeetCode.
          </p>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/thunderrbox/DSA-Vault"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <Github size={16} />
            <span>Site Source</span>
          </a>
          <a
            href="https://github.com/thunderrbox/LeetCode"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <Github size={16} />
            <span>LeetCode Repo</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
