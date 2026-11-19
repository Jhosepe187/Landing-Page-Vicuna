import * as THREE from "three";

/* ------------------------------------------------------------------ */
/* Relieve andino procedural (CPU) — mismo valor para malla y objetos  */
/* ------------------------------------------------------------------ */
function hash(ix: number, iz: number) {
  let h = Math.imul(ix, 374761393) + Math.imul(iz, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h & 0xffff) / 0xffff;
}

function vnoise(x: number, z: number) {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const u = fx * fx * (3 - 2 * fx);
  const v = fz * fz * (3 - 2 * fz);
  const a = hash(ix, iz);
  const b = hash(ix + 1, iz);
  const c = hash(ix, iz + 1);
  const d = hash(ix + 1, iz + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, z: number, oct = 4) {
  let s = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < oct; i++) {
    s += vnoise(x * f, z * f) * a;
    f *= 2.03;
    a *= 0.5;
  }
  return s;
}

function ridged(x: number, z: number, oct = 5) {
  let s = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < oct; i++) {
    const n = 1 - Math.abs(vnoise(x * f, z * f) * 2 - 1);
    s += n * n * a;
    f *= 2.1;
    a *= 0.5;
  }
  return s;
}

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

function rawHeight(x: number, z: number) {
  const back = smoothstep(1.5, -13, z);
  const rolling = fbm(x * 0.16 + 3.1, z * 0.16 - 1.7, 4) - 0.5;
  const ridge = ridged(x * 0.085 + 10, z * 0.085 + 4, 5);
  return rolling * 1.15 + ridge * ridge * 6.2 * back + back * 1.4 - 0.15;
}

/** Plataforma de obra: el terreno se aplana alrededor de la pieza protagonista de cada rubro. */
export const SITE = { x: 6.4, z: -3.6, r: 3.6, fall: 1.8 };
let _padH: number | null = null;
export const padHeight = () => (_padH ??= rawHeight(SITE.x, SITE.z));

/** Altura del terreno en (x, z). Suave al frente, cordillera al fondo, plano en la plataforma. */
export function heightAt(x: number, z: number) {
  const h = rawHeight(x, z);
  const d = Math.hypot(x - SITE.x, z - SITE.z);
  const k = 1 - smoothstep(SITE.r, SITE.r + SITE.fall, d);
  return h + (padHeight() - h) * k;
}

export const TERRAIN = { width: 46, depth: 36, centerZ: -7, segX: 280, segZ: 220 };

export function makeTerrainGeometry() {
  const g = new THREE.PlaneGeometry(TERRAIN.width, TERRAIN.depth, TERRAIN.segX, TERRAIN.segZ);
  g.rotateX(-Math.PI / 2);
  g.translate(0, 0, TERRAIN.centerZ);
  const pos = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, heightAt(pos.getX(i), pos.getZ(i)));
  }
  pos.needsUpdate = true;
  g.computeBoundingSphere();
  return g;
}

/* ------------------------------------------------------------------ */
/* Uniforms compartidos: posición del lente y radio del recorte hex     */
/* ------------------------------------------------------------------ */
export const reveal = {
  uLens: { value: new THREE.Vector2(6.4, -3.6) },
  uRadius: { value: 3.4 },
  uEdge: { value: new THREE.Color("#a8d8ec") },
  uTime: { value: 0 },
  /** Giro del pedestal: el recorte hexagonal gira con la pieza. */
  uAngle: { value: 0 },
};

export function hexDistJS(x: number, z: number) {
  const ax = Math.abs(x);
  const az = Math.abs(z);
  return Math.max(az * 1.1547005, ax + az * 0.5773503);
}

/** Profundidad del tajo (minería) a una distancia hexagonal del centro del lente. */
export const pitDepth = (hd: number) => (1 - Math.min(Math.max(hd / reveal.uRadius.value, 0), 1)) * 1.5;

/** Distancia hexagonal (vértices sobre el eje X, como el hexágono de marca). */
export const HEX_GLSL = /* glsl */ `
float hexDist(vec2 p) {
  p = abs(p);
  return max(p.y * 1.1547005, p.x + p.y * 0.5773503);
}
float hexLocal(vec2 d, float a) {
  float c = cos(a);
  float s = sin(a);
  return hexDist(vec2(c * d.x - s * d.y, s * d.x + c * d.y));
}`;

/* ------------------------------------------------------------------ */
/* Material de obra: solo existe dentro del hexágono bajo el lente.    */
/* El corte se ve como un corte de sección arquitectónico (celeste).   */
/* ------------------------------------------------------------------ */
type RevealOpts = {
  grow?: { value: number };
  windows?: number;
  /** Listones verticales (madera). Valor = frecuencia por unidad. */
  stripes?: number;
  /** Aparejo de piedra. */
  stone?: boolean;
  /** Pulso de flujo que recorre la pieza (tuberías). */
  flow?: boolean;
};

export function revealMaterial(params: THREE.MeshStandardMaterialParameters, opts: RevealOpts = {}) {
  const grow = opts.grow ?? { value: 1 };
  const m = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, ...params });
  m.onBeforeCompile = (s) => {
    s.uniforms.uLens = reveal.uLens;
    s.uniforms.uRadius = reveal.uRadius;
    s.uniforms.uEdge = reveal.uEdge;
    s.uniforms.uAngle = reveal.uAngle;
    s.uniforms.uGrow = grow;
    s.uniforms.uWindows = { value: opts.windows ?? 0 };
    s.uniforms.uStripes = { value: opts.stripes ?? 0 };
    s.uniforms.uStone = { value: opts.stone ? 1 : 0 };
    s.uniforms.uFlow = { value: opts.flow ? 1 : 0 };
    s.uniforms.uTime = reveal.uTime;

    s.vertexShader = s.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uGrow;\nvarying vec3 vRW;\nvarying vec3 vRN;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\ntransformed.y *= max(uGrow, 0.0001);")
      .replace(
        "#include <project_vertex>",
        /* glsl */ `#include <project_vertex>
        vec4 rw = vec4(transformed, 1.0);
        vec3 rn = objectNormal;
        #ifdef USE_INSTANCING
          rw = instanceMatrix * rw;
          rn = mat3(instanceMatrix) * rn;
        #endif
        rw = modelMatrix * rw;
        vRW = rw.xyz;
        vRN = normalize(mat3(modelMatrix) * rn);`,
      );

    s.fragmentShader = s.fragmentShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
        uniform vec2 uLens;
        uniform float uRadius;
        uniform float uAngle;
        uniform vec3 uEdge;
        uniform float uWindows;
        uniform float uStripes;
        uniform float uStone;
        uniform float uFlow;
        uniform float uTime;
        varying vec3 vRW;
        varying vec3 vRN;
        ${HEX_GLSL}
        float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }`,
      )
      .replace(
        "void main() {",
        /* glsl */ `void main() {
        float hd = hexLocal(vRW.xz - uLens, uAngle);
        if (hd > uRadius) discard;`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        /* glsl */ `#include <emissivemap_fragment>
        float edge = 1.0 - smoothstep(0.0, 0.07, uRadius - hd);
        totalEmissiveRadiance += uEdge * edge * 1.6;
        if (!gl_FrontFacing) {
          diffuseColor.rgb *= 0.25;
          totalEmissiveRadiance += uEdge * 0.35;
        }
        float uFace = abs(vRN.x) > 0.5 ? vRW.z : vRW.x;
        float vertFace = 1.0 - step(0.5, abs(vRN.y));
        if (uStripes > 0.0) {
          float st = smoothstep(0.35, 0.5, abs(fract(uFace * uStripes) - 0.5));
          diffuseColor.rgb *= mix(1.0, 0.68, st * vertFace);
        }
        if (uStone > 0.0) {
          vec2 b = vec2(uFace * 9.0, vRW.y * 16.0);
          b.x += step(1.0, mod(floor(b.y), 2.0)) * 0.5;
          vec2 fb = fract(b);
          float mortar = step(0.07, fb.x) * step(0.1, fb.y);
          float nb = h21(floor(b));
          diffuseColor.rgb *= mix(0.55, 0.78 + 0.32 * nb, mortar);
        }
        if (uFlow > 0.0) {
          float band = smoothstep(0.82, 1.0, fract(dot(vRW.xz, vec2(0.7, 0.7)) * 0.9 - uTime * 0.7));
          totalEmissiveRadiance += uEdge * band * 1.6;
        }
        if (uWindows > 0.0) {
          float vert = 1.0 - step(0.5, abs(vRN.y));
          float u = abs(vRN.x) > 0.5 ? vRW.z : vRW.x;
          vec2 g = vec2(u * 7.0, vRW.y * 6.0);
          vec2 f = fract(g);
          float win = step(0.3, f.x) * step(f.x, 0.74) * step(0.32, f.y) * step(f.y, 0.78);
          float lit = step(0.45, h21(floor(g) + floor(vRW.xz * 0.7) * 3.1));
          totalEmissiveRadiance += vec3(1.0, 0.72, 0.4) * win * lit * vert * uWindows * 1.5;
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.08, 0.16, 0.2), win * (1.0 - lit) * vert * 0.8);
        }`,
      );
  };
  return m;
}

/** Material de profundidad para sombras: respeta el recorte hexagonal. */
let _depth: THREE.MeshDepthMaterial | null = null;
export function revealDepthMaterial() {
  if (_depth) return _depth;
  const m = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  m.onBeforeCompile = (s) => {
    s.uniforms.uLens = reveal.uLens;
    s.uniforms.uRadius = reveal.uRadius;
    s.uniforms.uAngle = reveal.uAngle;
    s.vertexShader = s.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vRW;").replace(
      "#include <project_vertex>",
      `#include <project_vertex>
      vec4 rw = vec4(transformed, 1.0);
      #ifdef USE_INSTANCING
        rw = instanceMatrix * rw;
      #endif
      vRW = (modelMatrix * rw).xyz;`,
    );
    s.fragmentShader = s.fragmentShader
      .replace("#include <common>", `#include <common>\nuniform vec2 uLens;\nuniform float uRadius;\nuniform float uAngle;\nvarying vec3 vRW;\n${HEX_GLSL}`)
      .replace("void main() {", "void main() {\n  if (hexLocal(vRW.xz - uLens, uAngle) > uRadius) discard;");
  };
  _depth = m;
  return m;
}

/* ------------------------------------------------------------------ */
/* Terreno: curvas de nivel celeste sobre petróleo; dentro del lente,  */
/* suelo sólido iluminado, grilla de replanteo o bancos de tajo.       */
/* ------------------------------------------------------------------ */
export const terrainUniforms = {
  uLens: reveal.uLens,
  uRadius: { value: -1 },
  uEdge: reveal.uEdge,
  uTerrace: { value: 0 },
  uGrid: { value: 0 },
  uIntro: { value: 0 },
  uBase: { value: new THREE.Color("#012633") },
  uBaseLit: { value: new THREE.Color("#0d4a5e") },
  uLine: { value: new THREE.Color("#78b0c8") },
  uInsideDark: { value: new THREE.Color("#1d3f4c") },
  uInsideLit: { value: new THREE.Color("#7896a2") },
  uWarm: { value: new THREE.Color("#ffcf8a") },
  uEarthDark: { value: new THREE.Color("#4a4238") },
  uEarthLit: { value: new THREE.Color("#a99782") },
  uFogColor: { value: new THREE.Color("#003647") },
  uFogNear: { value: 11 },
  uFogFar: { value: 30 },
};

export const terrainVertex = /* glsl */ `
uniform vec2 uLens;
uniform float uRadius;
uniform float uTerrace;
varying float vH;
varying vec3 vW;
varying float vDepth;
${HEX_GLSL}
void main() {
  vec3 p = position;
  float hd = hexDist(p.xz - uLens);
  float inside = 1.0 - smoothstep(uRadius - 0.04, uRadius + 0.04, hd);
  float depth = (1.0 - clamp(hd / uRadius, 0.0, 1.0)) * 1.5;
  float bench = floor((p.y - depth) / 0.26) * 0.26;
  p.y = mix(p.y, bench, uTerrace * inside);
  vH = p.y;
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vW = wp.xyz;
  vec4 mv = viewMatrix * wp;
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}`;

export const terrainFragment = /* glsl */ `
uniform vec2 uLens;
uniform float uRadius;
uniform vec3 uEdge;
uniform float uTerrace;
uniform float uGrid;
uniform float uIntro;
uniform vec3 uBase;
uniform vec3 uBaseLit;
uniform vec3 uLine;
uniform vec3 uInsideDark;
uniform vec3 uInsideLit;
uniform vec3 uWarm;
uniform vec3 uEarthDark;
uniform vec3 uEarthLit;
uniform vec3 uFogColor;
uniform float uFogNear;
uniform float uFogFar;
varying float vH;
varying vec3 vW;
varying float vDepth;
${HEX_GLSL}
void main() {
  vec3 n = normalize(cross(dFdx(vW), dFdy(vW)));
  vec3 L = normalize(vec3(-0.55, 0.62, 0.35));
  float diff = clamp(dot(n, L), 0.0, 1.0);

  float hd = hexDist(vW.xz - uLens);
  float inside = 1.0 - smoothstep(uRadius - 0.025, uRadius + 0.025, hd);

  // Curvas de nivel cada 0.16 u; cada quinta es curva maestra.
  float c = vH / 0.16;
  float w = max(fwidth(c), 1e-4);
  float f = fract(c);
  float dl = min(f, 1.0 - f) / w;
  float idx = floor(c + 0.5);
  float major = 1.0 - step(0.5, abs(mod(idx, 5.0)));
  float lw = mix(0.5, 1.1, major);
  float line = 1.0 - smoothstep(lw - 0.6, lw + 0.6, dl);
  float sweep = 1.0 - smoothstep(uIntro * 34.0 - 5.0, uIntro * 34.0, vDepth);
  line *= sweep;

  vec3 outside = mix(uBase, uBaseLit, diff * 0.6);
  outside += uLine * line * mix(0.38, 0.8, major);

  vec3 ins = mix(mix(uInsideDark, uEarthDark, uTerrace), mix(uInsideLit, uEarthLit, uTerrace), diff);
  ins += uWarm * pow(diff, 3.0) * 0.22;
  ins *= 1.0 + 0.22 * (1.0 - clamp(hd / uRadius, 0.0, 1.0));
  ins += uLine * line * 0.16;
  // Grilla de replanteo (ingeniería): cada 0.5 u.
  vec2 gc = vW.xz * 2.0;
  vec2 gd = abs(fract(gc - 0.5) - 0.5) / (fwidth(gc) + 1e-4);
  float grid = 1.0 - min(min(gd.x, gd.y), 1.0);
  ins = mix(ins, uLine, grid * uGrid * 0.45);
  // Bancos de tajo (minería): taludes más oscuros.
  float slope = smoothstep(0.55, 0.9, 1.0 - n.y);
  ins = mix(ins, uInsideDark * 0.6, slope * uTerrace * 0.7);

  vec3 col = mix(outside, ins, inside);
  float ring = 1.0 - smoothstep(0.0, 0.045, abs(hd - uRadius));
  col += uEdge * ring * 1.1 * sweep;

  float fog = smoothstep(uFogNear, uFogFar, vDepth);
  col = mix(col, uFogColor, fog);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}`;
