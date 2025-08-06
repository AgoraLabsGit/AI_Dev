import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Lora, Cormorant_Garamond, Playfair_Display, Orbitron, Dancing_Script, Press_Start_2P, Nunito, Roboto_Slab, Courier_Prime, Poppins } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: "400", variable: "--font-cormorant-garamond" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair-display" });
const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });
const dancing = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing-script" });
const pressStart = Press_Start_2P({ subsets: ["latin"], weight: "400", variable: "--font-press-start-2p" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const robotoSlab = Roboto_Slab({ subsets: ["latin"], variable: "--font-roboto-slab" });
const courierPrime = Courier_Prime({ subsets: ["latin"], weight: "400", variable: "--font-courier-prime" });
const poppins = Poppins({ subsets: ["latin"], weight: "400", variable: "--font-poppins" });


export const metadata: Metadata = {
  title: "Vibe Lab",
  description: "Your AI-powered software architect.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrains.variable} ${lora.variable} ${cormorant.variable} ${playfair.variable} ${orbitron.variable} ${dancing.variable} ${pressStart.variable} ${nunito.variable} ${robotoSlab.variable} ${courierPrime.variable} ${poppins.variable} font-sans`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
