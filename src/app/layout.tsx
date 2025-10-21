import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

const GH_REPO = process.env.NEXT_PUBLIC_GITHUB_URL || "#";
const GH_PROFILE = process.env.NEXT_PUBLIC_GITHUB_PROFILE || "https://github.com";

export const metadata: Metadata = {
  title: "Fuel Dashboard",
  description: "Fuel stats powered by Appwrite + OpenAI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="h-full">
      <body className="min-h-screen">
        {/* Header */}
        <header className="border-b bg-white">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold text-neutral-900 hover:text-neutral-600 transition-colors">
              Fuel Dashboard
            </Link>
            <nav className="flex items-center gap-6 text-sm font-medium text-neutral-700">
              <Link href="/features" className="hover:text-neutral-500 transition-colors">
                Features
              </Link>
              <Link href="/dashboard" className="hover:text-neutral-500 transition-colors">
                Dashboard
              </Link>
              <Link
                href="/login"
                className="rounded-md border border-neutral-200 px-3 py-1.5 hover:border-neutral-400 hover:text-neutral-900 transition-colors"
              >
                Log in
              </Link>
            </nav>
          </div>
        </header>

        {/* Main */}
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>

        {/* Footer (centered with links) */}
        <footer className="mt-16 border-t bg-white">
          <div className="mx-auto max-w-6xl px-6 py-6">
            <div className="w-full flex flex-col items-center justify-center gap-2 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <span>© {new Date().getFullYear()}</span>
                <span>—</span>
                <a
                  className="underline hover:no-underline"
                  href={GH_PROFILE}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Lukas Dienst
                </a>
              </div>
              <a
                className="underline hover:no-underline"
                href={GH_REPO}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub Repository
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
