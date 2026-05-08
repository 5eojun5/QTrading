import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "QTrading — Quant Options Dashboard",
  description: "Professional quantitative options trading dashboard with AI-powered signal analysis",
  keywords: ["options trading", "quantitative finance", "AI trading", "stock market"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "hsl(222 47% 7%)",
              color: "hsl(210 40% 98%)",
              border: "1px solid hsl(217 33% 13%)",
              borderRadius: "0.75rem",
            },
          }}
        />
      </body>
    </html>
  );
}
