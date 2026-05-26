import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const MAX_RIPPLES = 16;
const AGING_SPEED = 0.4;

interface Ripple {
  x: number;
  y: number;
  age: number;
}

export function useMouseRipples(mousePosition: { x: number; y: number }) {
  const ripplesRef = useRef<Ripple[]>([]);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const uniforms = useMemo(() => {
    const initialRipples = Array.from({ length: MAX_RIPPLES }, () => new THREE.Vector3(0, 0, 0));
    return {
      uRipples: { value: initialRipples },
      uRippleCount: { value: 0 }
    };
  }, []);

  useFrame((_, delta) => {
    // Check for mouse movement to spawn new ripples
    const targetX = mousePosition.x;
    const targetY = mousePosition.y;
    
    const dx = targetX - lastMousePos.current.x;
    const dy = targetY - lastMousePos.current.y;
    const distMoved = Math.sqrt(dx * dx + dy * dy);

    // If mouse moved significantly, spawn a new ripple
    if (distMoved > 0.02) {
      ripplesRef.current.unshift({
        x: targetX,
        y: targetY,
        age: 0
      });
      lastMousePos.current.x = targetX;
      lastMousePos.current.y = targetY;
    }

    // Age all ripples and remove old ones
    ripplesRef.current = ripplesRef.current
      .map(r => ({ ...r, age: r.age + delta * AGING_SPEED }))
      .filter(r => r.age < 1.0); // Remove when age reaches 1.0
      
    // Enforce max ripples
    if (ripplesRef.current.length > MAX_RIPPLES) {
      ripplesRef.current = ripplesRef.current.slice(0, MAX_RIPPLES);
    }

    // Update uniforms
    const rippleCount = ripplesRef.current.length;
    uniforms.uRippleCount.value = rippleCount;
    
    for (let i = 0; i < MAX_RIPPLES; i++) {
      if (i < rippleCount) {
        const r = ripplesRef.current[i];
        uniforms.uRipples.value[i].set(r.x, r.y, r.age);
      } else {
        uniforms.uRipples.value[i].set(0, 0, 0); // Zero out unused
      }
    }
  });

  return uniforms;
}
