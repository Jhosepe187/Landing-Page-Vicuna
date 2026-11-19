"use client";

import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Edges, Environment, Lightformer, MeshTransmissionMaterial, PerformanceMonitor } from "@react-three/drei";
import { Bloom, EffectComposer, N8AO } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useScene } from "@/store/scene";
import { heroScroll } from "@/lib/gsap";
import { makeTerrainGeometry, padHeight, reveal, SITE, terrainFragment, terrainUniforms, terrainVertex } from "./terrain";
import { Architecture, Engineering, FACE_CAMERA, Mining, mix, PEDESTAL_H } from "./worlds";

const PED_R = 3.48;
const isPortrait = (w: number, h: number) => w / h < 0.9;
/** Progreso de scroll del hero suavizado (0..1). */
const scrollEase = () => {
  const k = Math.min(1, Math.max(0, heroScroll.p));
  return k * k * (3 - 2 * k);
};

/* ------------------------------------------------------------------ */
function Director() {
  const started = useRef(false);
  useFrame((s, dt) => {
    const { rubro, phase } = useScene.getState();
    if (!started.current) {
      started.current = true;
      useScene.getState().setSceneReady();
    }
    const d = Math.min(dt, 0.05);
    reveal.uTime.value = s.clock.elapsedTime;
    (Object.keys(mix) as (keyof typeof mix)[]).forEach((k) => {
      // la pieza saliente se retira rápido para que no se superponga con la entrante
      mix[k] = THREE.MathUtils.damp(mix[k], k === rubro ? 1 : 0, k === rubro ? 3.4 : 9, d);
    });
    terrainUniforms.uTerrace.value = 0;
    terrainUniforms.uGrid.value = 0;
    if (phase !== "loading") terrainUniforms.uIntro.value = Math.min(1, terrainUniforms.uIntro.value + d / 2.2);
  });
  return null;
}

/* ------------------------------------------------------------------ */
function Terrain() {
  const geo = useMemo(makeTerrainGeometry, []);
  const mat = useMemo(
    () => new THREE.ShaderMaterial({ uniforms: terrainUniforms, vertexShader: terrainVertex, fragmentShader: terrainFragment, toneMapped: false }),
    [],
  );
  const shadowMat = useMemo(() => new THREE.ShadowMaterial({ opacity: 0.45, color: "#001820", depthWrite: false }), []);
  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
      shadowMat.dispose();
    },
    [geo, mat, shadowMat],
  );
  return (
    <>
      <mesh geometry={geo} material={mat} />
      <mesh geometry={geo} material={shadowMat} position-y={0.012} receiveShadow renderOrder={1} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Pedestal hexagonal de vidrio: base fija de la pieza. Gira (con la   */
/* pieza) siguiendo el mouse solo cuando el cursor está encima.        */
/* ------------------------------------------------------------------ */
function hexShape(r: number) {
  const s = new THREE.Shape();
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  s.closePath();
  return s;
}

function Pedestal({ quality }: { quality: "high" | "low" }) {
  const group = useRef<THREE.Group>(null);
  const geos = useMemo(() => {
    const glass = new THREE.ExtrudeGeometry(hexShape(PED_R), {
      depth: PEDESTAL_H - 0.12,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.06,
      bevelSegments: 6,
      curveSegments: 1,
    });
    glass.rotateX(-Math.PI / 2).translate(0, 0.07, 0);
    const base = new THREE.ExtrudeGeometry(hexShape(PED_R + 0.12), {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.015,
      bevelSize: 0.02,
      bevelSegments: 3,
      curveSegments: 1,
    });
    base.rotateX(-Math.PI / 2);
    return { glass, base };
  }, []);
  const baseMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#14303a", roughness: 0.35, metalness: 0.6 }), []);
  const rot = useRef({ y: 0, x: 0 });

  useFrame((s, dt) => {
    const g = group.current;
    if (!g) return;
    const d = Math.min(dt, 0.05);
    const { hover3D } = useScene.getState();
    const portrait = isPortrait(s.size.width, s.size.height);
    const over = hover3D && (portrait || s.pointer.x > -0.08);
    const cx = portrait ? 0 : 0.46;
    const ty = over ? THREE.MathUtils.clamp((s.pointer.x - cx) * 1.4, -0.85, 0.85) : 0;
    const tx = over ? THREE.MathUtils.clamp(-s.pointer.y * 0.1, -0.08, 0.08) : 0;
    rot.current.y = THREE.MathUtils.damp(rot.current.y, ty, 3.2, d);
    rot.current.x = THREE.MathUtils.damp(rot.current.x, tx, 3.2, d);
    g.rotation.set(rot.current.x, FACE_CAMERA + rot.current.y, 0);
    reveal.uAngle.value = g.rotation.y;
  });

  return (
    <group ref={group} position={[SITE.x, padHeight(), SITE.z]}>
      <mesh geometry={geos.base} material={baseMat} receiveShadow castShadow>
        <Edges threshold={20} color="#78b0c8" />
      </mesh>
      <mesh geometry={geos.glass} receiveShadow>
        <MeshTransmissionMaterial
          samples={quality === "high" ? 6 : 3}
          resolution={quality === "high" ? 768 : 384}
          thickness={0.6}
          ior={1.3}
          chromaticAberration={0.04}
          anisotropy={0.2}
          roughness={0.12}
          distortion={0.05}
          distortionScale={0.2}
          color="#d9eef7"
          attenuationColor="#78b0c8"
          attenuationDistance={1.2}
          backside
          backsideThickness={0.3}
        />
        <Edges threshold={20} color="#bfe6f5" />
      </mesh>
      <Architecture />
      <Engineering />
      <Mining />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Iluminación de render: sol de atardecer con sombras sobre la pieza  */
/* ------------------------------------------------------------------ */
function KeyLight({ shadows }: { shadows: boolean }) {
  const target = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    target.position.set(SITE.x, padHeight(), SITE.z);
    target.updateMatrixWorld();
  }, [target]);
  return (
    <>
      <primitive object={target} />
      <directionalLight
        target={target}
        position={[SITE.x - 5.5, padHeight() + 7, SITE.z + 4.5]}
        intensity={2.6}
        color="#ffd2a1"
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-camera-near={1}
        shadow-camera-far={20}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const scene = useThree((s) => s.scene);
  const base = useRef({ pos: new THREE.Vector3(), look: new THREE.Vector3() });
  useEffect(() => {
    const y = padHeight();
    const portrait = isPortrait(size.width, size.height);
    const setFog = (near: number, far: number) => {
      terrainUniforms.uFogNear.value = near;
      terrainUniforms.uFogFar.value = far;
      if (scene.fog instanceof THREE.Fog) {
        scene.fog.near = near;
        scene.fog.far = far;
      }
    };
    if (portrait) {
      base.current.look.set(SITE.x, y + 0.9, SITE.z);
      base.current.pos.set(SITE.x - 2.6, y + 5.8, SITE.z + 9.8);
      camera.fov = 42;
      camera.clearViewOffset();
      setFog(10, 26);
    } else {
      // Pieza grande en la mitad derecha: el centro de proyección se corre a la derecha.
      base.current.look.set(SITE.x, y + 0.95, SITE.z);
      base.current.pos.set(SITE.x - 5.1, y + 5.0, SITE.z + 13.2);
      camera.fov = 32;
      camera.setViewOffset(size.width, size.height, -size.width * 0.25, -size.height * 0.01, size.width, size.height);
      setFog(13, 30);
    }
    camera.position.copy(base.current.pos);
    camera.updateProjectionMatrix();
  }, [size, camera, scene]);

  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05);
    const b = base.current;
    // Al hacer scroll la cámara se acerca a la pieza.
    tmp.copy(b.pos).lerp(b.look, 0.35 * scrollEase());
    camera.position.x = THREE.MathUtils.damp(camera.position.x, tmp.x, 3, d);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, tmp.y, 3, d);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, tmp.z, 3, d);
    camera.lookAt(b.look);
  });
  return null;
}

/* ------------------------------------------------------------------ */
export default function HeroScene({ eventSource }: { eventSource: RefObject<HTMLElement | null> }) {
  const inView = useScene((s) => s.heroInView);
  const [dpr, setDpr] = useState<number | [number, number]>([1, 1.75]);
  const [quality, setQuality] = useState<"high" | "low">("high");
  const y = padHeight();

  return (
    <Canvas
      flat
      shadows="percentage"
      dpr={dpr}
      frameloop={inView ? "always" : "never"}
      eventSource={eventSource as RefObject<HTMLElement>}
      eventPrefix="client"
      camera={{ position: [SITE.x - 3.4, y + 3.6, SITE.z + 8.6], fov: 34, near: 0.1, far: 90 }}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance", stencil: false }}
    >
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => {
          setDpr(1);
          setQuality("low");
        }}
        onIncline={() => setDpr([1, 1.75])}
        onFallback={() => {
          setDpr(1);
          setQuality("low");
        }}
      />
      <color attach="background" args={["#003647"]} />
      <fog attach="fog" args={["#003647", 13, 30]} />
      <hemisphereLight args={["#d6ecf6", "#0b4153", 0.75]} />
      <ambientLight intensity={0.15} color="#8fb6c4" />
      <KeyLight shadows={quality === "high"} />
      <directionalLight position={[SITE.x + 6, y + 4, SITE.z - 6]} intensity={1.4} color="#78b0c8" />
      <directionalLight position={[SITE.x + 2, y + 2.5, SITE.z + 7]} intensity={0.55} color="#fff1e0" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} color="#9fd3ea" position={[6, 3, -4]} scale={[6, 4, 1]} />
        <Lightformer form="rect" intensity={3.2} color="#ffd2a0" position={[-6, 4, 4]} scale={[5, 3, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ffffff" position={[0, 6, 6]} scale={[8, 2, 1]} />
        <Lightformer form="ring" intensity={1.6} color="#ffffff" position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={4} />
      </Environment>

      <Director />
      <CameraRig />
      <Terrain />
      <ContactShadows position={[SITE.x, y + 0.004, SITE.z]} scale={10} blur={2.6} far={2.5} opacity={0.6} resolution={512} color="#001820" />
      <Pedestal quality={quality} />

      {quality === "high" ? (
        <EffectComposer multisampling={4}>
          <N8AO aoRadius={0.55} intensity={2.4} distanceFalloff={0.7} quality="medium" halfRes />
          <Bloom mipmapBlur intensity={0.28} luminanceThreshold={0.92} luminanceSmoothing={0.15} />
        </EffectComposer>
      ) : (
        <></>
      )}
    </Canvas>
  );
}
