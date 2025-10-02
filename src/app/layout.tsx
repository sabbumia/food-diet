import type { Metadata } from "next";
import { Inter } from "next/font/google";
// @ts-ignore
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "./_components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Food Diet APP",
  description: "Calculate Your Daily Food Calories",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="">

        
        <Providers><Navbar/>
        <div className="pt-9">
          
           {children}
          </div>
          </Providers>
        </div>
      </body>
    </html>
  );
}
