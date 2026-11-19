"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { rubros, site } from "@/content/site";
import { cn, HEX_CLIP } from "@/lib/utils";
import { useScene } from "@/store/scene";
import { Button, TopoLines, useScrollTo } from "./ui";
import { gsap, heroScroll, useGSAP } from "@/lib/gsap";

const CYCLE_MS = 3000;

function RevealLine({ children, delay, ready }: { children: ReactNode; delay: number; ready: boolean }) {
  return (
    <span className="-mt-[0.16em] block overflow-hidden pt-[0.16em] pb-[0.04em]">
      <motion.span
        className="block"
        initial={{ y: "105%" }}
        animate={{ y: ready ? "0%" : "105%" }}
        transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** Rota los rubros cada 3 s mientras el usuario no elija uno ni esté mirando la pieza. */
function useAutoCycle() {
  useEffect(() => {
    const id = window.setInterval(() => {
      const { autoCycle, hover3D, heroInView, rubro, setRubro, phase } = useScene.getState();
      if (!autoCycle || hover3D || !heroInView || phase === "loading") return;
      const i = rubros.findIndex((r) => r.id === rubro);
      setRubro(rubros[(i + 1) % rubros.length].id);
    }, CYCLE_MS);
    return () => window.clearInterval(id);
  }, []);
}

function RubroSwitch() {
  const rubro = useScene((s) => s.rubro);
  const setRubro = useScene((s) => s.setRubro);
  const autoCycle = useScene((s) => s.autoCycle);
  const hover3D = useScene((s) => s.hover3D);
  const stopAutoCycle = useScene((s) => s.stopAutoCycle);
  const current = rubros.find((r) => r.id === rubro)!;
  const pick = (id: (typeof rubros)[number]["id"]) => {
    stopAutoCycle();
    setRubro(id);
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowRight", "ArrowLeft"].includes(e.key)) return;
    e.preventDefault();
    const i = rubros.findIndex((r) => r.id === rubro);
    const next = rubros[(i + (e.key === "ArrowRight" ? 1 : rubros.length - 1)) % rubros.length];
    pick(next.id);
    (e.currentTarget.querySelector(`[data-rubro="${next.id}"]`) as HTMLButtonElement | null)?.focus();
  };

  return (
    <div className="w-full max-w-[420px]">
      <div
        role="radiogroup"
        aria-label="Qué muestra la pieza 3D"
        onKeyDown={onKey}
        className="glass-dark relative grid grid-cols-3 rounded-full p-1.5"
      >
        {rubros.map((r) => {
          const active = r.id === rubro;
          return (
            <button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={active ? 0 : -1}
              data-rubro={r.id}
              onClick={() => pick(r.id)}
              className="relative h-11 overflow-hidden rounded-full text-[13px] font-bold tracking-[0.04em]"
            >
              {active && (
                <motion.span
                  layoutId="rubro-pill"
                  className="absolute inset-0 rounded-full bg-white shadow-[0_8px_20px_-10px_rgb(0_0_0/0.6)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              {/* Barra de progreso del cambio automático */}
              {active && autoCycle && (
                <span
                  key={`${r.id}-${hover3D}`}
                  aria-hidden
                  className="absolute right-4 bottom-1.5 left-4 h-[2px] origin-left rounded-full bg-vicuna/70"
                  style={{
                    animation: hover3D ? "none" : `rubro-progress ${CYCLE_MS}ms linear forwards`,
                    transform: hover3D ? "scaleX(0)" : undefined,
                  }}
                />
              )}
              <span className={cn("relative transition-colors duration-300", active ? "text-petroleo" : "text-niebla hover:text-white")}>
                {r.label}
              </span>
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="glass-dark relative mt-3 rounded-2xl px-4 py-2.5 text-sm text-niebla">
        <span className="hidden pointer-fine:inline">Mueve el cursor sobre la imagen. </span>
        <span className="font-semibold text-white">{current.lens}</span>
      </p>
    </div>
  );
}

const RUBRO_IMAGES: Record<(typeof rubros)[number]["id"], { src: string; alt: string; pos: string }> = {
  arquitectura: { src: "/media/projects/casa-campo-la-molina.jpg", alt: "Casa de campo en La Molina, proyecto de Vicuña", pos: "50% 55%" },
  ingenieria: { src: "/media/field/topografia-gnss-andes.jpg", alt: "Equipo de Vicuña con GNSS en los Andes", pos: "50% 45%" },
  mineria: { src: "/media/field/mineria-supervision.jpg", alt: "Supervisor de Vicuña frente a una operación minera", pos: "50% 30%" },
};

/** Foto del rubro con profundidad: se inclina en 3D y hace parallax siguiendo el cursor. */
function HeroVisual({ visualRef }: { visualRef: React.RefObject<HTMLDivElement | null> }) {
  const rubro = useScene((s) => s.rubro);
  const setHover3D = useScene((s) => s.setHover3D);
  const setSceneReady = useScene((s) => s.setSceneReady);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18 });
  const sy = useSpring(my, { stiffness: 120, damping: 18 });
  const rotateY = useTransform(sx, [-1, 1], [-9, 9]);
  const rotateX = useTransform(sy, [-1, 1], [7, -7]);
  const imgX = useTransform(sx, [-1, 1], ["3%", "-3%"]);
  const imgY = useTransform(sy, [-1, 1], ["2.5%", "-2.5%"]);
  const ringX = useTransform(sx, [-1, 1], [-26, 26]);
  const ringY = useTransform(sy, [-1, 1], [-18, 18]);
  const img = RUBRO_IMAGES[rubro];
  useEffect(() => setSceneReady(), [setSceneReady]);

  return (
    <div
      ref={visualRef}
      className="absolute inset-x-0 top-0 h-[58svh] [perspective:1400px] lg:inset-y-0 lg:right-0 lg:left-auto lg:h-auto lg:w-[60%]"
      onPointerEnter={() => setHover3D(true)}
      onPointerLeave={() => {
        setHover3D(false);
        mx.set(0);
        my.set(0);
      }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
        my.set(((e.clientY - r.top) / r.height) * 2 - 1);
      }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="absolute inset-0 [mask-image:linear-gradient(180deg,#000_55%,transparent_100%)] lg:[mask-image:linear-gradient(90deg,transparent_0%,#000_38%,#000_88%,transparent_100%)]"
      >
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={rubro}
            className="absolute inset-[-6%]"
            initial={{ opacity: 0, scale: 1.12, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1.02, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div style={{ x: imgX, y: imgY }} className="absolute inset-0">
              <Image src={img.src} alt={img.alt} fill priority sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" style={{ objectPosition: img.pos }} />
            </motion.div>
          </motion.div>
        </AnimatePresence>
        {/* Velo petróleo y luz de borde: integran la foto con el sitio */}
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(200deg,rgb(0_54_71/0.05)_20%,rgb(0_54_71/0.55)_100%)]" />
      </motion.div>
      {/* Hexágono de vidrio flotando delante de la foto (capa más cercana = más parallax) */}
      <motion.div
        aria-hidden
        style={{ x: ringX, y: ringY }}
        className="pointer-events-none absolute top-[14%] right-[8%] hidden aspect-[1.155/1] w-[clamp(120px,14vw,220px)] lg:block"
      >
        <div className="glass-dark absolute inset-0 !rounded-none" style={{ clipPath: HEX_CLIP }} />
      </motion.div>
    </div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const phase = useScene((s) => s.phase);
  const scrollTo = useScrollTo();
  const ready = phase !== "loading";
  useAutoCycle();

  // Escritorio: la sección se fija un tramo; el texto se retira y la cámara se acerca a la pieza.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 1024px)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: "+=70%",
            pin: true,
            anticipatePin: 1,
            scrub: 0.6,
            onUpdate: (self) => {
              heroScroll.p = self.progress;
            },
            onLeaveBack: () => {
              heroScroll.p = 0;
            },
          },
        });
        tl.to(copyRef.current, { yPercent: -10, opacity: 0, duration: 0.6 }, 0)
          .to(visualRef.current, { scale: 1.12, yPercent: -4, duration: 1 }, 0);
      });
      return () => {
        heroScroll.p = 0;
        mm.revert();
      };
    },
    { scope: ref },
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => useScene.getState().setHeroInView(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="inicio"
      ref={ref}
      aria-labelledby="hero-title"
      className="on-dark relative isolate overflow-hidden bg-petroleo lg:h-[100svh] lg:min-h-[680px]"
    >
      <TopoLines lines={30} opacity={0.22} seed={3} />
      <HeroVisual visualRef={visualRef} />
      {/* Velo petróleo para el texto: inferior en móvil, lateral en escritorio */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgb(0_35_48/0.9)_52%)] lg:bg-[linear-gradient(90deg,rgb(0_35_48/0.9)_0%,rgb(0_35_48/0.6)_34%,transparent_55%)]"
      />

      <div className="pointer-events-none relative z-10 mx-auto grid max-w-[1240px] px-6 pt-[54svh] pb-14 sm:px-8 lg:h-full lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:pt-20 lg:pb-12">
        <div ref={copyRef} className="pointer-events-auto will-change-transform">
          <h1 id="hero-title" className="display text-[clamp(46px,5.3vw,84px)] leading-[0.92] text-white">
            <RevealLine ready={ready} delay={0.05}>
              Construyendo sueños,
            </RevealLine>
            <RevealLine ready={ready} delay={0.14}>
              transformando realidades
            </RevealLine>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-[46ch] text-base text-niebla sm:text-lg"
          >
            Ingeniería, arquitectura y minería: del levantamiento topográfico a la obra terminada, con un solo equipo
            en {site.offices.map((o) => o.city).join(" y ")}.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button arrow onClick={() => scrollTo("contacto")}>
              Solicitar propuesta
            </Button>
            <Button variant="secondary-dark" onClick={() => scrollTo("proyectos")}>
              Ver proyectos
            </Button>
          </motion.div>
        </div>
        <motion.div
          className="pointer-events-auto mt-10 lg:mt-0 lg:flex lg:h-full lg:items-end lg:justify-center lg:pb-4"
          initial={{ opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <RubroSwitch />
        </motion.div>
      </div>
    </section>
  );
}
