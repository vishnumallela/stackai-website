import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

import type { VisualProps } from "./types";

/* A GLSL backdrop that fills the whole section: a domain-warped fractal-noise
   field (fluid/field-dynamics motion) quantized with 8x8 Bayer ordered
   dithering, tinted live to the active capability's accent. Pure shader — no
   dots, no lines. */

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0); // fullscreen quad, ignore camera
  }
`;

const frag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uAccent;
  uniform vec2 uRes;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.02 + 7.1; a *= 0.5; }
    return v;
  }

  // Compact 8x8 Bayer ordered-dither threshold in [0,1).
  float Bayer2(vec2 a) { a = floor(a); return fract(a.x * 0.5 + a.y * a.y * 0.75); }
  #define Bayer4(a) (Bayer2(0.5 * (a)) * 0.25 + Bayer2(a))
  #define Bayer8(a) (Bayer4(0.5 * (a)) * 0.25 + Bayer2(a))

  void main() {
    // Pixelate into chunky dither cells so the ordered pattern is visible.
    float PIX = 3.0;
    vec2 cell = floor(gl_FragCoord.xy / PIX);

    vec2 uv = (cell * PIX) / max(uRes, vec2(1.0));
    uv.x *= uRes.x / max(uRes.y, 1.0);
    float t = uTime * 0.04;

    // domain warp → flowing field
    vec2 q = vec2(fbm(uv * 2.2 + t), fbm(uv * 2.2 + vec2(5.2, 1.3) - t));
    float f = fbm(uv * 2.4 + q * 1.8 + t * 0.5);
    float g = smoothstep(0.06, 0.96, f);

    // ordered (Bayer 8x8) dithering into a few bands — the visible dither look
    float levels = 4.0;
    float gd = floor(g * levels + Bayer8(cell)) / levels;

    vec3 base = vec3(0.012, 0.012, 0.018);
    vec3 col = mix(base, uAccent, gd * 0.6);

    // soft focal vignette doubles as alpha so edges melt into the card
    float vig = smoothstep(1.25, 0.16, length(vUv - 0.5));
    col *= mix(0.45, 1.0, vig);
    gl_FragColor = vec4(col, vig);
  }
`;

function Field({ accent, reduced }: VisualProps) {
  const ref = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  // Lazy init so the Color isn't reallocated and discarded on every render.
  const target = useRef<THREE.Color>(null!);
  if (!target.current) target.current = new THREE.Color(accent);

  useEffect(() => {
    target.current.set(accent);
  }, [accent]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAccent: { value: new THREE.Color(accent) },
      uRes: { value: new THREE.Vector2(1, 1) },
    }),
    // accent is only the seed; live changes are lerped in useFrame
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame((_, delta) => {
    const m = ref.current;
    if (!m) return;
    if (!reduced) m.uniforms.uTime.value += delta;
    m.uniforms.uRes.value.set(size.width, size.height);
    (m.uniforms.uAccent.value as THREE.Color).lerp(target.current, 0.05);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={ref} uniforms={uniforms} vertexShader={vert} fragmentShader={frag} transparent depthWrite={false} />
    </mesh>
  );
}

export function SolutionsBackdrop(props: VisualProps) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <Canvas dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }} frameloop={props.reduced ? "demand" : "always"}>
        <Field {...props} />
      </Canvas>
    </div>
  );
}
