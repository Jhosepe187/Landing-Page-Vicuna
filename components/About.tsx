"use client";

import { Eye, HeartHandshake, Target } from "lucide-react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { about, clients, site, specialties, type PillarId } from "@/content/site";
import { projects } from "@/content/projects";
import { cn, HEX_CLIP } from "@/lib/utils";
import { ScrollTopo, SectionTitle, TopoLines } from "./ui";

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
  const [v, setV] = useState(to);
  useEffect(() => {
    setV(0);
  }, []);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.8, ease: EASE, onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, to]);
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {v}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Misión · Visión · Propósito: tres tarjetas en fila, colores alternos */
/* ------------------------------------------------------------------ */
type Tone = "dark" | "light";

function PillarCard({
  index,
  tone,
  active,
  auto,
  paused,
  onActivate,
}: {
  index: number;
  tone: Tone;
  active: boolean;
  auto: boolean;
  paused: boolean;
  onActivate: () => void;
}) {
  const pillar = about.pillars[index];
  const Icon = ICONS[pillar.id];
  const dark = tone === "dark";
  const words = pillar.text.flatMap((seg, si) =>
    seg.t
      .split(/(\s+)/)
      .filter(Boolean)
      .map((w, wi) => ({ w, hl: !!seg.hl, key: `${si}-${wi}` })),
  );
  const base = 0.35 + index * 0.15;

  return (
    <TiltCard
      index={index}
      glareColor={dark ? "rgb(255 255 255 / 0.12)" : "rgb(120 176 200 / 0.18)"}
      onMouseEnter={onActivate}
      className={cn(
        "flex flex-col p-8 lg:min-h-[460px] transition-shadow duration-500 sm:p-10",
        dark
          ? "on-dark bg-petroleo text-white"
          : "bg-white text-petroleo shadow-[inset_0_0_0_1px_var(--color-linea),0_30px_60px_-40px_rgb(0_54_71/0.35)]",
        active && (dark ? "shadow-[0_40px_80px_-40px_rgb(0_54_71/0.75)]" : "shadow-[inset_0_0_0_1px_var(--color-celeste),0_40px_80px_-40px_rgb(0_54_71/0.45)]"),
      )}
    >
      <TopoLines opacity={dark ? 0.12 : 0.1} seed={31 + index * 7} lines={18} color={dark ? undefined : "var(--color-pizarra)"} />

      <motion.div
        className="relative flex flex-1 flex-col"
        animate={{ y: active ? -6 : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{ z: 50 }}
      >
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ scale: 0.4, rotate: -30, opacity: 0 }}
            whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: base }}
            className={cn("grid h-12 w-14 place-items-center", dark ? "bg-white/10 text-celeste" : "bg-vicuna/10 text-vicuna")}
            style={{ clipPath: HEX_CLIP }}
          >
            <Icon className="size-6" aria-hidden />
          </motion.div>
          <span aria-hidden className={cn("display text-[15px] tracking-[0.2em]", dark ? "text-white/35" : "text-pizarra/45")}>
            0{index + 1}
          </span>
        </div>

        <h3 className={cn("display mt-8 text-[clamp(36px,3.2vw,48px)] leading-none", dark ? "text-white" : "text-petroleo")}>
          {pillar.label}
        </h3>

        <p className="mt-5 text-[clamp(17px,1.35vw,20px)] leading-[1.45] font-semibold">
          {words.map(({ w, hl, key }, i) =>
            /^\s+$/.test(w) ? (
              <span key={key}>{w}</span>
            ) : (
              <motion.span
                key={key}
                className={cn("inline-block", hl ? (dark ? "text-celeste" : "text-vicuna") : dark ? "text-white" : "text-petroleo")}
                initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: base + 0.1 + i * 0.022, ease: EASE }}
              >
                {w}
              </motion.span>
            ),
          )}
        </p>
      </motion.div>

      {/* Progreso de la rotación automática: indica qué pilar está destacado */}
      <div aria-hidden className={cn("relative mt-8 h-[3px] overflow-hidden rounded-full", dark ? "bg-white/10" : "bg-linea")}>
        {active && (
          <span
            key={`${pillar.id}-${paused}-${auto}`}
            className={cn("absolute inset-0 origin-left rounded-full", dark ? "bg-celeste" : "bg-vicuna")}
            style={{
              animation: auto && !paused ? `rubro-progress ${CYCLE_MS}ms linear forwards` : "none",
              transform: auto && !paused ? undefined : "scaleX(1)",
            }}
          />
        )}
      </div>
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
    { n: projects.length, label: "Obras destacadas", suffix: "+" },
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

        <div
          className="mt-14 grid gap-6 lg:grid-cols-3"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {about.pillars.map((p, i) => (
            <PillarCard
              key={p.id}
              index={i}
              tone={i % 2 === 0 ? "dark" : "light"}
              active={i === active}
              auto={auto}
              paused={paused}
              onActivate={() => {
                setAuto(false);
                setActive(i);
              }}
            />
          ))}
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
