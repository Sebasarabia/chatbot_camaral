import "../styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Camaral Chatbot",
  description: "Camaral MVP chatbot"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
