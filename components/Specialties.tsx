"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useState } from "react";
import { specialties, type Rubro } from "@/content/site";
import { cn, HEX_CLIP } from "@/lib/utils";
import { useScene } from "@/store/scene";
import { Button, DiagonalEdge, HexBullet, ScrollTopo, SectionTitle, useScrollTo } from "./ui";

type S = (typeof specialties)[number];

function useRequest() {
  const setPrefill = useScene((s) => s.setPrefill);
  const scrollTo = useScrollTo();
  return (s: S) => {
    setPrefill(s.projectType);
    scrollTo("contacto");
  };
}

function Scope({ s }: { s: S }) {
  return (
    <ul className="glass-dark relative grid gap-2.5 rounded-[var(--radius-card)] p-5 text-[15px] text-white sm:grid-cols-2">
      {s.scope.map((item) => (
        <li key={item} className="flex gap-3">
          <HexBullet className="text-celeste" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Panel({ s, active, onActivate }: { s: S; active: boolean; onActivate: () => void }) {
  const request = useRequest();
  // Inclinación 3D siguiendo el cursor (con resorte, vuelve a plano al salir)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 150, damping: 18 });
  const sy = useSpring(my, { stiffness: 150, damping: 18 });
  const rotateY = useTransform(sx, [-1, 1], [-7, 7]);
  const rotateX = useTransform(sy, [-1, 1], [6, -6]);
  const glareX = useTransform(sx, [-1, 1], ["20%", "80%"]);
  return (
    <motion.article
      tabIndex={0}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
        my.set(((e.clientY - r.top) / r.height) * 2 - 1);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onClick={onActivate}
      aria-label={s.title}
      aria-current={active ? "true" : undefined}
      style={{ flexBasis: 0, rotateX, rotateY, transformPerspective: 1400, transformStyle: "preserve-3d" }}
      className={cn(
        "group relative min-w-0 overflow-hidden rounded-[var(--radius-card)] bg-petroleo-deep transition-[flex-grow] duration-[900ms] ease-[var(--ease-out-expo)]",
        active ? "grow-[5]" : "grow cursor-pointer",
      )}
    >
      <Image
        src={s.image}
        alt={s.alt}
        fill
        sizes="(max-width: 1240px) 64vw, 760px"
        className={cn(
          "object-cover transition-[transform,opacity] duration-[1200ms] ease-[var(--ease-out-expo)]",
          active ? "scale-100 opacity-100" : "scale-110 opacity-90",
        )}
      />
      {/* Velo diagonal petróleo de la guía (≈85 % → 0 %), solo en el panel abierto */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-[linear-gradient(115deg,rgb(0_54_71/0.92)_0%,rgb(0_54_71/0.7)_50%,rgb(0_54_71/0.45)_100%)] transition-opacity duration-700",
          active ? "opacity-100" : "opacity-0",
        )}
      />
      {/* Colapsado: la foto se ve; solo un degradado inferior para el título vertical */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 bg-[linear-gradient(180deg,rgb(0_54_71/0.25)_0%,rgb(0_35_48/0.2)_45%,rgb(0_35_48/0.85)_100%)] transition-opacity duration-500",
          active ? "opacity-0" : "opacity-100",
        )}
      />

      {/* Al activarse, la foto se revela a través del hexágono de marca */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="hex-reveal"
            aria-hidden
            className="absolute inset-0"
            initial={{ clipPath: "polygon(74% 37%, 78% 37%, 80% 41%, 78% 45%, 74% 45%, 72% 41%)" }}
            animate={{ clipPath: "polygon(65.5% 20.4%, 86.5% 20.4%, 97% 41%, 86.5% 61.6%, 65.5% 61.6%, 55% 41%)" }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image src={s.image} alt="" fill sizes="(max-width: 1240px) 64vw, 760px" className="object-cover" />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Estado colapsado: miniatura hexagonal + título vertical */}
      <div
        aria-hidden={active}
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-between py-8 transition-opacity duration-500",
          active ? "pointer-events-none opacity-0" : "opacity-100 delay-200",
        )}
      >
        <div className="relative aspect-[1.155/1] w-[72px]" style={{ clipPath: HEX_CLIP }}>
          <Image src={s.image} alt="" fill sizes="80px" className="object-cover" />
        </div>
        <h3 className="display rotate-180 text-[34px] whitespace-nowrap text-white [writing-mode:vertical-rl]">{s.title}</h3>
      </div>

      {/* Estado expandido */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{ transform: "translateZ(50px)" }}
            className="absolute inset-0 flex w-[min(100%,720px)] flex-col justify-end p-10"
          >
            <h3 className="display text-[clamp(36px,3.6vw,56px)] text-white">{s.title}</h3>
            <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-niebla">{s.body}</p>
            <div className="mt-6 max-w-[460px]">
              <Scope s={s} />
            </div>
            <div className="mt-6">
              <Button
                arrow
                onClick={(e) => {
                  e.stopPropagation();
                  request(s);
                }}
              >
                Solicitar propuesta
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        aria-hidden
        style={{ left: glareX }}
        className="pointer-events-none absolute top-0 h-full w-1/2 -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(255_255_255/0.14),transparent)] mix-blend-screen"
      />
    </motion.article>
  );
}

function MobileCard({ s }: { s: S }) {
  const request = useRequest();
  return (
    <article className="overflow-hidden rounded-[var(--radius-card)] bg-petroleo-deep">
      <div className="relative h-56">
        <Image src={s.image} alt={s.alt} fill sizes="100vw" className="object-cover" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(0_54_71/0)_30%,rgb(0_35_48/0.95)_100%)]" />
        <h3 className="display absolute bottom-4 left-5 text-4xl text-white">{s.title}</h3>
      </div>
      <div className="space-y-5 p-5">
        <p className="text-niebla">{s.body}</p>
        <Scope s={s} />
        <Button arrow className="w-full" onClick={() => request(s)}>
          Solicitar propuesta
        </Button>
      </div>
    </article>
  );
}

export function Specialties() {
  const [active, setActive] = useState<Rubro>("arquitectura");
  return (
    <section
      id="especialidades"
      aria-labelledby="especialidades-title"
      className="on-dark relative overflow-hidden bg-petroleo pt-[clamp(128px,14vw,200px)] pb-[clamp(96px,10vw,140px)]"
    >
      <DiagonalEdge color="var(--color-humo)" flip />
      <ScrollTopo opacity={0.18} seed={8} />
      <div className="relative mx-auto max-w-[1240px] px-6 sm:px-8">
        <SectionTitle id="especialidades-title" className="max-w-[16ch] text-[clamp(40px,5vw,72px)] text-white">
          Tres especialidades, un solo equipo
        </SectionTitle>
        <p className="mt-5 max-w-[62ch] text-lg text-niebla">
          Somos consultora y ejecutora: brindamos servicios integrales, desde estudios y expedientes técnicos hasta la
          supervisión y ejecución de proyectos, con calidad, cumplimiento normativo y eficiencia.
        </p>

        <div className="mt-14 hidden h-[clamp(560px,48vw,660px)] gap-3 [perspective:1600px] md:flex">
          {specialties.map((s) => (
            <Panel key={s.id} s={s} active={active === s.id} onActivate={() => setActive(s.id)} />
          ))}
        </div>
        <div className="mt-12 grid gap-6 md:hidden">
          {specialties.map((s) => (
            <MobileCard key={s.id} s={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
