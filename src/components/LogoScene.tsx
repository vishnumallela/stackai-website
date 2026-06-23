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
  const stepsRef = useRef<Object3D[]>([]);

  // Play any baked clips the GLB carries (the static logo has none).
  useEffect(() => {
    names.forEach((name) => actions[name]?.reset().fadeIn(0.3).play());
    return () => {
      names.forEach((name) => actions[name]?.fadeOut(0.3));
    };
  }, [actions, names]);

  // Collect the step meshes (Cube.001…006) to animate them, low → high.
  useEffect(() => {
    const steps: Object3D[] = [];
    scene.traverse((o) => {
      if (o.name.startsWith("Cube") && (o as { isMesh?: boolean }).isMesh) {
        steps.push(o);
      }
    });
    steps.sort((a, b) => a.position.y - b.position.y);
    stepsRef.current = steps;
  }, [scene]);

  // Idle animation: each step gently rotates around its vertical axis
  // (alternating direction). Rotation keeps the stack touching — no gaps.
  useFrame((_, dt) => {
    const steps = stepsRef.current;
    const d = Math.min(dt, 0.05);
    for (let i = 0; i < steps.length; i++) {
      steps[i].rotation.y += d * 0.4 * (i % 2 === 0 ? 1 : -1);
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
