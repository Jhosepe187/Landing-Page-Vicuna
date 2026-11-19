import { create } from "zustand";
import type { ProjectType, Rubro } from "@/content/site";

type Phase = "loading" | "reveal" | "done";

type SceneState = {
  rubro: Rubro;
  setRubro: (r: Rubro) => void;
  /** Fase del preloader; el hero orquesta su entrada a partir de "reveal". */
  phase: Phase;
  setPhase: (p: Phase) => void;
  /** La escena 3D pintó su primer frame. */
  sceneReady: boolean;
  setSceneReady: () => void;
  heroInView: boolean;
  setHeroInView: (v: boolean) => void;
  /** Los rubros rotan solos cada 3 s hasta que el usuario elige uno. */
  autoCycle: boolean;
  stopAutoCycle: () => void;
  /** El cursor está sobre la pieza 3D (la hace girar y pausa la rotación de rubros). */
  hover3D: boolean;
  setHover3D: (v: boolean) => void;
  /** Tipo de proyecto precargado en el formulario desde "Quiero algo similar". */
  prefill: { type: ProjectType; note?: string; nonce: number } | null;
  setPrefill: (type: ProjectType, note?: string) => void;
};

export const useScene = create<SceneState>((set) => ({
  rubro: "arquitectura",
  setRubro: (rubro) => set({ rubro }),
  phase: "loading",
  setPhase: (phase) => set({ phase }),
  sceneReady: false,
  setSceneReady: () => set({ sceneReady: true }),
  heroInView: true,
  setHeroInView: (heroInView) => set({ heroInView }),
  autoCycle: true,
  stopAutoCycle: () => set({ autoCycle: false }),
  hover3D: false,
  setHover3D: (hover3D) => set({ hover3D }),
  prefill: null,
  setPrefill: (type, note) => set({ prefill: { type, note, nonce: Date.now() } }),
}));
