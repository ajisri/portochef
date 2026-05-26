'use client';

import React, { useRef, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface WebGLHeadingProps {
  isDarkMode: boolean;
  rippleUniforms: any; // { uRipples, uRippleCount }
  heading1: string;
  heading2: string;
  heading3: string;
}

export default function WebGLHeading({
  isDarkMode,
  rippleUniforms,
  heading1,
  heading2,
  heading3
}: WebGLHeadingProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  const { viewport } = useThree();

  // Responsive scaling calculation to match CSS
  // Roughly matches CSS font-size: clamp(2.5rem, 13vw (mobile)/6vw(desktop), 5rem)
  const isMobile = viewport.width < 768; // Roughly assuming R3F viewport units map to pixels conceptually if setup 1:1, but they don't.
  // We use viewport width to calculate proportional font size
  const fontSize = viewport.width * (viewport.width < 10 ? 0.12 : 0.055);
  const lineHeight = fontSize * 1.05;

  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(isDarkMode ? '#FAFAFA' : '#111111') },
      uRipples: rippleUniforms.uRipples,
      uRippleCount: rippleUniforms.uRippleCount,
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    };
  }, [rippleUniforms]);

  useFrame((state) => {
    // Update the shared uniforms object directly. 
    // Since these were passed by reference into onBeforeCompile, all 3 Text materials will update.
    uniforms.uTime.value = state.clock.elapsedTime;
    const targetColor = new THREE.Color(isDarkMode ? '#FAFAFA' : '#111111');
    uniforms.uColor.value.lerp(targetColor, 0.05);
    uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  });

  // Inject custom ripple distortion into the basic Troika Text material
  const onBeforeCompile = useCallback((shader: any) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uColor = uniforms.uColor;
    shader.uniforms.uRipples = uniforms.uRipples;
    shader.uniforms.uRippleCount = uniforms.uRippleCount;
    shader.uniforms.uResolution = uniforms.uResolution;

    // Inject Uniforms
    shader.vertexShader = `
      #define MAX_RIPPLES 16
      uniform vec3 uRipples[MAX_RIPPLES];
      uniform int uRippleCount;
      uniform vec2 uResolution;
      uniform float uTime;
      
      varying vec2 vScreenPos;
      
      ${shader.vertexShader}
    `;

    // Apply distortion in Vertex Shader
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vec4 screenPos = projectionMatrix * viewMatrix * worldPos;
      vec2 ppp = screenPos.xy / screenPos.w;
      
      float aspect = uResolution.x / uResolution.y;
      ppp.x *= aspect;

      vec2 rippleDisplacement = vec2(0.0);
      float rippleZ = 0.0;

      // Loop ripples and distort vertices
      for(int i = 0; i < MAX_RIPPLES; i++) {
        if (i >= uRippleCount) break;
        
        vec3 ripple = uRipples[i];
        vec2 rPos = ripple.xy;
        rPos.x *= aspect;
        
        float age = ripple.z;
        float dist = length(ppp - rPos);
        float radius = age * 2.5; 
        
        float wave = sin((dist - radius) * 40.0);
        float ringWidth = 0.15 + (age * 0.2);
        float envelope = smoothstep(ringWidth, 0.0, abs(dist - radius));
        envelope *= pow(1.0 - age, 2.0);
        
        vec2 dir = normalize(ppp - rPos);
        rippleDisplacement += dir * wave * envelope * 0.15; 
        rippleZ += wave * envelope * 0.5; // Wobble on Z axis
      }
      
      transformed.xy += rippleDisplacement * 100.0; 
      transformed.z += rippleZ * 50.0;
      
      vScreenPos = ppp;
      `
    );

    // Fragment Shader color overrides
    shader.fragmentShader = `
      uniform vec3 uColor;
      ${shader.fragmentShader}
    `.replace(
      'vec4 diffuseColor = vec4( diffuse, opacity );',
      'vec4 diffuseColor = vec4( uColor, opacity );'
    );
  }, [uniforms]);

  return (
    <group 
      ref={groupRef}
      // Position to align roughly with HTML grid: col 2, starting around top 20%
      // We start slightly negative X, positive Y
      position={[-viewport.width * 0.25, viewport.height * 0.15, 0]}
    >
      <Text
        fontSize={fontSize}
        letterSpacing={-0.04}
        lineHeight={1.0}
        position={[0, 0, 0]}
        anchorX="left"
        anchorY="top"
      >
        {heading1}
        <meshBasicMaterial 
          transparent 
          onBeforeCompile={onBeforeCompile}
        />
      </Text>
      
      <Text
        fontSize={fontSize}
        letterSpacing={-0.04}
        lineHeight={1.0}
        position={[0, -lineHeight, 0]}
        anchorX="left"
        anchorY="top"
      >
        {heading2}
        <meshBasicMaterial 
          transparent 
          onBeforeCompile={onBeforeCompile}
        />
      </Text>

      <Text
        fontSize={fontSize}
        letterSpacing={-0.04}
        lineHeight={1.0}
        position={[0, -lineHeight * 2, 0]}
        anchorX="left"
        anchorY="top"
      >
        {heading3}
        <meshBasicMaterial 
          transparent 
          onBeforeCompile={onBeforeCompile}
        />
      </Text>
    </group>
  );
}
