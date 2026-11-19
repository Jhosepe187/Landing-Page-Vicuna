"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotionConfig, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { rubros, specialties } from "@/content/site";
import { cn } from "@/lib/utils";
import { useScene } from "@/store/scene";
import { useHexNavigate } from "./RouteHex";
import { Button, DiagonalEdge, HexBullet, ScrollTopo, SectionTitle, useScrollTo } from "./ui";

type S = (typeof specialties)[number];

/** Distancia desde arriba a la que se apilan las filas (deja ver el borde de las anteriores). */
const STACK_TOP = 96;
const STACK_STEP = 18;

function Row({ s, i, last }: { s: S; i: number; last: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotionConfig();
  const navigate = useHexNavigate();
  const setPrefill = useScene((st) => st.setPrefill);
  const scrollTo = useScrollTo();
  const word = rubros.find((r) => r.id === s.id)!.label;
  const href = `/especialidades/${s.id}`;
  const top = STACK_TOP + i * STACK_STEP;

  // Cuando la siguiente fila la cubre, esta se aleja: se encoge y se oscurece
  const { scrollYProgress } = useScroll({ target: ref, offset: [`start ${top}px`, `end ${top}px`] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, last ? 1 : 0.92]);
  const shade = useTransform(scrollYProgress, [0, 1], [0, last ? 0 : 0.55]);
  // La foto se desplaza dentro de la fila (paralaje)
  const { scrollYProgress: inView } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const imgY = useTransform(inView, [0, 1], ["-12%", "0%"]);

  return (
    <motion.article
      ref={ref}
      aria-labelledby={`rubro-${s.id}`}
      style={reduce ? { top } : { top, scale }}
      className="sticky h-[min(80svh,660px)] origin-top overflow-hidden rounded-[22px] bg-petroleo-deep shadow-[0_-24px_60px_-30px_rgb(0_0_0/0.7)]"
    >
      <motion.div style={reduce ? undefined : { y: imgY }} className="absolute inset-[-12%_0_0_0]">
        <Image src={s.image} alt={s.alt} fill sizes="100vw" className="object-cover" />
      </motion.div>
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgb(0_24_33/0.94)_0%,rgb(0_35_48/0.78)_42%,rgb(0_35_48/0.35)_100%)]" />
      <motion.div aria-hidden style={{ opacity: shade }} className="absolute inset-0 bg-black" />

      <div className="relative grid h-full grid-rows-[auto_1fr_auto] gap-6 p-6 sm:p-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)_auto] lg:grid-rows-1 lg:items-center">
        {/* Columna izquierda: número, texto y alcance */}
        <div className="order-2 max-w-[420px] lg:order-1">
          <span className="grid size-10 place-items-center rounded-full text-sm font-bold text-white shadow-[inset_0_0_0_1.5px_rgb(120_176_200/0.6)]">
            {i + 1}
          </span>
          <p className="mt-5 text-[15px] leading-relaxed text-niebla">{s.body}</p>
          <ul className="mt-5 hidden gap-2 text-sm text-white sm:grid">
            {s.scope.map((item) => (
              <li key={item} className="flex gap-2.5">
                <HexBullet className="text-celeste" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button variant="secondary-dark" href={href}>
              Ver más del rubro
            </Button>
            <Button
              arrow
              onClick={() => {
                setPrefill(s.projectType);
                scrollTo("contacto");
              }}
            >
              Solicitar propuesta
            </Button>
          </div>
        </div>

        {/* Palabra enorme */}
        <h3
          id={`rubro-${s.id}`}
          className="display order-1 self-start text-[clamp(52px,7.4vw,132px)] leading-[0.85] text-white lg:order-2 lg:self-center lg:text-center"
        >
          {word}
          <span className="sr-only"> · {s.title}</span>
        </h3>

        {/* Flecha */}
        <a
          href={href}
          onClick={(e) => navigate(href, e)}
          aria-label={`Abrir ${s.title}`}
          className="group order-3 hidden size-[clamp(72px,7vw,110px)] place-items-center rounded-full text-white shadow-[inset_0_0_0_1.5px_rgb(255_255_255/0.5)] transition-[background-color,color,transform] duration-300 ease-[var(--ease-out-expo)] hover:bg-white hover:text-petroleo active:scale-[0.96] lg:grid"
        >
          <ArrowUpRight className="size-1/2 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1 group-hover:-translate-y-1" strokeWidth={1.4} />
        </a>
      </div>
    </motion.article>
  );
}

export function Specialties() {
  return (
    <section
      id="especialidades"
      aria-labelledby="especialidades-title"
      className={cn("on-dark relative bg-petroleo-deep pt-[clamp(128px,14vw,200px)] pb-[clamp(96px,10vw,150px)]")}
    >
      <DiagonalEdge color="var(--color-humo)" flip />
      <ScrollTopo opacity={0.12} seed={8} />
      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-8">
        <div className="grid gap-6 px-2 sm:px-0 lg:grid-cols-[0.9fr_1.6fr]">
          <p className="text-xs font-bold tracking-[0.16em] text-celeste uppercase">Especialidades</p>
          <div>
            <SectionTitle id="especialidades-title" className="text-[clamp(40px,5vw,76px)] text-white">
              Tres especialidades, un solo equipo
            </SectionTitle>
            <p className="mt-5 max-w-[56ch] text-lg text-niebla">
              Lideramos el desarrollo integral de su inversión a través de tres rubros especializados. Donde la
              precisión técnica en el papel se convierte en calidad, eficiencia y cumplimiento estricto en el campo.
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6">
          {specialties.map((s, i) => (
            <Row key={s.id} s={s} i={i} last={i === specialties.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
