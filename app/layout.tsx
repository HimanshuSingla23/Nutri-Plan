import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/ui/Toast";
import { VegPreferenceProvider } from "@/context/VegPreferenceContext";

export const metadata: Metadata = {
  title: "NutriPlan Pro | Smart Meal Planning, Recipe Discovery & Pantry Tracker",
  description:
    "Organize your weekly meal plan, explore curated recipes from TheMealDB, manage your pantry inventory with expiration tracking, and auto-generate grocery lists.",
  keywords: [
    "meal planner",
    "recipe discovery",
    "pantry tracker",
    "grocery list",
    "food expiration",
    "healthy meal planning",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#FDFBF7] text-stone-800 font-sans antialiased min-h-screen flex flex-col selection:bg-emerald-500 selection:text-white">
        <ToastProvider>
          <VegPreferenceProvider>
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {children}
            </main>
            <Footer />
          </VegPreferenceProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

