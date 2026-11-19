"use client";

import { ArrowRight } from "lucide-react";
import { useLenis } from "lenis/react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useHexNavigate } from "./RouteHex";

const MotionLink = motion.create(Link);

/* ------------------------------------------------------------------ */
/* Scroll a una sección (Lenis si está activo, nativo si no)           */
/* ------------------------------------------------------------------ */
export function useScrollTo() {
  const lenis = useLenis();
  const router = useRouter();
  return (id: string) => {
    const el = document.getElementById(id);
    // Desde una subpágina (p. ej. /especialidades/mineria) la sección vive en la portada
    if (!el) {
      router.push(id === "inicio" ? "/" : `/#${id}`);
      return;
    }
    if (lenis) lenis.scrollTo(el, { offset: -88, duration: 1.4 });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  };
}

/* ------------------------------------------------------------------ */
/* Botón píldora con microinteracción magnética (solo puntero fino)    */
/* ------------------------------------------------------------------ */
type ButtonProps = {
  variant?: "primary" | "secondary" | "secondary-dark";
  arrow?: boolean;
  href?: string;
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<"button">, "ref">;

export function Button({ variant = "primary", arrow, href, children, className, onClick, ...rest }: ButtonProps) {
  const hexNavigate = useHexNavigate();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 20 });
  const sy = useSpring(y, { stiffness: 260, damping: 20 });

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set(((e.clientX - r.left) / r.width - 0.5) * 10);
    y.set(((e.clientY - r.top) / r.height - 0.5) * 8);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const classes = cn(
    "group relative inline-flex min-h-12 items-center justify-center gap-3 rounded-full px-7 text-[13px] font-bold uppercase tracking-[0.08em] transition-[background-color,color,box-shadow] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
    variant === "primary" &&
      "bg-vicuna text-white shadow-[0_12px_28px_-14px_rgb(0_114_150/0.95)] hover:bg-vicuna-deep",
    variant === "secondary" && "text-petroleo shadow-[inset_0_0_0_1.5px_var(--color-petroleo)] hover:bg-petroleo hover:text-white",
    variant === "secondary-dark" &&
      "text-white shadow-[inset_0_0_0_1.5px_rgb(120_176_200/0.7)] hover:bg-white hover:text-petroleo",
    className,
  );

  const content = (
    <>
      <span>{children}</span>
      {arrow && (
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1"
        />
      )}
    </>
  );

  // Rutas internas: navegación del cliente (sin recargar ni repetir el preloader).
  // Las páginas de rubro entran con el telón hexagonal.
  if (href?.startsWith("/")) {
    const hex = href.startsWith("/especialidades/");
    return (
      <MotionLink
        href={href}
        style={{ x: sx, y: sy }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={classes}
        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
          (onClick as unknown as React.MouseEventHandler<HTMLAnchorElement> | undefined)?.(e);
          if (hex) hexNavigate(href, e);
        }}
      >
        {content}
      </MotionLink>
    );
  }
  if (href) {
    return (
      <motion.a
        href={href}
        style={{ x: sx, y: sy }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className={classes}
        onClick={onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
      >
        {content}
      </motion.a>
    );
  }
  return (
    <motion.button
      style={{ x: sx, y: sy }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={classes}
      onClick={onClick}
      {...(rest as ComponentProps<typeof motion.button>)}
    >
      {content}
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* Titular de sección: entra deslizándose dentro de una máscara.       */
/* Es la única gramática de entrada de la página.                     */
/* ------------------------------------------------------------------ */
export function SectionTitle({
  children,
  as: Tag = "h2",
  className,
  id,
}: {
  children: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
  id?: string;
}) {
  return (
    <Tag id={id} className={cn("display -mt-[0.16em] overflow-hidden pt-[0.16em] pb-[0.06em]", className)}>
      <motion.span
        className="block"
        initial={{ y: "70%", opacity: 0.001 }}
        whileInView={{ y: "0%", opacity: 1 }}
        viewport={{ once: true, margin: "0px 0px -12% 0px" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.span>
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* Curvas de nivel: textura topográfica de marca (SVG determinista)    */
/* ------------------------------------------------------------------ */
export function TopoLines({
  className,
  lines = 22,
  seed = 1,
  opacity = 0.3,
  color = "var(--color-celeste)",
}: {
  className?: string;
  lines?: number;
  seed?: number;
  opacity?: number;
  color?: string;
}) {
  const paths = useMemo(() => {
    const out: { d: string; major: boolean }[] = [];
    const rand = (n: number) => {
      const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
      return s - Math.floor(s);
    };
    for (let i = 0; i < lines; i++) {
      const base = 40 + i * (520 / lines);
      const a = 18 + rand(i) * 26;
      const p = rand(i + 9) * Math.PI * 2;
      let d = `M -40 ${base.toFixed(1)}`;
      for (let x = 0; x <= 1280; x += 40) {
        const y = base + Math.sin(x / 190 + p) * a + Math.sin(x / 83 + p * 2) * a * 0.35 - (x / 1280) * 60;
        d += ` L ${x} ${y.toFixed(1)}`;
      }
      out.push({ d, major: i % 5 === 0 });
    }
    return out;
  }, [lines, seed]);

  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      viewBox="0 0 1240 600"
      preserveAspectRatio="xMidYMid slice"
    >
      <g fill="none" stroke={color} style={{ opacity }}>
        {paths.map((p, i) => (
          <path key={i} d={p.d} strokeWidth={p.major ? 1.4 : 0.7} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  );
}

/** Curvas de nivel que se desplazan con el scroll: el fondo del sitio respira al bajar. */
export function ScrollTopo({ color, opacity = 0.16, seed = 1, lines = 26 }: { color?: string; opacity?: number; seed?: number; lines?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const x = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-2, 2]);
  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div style={{ y, x, rotate }} className="absolute inset-[-14%]">
        <TopoLines color={color} opacity={opacity} seed={seed} lines={lines} />
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Borde diagonal entre secciones (plano oblicuo de la guía)           */
/* ------------------------------------------------------------------ */
export function DiagonalEdge({
  color,
  flip,
  className,
}: {
  color: string;
  flip?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-x-0 top-0 h-[clamp(48px,6vw,104px)]", className)}
      style={{
        background: color,
        clipPath: flip ? "polygon(0 0, 100% 0, 0 100%)" : "polygon(0 0, 100% 0, 100% 100%)",
      }}
    />
  );
}

/* Viñeta hexagonal para listas de alcance */
export function HexBullet({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 12 10.4" className={cn("mt-[0.45em] size-3 shrink-0", className)}>
      <polygon points="3,0 9,0 12,5.2 9,10.4 3,10.4 0,5.2" fill="currentColor" />
    </svg>
  );
}
