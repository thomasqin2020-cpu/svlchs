import type { Metadata } from "next";
import { Inter, Inter_Tight, JetBrains_Mono, Fraunces, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

// Public site faces: a hairline serif for the name and specimens, a plain
// grotesk for everything read. Admin and auth pages keep Inter below.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500"],
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
    <html lang="en" className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable} ${fraunces.variable} ${hanken.variable}`}>
      <body>{children}</body>
    </html>
  );
}
