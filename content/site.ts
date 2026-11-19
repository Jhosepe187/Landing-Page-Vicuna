export const site = {
  name: "Vicuna Ingenieros",
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
  { id: "nosotros", label: "Nosotros" },
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

/** Pieza 3D de cada rubro (renders exportados de Canva, recortados y optimizados a WebP). */
export type Model3D = {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** Cómo se apoya la pieza en el panel: "ground" se asienta en el borde inferior, "float" flota. */
  stance: "ground" | "float";
};

export type SpecialtyDetail = {
  /** Texto largo del brochure (p. 05–07). */
  intro: string[];
  services: { title: string; text: string }[];
  /** Proyectos del portafolio (ids de content/projects.ts) que ilustran el rubro. */
  projectIds: string[];
  /** Fotos de campo adicionales cuando el rubro no tiene proyectos en el portafolio. */
  gallery?: { src: string; alt: string; caption: string }[];
};

export const specialties: {
  id: Rubro;
  title: string;
  body: string;
  scope: string[];
  image: string;
  alt: string;
  projectType: ProjectType;
  model: Model3D;
  detail: SpecialtyDetail;
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
    alt: "Render de casa de campo con piscina diseñada por Vicuna Ingenieros",
    projectType: "vivienda",
    model: { src: "/media/3d/edificio.webp", width: 653, height: 1041, alt: "Edificio residencial en 3D", stance: "ground" },
    detail: {
      intro: [
        "Desarrollo integral de proyectos arquitectónicos para edificios, hoteles y locales comerciales, complementado con diseño especializado de interiores y exteriores.",
        "Además ejecutamos acabados de alta calidad en drywall, melamine y termomuros: acompañamos el proyecto desde la idea y el expediente hasta la entrega de obra.",
      ],
      services: [
        { title: "Proyectos arquitectónicos", text: "Viviendas, edificios multifamiliares, hoteles y locales comerciales, de la idea al expediente." },
        { title: "Diseño de interiores", text: "Distribución, mobiliario y acabados pensados para el uso real de cada ambiente." },
        { title: "Diseño de exteriores", text: "Fachadas, terrazas, piscinas y paisajismo que dan carácter al proyecto." },
        { title: "Drywall", text: "Tabiquería, cielos rasos y soluciones livianas de rápida ejecución." },
        { title: "Melamine", text: "Carpintería a medida: closets, cocinas y muebles empotrados." },
        { title: "Termomuros", text: "Muros térmicos para confort y eficiencia en climas fríos." },
      ],
      projectIds: [
        "casa-campo-la-molina",
        "edificio-pimentel",
        "edificio-trujillo",
        "multifamiliar-banos-del-inca",
        "unifamiliar-chiclayo",
        "unifamiliar-huaraclla",
      ],
    },
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
    alt: "Ingeniero de Vicuna operando una estación total en campo",
    projectType: "infraestructura",
    model: { src: "/media/3d/dron.webp", width: 1013, height: 604, alt: "Dron de levantamiento topográfico en 3D", stance: "float" },
    detail: {
      intro: [
        "Desarrollamos y supervisamos proyectos integrales para el sector público y privado, abarcando desde perfiles y expedientes técnicos hasta la ejecución de obras.",
        "Asimismo, brindamos servicios especializados en mantenimiento, remodelaciones, movimiento de tierras y topografía de alta precisión, con experiencia en edificación, infraestructura, saneamiento, educación y salud.",
      ],
      services: [
        { title: "Perfiles y expedientes técnicos", text: "Estudios de preinversión e ingeniería de detalle bajo la normativa vigente." },
        { title: "Ejecución de obras", text: "Edificación, saneamiento, educación y salud, cumpliendo plazos y presupuesto." },
        { title: "Supervisión de obras", text: "Control técnico, de calidad y de seguridad en cada etapa del proyecto." },
        { title: "Mantenimiento y remodelaciones", text: "Puesta en valor y adecuación de infraestructura existente." },
        { title: "Movimiento de tierras", text: "Cortes, rellenos, nivelación y plataformas." },
        { title: "Topografía de alta precisión", text: "Levantamientos con estación total, GNSS y drones." },
      ],
      projectIds: ["comercial-lurin", "estudios-ie-yanamango", "topografia-linea-agua", "estudios-ingenieria-detalle"],
    },
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
    alt: "Supervisor de Vicuna con chaleco de la empresa frente a una operación minera",
    projectType: "mineria",
    model: { src: "/media/3d/camion.webp", width: 1100, height: 666, alt: "Camión minero en 3D", stance: "ground" },
    detail: {
      intro: [
        "Brindamos soluciones integrales y de alta precisión para el sector minero, abarcando desde estudios topográficos con drones hasta la ejecución y supervisión de obras complejas.",
        "Desarrollamos proyectos multidisciplinarios a gran escala, como plantas industriales, carreteras, redes de conducción y distribución, movimiento de tierras e infraestructura de apoyo, garantizando siempre el máximo rigor técnico, seguridad y eficiencia operativa.",
      ],
      services: [
        { title: "Topografía con drones", text: "Fotogrametría y levantamientos de alta precisión en zonas de difícil acceso." },
        { title: "Ejecución y supervisión", text: "Obras complejas con máximo rigor técnico y de seguridad." },
        { title: "Plantas industriales", text: "Proyectos multidisciplinarios a gran escala." },
        { title: "Carreteras y accesos", text: "Vías para la operación y la logística minera." },
        { title: "Redes de conducción y distribución", text: "Sistemas de conducción de agua y fluidos." },
        { title: "Movimiento de tierras e infraestructura de apoyo", text: "Plataformas, accesos e instalaciones auxiliares." },
      ],
      projectIds: ["topografia-linea-agua", "estudios-ingenieria-detalle"],
      gallery: [
        { src: "/media/field/mineria-supervision.jpg", alt: "Supervisor de Vicuna frente a una operación minera", caption: "Supervisión en operación minera" },
        { src: "/media/field/maquinaria-movimiento-tierras.jpg", alt: "Retroexcavadora en movimiento de tierras", caption: "Movimiento de tierras" },
        { src: "/media/field/topografia-gnss-andes.jpg", alt: "Topógrafos con equipo GNSS en los Andes", caption: "Topografía GNSS en altura" },
        { src: "/media/field/ingeniero-paisaje-andino.jpg", alt: "Profesional de Vicuna frente a la cordillera", caption: "Equipo en campo" },
      ],
    },
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

/* Misión, visión y propósito: textos literales del Brochure 2027 (p. 02–03). */
export type PillarId = "mision" | "vision" | "proposito";

export const about: {
  intro: string;
  pillars: {
    id: PillarId;
    label: string;
    lead: string;
    text: { t: string; hl?: boolean }[];
    image: string;
    alt: string;
    tag: string;
  }[];
} = {
  intro:
    "Somos una empresa consultora y ejecutora especializada en ingeniería, arquitectura y gestión de obras. Brindamos servicios integrales, desde estudios y expedientes técnicos hasta la supervisión y ejecución de proyectos, con calidad, cumplimiento normativo y eficiencia.",
  pillars: [
    {
      id: "mision",
      label: "Misión",
      lead: "Nuestra misión:",
      text: [
        { t: "Ofrecer soluciones integrales en arquitectura, ingeniería y construcción con " },
        { t: "excelencia técnica", hl: true },
        { t: ", cumpliendo plazos y normativas para el sector " },
        { t: "público y privado.", hl: true },
      ],
      image: "/media/field/topografia-estacion-total.jpg",
      alt: "Ingeniero de Vicuna operando una estación total en campo",
      tag: "Excelencia técnica",
    },
    {
      id: "vision",
      label: "Visión",
      lead: "Nuestra visión:",
      text: [
        { t: "Ser la empresa consultora " },
        { t: "líder a nivel nacional", hl: true },
        { t: ", reconocida por su alta confiabilidad y como " },
        { t: "aliada estratégica", hl: true },
        { t: " en grandes proyectos." },
      ],
      image: "/media/field/ingeniero-paisaje-andino.jpg",
      alt: "Profesional de Vicuna con chaleco de la empresa frente a la cordillera",
      tag: "Equipo en campo",
    },
    {
      id: "proposito",
      label: "Propósito",
      lead: "Nuestro propósito:",
      text: [
        { t: "Ejecutar " },
        { t: "obras seguras y funcionales", hl: true },
        { t: " con un equipo multidisciplinario, impulsando el " },
        { t: "desarrollo sostenible", hl: true },
        { t: " y la confianza de nuestros clientes." },
      ],
      image: "/media/field/obra-terminada-nave.jpg",
      alt: "Nave comercial terminada con mezzanine vidriado",
      tag: "Obra terminada",
    },
  ],
};
