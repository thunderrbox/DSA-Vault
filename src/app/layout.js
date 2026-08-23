import "./globals.css";
import { Providers } from "./providers.js";

export const metadata = {
  title: "DSA-Vault — LeetCode Solutions & DSA Notebook",
  description: "An automated coding journal displaying solved LeetCode problems, code approaches, and analysis directly synchronized from GitHub.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 dark:bg-[#0B0F19] dark:text-[#F3F4F6] antialiased font-sans transition-colors duration-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
