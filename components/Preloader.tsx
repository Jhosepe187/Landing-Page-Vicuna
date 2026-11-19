"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect, useState } from "react";
import { hexPoints } from "@/lib/utils";
import { useScene } from "@/store/scene";

const PreloaderV = dynamic(() => import("./three/PreloaderV"), { ssr: false });

const KEY = "vicuna-preloaded";
const MIN_MS = 1500;
// Solo desarrollo: ?hold=preloader mantiene la pantalla para revisarla.
const holdForReview = () =>
  process.env.NODE_ENV !== "production" && typeof location !== "undefined" && location.search.includes("hold=preloader");
const MAX_MS = 3200;

/**
 * Pantalla de carga: el símbolo "V" extruido en vidrio (excepción de marca aprobada),
 * un hexágono que se dibuja con el progreso real y, al terminar, el hexágono se abre
 * como un lente y revela el hero.
 */
export function Preloader() {
  const [active, setActive] = useState(true);
  const [progress, setProgress] = useState(0.08);
  const [opening, setOpening] = useState(false);
  const setPhase = useScene((s) => s.setPhase);
  const lenis = useLenis();

  // ¿Ya se vio en esta sesión? (atributo puesto antes de pintar)
  useEffect(() => {
    if (document.documentElement.hasAttribute("data-preloaded")) {
      setActive(false);
      setPhase("done");
    }
  }, [setPhase]);

  useEffect(() => {
    if (!active) return;
    lenis?.stop();
    const start = performance.now();
    let fontsDone = false;
    document.fonts?.ready.then(() => (fontsDone = true));
    let raf = 0;
    const tick = () => {
      const t = performance.now() - start;
      const ready = fontsDone && useScene.getState().sceneReady;
      const target = ready ? 1 : Math.min(0.85, 0.15 + (t / MAX_MS) * 0.7 + (fontsDone ? 0.15 : 0));
      setProgress((p) => p + (target - p) * 0.12);
      if (holdForReview()) {
        raf = requestAnimationFrame(tick);
        return;
      }
      if ((ready && t > MIN_MS) || t > MAX_MS) {
        setProgress(1);
        setOpening(true);
        setPhase("reveal");
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, lenis, setPhase]);

  useEffect(() => {
    if (!opening) return;
    const id = setTimeout(() => {
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}
      setActive(false);
      setPhase("done");
      lenis?.start();
    }, 1100);
    return () => clearTimeout(id);
  }, [opening, lenis, setPhase]);

  const perimeter = 6 * 46;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="preloader"
          className="preloader fixed inset-0 z-[100]"
          role="status"
          aria-live="polite"
          aria-label={opening ? "Listo" : "Cargando"}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Fondo petróleo con una ventana hexagonal que se abre como lente */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden>
            <defs>
              <mask id="preloader-lens">
                <rect width="100" height="100" fill="white" />
                <motion.polygon
                  points={hexPoints(50, 50, 10)}
                  fill="black"
                  style={{ transformOrigin: "50px 50px", transformBox: "view-box" }}
                  initial={{ scale: 0 }}
                  animate={{ scale: opening ? 9 : 0 }}
                  transition={{ duration: 1.05, ease: [0.7, 0, 0.2, 1] }}
                />
              </mask>
            </defs>
            <rect width="100" height="100" fill="#003647" mask="url(#preloader-lens)" />
          </svg>

          <motion.div
            className="absolute inset-0 grid place-items-center"
            animate={{ opacity: opening ? 0 : 1, scale: opening ? 1.08 : 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative size-[min(56vw,260px)]">
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
                <polygon points={hexPoints(50, 50, 46)} fill="none" stroke="rgb(120 176 200 / 0.18)" strokeWidth="0.8" />
                <polygon
                  points={hexPoints(50, 50, 46)}
                  fill="none"
                  stroke="#78b0c8"
                  strokeWidth="1.2"
                  strokeDasharray={perimeter}
                  strokeDashoffset={perimeter * (1 - progress)}
                  strokeLinejoin="miter"
                />
              </svg>
              <div className="clip-hex absolute top-[10.2%] right-[4%] bottom-[10.2%] left-[4%]">
                <PreloaderV />
              </div>
            </div>
            <span className="sr-only">{Math.round(progress * 100)} %</span>
          </motion.div>
          <noscript>
            <style>{`.preloader{display:none}`}</style>
          </noscript>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
