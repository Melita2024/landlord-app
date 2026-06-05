import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Landlord Tenant System",
  description: "Manage your properties and tenants efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="flex h-screen overflow-hidden bg-background">
            <aside className="hidden md:flex w-64 flex-col border-r bg-slate-900">
              <Sidebar />
            </aside>
            <main className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <div className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4">
                {children}
              </div>
              <BottomNav />
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
