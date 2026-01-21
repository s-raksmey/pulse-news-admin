// src/app/layout.tsx
import type { Metadata } from "next"
import { cookies } from "next/headers"
import Link from "next/link"
import "./globals.css"
import { fontKhmerDigital } from "@/lib/font"

export const metadata: Metadata = {
  title: "Pulse News Admin",
  description: "CMS dashboard and Editor.js",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ✅ cookies() is async in your setup → await is CORRECT
  const cookieStore = await cookies()
  const locale = cookieStore.get("locale")?.value === "km" ? "km" : "en"

  return (
    <html lang={locale} data-locale={locale} className={fontKhmerDigital.variable}>
      <body className={`min-h-screen bg-white text-slate-900 ${fontKhmerDigital.className}`}>
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500">CMS</div>
              <h1 className="text-xl font-semibold">Pulse News Dashboard</h1>
            </div>

            <div className="flex gap-3 text-sm">
              <Link
                className="text-slate-600 hover:text-slate-900"
                href="/articles"
              >
                Articles
              </Link>
            </div>
          </div>

          {children}
        </div>
      </body>
    </html>
  )
}
