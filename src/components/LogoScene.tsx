import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Bounds,
  Center,
  Environment,
  Lightformer,
  useAnimations,
  useGLTF,
} from "@react-three/drei";
import type { Group, Object3D } from "three";

const MODEL_URL = "/models/stackai_logo.glb";
useGLTF.preload(MODEL_URL);

function Model() {
  const ref = useRef<Group>(null);
  const { scene, animations } = useGLTF(MODEL_URL);
  const { actions, names } = useAnimations(animations, ref);
  const stepsRef = useRef<
    { obj: Object3D; phase: number; period: number; settle: number; dir: number }[]
  >([]);

  // Play any baked clips the GLB carries (the static logo has none).
  useEffect(() => {
    names.forEach((name) => actions[name]?.reset().fadeIn(0.3).play());
    return () => {
      names.forEach((name) => actions[name]?.fadeOut(0.3));
    };
  }, [actions, names]);

  // Every step gets its own staggered rotate-and-settle cycle, so different
  // steps spin at different (random) times — never all at once.
  useEffect(() => {
    const steps: Object3D[] = [];
    scene.traverse((o) => {
      if (o.name.startsWith("Cube") && (o as { isMesh?: boolean }).isMesh) {
        steps.push(o);
      }
    });
    steps.sort((a, b) => a.position.y - b.position.y);
    const rnd = (n: number) => ((n * 9301 + 49297) % 233280) / 233280;
    // Every step rotates, each on its own staggered random cycle.
    const rotating: {
      obj: Object3D;
      phase: number;
      period: number;
      settle: number;
      dir: number;
    }[] = [];
    steps.forEach((obj, i) => {
      obj.rotation.y = 0;
      const period = 5.5 + rnd(i + 1) * 3.5; // 5.5–9s between spins
      rotating.push({
        obj,
        period,
        phase: rnd(i + 7) * period, // random offset so it staggers
        settle: 2.4,
        dir: i % 2 === 0 ? 1 : -1,
      });
    });
    stepsRef.current = rotating;
  }, [scene]);

  // Each step spins one full turn, eases to rest (settle), holds, then repeats.
  // 2π·dir ≡ 0 → seamless loop; staggered phases make it read as random steps.
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const steps = stepsRef.current;
    for (let i = 0; i < steps.length; i++) {
      const { obj, phase, period, settle, dir } = steps[i];
      const local = (t + phase) % period;
      const p = Math.min(local / settle, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      obj.rotation.y = dir * eased * Math.PI * 2;
    }
  });

  return (
    <group ref={ref}>
      <primitive object={scene} />
    </group>
  );
}

/**
 * The stackai logo GLB, playing its own authored animation. Transparent canvas,
 * pointer-events off so it never traps scroll. Glass/transmission + clearcoat
 * materials are lit by an in-memory Lightformer environment (no network HDRI).
 */
export function LogoScene() {
  return (
    <Canvas
      className="absolute! inset-0"
      style={{ pointerEvents: "none" }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 6], fov: 40 }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 6, 5]} intensity={2.5} />
        <directionalLight position={[-5, -2, -4]} intensity={0.6} />
        {/* Small spotlight highlighting the top of the object */}
        <spotLight
          position={[0, 7, 3]}
          angle={0.35}
          penumbra={0.85}
          intensity={7}
          decay={0}
          color="#ffffff"
        />

        <Bounds fit margin={1.2}>
          <Center>
            <Model />
          </Center>
        </Bounds>

        {/* Procedural studio environment — drives reflections + glass refraction. */}
        <Environment resolution={256} frames={1}>
          <Lightformer intensity={3} position={[0, 3, 4]} scale={[8, 8, 1]} />
          <Lightformer intensity={1.6} position={[-6, 1, 2]} rotation-y={Math.PI / 4} scale={[5, 10, 1]} />
          <Lightformer intensity={1.6} position={[6, -1, 2]} rotation-y={-Math.PI / 4} scale={[5, 10, 1]} />
          <Lightformer intensity={2} position={[0, -3, 2]} scale={[8, 4, 1]} />
        </Environment>
      </Suspense>
    </Canvas>
  );
}
