import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyNote",
  description: "A note taking app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
