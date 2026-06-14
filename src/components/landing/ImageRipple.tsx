'use client';

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

/**
 * @component ImageRippleShader
 * @description
 * Inner R3F component that applies the UV displacement liquid distortion to the texture.
 * Handles mouse tracking, aspect-ratio correction, and the grayscale-to-color transition.
 */
function ImageRippleShader({ imageUrl }: { imageUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport, size } = useThree();
  const texture = useTexture(imageUrl);

  // Use lerp targets for smooth animation
  const mouse = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5, lastMoveMs: 0 });
  const hoverState = useRef({ value: 0, target: 0 }); // 0 = grayscale, 1 = colored
  const movingState = useRef({ value: 0, target: 0 }); // 0 = stopped, 1 = moving

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0.0 },
      uMoving: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uImageSize: { value: new THREE.Vector2((texture.image as any)?.width || 1024, (texture.image as any)?.height || 1024) },
    }),
    [texture, size]
  );

  useFrame((state) => {
    if (!materialRef.current) return;
    const mat = materialRef.current;

    // Time
    mat.uniforms.uTime.value = state.clock.elapsedTime;

    // Smooth mouse interpolation
    mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.05;
    mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.05;
    mat.uniforms.uMouse.value.set(mouse.current.x, mouse.current.y);

    // Smooth hover state (grayscale to color)
    hoverState.current.value += (hoverState.current.target - hoverState.current.value) * 0.05;
    mat.uniforms.uHover.value = hoverState.current.value;

    // Smooth moving state (ripple distortion)
    const timeSinceMove = performance.now() - mouse.current.lastMoveMs;
    const isMoving = timeSinceMove < 150; // 150ms timeout
    movingState.current.target = isMoving ? 1.0 : 0.0;
    movingState.current.value += (movingState.current.target - movingState.current.value) * 0.08;
    mat.uniforms.uMoving.value = movingState.current.value;

    // Update resolution on resize
    mat.uniforms.uResolution.value.set(size.width, size.height);
  });

  const handlePointerMove = (e: any) => {
    // Convert to normalized UV space (0 to 1)
    mouse.current.targetX = e.uv.x;
    mouse.current.targetY = e.uv.y;
    mouse.current.lastMoveMs = performance.now();
    // When moving, keep hover active
    hoverState.current.target = 1.0;
  };

  const handlePointerEnter = () => {
    hoverState.current.target = 1.0;
  };

  const handlePointerLeave = () => {
    hoverState.current.target = 0.0;
    // Return mouse target to center smoothly when leaving
    mouse.current.targetX = 0.5;
    mouse.current.targetY = 0.5;
  };

  const vertexShader = /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = /* glsl */ `
    precision highp float;

    uniform sampler2D uTexture;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform float uHover;
    uniform float uMoving;
    uniform vec2 uResolution;
    uniform vec2 uImageSize;

    varying vec2 vUv;

    // Function to calculate aspect ratio-correct UVs (object-fit: cover)
    vec2 getCoverUv(vec2 uv, vec2 resolution, vec2 imageSize) {
      vec2 ratio = vec2(
        min((resolution.x / resolution.y) / (imageSize.x / imageSize.y), 1.0),
        min((resolution.y / resolution.x) / (imageSize.y / imageSize.x), 1.0)
      );
      vec2 coverUv = vec2(
        uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        uv.y * ratio.y + (1.0 - ratio.y) * 0.5
      );
      return coverUv;
    }

    void main() {
      // 1. Aspect Ratio Correction
      vec2 coverUv = getCoverUv(vUv, uResolution, uImageSize);

      // 2. Setup Aspect-Corrected Coordinates for Ripple Math
      // We want the ripple to be perfectly circular, not stretched by the canvas shape
      float aspect = uResolution.x / uResolution.y;
      vec2 pos = vUv; // Use canvas UV for interaction
      vec2 mousePos = uMouse;
      
      // Scale X to match aspect ratio so distance calculations are circular
      pos.x *= aspect;
      mousePos.x *= aspect;

      // Scale vUv so the image occupies exactly the central portion of the 130% canvas
      // The canvas is 1.3x the container. The image is 1.0x.
      // So padding on each side is (1.3 - 1.0) / 2.0 = 0.15 of the container.
      // In normalized UV of the canvas (which is 1.3), the image spans from:
      // (1.3 - 1.0) / 2 / 1.3 = 0.11538 to 1.0 - 0.11538 = 0.88461.
      
      float scale = 1.3;
      float ratio = 1.0 / scale;
      float pad = (1.0 - ratio) / 2.0;
      vec2 paddedUv = (vUv - pad) / ratio;
      
      // 3. Object-fit cover logic will be applied LATER
      // First, calculate the distortion

      // Liquid Ripple Distortion Algorithm (Homunculus style UV bending)
      float waveSpeed = mod(uTime * 2.5, 6.2831853);
      float waveFrequency = 15.0;
      
      // Multiply by uMoving so distortion completely stops when cursor is still
      float dist = distance(pos, mousePos);
      float rippleRadius = mix(0.0, 0.45, uHover);
      float falloff = smoothstep(rippleRadius, 0.0, dist);
      float distortionIntensity = 0.05 * falloff * uHover * uMoving; 

      vec2 distortion = vec2(
        sin(dist * waveFrequency - waveSpeed) * distortionIntensity,
        cos(dist * waveFrequency - waveSpeed) * distortionIntensity
      );

      // Add secondary noise layer for organic flow
      float tSec = mod(uTime, 6.2831853);
      distortion.x += sin(vUv.y * 10.0 + tSec) * 0.015 * falloff * uHover * uMoving;
      distortion.y += cos(vUv.x * 10.0 + tSec) * 0.015 * falloff * uHover * uMoving;

      // 4. Apply distortion to the CONTAINER coordinates (paddedUv)
      // This bends the actual boundary of the 4/5 box
      vec2 distortedPaddedUv = paddedUv + distortion;

      // 5. Bounds Check
      // If the distorted coordinate falls outside the [0, 1] container, it is empty space
      if (distortedPaddedUv.x < 0.0 || distortedPaddedUv.x > 1.0 || distortedPaddedUv.y < 0.0 || distortedPaddedUv.y > 1.0) {
        gl_FragColor = vec4(0.0);
        return;
      }
      
      // 6. Object-fit cover logic natively in shader applied to the VALID, distorted container area
      vec2 coverRatio = vec2(
        min((uResolution.x / uResolution.y) / (uImageSize.x / uImageSize.y), 1.0),
        min((uResolution.y / uResolution.x) / (uImageSize.y / uImageSize.x), 1.0)
      );
      vec2 finalUv = vec2(
        distortedPaddedUv.x * coverRatio.x + (1.0 - coverRatio.x) * 0.5,
        distortedPaddedUv.y * coverRatio.y + (1.0 - coverRatio.y) * 0.5
      );

      // Sample the Image
      vec4 color = texture2D(uTexture, finalUv);

      // 6. Grayscale to Color Transition natively in Shader
      // Calculate luminance (grayscale value) using standard dot product
      float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      vec3 grayscaleColor = vec3(luminance);

      // Interpolate between grayscale and full color based on uHover
      vec3 finalColor = mix(grayscaleColor, color.rgb, uHover);

      gl_FragColor = vec4(finalColor, color.a);
    }
  `;

  return (
    <mesh
      ref={meshRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <planeGeometry args={[viewport.width, viewport.height]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

/**
 * @component ImageRipple
 * @description
 * Wrapper component to instantiate the R3F Canvas and handle loading states.
 * Dropped directly into the DOM structure replacing standard <Image>.
 */
export default function ImageRipple({
  src,
  alt = '',
}: {
  src: string;
  alt?: string;
}) {
  return (
    // Increase container to 130% so pixels can spill outside the normal box
    <div 
      className="absolute cursor-crosshair pointer-events-auto" 
      style={{
        width: '130%',
        height: '130%',
        left: '-15%',
        top: '-15%'
      }}
    >
      {/* 
        We use an HTML img as a visually-hidden fallback for SEO 
        and while the canvas initializes 
      */}
      <img src={src} alt={alt} className="hidden" />
      
      <Canvas
        camera={{ position: [0, 0, 1] }} // Simple orthographic-like setup
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <React.Suspense fallback={null}>
          <ImageRippleShader imageUrl={src} />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
