import "./globals.css";

export const metadata = {
  title: "Archi AI — Architectural Design Platform",
  description: "AI-powered Vastu-compliant floor plan generator for Indian residential buildings",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
