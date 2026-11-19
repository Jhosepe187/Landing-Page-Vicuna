"use client";

import Image from "next/image";
import { ArrowRight, Eye, HeartHandshake, Target } from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { about, clients, site, specialties, type PillarId } from "@/content/site";
import { categories, projects, type ProjectCategory } from "@/content/projects";
import { cn, HEX_CLIP } from "@/lib/utils";
import { ScrollTopo, SectionTitle, TopoLines, useScrollTo } from "./ui";

const EASE = [0.16, 1, 0.3, 1] as const;
const CYCLE_MS = 6000;
const ICONS: Record<PillarId, typeof Target> = { mision: Target, vision: Eye, proposito: HeartHandshake };

/* ------------------------------------------------------------------ */
/* Inclinación 3D compartida: la tarjeta sigue al cursor con resorte    */
/* ------------------------------------------------------------------ */
function useTilt(max = 7) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 150, damping: 18 });
  const sy = useSpring(my, { stiffness: 150, damping: 18 });
  const rotateY = useTransform(sx, [-1, 1], [-max, max]);
  const rotateX = useTransform(sy, [-1, 1], [max * 0.8, -max * 0.8]);
  const glare = useTransform(sx, [-1, 1], ["15%", "85%"]);
  const handlers = {
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      if (e.pointerType !== "mouse") return;
      const r = e.currentTarget.getBoundingClientRect();
      mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
      my.set(((e.clientY - r.top) / r.height) * 2 - 1);
    },
    onPointerLeave: () => {
      mx.set(0);
      my.set(0);
    },
  };
  return { rotateX, rotateY, glare, sx, sy, handlers };
}

/** Entrada escalonada: cada tarjeta se levanta desde abajo, inclinada hacia atrás. */
function Rise({ index, children }: { index: number; children: ReactNode }) {
  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 70, rotateX: 16 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 1, delay: index * 0.12, ease: EASE }}
      style={{ transformPerspective: 1400 }}
    >
      {children}
    </motion.div>
  );
}

function TiltCard({
  children,
  className,
  index,
  glareColor = "rgb(255 255 255 / 0.12)",
  onMouseEnter,
  onMouseLeave,
}: {
  children: ReactNode;
  className?: string;
  index: number;
  glareColor?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const { rotateX, rotateY, glare, handlers } = useTilt();
  return (
    <Rise index={index}>
      <motion.article
        {...handlers}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{ rotateX, rotateY, transformPerspective: 1400, transformStyle: "preserve-3d" }}
        className={cn("group relative h-full overflow-hidden rounded-[var(--radius-card)]", className)}
      >
        {children}
        <motion.div
          aria-hidden
          style={{ left: glare, background: `radial-gradient(closest-side, ${glareColor}, transparent)` }}
          className="pointer-events-none absolute top-0 h-full w-2/3 -translate-x-1/2 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      </motion.article>
    </Rise>
  );
}

/* ------------------------------------------------------------------ */
/* Contador que sube al entrar en pantalla                             */
/* ------------------------------------------------------------------ */
function CountUp({ to, className }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduced = useReducedMotion();
  const [v, setV] = useState(to);
  useEffect(() => {
    if (!reduced) setV(0);
  }, [reduced]);
  useEffect(() => {
    if (!inView || reduced) return;
    const c = animate(0, to, { duration: 1.8, ease: EASE, onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, reduced, to]);
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {v}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Misión · Visión · Propósito (tarjeta petróleo)                    */
/* ------------------------------------------------------------------ */
function PillarCard({
  active,
  onPick,
  auto,
  paused,
  setPaused,
}: {
  active: number;
  onPick: (i: number) => void;
  auto: boolean;
  paused: boolean;
  setPaused: (v: boolean) => void;
}) {
  const pillar = about.pillars[active];
  const Icon = ICONS[pillar.id];
  const scrollTo = useScrollTo();
  const words = pillar.text.flatMap((seg, si) =>
    seg.t
      .split(/(\s+)/)
      .filter(Boolean)
      .map((w, wi) => ({ w, hl: !!seg.hl, key: `${si}-${wi}` })),
  );

  return (
    <TiltCard
      index={0}
      className="on-dark flex min-h-[520px] flex-col bg-petroleo p-8 text-white sm:p-10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <TopoLines opacity={0.12} seed={31} lines={18} />
      <div className="relative" style={{ transform: "translateZ(30px)" }}>
        <div role="tablist" aria-label="Misión, visión y propósito" className="glass-dark relative grid grid-cols-3 rounded-full p-1">
          {about.pillars.map((p, i) => {
            const on = i === active;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls="pilar-panel"
                onClick={() => onPick(i)}
                className="relative h-10 overflow-hidden rounded-full text-[13px] font-bold"
              >
                {on && (
                  <motion.span
                    layoutId="pillar-pill"
                    className="absolute inset-0 rounded-full bg-white"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {on && auto && (
                  <span
                    key={`${p.id}-${paused}`}
                    aria-hidden
                    className="absolute right-4 bottom-1 left-4 h-[2px] origin-left rounded-full bg-vicuna/70"
                    style={{
                      animation: paused ? "none" : `rubro-progress ${CYCLE_MS}ms linear forwards`,
                      transform: paused ? "scaleX(0)" : undefined,
                    }}
                  />
                )}
                <span className={cn("relative transition-colors duration-300", on ? "text-petroleo" : "text-niebla hover:text-white")}>
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div id="pilar-panel" role="tabpanel" aria-live="polite" className="relative mt-10 flex-1" style={{ transform: "translateZ(50px)" }}>
        <AnimatePresence mode="wait">
          <motion.div key={pillar.id} exit={{ opacity: 0, y: -12, filter: "blur(6px)" }} transition={{ duration: 0.35 }}>
            <motion.div
              initial={{ scale: 0.4, rotate: -30, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="grid h-12 w-14 place-items-center bg-white/10 text-celeste"
              style={{ clipPath: HEX_CLIP }}
            >
              <Icon className="size-6" aria-hidden />
            </motion.div>
            <p className="mt-6 text-[clamp(19px,1.55vw,23px)] leading-[1.38] font-semibold">
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                {pillar.lead}
              </motion.span>{" "}
              {words.map(({ w, hl, key }, i) =>
                /^\s+$/.test(w) ? (
                  <span key={key}>{w}</span>
                ) : (
                  <motion.span
                    key={key}
                    className={cn("inline-block", hl ? "text-celeste" : "text-white")}
                    initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.55, delay: 0.08 + i * 0.022, ease: EASE }}
                  >
                    {w}
                  </motion.span>
                ),
              )}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={() => scrollTo("especialidades")}
        style={{ transform: "translateZ(40px)" }}
        className="relative mt-8 flex h-14 items-center justify-center gap-2 rounded-full bg-white/10 text-[15px] font-bold text-white shadow-[inset_0_0_0_1px_rgb(120_176_200/0.3)] transition-colors duration-300 hover:bg-white/20"
      >
        Ver especialidades
        <ArrowRight className="size-4" aria-hidden />
      </button>
    </TiltCard>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Foto enlazada al pilar activo, con parallax y etiqueta de vidrio  */
/* ------------------------------------------------------------------ */
function ParallaxImage({ src, alt, sx, sy }: { src: string; alt: string; sx: MotionValue<number>; sy: MotionValue<number> }) {
  const x = useTransform(sx, [-1, 1], ["4%", "-4%"]);
  const y = useTransform(sy, [-1, 1], ["3%", "-3%"]);
  return (
    <motion.div style={{ x, y }} className="absolute inset-[-6%]">
      <Image src={src} alt={alt} fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
    </motion.div>
  );
}

function PhotoCard({ active }: { active: number }) {
  const pillar = about.pillars[active];
  const { rotateX, rotateY, sx, sy, handlers } = useTilt(8);
  const tagX = useTransform(sx, [-1, 1], [-14, 14]);
  const tagY = useTransform(sy, [-1, 1], [-8, 8]);
  return (
    <Rise index={1}>
      <motion.figure
        {...handlers}
        style={{ rotateX, rotateY, transformPerspective: 1400, transformStyle: "preserve-3d" }}
        className="relative m-0 h-full min-h-[520px] overflow-hidden rounded-[var(--radius-card)] bg-pizarra"
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={pillar.id}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.15, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: EASE }}
          >
            <ParallaxImage src={pillar.image} alt={pillar.alt} sx={sx} sy={sy} />
          </motion.div>
        </AnimatePresence>
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_35_48/0.25)_0%,transparent_30%,transparent_65%,rgb(0_35_48/0.55)_100%)]"
        />
        {/* Etiqueta de liquid glass que flota sobre la foto */}
        <motion.figcaption style={{ x: tagX, y: tagY }} className="absolute inset-x-0 top-7 flex justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={pillar.tag}
              initial={{ opacity: 0, y: -10, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.92 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="rounded-full border border-white/55 bg-white/15 px-7 py-3 text-[15px] font-bold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.6),0_14px_30px_-14px_rgb(0_20_28/0.6)] backdrop-blur-xl"
            >
              {pillar.tag}
            </motion.span>
          </AnimatePresence>
        </motion.figcaption>
      </motion.figure>
    </Rise>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Obras del brochure por tipo: contador + barras de hexágonos       */
/* ------------------------------------------------------------------ */
const SLOTS = 8;

function WorksCard() {
  const rows = categories
    .filter((c): c is { id: ProjectCategory; label: string } => c.id !== "todos")
    .map((c) => ({ ...c, label: c.id === "ingenieria" ? "Ingeniería" : c.label, n: projects.filter((p) => p.category === c.id).length }));
  const [hover, setHover] = useState<ProjectCategory | null>(null);

  return (
    <TiltCard
      index={2}
      glareColor="rgb(120 176 200 / 0.18)"
      className="flex min-h-[520px] flex-col bg-white p-8 shadow-[inset_0_0_0_1px_var(--color-linea),0_30px_60px_-40px_rgb(0_54_71/0.35)] sm:p-10"
    >
      <div style={{ transform: "translateZ(40px)" }}>
        <p className="display text-[clamp(64px,6vw,92px)] leading-none text-petroleo">
          <CountUp to={projects.length} />
        </p>
        <h3 className="mt-3 text-[15px] font-bold text-petroleo">Obras destacadas en el brochure</h3>
        <p className="mt-3 max-w-[38ch] text-[15px] leading-relaxed text-carbon">
          Vivienda, edificios, comercio y estudios de campo en Cajamarca, Lambayeque, La Libertad y Lima.
        </p>
      </div>
      <ul className="mt-auto space-y-3 pt-8" style={{ transform: "translateZ(30px)" }}>
        {rows.map((r, ri) => {
          const on = hover === r.id;
          return (
            <li
              key={r.id}
              onMouseEnter={() => setHover(r.id)}
              onMouseLeave={() => setHover(null)}
              className={cn(
                "grid grid-cols-[minmax(0,1fr)_auto_1.5rem] items-center gap-3 rounded-lg px-2 py-1.5 transition-colors duration-300",
                on && "bg-humo",
              )}
            >
              <span className={cn("truncate text-[14px] font-semibold transition-colors", on ? "text-vicuna" : "text-carbon")}>{r.label}</span>
              <span className="flex gap-1.5" aria-hidden>
                {Array.from({ length: SLOTS }, (_, i) => {
                  const filled = i < r.n;
                  return (
                    <motion.span
                      key={i}
                      className={cn("block h-[11px] w-[12.7px] transition-colors duration-300", filled ? (on ? "bg-celeste" : "bg-vicuna") : "bg-linea")}
                      style={{ clipPath: HEX_CLIP }}
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: on && filled ? 1.25 : 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, delay: on ? 0 : 0.5 + ri * 0.15 + i * 0.05, ease: EASE }}
                    />
                  );
                })}
              </span>
              <span className="text-right text-[14px] font-bold text-petroleo tabular-nums">{r.n}</span>
            </li>
          );
        })}
      </ul>
    </TiltCard>
  );
}

/* ------------------------------------------------------------------ */
export function About() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [paused, setPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { margin: "-20% 0px -20% 0px" });

  // Rota Misión → Visión → Propósito hasta que el usuario elija uno
  useEffect(() => {
    if (!auto || paused || !inView) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % about.pillars.length), CYCLE_MS);
    return () => window.clearTimeout(id);
  }, [active, auto, paused, inView]);

  const stats = [
    { n: specialties.length, label: "Especialidades" },
    { n: projects.length, label: "Obras destacadas" },
    { n: clients.length, label: "Clientes aliados" },
    { n: site.offices.length, label: site.offices.map((o) => o.city).join(" · "), suffix: " Sedes" },
  ];

  return (
    <section
      id="nosotros"
      ref={sectionRef}
      aria-labelledby="nosotros-title"
      className="relative overflow-hidden bg-humo pt-[clamp(40px,5vw,80px)] pb-[clamp(140px,15vw,220px)]"
    >
      <ScrollTopo color="var(--color-pizarra)" opacity={0.12} seed={23} />
      <div className="relative mx-auto max-w-[1240px] px-6 sm:px-8">
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <SectionTitle id="nosotros-title" className="text-[clamp(40px,5vw,72px)] text-petroleo">
            Nuestra razón de ser
          </SectionTitle>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE }}
            className="max-w-[58ch] text-lg text-carbon"
          >
            {about.intro}
          </motion.p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          <PillarCard
            active={active}
            onPick={(i) => {
              setAuto(false);
              setActive(i);
            }}
            auto={auto}
            paused={paused}
            setPaused={setPaused}
          />
          <PhotoCard active={active} />
          <WorksCard />
        </div>

        <dl className="mt-20 grid grid-cols-2 gap-y-12 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -10% 0px" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: EASE }}
              whileHover={{ y: -6 }}
              className="text-center"
            >
              <dt className="sr-only">{s.label}</dt>
              <dd className="display text-[clamp(52px,5.4vw,84px)] leading-none text-petroleo">
                <CountUp to={s.n} />
                {s.suffix && <span>{s.suffix}</span>}
              </dd>
              <dd className="mt-3 text-[15px] font-semibold text-pizarra">{s.label}</dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}
