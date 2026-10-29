import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Halil Hodja — Put your code in the spotlight.",
  description:
    "Create beautiful, honest GitHub stats and language cards. Public commit streaks, seven themes, and README-ready SVGs. Free and open source.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
