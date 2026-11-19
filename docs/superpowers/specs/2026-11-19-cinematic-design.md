# Sitio "cinemático" inspirado en el video de referencia

Fecha: 2026-11-19 · Estado: aprobado por el usuario (paleta mixta, alcance completo).

## Intención
El usuario quiere que el hero y la página tengan las mismas animaciones y transiciones de un video de referencia
(sitio inmobiliario "cinemático" guiado por scroll). Se replican los efectos y la estructura, no la marca ni los textos.

## Mapeo aprobado
| Video | Vicuña |
|---|---|
| Hero: cielo con nubes, titular, edificio recortado subiendo, nubes delante | Cielo andino con nubes y cordillera en capas; "Construyendo sueños…"; pieza 3D del rubro subiendo entre nubes; selector de rubro se mantiene |
| Scroll del hero: el edificio crece, el titular se va, logo gigante con foto dentro de las letras | "VICUÑA" gigante con foto de obra dentro de las letras (`background-clip:text`) + "Ingenieros & Arquitectos" |
| Frase que se enciende palabra por palabra + fotos en forma de chevron entrando en secuencia | Frase del manifiesto palabra por palabra + fotos en hexágonos de marca entrando en secuencia |
| Fotos con parallax | Nosotros ya tiene parallax e inclinación: se conserva |
| Servicios oscuros: filas a todo ancho con palabra enorme, foto y flecha, apilándose | Arquitectura / Ingeniería / Minería como filas apiladas (sticky) con foto, número, descripción, flecha y "Ver más del rubro" (telón hexagonal) |
| Tarjetas + footer con foto grande | Proyectos se conserva; footer con banda de foto de campo |

## Paleta
Mixta como el video: hero y manifiesto claros (cielo, blanco/humo); rubros y footer en petróleo oscuro.

## Restricciones
- `prefers-reduced-motion`: sin pin ni desplazamientos ligados al scroll; contenido visible estático.
- Escritorio ≥ 1024 px: hero fijado (pin GSAP) durante el recorrido. Móvil: secuencia simplificada sin pin.
- Sin dependencias nuevas (motion, GSAP ScrollTrigger y Lenis ya están).
