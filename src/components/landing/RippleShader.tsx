'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * ==========================================================================
 * RippleShader — Implementasi persis teknik homunculus.jp / Olivier Larose
 * ==========================================================================
 *
 * CARA KERJA (sesuai deskripsi teknis resmi):
 *
 * PASS 1 — HIDDEN CANVAS (Displacement FBO)
 *   Kanvas tersembunyi berlatar hitam. Saat kursor bergerak, sebuah kuas
 *   (brush) berbentuk gradien lingkaran putih dirender di posisi kursor.
 *   Setiap frame, seluruh canvas dikalikan DAMPING (< 1.0), sehingga jejak
 *   yang lebih tua perlahan memudar — menciptakan "ekor" yang dinamis.
 *   Jika kursor berhenti → tidak ada brush baru yang ditambah → trail
 *   memudar secara alami dalam ~1–2 detik. TIDAK ada gl.clear().
 *
 * PASS 2 — DISPLACEMENT MAP → FRAGMENT SHADER
 *   Tekstur grayscale (jejak kursor) dikirim ke fragment shader sebagai
 *   `uDisplacement`. Shader menghitung gradien dari tekstur ini (dL, dR,
 *   dU, dD) yang merepresentasikan kemiringan permukaan air.
 *
 * PASS 3 — UV DISTORTION / CAUSTIC RENDERING
 *   Kemiringan permukaan (gradien) digunakan sebagai normal vektor.
 *   Dengan normal ini, shader mensimulasikan refraksi cahaya (caustic):
 *   - Area dengan gradien positif → highlight (cerah)
 *   - Area dengan gradien negatif → shadow (gelap)
 *   - Area tanpa gradien → transparan (tidak terlihat)
 *   Ini menciptakan efek cincin riak air yang terlihat di background
 *   manapun — baik putih (light mode) maupun hitam (dark mode).
 *
 * PERBEDAAN DARI IMPLEMENTASI SEBELUMNYA:
 *   - Brush sebelumnya: multi-channel velocity encoding → rumit, tidak stabil
 *   - Brush sekarang: single-channel grayscale (nilai 0–1) → bersih, smooth
 *   - Stop sebelumnya: gl.clear() → tiba-tiba, tidak natural
 *   - Stop sekarang: natural DAMPING decay → smooth fade out (~1–2 detik)
 */

// ---------------------------------------------------------------------------
// Konstanta tuning
// ---------------------------------------------------------------------------
const FBO_SIZE         = 512;    // Resolusi displacement map (lebih tinggi = lebih halus)
const BRUSH_RADIUS     = 0.12;   // Radius gaussian kuas (0.12 = besar, sangat halus)
const DAMPING          = 0.90;   // Decay per-frame: 0.90^45 ≈ 0.008 → hilang dalam ~0.8 detik
const BRUSH_STRENGTH   = 1.0;    // Intensitas maksimum brush
const VELOCITY_SCALE   = 6.0;    // Skala kecepatan kursor → intensitas brush
const DISPLAY_STRENGTH = 7.0;    // Amplifikasi gradien → kekuatan visual caustic
const MOVE_TIMEOUT_MS  = 120;    // ms tanpa gerakan → kursor dianggap berhenti

// ---------------------------------------------------------------------------
// PASS 1A — Brush Shader
// Merender lingkaran gaussian putih di posisi kursor ke dalam FBO.
// Output: nilai grayscale 0.0 (hitam) sampai 1.0 (putih) di channel R.
// ---------------------------------------------------------------------------
const brushVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const brushFrag = /* glsl */ `
  precision highp float;

  uniform vec2  uMouse;      // Posisi kursor dalam UV space [0, 1]
  uniform float uStrength;   // Intensitas brush (0–1, berbanding lurus kecepatan)
  uniform float uRadius;     // Radius gaussian (sigma)
  uniform float uAspect;     // width / height (koreksi agar bulat, bukan lonjong)

  varying vec2 vUv;

  void main() {
    // Koreksi aspect ratio agar lingkaran tidak menjadi elips
    vec2 p = vec2(vUv.x * uAspect, vUv.y);
    vec2 m = vec2(uMouse.x * uAspect, uMouse.y);

    float d = distance(p, m);

    // Fungsi Gaussian: nilai puncak = 1.0 di tengah, turun halus ke pinggir
    // Formula: e^(-d² / r²) — lebih standar dari 2*sigma² karena lebih intuitif
    float gaussian = exp(-(d * d) / (uRadius * uRadius));

    // Intensitas akhir brush = gaussian × kecepatan kursor
    float intensity = gaussian * uStrength;

    // Simpan di semua channel (RGBA) — hanya R yang dibaca di display pass
    gl_FragColor = vec4(intensity, intensity, intensity, intensity);
  }
`;

// ---------------------------------------------------------------------------
// PASS 1B — Feedback / Decay Shader
// Membaca frame sebelumnya dan mengalikan dengan DAMPING.
// Ini yang menyebabkan jejak perlahan memudar secara alami.
// ---------------------------------------------------------------------------
const feedbackVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const feedbackFrag = /* glsl */ `
  precision highp float;

  uniform sampler2D uPrev;
  uniform float     uDamping;

  varying vec2 vUv;

  void main() {
    vec4 prev = texture2D(uPrev, vUv);
    // Kalikan dengan DAMPING → jejak lama perlahan memudar di tempat (tanpa melebar)
    gl_FragColor = prev * uDamping;
  }
`;

// ---------------------------------------------------------------------------
// PASS 2 — Display Shader (Caustic Rendering)
// Membaca displacement map → menghitung gradien (normal permukaan air) →
// mensimulasikan refraksi cahaya → menghasilkan caustic highlight + shadow.
//
// Kunci utama:
//   gX = (kanan - kiri) × strength  → kemiringan horizontal
//   gY = (atas - bawah) × strength  → kemiringan vertikal
//   normal = normalize(gX, gY, 1.0)  → vektor normal permukaan air
//   diffuse = dot(normal, lightDir)  → intensitas cahaya
//
// Area flat (tanpa gradien) → normal = (0,0,1) → uniform lighting → alpha=0
// Area miring (riak) → normal berubah → visible highlight/shadow → alpha>0
// ---------------------------------------------------------------------------
const displayVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const displayFrag = /* glsl */ `
  precision highp float;

  uniform sampler2D uDisp;      // Displacement map (jejak kursor grayscale)
  uniform float     uStrength;  // Amplifikasi gradien
  uniform float     uIsDark;    // 0.0 = light mode, 1.0 = dark mode (lerp smooth)

  varying vec2 vUv;

  // Ukuran satu texel di FBO (harus sesuai FBO_SIZE di JS)
  const float TEXEL = 1.0 / 512.0;

  void main() {
    // ------------------------------------------------------------------
    // Langkah 1: Baca nilai displacement di 4 tetangga (cross pattern)
    // ------------------------------------------------------------------
    float C = texture2D(uDisp, vUv).r;  // Center
    float L = texture2D(uDisp, vUv - vec2(TEXEL, 0.0)).r;   // Kiri
    float R = texture2D(uDisp, vUv + vec2(TEXEL, 0.0)).r;   // Kanan
    float U = texture2D(uDisp, vUv + vec2(0.0,  TEXEL)).r;  // Atas
    float D = texture2D(uDisp, vUv - vec2(0.0,  TEXEL)).r;  // Bawah

    // ------------------------------------------------------------------
    // Langkah 2: Hitung gradien = kemiringan permukaan air
    // ------------------------------------------------------------------
    float gX = (R - L) * uStrength;
    float gY = (U - D) * uStrength;

    // Normal permukaan air: vektor tegak lurus bidang yang miring
    // Z = 1.0 adalah "depth" default yang menstabilkan normalisasi
    vec3 normal = normalize(vec3(gX, gY, 1.0));

    // ------------------------------------------------------------------
    // Langkah 3: Hitung cahaya (directional light dari kanan-atas)
    // ------------------------------------------------------------------
    vec3 lightDir = normalize(vec3(0.4, 0.7, 0.6));
    float diffuse = dot(normal, lightDir);

    // Pisahkan highlight (kemiringan ke arah cahaya) dan shadow (menjauhi cahaya)
    float highlight = max( diffuse - 0.0, 0.0);  // nilai positif → area terang
    float shadow    = max(-diffuse - 0.0, 0.0);  // nilai negatif → area gelap

    // Power curve untuk kontras yang lebih tajam dan "punchy"
    highlight = pow(highlight, 1.6);
    shadow    = pow(shadow,    1.6);

    // Gunakan pow(C, 2.0) sebagai mask agar transisi ke pinggir memudar secara eksponensial dan lembut
    // Mencegah artefak di area tanpa displacement
    float mask = C * C;

    // ------------------------------------------------------------------
    // Langkah 4: Edge fade (mencegah artefak di batas canvas)
    // ------------------------------------------------------------------
    float ex = smoothstep(0.0, 0.06, vUv.x) * smoothstep(1.0, 0.94, vUv.x);
    float ey = smoothstep(0.0, 0.06, vUv.y) * smoothstep(1.0, 0.94, vUv.y);
    float ef  = ex * ey;

    // ------------------------------------------------------------------
    // Langkah 5: Warna adaptif berdasarkan tema
    // ------------------------------------------------------------------

    // LIGHT MODE — Shadow mendominasi (gelap di atas putih = terlihat jelas)
    // Highlight ditampilkan sebagai aksen tipis putih
    vec3  lColor = mix(
      vec3(0.04, 0.06, 0.12),   // shadow: biru-hitam (gelap di putih)
      vec3(0.85, 0.90, 1.00),   // highlight: putih-biru dingin
      step(0.5, highlight / max(highlight + shadow + 0.001, 0.001))
    );
    float lAlpha = (shadow * 0.75 + highlight * 0.30) * ef * mask;

    // DARK MODE — Highlight mendominasi (terang di atas hitam = terlihat jelas)
    // Shadow ditampilkan sebagai akseen tipis gelap
    vec3  dColor = mix(
      vec3(0.03, 0.03, 0.06),   // shadow: hampir hitam
      vec3(0.96, 0.97, 1.00),   // highlight: putih hangat
      step(0.25, highlight / max(highlight + shadow + 0.001, 0.001))
    );
    float dAlpha = (highlight * 0.55 + shadow * 0.20) * ef * mask;

    // ------------------------------------------------------------------
    // Langkah 6: Interpolasi tema + iridescence halus
    // ------------------------------------------------------------------
    vec3  finalColor = mix(lColor, dColor, uIsDark);
    float finalAlpha = mix(lAlpha, dAlpha, uIsDark);

    // Kilau pelangi halus di area dengan gradien kuat (seperti permukaan air)
    float gradMag = length(vec2(gX, gY));
    float phase   = gradMag * 8.0;
    vec3 iri = vec3(
      0.5 + 0.5 * sin(phase),
      0.5 + 0.5 * sin(phase + 2.094),
      0.5 + 0.5 * sin(phase + 4.189)
    );
    float iriWeight = min(gradMag * 0.4, 0.12); // sangat halus
    finalColor = mix(finalColor, iri, iriWeight * mask);

    finalAlpha = clamp(finalAlpha, 0.0, 0.90);
    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;

// ---------------------------------------------------------------------------
// Komponen React
// ---------------------------------------------------------------------------
interface RippleShaderProps {
  isDarkMode: boolean;
  rippleUniforms: any; // Digunakan oleh WebGLHeading — tidak dipakai di sini
}

export default function RippleShader({ isDarkMode }: RippleShaderProps) {
  const { gl, viewport, size } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);

  // -------------------------------------------------------------------------
  // Pelacak posisi mouse (window-level karena canvas pointer-events: none)
  // -------------------------------------------------------------------------
  const mouse = useRef({
    x: 0.5,    // posisi kursor UV saat ini
    y: 0.5,
    prevX: 0.5, // posisi frame sebelumnya (untuk menghitung kecepatan)
    prevY: 0.5,
    vx: 0,     // kecepatan horizontal (dx per frame)
    vy: 0,     // kecepatan vertikal
    lastMoveMs: 0, // timestamp terakhir kali mouse bergerak
  });

  const isDarkRef = useRef(isDarkMode);
  useEffect(() => {
    isDarkRef.current = isDarkMode;
  }, [isDarkMode]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const m  = mouse.current;
      const nx = e.clientX / window.innerWidth;
      const ny = 1.0 - e.clientY / window.innerHeight; // flip Y → UV space (0=bawah, 1=atas)

      // Simpan posisi sebelumnya sebelum update
      m.prevX = m.x;
      m.prevY = m.y;
      m.x     = nx;
      m.y     = ny;
      m.vx    = nx - m.prevX;  // kecepatan = delta posisi per frame
      m.vy    = ny - m.prevY;
      m.lastMoveMs = performance.now();
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // -------------------------------------------------------------------------
  // FBO ping-pong (dua render target: read dan write bergantian setiap frame)
  // useRef karena kita MUTATE .read / .write setiap frame (swap)
  // -------------------------------------------------------------------------
  const fboRef = useRef<{
    read:  THREE.WebGLRenderTarget;
    write: THREE.WebGLRenderTarget;
  } | null>(null);

  if (!fboRef.current) {
    const opt: THREE.RenderTargetOptions = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format:    THREE.RGBAFormat,
      type:      THREE.FloatType,
    };
    fboRef.current = {
      read:  new THREE.WebGLRenderTarget(FBO_SIZE, FBO_SIZE, opt),
      write: new THREE.WebGLRenderTarget(FBO_SIZE, FBO_SIZE, opt),
    };
  }

  useEffect(() => {
    const fbo = fboRef.current;
    return () => { fbo?.read.dispose(); fbo?.write.dispose(); };
  }, []);

  // -------------------------------------------------------------------------
  // Offscreen scene: berisi dua quad (feedback + brush)
  // useMemo karena objek-objek ini tidak pernah diswap, hanya uniforms-nya
  // -------------------------------------------------------------------------
  const offscreen = useMemo(() => {
    const scene  = new THREE.Scene();
    // Orthographic camera untuk 2D quad rendering yang tepat
    const cam = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.01, 10);
    cam.position.z = 1;

    // ---- Feedback quad: menampilkan frame sebelumnya dengan decay ----
    const feedbackMat = new THREE.ShaderMaterial({
      vertexShader:   feedbackVert,
      fragmentShader: feedbackFrag,
      uniforms: {
        uPrev:    { value: null as THREE.Texture | null },
        uDamping: { value: DAMPING },
      },
      depthTest:  false,
      depthWrite: false,
    });
    const feedbackQuad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), feedbackMat);
    feedbackQuad.position.z = -0.1; // Di belakang brush
    scene.add(feedbackQuad);

    // ---- Brush quad: merender lingkaran putih di posisi kursor ----
    const brushMat = new THREE.ShaderMaterial({
      vertexShader:   brushVert,
      fragmentShader: brushFrag,
      uniforms: {
        uMouse:    { value: new THREE.Vector2(0.5, 0.5) },
        uStrength: { value: 0.0 },
        uRadius:   { value: BRUSH_RADIUS },
        uAspect:   { value: 1.0 },
      },
      transparent: true,
      blending:    THREE.AdditiveBlending, // Tambahkan secara aditif di atas feedback
      depthTest:   false,
      depthWrite:  false,
    });
    const brushQuad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), brushMat);
    brushQuad.position.z = 0;
    scene.add(brushQuad);

    return { scene, cam, feedbackMat, brushMat };
  }, []);

  // -------------------------------------------------------------------------
  // Uniform display pass — dibuat sekali, diupdate setiap frame via useFrame
  // -------------------------------------------------------------------------
  const displayUniforms = useMemo(() => ({
    uDisp:     { value: null as THREE.Texture | null },
    uStrength: { value: DISPLAY_STRENGTH },
    uIsDark:   { value: isDarkMode ? 1.0 : 0.0 },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  // -------------------------------------------------------------------------
  // Flag: sudah di-clear setelah 2 detik berhenti? Hindari render sia-sia.
  // -------------------------------------------------------------------------
  const fboCleared = useRef(false);

  // -------------------------------------------------------------------------
  // Loop animasi per-frame
  // -------------------------------------------------------------------------
  useFrame(() => {
    const fbos = fboRef.current;
    if (!fbos) return;

    const m = mouse.current;
    const { scene: offScene, cam: offCam, feedbackMat, brushMat } = offscreen;

    const timeSinceMove = performance.now() - m.lastMoveMs;
    const isMoving      = timeSinceMove < MOVE_TIMEOUT_MS;
    const speed         = Math.sqrt(m.vx * m.vx + m.vy * m.vy);

    // -----------------------------------------------------------------------
    // FASE: KURSOR BERHENTI
    // Bersihkan FBO satu kali saja, lalu berhenti render sama sekali.
    // -----------------------------------------------------------------------
    if (!isMoving) {
      if (!fboCleared.current) {
        // Flush satu frame: set damping = 0 → output = 0 × prev = hitam total
        brushMat.visible = false;
        feedbackMat.uniforms.uPrev.value    = fbos.read.texture;
        feedbackMat.uniforms.uDamping.value = 0.0; // satu frame → bersih

        gl.setRenderTarget(fbos.write);
        gl.render(offScene, offCam);
        gl.setRenderTarget(null);

        const tmp  = fbos.read;
        fbos.read  = fbos.write;
        fbos.write = tmp;

        // Kembalikan damping ke nilai normal untuk sesi berikutnya
        feedbackMat.uniforms.uDamping.value = DAMPING;

        displayUniforms.uDisp.value = fbos.read.texture;
        fboCleared.current = true; // tandai: sudah bersih, skip frame berikutnya
      }

      // Tetap update tema meski tidak ada riak
      const tgt = isDarkRef.current ? 1.0 : 0.0;
      displayUniforms.uIsDark.value += (tgt - displayUniforms.uIsDark.value) * 0.08;
      return; // ← tidak ada render FBO
    }

    // -----------------------------------------------------------------------
    // FASE: KURSOR BERGERAK
    // Reset flag agar sesi berikutnya bisa di-clear lagi.
    // -----------------------------------------------------------------------
    fboCleared.current = false;

    // PASS 1A — Brush: hanya saat kursor benar-benar bergerak
    if (speed > 0.0001) {
      brushMat.uniforms.uMouse.value.set(m.x, m.y);
      brushMat.uniforms.uStrength.value = Math.min(speed * VELOCITY_SCALE, BRUSH_STRENGTH);
      brushMat.uniforms.uAspect.value   = size.width / size.height;

      // Hitung radius kuas secara dinamis berdasarkan kecepatan gerak dan tema gelap
      const maxRadius = isDarkRef.current ? 0.045 : 0.065;
      const minRadius = isDarkRef.current ? 0.015 : 0.02;
      const speedFactor = Math.min(speed / 0.05, 1.0);
      brushMat.uniforms.uRadius.value = minRadius + (maxRadius - minRadius) * speedFactor;

      brushMat.visible = true;
    } else {
      brushMat.visible = false;
    }

    // Atenuasi kecepatan antar frame
    m.vx *= 0.82;
    m.vy *= 0.82;

    // PASS 1B — Feedback: SELALU berjalan selama belum 2 detik
    // Ini yang membuat splash memudar smooth layaknya riak air sungguhan
    feedbackMat.uniforms.uPrev.value = fbos.read.texture;

    gl.setRenderTarget(fbos.write);
    gl.render(offScene, offCam);
    gl.setRenderTarget(null);

    const tmp  = fbos.read;
    fbos.read  = fbos.write;
    fbos.write = tmp;

    // PASS 2 — Kirim displacement map ke display shader
    displayUniforms.uDisp.value = fbos.read.texture;

    const tgt = isDarkRef.current ? 1.0 : 0.0;
    displayUniforms.uIsDark.value += (tgt - displayUniforms.uIsDark.value) * 0.08;
  });

  // -------------------------------------------------------------------------
  // Render — fullscreen quad sebagai overlay di atas konten HTML
  // -------------------------------------------------------------------------
  return (
    <mesh ref={meshRef} position={[0, 0, -100]} frustumCulled={false}>
      <planeGeometry args={[viewport.width * 2.5, viewport.height * 2.5]} />
      <shaderMaterial
        vertexShader={displayVert}
        fragmentShader={displayFrag}
        uniforms={displayUniforms}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
