import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = { title: "Nearby Services Finder", viewport: "width=device-width, initial-scale=1" };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body style={{ margin: 0, fontFamily: "sans-serif", background: "#f1f5f9" }}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
