"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as THREE from "three";
import styles from "./HeroOverlay.module.css";

// ====================================================================
// CONFIGURACIÓN DEL EFECTO (Parámetros ajustables)
// ====================================================================

// Compartidos — afectan el shader y no pueden dividirse por breakpoint
const TRAIL_LENGTH = 16; // Cantidad de gotas de agua que forman la "cola" o estela al mover el ratón.
const SPLASH_LENGTH = 16; // Cantidad de gotitas sueltas (salpicaduras) cuando mueves el ratón muy rápido.

type GhostConfig = {
  idleThreshold: number;
  travelDuration: number;
  radiusLerp: number;
  posLerp: number; // Suavidad del seguimiento de posición durante el ghost (0.05 = lento, 0.3 = rápido).
  microJitterX: number;
  microJitterY: number;
};

type EffectConfig = {
  MAX_PIXEL_RATIO: number; // Límite de resolución. Evita sobrecalentar celulares de gama alta.
  MAX_RADIUS: number; // Tamaño máximo de la mancha principal (0.2 = 20% de la pantalla).
  BLOB_COLOR: string; // Color de la mancha.
  BLOB_OPACITY: number; // Transparencia de la mancha (0 a 1).
  TRAIL_SHRINK_SPEED: number; // Velocidad a la que desaparece la estela.
  TRAIL_DROP_DISTANCE: number; // Distancia mínima para soltar una nueva gota de estela.
  VELOCITY_MULTIPLIER: number; // Entre más rápido el cursor, más crece la mancha.
  SPLASH_SHRINK_SPEED: number; // Qué tan rápido se evaporan las salpicaduras.
  SPLASH_VELOCITY_DAMPING: number; // Fricción de las salpicaduras.
  MOUSE_STIFFNESS: number; // Rapidez con la que la mancha persigue al cursor.
  MOUSE_DAMPING: number; // Inercia/suavidad del movimiento.
  RADIUS_STIFFNESS: number; // Elasticidad al agrandarse/encojer la mancha.
  BASE_RADIUS: number; // Tamaño base del efecto ghost. En mobile es el tamaño fijo (no hay velocidad).
  POINTER_ENABLED: boolean; // Si false, ignora completamente el input del usuario.
  GHOST: GhostConfig;
};

// ── Desktop ─────────────────────────────────────────────────────────
const DESKTOP_CONFIG: EffectConfig = {
  MAX_PIXEL_RATIO: 10,
  MAX_RADIUS: 0.2,
  BLOB_COLOR: "#4a4a4a",
  BLOB_OPACITY: 0.1,
  TRAIL_SHRINK_SPEED: 0.3,
  TRAIL_DROP_DISTANCE: 0.005,
  VELOCITY_MULTIPLIER: 9,
  SPLASH_SHRINK_SPEED: 0.6,
  SPLASH_VELOCITY_DAMPING: 0.94,
  MOUSE_STIFFNESS: 90,
  MOUSE_DAMPING: 0.5,
  RADIUS_STIFFNESS: 8,
  BASE_RADIUS: 0.1,
  POINTER_ENABLED: true,
  GHOST: {
    idleThreshold: 700,
    travelDuration: 19000,
    radiusLerp: 0.1,
    posLerp: 0.12,
    microJitterX: 0.0012,
    microJitterY: 0.0008,
  },
};

// ── Mobile ──────────────────────────────────────────────────────────
const MOBILE_CONFIG: EffectConfig = {
  MAX_PIXEL_RATIO: 1.2,
  MAX_RADIUS: 10,
  BLOB_COLOR: "#000000",
  BLOB_OPACITY: 0.05,
  TRAIL_SHRINK_SPEED: 0.3,
  TRAIL_DROP_DISTANCE: 0.5,
  VELOCITY_MULTIPLIER: 9,
  SPLASH_SHRINK_SPEED: 0.6,
  SPLASH_VELOCITY_DAMPING: 0.94,
  MOUSE_STIFFNESS: 90,
  MOUSE_DAMPING: 0.35,
  RADIUS_STIFFNESS: 10,
  BASE_RADIUS: 0.17,
  POINTER_ENABLED: false,
  GHOST: {
    idleThreshold: 700,
    travelDuration: 8000,
    radiusLerp: 0.1,
    posLerp: 0.12,
    microJitterX: 0.0012,
    microJitterY: 0.0008,
  },
};

const GHOST_SVG_PATH =
  "M 50 5 C 22 10, 22 16, 50 21 C 78 26, 78 32, 50 37 C 22 42, 22 48, 50 53 C 78 58, 78 64, 50 69 C 22 74, 22 80, 50 85 C 78 90, 78 95, 50 99";

const DEFAULT_BASE_IMAGE = "/media/shared/home/hero/hero-2-izquierda.webp";
const DEFAULT_OVERLAY_IMAGE = "/media/shared/home/hero/hero-2-derecha.webp";
const DEFAULT_BASE_ALT = "Imagen base";

// ====================================================================
// SHADERS
// ====================================================================

// Mobile shader: mediump precision, 1 cheap value-noise warp,
// no trail/splash loops (POINTER_ENABLED=false so they're always empty).
// ~70% cheaper than the desktop shader on mobile GPUs.
const fragmentShaderMobile = `
  precision mediump float;

  uniform sampler2D u_texture;
  uniform vec2 u_mouse;
  uniform vec2 u_resolution;
  uniform float u_radius;
  uniform float u_time;
  uniform vec4 u_imageBounds;
  uniform vec3 u_blobColor;
  uniform float u_blobOpacity;
  uniform float u_hoverState;

  varying vec2 v_uv;

  // Value noise — single hash, no lattice loop. Much cheaper than simplex.
  float hash2(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p.yx, p + 19.19);
    return fract(p.x * p.y);
  }
  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash2(i), hash2(i + vec2(1.0, 0.0)), f.x),
      mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  void main() {
    vec2 uv = v_uv;
    float screenAspect = u_resolution.x / u_resolution.y;

    vec2 correctedUV = uv;
    correctedUV.x *= screenAspect;
    vec2 correctedMouse = u_mouse;
    correctedMouse.x *= screenAspect;

    // Two noise taps (X and Y warp) from one cheap value-noise function
    float n1 = valueNoise(correctedUV * 2.0 + u_time * 0.18);
    float n2 = valueNoise(correctedUV.yx * 2.0 + u_time * 0.22 + 5.3);
    vec2 warpOffset = vec2(n1 - 0.5, n2 - 0.5) * 0.14;

    vec2 warpedUV = correctedUV + warpOffset;
    float energy = 0.0;

    if (u_radius > 0.001) {
      float d = length(warpedUV - correctedMouse);
      if (d < u_radius) {
        float x = d / u_radius;
        energy += (1.0 - x * x) * (1.0 - x * x);
      }
    }

    float mask = smoothstep(0.28, 0.32, energy);

    vec2 imgCoord = (uv - u_imageBounds.xy) / u_imageBounds.zw;
    float insideImage = step(0.0, imgCoord.x) * step(imgCoord.x, 1.0) *
                        step(0.0, imgCoord.y) * step(imgCoord.y, 1.0);

    vec4 tex = vec4(0.0);
    if (insideImage > 0.5) {
      tex = texture2D(u_texture, imgCoord);
    }

    float showTexture = u_hoverState * insideImage;
    vec3 finalColor = mix(u_blobColor, tex.rgb, showTexture * tex.a);
    float finalAlpha = mix(u_blobOpacity, 1.0, showTexture * tex.a) * mask;

    finalColor = pow(finalColor, vec3(1.0 / 2.2));
    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;

const vertexShader = `
  varying vec2 v_uv;
  void main() {
    v_uv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform sampler2D u_texture;
  uniform vec2 u_mouse;
  uniform vec2 u_resolution;
  uniform float u_radius;
  uniform float u_time;
  
  uniform vec4 u_imageBounds; 
  
  uniform vec3 u_blobColor;
  uniform float u_blobOpacity;
  uniform float u_hoverState;
  
  uniform vec2 u_trailPositions[${TRAIL_LENGTH}];
  uniform float u_trailSizes[${TRAIL_LENGTH}];

  uniform vec2 u_splashPositions[${SPLASH_LENGTH}];
  uniform float u_splashSizes[${SPLASH_LENGTH}];

  varying vec2 v_uv;

  vec3 hash33(vec3 p) {
    p = fract(p * vec3(443.8975, 397.2973, 491.1871));
    p += dot(p.zxy, p.yxz + 19.27);
    return fract(vec3(p.x * p.y, p.z * p.x, p.y * p.z));
  }

  float simplex_noise(vec3 p) {
    const float K1 = 0.333333333;
    const float K2 = 0.166666667;
    vec3 i = floor(p + (p.x + p.y + p.z) * K1);
    vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
    vec3 e = step(vec3(0.0), d0 - d0.yzx);
    vec3 i1 = e * (1.0 - e.zxy);
    vec3 i2 = 1.0 - e.zxy * (1.0 - e);
    vec3 d1 = d0 - (i1 - K2);
    vec3 d2 = d0 - (i2 - K2 * 2.0);
    vec3 d3 = d0 - (1.0 - 3.0 * K2);
    vec3 x0 = d0;
    vec3 x1 = d1;
    vec3 x2 = d2;
    vec3 x3 = d3;
    vec4 h = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    vec4 n = h * h * h * h * vec4(
      dot(x0, hash33(i) * 2.0 - 1.0),
      dot(x1, hash33(i + i1) * 2.0 - 1.0),
      dot(x2, hash33(i + i2) * 2.0 - 1.0),
      dot(x3, hash33(i + 1.0) * 2.0 - 1.0)
    );
    return 0.5 + 0.5 * 31.0 * dot(n, vec4(1.0));
  }

  void main() {
    vec2 uv = v_uv;
    float screenAspect = u_resolution.x / u_resolution.y;

    vec2 correctedUV = uv;
    correctedUV.x *= screenAspect;
    vec2 correctedMouse = u_mouse;
    correctedMouse.x *= screenAspect;

    float wave1 = simplex_noise(vec3(correctedUV * 2.0, u_time * 0.4));
    float wave2 = simplex_noise(vec3(correctedUV * 2.5 + 42.0, u_time * 0.5));
    float microNoise = simplex_noise(vec3(correctedUV * 8.0 - vec2(0.0, u_time * 1.5), u_time * 0.7));
    
    vec2 warpOffset = vec2(wave1 - 0.5, wave2 - 0.5) * 0.16;
    warpOffset += vec2(microNoise - 0.5) * 0.02;

    vec2 warpedUV = correctedUV + warpOffset;
    float energy = 0.0;
    
    if (u_radius > 0.001) {
      float mainDist = length(warpedUV - correctedMouse);
      if (mainDist < u_radius) {
        float x = mainDist / u_radius;
        energy += (1.0 - x*x) * (1.0 - x*x); 
      }
    }

    for (int i = 0; i < ${TRAIL_LENGTH}; i++) {
      float dropR = u_trailSizes[i];
      if (dropR > 0.001) {
        vec2 tPos = u_trailPositions[i];
        tPos.x *= screenAspect;
        float dropDist = length(warpedUV - tPos);
        if (dropDist < dropR) {
          float x = dropDist / dropR;
          energy += (1.0 - x*x) * (1.0 - x*x);
        }
      }
    }

    for (int i = 0; i < ${SPLASH_LENGTH}; i++) {
      float dropR = u_splashSizes[i];
      if (dropR > 0.001) {
        vec2 sPos = u_splashPositions[i];
        sPos.x *= screenAspect;
        float dropDist = length(warpedUV - sPos);
        if (dropDist < dropR) {
          float x = dropDist / dropR;
          energy += (1.0 - x*x) * (1.0 - x*x);
        }
      }
    }

    float mask = smoothstep(0.28, 0.32, energy);

    // [MODIFICACIÓN CLAVE] Usamos 'uv' original sin distorsionar para que el overlay se vea perfecto
    vec2 imgCoord = (uv - u_imageBounds.xy) / u_imageBounds.zw;
    float insideImage = step(0.0, imgCoord.x) * step(imgCoord.x, 1.0) *
                        step(0.0, imgCoord.y) * step(imgCoord.y, 1.0);

    vec4 tex = vec4(0.0);
    if (insideImage > 0.5) {
        tex = texture2D(u_texture, imgCoord);
    }

    float showTexture = u_hoverState * insideImage;
    vec3 finalColor = mix(u_blobColor, tex.rgb, showTexture * tex.a);
    float finalAlpha = mix(u_blobOpacity, 1.0, showTexture * tex.a) * mask;

    finalColor = pow(finalColor, vec3(1.0 / 2.2));

    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;

type ShaderUniforms = {
  u_texture: { value: THREE.Texture };
  u_mouse: { value: THREE.Vector2 };
  u_resolution: { value: THREE.Vector2 };
  u_radius: { value: number };
  u_time: { value: number };
  u_imageBounds: { value: THREE.Vector4 };
  u_blobColor: { value: THREE.Color };
  u_blobOpacity: { value: number };
  u_hoverState: { value: number };
  u_trailPositions: { value: THREE.Vector2[] };
  u_trailSizes: { value: number[] };
  u_splashPositions: { value: THREE.Vector2[] };
  u_splashSizes: { value: number[] };
};

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);
const MOBILE_RENDER_SCALE = 0.42;
const MOBILE_TARGET_FPS = 24;

type HeroOverlayProps = {
  baseImage?: string;
  overlayImage?: string;
  baseAlt?: string;
  overlayAlt?: string;
};

export default function HeroOverlay({
  baseImage = DEFAULT_BASE_IMAGE,
  overlayImage = DEFAULT_OVERLAY_IMAGE,
  baseAlt = DEFAULT_BASE_ALT,
}: HeroOverlayProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const overlayPosRef = useRef<HTMLDivElement | null>(null);

  const ghostPathRef = useRef<SVGPathElement | null>(null);
  const ghostPathLengthRef = useRef(0);
  const ghostTimeRef = useRef(0);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const uniformsRef = useRef<ShaderUniforms | null>(null);
  const animationRef = useRef<number | null>(null);
  const timerRef = useRef<THREE.Timer | null>(null);

  const targetHoverStateRef = useRef(0);
  const currentHoverStateRef = useRef(0);

  const trailPositionsRef = useRef(
    Array.from({ length: TRAIL_LENGTH }, () => new THREE.Vector2(-10, -10)),
  );
  const trailSizesRef = useRef<number[]>(new Array(TRAIL_LENGTH).fill(0));
  const trailIndexRef = useRef(0);
  const lastDropPosRef = useRef(new THREE.Vector2(-10, -10));

  const splashPositionsRef = useRef(
    Array.from({ length: SPLASH_LENGTH }, () => new THREE.Vector2(-10, -10)),
  );
  const splashVelocitiesRef = useRef(
    Array.from({ length: SPLASH_LENGTH }, () => new THREE.Vector2(0, 0)),
  );
  const splashSizesRef = useRef<number[]>(new Array(SPLASH_LENGTH).fill(0));
  const splashIndexRef = useRef(0);

  const targetMouseRef = useRef(new THREE.Vector2(0.5, 0.5));
  const smoothMouseRef = useRef(new THREE.Vector2(0.5, 0.5));
  const mouseVelocityRef = useRef(new THREE.Vector2(0, 0));
  const smoothVelocityRef = useRef(new THREE.Vector2(0, 0));
  const lastInteractionTimeRef = useRef(0);

  const configRef = useRef<EffectConfig>(
    typeof window !== "undefined" && window.innerWidth <= 768
      ? MOBILE_CONFIG
      : DESKTOP_CONFIG,
  );

  const [shouldBootWebGL, setShouldBootWebGL] = useState(false);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!configRef.current.POINTER_ENABLED) return;
      const container = rootRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const rawX = (event.clientX - rect.left) / rect.width;
      const rawY = 1 - (event.clientY - rect.top) / rect.height;
      targetMouseRef.current.set(clamp01(rawX), clamp01(rawY));
      targetHoverStateRef.current = 1;
      lastInteractionTimeRef.current = Date.now();
    },
    [],
  );

  const handlePointerEnter = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      handlePointerMove(event);
    },
    [handlePointerMove],
  );

  const handlePointerLeave = useCallback(() => {
    if (!configRef.current.POINTER_ENABLED) return;
    targetHoverStateRef.current = 0;
  }, []);

  useEffect(() => {
    if (!ghostPathRef.current) return;
    ghostPathLengthRef.current = ghostPathRef.current.getTotalLength();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const onBreakpoint = (e: MediaQueryListEvent) => {
      configRef.current = e.matches ? MOBILE_CONFIG : DESKTOP_CONFIG;
    };
    mq.addEventListener("change", onBreakpoint);
    return () => mq.removeEventListener("change", onBreakpoint);
  }, []);

  useEffect(() => {
    lastInteractionTimeRef.current = Date.now();
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    // Delay mobile boot a bit so first paint/CTA become interactive sooner.
    const timer = setTimeout(
      () => setShouldBootWebGL(true),
      isMobile ? 380 : 120,
    );
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!shouldBootWebGL) return;

    const fullContainer = canvasContainerRef.current;
    if (!fullContainer) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    let disposed = false;
    let resizeObserver: ResizeObserver | null = null;
    let visibilityObserver: IntersectionObserver | null = null;
    let isVisible = true;
    let lastRenderTimestamp = 0;
    const loader = new THREE.TextureLoader();

    loader.load(overlayImage, (texture: THREE.Texture) => {
      if (disposed) return;

      texture.colorSpace = THREE.SRGBColorSpace;
      const width = Math.max(fullContainer.clientWidth, 1);
      const height = Math.max(fullContainer.clientHeight, 1);
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      const uniforms: ShaderUniforms = {
        u_texture: { value: texture },
        u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
        u_resolution: { value: new THREE.Vector2(width, height) },
        u_radius: { value: 0 },
        u_time: { value: 0 },
        u_imageBounds: { value: new THREE.Vector4(0, 0, 1, 1) },
        u_blobColor: { value: new THREE.Color(configRef.current.BLOB_COLOR) },
        u_blobOpacity: { value: configRef.current.BLOB_OPACITY },
        u_hoverState: { value: 0 },
        u_trailPositions: { value: trailPositionsRef.current },
        u_trailSizes: { value: trailSizesRef.current },
        u_splashPositions: { value: splashPositionsRef.current },
        u_splashSizes: { value: splashSizesRef.current },
      };

      const geometry = new THREE.PlaneGeometry(2, 2);
      // Mobile uses a simpler shader (no trail/splash loops, cheaper noise)
      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader: isMobile ? fragmentShaderMobile : fragmentShader,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      });

      scene.add(new THREE.Mesh(geometry, material));

      const renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        // Low-power on mobile saves battery and avoids thermal throttling
        powerPreference: isMobile ? "low-power" : "high-performance",
      });

      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(
        Math.min(
          window.devicePixelRatio || 1,
          configRef.current.MAX_PIXEL_RATIO,
        ),
      );

      // Mobile: render below native resolution — the blob is soft so quality impact
      // is minimal while fillrate cost drops substantially.
      const renderScale = isMobile ? MOBILE_RENDER_SCALE : 1.0;
      // Pass updateStyle=false so THREE doesn't shrink the canvas element to the
      // render-buffer size; we set CSS manually to always fill the container.
      renderer.setSize(
        Math.round(width * renderScale),
        Math.round(height * renderScale),
        false,
      );

      texture.generateMipmaps = false;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = 1;

      fullContainer.innerHTML = "";
      // Canvas fills the container visually even when the render buffer is smaller
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      fullContainer.appendChild(renderer.domElement);

      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;
      uniformsRef.current = uniforms;

      timerRef.current = new THREE.Timer();
      timerRef.current.connect(document);

      const updateBounds = () => {
        if (!uniformsRef.current || !rootRef.current || !overlayPosRef.current)
          return;
        const containerRect = rootRef.current.getBoundingClientRect();
        const overlayRect = overlayPosRef.current.getBoundingClientRect();
        const normX =
          (overlayRect.left - containerRect.left) / containerRect.width;
        const normY =
          (containerRect.bottom - overlayRect.bottom) / containerRect.height;
        const normW = overlayRect.width / containerRect.width;
        const normH = overlayRect.height / containerRect.height;
        uniformsRef.current.u_imageBounds.value.set(normX, normY, normW, normH);
      };

      resizeObserver = new ResizeObserver(() => {
        if (!rendererRef.current || !uniformsRef.current) return;
        const nextWidth = Math.max(fullContainer.clientWidth, 1);
        const nextHeight = Math.max(fullContainer.clientHeight, 1);
        rendererRef.current.setPixelRatio(
          Math.min(
            window.devicePixelRatio || 1,
            configRef.current.MAX_PIXEL_RATIO,
          ),
        );
        // Keep render buffer at renderScale but keep CSS filling the container
        rendererRef.current.setSize(
          Math.round(nextWidth * renderScale),
          Math.round(nextHeight * renderScale),
          false,
        );
        // Resolution uniform tracks display size (not buffer size) so the shader
        // aspect-ratio calculation stays correct.
        uniformsRef.current.u_resolution.value.set(nextWidth, nextHeight);
        updateBounds();
      });

      resizeObserver.observe(fullContainer);
      if (overlayPosRef.current) resizeObserver.observe(overlayPosRef.current);
      updateBounds();

      // Pause the RAF loop when the hero scrolls out of view (saves GPU on mobile
      // and avoids unnecessary work on desktop once user scrolls past).
      visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          isVisible = !!entry?.isIntersecting;
        },
        { threshold: 0 },
      );
      if (rootRef.current) visibilityObserver.observe(rootRef.current);

      const render = () => {
        animationRef.current = requestAnimationFrame(render);

        // Skip work entirely when the hero is off-screen
        if (!isVisible) return;

        // Mobile: cap fps to reduce startup jank and thermal throttling.
        if (isMobile) {
          const nowTs = performance.now();
          const frameBudget = 1000 / MOBILE_TARGET_FPS;
          if (nowTs - lastRenderTimestamp < frameBudget) return;
          lastRenderTimestamp = nowTs;
        }

        if (
          !rendererRef.current ||
          !sceneRef.current ||
          !cameraRef.current ||
          !uniformsRef.current ||
          !timerRef.current
        )
          return;

        timerRef.current.update();
        const delta = Math.min(timerRef.current.getDelta(), 1 / 30);
        const now = Date.now();

        const cfg = configRef.current;
        const ghost = cfg.GHOST;

        // Ghost time always advances — no start/stop, seamless loop
        ghostTimeRef.current += delta * 1000;

        const isIdle =
          !cfg.POINTER_ENABLED ||
          now - lastInteractionTimeRef.current > ghost.idleThreshold;

        if (isIdle && ghostPathRef.current && ghostPathLengthRef.current > 0) {
          // Continuous cosine loop: 0→1→0→1… with no visible seam
          const t =
            (ghostTimeRef.current % ghost.travelDuration) /
            ghost.travelDuration;
          const pathEased = (1 - Math.cos(t * 2 * Math.PI)) / 2;
          const pathPoint = ghostPathRef.current.getPointAtLength(
            ghostPathLengthRef.current * pathEased,
          );

          targetMouseRef.current.set(
            clamp01(
              pathPoint.x / 100 +
                Math.sin(ghostTimeRef.current * 0.0045) * ghost.microJitterX,
            ),
            clamp01(
              1 -
                pathPoint.y / 100 +
                Math.cos(ghostTimeRef.current * 0.0065) * ghost.microJitterY,
            ),
          );

          mouseVelocityRef.current.set(0, 0);
          const f = 1 - Math.pow(1 - ghost.posLerp, delta * 60);
          smoothMouseRef.current.lerp(targetMouseRef.current, Math.min(f, 1));

          uniformsRef.current.u_radius.value = THREE.MathUtils.lerp(
            uniformsRef.current.u_radius.value,
            cfg.BASE_RADIUS,
            ghost.radiusLerp,
          );

          targetHoverStateRef.current = 1;
        } else {
          // User interaction: spring physics
          const mouseToTargetX =
            targetMouseRef.current.x - smoothMouseRef.current.x;
          const mouseToTargetY =
            targetMouseRef.current.y - smoothMouseRef.current.y;
          mouseVelocityRef.current.x +=
            mouseToTargetX * cfg.MOUSE_STIFFNESS * delta;
          mouseVelocityRef.current.y +=
            mouseToTargetY * cfg.MOUSE_STIFFNESS * delta;
          mouseVelocityRef.current.multiplyScalar(
            Math.pow(cfg.MOUSE_DAMPING, delta * 60),
          );
          smoothMouseRef.current.x += mouseVelocityRef.current.x * delta * 60;
          smoothMouseRef.current.y += mouseVelocityRef.current.y * delta * 60;
        }

        uniformsRef.current.u_mouse.value.copy(smoothMouseRef.current);
        smoothVelocityRef.current.lerp(mouseVelocityRef.current, 0.2);

        const velocityMagnitude = smoothVelocityRef.current.length();
        const targetRadius = Math.min(
          velocityMagnitude * cfg.VELOCITY_MULTIPLIER,
          cfg.MAX_RADIUS,
        );

        if (!isIdle) {
          uniformsRef.current.u_radius.value +=
            (targetRadius - uniformsRef.current.u_radius.value) *
            cfg.RADIUS_STIFFNESS *
            delta;
        }

        if (
          smoothMouseRef.current.distanceTo(lastDropPosRef.current) >
          cfg.TRAIL_DROP_DISTANCE
        ) {
          const idx = trailIndexRef.current;
          trailPositionsRef.current[idx].copy(smoothMouseRef.current);
          trailSizesRef.current[idx] = uniformsRef.current.u_radius.value;
          trailIndexRef.current = (idx + 1) % TRAIL_LENGTH;
          lastDropPosRef.current.copy(smoothMouseRef.current);
        }

        for (let i = 0; i < TRAIL_LENGTH; i++) {
          if (trailSizesRef.current[i] > 0) {
            trailSizesRef.current[i] = Math.max(
              0,
              trailSizesRef.current[i] - delta * cfg.TRAIL_SHRINK_SPEED,
            );
          }
        }

        if (velocityMagnitude > 0.05 && Math.random() > 0.5) {
          const sIdx = splashIndexRef.current;
          splashPositionsRef.current[sIdx].copy(smoothMouseRef.current);
          const angle = Math.random() * Math.PI * 2;
          const force = velocityMagnitude * (0.8 + Math.random() * 1.5);
          splashVelocitiesRef.current[sIdx].set(
            smoothVelocityRef.current.x * 0.2 + Math.cos(angle) * force,
            smoothVelocityRef.current.y * 0.2 + Math.sin(angle) * force,
          );
          splashSizesRef.current[sIdx] = Math.max(
            0.015,
            uniformsRef.current.u_radius.value * (0.15 + Math.random() * 0.3),
          );
          splashIndexRef.current = (sIdx + 1) % SPLASH_LENGTH;
        }

        for (let i = 0; i < SPLASH_LENGTH; i++) {
          if (splashSizesRef.current[i] > 0) {
            splashPositionsRef.current[i].x +=
              splashVelocitiesRef.current[i].x * delta;
            splashPositionsRef.current[i].y +=
              splashVelocitiesRef.current[i].y * delta;
            splashVelocitiesRef.current[i].multiplyScalar(
              Math.pow(cfg.SPLASH_VELOCITY_DAMPING, delta * 60),
            );
            splashSizesRef.current[i] = Math.max(
              0,
              splashSizesRef.current[i] - delta * cfg.SPLASH_SHRINK_SPEED,
            );
          }
        }

        currentHoverStateRef.current +=
          (targetHoverStateRef.current - currentHoverStateRef.current) *
          delta *
          8;
        uniformsRef.current.u_hoverState.value = currentHoverStateRef.current;
        uniformsRef.current.u_time.value += delta;

        rendererRef.current.render(sceneRef.current, cameraRef.current);
      };

      animationRef.current = requestAnimationFrame(render);
    });

    return () => {
      disposed = true;
      if (animationRef.current !== null)
        cancelAnimationFrame(animationRef.current);
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      timerRef.current?.dispose();
      rendererRef.current?.dispose();
      if (fullContainer) fullContainer.innerHTML = "";
    };
  }, [overlayImage, shouldBootWebGL]);

  return (
    <div
      className={styles.heroOverlay}
      ref={rootRef}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        className={styles.ghostPath}
        aria-hidden="true"
      >
        <path ref={ghostPathRef} d={GHOST_SVG_PATH} fill="none" stroke="none" />
      </svg>

      <div className={styles.geishaParallaxLayer} aria-hidden="true">
        <Image
          src={baseImage}
          alt={baseAlt}
          title={baseAlt}
          width={745}
          height={745}
          sizes="(max-width: 768px) 92vw, (max-width: 1280px) 52vw, 690px"
          priority
          quality={90}
          className={styles.geishaHero}
        />
      </div>

      <div
        ref={canvasContainerRef}
        className={styles.canvasContainer}
        aria-hidden="true"
      />
      <div
        ref={overlayPosRef}
        className={styles.overlayHeroPlaceholder}
        aria-hidden="true"
      />
    </div>
  );
}
