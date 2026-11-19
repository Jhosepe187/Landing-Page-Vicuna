import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/contact-schema";
import { projectTypes, site } from "@/content/site";

// Límite simple en memoria: 5 envíos por IP cada 10 minutos (por instancia).
const hits = new Map<string, number[]>();
const WINDOW = 10 * 60_000;
const LIMIT = 5;

function rateLimited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  if (list.length >= LIMIT) return true;
  list.push(now);
  hits.set(ip, list);
  return false;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Recibimos varios envíos seguidos desde tu conexión. Intenta de nuevo en unos minutos." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "La solicitud llegó vacía o mal formada." }, { status: 400 });
  }

  // Honeypot: un bot completó el campo oculto. Respondemos ok sin enviar nada.
  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Hay campos incompletos o con formato incorrecto.",
        issues: parsed.error.issues.map((i) => i.path.join(".")),
      },
      { status: 422 },
    );
  }
  const d = parsed.data;
  const typeLabel = projectTypes.find((t) => t.value === d.projectType)?.label ?? d.projectType;

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM;

  if (!key || !to || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[contact] Envío simulado en desarrollo (faltan RESEND_API_KEY / CONTACT_TO / CONTACT_FROM):", {
        ...d,
        projectType: typeLabel,
      });
      return NextResponse.json({ ok: true, delivered: false });
    }
    return NextResponse.json(
      { ok: false, error: "El envío del formulario aún no está configurado en el servidor." },
      { status: 503 },
    );
  }

  const lines = [
    `Nueva solicitud de propuesta desde ${site.url}`,
    "",
    `Nombre: ${d.name}`,
    `Empresa: ${d.company || "—"}`,
    `Correo: ${d.email}`,
    `Teléfono: ${d.phone}`,
    `Tipo de proyecto: ${typeLabel}`,
    `Ciudad del proyecto: ${d.city || "—"}`,
    "",
    "Mensaje:",
    d.message,
  ];

  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: d.email,
    subject: `Solicitud de propuesta · ${typeLabel} · ${d.name}`,
    text: lines.join("\n"),
  });

  if (error) {
    console.error("[contact] Resend:", error);
    return NextResponse.json({ ok: false, error: "El servicio de correo no aceptó el envío." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, delivered: true });
}
