"use client";

import Image from "next/image";
import { motion, useReducedMotionConfig, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { HEX_CLIP } from "@/lib/utils";

/* Frase del manifiesto (propósito del brochure). Las palabras con * se resaltan en azul Vicuna. */
const PHRASE =
  "No solo construimos obras. Construimos la *confianza* de nuestros clientes, con obras *seguras,* *funcionales* y *sostenibles.*";

const HEXES = [
  { src: "/media/projects/casa-campo-la-molina.jpg", alt: "Casa de campo La Molina" },
  { src: "/media/field/topografia-gnss-andes.jpg", alt: "Topografía GNSS en los Andes" },
  { src: "/media/projects/edificio-trujillo.jpg", alt: "Edificio residencial en Trujillo" },
  { src: "/media/field/mineria-supervision.jpg", alt: "Supervisión en operación minera" },
  { src: "/media/field/obra-terminada-nave.jpg", alt: "Nave comercial terminada" },
];

function Word({ word, i, n, progress }: { word: string; i: number; n: number; progress: MotionValue<number> }) {
  const hl = word.startsWith("*");
  const text = word.replaceAll("*", "");
  // Cada palabra se enciende en su tramo del recorrido
  const opacity = useTransform(progress, [i / n, (i + 1) / n], [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className={hl ? "text-vicuna" : undefined}>
      {text}{" "}
    </motion.span>
  );
}

function Hex({ h, i, progress }: { h: (typeof HEXES)[number]; i: number; progress: MotionValue<number> }) {
  // Entran en secuencia desde la izquierda, como una fila de chevrones
  const start = i * 0.12;
  const x = useTransform(progress, [start, start + 0.4], [-160, 0]);
  const opacity = useTransform(progress, [start, start + 0.3], [0, 1]);
  const scale = useTransform(progress, [start, start + 0.4], [0.9, 1]);
  return (
    <motion.div
      style={{ x, opacity, scale, clipPath: HEX_CLIP }}
      className="relative aspect-[1.155/1] w-[clamp(140px,17vw,250px)] shrink-0 -ml-[clamp(18px,2.2vw,34px)] first:ml-0"
    >
      <Image src={h.src} alt={h.alt} fill sizes="250px" className="object-cover" />
    </motion.div>
  );
}

export function Manifesto() {
  const reduce = useReducedMotionConfig();
  const textRef = useRef<HTMLParagraphElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: textP } = useScroll({ target: textRef, offset: ["start 0.85", "end 0.45"] });
  const { scrollYProgress: rowP } = useScroll({ target: rowRef, offset: ["start 0.95", "end 0.55"] });
  const words = PHRASE.split(" ");
  const full = useTransform(textP, () => 1);

  return (
    <section aria-label="Nuestro propósito" className="relative bg-humo pt-[clamp(80px,9vw,140px)] pb-[clamp(60px,7vw,110px)]">
      <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
        <p className="text-xs font-bold tracking-[0.16em] text-vicuna uppercase">Nuestro propósito</p>
        <p
          ref={textRef}
          className="mt-6 max-w-[22ch] text-[clamp(34px,4.6vw,72px)] leading-[1.05] font-semibold tracking-[-0.02em] text-petroleo"
        >
          {words.map((w, i) => (
            <Word key={i} word={w} i={i} n={words.length} progress={reduce ? full : textP} />
          ))}
        </p>
      </div>
      <div ref={rowRef} className="mt-[clamp(48px,6vw,90px)] flex overflow-hidden px-6 sm:px-8 lg:pl-[max(32px,calc((100vw-1240px)/2))]">
        {HEXES.map((h, i) => (
          <Hex key={h.src} h={h} i={i} progress={reduce ? full : rowP} />
        ))}
      </div>
    </section>
  );
}
