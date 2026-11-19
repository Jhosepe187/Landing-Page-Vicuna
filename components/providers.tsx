"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { MotionConfig, useReducedMotion } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/** Lenis avanza con el ticker de GSAP y notifica a ScrollTrigger en cada scroll. */
function LenisGsapBridge() {
  const lenis = useLenis(ScrollTrigger.update);
  useEffect(() => {
    if (!lenis) return;
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(tick);
  }, [lenis]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <MotionConfig reducedMotion="user" transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.7 }}>
      {reduced ? (
        children
      ) : (
        <ReactLenis root options={{ lerp: 0.075, wheelMultiplier: 1, anchors: { offset: -96 }, autoRaf: false }}>
          <LenisGsapBridge />
          {children}
        </ReactLenis>
      )}
    </MotionConfig>
  );
}
