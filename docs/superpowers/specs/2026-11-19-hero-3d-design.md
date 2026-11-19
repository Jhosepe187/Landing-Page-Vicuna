# Piezas 3D en el hero, transición a rubros e interactividad

Fecha: 2026-11-19 · Estado: aprobado por el usuario en conversación.

## Intención
El selector de rubro del hero (Arquitectura / Ingeniería / Minería) ya cambia la foto. El cliente quiere que ahí
aparezcan las piezas 3D de cada rubro (edificio, dron, camión) para impresionar a Vicuña en la presentación, y que la
página se sienta más interactiva.

## Objetivos
- Hero: foto del rubro de fondo (más oscura y algo desenfocada) + pieza 3D flotando delante, que cambia con el selector.
  Paralaje mayor que la foto (se lee delante). Clic en la pieza → página del rubro.
- Quitar la caja "Mueve el cursor sobre la imagen…" bajo el selector.
- Especialidades: los paneles vuelven a la foto con hexágono original; conservan "Ver más del rubro".
- Al entrar a un rubro: un hexágono de marca crece desde el botón hasta cubrir la pantalla; luego la página de detalle
  entra por capas (pieza 3D sube, texto en cascada).
- Página de detalle: la pieza 3D se desplaza/escala con el scroll; tarjetas de servicio con brillo que sigue el
  cursor; números que aparecen en secuencia al bajar.

## No objetivos
- Modelos 3D reales (Three.js) de las piezas: se usan los renders PNG/WebP exportados de Canva.
- Cambiar textos, colores o estructura de otras secciones.

## Anti-objetivos
- Animaciones que tapen texto o botones, o que se repitan al punto de cansar.
- Ignorar "reducir movimiento" del sistema.

## Enfoques
- **A (elegido):** foto oscurecida de fondo + pieza 3D delante. Mantiene contexto real del rubro y da profundidad.
- B: solo la pieza sobre el azul de marca. Descartado: el hero queda vacío.

## Decisiones del constructor (mías)
- Transición: overlay global con `clip-path` hexagonal (motion), navegación con `router.push` al cubrir la pantalla,
  y se retira al montar la página de detalle.
- Pieza del hero: misma `Model3D` de `content/site.ts`; entrada `opacity + y + scale(0.94) + blur`, salida rápida.
- Móvil: la pieza se ve sobre la foto en la parte superior; sin efectos de cursor.
