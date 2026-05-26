'use client';

import React, { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const MAX_RIPPLES = 16; // How many ripples can be active at once

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec2 uResolution;
  uniform float uIsDark;
  
  // Array of ripples: xy = position, z = age (0 to 1)
  uniform vec3 uRipples[${MAX_RIPPLES}];
  uniform int uRippleCount;

  varying vec2 vUv;

  void main() {
    // Aspect-corrected UV space: [-1, 1] range
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    vec2 ppp = -1.0 + 2.0 * uv;
    ppp.x *= aspect;

    float waveAccumulator = 0.0;

    // Loop through all active ripples to calculate interference pattern
    for(int i = 0; i < ${MAX_RIPPLES}; i++) {
      if (i >= uRippleCount) break;
      
      vec3 ripple = uRipples[i];
      vec2 rPos = ripple.xy;
      rPos.x *= aspect; // Correct mouse position to aspect ratio
      
      float age = ripple.z; // 0.0 (new) to 1.0 (dead)
      
      float dist = length(ppp - rPos);
      
      // Ripple expands outwards over time
      float radius = age * 2.5; 
      
      // The wave function (creates the rings)
      // Higher multiplier = more rings
      float wave = sin((dist - radius) * 40.0);
      
      // Envelope: limits the wave to a ring shape that fades over time
      // The width of the ring expands slightly as it ages
      float ringWidth = 0.15 + (age * 0.2);
      float envelope = smoothstep(ringWidth, 0.0, abs(dist - radius));
      
      // Fade out as it gets older
      envelope *= pow(1.0 - age, 2.0); 
      
      waveAccumulator += wave * envelope;
    }

    // Add a slight glow exactly at the cursor for better interactivity feedback
    vec2 currentMouse = uRippleCount > 0 ? uRipples[0].xy : vec2(0.0);
    currentMouse.x *= aspect;
    float mouseGlow = 0.0;
    if (uRippleCount > 0) {
      mouseGlow = smoothstep(0.8, 0.0, length(ppp - currentMouse)) * 0.15;
    }

    // Combine accumulated waves and normalize slightly to prevent blowing out whites
    // Increased multiplier to make the ripple much more visible
    float finalPattern = waveAccumulator * 2.5;
    
    // Smooth edges to fade into background
    float edgeFade = smoothstep(0.0, 0.2, uv.x) * smoothstep(1.0, 0.8, uv.x)
                   * smoothstep(0.0, 0.2, uv.y) * smoothstep(1.0, 0.8, uv.y);

    // -----------------------------------------------------------------------
    // Theme-aware coloring
    // -----------------------------------------------------------------------
    // Light mode: High Contrast Black & White (Black shadows, White highlights)
    vec3 lightColor = mix(
      vec3(0.0, 0.0, 0.0), // Deep Black shadow
      vec3(1.0, 1.0, 1.0), // Pure White highlight
      finalPattern * 0.5 + 0.5
    );
    // Greatly boosted alpha for visibility
    float lightAlpha = clamp(abs(finalPattern) * 2.0 * edgeFade + mouseGlow * 1.5, 0.0, 1.0);

    // Dark mode: High Contrast Black & White
    vec3 darkColor = mix(
      vec3(0.0, 0.0, 0.0), // Deep Black shadow
      vec3(1.0, 1.0, 1.0), // Pure White highlight
      finalPattern * 0.5 + 0.5
    );
    float darkAlpha = clamp(abs(finalPattern) * 2.0 * edgeFade + mouseGlow * 1.5, 0.0, 1.0);

    // Interpolate between themes
    vec3 finalColor = mix(lightColor, darkColor, uIsDark);
    float finalAlpha = mix(lightAlpha, darkAlpha, uIsDark);
    
    // Ensure alpha doesn't go below 0
    finalAlpha = max(0.0, finalAlpha);

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;

interface RippleShaderProps {
  isDarkMode: boolean;
  rippleUniforms: any; // { uRipples, uRippleCount }
}

export default function RippleShader({
  isDarkMode,
  rippleUniforms
}: RippleShaderProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  const uniforms = useMemo(() => {
    return {
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uIsDark: { value: isDarkMode ? 1.0 : 0.0 },
      uRipples: rippleUniforms.uRipples,
      uRippleCount: rippleUniforms.uRippleCount,
    };
  }, [rippleUniforms]);

  useFrame((state, delta) => {
    if (!materialRef.current) return;
    const mat = materialRef.current;

    // Handle theme transition smoothly
    const targetDark = isDarkMode ? 1.0 : 0.0;
    mat.uniforms.uIsDark.value += (targetDark - mat.uniforms.uIsDark.value) * 0.05;
    mat.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -100]} frustumCulled={false}>
      <planeGeometry args={[viewport.width * 2.5, viewport.height * 2.5]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
