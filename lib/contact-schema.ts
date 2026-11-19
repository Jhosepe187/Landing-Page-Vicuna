import { z } from "zod";
import { projectTypes } from "@/content/site";

const typeValues = projectTypes.map((t) => t.value) as [string, ...string[]];

/** Esquema compartido por el formulario (cliente) y /api/contact (servidor). */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre completo."),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email("Revisa el correo: debe tener el formato nombre@dominio.com."),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s()-]{7,20}$/, "Escribe un teléfono válido, por ejemplo 952 958 549."),
  projectType: z.enum(typeValues, { message: "Elige el tipo de proyecto." }),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(15, "Cuéntanos un poco más (mínimo 15 caracteres): qué quieres construir y dónde.")
    .max(2000, "El mensaje es muy largo; resúmelo en 2000 caracteres."),
  consent: z.literal(true, { message: "Necesitamos tu autorización para responderte." }),
  /** Honeypot: los humanos no lo ven ni lo completan. */
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactData = z.output<typeof contactSchema>;
