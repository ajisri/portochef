import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ==========================================================================
 * useMouseRipples — Array-based ripple uniform provider
 * ==========================================================================
 *
 * This hook maintains a ring buffer of recent mouse positions with ages,
 * exposed as a uniform array for use by WebGLHeading's vertex distortion.
 *
 * Each ripple entry = vec3(x, y, age):
 *   - x, y: normalized mouse position in [-1, 1] clip space
 *   - age:  0.0 (just spawned) → 1.0 (expired, removed)
 *
 * The key behavior matching the Olivier Larose demo:
 * - Ripples are ONLY spawned when the mouse moves beyond a threshold
 * - When the mouse stops, no new ripples are added
 * - Existing ripples continue aging and fading naturally
 *
 * This means stationary cursor = zero visual effect, matching the
 * "movement-only" interaction pattern of homunculus.jp
 */

const MAX_RIPPLES = 16;
const AGING_SPEED = 0.4;
const SPAWN_THRESHOLD = 0.02; // Minimum movement to spawn a new ripple

interface Ripple {
  x: number;
  y: number;
  age: number;
}

export function useMouseRipples(mousePosition: { x: number; y: number }) {
  const ripplesRef = useRef<Ripple[]>([]);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const uniforms = useMemo(() => {
    const initialRipples = Array.from(
      { length: MAX_RIPPLES },
      () => new THREE.Vector3(0, 0, 0)
    );
    return {
      uRipples: { value: initialRipples },
      uRippleCount: { value: 0 },
    };
  }, []);

  useFrame((_, delta) => {
    // -----------------------------------------------------------------------
    // Spawn new ripple only if mouse moved beyond threshold
    // -----------------------------------------------------------------------
    const targetX = mousePosition.x;
    const targetY = mousePosition.y;

    const dx = targetX - lastMousePos.current.x;
    const dy = targetY - lastMousePos.current.y;
    const distMoved = Math.sqrt(dx * dx + dy * dy);

    if (distMoved > SPAWN_THRESHOLD) {
      ripplesRef.current.unshift({
        x: targetX,
        y: targetY,
        age: 0,
      });
      lastMousePos.current.x = targetX;
      lastMousePos.current.y = targetY;
    }

    // -----------------------------------------------------------------------
    // Age all ripples and remove expired ones
    // -----------------------------------------------------------------------
    ripplesRef.current = ripplesRef.current
      .map(r => ({ ...r, age: r.age + delta * AGING_SPEED }))
      .filter(r => r.age < 1.0);

    // Enforce max ripples (drop oldest)
    if (ripplesRef.current.length > MAX_RIPPLES) {
      ripplesRef.current = ripplesRef.current.slice(0, MAX_RIPPLES);
    }

    // -----------------------------------------------------------------------
    // Write to uniforms (no allocation — mutate existing Vector3s)
    // -----------------------------------------------------------------------
    const rippleCount = ripplesRef.current.length;
    uniforms.uRippleCount.value = rippleCount;

    for (let i = 0; i < MAX_RIPPLES; i++) {
      if (i < rippleCount) {
        const r = ripplesRef.current[i];
        uniforms.uRipples.value[i].set(r.x, r.y, r.age);
      } else {
        uniforms.uRipples.value[i].set(0, 0, 0); // Zero out unused slots
      }
    }
  });

  return uniforms;
}
