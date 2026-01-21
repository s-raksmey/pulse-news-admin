// src/app/layout.tsx
import type { Metadata } from "next"
import { cookies } from "next/headers"
import "./globals.css"
import { fontKhmerDigital } from "@/lib/font"
import { LayoutWrapper } from "@/components/layout/layout-wrapper"

export const metadata: Metadata = {
  title: "Pulse News Admin",
  description: "Modern CMS dashboard with responsive design",
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
      <body className={`min-h-screen bg-slate-50 text-slate-900 antialiased ${fontKhmerDigital.className}`}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  )
}
