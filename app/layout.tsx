import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const soraLight = localFont({
  src: [
    {
      path: "../public/font/Sora-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/font/Sora-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-sora-light",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F0EDEB" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1A1A" },
  ],
};

export const metadata: Metadata = {
  title: "Kiments CRM",
  description: "CRM textil para conversaciones, contactos y reportes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${soraLight.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors expand position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
