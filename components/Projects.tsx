"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  AnimatePresence,
  LayoutGroup,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { categories, categoryLabel, projects, type Project, type ProjectCategory } from "@/content/projects";
import { clamp, cn, HEX_CLIP_FULL } from "@/lib/utils";
import { useScene } from "@/store/scene";
import { Button, DiagonalEdge, ScrollTopo, SectionTitle, useScrollTo } from "./ui";

const CARD_W = "clamp(250px,25vw,370px)";

function Card({
  project,
  index,
  total,
  progress,
  step,
  onSelect,
}: {
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
  step: number;
  onSelect: () => void;
}) {
  const o = useTransform(progress, (p) => index - p);
  const x = useTransform(o, (v) => {
    const a = Math.abs(v);
    return Math.sign(v) * (a < 1 ? a : 1 + (a - 1) * 0.7) * step;
  });
  const rotateY = useTransform(o, (v) => clamp(-v * 24, -50, 50));
  const scale = useTransform(o, (v) => 1 - Math.min(Math.abs(v), 3) * 0.085);
  const opacity = useTransform(o, (v) => clamp(1 - (Math.abs(v) - 2.2) * 0.9, 0, 1));
  const zIndex = useTransform(o, (v) => 100 - Math.round(Math.abs(v) * 10));
  const filter = useTransform(o, (v) => `brightness(${1 - Math.min(Math.abs(v), 2) * 0.16})`);
  const visibility = useTransform(o, (v) => (Math.abs(v) > 3.2 ? "hidden" : "visible"));

  return (
    <motion.article
      style={{ x, rotateY, scale, opacity, zIndex, filter, visibility, width: CARD_W, left: `calc(50% - ${CARD_W} / 2)` }}
      className="absolute top-0 h-full [transform-style:preserve-3d]"
      aria-roledescription="diapositiva"
      aria-label={`${index + 1} de ${total}: ${project.title}`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="group relative block h-full w-full overflow-hidden rounded-[var(--radius-card)] bg-pizarra text-left shadow-[0_30px_60px_-30px_rgb(0_35_48/0.55)]"
      >
        <motion.div layoutId={`media-${project.id}`} className="absolute inset-0 overflow-hidden rounded-[var(--radius-card)]">
          <Image
            src={project.image}
            alt={project.alt}
            fill
            draggable={false}
            sizes="(max-width: 768px) 80vw, 460px"
            className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
          />
        </motion.div>
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(180deg,transparent,rgb(0_35_48/0.55))]" />
        {/* Panel de liquid glass dentro de la tarjeta */}
        <div className="glass-dark absolute inset-x-3 bottom-3 rounded-[14px] p-4 text-white">
          <h3 className="text-[17px] leading-snug font-bold">{project.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-niebla">{project.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white">{project.location}</span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white">
              {categoryLabel[project.category].split(" · ")[1]}
            </span>
          </div>
          <span className="mt-3 flex h-10 items-center justify-center rounded-full bg-white text-[13px] font-bold text-petroleo transition-colors duration-300 group-hover:bg-celeste">
            Explorar
          </span>
        </div>
      </button>
    </motion.article>
  );
}

function Carousel({
  items,
  startIndex,
  onIndex,
  onOpen,
}: {
  items: Project[];
  startIndex: number;
  onIndex: (i: number) => void;
  onOpen: (id: string) => void;
}) {
  const n = items.length;
  const progress = useMotionValue(startIndex);
  const [active, setActive] = useState(startIndex);
  const stageRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(340);
  const drag = useRef({ start: 0, moved: false });

  // Cursor hexagonal "Arrastra" (solo puntero fino)
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);
  const sx = useSpring(cx, { stiffness: 500, damping: 40 });
  const sy = useSpring(cy, { stiffness: 500, damping: 40 });
  const [cursor, setCursor] = useState(false);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setStep(clamp(el.clientWidth * 0.235, 175, 330)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useMotionValueEvent(progress, "change", (v) => {
    const i = clamp(Math.round(v), 0, n - 1);
    setActive(i);
    onIndex(i);
  });

  const goTo = (i: number) =>
    animate(progress, clamp(i, 0, n - 1), { type: "spring", stiffness: 210, damping: 30, restDelta: 0.001 });

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(active + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(active - 1);
    } else if (e.key === "Enter" && e.target === e.currentTarget) {
      onOpen(items[active].id);
    }
  };

  return (
    <div className="relative mt-14" role="region" aria-roledescription="carrusel" aria-label="Proyectos destacados">
      <motion.div
        ref={stageRef}
        tabIndex={0}
        onKeyDown={onKey}
        aria-describedby="carrusel-ayuda"
        className="relative h-[clamp(440px,40vw,560px)] touch-pan-y select-none [perspective:1600px] focus-visible:outline-offset-8 pointer-fine:cursor-none"
        onPanStart={() => {
          drag.current.start = progress.get();
          drag.current.moved = false;
        }}
        onPan={(_, info) => {
          if (Math.abs(info.offset.x) > 6) drag.current.moved = true;
          progress.set(clamp(drag.current.start - info.offset.x / step, -0.35, n - 1 + 0.35));
        }}
        onPanEnd={(_, info) => goTo(Math.round(progress.get() - (info.velocity.x / step) * 0.2))}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          cx.set(e.clientX - r.left);
          cy.set(e.clientY - r.top);
          setCursor(true);
        }}
        onPointerLeave={() => setCursor(false)}
      >
        {items.map((p, i) => (
          <Card
            key={p.id}
            project={p}
            index={i}
            total={n}
            progress={progress}
            step={step}
            onSelect={() => {
              if (drag.current.moved) return;
              if (i === active) onOpen(p.id);
              else goTo(i);
            }}
          />
        ))}
        <motion.div
          aria-hidden
          style={{ x: sx, y: sy }}
          animate={{ scale: cursor ? 1 : 0, opacity: cursor ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute top-0 left-0 z-[200] -mt-[38px] -ml-[44px] grid h-[76px] w-[88px] place-items-center"
        >
          <svg viewBox="0 0 88 76" className="absolute inset-0 h-full w-full">
            <polygon points="22,1 66,1 87,38 66,75 22,75 1,38" fill="rgb(0 54 71 / 0.82)" stroke="#78b0c8" strokeWidth="1.2" />
          </svg>
          <span className="relative text-[11px] font-bold tracking-[0.1em] text-white uppercase">Arrastra</span>
        </motion.div>
      </motion.div>
      <p id="carrusel-ayuda" className="sr-only">
        Usa las flechas izquierda y derecha para recorrer los proyectos y Enter para ver el detalle.
      </p>

      <div className="mt-10 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => goTo(active - 1)}
          disabled={active === 0}
          aria-label="Proyecto anterior"
          className="grid size-12 place-items-center rounded-full text-petroleo shadow-[inset_0_0_0_1.5px_rgb(0_54_71/0.3)] transition-colors hover:bg-petroleo hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-petroleo"
        >
          <ChevronLeft className="size-5" />
        </button>
        <p className="min-w-[170px] text-center text-sm font-bold text-petroleo" aria-live="polite">
          Ver más proyectos
          <span className="block text-xs font-semibold text-pizarra tabular-nums">
            {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            <span className="sr-only">: {items[active]?.title}</span>
          </span>
        </p>
        <button
          type="button"
          onClick={() => goTo(active + 1)}
          disabled={active === n - 1}
          aria-label="Proyecto siguiente"
          className="grid size-12 place-items-center rounded-full bg-petroleo text-white transition-colors hover:bg-vicuna disabled:opacity-30"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}

function Detail({ project, onClose }: { project: Project; onClose: () => void }) {
  const setPrefill = useScene((s) => s.setPrefill);
  const scrollTo = useScrollTo();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      className="relative mt-14 grid overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[0_40px_80px_-40px_rgb(0_35_48/0.45)] lg:grid-cols-[1.4fr_1fr]"
      role="group"
      aria-label={`Detalle: ${project.title}`}
    >
      <motion.div layoutId={`media-${project.id}`} className="relative aspect-[4/3] overflow-hidden bg-petroleo lg:aspect-auto lg:min-h-[560px]">
        <motion.div
          className="absolute inset-0"
          initial={{ clipPath: "polygon(42% 32.7%, 58% 32.7%, 66% 50%, 58% 67.3%, 42% 67.3%, 34% 50%)" }}
          animate={{ clipPath: HEX_CLIP_FULL }}
          transition={{ duration: 1.1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image src={project.image} alt={project.alt} fill sizes="(max-width: 1024px) 100vw, 720px" className="object-cover" />
        </motion.div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col p-8 sm:p-10 lg:p-12"
      >
        <h3 className="display pr-12 text-[clamp(32px,3.4vw,52px)] text-petroleo">{project.title}</h3>
        <p className="mt-3 text-sm font-semibold text-pizarra">
          {project.location} · {categoryLabel[project.category]}
        </p>
        <p className="mt-6 max-w-[48ch] text-base leading-relaxed text-carbon">{project.description}</p>
        <div className="mt-auto flex flex-wrap gap-3 pt-10">
          <Button
            arrow
            onClick={() => {
              setPrefill(project.projectType, project.title);
              scrollTo("contacto");
            }}
          >
            Quiero algo similar
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Volver al carrusel
          </Button>
        </div>
      </motion.div>
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Cerrar detalle"
        className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-white/90 text-petroleo shadow-md transition-colors hover:bg-petroleo hover:text-white"
      >
        <X className="size-5" />
      </button>
    </motion.div>
  );
}

export function Projects() {
  const [filter, setFilter] = useState<ProjectCategory | "todos">("todos");
  const list = useMemo(() => (filter === "todos" ? projects : projects.filter((p) => p.category === filter)), [filter]);
  const [openId, setOpenId] = useState<string | null>(null);
  // Arranca en una tarjeta central para que haya proyectos a ambos lados.
  const indexRef = useRef(2);
  const open = list.find((p) => p.id === openId) ?? null;

  return (
    <section
      id="proyectos"
      aria-labelledby="proyectos-title"
      className="relative overflow-hidden bg-humo pt-[clamp(128px,14vw,200px)] pb-[clamp(96px,10vw,140px)]"
    >
      <ScrollTopo color="var(--color-pizarra)" opacity={0.14} seed={11} />
      <DiagonalEdge color="var(--color-petroleo)" />
      <div className="relative mx-auto max-w-[1240px] px-6 sm:px-8">
        <div className="flex flex-col items-center gap-8 text-center">
          <div>
            <SectionTitle id="proyectos-title" className="mx-auto text-[clamp(40px,5vw,72px)] text-petroleo">
              Obras que ya están en pie
            </SectionTitle>
            <p className="mx-auto mt-5 max-w-[56ch] text-lg text-carbon">
              Proyectos que reflejan nuestro compromiso con la calidad y el desarrollo: vivienda, edificios, comercio
              y estudios de campo en Cajamarca, Lambayeque, La Libertad y Lima.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Filtrar proyectos">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={filter === c.id}
                onClick={() => {
                  setFilter(c.id);
                  setOpenId(null);
                  indexRef.current = c.id === "todos" ? 2 : 1;
                }}
                className={cn(
                  "h-10 rounded-full px-4 text-[13px] font-bold transition-colors duration-300",
                  filter === c.id
                    ? "bg-petroleo text-white"
                    : "text-petroleo shadow-[inset_0_0_0_1.5px_rgb(0_54_71/0.25)] hover:shadow-[inset_0_0_0_1.5px_var(--color-petroleo)]",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <LayoutGroup>
          <AnimatePresence mode="popLayout" initial={false}>
            {open ? (
              <Detail key={`detail-${open.id}`} project={open} onClose={() => setOpenId(null)} />
            ) : (
              <motion.div key={`carousel-${filter}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Carousel
                  items={list}
                  startIndex={Math.min(indexRef.current, list.length - 1)}
                  onIndex={(i) => (indexRef.current = i)}
                  onOpen={setOpenId}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </section>
  );
}
