"use client";

import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { useMemo, useRef, type ReactNode } from "react";
import { revealDepthMaterial, revealMaterial } from "./terrain";

/* ================================================================== */
/* Estado compartido de transición (lo escribe el Director)            */
/* ================================================================== */
export const mix = { arquitectura: 0, ingenieria: 0, mineria: 0 };
type Key = keyof typeof mix;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
/** Progreso escalonado: la pieza entra después de `delay` (0..1). */
const staged = (p: number, delay: number, span = 0.5) => clamp01((p * (1 + span) - delay) / span);

/** Giro de reposo del pedestal: la pieza mira hacia la cámara (frente-izquierda). */
export const FACE_CAMERA = -0.42;
/** Altura del pedestal hexagonal de vidrio sobre el que se apoya cada pieza. */
export const PEDESTAL_H = 0.32;

/* ================================================================== */
/* Materiales (todos con recorte hexagonal)                            */
/* ================================================================== */
type MatKey =
  | "white"
  | "plaster"
  | "concrete"
  | "dark"
  | "graphite"
  | "wood"
  | "stone"
  | "glassLit"
  | "glassDark"
  | "pool"
  | "water"
  | "green"
  | "lawn"
  | "asphalt"
  | "paint"
  | "yellow"
  | "orange"
  | "red"
  | "steel"
  | "rock"
  | "ore"
  | "void"
  | "pipe"
  | "rust"
  | "skin"
  | "lamp";

let _mats: Record<MatKey, THREE.MeshStandardMaterial> | null = null;
export function mats() {
  if (_mats) return _mats;
  _mats = {
    white: revealMaterial({ color: "#f3f3ef", roughness: 0.5 }),
    plaster: revealMaterial({ color: "#e7e2d8", roughness: 0.7 }),
    concrete: revealMaterial({ color: "#b9bdbd", roughness: 0.85 }),
    dark: revealMaterial({ color: "#3b454a", roughness: 0.6 }),
    graphite: revealMaterial({ color: "#232b2f", roughness: 0.45, metalness: 0.25 }),
    wood: revealMaterial({ color: "#a8703f", roughness: 0.65 }, { stripes: 22 }),
    stone: revealMaterial({ color: "#a39b8f", roughness: 0.9 }, { stone: true }),
    glassLit: revealMaterial({ color: "#ffe6c2", emissive: "#ffb563", emissiveIntensity: 1.6, roughness: 0.15 }),
    glassDark: revealMaterial({ color: "#1b2930", roughness: 0.05, metalness: 0.6 }),
    pool: revealMaterial({ color: "#5fb7d6", emissive: "#1f87ad", emissiveIntensity: 0.7, roughness: 0.04 }),
    water: revealMaterial({ color: "#3d8fae", emissive: "#0f5f7c", emissiveIntensity: 0.6, roughness: 0.1, metalness: 0.2 }),
    green: revealMaterial({ color: "#4e7f56", roughness: 0.85 }),
    lawn: revealMaterial({ color: "#5e8a4f", roughness: 0.95 }),
    asphalt: revealMaterial({ color: "#232d33", roughness: 0.95 }),
    paint: revealMaterial({ color: "#ffffff", emissive: "#ffffff", emissiveIntensity: 0.4 }),
    yellow: revealMaterial({ color: "#e6ab2c", roughness: 0.45, metalness: 0.15 }),
    orange: revealMaterial({ color: "#ef7b2f", roughness: 0.55, emissive: "#5a2408", emissiveIntensity: 0.25 }),
    red: revealMaterial({ color: "#d4392d", roughness: 0.5, emissive: "#3a0805", emissiveIntensity: 0.3 }),
    steel: revealMaterial({ color: "#dfe6e9", roughness: 0.3, metalness: 0.65 }),
    rock: revealMaterial({ color: "#7a7268", roughness: 0.95 }, { stone: true }),
    ore: revealMaterial({ color: "#55524d", roughness: 0.9 }),
    void: revealMaterial({ color: "#0a0f12", roughness: 1 }),
    pipe: revealMaterial({ color: "#93c7da", roughness: 0.28, metalness: 0.65 }, { flow: true }),
    rust: revealMaterial({ color: "#8f5c37", roughness: 0.7, metalness: 0.25 }),
    skin: revealMaterial({ color: "#c08a64", roughness: 0.8 }),
    lamp: revealMaterial({ color: "#fff4dc", emissive: "#ffd79a", emissiveIntensity: 3, roughness: 0.2 }),
  };
  return _mats;
}

/* ================================================================== */
/* Modelado procedural: piezas redondeadas → geometría por material    */
/* ================================================================== */
type Part = [MatKey, THREE.BufferGeometry];
type Model = Partial<Record<MatKey, THREE.BufferGeometry>>;
type V3 = THREE.Vector3;

/** Caja con aristas redondeadas (más real que una caja dura). */
const rb = (w: number, h: number, d: number, x: number, y: number, z: number, r = 0.025, ry = 0) => {
  const rr = Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
  const g = new RoundedBoxGeometry(w, h, d, 2, Math.max(0.001, rr));
  if (ry) g.rotateY(ry);
  return g.translate(x, y, z);
};
const cyl = (rt: number, rb_: number, h: number, x: number, y: number, z: number, seg = 18) =>
  new THREE.CylinderGeometry(rt, rb_, h, seg).translate(x, y, z);
const sph = (r: number, x: number, y: number, z: number, seg = 14) =>
  new THREE.SphereGeometry(r, seg, Math.max(8, seg - 4)).translate(x, y, z);
const rock = (r: number, x: number, y: number, z: number, sx = 1, sy = 1, sz = 1, detail = 2) =>
  new THREE.IcosahedronGeometry(r, detail).scale(sx, sy, sz).translate(x, y, z);
/** Cilindro entre dos puntos (cables, tirantes, puntales). */
const strut = (a: V3, b: V3, r: number, seg = 8) => {
  const len = a.distanceTo(b);
  const g = new THREE.CylinderGeometry(r, r, len, seg);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()));
  const m = a.clone().add(b).multiplyScalar(0.5);
  return g.translate(m.x, m.y, m.z);
};
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

function buildModel(parts: Part[]): Model {
  const groups: Partial<Record<MatKey, THREE.BufferGeometry[]>> = {};
  parts.forEach(([k, g]) => {
    const ng = g.index ? g.toNonIndexed() : g;
    if (ng.attributes.uv) ng.deleteAttribute("uv");
    (groups[k] ??= []).push(ng);
  });
  const out: Model = {};
  (Object.keys(groups) as MatKey[]).forEach((k) => {
    out[k] = mergeGeometries(groups[k]!, false)!;
  });
  return out;
}

function ModelMesh({ model }: { model: Model }) {
  const m = mats();
  const depth = revealDepthMaterial();
  return (
    <>
      {(Object.keys(model) as MatKey[]).map((k) => (
        <mesh
          key={k}
          geometry={model[k]}
          material={m[k]}
          castShadow={k !== "glassLit" && k !== "lamp" && k !== "pool" && k !== "water"}
          receiveShadow
          customDepthMaterial={depth}
        />
      ))}
    </>
  );
}

/** Ensambla su contenido al activarse el rubro: crece desde el suelo con rebote suave. */
function Stage({ k, delay, children, mode = "y" }: { k: Key; delay: number; children: ReactNode; mode?: "y" | "all" }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const e = Math.max(0.0001, easeOutBack(staged(mix[k], delay)));
    if (mode === "all") g.scale.setScalar(e);
    else g.scale.set(1, e, 1);
  });
  return <group ref={ref}>{children}</group>;
}

/** Raíz de cada mundo: se apoya sobre el pedestal (que la posiciona y la gira); visible solo con su rubro. */
function SiteRoot({ k, children }: { k: Key; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.visible = mix[k] > 0.002;
  });
  return (
    <group ref={ref} position={[0, PEDESTAL_H, 0]}>
      {children}
    </group>
  );
}

const tree = (x: number, z: number, s = 1): Part[] => [
  ["wood", cyl(0.025 * s, 0.035 * s, 0.32 * s, x, 0.16 * s, z, 8)],
  ["green", sph(0.2 * s, x, 0.42 * s, z)],
  ["green", sph(0.15 * s, x + 0.12 * s, 0.52 * s, z + 0.04 * s)],
  ["green", sph(0.13 * s, x - 0.1 * s, 0.56 * s, z - 0.06 * s)],
];
const person = (x: number, z: number, vest: MatKey = "orange", headlamp = false, ry = 0): Part[] => {
  const p: Part[] = [
    ["graphite", rb(0.07, 0.14, 0.05, 0, 0.07, 0, 0.015)],
    [vest, new THREE.CapsuleGeometry(0.042, 0.09, 4, 10).translate(0, 0.21, 0)],
    ["skin", sph(0.033, 0, 0.31, 0, 12)],
    ["white", new THREE.SphereGeometry(0.04, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, 0.325, 0)],
  ];
  if (headlamp) p.push(["lamp", sph(0.011, 0, 0.335, 0.038, 8)]);
  return p.map(([k, g]) => [k, g.rotateY(ry).translate(x, 0, z)] as Part);
};

/* ================================================================== */
/* ARQUITECTURA: villa moderna (piedra, voladizo blanco, vidrio,       */
/* madera, piscina infinita y jardín), iluminada al atardecer          */
/* ================================================================== */
export function Architecture() {
  const m = mats();
  const models = useMemo(() => {
    const site: Part[] = [
      ["lawn", rb(5.6, 0.1, 4.4, 0, 0.05, 0.2, 0.05)],
      ["stone", rb(3.6, 0.06, 1.1, 0.25, 0.13, 1.05, 0.02)],
      ["concrete", rb(0.5, 0.04, 1.6, 2.3, 0.12, 1.2, 0.02)],
      ["stone", rb(0.45, 0.03, 1.2, -0.45, 0.115, 1.95, 0.01)],
    ];
    for (let i = 0; i < 9; i++) site.push(["green", rb(0.5, 0.22, 0.22, -2.55 + i * 0.6, 0.2, -1.95, 0.09)]);
    site.push(...tree(-2.4, 1.6, 1.2), ...tree(-2.1, -1.4, 1.4), ...tree(2.5, -1.5, 1.3), ...tree(2.6, 0.2, 1.0), ...tree(-1.1, 2.0, 0.9));
    for (let i = 0; i < 4; i++) {
      site.push(["graphite", cyl(0.018, 0.018, 0.12, -0.75, 0.17, 1.55 + i * 0.18, 10)]);
      site.push(["lamp", cyl(0.02, 0.02, 0.02, -0.75, 0.24, 1.55 + i * 0.18, 10)]);
    }
    const pool: Part[] = [
      ["white", rb(2.5, 0.06, 1.0, 0.75, 0.16, 1.55, 0.02)],
      ["pool", rb(2.3, 0.04, 0.8, 0.75, 0.19, 1.55, 0.02)],
      ["wood", rb(1.25, 0.05, 1.0, -1.25, 0.16, 1.45, 0.015)],
      ["white", rb(0.16, 0.05, 0.44, -1.55, 0.21, 1.45, 0.02)],
      ["white", rb(0.16, 0.05, 0.44, -1.2, 0.21, 1.45, 0.02)],
      ["dark", cyl(0.012, 0.012, 0.42, -0.85, 0.37, 1.3, 8)],
      ["plaster", new THREE.ConeGeometry(0.28, 0.1, 16).translate(-0.85, 0.6, 1.3)],
    ];
    const ground: Part[] = [
      ["stone", rb(1.35, 0.66, 1.5, -1.45, 0.49, -0.35, 0.03)],
      ["white", rb(2.2, 0.6, 1.2, 0.4, 0.46, -0.3, 0.02)],
      ["glassLit", rb(2.1, 0.5, 0.04, 0.4, 0.45, 0.32, 0.01)],
      ["plaster", rb(0.9, 0.06, 0.04, 0.0, 0.18, 0.33, 0.01)],
    ];
    for (let i = 0; i <= 6; i++) ground.push(["graphite", rb(0.022, 0.52, 0.03, -0.62 + i * 0.34, 0.45, 0.345, 0.008)]);
    const upper: Part[] = [
      ["graphite", rb(3.6, 0.07, 1.75, 0.15, 0.8, -0.25, 0.02)],
      ["white", rb(3.2, 0.52, 1.55, 0.4, 1.09, -0.28, 0.03)],
      ["glassLit", rb(2.3, 0.26, 0.04, 0.6, 1.1, 0.5, 0.01)],
      ["graphite", rb(2.32, 0.02, 0.05, 0.6, 0.96, 0.51, 0.006)],
      ["graphite", rb(3.5, 0.06, 1.85, 0.4, 1.38, -0.26, 0.02)],
      ["green", rb(1.1, 0.07, 0.9, -0.5, 1.44, -0.5, 0.03)],
      ["white", rb(0.9, 0.38, 0.7, 1.05, 1.6, -0.55, 0.03)],
      ["glassLit", rb(0.7, 0.24, 0.03, 1.05, 1.6, -0.19, 0.01)],
      ["graphite", rb(1.05, 0.04, 0.85, 1.05, 1.81, -0.55, 0.015)],
      ["stone", rb(0.26, 1.95, 0.26, -2.05, 0.98, -0.85, 0.03)],
      ["glassDark", rb(1.1, 0.12, 0.012, 0.6, 0.92, 0.62, 0.004)],
    ];
    for (let i = 0; i < 14; i++) upper.push(["wood", rb(0.028, 0.42, 0.05, -1.05 + i * 0.045, 1.09, 0.52, 0.008)]);
    const pergola: Part[] = [];
    for (const [x, z] of [
      [-1.8, 1.0],
      [-0.7, 1.0],
      [-1.8, 1.9],
      [-0.7, 1.9],
    ])
      pergola.push(["graphite", rb(0.04, 0.62, 0.04, x, 0.47, z, 0.012)]);
    for (let i = 0; i < 9; i++) pergola.push(["wood", rb(1.18, 0.025, 0.045, -1.25, 0.79, 1.0 + i * 0.11, 0.008)]);
    const car: Part[] = [
      ["white", rb(0.46, 0.11, 0.22, 2.3, 0.22, 1.45, 0.05)],
      ["glassDark", rb(0.26, 0.09, 0.2, 2.27, 0.31, 1.45, 0.04)],
      ["graphite", cyl(0.045, 0.045, 0.24, 0, 0, 0, 14).rotateX(Math.PI / 2).translate(2.15, 0.18, 1.45)],
      ["graphite", cyl(0.045, 0.045, 0.24, 0, 0, 0, 14).rotateX(Math.PI / 2).translate(2.45, 0.18, 1.45)],
      ["lamp", rb(0.012, 0.03, 0.17, 2.53, 0.23, 1.45, 0.005)],
    ];
    return {
      site: buildModel(site),
      pool: buildModel(pool),
      ground: buildModel(ground),
      upper: buildModel(upper),
      pergola: buildModel(pergola),
      car: buildModel([...car, ...person(0.2, 1.05, "white", false, 0.6), ...person(1.9, 0.75, "dark", false, -2)]),
    };
  }, []);

  const lights = useRef<THREE.Group>(null);
  useFrame((s) => {
    const p = mix.arquitectura;
    if (p < 0.002) return;
    const t = s.clock.elapsedTime;
    m.glassLit.emissiveIntensity = 0.3 + 1.5 * easeOutCubic(staged(p, 0.6)) + Math.sin(t * 2.7) * 0.03;
    m.pool.emissiveIntensity = 0.55 + Math.sin(t * 2.1) * 0.15;
    m.lamp.emissiveIntensity = 3 * easeOutCubic(staged(p, 0.7));
    lights.current?.children.forEach((l, i) => {
      (l as THREE.PointLight).intensity = (i === 2 ? 3 : 4.5) * easeOutCubic(staged(p, 0.6));
    });
  });

  return (
    <SiteRoot k="arquitectura">
      <Stage k="arquitectura" delay={0}>
        <ModelMesh model={models.site} />
      </Stage>
      <Stage k="arquitectura" delay={0.15}>
        <ModelMesh model={models.pool} />
        <ModelMesh model={models.pergola} />
      </Stage>
      <Stage k="arquitectura" delay={0.25}>
        <ModelMesh model={models.ground} />
      </Stage>
      <Stage k="arquitectura" delay={0.4}>
        <ModelMesh model={models.upper} />
      </Stage>
      <Stage k="arquitectura" delay={0.55} mode="all">
        <ModelMesh model={models.car} />
      </Stage>
      <group ref={lights}>
        <pointLight position={[0.4, 0.5, 0.7]} color="#ffbf7a" distance={2.6} decay={1.6} />
        <pointLight position={[0.6, 1.1, 0.85]} color="#ffbf7a" distance={2.4} decay={1.6} />
        <pointLight position={[0.75, 0.35, 1.55]} color="#5fc9ec" distance={1.8} decay={1.6} />
      </group>
    </SiteRoot>
  );
}

/* ================================================================== */
/* INGENIERÍA: puente atirantado en construcción sobre un río,         */
/* con grúa izando la dovela que falta, topografía y maquinaria        */
/* ================================================================== */
const GAP = { x0: 1.55, x1: 2.25 };
const DECK_Y = 0.78;

export function Engineering() {
  const m = mats();
  const models = useMemo(() => {
    const river: Part[] = [["water", rb(1.5, 0.05, 5.4, 0, 0.06, 0, 0.02)]];
    for (let i = 0; i < 16; i++) {
      const z = -2.5 + i * 0.33;
      river.push(["rock", rock(0.12 + (i % 3) * 0.04, -0.86 + (i % 2) * 0.06, 0.08, z, 1.3, 0.6, 1, 1)]);
      river.push(["rock", rock(0.1 + (i % 4) * 0.03, 0.88 - (i % 2) * 0.05, 0.08, z + 0.1, 1.2, 0.6, 1, 1)]);
    }
    const deck = (x0: number, x1: number): Part[] => {
      const L = x1 - x0;
      const cx = (x0 + x1) / 2;
      const p: Part[] = [
        ["concrete", rb(L, 0.14, 0.78, cx, DECK_Y, 0, 0.03)],
        ["asphalt", rb(L, 0.02, 0.6, cx, DECK_Y + 0.08, 0, 0.005)],
        ["steel", rb(L, 0.025, 0.02, cx, DECK_Y + 0.17, 0.37, 0.008)],
        ["steel", rb(L, 0.025, 0.02, cx, DECK_Y + 0.17, -0.37, 0.008)],
      ];
      for (let x = x0 + 0.1; x < x1; x += 0.22) {
        p.push(["steel", rb(0.015, 0.09, 0.015, x, DECK_Y + 0.12, 0.37, 0.005)]);
        p.push(["steel", rb(0.015, 0.09, 0.015, x, DECK_Y + 0.12, -0.37, 0.005)]);
      }
      for (let x = x0 + 0.15; x < x1 - 0.1; x += 0.3) p.push(["paint", rb(0.16, 0.004, 0.025, x, DECK_Y + 0.092, 0, 0.002)]);
      return p;
    };
    const structure: Part[] = [
      ...deck(-3.2, GAP.x0),
      ...deck(GAP.x1, 3.2),
      ["concrete", rb(0.5, DECK_Y, 1.0, -3.0, DECK_Y / 2, 0, 0.04)],
      ["concrete", rb(0.5, DECK_Y, 1.0, 3.0, DECK_Y / 2, 0, 0.04)],
      ["concrete", cyl(0.14, 0.17, DECK_Y - 0.07, 2.5, (DECK_Y - 0.07) / 2, 0.22)],
      ["concrete", cyl(0.14, 0.17, DECK_Y - 0.07, 2.5, (DECK_Y - 0.07) / 2, -0.22)],
      ["concrete", rb(0.36, 0.1, 0.8, 2.5, DECK_Y - 0.12, 0, 0.03)],
      ["concrete", cyl(0.14, 0.17, DECK_Y - 0.07, -1.9, (DECK_Y - 0.07) / 2, 0.22)],
      ["concrete", cyl(0.14, 0.17, DECK_Y - 0.07, -1.9, (DECK_Y - 0.07) / 2, -0.22)],
    ];
    const PX = -0.95;
    const H = 2.55;
    const pylon: Part[] = [
      ["white", rb(0.16, H, 0.16, PX, H / 2, 0.46, 0.04)],
      ["white", rb(0.16, H, 0.16, PX, H / 2, -0.46, 0.04)],
      ["white", rb(0.2, 0.16, 1.08, PX, DECK_Y - 0.15, 0, 0.04)],
      ["white", rb(0.18, 0.14, 1.06, PX, H - 0.2, 0, 0.04)],
      ["concrete", rb(0.5, 0.12, 1.3, PX, 0.12, 0, 0.04)],
      ["red", sph(0.035, PX, H + 0.04, 0.46, 12)],
      ["red", sph(0.035, PX, H + 0.04, -0.46, 12)],
    ];
    const cables: Part[] = [];
    for (const zs of [0.4, -0.4]) {
      for (let i = 0; i < 6; i++) {
        const top = v(PX, H - 0.32 - i * 0.12, zs * 1.12);
        cables.push(["steel", strut(top, v(PX - 0.45 - i * 0.38, DECK_Y + 0.1, zs), 0.008)]);
        if (PX + 0.45 + i * 0.38 < GAP.x0) cables.push(["steel", strut(top, v(PX + 0.45 + i * 0.38, DECK_Y + 0.1, zs), 0.008)]);
      }
    }
    const works: Part[] = [];
    for (let i = 0; i < 6; i++) {
      works.push(["orange", new THREE.ConeGeometry(0.035, 0.1, 12).translate(GAP.x0 - 0.15 - i * 0.18, DECK_Y + 0.14, 0.22)]);
      works.push(["white", cyl(0.021, 0.025, 0.015, GAP.x0 - 0.15 - i * 0.18, DECK_Y + 0.15, 0.22, 12)]);
    }
    works.push(["orange", rb(0.03, 0.12, 0.6, GAP.x0 - 0.05, DECK_Y + 0.15, 0, 0.01)]);
    works.push(...person(GAP.x0 - 0.3, -0.12, "orange", false, 1.4).map(([k, g]) => [k, g.translate(0, DECK_Y + 0.09, 0)] as Part));
    works.push(...person(GAP.x0 - 0.55, 0.15, "orange", false, 2.2).map(([k, g]) => [k, g.translate(0, DECK_Y + 0.09, 0)] as Part));
    const st = v(-2.2, 0, 1.25);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      works.push(["yellow", strut(v(st.x + Math.cos(a) * 0.12, 0.1, st.z + Math.sin(a) * 0.12), v(st.x, 0.42, st.z), 0.008)]);
    }
    works.push(["yellow", rb(0.08, 0.07, 0.06, st.x, 0.46, st.z, 0.015)]);
    works.push(["graphite", cyl(0.018, 0.018, 0.08, 0, 0, 0, 12).rotateZ(Math.PI / 2).translate(st.x + 0.03, 0.5, st.z)]);
    works.push(...person(st.x - 0.14, st.z + 0.08, "orange", false, 0.8));
    const ex = v(2.0, 0, 1.45);
    works.push(["graphite", rb(0.5, 0.08, 0.12, ex.x, 0.1, ex.z + 0.12, 0.03)]);
    works.push(["graphite", rb(0.5, 0.08, 0.12, ex.x, 0.1, ex.z - 0.12, 0.03)]);
    works.push(["yellow", rb(0.38, 0.14, 0.3, ex.x - 0.03, 0.24, ex.z, 0.04)]);
    works.push(["glassDark", rb(0.14, 0.13, 0.14, ex.x + 0.09, 0.38, ex.z + 0.06, 0.03)]);
    works.push(["yellow", strut(v(ex.x + 0.12, 0.3, ex.z - 0.05), v(ex.x + 0.5, 0.55, ex.z - 0.05), 0.03)]);
    works.push(["yellow", strut(v(ex.x + 0.5, 0.55, ex.z - 0.05), v(ex.x + 0.72, 0.18, ex.z - 0.05), 0.025)]);
    works.push(["graphite", rb(0.1, 0.08, 0.12, ex.x + 0.74, 0.14, ex.z - 0.05, 0.02)]);
    works.push(["ore", rock(0.22, ex.x + 0.85, 0.12, ex.z + 0.35, 1.3, 0.55, 1, 1)]);
    for (const [x, z] of [
      [-2.6, -1.4],
      [2.9, -1.3],
    ]) {
      works.push(["graphite", cyl(0.02, 0.03, 1.4, x, 0.7, z, 10)]);
      works.push(["lamp", rb(0.22, 0.12, 0.04, x, 1.42, z + 0.03, 0.015)]);
    }
    return {
      river: buildModel(river),
      structure: buildModel(structure),
      pylon: buildModel(pylon),
      cables: buildModel(cables),
      works: buildModel(works),
    };
  }, []);

  const crane = useMemo(() => {
    const CX = (GAP.x0 + GAP.x1) / 2;
    const CZ = -1.75;
    const mast: Part[] = [["concrete", rb(0.32, 0.08, 0.32, CX, 0.04, CZ, 0.02)]];
    for (const [dx, dz] of [
      [-0.06, -0.06],
      [0.06, -0.06],
      [-0.06, 0.06],
      [0.06, 0.06],
    ])
      mast.push(["yellow", rb(0.022, 2.6, 0.022, CX + dx, 1.3, CZ + dz, 0.008)]);
    for (let y = 0.15; y < 2.6; y += 0.18) {
      mast.push(["yellow", strut(v(CX - 0.06, y, CZ + 0.06), v(CX + 0.06, y + 0.18, CZ + 0.06), 0.006)]);
      mast.push(["yellow", strut(v(CX - 0.06, y, CZ - 0.06), v(CX + 0.06, y + 0.18, CZ - 0.06), 0.006)]);
    }
    mast.push(["glassDark", rb(0.14, 0.12, 0.14, CX + 0.1, 2.68, CZ, 0.03)]);
    mast.push(["yellow", rb(0.06, 0.06, 2.3, CX, 2.64, CZ + 0.95, 0.015)]);
    mast.push(["yellow", rb(0.06, 0.05, 0.7, CX, 2.64, CZ - 0.45, 0.015)]);
    mast.push(["concrete", rb(0.16, 0.14, 0.18, CX, 2.56, CZ - 0.7, 0.03)]);
    mast.push(["red", sph(0.02, CX, 2.72, CZ + 2.08, 10)]);
    return { model: buildModel(mast), CX, CZ };
  }, []);
  const segment = useMemo(
    () =>
      buildModel([
        ["concrete", rb(GAP.x1 - GAP.x0 - 0.02, 0.14, 0.78, 0, 0, 0, 0.03)],
        ["asphalt", rb(GAP.x1 - GAP.x0 - 0.02, 0.02, 0.6, 0, 0.08, 0, 0.005)],
      ]),
    [],
  );
  const hook = useMemo(() => buildModel([["red", rb(0.06, 0.06, 0.06, 0, 0, 0, 0.015)]]), []);
  const segRef = useRef<THREE.Group>(null);
  const hookRef = useRef<THREE.Group>(null);
  const cableRef = useRef<THREE.Mesh>(null);
  const laserRef = useRef<{ visible: boolean; material: { dashOffset: number; opacity: number } } | null>(null);

  useFrame((s) => {
    const p = mix.ingenieria;
    if (p < 0.002) return;
    const t = s.clock.elapsedTime;
    // ciclo de izaje (10 s): baja la dovela hasta su sitio, pausa y vuelve a subir
    const c = (t % 10) / 10;
    const k = c < 0.6 ? easeOutCubic(c / 0.6) : c < 0.8 ? 1 : 1 - (c - 0.8) / 0.2;
    const y = 2.05 - k * (2.05 - DECK_Y);
    if (segRef.current) segRef.current.position.set(crane.CX, y, 0);
    if (hookRef.current) hookRef.current.position.set(crane.CX, y + 0.22, 0);
    if (cableRef.current) {
      const len = 2.6 - (y + 0.22);
      cableRef.current.position.set(crane.CX, y + 0.22 + len / 2, 0);
      cableRef.current.scale.set(1, Math.max(0.01, len), 1);
    }
    m.red.emissiveIntensity = 0.3 + (Math.sin(t * 4) > 0.6 ? 1.6 : 0);
    m.lamp.emissiveIntensity = 3 * easeOutCubic(staged(p, 0.6));
    if (laserRef.current) {
      laserRef.current.material.dashOffset = -t * 0.6;
      laserRef.current.material.opacity = (0.6 + Math.sin(t * 6) * 0.25) * easeOutCubic(staged(p, 0.7));
    }
  });
  const depth = revealDepthMaterial();

  return (
    <SiteRoot k="ingenieria">
      <Stage k="ingenieria" delay={0}>
        <ModelMesh model={models.river} />
        <ModelMesh model={models.structure} />
      </Stage>
      <Stage k="ingenieria" delay={0.2}>
        <ModelMesh model={models.pylon} />
      </Stage>
      <Stage k="ingenieria" delay={0.35}>
        <ModelMesh model={models.cables} />
        <ModelMesh model={crane.model} />
      </Stage>
      <Stage k="ingenieria" delay={0.5} mode="all">
        <ModelMesh model={models.works} />
      </Stage>
      <group ref={segRef}>
        <ModelMesh model={segment} />
      </group>
      <group ref={hookRef}>
        <ModelMesh model={hook} />
      </group>
      <mesh ref={cableRef} material={m.graphite} customDepthMaterial={depth}>
        <cylinderGeometry args={[0.005, 0.005, 1, 6]} />
      </mesh>
      <Line
        ref={laserRef as never}
        points={[v(-2.17, 0.5, 1.25), v(GAP.x0 - 0.3, DECK_Y + 0.35, -0.12)]}
        color="#ff4b3a"
        lineWidth={1.6}
        dashed
        dashSize={0.06}
        gapSize={0.04}
        transparent
        toneMapped={false}
      />
      <pointLight position={[-2.6, 1.3, -1.2]} color="#fff0d6" intensity={3} distance={3} decay={1.5} />
      <pointLight position={[2.9, 1.3, -1.1]} color="#fff0d6" intensity={3} distance={3} decay={1.5} />
    </SiteRoot>
  );
}

/* ================================================================== */
/* MINERÍA: bocamina en la ladera con socavón iluminado, tren minero,  */
/* ducto de ventilación, red de conducción, faja y torre de luz         */
/* ================================================================== */
const TUNNEL_Z0 = -0.15;
const TUNNEL_Z1 = -2.3;

export function Mining() {
  const m = mats();
  const models = useMemo(() => {
    const mountain: Part[] = [
      ["rock", rock(1.7, 0, 1.0, -2.1, 1.9, 1.05, 1.0)],
      ["rock", rock(1.25, -2.2, 0.7, -1.6, 1.2, 1.0, 1.0)],
      ["rock", rock(1.2, 2.3, 0.65, -1.7, 1.15, 1.0, 1.0)],
      ["rock", rock(0.9, -1.0, 1.7, -2.6, 1.3, 0.8, 1.0)],
      ["rock", rock(0.85, 1.1, 1.8, -2.7, 1.2, 0.8, 1.0)],
      ["rock", rock(0.28, -1.5, 0.15, 0.4, 1.3, 0.6, 1, 1)],
      ["rock", rock(0.22, 1.7, 0.12, 0.6, 1.2, 0.6, 1, 1)],
      ["rock", rock(0.18, -2.4, 0.1, 1.2, 1.2, 0.6, 1, 1)],
      ["ore", rb(5.4, 0.06, 3.6, 0, 0.03, 0.6, 0.02)],
    ];
    const R = 0.62;
    const arch = new THREE.TorusGeometry(R, 0.12, 12, 32, Math.PI).translate(0, 0.95, TUNNEL_Z0 + 0.05);
    const portal: Part[] = [
      ["concrete", rb(0.24, 0.95, 0.45, -R, 0.475, TUNNEL_Z0 + 0.05, 0.03)],
      ["concrete", rb(0.24, 0.95, 0.45, R, 0.475, TUNNEL_Z0 + 0.05, 0.03)],
      ["concrete", arch],
      ["concrete", rb(2.3, 0.5, 0.35, 0, 1.75, TUNNEL_Z0 - 0.05, 0.04)],
      ["yellow", rb(0.95, 0.2, 0.04, 0, 1.75, TUNNEL_Z0 + 0.14, 0.02)],
      ["graphite", rb(0.85, 0.04, 0.045, 0, 1.75, TUNNEL_Z0 + 0.15, 0.01)],
      ["concrete", rb(0.7, 0.9, 0.35, -1.25, 0.45, TUNNEL_Z0 - 0.05, 0.04)],
      ["concrete", rb(0.7, 0.9, 0.35, 1.25, 0.45, TUNNEL_Z0 - 0.05, 0.04)],
    ];
    const shell = new THREE.CylinderGeometry(R - 0.04, R - 0.04, TUNNEL_Z0 - TUNNEL_Z1, 28, 1, true, -Math.PI / 2, Math.PI);
    shell.rotateX(Math.PI / 2).translate(0, 0.95, (TUNNEL_Z0 + TUNNEL_Z1) / 2);
    const tunnel: Part[] = [
      ["void", shell],
      ["void", rb((R - 0.04) * 2, 0.95, TUNNEL_Z0 - TUNNEL_Z1, 0, 0.475, (TUNNEL_Z0 + TUNNEL_Z1) / 2, 0.01)],
      ["dark", rb((R - 0.05) * 2, 0.03, TUNNEL_Z0 - TUNNEL_Z1, 0, 0.02, (TUNNEL_Z0 + TUNNEL_Z1) / 2, 0.01)],
    ];
    for (let z = TUNNEL_Z0 - 0.2; z > TUNNEL_Z1 + 0.1; z -= 0.32) {
      tunnel.push(["rust", new THREE.TorusGeometry(R - 0.07, 0.022, 8, 24, Math.PI).translate(0, 0.95, z)]);
      tunnel.push(["rust", rb(0.04, 0.95, 0.04, -(R - 0.07), 0.475, z, 0.01)]);
      tunnel.push(["rust", rb(0.04, 0.95, 0.04, R - 0.07, 0.475, z, 0.01)]);
      tunnel.push(["lamp", rb(0.1, 0.02, 0.04, 0, 1.5, z - 0.12, 0.008)]);
    }
    for (let z = TUNNEL_Z1 + 0.05; z < 2.2; z += 0.11) tunnel.push(["rust", rb(0.36, 0.025, 0.05, 0, 0.075, z, 0.008)]);
    tunnel.push(["steel", rb(0.025, 0.035, 2.2 - TUNNEL_Z1, -0.12, 0.1, (2.2 + TUNNEL_Z1) / 2, 0.008)]);
    tunnel.push(["steel", rb(0.025, 0.035, 2.2 - TUNNEL_Z1, 0.12, 0.1, (2.2 + TUNNEL_Z1) / 2, 0.008)]);

    const ductCurve = new THREE.CatmullRomCurve3([v(1.55, 0.32, 0.9), v(1.3, 0.75, 0.55), v(0.65, 1.25, 0.25), v(0.25, 1.32, -0.3), v(0.22, 1.3, -1.6)]);
    const duct: Part[] = [["yellow", new THREE.TubeGeometry(ductCurve, 80, 0.1, 16, false)]];
    for (let i = 1; i < 26; i++) {
      const u = i / 26;
      const p = ductCurve.getPointAt(u);
      const tan = ductCurve.getTangentAt(u);
      const ring = new THREE.TorusGeometry(0.105, 0.012, 6, 18);
      ring.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan));
      duct.push(["graphite", ring.translate(p.x, p.y, p.z)]);
    }
    duct.push(["steel", cyl(0.2, 0.2, 0.32, 0, 0, 0, 24).rotateZ(Math.PI / 2).rotateY(-0.6).translate(1.62, 0.28, 0.95)]);
    duct.push(["concrete", rb(0.5, 0.1, 0.4, 1.62, 0.05, 0.95, 0.03)]);

    const pipeA = new THREE.CatmullRomCurve3([v(-2.6, 0.42, 1.1), v(-1.9, 0.42, 0.55), v(-1.2, 0.4, 0.2), v(-0.9, 0.35, -0.2), v(-0.5, 0.28, -0.9)]);
    const pipeB = new THREE.CatmullRomCurve3([v(-2.6, 0.3, 1.25), v(-1.9, 0.3, 0.7), v(-1.15, 0.28, 0.35), v(-0.85, 0.22, -0.1), v(-0.45, 0.18, -0.9)]);
    const pipes: Part[] = [
      ["pipe", new THREE.TubeGeometry(pipeA, 90, 0.05, 14, false)],
      ["pipe", new THREE.TubeGeometry(pipeB, 90, 0.04, 14, false)],
    ];
    for (let i = 0; i <= 5; i++) {
      const p = pipeA.getPointAt(i / 7);
      pipes.push(["steel", rb(0.03, p.y, 0.03, p.x, p.y / 2, p.z, 0.01)]);
      pipes.push(["steel", rb(0.03, 0.03, 0.3, p.x, 0.36, p.z + 0.07, 0.01)]);
    }
    pipes.push(["red", cyl(0.07, 0.07, 0.03, 0, 0, 0, 16).rotateZ(Math.PI / 2).translate(-1.9, 0.42, 0.55)]);
    pipes.push(["red", cyl(0.06, 0.06, 0.03, 0, 0, 0, 16).rotateZ(Math.PI / 2).translate(-1.9, 0.3, 0.7)]);

    const belt0 = v(0.55, 0.12, 0.7);
    const belt1 = v(2.25, 0.62, 1.55);
    const beltDir = belt1.clone().sub(belt0);
    const beltLen = beltDir.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), beltDir.clone().normalize());
    const mid = belt0.clone().add(belt1).multiplyScalar(0.5);
    const conveyor: Part[] = [
      ["graphite", new THREE.BoxGeometry(beltLen, 0.03, 0.16).applyQuaternion(q).translate(mid.x, mid.y, mid.z)],
      ["yellow", new THREE.BoxGeometry(beltLen, 0.05, 0.2).translate(0, -0.04, 0).applyQuaternion(q).translate(mid.x, mid.y, mid.z)],
      ["ore", new THREE.ConeGeometry(0.55, 0.5, 18).translate(2.45, 0.25, 1.75)],
    ];
    for (let i = 1; i < 5; i++) {
      const p = belt0.clone().lerp(belt1, i / 5);
      conveyor.push(["steel", rb(0.03, p.y, 0.03, p.x, p.y / 2, p.z + 0.08, 0.01)]);
    }

    const crew: Part[] = [
      ["graphite", cyl(0.025, 0.035, 1.6, -1.6, 0.8, 1.35, 10)],
      ["lamp", rb(0.26, 0.14, 0.05, -1.6, 1.62, 1.38, 0.02)],
      ["graphite", rb(0.4, 0.06, 0.3, -1.6, 0.03, 1.35, 0.02)],
      ...person(0.45, 0.35, "orange", true, -0.4),
      ...person(-0.42, 0.55, "orange", true, 0.6),
      ...person(-1.25, 1.5, "orange", true, 1.2),
      ...person(1.15, 1.1, "orange", true, -1.8),
    ];
    return {
      mountain: buildModel(mountain),
      portal: buildModel(portal),
      tunnel: buildModel(tunnel),
      duct: buildModel(duct),
      pipes: buildModel(pipes),
      conveyor: buildModel(conveyor),
      crew: buildModel(crew),
      beltPath: { a: belt0, b: belt1 },
    };
  }, []);

  const train = useMemo(() => {
    const loco = buildModel([
      ["yellow", rb(0.3, 0.2, 0.42, 0, 0.24, 0, 0.05)],
      ["glassDark", rb(0.24, 0.12, 0.2, 0, 0.38, -0.05, 0.03)],
      ["yellow", rb(0.28, 0.03, 0.24, 0, 0.45, -0.05, 0.01)],
      ["lamp", cyl(0.025, 0.025, 0.02, 0, 0, 0, 12).rotateX(Math.PI / 2).translate(0, 0.27, 0.215)],
      ["graphite", rb(0.32, 0.06, 0.44, 0, 0.12, 0, 0.02)],
    ]);
    const wagon = buildModel([
      ["rust", rb(0.3, 0.17, 0.38, 0, 0.22, 0, 0.04)],
      ["ore", rock(0.14, 0, 0.32, 0, 1.0, 0.45, 1.25, 1)],
      ["graphite", rb(0.32, 0.05, 0.4, 0, 0.11, 0, 0.02)],
      ["graphite", cyl(0.04, 0.04, 0.34, 0, 0, 0, 12).rotateZ(Math.PI / 2).translate(0, 0.09, 0.12)],
      ["graphite", cyl(0.04, 0.04, 0.34, 0, 0, 0, 12).rotateZ(Math.PI / 2).translate(0, 0.09, -0.12)],
    ]);
    return { loco, wagon };
  }, []);
  const cars = useRef<(THREE.Group | null)[]>([]);
  const fan = useRef<THREE.Group>(null);
  const chunks = useRef<THREE.InstancedMesh>(null);
  const oreChunk = useMemo(() => new THREE.IcosahedronGeometry(0.045, 1), []);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const lift = useMemo(() => new THREE.Vector3(0, 0.05, 0), []);
  const lights = useRef<THREE.Group>(null);

  useFrame((s) => {
    const p = mix.mineria;
    if (p < 0.002) return;
    const t = s.clock.elapsedTime;
    // el tren sale del socavón, se detiene y vuelve a entrar (ciclo 14 s)
    const c = (t % 14) / 14;
    const k = c < 0.4 ? easeOutCubic(c / 0.4) : c < 0.55 ? 1 : 1 - easeOutCubic((c - 0.55) / 0.45);
    const head = TUNNEL_Z1 + 0.1 + k * (1.9 - TUNNEL_Z1 - 0.1);
    cars.current.forEach((g, i) => {
      if (!g) return;
      const z = head - i * 0.42;
      g.position.set(0, 0, z);
      g.visible = z > TUNNEL_Z1 + 0.05;
    });
    if (fan.current) fan.current.rotation.x = t * 9;
    m.lamp.emissiveIntensity = 3 * easeOutCubic(staged(p, 0.5)) * (0.95 + Math.sin(t * 13) * 0.02);
    const mesh = chunks.current;
    if (mesh) {
      for (let i = 0; i < 10; i++) {
        const u = (t * 0.1 + i / 10) % 1;
        tmp.position.lerpVectors(models.beltPath.a, models.beltPath.b, u).add(lift);
        tmp.rotation.set(i, i * 2, 0);
        tmp.scale.setScalar(0.75 + (i % 3) * 0.2);
        tmp.updateMatrix();
        mesh.setMatrixAt(i, tmp.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
    lights.current?.children.forEach((l, i) => {
      (l as THREE.PointLight).intensity = (i === 0 ? 5 : 3.5) * easeOutCubic(staged(p, 0.5));
    });
  });
  const depth = revealDepthMaterial();

  return (
    <SiteRoot k="mineria">
      <Stage k="mineria" delay={0}>
        <ModelMesh model={models.mountain} />
      </Stage>
      <Stage k="mineria" delay={0.15}>
        <ModelMesh model={models.tunnel} />
        <ModelMesh model={models.portal} />
      </Stage>
      <Stage k="mineria" delay={0.3}>
        <ModelMesh model={models.duct} />
        <ModelMesh model={models.pipes} />
        <ModelMesh model={models.conveyor} />
      </Stage>
      <Stage k="mineria" delay={0.5} mode="all">
        <ModelMesh model={models.crew} />
      </Stage>
      <group ref={fan} position={[1.62, 0.28, 0.95]} rotation-y={-0.6}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} rotation-x={(i / 5) * Math.PI * 2} material={m.graphite} customDepthMaterial={depth}>
            <boxGeometry args={[0.02, 0.16, 0.05]} />
          </mesh>
        ))}
      </group>
      {[0, 1, 2, 3].map((i) => (
        <group key={i} ref={(g) => void (cars.current[i] = g)}>
          <ModelMesh model={i === 0 ? train.loco : train.wagon} />
        </group>
      ))}
      <instancedMesh ref={chunks} args={[oreChunk, m.ore, 10]} castShadow frustumCulled={false} customDepthMaterial={depth} />
      <group ref={lights}>
        <pointLight position={[0, 0.9, -0.9]} color="#ffc27a" distance={2.4} decay={1.4} />
        <pointLight position={[-1.6, 1.5, 1.6]} color="#fff2dc" distance={3} decay={1.5} />
      </group>
    </SiteRoot>
  );
}
