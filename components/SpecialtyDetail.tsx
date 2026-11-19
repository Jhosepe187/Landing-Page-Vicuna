"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { motion, useMotionValue, useReducedMotionConfig, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { projects } from "@/content/projects";
import { specialties, type Rubro } from "@/content/site";
import { cn } from "@/lib/utils";
import { useScene } from "@/store/scene";
import { useHexNavigate } from "./RouteHex";
import { Button, DiagonalEdge, HexBullet, ScrollTopo, SectionTitle } from "./ui";

const EASE = [0.16, 1, 0.3, 1] as const;

/* Tamaño de la pieza en el hero según su forma */
const HERO_FIT: Record<Rubro, string> = {
  arquitectura: "h-[340px] sm:h-[440px] lg:h-[min(78svh,680px)] w-auto",
  ingenieria: "w-[84vw] lg:w-[min(46vw,620px)] h-auto",
  mineria: "w-[90vw] lg:w-[min(50vw,700px)] h-auto",
};

/* Entrada en cascada para tarjetas: corta (≤ 60 ms entre piezas) y una sola vez */
const reveal = (i: number) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "0px 0px -10% 0px" },
  transition: { duration: 0.6, delay: Math.min(i, 6) * 0.06, ease: EASE },
});

function HeroModel({ id }: { id: Rubro }) {
  const s = specialties.find((x) => x.id === id)!;
  const reduce = useReducedMotionConfig();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18 });
  const sy = useSpring(my, { stiffness: 120, damping: 18 });
  const x = useTransform(sx, [-1, 1], [-18, 18]);
  const y = useTransform(sy, [-1, 1], [-12, 12]);
  const rotateY = useTransform(sx, [-1, 1], [-8, 8]);
  const rotateX = useTransform(sy, [-1, 1], [5, -5]);
  const float = s.model.stance === "float" && !reduce;

  return (
    <div
      className="relative flex h-full items-center justify-center [perspective:1400px]"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
        my.set(((e.clientY - r.top) / r.height) * 2 - 1);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {/* Hexágono de marca con halo detrás de la pieza */}
      <motion.svg
        aria-hidden
        viewBox="0 0 120 104"
        className="absolute w-[min(88%,560px)] text-celeste"
        initial={reduce ? false : { opacity: 0, scale: 0.9, rotate: -8 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1.2, delay: 0.1, ease: EASE }}
      >
        <defs>
          <radialGradient id="detail-halo">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.34" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        <polygon points="30,0 90,0 120,52 90,104 30,104 0,52" fill="url(#detail-halo)" />
        <polygon
          points="30,0 90,0 120,52 90,104 30,104 0,52"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.4"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </motion.svg>

      <motion.div style={{ x, y, rotateX, rotateY }} className="relative">
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 48, scale: 0.94, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.35, ease: EASE }}
        >
          <motion.div
            animate={float ? { y: [0, -14, 0], rotate: [0, -1.5, 0] } : undefined}
            transition={float ? { duration: 5, ease: "easeInOut", repeat: Infinity, delay: 1.2 } : undefined}
          >
            <Image
              src={s.model.src}
              alt={s.model.alt}
              width={s.model.width}
              height={s.model.height}
              priority
              sizes="(max-width: 1024px) 80vw, 700px"
              className={cn("object-contain drop-shadow-[0_40px_50px_rgb(0_14_20/0.6)]", HERO_FIT[id])}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function SpecialtyDetailView({ id }: { id: Rubro }) {
  const index = specialties.findIndex((x) => x.id === id);
  const s = specialties[index];
  const router = useRouter();
  const reduce = useReducedMotionConfig();
  const hexNavigate = useHexNavigate();
  const heroRef = useRef<HTMLElement>(null);
  // Al bajar, la pieza sube, crece y se desvanece: el hero "se queda atrás" con profundidad
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const pieceY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const pieceScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const pieceOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.3]);
  const setPrefill = useScene((st) => st.setPrefill);
  const related = s.detail.projectIds.map((pid) => projects.find((p) => p.id === pid)).filter((p) => !!p);
  const others = specialties.filter((x) => x.id !== id);

  const request = () => {
    setPrefill(s.projectType);
    router.push("/#contacto");
  };

  return (
    <>
      {/* ------------------------------------------------ Hero */}
      <section ref={heroRef} className="on-dark relative isolate overflow-hidden bg-petroleo">
        <Image src={s.image} alt="" fill priority sizes="100vw" className="-z-20 object-cover opacity-35" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(105deg,rgb(0_35_48/0.97)_0%,rgb(0_54_71/0.85)_45%,rgb(0_54_71/0.55)_100%)]"
        />
        <ScrollTopo opacity={0.14} seed={index + 3} />
        <div className="relative mx-auto grid min-h-[max(100svh,760px)] max-w-[1240px] items-center gap-10 px-6 pt-32 pb-20 sm:px-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <motion.nav
              aria-label="Ruta"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="flex items-center gap-2 text-[13px] font-semibold text-niebla"
            >
              <Link href="/" className="transition-colors hover:text-white">
                Inicio
              </Link>
              <span aria-hidden>/</span>
              <Link href="/#especialidades" className="transition-colors hover:text-white">
                Especialidades
              </Link>
              <span aria-hidden>/</span>
              <span className="text-white">{s.title}</span>
            </motion.nav>
            <p className="mt-8 text-xs font-bold tracking-[0.16em] text-celeste uppercase">Rubro 0{index + 1}</p>
            <SectionTitle as="h1" className="mt-3 text-[clamp(52px,7vw,104px)] text-white">
              {s.title}
            </SectionTitle>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
              className="mt-6 max-w-[48ch] text-lg leading-relaxed text-niebla"
            >
              {s.body}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
              className="mt-9 flex flex-wrap gap-3"
            >
              <Button arrow onClick={request}>
                Solicitar propuesta
              </Button>
              <Button variant="secondary-dark" href="/#especialidades">
                Ver otros rubros
              </Button>
            </motion.div>
          </div>
          <motion.div
            style={reduce ? undefined : { y: pieceY, scale: pieceScale, opacity: pieceOpacity }}
            className="relative h-[360px] sm:h-[460px] lg:h-[640px]"
          >
            <HeroModel id={id} />
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------ Qué hacemos */}
      <section className="relative bg-humo pt-[clamp(96px,10vw,140px)] pb-[clamp(80px,9vw,120px)] text-carbon">
        <DiagonalEdge color="var(--color-petroleo)" />
        <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-vicuna uppercase">Qué hacemos</p>
              <SectionTitle className="mt-3 text-[clamp(38px,4.4vw,64px)] text-petroleo">
                Del estudio a la obra terminada
              </SectionTitle>
            </div>
            <div className="space-y-5 text-[17px] leading-relaxed text-pizarra">
              {s.detail.intro.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
          </div>

          <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {s.detail.services.map((sv, i) => (
              <motion.li
                key={sv.title}
                {...reveal(i)}
                onPointerMove={(e) => {
                  if (e.pointerType !== "mouse") return;
                  const r = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
                }}
                className="group relative flex min-h-[220px] flex-col overflow-hidden rounded-[var(--radius-card)] border border-linea bg-white p-7 transition-[border-color,box-shadow] duration-300 hover:border-celeste hover:shadow-[0_24px_48px_-28px_rgb(0_54_71/0.45)]"
              >
                {/* Brillo que sigue al cursor */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(260px_circle_at_var(--mx,50%)_var(--my,50%),rgb(120_176_200/0.24),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <span className="relative block overflow-hidden font-[family-name:var(--font-display)] text-4xl leading-none text-celeste">
                  <motion.span
                    className="block"
                    initial={{ y: "100%" }}
                    whileInView={{ y: "0%" }}
                    viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                    transition={{ duration: 0.7, delay: 0.15 + Math.min(i, 6) * 0.06, ease: EASE }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </motion.span>
                </span>
                <h3 className="relative mt-auto pt-8 text-lg font-bold text-petroleo">{sv.title}</h3>
                <p className="relative mt-2 text-[15px] leading-relaxed text-pizarra">{sv.text}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------ Proyectos del rubro */}
      <section className="relative bg-white py-[clamp(80px,9vw,120px)] text-carbon">
        <div className="mx-auto max-w-[1240px] px-6 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-vicuna uppercase">Trabajos realizados</p>
              <SectionTitle className="mt-3 text-[clamp(38px,4.4vw,64px)] text-petroleo">
                {s.detail.gallery ? "En campo" : "Proyectos del rubro"}
              </SectionTitle>
            </div>
            <Button variant="secondary" href="/#proyectos">
              Ver todo el portafolio
            </Button>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {s.detail.gallery?.map((g, i) => (
              <motion.figure
                key={g.src}
                {...reveal(i)}
                className={cn(
                  "relative overflow-hidden rounded-[var(--radius-card)] bg-petroleo",
                  i === 0 ? "aspect-[4/3] sm:col-span-2 sm:row-span-2 sm:aspect-auto" : "aspect-[4/3]",
                )}
              >
                <Image src={g.src} alt={g.alt} fill sizes="(max-width: 640px) 100vw, 40vw" className="object-cover" />
                <figcaption className="absolute inset-x-0 bottom-0 bg-[linear-gradient(transparent,rgb(0_35_48/0.85))] p-5 pt-14 text-sm font-semibold text-white">
                  {g.caption}
                </figcaption>
              </motion.figure>
            ))}
            {related.map((p, i) => (
              <motion.article
                key={p.id}
                {...reveal(i + (s.detail.gallery?.length ?? 0))}
                className="group relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-petroleo"
              >
                <Image
                  src={p.image}
                  alt={p.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(transparent,rgb(0_35_48/0.9))] p-5 pt-16 text-white">
                  <h3 className="font-bold">{p.title}</h3>
                  <p className="mt-1 text-sm text-niebla">{p.location}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Otros rubros */}
      <section className="on-dark relative overflow-hidden bg-petroleo pt-[clamp(110px,12vw,170px)] pb-[clamp(80px,9vw,120px)]">
        <DiagonalEdge color="#ffffff" flip />
        <ScrollTopo opacity={0.16} seed={index + 9} />
        <div className="relative mx-auto max-w-[1240px] px-6 sm:px-8">
          <SectionTitle className="text-[clamp(38px,4.4vw,64px)] text-white">Conoce los otros rubros</SectionTitle>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {others.map((o) => (
              <Link
                key={o.id}
                href={`/especialidades/${o.id}`}
                onClick={(e) => hexNavigate(`/especialidades/${o.id}`, e)}
                className="group relative flex h-[300px] items-end overflow-hidden rounded-[var(--radius-card)] bg-petroleo-deep p-8 transition-transform duration-200 ease-[var(--ease-out-expo)] active:scale-[0.98]"
              >
                <Image src={o.image} alt="" fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover opacity-40" />
                <div aria-hidden className="absolute inset-0 bg-[linear-gradient(110deg,rgb(0_35_48/0.95)_30%,rgb(0_54_71/0.4))]" />
                <Image
                  src={o.model.src}
                  alt=""
                  aria-hidden
                  width={o.model.width}
                  height={o.model.height}
                  sizes="320px"
                  className={cn(
                    "absolute object-contain drop-shadow-[0_24px_30px_rgb(0_14_20/0.6)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-2",
                    o.id === "arquitectura" && "right-8 bottom-0 h-[92%] w-auto",
                    o.id === "ingenieria" && "top-8 right-6 w-[44%]",
                    o.id === "mineria" && "-right-6 bottom-4 w-[52%]",
                  )}
                />
                <div className="relative max-w-[55%]">
                  <h3 className="display text-[clamp(30px,3vw,44px)] text-white">{o.title}</h3>
                  <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-bold tracking-[0.08em] text-celeste uppercase">
                    Ver rubro
                    <ArrowUpRight
                      aria-hidden
                      className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Cierre */}
          <div className="glass-dark relative mt-16 flex flex-col items-start justify-between gap-8 rounded-[var(--radius-card)] p-8 sm:p-10 md:flex-row md:items-center">
            <div>
              <h2 className="display text-[clamp(30px,3.4vw,48px)] text-white">¿Tienes un proyecto de {s.title.toLowerCase()}?</h2>
              <p className="mt-3 max-w-[52ch] text-niebla">
                Cuéntanos qué necesitas y te enviamos una propuesta técnica. Respondemos desde Cajamarca y Lima.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button arrow onClick={request}>
                Solicitar propuesta
              </Button>
              <Link
                href="/"
                className="inline-flex min-h-12 items-center gap-2 px-3 text-[13px] font-bold tracking-[0.08em] text-niebla uppercase transition-colors hover:text-white"
              >
                <ArrowLeft aria-hidden className="size-4" />
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
