import type { ProjectType } from "./site";

export type ProjectCategory = "vivienda" | "edificio" | "comercial" | "ingenieria";

export type Project = {
  id: string;
  title: string;
  location: string;
  category: ProjectCategory;
  image: string;
  alt: string;
  /** Describe solo lo visible en el render o la foto. Pendiente de validación por Vicuña. */
  description: string;
  projectType: ProjectType;
};

export const categories: { id: ProjectCategory | "todos"; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "vivienda", label: "Vivienda" },
  { id: "edificio", label: "Edificios" },
  { id: "comercial", label: "Comercial" },
  { id: "ingenieria", label: "Ingeniería y topografía" },
];

export const categoryLabel: Record<ProjectCategory, string> = {
  vivienda: "Arquitectura · Vivienda",
  edificio: "Arquitectura · Edificio",
  comercial: "Arquitectura · Comercial",
  ingenieria: "Ingeniería · Topografía",
};

export const projects: Project[] = [
  {
    id: "edificio-pimentel",
    title: "Edificio residencial Pimentel",
    location: "Chiclayo, Lambayeque",
    category: "edificio",
    image: "/media/projects/edificio-pimentel-chiclayo.jpg",
    alt: "Render nocturno de edificio residencial blanco y gris con balcones verdes",
    description: "Edificio residencial de varios niveles con balcones ajardinados, fachada blanca y gris e iluminación cálida en terrazas.",
    projectType: "edificio",
  },
  {
    id: "casa-campo-la-molina",
    title: "Casa de campo La Molina",
    location: "Lima",
    category: "vivienda",
    image: "/media/projects/casa-campo-la-molina.jpg",
    alt: "Render de casa de campo moderna con piscina y fachada de vidrio",
    description: "Casa de campo de dos niveles con piscina, volúmenes de concreto y una fachada de vidrio inclinada hacia el jardín.",
    projectType: "vivienda",
  },
  {
    id: "unifamiliar-chiclayo",
    title: "Vivienda unifamiliar Chiclayo",
    location: "Chiclayo, Lambayeque",
    category: "vivienda",
    image: "/media/projects/unifamiliar-chiclayo.jpg",
    alt: "Render al atardecer de vivienda de dos niveles con volúmenes en voladizo",
    description: "Vivienda de dos niveles con volúmenes en voladizo, revestimientos de madera y cochera integrada a la fachada.",
    projectType: "vivienda",
  },
  {
    id: "edificio-trujillo",
    title: "Edificio residencial Trujillo",
    location: "Trujillo, La Libertad",
    category: "edificio",
    image: "/media/projects/edificio-trujillo.jpg",
    alt: "Render de edificio residencial con volumen curvo y ventanas iluminadas",
    description: "Edificio residencial con un volumen curvo en esquina, balcones con jardineras y fachada en tonos claros y oscuros.",
    projectType: "edificio",
  },
  {
    id: "unifamiliar-jaen",
    title: "Vivienda unifamiliar Jaén",
    location: "Jaén, Cajamarca",
    category: "vivienda",
    image: "/media/projects/unifamiliar-jaen.jpg",
    alt: "Render nocturno de vivienda con patio interior, piscina y dobles alturas iluminadas",
    description: "Vivienda organizada alrededor de un patio con piscina, con dobles alturas vidriadas e iluminación cálida.",
    projectType: "vivienda",
  },
  {
    id: "comercial-lurin",
    title: "Local comercial Lurín",
    location: "Lurín, Lima",
    category: "comercial",
    image: "/media/projects/comercial-lurin.jpg",
    alt: "Interior de nave comercial con techo curvo, mezzanine vidriado y escalera metálica",
    description: "Nave comercial con cubierta curva, mezzanine de oficinas vidriado, escalera metálica y muros de ladrillo caravista.",
    projectType: "comercial",
  },
  {
    id: "unifamiliar-cerrillo",
    title: "Vivienda unifamiliar Cerrillo",
    location: "Cajamarca",
    category: "vivienda",
    image: "/media/projects/unifamiliar-cerrillo-cajamarca.jpg",
    alt: "Render de vivienda con techo curvo, piedra, madera y cochera",
    description: "Vivienda con cubierta curva, volúmenes en piedra y madera y cochera integrada, frente al paisaje cajamarquino.",
    projectType: "vivienda",
  },
  {
    id: "multifamiliar-banos-del-inca",
    title: "Vivienda multifamiliar Baños del Inca",
    location: "Baños del Inca, Cajamarca",
    category: "vivienda",
    image: "/media/projects/multifamiliar-banos-del-inca.jpg",
    alt: "Render de vivienda multifamiliar blanca de tres niveles rodeada de árboles",
    description: "Vivienda multifamiliar de tres niveles con terrazas y techos inclinados, integrada a un entorno arbolado.",
    projectType: "vivienda",
  },
  {
    id: "multifamiliar-centro-historico",
    title: "Vivienda multifamiliar Centro Histórico",
    location: "Cajamarca",
    category: "edificio",
    image: "/media/projects/multifamiliar-centro-historico-cajamarca.jpg",
    alt: "Render de edificio multifamiliar con fachada de piedra y balcones",
    description: "Edificio multifamiliar con fachada de piedra y balcones de madera, pensado para el contexto del centro histórico.",
    projectType: "edificio",
  },
  {
    id: "comercial-vivienda-cajamarca",
    title: "Local comercial y vivienda",
    location: "Cajamarca",
    category: "comercial",
    image: "/media/projects/comercial-vivienda-cajamarca.jpg",
    alt: "Render de edificio de uso mixto con balcones vidriados",
    description: "Edificio de uso mixto: local comercial en el primer nivel y vivienda en los pisos superiores, con balcones vidriados.",
    projectType: "comercial",
  },
  {
    id: "unifamiliar-huaraclla",
    title: "Vivienda unifamiliar Huaraclla",
    location: "Huaraclla, Cajamarca",
    category: "vivienda",
    image: "/media/projects/unifamiliar-huaraclla.jpg",
    alt: "Render de vivienda con pérgola, jardín y palmeras",
    description: "Vivienda de dos niveles con pérgola, jardín frontal y techos a dos aguas.",
    projectType: "vivienda",
  },
  {
    id: "planta-santa-rosa",
    title: "Departamento Santa Rosa",
    location: "Vista en planta",
    category: "edificio",
    image: "/media/projects/planta-santa-rosa.jpg",
    alt: "Render en planta de departamento amoblado",
    description: "Vista en planta amoblada de departamento: distribución de ambientes, mobiliario y acabados de piso.",
    projectType: "edificio",
  },
  {
    id: "topografia-linea-agua",
    title: "Levantamiento topográfico para línea de agua",
    location: "Zona altoandina",
    category: "ingenieria",
    image: "/media/projects/topografia-linea-agua.jpg",
    alt: "Ingenieros de Vicuña con equipo GNSS en campo altoandino",
    description: "Levantamiento topográfico con equipos GNSS para el trazo de una línea de distribución de agua.",
    projectType: "expediente",
  },
  {
    id: "estudios-ingenieria-detalle",
    title: "Estudios preliminares para ingeniería de detalle",
    location: "Trabajo de campo",
    category: "ingenieria",
    image: "/media/projects/estudios-ingenieria-detalle.jpg",
    alt: "Equipo de Vicuña con EPP realizando mediciones en terreno rocoso",
    description: "Estudios de campo preliminares que sustentan el desarrollo de la ingeniería de detalle.",
    projectType: "expediente",
  },
  {
    id: "estudios-ie-yanamango",
    title: "Estudios preliminares I.E. N°82065 Yanamango",
    location: "Cajamarca",
    category: "ingenieria",
    image: "/media/projects/estudios-ie-yanamango.jpg",
    alt: "Topógrafos de Vicuña midiendo en el patio de una institución educativa",
    description: "Levantamiento y estudios preliminares para el proyecto de la institución educativa N°82065 en Yanamango.",
    projectType: "infraestructura",
  },
];
