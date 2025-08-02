import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/layout/header"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AdminAuthProvider } from "@/lib/admin-auth-context"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "Spots - Book Restaurant Tables in Pakistan",
  description: "Book restaurant tables in seconds across Pakistan. No phone calls, instant SMS confirmation.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-inter`}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <AdminAuthProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster />
          </AdminAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
