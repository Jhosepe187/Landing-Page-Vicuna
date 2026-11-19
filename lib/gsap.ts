"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Progreso de scroll del hero (0 arriba, 1 al salir). Lo escribe ScrollTrigger y lo lee la escena 3D por frame. */
export const heroScroll = { p: 0 };

export { gsap, ScrollTrigger, useGSAP };
