import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OrchidMind — Knowledge Garden",
  description: "A living 3D knowledge garden where ideas bloom as orchids and AI discovers connections between them.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#030712] text-white antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}
