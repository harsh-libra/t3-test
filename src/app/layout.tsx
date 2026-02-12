import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "T3 Chat — Multi-Provider AI Chat",
  description:
    "A modern AI chat application supporting OpenAI, Anthropic, and Google models. Chat with GPT-4o, Claude, Gemini, and more — all in one place.",
  keywords: [
    "AI",
    "chat",
    "GPT",
    "Claude",
    "Gemini",
    "OpenAI",
    "Anthropic",
    "Google",
  ],
  openGraph: {
    title: "T3 Chat — Multi-Provider AI Chat",
    description:
      "Chat with GPT-4o, Claude, Gemini, and more — all in one beautiful interface",
    type: "website",
    siteName: "T3 Chat",
  },
  twitter: {
    card: "summary_large_image",
    title: "T3 Chat — Multi-Provider AI Chat",
    description:
      "Chat with GPT-4o, Claude, Gemini, and more — all in one beautiful interface",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="transition-theme">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
