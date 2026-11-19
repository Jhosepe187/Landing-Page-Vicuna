import Image from "next/image";
import { nav, site } from "@/content/site";

export function Footer() {
  return (
    <footer className="on-dark relative bg-petroleo-deep text-niebla">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-6 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1.4fr_1.1fr]">
        <div>
          <Image
            src="/media/brand/logo-vicuna-negativo.png"
            alt={`${site.name} · ${site.descriptor}`}
            width={480}
            height={152}
            className="h-11 w-auto"
          />
          <p className="display mt-6 max-w-[16ch] text-2xl text-white">{site.tagline}</p>
        </div>
        <div>
          <h2 className="text-xs font-bold tracking-[0.12em] text-celeste uppercase">Navegación</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {nav.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="transition-colors hover:text-white">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-bold tracking-[0.12em] text-celeste uppercase">Contacto</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={site.phone.href} className="transition-colors hover:text-white">
                {site.phone.display}
              </a>
            </li>
            {site.emails.map((e) => (
              <li key={e}>
                <a href={`mailto:${e}`} className="transition-colors hover:text-white">
                  {e}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-bold tracking-[0.12em] text-celeste uppercase">Oficinas</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {site.offices.map((o) => (
              <li key={o.city}>
                <span className="font-semibold text-white">{o.city}</span>
                <br />
                {o.address}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-celeste/15">
        <p className="mx-auto max-w-[1240px] px-6 py-6 text-xs sm:px-8">
          © {new Date().getFullYear()} {site.name} · {site.descriptor}
        </p>
      </div>
    </footer>
  );
}
