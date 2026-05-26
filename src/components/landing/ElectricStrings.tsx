'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';

/**
 * @component ElectricStrings
 * @description
 * Futuristic glowing electric cables connecting hero section elements to the chef portrait.
 * Each string is a catenary-style curve rendered as a TubeGeometry with a custom
 * ShaderMaterial that produces animated electric glow effects.
 *
 * Physics & Animation:
 * - Curves use CatmullRomCurve3 with intermediate control points
 * - Control points are displaced by 3D simplex noise for organic wind movement
 * - Each string has unique phase offset / frequency for natural variety
 * - Movement is slow and meditative (0.3-0.8 Hz) — "floating in gentle wind"
 *
 * Visual:
 * - Core glow with alpha falloff from center to edges (tube cross-section)
 * - Pulsing brightness along the length (traveling energy)
 * - Theme-aware: electric cyan/blue on dark, warm gold on light
 *
 * Performance:
 * - Tube segments: 64 length × 8 radial (lean geometry)
 * - Simplex noise cached per frame (not per vertex)
 * - frustumCulled disabled (always in viewport)
 */

// ---------------------------------------------------------------------------
// GLSL Shaders for Electric String Material
// ---------------------------------------------------------------------------

const electricVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying float vDistFromCenter;

  uniform float uTime;
  uniform float uChaos;
  uniform float uPulseOffset;

  // Pseudo-random hash
  float hash(float n) { return fract(sin(n) * 1e4); }
  
  // 3D Noise for electricity
  float noise(vec3 x) {
    const vec3 step = vec3(110.0, 241.0, 171.0);
    vec3 i = floor(x);
    vec3 f = fract(x);
    float n = dot(i, step);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(n + dot(step, vec3(0, 0, 0))), hash(n + dot(step, vec3(1, 0, 0))), u.x),
                   mix(hash(n + dot(step, vec3(0, 1, 0))), hash(n + dot(step, vec3(1, 1, 0))), u.x), u.y),
               mix(mix(hash(n + dot(step, vec3(0, 0, 1))), hash(n + dot(step, vec3(1, 0, 1))), u.x),
                   mix(hash(n + dot(step, vec3(0, 1, 1))), hash(n + dot(step, vec3(1, 1, 1))), u.x), u.y), u.z);
  }

  void main() {
    vUv = uv;
    vDistFromCenter = abs(uv.y - 0.5) * 2.0;

    vec3 pos = position;

    // High frequency electricity noise (chaotic jitter)
    float timeFast = uTime * 20.0 + uPulseOffset * 10.0; 
    vec3 noisePos = vec3(vUv.x * 25.0, timeFast, 0.0);
    
    // Create jagged displacement
    float nx = noise(noisePos) * 2.0 - 1.0;
    float ny = noise(noisePos + vec3(100.0)) * 2.0 - 1.0;
    float nz = noise(noisePos + vec3(200.0)) * 2.0 - 1.0;

    // Fade chaos at the ends so it connects cleanly to the DOM elements
    float endFade = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);

    pos.x += nx * uChaos * endFade;
    pos.y += ny * uChaos * endFade;
    pos.z += nz * uChaos * endFade;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const electricFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uIsDark;
  uniform float uPulseOffset;
  uniform float uIntensity;

  varying vec2 vUv;
  varying float vDistFromCenter;

  void main() {
    // -----------------------------------------------------------------------
    // Black Core with Red Outer Glow (Haoshoku Haki)
    // -----------------------------------------------------------------------
    // vDistFromCenter is 0 at center, 1 at edge
    float coreMask = 1.0 - smoothstep(0.0, 0.35, vDistFromCenter); // Black core area
    float edgeMask = (1.0 - smoothstep(0.3, 1.0, vDistFromCenter)) * 0.8; // Red edge area

    // Colors based on theme (uIsDark)
    // Dark mode: Bright Cyan / Blue
    vec3 darkCore = vec3(0.5, 0.9, 1.0);
    vec3 darkEdge = vec3(0.0, 0.4, 1.0);
    
    // Light mode: Warm Gold / Orange
    vec3 lightCore = vec3(1.0, 0.9, 0.5);
    vec3 lightEdge = vec3(1.0, 0.4, 0.0);

    vec3 coreColor = mix(lightCore, darkCore, uIsDark);
    vec3 edgeColor = mix(lightEdge, darkEdge, uIsDark);

    // Combine colors: if inside coreMask, it's coreColor. Otherwise edgeColor.
    vec3 finalColor = mix(edgeColor, coreColor, coreMask);

    // -----------------------------------------------------------------------
    // Traveling energy pulse
    // -----------------------------------------------------------------------
    float pulse = sin(vUv.x * 12.0 - uTime * 3.5 + uPulseOffset) * 0.5 + 0.5;
    float fastPulse = sin(vUv.x * 24.0 + uTime * 6.0 + uPulseOffset * 2.0) * 0.5 + 0.5;
    float energy = mix(0.5, 1.0, pulse * 0.6 + fastPulse * 0.4);

    // Endpoint fade
    float endFade = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x);

    // Alpha logic: Core is always solid, edge pulses with energy
    float alpha = (coreMask + edgeMask * energy) * endFade * uIntensity;

    gl_FragColor = vec4(finalColor, clamp(alpha, 0.0, 1.0));
  }
`;

// ---------------------------------------------------------------------------
// Helper: DOM to World Coordinate Mapping (Allocation-Free)
// ---------------------------------------------------------------------------
const domToWorld = (el: HTMLElement, target: THREE.Vector3): void => {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  
  const sx = cx - window.innerWidth / 2;
  const sy = -(cy - window.innerHeight / 2);
  
  const visibleHeight = 2 * Math.tan((50 / 2) * Math.PI / 180) * 500;
  const scale = visibleHeight / window.innerHeight;
  
  target.set(sx * scale, sy * scale, 0);
};

// ---------------------------------------------------------------------------
// Helper: Update TubeGeometry In-Place (Zero Allocation / No GPU buffer churn)
// ---------------------------------------------------------------------------
function updateTubeGeometryInPlace(
  geometry: THREE.BufferGeometry,
  curve: THREE.CatmullRomCurve3,
  tubularSegments: number,
  radialSegments: number,
  radius: number
): void {
  const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
  const normalAttribute = geometry.getAttribute('normal') as THREE.BufferAttribute;
  
  if (!positionAttribute || !normalAttribute) return;

  const positions = positionAttribute.array as Float32Array;
  const normals = normalAttribute.array as Float32Array;

  // These calculate positions along the spline and return Frenet frames
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const points = curve.getPoints(tubularSegments);

  const normalHelper = new THREE.Vector3();
  let vertexIndex = 0;

  for (let i = 0; i <= tubularSegments; i++) {
    const point = points[i];
    const N = frames.normals[i];
    const B = frames.binormals[i];

    for (let j = 0; j <= radialSegments; j++) {
      const v = (j / radialSegments) * Math.PI * 2;
      const sin = Math.sin(v);
      const cos = -Math.cos(v); // matches Three.js core implementation exactly

      // normalHelper = cos * N + sin * B
      normalHelper.x = cos * N.x + sin * B.x;
      normalHelper.y = cos * N.y + sin * B.y;
      normalHelper.z = cos * N.z + sin * B.z;
      normalHelper.normalize();

      // Write normal
      normals[vertexIndex] = normalHelper.x;
      normals[vertexIndex + 1] = normalHelper.y;
      normals[vertexIndex + 2] = normalHelper.z;

      // Write position: point + radius * normalHelper
      positions[vertexIndex] = point.x + radius * normalHelper.x;
      positions[vertexIndex + 1] = point.y + radius * normalHelper.y;
      positions[vertexIndex + 2] = point.z + radius * normalHelper.z;

      vertexIndex += 3;
    }
  }

  positionAttribute.needsUpdate = true;
  normalAttribute.needsUpdate = true;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ConnectionRefData {
  id: string;
  ref: React.RefObject<HTMLElement | null>;
}

interface ElectricStringsProps {
  connectionRefs: ConnectionRefData[];
  targetRef: React.RefObject<HTMLElement | null>;
  isDarkMode: boolean;
}

// ---------------------------------------------------------------------------
// Single Electric String Sub-component
// ---------------------------------------------------------------------------

function ElectricString({
  sourceRef,
  targetRef,
  isDarkMode,
  index,
  noise3D,
}: {
  sourceRef: React.RefObject<HTMLElement | null>;
  targetRef: React.RefObject<HTMLElement | null>;
  isDarkMode: boolean;
  index: number;
  noise3D: ReturnType<typeof createNoise3D>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Unique phase offset per string for visual variety
  const pulseOffset = useMemo(() => index * 1.7 + Math.random() * Math.PI, [index]);
  const noiseOffset = useMemo(() => index * 137.5, [index]);

  const windConfig = useMemo(
    () => ({
      speedX: 0.15 + Math.random() * 0.15,
      speedY: 0.20 + Math.random() * 0.15,
      amplitudeX: 25 + Math.random() * 30,
      amplitudeY: 15 + Math.random() * 25,
      amplitudeZ: 8 + Math.random() * 12,
    }),
    []
  );

  // Pre-allocate the curve once. It will be mutated in-place during useFrame.
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3()
      ],
      false,
      'catmullrom',
      0.5
    );
  }, []);

  // Pre-allocate the geometry once on mount, using a dummy straight curve
  const geometry = useMemo(() => {
    const dummyCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, 2),
      new THREE.Vector3(0, 0, 3),
      new THREE.Vector3(0, 0, 4)
    ]);
    return new THREE.TubeGeometry(dummyCurve, 32, 1.2, 6, false);
  }, []);

  // Ensure proper GPU memory deallocation when unmounting
  React.useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  // Remove isDarkMode from dependency array! The theme value is updated smoothly in useFrame
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIsDark: { value: isDarkMode ? 1.0 : 0.0 },
      uPulseOffset: { value: pulseOffset },
      uIntensity: { value: 0.8 },
      uChaos: { value: 15.0 }, // Amplitude of the chaotic lightning zap
    }),
    [pulseOffset]
  );

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;
    if (!sourceRef.current || !targetRef.current) return; // Wait until elements exist

    const time = state.clock.elapsedTime;
    const mat = materialRef.current;

    // Update uniforms
    mat.uniforms.uTime.value = time;
    const targetDark = isDarkMode ? 1.0 : 0.0;
    mat.uniforms.uIsDark.value += (targetDark - mat.uniforms.uIsDark.value) * 0.03;

    // -----------------------------------------------------------------------
    // Real-time endpoint tracking (Parallax & Floating Animation)
    // -----------------------------------------------------------------------
    const p = curve.points;
    domToWorld(sourceRef.current, p[0]);
    domToWorld(targetRef.current, p[4]);

    // -----------------------------------------------------------------------
    // Wind-displaced control points using simplex noise (Allocation-free lerps)
    // -----------------------------------------------------------------------
    p[2].lerpVectors(p[0], p[4], 0.5); // mid
    p[1].lerpVectors(p[0], p[4], 0.25); // q1
    p[3].lerpVectors(p[0], p[4], 0.75); // q3

    // Apply simplex noise displacement
    const nx1 = noise3D(noiseOffset + 0.0, time * windConfig.speedX, 0) * windConfig.amplitudeX;
    const ny1 = noise3D(noiseOffset + 100, time * windConfig.speedY, 0) * windConfig.amplitudeY;
    const nz1 = noise3D(noiseOffset + 200, time * windConfig.speedX * 0.7, 0) * windConfig.amplitudeZ;

    const nx2 = noise3D(noiseOffset + 300, time * windConfig.speedX * 0.8, 0) * windConfig.amplitudeX * 1.2;
    const ny2 = noise3D(noiseOffset + 400, time * windConfig.speedY * 0.9, 0) * windConfig.amplitudeY * 1.1;
    const nz2 = noise3D(noiseOffset + 500, time * windConfig.speedX * 0.6, 0) * windConfig.amplitudeZ;

    const nx3 = noise3D(noiseOffset + 600, time * windConfig.speedX * 0.7, 0) * windConfig.amplitudeX * 0.8;
    const ny3 = noise3D(noiseOffset + 700, time * windConfig.speedY * 1.1, 0) * windConfig.amplitudeY * 0.9;
    const nz3 = noise3D(noiseOffset + 800, time * windConfig.speedX * 0.5, 0) * windConfig.amplitudeZ;

    p[1].x += nx1; p[1].y += ny1; p[1].z += nz1;
    p[2].x += nx2; p[2].y += ny2; p[2].z += nz2;
    p[3].x += nx3; p[3].y += ny3; p[3].z += nz3;

    // Mutate the geometry buffer in-place
    updateTubeGeometryInPlace(geometry, curve, 32, 6, 1.2);
  });

  return (
    <mesh ref={meshRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={electricVertexShader}
        fragmentShader={electricFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        side={THREE.DoubleSide}
        blending={THREE.NormalBlending}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Main ElectricStrings Component
// ---------------------------------------------------------------------------

export default function ElectricStrings({
  connectionRefs,
  targetRef,
  isDarkMode,
}: ElectricStringsProps) {
  // Single noise instance shared across all strings for coherent wind
  const noise3D = useMemo(() => createNoise3D(), []);

  if (!connectionRefs || connectionRefs.length === 0) return null;

  return (
    <group>
      {connectionRefs.map((conn, i) => (
        <ElectricString
          key={conn.id}
          sourceRef={conn.ref}
          targetRef={targetRef}
          isDarkMode={isDarkMode}
          index={i}
          noise3D={noise3D}
        />
      ))}
    </group>
  );
}
