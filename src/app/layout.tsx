import type { Metadata } from "next";
import { Inter, Inter_Tight, JetBrains_Mono, Anton, Work_Sans } from "next/font/google";
import "./globals.css";

// Public site faces: a compressed heavy display for the shouts, a plain
// grotesk for everything read. Admin and auth pages keep Inter below.
const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const workSans = Work_Sans({
  variable: "--font-work",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Spartan Vanguard | La Cañada High School Math Club",
    template: "%s · Spartan Vanguard",
  },
  description: "Spartan Vanguard is La Cañada High School's math club focused on extracurricular math, problem solving, and competitions.",
  openGraph: {
    title: "Spartan Vanguard",
    description: "Extracurricular math, problem solving, and competitions at La Cañada High School.",
    siteName: "Spartan Vanguard",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable} ${anton.variable} ${workSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
