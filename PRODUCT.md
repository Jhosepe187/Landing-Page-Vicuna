# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) + TypeScript, Tailwind CSS, Framer Motion, Three.js vía React Three Fiber (+ drei), Lenis para smooth scroll. Elegido por el usuario en el brief inicial. Deploy: sin definir (Vercel es el destino natural de Next.js; pendiente de confirmar).

## Users

- **Primario — privados e inmobiliarias:** desarrolladores inmobiliarios y propietarios que van a construir vivienda unifamiliar o multifamiliar, edificios residenciales, hoteles o locales comerciales en el norte del Perú y Lima (Cajamarca, Chiclayo, Trujillo, Jaén, Lima). Llegan evaluando a quién confiarle el diseño y la ejecución de su obra; necesitan ver obra real, sentir solvencia técnica y poder pedir una propuesta sin fricción.
- **Secundario — mineras y contratistas:** gerentes de proyecto y compras que buscan topografía con drones, plantas industriales, carreteras, redes de conducción y movimiento de tierras.
- **Secundario — sector público:** gobiernos regionales y fondos sociales que contratan perfiles, expedientes técnicos, supervisión y ejecución de obra pública.

## Product Purpose

Vicuña Ingenieros es una consultora y ejecutora de ingeniería, arquitectura y gestión de obras ("Consultoría & Construcción"). Brinda servicios integrales: desde estudios, levantamiento topográfico y expedientes técnicos hasta la supervisión y ejecución de obras, para el sector público y privado. La landing existe para convertir visitantes calificados en solicitudes de propuesta. Éxito = formulario "Solicitar propuesta" enviado con tipo de proyecto y ubicación.

## Positioning

Una sola empresa que cubre el ciclo completo de la obra —del levantamiento topográfico (incluido drone) y el expediente técnico hasta el diseño arquitectónico, los acabados y la ejecución— con presencia operativa en Cajamarca y Lima, y experiencia simultánea en minería de altura, obra pública y arquitectura residencial/comercial.

## Operating Context

- Visitantes que llegan desde redes (Facebook/Instagram "vicunaingenieros"), recomendación o búsqueda; mezcla de escritorio en oficina y móvil.
- La conversación comercial sigue por correo (gerencia@ / proyectos@vicunaingenieros.com) o teléfono/WhatsApp 952 958 549.
- Oficinas: Jr. Juan Villanueva N° 315 – Cajamarca · Av. Del Río N° 486 – Pueblo Libre – Lima.

## Capabilities and Constraints

- **Ingeniería y Construcción:** perfiles y expedientes técnicos, supervisión, ejecución de obras, mantenimiento, remodelaciones, movimiento de tierras, topografía de alta precisión.
- **Arquitectura y Diseño:** proyectos arquitectónicos de edificios, hoteles y locales comerciales; diseño de interiores y exteriores; acabados en drywall, melamine y termomuros.
- **Minería:** estudios topográficos con drones, ejecución y supervisión de obras complejas, plantas industriales, carreteras, redes de conducción y distribución, movimiento de tierras, infraestructura de apoyo.
- Formulario de contacto funcional (backend de envío por definir; por defecto route handler de Next.js).
- **Sin definir:** dominio final (el brochure escribe "vicunaingerieros.com", la guía "vicunaingenieros.com" — confirmar), destino del correo del formulario, proveedor de envío, analítica.

## Brand Commitments

Fuente: `Guia_de_Estilos_Vicuna_Ingenieros.pdf` v1.0 (2027). Vinculante:

- Nombre: **Vicuña Ingenieros**, descriptor "Consultoría & Construcción". Lema: "Construyendo sueños, transformando realidades".
- Logotipo: "V" con silueta de vicuña + wordmark geométrico extendido; "U" y "N" con acento celeste. No redibujar, deformar, rotar, recolorear ni aplicar sombras/efectos. Zona de seguridad = altura de la "V". Mínimo digital 100 px.
  - **Excepción autorizada por el usuario (2026-11-18):** el símbolo "V" puede vectorizarse y extruirse en 3D para el preloader; el wordmark se mantiene plano y sin efectos.
- Paleta: Azul Petróleo #003647, Azul Vicuña #007296, Azul Pizarra #386070, Celeste Andino #78B0C8, Blanco Humo #F8F8F8, Gris Carbón #2E3135 (texto), Blanco #FFFFFF. Nunca texto blanco sobre Celeste.
- Tipografía: Anton (titulares, siempre MAYÚSCULAS), Montserrat 400/600/700 (cuerpo, subtítulos, botones). Máximo 2 pesos por pantalla.
- Lenguaje gráfico: hexágono con vértices a izquierda y derecha (sin esquinas redondeadas) y planos diagonales; sin degradados multicolor.
- Fotografía: personas reales con EPP, equipos topográficos, maquinaria, obra terminada, paisaje andino; velo diagonal Azul Petróleo ≈85 %→0 % bajo texto.
- Componentes: botones píldora, tarjetas con radio ≈12 px, espaciado base 8 px.
- Estética pedida por el usuario para la web: 3D con material Liquid Glass (glass translúcido, biseles, refracción), smooth scroll y microinteracciones.

## Evidence on Hand

- `BROCHURE VICUNA 2027.pdf`: ~50 fotos embebidas (600–1400 px de ancho; por debajo del mínimo de 1600 px que pide la guía — usar en tamaños contenidos o pedir originales), renders de 12 proyectos de arquitectura, 3 de topografía/estudios, 9 logos de clientes con transparencia, logo raster 480×152 (no hay vector).
- Proyectos con nombre: Casa de campo La Molina – Lima; Vivienda multifamiliar Baños del Inca; Vivienda unifamiliar Chiclayo; Vivienda unifamiliar Huaraclla; Vivienda multifamiliar Centro Histórico Cajamarca; Edificio residencial Trujillo; Edificio residencial Pimentel – Chiclayo; Vista en planta departamento Santa Rosa; Vivienda unifamiliar Cerrillo – Cajamarca; Local comercial y vivienda – Cajamarca; Vivienda unifamiliar Jaén; Local comercial Lurín – Lima; Levantamiento topográfico para línea de distribución de agua; Estudios preliminares para ingeniería de detalle; Estudios preliminares I.E. N°82065 Yanamango.
- Clientes: Fondo Social Michiquillay, Generando Capacidades (GC), Gobierno Regional Cajamarca, EACE (EA Consulting Engineers), Regianz, Cúspide Copper, Volcan, Arga Group, Fidamar.
- **No existen:** cifras (años, m², número de obras), testimonios, certificaciones ni premios. No inventarlos.

## Product Principles

1. Mostrar obra real antes que adjetivos: cada afirmación se respalda con un proyecto, foto de campo o cliente.
2. Del terreno a la obra: el ciclo completo (topografía → expediente → diseño → ejecución) es la diferencia; la página debe hacerlo visible.
3. Solvencia técnica con cercanía: confiable y precisa, pero hablando en el lenguaje del propietario, no del pliego.
4. La marca manda: la guía de estilos es ley; la estética glass/3D se expresa en los colores, tipos y formas de Vicuña.
5. Pedir propuesta debe ser siempre a un gesto de distancia.

## Accessibility & Inclusion

WCAG 2.2 AA (la guía ya define combinaciones AA/AAA). `prefers-reduced-motion` desactiva smooth scroll, preloader 3D largo y parallax; el contenido debe funcionar sin WebGL.
