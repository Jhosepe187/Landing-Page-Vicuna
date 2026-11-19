"use client";

import Image from "next/image";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { useLenis } from "lenis/react";
import { nav, site } from "@/content/site";
import { cn } from "@/lib/utils";
import { Button, useScrollTo } from "./ui";

function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.2, 0.5] },
    );
    els.forEach((el) => io.observe(el));
    const top = () => window.scrollY < window.innerHeight * 0.5 && setActive(null);
    window.addEventListener("scroll", top, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", top);
    };
  }, [ids]);
  return active;
}

export function Navbar() {
  const ids = nav.map((n) => n.id);
  const active = useActiveSection(ids);
  const scrollTo = useScrollTo();
  const lenis = useLenis();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [compact, setCompact] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setCompact(y > 40);
    setHidden(y > 240 && y > prev + 2 && !open);
    if (y < prev - 2) setHidden(false);
  });

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, lenis]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    scrollTo(id);
  };

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: hidden ? -120 : 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="on-dark fixed inset-x-0 top-0 z-50 px-3 pt-[max(12px,env(safe-area-inset-top))] sm:px-4 sm:pt-[max(16px,env(safe-area-inset-top))]"
      >
        <nav
          aria-label="Principal"
          className={cn(
            "glass-dark relative mx-auto flex max-w-[1240px] !bg-[rgb(0_42_56/0.78)] items-center justify-between gap-4 rounded-full pr-2 pl-5 transition-[height,padding] duration-500 ease-[var(--ease-out-expo)]",
            compact ? "h-14" : "h-16",
          )}
        >
          <a href="#inicio" onClick={go("inicio")} className="flex shrink-0 items-center" aria-label={`${site.name}, ir al inicio`}>
            <Image
              src="/media/brand/logo-vicuna-negativo.png"
              alt={`${site.name} · ${site.descriptor}`}
              width={480}
              height={152}
              priority
              className={cn("w-auto transition-[height] duration-500", compact ? "h-8" : "h-9")}
            />
          </a>

          <ul className="hidden items-center gap-1 md:flex">
            {nav.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={go(item.id)}
                  aria-current={active === item.id ? "location" : undefined}
                  className={cn(
                    "relative flex h-10 items-center px-4 text-sm font-semibold transition-colors duration-300",
                    active === item.id ? "text-white" : "text-niebla hover:text-white",
                  )}
                >
                  {item.label}
                  {active === item.id && (
                    <motion.svg
                      layoutId="nav-hex"
                      aria-hidden
                      viewBox="0 0 12 10.4"
                      className="absolute -bottom-0.5 left-1/2 size-2.5 -translate-x-1/2 text-celeste"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    >
                      <polygon points="3,0 9,0 12,5.2 9,10.4 3,10.4 0,5.2" fill="currentColor" />
                    </motion.svg>
                  )}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <span className="hidden sm:block">
              <Button href="#contacto" onClick={go("contacto") as never} className="min-h-11 px-6">
                Solicitar propuesta
              </Button>
            </span>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-movil"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              className="grid size-11 place-items-center rounded-full text-white transition-colors hover:bg-white/10 md:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-movil"
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="on-dark fixed inset-0 z-40 flex flex-col justify-between bg-petroleo/90 px-6 pt-28 pb-10 backdrop-blur-2xl md:hidden"
          >
            <ul className="flex flex-col gap-2">
              {nav.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.08 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <a href={`#${item.id}`} onClick={go(item.id)} className="display block py-2 text-5xl text-white">
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <div className="flex flex-col gap-4 text-niebla">
              <Button href="#contacto" onClick={go("contacto") as never} arrow>
                Solicitar propuesta
              </Button>
              <a href={site.phone.href} className="text-center font-semibold text-white">
                {site.phone.display}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
