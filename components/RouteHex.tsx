"use client";

import Image from "next/image";
import { animate, motion, useMotionValue, useReducedMotionConfig, useTransform } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useScene } from "@/store/scene";

/** Hexágono de marca (vértices a izquierda y derecha) centrado en (cx, cy) con radio r, en px. */
function hexClip(cx: number, cy: number, r: number) {
  const h = r * 0.866;
  const pts = [
    [cx - r / 2, cy - h],
    [cx + r / 2, cy - h],
    [cx + r, cy],
    [cx + r / 2, cy + h],
    [cx - r / 2, cy + h],
    [cx - r, cy],
  ];
  return `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(", ")})`;
}

/**
 * Navega a una ruta interna con la transición hexagonal.
 * Clic con modificadores (nueva pestaña) y movimiento reducido navegan sin animación.
 */
export function useHexNavigate() {
  const router = useRouter();
  const reduce = useReducedMotionConfig();
  const start = useScene((s) => s.startHexNav);
  return (href: string, e?: React.MouseEvent<HTMLElement>) => {
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)) return;
    e?.preventDefault();
    if (reduce) {
      router.push(href);
      return;
    }
    let x = e?.clientX ?? 0;
    let y = e?.clientY ?? 0;
    // Activado con teclado: el clic llega sin coordenadas, se usa el centro del elemento
    if (e && x === 0 && y === 0) {
      const r = e.currentTarget.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top + r.height / 2;
    }
    if (!e) {
      x = window.innerWidth / 2;
      y = window.innerHeight / 2;
    }
    router.prefetch(href);
    start(href, x, y);
  };
}

/** Telón hexagonal: crece desde el clic, cubre la pantalla, navega y se retira en la página nueva. */
export function RouteHex() {
  const hexNav = useScene((s) => s.hexNav);
  const end = useScene((s) => s.endHexNav);
  const router = useRouter();
  const pathname = usePathname();
  const r = useMotionValue(0);
  const opacity = useMotionValue(1);
  const origin = useRef({ x: 0, y: 0 });
  const startPath = useRef<string | null>(null);
  const clipPath = useTransform(r, (v) => hexClip(origin.current.x, origin.current.y, v));
  const logoOpacity = useTransform(r, [0, 400, 900], [0, 0, 1]);
  // El router cambia de identidad al navegar: se guarda en una ref para que la fase 1 no se repita
  const routerRef = useRef(router);
  routerRef.current = router;

  // Fase 1: cubrir y navegar (solo cuando empieza una transición nueva)
  useEffect(() => {
    if (!hexNav) return;
    origin.current = { x: hexNav.x, y: hexNav.y };
    startPath.current = window.location.pathname;
    const cover = Math.hypot(Math.max(hexNav.x, window.innerWidth - hexNav.x), Math.max(hexNav.y, window.innerHeight - hexNav.y)) * 1.25;
    r.set(0);
    opacity.set(1);
    const a = animate(r, cover, {
      duration: 0.65,
      ease: [0.77, 0, 0.175, 1],
      onComplete: () => routerRef.current.push(hexNav.href),
    });
    return () => a.stop();
  }, [hexNav, r, opacity]);

  // Fase 2: la ruta cambió → retirar el telón
  useEffect(() => {
    if (!useScene.getState().hexNav || startPath.current === null || pathname === startPath.current) return;
    startPath.current = null;
    window.scrollTo(0, 0);
    const a = animate(opacity, 0, { duration: 0.45, delay: 0.1, ease: "easeOut", onComplete: end });
    return () => a.stop();
  }, [pathname, opacity, end]);

  if (!hexNav) return null;
  return (
    <motion.div
      aria-hidden
      style={{ clipPath, opacity }}
      className="fixed inset-0 z-[90] grid place-items-center bg-petroleo"
    >
      <motion.div style={{ opacity: logoOpacity }}>
        <Image src="/media/brand/simbolo-v.svg" alt="" width={94} height={96} className="h-24 w-auto brightness-0 invert" />
      </motion.div>
    </motion.div>
  );
}
