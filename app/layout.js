import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./components/contexts/AuthContexts/AuthContexts";
import Footer from "./components/shared_components/Footer/Footer";
import Header from "./components/shared_components/Header/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Postora | Home",
  description: "a modern blog website where admin and also users can share their opinion",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Toaster position="top-right" />
          <nav>
            <Header />
          </nav>
          <main>

        {children}
          </main>
          <footer>
            <Footer />
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
