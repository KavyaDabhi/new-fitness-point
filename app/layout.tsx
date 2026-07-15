import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Image from "next/image";
import Navbar from "./components/Navbar";

// Configure the font with the specific weights used in your design
const montserrat = Montserrat({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "New Fitness Point",
  description: "Premium Gym Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} font-sans antialiased bg-black text-white selection:bg-logo selection:text-white min-h-screen flex flex-col`}>
        {/* Full Page Fixed Background - Darkened for extreme contrast */}
        <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
          <Image 
            src="/bg-light.png" 
            alt="Gym 3D Background" 
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-black/75 backdrop-blur-[4px]"></div>
        </div>

        {/* Global Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="relative z-10 flex-1 w-full">
          {children}
        </main>
      </body>
    </html>
  );
}