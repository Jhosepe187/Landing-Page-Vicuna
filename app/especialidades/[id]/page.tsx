import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { SpecialtyDetailView } from "@/components/SpecialtyDetail";
import { specialties, type Rubro } from "@/content/site";

type Params = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return specialties.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const s = specialties.find((x) => x.id === id);
  if (!s) return {};
  return {
    title: `${s.title} · Vicuna Ingenieros`,
    description: s.body,
    openGraph: { title: `${s.title} · Vicuna Ingenieros`, description: s.body, images: [{ url: s.image }] },
  };
}

export default async function SpecialtyPage({ params }: Params) {
  const { id } = await params;
  if (!specialties.some((s) => s.id === id)) notFound();
  return (
    <>
      <main>
        <SpecialtyDetailView id={id as Rubro} />
      </main>
      <Footer />
    </>
  );
}
