import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";

const openRunde = localFont({
  src: [
    {
      path: "../../../public/font/openRunde/OpenRunde-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../public/font/openRunde/OpenRunde-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../public/font/openRunde/OpenRunde-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../../public/font/openRunde/OpenRunde-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-open-runde",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Email Preferences · Reloop",
  description: "Manage your email subscription preferences.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PreferencesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={openRunde.variable}>
      <body
        className="bg-bg-white-0 text-text-strong-950 antialiased"
        style={{ fontFamily: "var(--font-open-runde)" }}
      >
        {children}
      </body>
    </html>
  );
}
