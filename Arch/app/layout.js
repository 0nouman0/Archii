import "./globals.css";

export const metadata = {
  title: "वास्तु AI — Architectural Design Platform",
  description: "AI-powered Vastu-compliant floor plan generator for Indian residential buildings",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ height:"100vh", overflow:"hidden" }}>{children}</body>
    </html>
  );
}
