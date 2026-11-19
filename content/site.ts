export const site = {
  name: "Vicuña Ingenieros",
  descriptor: "Consultoría & Construcción",
  tagline: "Construyendo sueños, transformando realidades",
  // Dominio pendiente de confirmar (el brochure escribe "vicunaingerieros.com").
  url: "https://vicunaingenieros.com",
  phone: { display: "952 958 549", href: "tel:+51952958549" },
  whatsapp: "https://wa.me/51952958549?text=Hola%2C%20quiero%20solicitar%20una%20propuesta.",
  emails: ["proyectos@vicunaingenieros.com", "gerencia@vicunaingenieros.com"],
  offices: [
    { city: "Cajamarca", address: "Jr. Juan Villanueva N° 315", query: "Jr. Juan Villanueva 315, Cajamarca, Perú" },
    { city: "Lima", address: "Av. Del Río N° 486, Pueblo Libre", query: "Av. del Río 486, Pueblo Libre, Lima, Perú" },
  ],
} as const;

export const nav = [
  { id: "proyectos", label: "Proyectos" },
  { id: "especialidades", label: "Especialidades" },
  { id: "clientes", label: "Clientes" },
  { id: "contacto", label: "Contacto" },
] as const;

export type Rubro = "arquitectura" | "ingenieria" | "mineria";

export const projectTypes = [
  { value: "vivienda", label: "Vivienda" },
  { value: "edificio", label: "Edificio multifamiliar" },
  { value: "comercial", label: "Comercial / hotel" },
  { value: "mineria", label: "Minería" },
  { value: "infraestructura", label: "Infraestructura / obra pública" },
  { value: "expediente", label: "Expediente técnico / topografía" },
] as const;

export type ProjectType = (typeof projectTypes)[number]["value"];

export const rubros: { id: Rubro; label: string; lens: string }[] = [
  { id: "arquitectura", label: "Arquitectura", lens: "Vivienda de autor: diseño, interiores y acabados" },
  { id: "ingenieria", label: "Ingeniería", lens: "Puentes y estructuras, del replanteo a la obra" },
  { id: "mineria", label: "Minería", lens: "Bocaminas, socavones y redes de conducción" },
];

export const specialties: {
  id: Rubro;
  title: string;
  body: string;
  scope: string[];
  image: string;
  alt: string;
  projectType: ProjectType;
}[] = [
  {
    id: "arquitectura",
    title: "Arquitectura y Diseño",
    body: "Desarrollo integral de proyectos arquitectónicos para edificios, hoteles y locales comerciales, complementado con diseño especializado de interiores y exteriores.",
    scope: [
      "Proyectos de vivienda, edificios y hoteles",
      "Locales comerciales y de uso mixto",
      "Diseño de interiores y exteriores",
      "Acabados en drywall, melamine y termomuros",
    ],
    image: "/media/field/arquitectura-casa-piscina.jpg",
    alt: "Render de casa de campo con piscina diseñada por Vicuña Ingenieros",
    projectType: "vivienda",
  },
  {
    id: "ingenieria",
    title: "Ingeniería y Construcción",
    body: "Desarrollamos y supervisamos proyectos integrales para el sector público y privado, desde perfiles y expedientes técnicos hasta la ejecución de obras.",
    scope: [
      "Perfiles y expedientes técnicos",
      "Supervisión y ejecución de obras",
      "Mantenimiento y remodelaciones",
      "Movimiento de tierras y topografía de alta precisión",
    ],
    image: "/media/field/topografia-estacion-total.jpg",
    alt: "Ingeniero de Vicuña operando una estación total en campo",
    projectType: "infraestructura",
  },
  {
    id: "mineria",
    title: "Minería",
    body: "Soluciones integrales y de alta precisión para el sector minero, desde estudios topográficos con drones hasta la ejecución y supervisión de obras complejas.",
    scope: [
      "Estudios topográficos con drones",
      "Plantas industriales y carreteras",
      "Redes de conducción y distribución",
      "Movimiento de tierras e infraestructura de apoyo",
    ],
    image: "/media/field/mineria-supervision.jpg",
    alt: "Supervisor de Vicuña con chaleco de la empresa frente a una operación minera",
    projectType: "mineria",
  },
];

export const clients: { name: string; logo: string; width: number; height: number }[] = [
  { name: "Fondo Social Michiquillay", logo: "/media/clients/fondo-social-michiquillay.png", width: 269, height: 269 },
  { name: "Volcan", logo: "/media/clients/volcan.png", width: 400, height: 200 },
  { name: "Gobierno Regional Cajamarca", logo: "/media/clients/gobierno-regional-cajamarca.png", width: 667, height: 667 },
  { name: "Cúspide Copper", logo: "/media/clients/cuspide-copper.png", width: 248, height: 181 },
  { name: "EACE · EA Consulting Engineers", logo: "/media/clients/eace.png", width: 269, height: 269 },
  { name: "Generando Capacidades", logo: "/media/clients/generando-capacidades.png", width: 640, height: 360 },
  { name: "Arga Group", logo: "/media/clients/arga-group.png", width: 268, height: 184 },
  { name: "Regianz", logo: "/media/clients/regianz.png", width: 376, height: 157 },
  { name: "Fidamar", logo: "/media/clients/fidamar.png", width: 338, height: 51 },
];
