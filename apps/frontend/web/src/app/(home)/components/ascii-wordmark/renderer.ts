import * as THREE from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import {
  GPGPU_COMPUTE,
  PARTICLE_VERT,
  PARTICLE_FRAG,
  ASCII_VERT,
  ASCII_FRAG,
  TRAIL_LEN,
} from "./shaders";
import { buildAtlas, RAMP } from "./atlas";
import { buildWordPoints } from "./word-points";

const FLOW_INFLUENCE = 0.43;
const FLOW_STRENGTH = 1.09;
const FLOW_FREQUENCY = 0.53;
const MOUSE_STRENGTH = 0.08;
const MOUSE_SPEED_GAIN = 1.5;

const IS_TOUCH =
  typeof window !== "undefined" &&
  (window.matchMedia?.("(pointer: coarse)").matches ?? false);

const FBO_SIZE = IS_TOUCH ? 128 : 200;
const MAX_DPR = IS_TOUCH ? 1.5 : 2;
const RENDER_SCALE = 0.5;
const ASCII_CELL_DIVISOR = 100;

export interface AsciiWordmarkOptions {
  word: string;
  inkColor: string;
}

export class AsciiWordmarkRenderer {
  private host: HTMLElement;
  private opts: AsciiWordmarkOptions;

  private renderer!: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera!: THREE.PerspectiveCamera;
  private composer!: EffectComposer;
  private asciiPass!: ShaderPass;

  private gpgpu!: GPUComputationRenderer;
  private posVar!: ReturnType<GPUComputationRenderer["addVariable"]>;
  private points!: THREE.Points;
  private pointsMat!: THREE.ShaderMaterial;

  private clock = new THREE.Clock();
  private raf = 0;
  private running = false;
  private onScreen = true;
  private disposed = false;

  private mouse = new THREE.Vector3(9999, 9999, 0);
  private prevMouse = new THREE.Vector3(9999, 9999, 0);
  private mouseSpeed = 0;

  private mouseUv = new THREE.Vector2(9999, 9999);
  private onCard = false;

  private trailPos: THREE.Vector2[] = [];
  private trailAge: Float32Array = new Float32Array(TRAIL_LEN).fill(1);
  private trailOn = 0;
  private visibility = 0;
  private wordAspect = 3;
  private readonly WORD_MARGIN = 0.92;

  private io?: IntersectionObserver;
  private ro?: ResizeObserver;

  constructor(host: HTMLElement, opts: AsciiWordmarkOptions) {
    this.host = host;
    this.opts = opts;
  }

  mount(): boolean {
    const { clientWidth: w, clientHeight: h } = this.host;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
      failIfMajorPerformanceCaveat: false,
    });
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h);
    this.renderer.setClearColor(0x000000, 0);
    this.host.appendChild(this.renderer.domElement);
    Object.assign(this.renderer.domElement.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      display: "block",
      touchAction: "pan-y",
      userSelect: "none",
      WebkitUserSelect: "none",
    });

    const { positions, count, aspect } = buildWordPoints(this.opts.word, FBO_SIZE);
    this.wordAspect = aspect;

    this.camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
    this.frameWord(w / h);
    this.camera.lookAt(0, 0, 0);

    if (!this.initGPGPU(positions)) return false;
    this.initPoints(count);
    this.initComposer(w, h, dpr);

    this.bindEvents();
    return true;
  }

  private initGPGPU(positions: Float32Array): boolean {
    this.gpgpu = new GPUComputationRenderer(FBO_SIZE, FBO_SIZE, this.renderer);
    this.gpgpu.setDataType(THREE.HalfFloatType);

    const baseTex = this.gpgpu.createTexture();
    (baseTex.image.data as Float32Array).set(positions);

    const initTex = this.gpgpu.createTexture();
    (initTex.image.data as Float32Array).set(positions);

    this.posVar = this.gpgpu.addVariable("uParticles", GPGPU_COMPUTE, initTex);
    this.gpgpu.setVariableDependencies(this.posVar, [this.posVar]);

    const u = this.posVar.material.uniforms;
    u.uTime = { value: 0 };
    u.uDeltaTime = { value: 0 };
    u.uBase = { value: baseTex };
    u.uFlowFieldInfluence = { value: FLOW_INFLUENCE };
    u.uFlowFieldStrength = { value: FLOW_STRENGTH };
    u.uFlowFieldFrequency = { value: FLOW_FREQUENCY };
    u.uMouse = { value: new THREE.Vector3(9999, 9999, 0) };
    u.uMouseStrength = { value: MOUSE_STRENGTH };
    u.uMouseSpeed = { value: 0 };

    const err = this.gpgpu.init();
    if (err) {
      console.warn("[ascii-wordmark] GPGPU unsupported, skipping:", err);
      return false;
    }
    return true;
  }

  private initPoints(count: number) {
    const geo = new THREE.BufferGeometry();

    const uvs = new Float32Array(count * 2);
    const sizes = new Float32Array(count);
    let i = 0;
    for (let y = 0; y < FBO_SIZE; y++) {
      for (let x = 0; x < FBO_SIZE; x++) {
        uvs[i * 2] = (x + 0.5) / FBO_SIZE;
        uvs[i * 2 + 1] = (y + 0.5) / FBO_SIZE;
        sizes[i] = 0.6 + Math.random() * 0.8;
        i++;
      }
    }

    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geo.setAttribute("aParticlesUv", new THREE.BufferAttribute(uvs, 2));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setDrawRange(0, count);

    this.pointsMat = new THREE.ShaderMaterial({
      vertexShader: PARTICLE_VERT,
      fragmentShader: PARTICLE_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uResolution: { value: new THREE.Vector2() },
        uSize: { value: 4 },
        uVisibility: { value: 0 },
        uParticlesTexture: { value: null },
      },
    });

    this.points = new THREE.Points(geo, this.pointsMat);
    this.points.frustumCulled = false;
    this.scene.add(this.points);
  }

  private initComposer(w: number, h: number, dpr: number) {
    const bw = Math.max(2, Math.round(w * RENDER_SCALE));
    const bh = Math.max(2, Math.round(h * RENDER_SCALE));

    this.composer = new EffectComposer(this.renderer);
    this.composer.setPixelRatio(dpr);
    this.composer.setSize(w, h);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const atlas = buildAtlas(RAMP);
    const atlasTex = new THREE.CanvasTexture(atlas);
    atlasTex.minFilter = THREE.LinearFilter;
    atlasTex.magFilter = THREE.LinearFilter;

    const cell = (bw * dpr) / ASCII_CELL_DIVISOR;

    const ink = new THREE.Color(this.opts.inkColor);

    this.trailPos = Array.from({ length: TRAIL_LEN }, () => new THREE.Vector2(9999, 9999));
    this.trailAge = new Float32Array(TRAIL_LEN).fill(1);

    this.asciiPass = new ShaderPass({
      uniforms: {
        tDiffuse: { value: null },
        uResolution: { value: new THREE.Vector2(bw * dpr, bh * dpr) },
        uAsciiPixelSize: { value: cell },
        uAsciiTexture: { value: atlasTex },
        uCharCount: { value: new THREE.Vector2(RAMP.length, 1) },
        uAsciiContrast: { value: 1.4 },
        uAsciiBrightness: { value: 0.12 },
        uAsciiMin: { value: 0.0 },
        uAsciiMax: { value: 1.0 },
        uAspect: { value: w / h },
        uInk: { value: new THREE.Vector3(ink.r, ink.g, ink.b) },
        uTrail: { value: this.trailPos },
        uTrailAge: { value: this.trailAge },
        uTrailOn: { value: 0 },
      },
      vertexShader: ASCII_VERT,
      fragmentShader: ASCII_FRAG,
    });
    this.asciiPass.renderToScreen = true;
    this.composer.addPass(this.asciiPass);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    (this.pointsMat.uniforms["uResolution"]!.value as THREE.Vector2).set(w * dpr, h * dpr);

    // suppress unused variable warning
    void bh;
  }

  private bindEvents() {
    const onPointerMove = (e: PointerEvent) => {
      const r = this.host.getBoundingClientRect();

      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
      const v = new THREE.Vector3(nx, ny, 0.5).unproject(this.camera);
      const dir = v.sub(this.camera.position).normalize();
      const dist = -this.camera.position.z / dir.z;
      this.mouse.copy(this.camera.position).add(dir.multiplyScalar(dist));

      this.mouseUv.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
      this.onCard = true;
    };
    const onPointerLeave = () => {
      this.mouse.set(9999, 9999, 0);
      this.mouseUv.set(9999, 9999);
      this.onCard = false;
    };

    this.host.addEventListener("pointermove", onPointerMove);
    this.host.addEventListener("pointerleave", onPointerLeave);
    this.cleanupFns.push(() => {
      this.host.removeEventListener("pointermove", onPointerMove);
      this.host.removeEventListener("pointerleave", onPointerLeave);
    });

    const onVis = () => (document.hidden ? this.stop() : this.maybeStart());
    document.addEventListener("visibilitychange", onVis);
    this.cleanupFns.push(() => document.removeEventListener("visibilitychange", onVis));

    this.io = new IntersectionObserver(
      (es) => {
        this.onScreen = es[0]?.isIntersecting ?? true;
        this.onScreen ? this.maybeStart() : this.stop();
      },
      { threshold: 0.01 },
    );
    this.io.observe(this.host);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this.host);
  }

  private cleanupFns: (() => void)[] = [];

  private frameWord(viewportAspect: number) {
    const halfV = THREE.MathUtils.degToRad(this.camera.fov) / 2;
    const tanV = Math.tan(halfV);
    const distForHeight = 1.0 / tanV;
    const distForWidth = this.wordAspect / (tanV * viewportAspect);
    const dist = Math.max(distForHeight, distForWidth) * this.WORD_MARGIN;
    this.camera.position.set(0, 0, dist);
  }

  private resize() {
    if (this.disposed) return;
    const { clientWidth: w, clientHeight: h } = this.host;
    if (w === 0 || h === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h);
    this.composer.setPixelRatio(dpr);
    this.composer.setSize(w, h);
    this.camera.aspect = w / h;
    this.frameWord(w / h);
    this.camera.updateProjectionMatrix();

    const bw = Math.max(2, Math.round(w * RENDER_SCALE));
    const bh = Math.max(2, Math.round(h * RENDER_SCALE));
    (this.asciiPass.uniforms["uResolution"]!.value as THREE.Vector2).set(bw * dpr, bh * dpr);
    this.asciiPass.uniforms["uAsciiPixelSize"]!.value = (bw * dpr) / ASCII_CELL_DIVISOR;
    this.asciiPass.uniforms["uAspect"]!.value = w / h;
    (this.pointsMat.uniforms["uResolution"]!.value as THREE.Vector2).set(w * dpr, h * dpr);

    // suppress unused variable warning
    void bh;
  }

  start() {
    this.onScreen = true;
    this.maybeStart();
  }

  private maybeStart() {
    if (this.disposed || this.running || !this.onScreen || document.hidden) return;
    this.running = true;
    this.clock.getDelta();
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private advanceTrail(dt: number) {
    const TRAIL_LIFE = 0.75;
    for (let i = 0; i < TRAIL_LEN; i++) {
      const cur = this.trailAge[i] ?? 1;
      this.trailAge[i] = Math.min(1, cur + dt / TRAIL_LIFE);
    }
    if (this.onCard) {
      for (let i = TRAIL_LEN - 1; i > 0; i--) {
        const prev = this.trailPos[i - 1];
        const cur = this.trailPos[i];
        if (prev && cur) cur.copy(prev);
        const prevAge = this.trailAge[i - 1] ?? 1;
        this.trailAge[i] = prevAge;
      }
      this.trailPos[0]?.copy(this.mouseUv);
      this.trailAge[0] = 0;
    }

    this.asciiPass.uniforms["uTrailAge"]!.value = this.trailAge;
  }

  private loop = () => {
    if (!this.running) return;
    const dt = Math.min(this.clock.getDelta(), 1 / 30);
    const t = this.clock.elapsedTime;

    this.mouseSpeed = this.mouse.distanceTo(this.prevMouse);
    if (this.mouse.x > 9000) this.mouseSpeed = 0;
    this.prevMouse.copy(this.mouse);

    const cu = this.posVar.material.uniforms;
    cu["uTime"]!.value = t;
    cu["uDeltaTime"]!.value = dt;
    (cu["uMouse"]!.value as THREE.Vector3).copy(this.mouse);
    cu["uMouseSpeed"]!.value = this.mouseSpeed * MOUSE_SPEED_GAIN;
    this.gpgpu.compute();

    this.pointsMat.uniforms["uParticlesTexture"]!.value =
      this.gpgpu.getCurrentRenderTarget(this.posVar).texture;

    this.visibility = Math.min(1, this.visibility + dt * 0.9);
    this.pointsMat.uniforms["uVisibility"]!.value = this.visibility;

    this.advanceTrail(dt);

    this.trailOn += ((this.onCard ? 1 : 0) - this.trailOn) * Math.min(1, dt * 6);
    this.asciiPass.uniforms["uTrailOn"]!.value = this.trailOn;

    this.composer.render();
    this.raf = requestAnimationFrame(this.loop);
  };

  dispose() {
    this.disposed = true;
    this.stop();
    this.cleanupFns.forEach((fn) => fn());
    this.io?.disconnect();
    this.ro?.disconnect();
    this.points?.geometry.dispose();
    this.pointsMat?.dispose();
    this.asciiPass?.uniforms["uAsciiTexture"]?.value?.dispose?.();
    this.gpgpu?.dispose?.();
    this.composer?.dispose();
    this.renderer?.dispose();
    this.renderer?.forceContextLoss?.();
    if (this.renderer?.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
