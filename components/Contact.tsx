"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { ArrowUpRight, Loader2, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { contactSchema, type ContactData, type ContactInput } from "@/lib/contact-schema";
import { projectTypes, site } from "@/content/site";
import { cn, HEX_CLIP } from "@/lib/utils";
import { useScene } from "@/store/scene";
import { Button, DiagonalEdge, ScrollTopo, SectionTitle } from "./ui";

const inputCls = (invalid?: boolean) =>
  cn(
    "w-full rounded-[10px] border bg-white/[0.06] px-4 text-base text-white transition-[border-color,background-color] duration-300 placeholder:text-niebla/55 hover:bg-white/[0.09] focus:bg-white/[0.1] focus:outline-none",
    invalid ? "border-[#ffb4a1] focus:border-[#ffb4a1]" : "border-celeste/30 focus:border-celeste",
  );

function Field({
  label,
  optional,
  error,
  children,
  id,
}: {
  label: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
  id: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[13px] font-semibold text-white">
        {label}
        {optional && <span className="font-normal text-niebla"> (opcional)</span>}
      </label>
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto", x: [0, -2, 2, 0] }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-1.5 text-[13px] text-[#ffc6b8]"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Success({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="flex min-h-[520px] flex-col items-start justify-center"
      role="status"
    >
      <svg viewBox="0 0 92 80" className="h-20 w-24" aria-hidden>
        <motion.polygon
          points="23,2 69,2 90,40 69,78 23,78 2,40"
          fill="none"
          stroke="#78b0c8"
          strokeWidth="2.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.path
          d="M30 41 L42 52 L63 29"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <h3 className="display mt-8 text-[clamp(32px,3vw,44px)] text-white">Recibimos tu solicitud</h3>
      <p className="mt-4 max-w-[42ch] text-niebla">
        Te escribiremos al correo que dejaste para conversar sobre tu proyecto. Si es urgente, llámanos al{" "}
        <a href={site.phone.href} className="font-semibold whitespace-nowrap text-white underline">
          {site.phone.display}
        </a>
        .
      </p>
      <div className="mt-8">
        <Button variant="secondary-dark" onClick={onReset}>
          Enviar otra solicitud
        </Button>
      </div>
    </motion.div>
  );
}

function ContactForm() {
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const prefill = useScene((s) => s.prefill);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    setFocus,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput, unknown, ContactData>({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      company: "",
      email: "",
      phone: "",
      city: "",
      message: "",
      website: "",
      consent: false as unknown as true,
    },
  });

  useEffect(() => {
    if (!prefill) return;
    setStatus("idle");
    setValue("projectType", prefill.type, { shouldValidate: true });
    if (prefill.note && !getValues("message")) {
      setValue("message", `Me interesa un proyecto similar a «${prefill.note}». `);
    }
    const t = setTimeout(() => setFocus("name"), 900);
    return () => clearTimeout(t);
  }, [prefill, setValue, getValues, setFocus]);

  const onSubmit = async (data: ContactData) => {
    setServerError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error || "El servidor no respondió como esperábamos.");
      setStatus("success");
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Revisa tu conexión.");
      setStatus("error");
    }
  };

  const describe = (k: keyof ContactInput) => (errors[k] ? `${id(k)}-error` : undefined);

  return (
    <div className="glass-dark relative rounded-[var(--radius-card)] p-6 sm:p-9">
      <AnimatePresence mode="wait" initial={false}>
        {status === "success" ? (
          <Success
            onReset={() => {
              reset();
              setStatus("idle");
            }}
          />
        ) : (
          <motion.form
            key="form"
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-5"
            aria-label="Solicitar propuesta"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id={id("name")} label="Nombre y apellido" error={errors.name?.message}>
                <input
                  id={id("name")}
                  autoComplete="name"
                  aria-invalid={!!errors.name}
                  aria-describedby={describe("name")}
                  className={cn(inputCls(!!errors.name), "h-12")}
                  {...register("name")}
                />
              </Field>
              <Field id={id("company")} label="Empresa" optional>
                <input id={id("company")} autoComplete="organization" className={cn(inputCls(), "h-12")} {...register("company")} />
              </Field>
              <Field id={id("email")} label="Correo" error={errors.email?.message}>
                <input
                  id={id("email")}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={describe("email")}
                  className={cn(inputCls(!!errors.email), "h-12")}
                  {...register("email")}
                />
              </Field>
              <Field id={id("phone")} label="Teléfono o WhatsApp" error={errors.phone?.message}>
                <input
                  id={id("phone")}
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  aria-invalid={!!errors.phone}
                  aria-describedby={describe("phone")}
                  className={cn(inputCls(!!errors.phone), "h-12")}
                  {...register("phone")}
                />
              </Field>
            </div>

            <fieldset aria-describedby={describe("projectType")}>
              <legend className="mb-2 text-[13px] font-semibold text-white">Tipo de proyecto</legend>
              <div className="flex flex-wrap gap-2">
                {projectTypes.map((t) => (
                  <label key={t.value} className="relative cursor-pointer">
                    <input type="radio" value={t.value} className="peer sr-only" {...register("projectType")} />
                    <span className="flex h-10 items-center rounded-full px-4 text-[13px] font-semibold text-niebla shadow-[inset_0_0_0_1px_rgb(120_176_200/0.4)] transition-colors duration-300 peer-checked:bg-white peer-checked:text-petroleo peer-checked:shadow-none peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-celeste hover:text-white">
                      {t.label}
                    </span>
                  </label>
                ))}
              </div>
              <AnimatePresence initial={false}>
                {errors.projectType && (
                  <motion.p
                    id={`${id("projectType")}-error`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-1.5 text-[13px] text-[#ffc6b8]"
                  >
                    {errors.projectType.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </fieldset>

            <Field id={id("city")} label="Ciudad del proyecto" optional>
              <input id={id("city")} autoComplete="address-level2" className={cn(inputCls(), "h-12")} {...register("city")} />
            </Field>

            <Field id={id("message")} label="Cuéntanos tu proyecto" error={errors.message?.message}>
              <textarea
                id={id("message")}
                rows={4}
                aria-invalid={!!errors.message}
                aria-describedby={describe("message")}
                placeholder="Qué quieres construir, en qué etapa estás y para cuándo lo necesitas."
                className={cn(inputCls(!!errors.message), "resize-y py-3 leading-relaxed")}
                {...register("message")}
              />
            </Field>

            {/* Honeypot */}
            <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor={id("website")}>No completar</label>
              <input id={id("website")} tabIndex={-1} autoComplete="off" {...register("website")} />
            </div>

            <div>
              <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-niebla">
                <input
                  type="checkbox"
                  aria-invalid={!!errors.consent}
                  aria-describedby={describe("consent")}
                  className="mt-0.5 size-5 shrink-0 cursor-pointer appearance-none rounded-[5px] border border-celeste/50 bg-white/5 bg-center bg-no-repeat transition-colors checked:border-celeste checked:bg-celeste checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22><path d=%22M5 10.5l3 3 7-7%22 fill=%22none%22 stroke=%22%23003647%22 stroke-width=%222.4%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/></svg>')] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste"
                  {...register("consent")}
                />
                <span>
                  Autorizo a {site.name} a usar mis datos para responder esta solicitud, conforme a la Ley N° 29733 de
                  Protección de Datos Personales.
                </span>
              </label>
              {errors.consent && (
                <p id={`${id("consent")}-error`} className="mt-1.5 text-[13px] text-[#ffc6b8]">
                  {errors.consent.message}
                </p>
              )}
            </div>

            {status === "error" && (
              <div role="alert" className="rounded-[10px] border border-[#ffb4a1]/50 bg-[#ffb4a1]/10 p-4 text-[14px] text-white">
                <strong className="font-semibold">No pudimos enviar tu solicitud.</strong> {serverError} Vuelve a
                intentarlo o escríbenos a{" "}
                <a className="underline" href={`mailto:${site.emails[0]}`}>
                  {site.emails[0]}
                </a>
                .
              </div>
            )}

            <Button type="submit" arrow={!isSubmitting} disabled={isSubmitting} className="w-full sm:w-auto sm:justify-self-start">
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden /> Enviando…
                </span>
              ) : status === "error" ? (
                "Reintentar envío"
              ) : (
                "Solicitar propuesta"
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Minimapa de las dos sedes, con pestañas y enlace para trazar la ruta. */
function OfficeMap() {
  const [i, setI] = useState(0);
  const office = site.offices[i];
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(office.query)}&z=16&output=embed`;
  return (
    <div className="glass-dark relative mt-10 overflow-hidden rounded-[var(--radius-card)]">
      <div role="tablist" aria-label="Nuestras sedes" className="flex gap-1 p-1.5">
        {site.offices.map((o, k) => (
          <button
            key={o.city}
            type="button"
            role="tab"
            aria-selected={k === i}
            aria-controls="mapa-sede"
            onClick={() => setI(k)}
            className={cn(
              "flex h-10 flex-1 items-center justify-center gap-2 rounded-full text-[13px] font-bold transition-colors duration-300",
              k === i ? "bg-white text-petroleo" : "text-niebla hover:text-white",
            )}
          >
            <MapPin className="size-4" aria-hidden />
            {o.city}
          </button>
        ))}
      </div>
      <div id="mapa-sede" role="tabpanel" className="relative mx-1.5 h-56 overflow-hidden rounded-[10px] bg-petroleo-deep">
        <iframe
          key={office.city}
          title={`Mapa de la sede ${office.city}: ${office.address}`}
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0 [filter:grayscale(0.35)_contrast(1.05)_saturate(0.85)]"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[10px] shadow-[inset_0_0_0_1px_rgb(120_176_200/0.35)]" />
      </div>
      <div className="flex items-end justify-between gap-4 p-4">
        <p className="text-[15px] text-niebla">
          <span className="font-semibold text-white">Sede {office.city}</span>
          <br />
          {office.address}
        </p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.query)}`}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-celeste transition-colors hover:text-white"
        >
          Cómo llegar
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </a>
      </div>
    </div>
  );
}

export function Contact() {
  return (
    <section
      id="contacto"
      aria-labelledby="contacto-title"
      className="on-dark relative overflow-hidden bg-petroleo pt-[clamp(128px,14vw,200px)] pb-[clamp(96px,10vw,140px)]"
    >
      <DiagonalEdge color="var(--color-humo)" flip />
      <ScrollTopo opacity={0.2} seed={5} lines={26} />
      <div className="relative mx-auto grid max-w-[1240px] gap-14 px-6 sm:px-8 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <div>
          <SectionTitle id="contacto-title" className="text-[clamp(40px,5vw,72px)] text-white">
            Hablemos de tu proyecto
          </SectionTitle>
          <p className="mt-5 max-w-[44ch] text-lg text-niebla">
            Cuéntanos qué quieres construir y dónde. Preparamos una propuesta técnica y económica a la medida de tu obra.
          </p>
          <div className="mt-10">
            <Button href={site.whatsapp} variant="secondary-dark">
              <span className="flex items-center gap-2">
                <MessageCircle className="size-4" aria-hidden /> Escríbenos por WhatsApp
              </span>
            </Button>
          </div>
          <ul className="mt-12 grid gap-6 text-[15px] text-niebla sm:grid-cols-2 lg:grid-cols-1">
            <li className="flex gap-4">
              <Phone className="mt-0.5 size-5 shrink-0 text-celeste" aria-hidden />
              <a href={site.phone.href} className="font-semibold text-white transition-colors hover:text-celeste">
                {site.phone.display}
              </a>
            </li>
            <li className="flex gap-4">
              <Mail className="mt-0.5 size-5 shrink-0 text-celeste" aria-hidden />
              <span className="flex flex-col gap-1">
                {site.emails.map((e) => (
                  <a key={e} href={`mailto:${e}`} className="break-all text-white transition-colors hover:text-celeste">
                    {e}
                  </a>
                ))}
              </span>
            </li>
          </ul>
          <OfficeMap />
        </div>
        <div className="relative">
          {/* Foto de campo en marco hexagonal: el vidrio del formulario la difumina y refracta */}
          <div
            aria-hidden
            className="absolute -top-16 -right-24 hidden aspect-[1.155/1] w-[460px] opacity-80 lg:block"
            style={{ clipPath: HEX_CLIP }}
          >
            <Image src="/media/field/topografia-gnss-andes.jpg" alt="" fill sizes="460px" className="object-cover" />
            <div className="absolute inset-0 bg-petroleo/25" />
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
