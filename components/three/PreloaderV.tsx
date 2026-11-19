"use client";

import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Edges, Environment, Lightformer, MeshTransmissionMaterial } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";

/** Símbolo "V" de Vicuña vectorizado del logotipo y extruido en vidrio. */
function VSymbol() {
  const data = useLoader(SVGLoader, "/media/brand/simbolo-v.svg");
  const group = useRef<THREE.Group>(null);

  const { v, vicuna } = useMemo(() => {
    const v: THREE.ExtrudeGeometry[] = [];
    const vicuna: THREE.ExtrudeGeometry[] = [];
    data.paths.forEach((path) => {
      const id = (path.userData?.node as SVGElement | undefined)?.getAttribute?.("id");
      SVGLoader.createShapes(path).forEach((shape) => {
        const isV = id === "v";
        const g = new THREE.ExtrudeGeometry(shape, {
          depth: isV ? 46 : 54,
          bevelEnabled: true,
          bevelThickness: isV ? 6 : 3,
          bevelSize: isV ? 4 : 1.6,
          bevelSegments: 5,
          curveSegments: 8,
        });
        g.translate(-246, -252, isV ? -23 : -25);
        (isV ? v : vicuna).push(g);
      });
    });
    return { v, vicuna };
  }, [data]);

  const accent = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#6a8fcf", roughness: 0.35, emissive: "#2c4f8f", emissiveIntensity: 0.35, side: THREE.DoubleSide }),
    [],
  );

  const t0 = useRef<number | null>(null);
  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    if (t0.current === null) t0.current = t;
    const k = Math.min(1, (t - t0.current) / 1.4);
    const e = 1 - Math.pow(2, -10 * k);
    g.rotation.y = -1.5 * (1 - e) + Math.sin(t * 1.3) * 0.12 * e;
    g.rotation.x = Math.sin(t * 0.9) * 0.05;
    const s = 0.0062 * (0.8 + 0.2 * e);
    g.scale.set(s, -s, s);
  });

  return (
    <group ref={group}>
      {v.map((g, i) => (
        <mesh key={`v${i}`} geometry={g}>
          <MeshTransmissionMaterial
            samples={6}
            resolution={512}
            thickness={90}
            ior={1.45}
            chromaticAberration={0.08}
            anisotropy={0.3}
            roughness={0.18}
            distortion={0.3}
            distortionScale={0.4}
            temporalDistortion={0.06}
            clearcoat={1}
            clearcoatRoughness={0.05}
            envMapIntensity={2.2}
            color="#f6fcff"
            attenuationColor="#5e9fb8"
            attenuationDistance={16}
            backside
            backsideThickness={40}
          />
          <Edges threshold={20} color="#bfe6f5" />
        </mesh>
      ))}
      {vicuna.map((g, i) => (
        <mesh key={`c${i}`} geometry={g} material={accent} />
      ))}
    </group>
  );
}

/** Fondo de curvas de nivel: lo que el vidrio de la V refracta. */
function ContourBackdrop() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#003647";
    ctx.fillRect(0, 0, 512, 512);
    const glow = ctx.createRadialGradient(256, 236, 10, 256, 256, 250);
    glow.addColorStop(0, "#2f86a3");
    glow.addColorStop(0.45, "#0b4b60");
    glow.addColorStop(1, "#003647");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 512, 512);
    ctx.strokeStyle = "rgba(168,216,236,0.6)";
    for (let i = 0; i < 26; i++) {
      ctx.lineWidth = i % 5 === 0 ? 2.2 : 1;
      ctx.beginPath();
      const base = 10 + i * 20;
      const p = (Math.sin(i * 12.9898) * 43758.5453) % 6.283;
      for (let x = -10; x <= 522; x += 8) {
        const y = base + Math.sin(x / 70 + p) * 14 + Math.sin(x / 31 + p * 2) * 5;
        if (x === -10) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <mesh position={[0, 0, -2.2]}>
      <planeGeometry args={[7, 7]} />
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
}

export default function PreloaderV() {
  return (
    <Canvas flat dpr={[1, 2]} gl={{ alpha: false, antialias: true }} camera={{ position: [0, 0, 5.4], fov: 32 }}>
      <color attach="background" args={["#003647"]} />
      <ContourBackdrop />
      <ambientLight intensity={0.6} />
      <directionalLight position={[-3, 3, 4]} intensity={1.8} color="#d6ecf5" />
      <directionalLight position={[3, -1, -3]} intensity={1.5} color="#78b0c8" />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={6} color="#a8d8ec" position={[3, 1, 2]} scale={[3, 4, 1]} />
        <Lightformer form="rect" intensity={5} color="#ffffff" position={[-3, 2, 3]} scale={[3, 2, 1]} />
        <Lightformer form="ring" intensity={3} color="#78b0c8" position={[0, -3, 2]} scale={2} />
      </Environment>
      <Suspense fallback={null}>
        <VSymbol />
      </Suspense>
    </Canvas>
  );
}
