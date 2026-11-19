import type { Metadata, Viewport } from "next";
import { Anton, Montserrat } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Preloader } from "@/components/Preloader";
import { Providers } from "@/components/providers";
import { site } from "@/content/site";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: "Vicuña Ingenieros · Ingeniería, arquitectura y minería",
  description:
    "Consultora y ejecutora de ingeniería, arquitectura y minería en Cajamarca y Lima: del levantamiento topográfico y el expediente técnico a la obra terminada.",
  openGraph: {
    title: "Vicuña Ingenieros · Consultoría & Construcción",
    description: "Del levantamiento topográfico a la obra terminada, con un solo equipo en Cajamarca y Lima.",
    locale: "es_PE",
    type: "website",
    images: [{ url: "/media/projects/edificio-pimentel-chiclayo.jpg" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#003647",
  colorScheme: "light",
  viewportFit: "cover",
};

// Marca la sesión antes de pintar para no repetir el preloader ni mostrarlo con movimiento reducido.
const preloadFlag = `try{if(sessionStorage.getItem("vicuna-preloaded")||matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.setAttribute("data-preloaded","")}}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-PE" className={`${anton.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: preloadFlag }} />
      </head>
      <body>
        <Providers>
          <Preloader />
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
