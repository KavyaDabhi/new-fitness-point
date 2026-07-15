import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

// Configure the font with the specific weights used in your design
const montserrat = Montserrat({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "New Fitness Point",
  description: "Gym Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} font-sans antialiased bg-[#fcf9f8]`}>
        {children}
      </body>
    </html>
  );
}