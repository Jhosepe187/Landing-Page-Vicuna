---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: []
---

# Landing Vicuña Ingenieros — `/`

## Scope
Mode: Persuade. Página única (home). Audiencia primaria: privados e inmobiliarias; secundarias: minería y sector público. Acción: "Solicitar propuesta" (formulario). Prueba: 15 proyectos reales del brochure 2027, fotos de campo, 9 clientes. Restricciones: guía de estilos v1.0 (ver PRODUCT.md), sin cifras ni testimonios inventados, WebGL con fallback, reduced-motion.

## Direction contract
THESIS: "Del terreno a la obra". El hero no es un fondo decorativo: un lente hexagonal de vidrio recorre un relieve andino topográfico y, bajo el lente, el terreno se transforma en obra (terrazas mineras → trazo de ingeniería → volumen arquitectónico). Rechaza el hero de categoría: foto de casco + titular centrado + tres iconos de servicios.
OWN-WORLD: Azul Petróleo como suelo dominante del hero y del cierre, Blanco Humo en las secciones de lectura; vidrio esmerilado teñido de petróleo/celeste con bisel de luz celeste; hexágono de vértices laterales como lente, marco de foto y forma del cursor; planos diagonales que cortan secciones; Anton mayúsculas para titulares, Montserrat para todo lo demás; curvas de nivel celeste a 1px como textura única.
STORY: El propietario entiende en un vistazo que Vicuña lleva su proyecto desde el levantamiento del terreno hasta la obra terminada, lo cree al ver casas y edificios reales en el carrusel y el respaldo de mineras y gobiernos, y pide propuesta.
FIRST VIEWPORT: Canvas R3F a sangre completa: relieve topográfico en wireframe celeste sobre petróleo, cámara oblicua. Lente hexagonal de vidrio (≈28vw) sigue el cursor con inercia; dentro, la obra. Izquierda-abajo: titular Anton "CONSTRUYENDO SUEÑOS, TRANSFORMANDO REALIDADES" (clamp 56–112px), una línea de valor en Montserrat, botón píldora Azul Vicuña "SOLICITAR PROPUESTA" + secundario "VER PROYECTOS". Derecha-abajo: selector de vidrio Arquitectura · Ingeniería · Minería que fija el estado del lente; Arquitectura va primero porque es el estado por defecto y el rubro de la audiencia primaria (privados e inmobiliarias). Navbar flotante de vidrio arriba.
FORM: Liquid Glass sobre el sistema de marca Vicuña (hexágono + diagonal), posición 1 de 1. seed: none (pinned) — "Estilo: 3D con estética Liquid Glass (Glassmorphism avanzado, biseles translúcidos, blur sutil y refracción)" + guía de estilos Vicuña v1.0 + estructura de 5 secciones fijada por el usuario.
SIGNATURE INTERACTION: el lente hexagonal (hero) que revela la obra bajo el terreno; su forma reaparece como cursor sobre el carrusel y como máscara de las tarjetas de rubros.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
- Dominio definitivo y destino/proveedor del correo del formulario.
- Fotos originales ≥1600 px (las del PDF son 600–1400 px).
- Build path: code-led (no hay generación de imágenes en esta sesión).
