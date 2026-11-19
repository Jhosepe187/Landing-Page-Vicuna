import Image from "next/image";
import { clients } from "@/content/site";
import { DiagonalEdge, ScrollTopo, SectionTitle } from "./ui";

type C = (typeof clients)[number];

// Compensación óptica: marcas de trazo fino o con mucho aire en el archivo.
const OPTICAL: Record<string, number> = {
  "Fondo Social Michiquillay": 1.4,
  "EACE · EA Consulting Engineers": 1.35,
  "Generando Capacidades": 1.45,
  "Gobierno Regional Cajamarca": 1.2,
  Fidamar: 0.95,
};

function Tile({ c, hidden }: { c: C; hidden?: boolean }) {
  const k = OPTICAL[c.name] ?? 1;
  return (
    <li
      aria-hidden={hidden}
      className="group grid h-28 w-[220px] shrink-0 place-items-center rounded-[var(--radius-card)] bg-white px-8 shadow-[inset_0_0_0_1px_var(--color-linea)] transition-[box-shadow,transform] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:shadow-[inset_0_0_0_1px_var(--color-celeste),0_18px_36px_-20px_rgb(0_54_71/0.45)] sm:h-32 sm:w-[240px]"
    >
      <Image
        src={c.logo}
        alt={hidden ? "" : c.name}
        width={c.width}
        height={c.height}
        sizes="200px"
        style={{ height: `${Math.round(60 * k)}px` }}
        className="w-auto max-w-[180px] object-contain [filter:grayscale(1)_brightness(0.55)_contrast(1.6)] transition-[filter] duration-500 group-hover:[filter:none]"
      />
    </li>
  );
}

function Row({ items, reverse, duration }: { items: C[]; reverse?: boolean; duration: string }) {
  return (
    <div className="overflow-hidden">
      <ul
        className="marquee-track flex w-max gap-4 pr-4"
        data-reverse={reverse ? "true" : undefined}
        style={{ ["--marquee-duration" as string]: duration }}
      >
        {items.map((c) => (
          <Tile key={c.name} c={c} />
        ))}
        {items.map((c) => (
          <Tile key={`${c.name}-dup`} c={c} hidden />
        ))}
      </ul>
    </div>
  );
}

export function Clients() {
  const half = Math.ceil(clients.length / 2);
  const rowA = [...clients.slice(0, half), ...clients.slice(half)];
  const rowB = [...clients.slice(half), ...clients.slice(0, half)].reverse();
  return (
    <section
      id="clientes"
      aria-labelledby="clientes-title"
      className="relative overflow-hidden bg-humo pt-[clamp(128px,14vw,200px)] pb-[clamp(96px,10vw,140px)]"
    >
      <ScrollTopo color="var(--color-pizarra)" opacity={0.13} seed={17} />
      <DiagonalEdge color="var(--color-petroleo)" />
      <div className="relative mx-auto max-w-[1240px] px-6 sm:px-8">
        <SectionTitle id="clientes-title" className="text-[clamp(40px,5vw,72px)] text-petroleo">
          Confían en nuestra precisión
        </SectionTitle>
        <p className="mt-5 max-w-[56ch] text-lg text-carbon">
          Aliados estratégicos en el desarrollo del país: mineras, gobiernos regionales, fondos sociales y consultoras
          de ingeniería.
        </p>
      </div>

      <div className="marquee mt-14 space-y-4 [mask-image:linear-gradient(90deg,transparent,#000_7%,#000_93%,transparent)]">
        <Row items={rowA} duration="54s" />
        <Row items={rowB} duration="62s" reverse />
      </div>
    </section>
  );
}
