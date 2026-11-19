"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useReducedMotionConfig, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { rubros, site, specialties, type Rubro } from "@/content/site";
import { cn } from "@/lib/utils";
import { useScene } from "@/store/scene";
import { useHexNavigate } from "./RouteHex";
import { Button, useScrollTo } from "./ui";
import { gsap, heroScroll, useGSAP } from "@/lib/gsap";

const CYCLE_MS = 3600;
const EASE = [0.16, 1, 0.3, 1] as const;

function RevealLine({ children, delay, ready }: { children: ReactNode; delay: number; ready: boolean }) {
  return (
    <span className="-mt-[0.16em] block overflow-hidden pt-[0.16em] pb-[0.04em]">
      <motion.span
        className="block"
        initial={{ y: "105%" }}
        animate={{ y: ready ? "0%" : "105%" }}
        transition={{ duration: 1.1, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** Rota los rubros mientras el usuario no elija uno ni esté sobre la pieza. */
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

/* ------------------------------------------------------------------ */
/* Selector de rubro (vidrio claro sobre el cielo)                     */
/* ------------------------------------------------------------------ */
function RubroSwitch() {
  const rubro = useScene((s) => s.rubro);
  const setRubro = useScene((s) => s.setRubro);
  const autoCycle = useScene((s) => s.autoCycle);
  const hover3D = useScene((s) => s.hover3D);
  const stopAutoCycle = useScene((s) => s.stopAutoCycle);
  const current = rubros.find((r) => r.id === rubro)!;
  const pick = (id: Rubro) => {
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
    <div className="w-full max-w-[400px]">
      <div
        role="radiogroup"
        aria-label="Qué rubro muestra la portada"
        onKeyDown={onKey}
        className="glass-light relative grid grid-cols-3 rounded-full p-1.5"
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
              className="relative h-11 overflow-hidden rounded-full text-[13px] font-bold tracking-[0.04em] transition-transform duration-150 ease-out active:scale-[0.97]"
            >
              {active && (
                <motion.span
                  layoutId="rubro-pill"
                  className="absolute inset-0 rounded-full bg-petroleo shadow-[0_8px_20px_-10px_rgb(0_35_48/0.7)]"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              {active && autoCycle && (
                <span
                  key={`${r.id}-${hover3D}`}
                  aria-hidden
                  className="absolute right-4 bottom-1.5 left-4 h-[2px] origin-left rounded-full bg-celeste"
                  style={{
                    animation: hover3D ? "none" : `rubro-progress ${CYCLE_MS}ms linear forwards`,
                    transform: hover3D ? "scaleX(0)" : undefined,
                  }}
                />
              )}
              <span className={cn("relative transition-colors duration-300", active ? "text-white" : "text-pizarra hover:text-petroleo")}>
                {r.label}
              </span>
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="sr-only">
        {current.label}: {current.lens}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Nubes: manchas blancas difusas que derivan despacio                 */
/* ------------------------------------------------------------------ */
type Puff = { x: number; y: number; w: number; h: number; o: number };

function CloudBank({ puffs, blur, drift, className }: { puffs: Puff[]; blur: number; drift: string; className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      <div className="cloud-drift absolute inset-[-6%]" style={{ ["--drift" as string]: drift }}>
        {puffs.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-[50%] bg-white"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.w}%`,
              height: `${p.h}%`,
              opacity: p.o,
              filter: `blur(${blur}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

const CLOUDS_BACK: Puff[] = [
  { x: 2, y: 22, w: 30, h: 12, o: 0.55 },
  { x: 20, y: 30, w: 22, h: 9, o: 0.4 },
  { x: 64, y: 18, w: 34, h: 13, o: 0.5 },
  { x: 78, y: 34, w: 20, h: 8, o: 0.35 },
  { x: 40, y: 12, w: 18, h: 7, o: 0.3 },
];

const CLOUDS_FRONT: Puff[] = [
  { x: -8, y: 78, w: 48, h: 30, o: 0.95 },
  { x: 26, y: 86, w: 52, h: 26, o: 1 },
  { x: 60, y: 76, w: 52, h: 32, o: 0.95 },
  { x: 12, y: 92, w: 80, h: 22, o: 1 },
  { x: 84, y: 88, w: 30, h: 22, o: 0.9 },
];

/* Cordillera en capas: perspectiva atmosférica (lejos = más claro) */
function Andes() {
  return (
    <svg aria-hidden viewBox="0 0 1440 400" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[46%] w-full">
      <path
        d="M0 210 L120 150 L210 190 L330 110 L430 170 L560 90 L690 160 L800 120 L930 180 L1060 100 L1180 160 L1300 120 L1440 170 L1440 400 L0 400Z"
        fill="#a9cbdc"
        opacity="0.55"
      />
      <path
        d="M0 270 L140 210 L260 250 L380 190 L520 250 L650 200 L780 260 L900 210 L1030 255 L1160 205 L1300 250 L1440 220 L1440 400 L0 400Z"
        fill="#8fb8cc"
        opacity="0.6"
      />
      <path
        d="M0 330 L170 280 L320 320 L470 270 L640 320 L800 285 L960 325 L1120 280 L1290 320 L1440 290 L1440 400 L0 400Z"
        fill="#78a6bd"
        opacity="0.55"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Pieza 3D del rubro subiendo entre las nubes                         */
/* ------------------------------------------------------------------ */
/* La pieza se superpone a la segunda línea del titular: el texto queda detrás, como en una portada */
const PIECE_FIT: Record<Rubro, { wrap: string; img: string }> = {
  // Móvil: la pieza ocupa el hueco entre titular y botones, rozando la última línea
  arquitectura: { wrap: "lg:items-end", img: "h-full w-auto lg:h-[min(70svh,720px)] lg:translate-y-[9%]" },
  ingenieria: { wrap: "lg:items-start lg:pt-[7svh]", img: "w-[84vw] h-auto lg:w-[min(88vw,640px)]" },
  mineria: { wrap: "lg:items-end", img: "w-[94vw] h-auto lg:w-[min(64vw,940px)] lg:translate-y-[11%]" },
};

function HeroPiece({ ready }: { ready: boolean }) {
  const rubro = useScene((s) => s.rubro);
  const setHover3D = useScene((s) => s.setHover3D);
  const reduce = useReducedMotionConfig();
  const navigate = useHexNavigate();
  const s = specialties.find((x) => x.id === rubro)!;
  const fit = PIECE_FIT[rubro];
  const float = s.model.stance === "float" && !reduce;
  const href = `/especialidades/${s.id}`;

  return (
    <div className={cn("pointer-events-none absolute inset-x-0 top-[43%] bottom-[25%] flex items-center justify-center lg:top-[24%] lg:bottom-0", fit.wrap)}>
      <AnimatePresence initial={false} mode="popLayout">
        {ready && (
          <motion.a
            key={rubro}
            href={href}
            onClick={(e) => navigate(href, e)}
            onPointerEnter={() => setHover3D(true)}
            onPointerLeave={() => setHover3D(false)}
            aria-label={`Ver ${s.title}`}
            className={cn("group pointer-events-auto relative block outline-none", rubro === "arquitectura" && "h-full lg:h-auto")}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 120, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={
              reduce
                ? { opacity: 0, transition: { duration: 0.2 } }
                : { opacity: 0, y: 60, filter: "blur(6px)", transition: { duration: 0.3, ease: "easeIn" } }
            }
            transition={{ duration: 1.2, ease: EASE }}
          >
            <motion.div
              className={rubro === "arquitectura" ? "h-full lg:h-auto" : undefined}
              animate={float ? { y: [0, -14, 0], rotate: [0, -1.2, 0] } : undefined}
              transition={float ? { duration: 5, ease: "easeInOut", repeat: Infinity, delay: 1.2 } : undefined}
            >
              <Image
                src={s.model.src}
                alt={s.model.alt}
                width={s.model.width}
                height={s.model.height}
                priority
                sizes="(max-width: 1024px) 90vw, 700px"
                className={cn(
                  "object-contain drop-shadow-[0_40px_50px_rgb(0_35_48/0.38)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.02]",
                  fit.img,
                )}
              />
            </motion.div>
            <span className="pointer-events-none absolute top-[18%] left-1/2 hidden -translate-x-1/2 translate-y-2 rounded-full bg-petroleo px-4 py-2 text-[11px] font-bold tracking-[0.08em] whitespace-nowrap text-white uppercase opacity-0 shadow-lg transition-[opacity,transform] duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 lg:block">
              Ver {s.title} →
            </span>
          </motion.a>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const switchRef = useRef<HTMLDivElement>(null);
  const pieceRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const phase = useScene((s) => s.phase);
  const setSceneReady = useScene((s) => s.setSceneReady);
  const scrollTo = useScrollTo();
  const ready = phase !== "loading";
  useAutoCycle();
  useEffect(() => setSceneReady(), [setSceneReady]);

  // Paralaje suave del cursor sobre todo el hero (capas a distinta profundidad)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 20 });
  const sy = useSpring(my, { stiffness: 80, damping: 20 });
  const backX = useTransform(sx, [-1, 1], [12, -12]);
  const pieceX = useTransform(sx, [-1, 1], [-22, 22]);
  const pieceY = useTransform(sy, [-1, 1], [-10, 10]);
  const frontX = useTransform(sx, [-1, 1], [-36, 36]);
  // El titular se mueve en sentido contrario a la pieza: refuerza que está detrás
  const titleX = useTransform(sx, [-1, 1], [8, -8]);
  const rubro = useScene((s) => s.rubro);
  const current = specialties.find((x) => x.id === rubro)!;
  const currentIndex = specialties.findIndex((x) => x.id === rubro);

  // Escritorio: el hero se fija y el scroll cuenta la escena:
  // el titular se va, la pieza crece entre las nubes y aparece VICUNA con la obra dentro de las letras.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        gsap.set(brandRef.current, { autoAlpha: 0, scale: 0.82 });
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: "+=140%",
            pin: true,
            anticipatePin: 1,
            scrub: 0.8,
            onUpdate: (self) => {
              heroScroll.p = self.progress;
            },
            onLeaveBack: () => {
              heroScroll.p = 0;
            },
          },
        });
        tl.to(titleRef.current, { yPercent: -18, autoAlpha: 0, duration: 0.3 }, 0)
          .to(copyRef.current, { autoAlpha: 0, y: 20, duration: 0.2 }, 0)
          .to(switchRef.current, { autoAlpha: 0, y: 20, duration: 0.2 }, 0)
          .to(backRef.current, { yPercent: 6, duration: 1 }, 0)
          .to(pieceRef.current, { scale: 1.3, yPercent: -14, duration: 0.6 }, 0)
          .to(frontRef.current, { yPercent: -16, duration: 0.65 }, 0.05)
          .to(pieceRef.current, { autoAlpha: 0, duration: 0.18 }, 0.3)
          .to(brandRef.current, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "power2.out" }, 0.44)
          .to({}, { duration: 0.25 });
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
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        mx.set((e.clientX / window.innerWidth) * 2 - 1);
        my.set((e.clientY / window.innerHeight) * 2 - 1);
      }}
      className="relative isolate h-[100svh] min-h-[640px] overflow-hidden bg-[linear-gradient(180deg,#6fa9c9_0%,#a8cfe2_38%,#d9eaf2_68%,#f8f8f8_100%)] text-petroleo"
    >
      {/* Cielo + cordillera (capa lejana) */}
      <motion.div style={{ x: backX }} className="absolute inset-[-4%_-4%_0_-4%]">
        <div ref={backRef} className="absolute inset-0">
          <CloudBank puffs={CLOUDS_BACK} blur={28} drift="46s" />
          <Andes />
        </div>
      </motion.div>

      {/* Titular: gran escala, detrás de la pieza */}
      <div ref={titleRef} className="absolute inset-x-0 top-[clamp(108px,16svh,170px)] z-[4]">
      <motion.div style={{ x: titleX }} className="flex flex-col items-center px-5 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
          className="mb-5 flex items-center gap-3 text-[11px] font-bold tracking-[0.32em] text-pizarra uppercase"
        >
          <span aria-hidden className="h-px w-8 bg-pizarra/50" />
          {site.descriptor}
          <span aria-hidden className="h-px w-8 bg-pizarra/50" />
        </motion.p>
        <h1 id="hero-title" className="display text-[clamp(46px,8.4vw,152px)] leading-[0.86] tracking-[-0.005em] text-petroleo">
          <RevealLine ready={ready} delay={0.05}>
            Construyendo sueños,
          </RevealLine>
          <RevealLine ready={ready} delay={0.14}>
            transformando realidades
          </RevealLine>
        </h1>
      </motion.div>
      </div>

      {/* Pieza 3D (capa media) */}
      <motion.div style={{ x: pieceX, y: pieceY }} className="pointer-events-none absolute inset-0 z-[5]">
        <div ref={pieceRef} className="absolute inset-0 origin-bottom will-change-transform">
          <HeroPiece ready={ready} />
        </div>
      </motion.div>

      {/* Logo gigante con la obra dentro de las letras (aparece al hacer scroll, solo escritorio) */}
      <div
        ref={brandRef}
        aria-hidden
        className="pointer-events-none invisible absolute inset-0 z-[8] hidden flex-col items-center justify-center lg:flex"
      >
        <span
          className="photo-text display block pt-[0.12em] text-[clamp(160px,23vw,380px)] leading-[0.92] [mask-image:linear-gradient(180deg,#000_62%,transparent_100%)]"
          style={{ backgroundImage: "url(/media/projects/edificio-pimentel-chiclayo.jpg)" }}
        >
          Vicuna
        </span>
        <span className="mt-6 text-sm font-bold tracking-[0.5em] text-petroleo uppercase">Ingenieros &amp; Arquitectos</span>
      </div>

      {/* Nubes delanteras: la pieza emerge entre ellas */}
      <motion.div style={{ x: frontX }} className="pointer-events-none absolute inset-0 z-[7]">
        <div ref={frontRef} className="absolute inset-x-0 top-0 h-[170%]">
          <div className="absolute inset-x-0 top-0 h-[58.8%]">
            <CloudBank puffs={CLOUDS_FRONT} blur={26} drift="34s" />
          </div>
          <div aria-hidden className="absolute inset-x-0 top-[45%] bottom-0 bg-[linear-gradient(180deg,transparent_0%,rgb(248_248_248/0.85)_9%,#f8f8f8_16%)]" />
        </div>
      </motion.div>

      {/* Pie del hero: texto y acciones a la izquierda, rubro a la derecha (sobre la niebla) */}
      <div className="absolute inset-x-0 bottom-[max(22px,env(safe-area-inset-bottom))] z-20 mx-auto flex max-w-[1240px] flex-col items-center gap-5 px-6 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
        <div ref={copyRef}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
          className="flex flex-col items-center lg:items-start"
        >
          <p className="sr-only">
            Del levantamiento topográfico a la obra terminada, con un solo equipo en{" "}
            {site.offices.map((o) => o.city).join(" y ")}.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button arrow onClick={() => scrollTo("contacto")}>
              Solicitar propuesta
            </Button>
            <Button variant="secondary" className="hidden sm:inline-flex" onClick={() => scrollTo("proyectos")}>
              Ver proyectos
            </Button>
          </div>
        </motion.div>
        </div>

        <div ref={switchRef} className="flex w-full justify-center lg:w-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.55, ease: EASE }}
          className="flex w-full max-w-[400px] flex-col items-center gap-3 lg:items-end"
        >
          {/* Rótulo editorial del rubro visible */}
          <div className="relative hidden h-5 w-full overflow-hidden lg:block">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.p
                key={rubro}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-100%", opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }}
                transition={{ duration: 0.5, ease: EASE }}
                className="absolute inset-0 text-right text-[12px] font-bold tracking-[0.18em] text-petroleo uppercase"
              >
                <span className="text-vicuna">0{currentIndex + 1}</span> — {current.title}
              </motion.p>
            </AnimatePresence>
          </div>
          <RubroSwitch />
        </motion.div>
        </div>
      </div>
    </section>
  );
}
