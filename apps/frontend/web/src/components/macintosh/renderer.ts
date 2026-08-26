import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
	CSS3DObject,
	CSS3DRenderer,
} from "three/examples/jsm/renderers/CSS3DRenderer.js";
import {
	createModelLoadingOverlay,
	type ModelLoadingOverlayController,
} from "./components/ModelLoadingOverlay";
import {
	consumeUiDirty,
	drawMacUI,
	finishBootSequence,
	getVideoViewportRect,
	setBootProgress,
	startBootSequence,
	state,
	uiCanvas,
} from "./mac-ui";
import { applyRainbowToMesh } from "./three/rainbowApple";
import { generatePlanarUVs } from "./three/uv";

const MODEL_URL = "/models/Macintosh.glb";

const VIEW_PRESET_INITIAL = {
	modelX: 0,
	modelY: 0,
	rotX: 6,
	rotY: 1,
	rotZ: 0,
	zoom: 1.0,
};

const WINDOW_RESIZE_DRAG_THROTTLE_MS = 40;
const WINDOW_RESIZE_RELEASE_DELAY_MS = 80;

export interface MacintoshRendererOptions {
	transparent?: boolean;
}

export class MacintoshRenderer {
	private host: HTMLElement;
	private transparent: boolean;
	private renderer!: THREE.WebGLRenderer;
	private cssRenderer!: CSS3DRenderer;
	private scene = new THREE.Scene();
	private camera!: THREE.PerspectiveCamera;
	private controls!: OrbitControls;
	private modelLoadingOverlay: ModelLoadingOverlayController | null = null;
	private themeObserver: MutationObserver | null = null;
	private caseMeshes: THREE.Mesh[] = [];

	private modelRoot: THREE.Group | null = null;
	private modelBasePos = new THREE.Vector3(0, 0, 0);
	private modelBaseRot = new THREE.Euler(0, 0, 0);
	private baseCameraDistance: number | null = null;
	private viewParams = { ...VIEW_PRESET_INITIAL };

	private screenMesh: THREE.Mesh | null = null;
	private screenTexture: THREE.CanvasTexture | null = null;
	private screenCssObject: CSS3DObject | null = null;
	private screenDomRoot: HTMLDivElement | null = null;
	private videoLayer: HTMLDivElement | null = null;
	private videoIframe: HTMLIFrameElement | null = null;
	private videoEmbedUrl: string | null = null;
	private screenFrontSign = 1;
	private isHovered = false;
	private isUserInteracting = false;

	private clock = new THREE.Clock();
	private raf = 0;
	private running = false;
	private disposed = false;
	private onScreen = true;
	private io?: IntersectionObserver;
	private ro?: ResizeObserver;
	private cleanupFns: (() => void)[] = [];

	private _tmpScreenPos = new THREE.Vector3();
	private _tmpScreenQuat = new THREE.Quaternion();
	private _tmpScreenNormal = new THREE.Vector3();
	private _tmpToCam = new THREE.Vector3();

	constructor(host: HTMLElement, options: MacintoshRendererOptions = {}) {
		this.host = host;
		this.transparent = !!options.transparent;
	}

	mount(): boolean {
		if (this.disposed) return false;

		const { clientWidth: w, clientHeight: h } = this.host;
		if (w === 0 || h === 0) return false;

		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);

		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: this.transparent,
			powerPreference: "high-performance",
		});
		this.renderer.setSize(w, h);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.0;
		if (this.transparent) {
			this.renderer.setClearColor(0x000000, 0);
		} else {
			this.renderer.setClearColor(0xf6f6f6, 1);
		}
		this.host.style.position = "relative";
		this.host.style.overflow = "hidden";
		this.host.style.touchAction = "none";
		this.host.style.userSelect = "none";

		this.renderer.domElement.style.position = "absolute";
		this.renderer.domElement.style.top = "0";
		this.renderer.domElement.style.left = "0";
		this.renderer.domElement.style.width = "100%";
		this.renderer.domElement.style.height = "100%";
		this.renderer.domElement.style.zIndex = "1";
		this.renderer.domElement.style.visibility = "hidden";
		this.renderer.domElement.style.touchAction = "none";
		this.host.appendChild(this.renderer.domElement);

		this.modelLoadingOverlay = createModelLoadingOverlay(this.host);

		this.cssRenderer = new CSS3DRenderer();
		this.cssRenderer.setSize(w, h);
		this.cssRenderer.domElement.style.position = "absolute";
		this.cssRenderer.domElement.style.top = "0";
		this.cssRenderer.domElement.style.left = "0";
		this.cssRenderer.domElement.style.width = "100%";
		this.cssRenderer.domElement.style.height = "100%";
		this.cssRenderer.domElement.style.pointerEvents = "none";
		this.cssRenderer.domElement.style.zIndex = "2";
		this.cssRenderer.domElement.style.visibility = "hidden";
		this.cssRenderer.domElement.style.touchAction = "none";
		this.host.appendChild(this.cssRenderer.domElement);

		this.setupLighting();

		this.controls = new OrbitControls(this.camera, this.host);
		this.controls.enableRotate = true;
		this.controls.rotateSpeed = 0.9;
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.05;
		this.controls.enablePan = false;
		this.controls.enableZoom = false;
		this.controls.autoRotate = true;
		this.controls.autoRotateSpeed = -1.2;

		this.loadModel();
		this.bindEvents();

		if (
			typeof document !== "undefined" &&
			typeof MutationObserver !== "undefined"
		) {
			this.themeObserver = new MutationObserver(() => {
				this.updateModelTheme();
			});
			this.themeObserver.observe(document.documentElement, {
				attributes: true,
				attributeFilter: ["class"],
			});
		}

		return true;
	}

	private updateModelTheme() {
		const isDark =
			typeof document !== "undefined" &&
			document.documentElement.classList.contains("dark");

		for (const mesh of this.caseMeshes) {
			const mats = Array.isArray(mesh.material)
				? mesh.material
				: [mesh.material];
			for (const mat of mats) {
				if (mat instanceof THREE.MeshStandardMaterial) {
					if (!mat.userData.origColor) {
						mat.userData.origColor = mat.color.clone();
						mat.userData.origRoughness = mat.roughness;
					}
					if (isDark) {
						mat.color.setHex(0x232428);
						mat.roughness = 0.85;
					} else {
						mat.color.copy(mat.userData.origColor);
						mat.roughness = mat.userData.origRoughness ?? 0.9;
					}
					mat.needsUpdate = true;
				}
			}
		}

		drawMacUI();
		if (this.screenTexture) {
			this.screenTexture.needsUpdate = true;
		}
	}

	private setupLighting() {
		const ambientLight = new THREE.AmbientLight(0xffffff, 2.37);
		this.scene.add(ambientLight);

		const light1 = new THREE.DirectionalLight(0xffffff, 4.08);
		light1.position.set(-0.79, 10.24, 4.18);
		this.scene.add(light1);

		const light2 = new THREE.DirectionalLight(0xffffff, 1);
		light2.position.set(-4.18, 3, -5);
		this.scene.add(light2);
	}

	private loadModel() {
		new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(
			MODEL_URL,
			(gltf) => {
				if (this.disposed) return;
				const model = gltf.scene;
				this.modelRoot = model;

				model.traverse((child) => {
					if (!(child instanceof THREE.Mesh)) return;

					if (child.name === "Macintosh_Screen") {
						this.screenMesh = child;
						generatePlanarUVs(child.geometry);

						this.screenTexture = new THREE.CanvasTexture(uiCanvas);
						this.screenTexture.colorSpace = THREE.SRGBColorSpace;
						this.screenTexture.anisotropy =
							this.renderer.capabilities.getMaxAnisotropy();
						this.screenTexture.generateMipmaps = false;
						this.screenTexture.minFilter = THREE.NearestFilter;
						this.screenTexture.magFilter = THREE.NearestFilter;
						this.screenTexture.needsUpdate = true;

						child.material = new THREE.MeshBasicMaterial({
							map: this.screenTexture,
							side: THREE.DoubleSide,
							toneMapped: false,
						});
					}
				});

				model.updateMatrixWorld(true);
				this.ensureScreenDomOverlay();

				const rainbowTargets = ["Plane", "Plane.004"];
				const rainbowMaterialTargets = ["Material.009"];
				const sanitizeGltfName = (name: string) =>
					name.replace(/\s/g, "_").replace(/[[\]:.]/g, "");

				const rainbowHits = new Set<THREE.Object3D>();

				for (const rawName of rainbowTargets) {
					const sanitizedName = sanitizeGltfName(rawName);
					model.traverse((o) => {
						if (!o.name) return;
						if (
							o.name === rawName ||
							o.name === sanitizedName ||
							o.name.startsWith(`${sanitizedName}_`)
						) {
							rainbowHits.add(o);
						}
					});
				}

				model.traverse((o) => {
					if (!(o instanceof THREE.Mesh)) return;
					const mats = Array.isArray(o.material) ? o.material : [o.material];
					if (
						mats.some(
							(m) =>
								m &&
								typeof m.name === "string" &&
								rainbowMaterialTargets.includes(m.name),
						)
					) {
						rainbowHits.add(o);
					}
				});

				const rainbowMeshes: THREE.Mesh[] = [];
				for (const obj of rainbowHits) {
					if (obj instanceof THREE.Mesh) {
						rainbowMeshes.push(obj);
					} else {
						obj.traverse(
							(child) =>
								child instanceof THREE.Mesh && rainbowMeshes.push(child),
						);
					}
				}

				for (const mesh of rainbowMeshes) {
					applyRainbowToMesh(mesh);
				}

				this.caseMeshes = [];
				model.traverse((o) => {
					if (
						o instanceof THREE.Mesh &&
						o !== this.screenMesh &&
						!rainbowMeshes.includes(o)
					) {
						this.caseMeshes.push(o);
					}
				});

				this.updateModelTheme();

				this.scene.add(model);

				const box = new THREE.Box3().setFromObject(model);
				const size = box.getSize(new THREE.Vector3());
				const center = box.getCenter(new THREE.Vector3());

				model.position.x -= center.x;
				model.position.y -= center.y;
				model.position.z -= center.z;
				model.updateMatrixWorld(true);
				this.modelBasePos.copy(model.position);
				this.modelBaseRot.copy(model.rotation);

				const maxDim = Math.max(size.x, size.y, size.z);
				const fov = THREE.MathUtils.degToRad(this.camera.fov);
				const dist = maxDim / (2 * Math.tan(fov / 2));

				this.camera.position.set(0, 0, dist * 1.8);
				this.camera.lookAt(0, 0, 0);
				this.camera.near = dist / 100;
				this.camera.far = dist * 10;
				this.camera.updateProjectionMatrix();

				this.controls.target.set(0, 0, 0);
				this.controls.update();
				this.baseCameraDistance = this.camera.position.distanceTo(
					this.controls.target,
				);

				this.applyModelOffset();
				this.applyModelRotation();
				this.applyZoom();

				if (this.screenMesh) {
					const dot = this.getScreenFacingDot();
					this.screenFrontSign = dot >= 0 ? 1 : -1;
				}

				this.modelLoadingOverlay?.finish().then(() => {
					if (this.disposed) return;
					this.renderer.domElement.style.visibility = "visible";
					this.cssRenderer.domElement.style.visibility = "visible";
					finishBootSequence({ delayMs: 150 });
				});
			},
			(xhr) => {
				const total = xhr?.total;
				const loaded = xhr?.loaded;
				if (Number.isFinite(total) && total > 0 && Number.isFinite(loaded)) {
					const frac = loaded / total;
					this.modelLoadingOverlay?.setProgress(frac);
					setBootProgress(frac);
				}
			},
			(err) => {
				console.error("Failed to load 3D model:", err);
				this.modelLoadingOverlay?.error();
			},
		);
	}

	private applyModelOffset() {
		if (!this.modelRoot) return;
		this.modelRoot.position.set(
			this.modelBasePos.x + this.viewParams.modelX,
			this.modelBasePos.y + this.viewParams.modelY,
			this.modelBasePos.z,
		);
		this.modelRoot.updateMatrixWorld(true);
	}

	private applyModelRotation() {
		if (!this.modelRoot) return;
		this.modelRoot.rotation.set(
			this.modelBaseRot.x + THREE.MathUtils.degToRad(this.viewParams.rotX),
			this.modelBaseRot.y + THREE.MathUtils.degToRad(this.viewParams.rotY),
			this.modelBaseRot.z + THREE.MathUtils.degToRad(this.viewParams.rotZ),
		);
		this.modelRoot.updateMatrixWorld(true);
	}

	private applyZoom() {
		if (
			!Number.isFinite(this.baseCameraDistance) ||
			this.baseCameraDistance == null
		)
			return;
		const target = this.controls.target;
		const dir = new THREE.Vector3().subVectors(this.camera.position, target);
		if (dir.lengthSq() < 1e-8) dir.set(0, 0, 1);
		dir.normalize();

		const dist = Math.max(0.02, this.baseCameraDistance * this.viewParams.zoom);
		this.camera.position.copy(target).addScaledVector(dir, dist);
		this.controls.update();
	}

	private getScreenFacingDot(): number {
		if (!this.screenMesh) return 1;
		this.screenMesh.getWorldPosition(this._tmpScreenPos);
		this.screenMesh.getWorldQuaternion(this._tmpScreenQuat);
		this._tmpScreenNormal
			.set(0, 0, 1)
			.applyQuaternion(this._tmpScreenQuat)
			.normalize()
			.multiplyScalar(this.screenFrontSign);
		this._tmpToCam
			.copy(this.camera.position)
			.sub(this._tmpScreenPos)
			.normalize();
		return this._tmpScreenNormal.dot(this._tmpToCam);
	}

	private ensureScreenDomOverlay() {
		if (this.screenCssObject || !this.screenMesh) return;

		this.screenDomRoot = document.createElement("div");
		this.screenDomRoot.style.position = "relative";
		this.screenDomRoot.style.width = `${state.width}px`;
		this.screenDomRoot.style.height = `${state.height}px`;
		this.screenDomRoot.style.pointerEvents = "none";
		this.screenDomRoot.style.overflow = "hidden";
		this.screenDomRoot.style.background = "transparent";
		this.screenDomRoot.style.backfaceVisibility = "hidden";

		this.videoLayer = document.createElement("div");
		this.videoLayer.style.position = "absolute";
		this.videoLayer.style.display = "none";
		this.videoLayer.style.pointerEvents = "auto";
		this.videoLayer.style.overflow = "hidden";
		this.videoLayer.style.background = "#000";
		this.videoLayer.style.backfaceVisibility = "hidden";
		this.videoLayer.addEventListener("pointerdown", (e) => e.stopPropagation());
		this.videoLayer.addEventListener("pointerup", (e) => e.stopPropagation());
		this.videoLayer.addEventListener("click", (e) => e.stopPropagation());

		this.videoIframe = document.createElement("iframe");
		this.videoIframe.title = "YouTube video";
		this.videoIframe.src = "about:blank";
		this.videoIframe.allow =
			"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
		this.videoIframe.allowFullscreen = true;
		this.videoIframe.style.width = "100%";
		this.videoIframe.style.height = "100%";
		this.videoIframe.style.border = "0";
		this.videoIframe.style.display = "block";

		this.videoLayer.appendChild(this.videoIframe);
		this.screenDomRoot.appendChild(this.videoLayer);

		this.screenCssObject = new CSS3DObject(this.screenDomRoot);
		this.screenCssObject.layers.set(0);

		this.screenMesh.geometry.computeBoundingBox?.();
		const bb = this.screenMesh.geometry.boundingBox;
		const centerLocal = bb
			? bb.getCenter(new THREE.Vector3())
			: new THREE.Vector3();
		const sizeLocal = bb
			? bb.getSize(new THREE.Vector3())
			: new THREE.Vector3(1, 1, 0.01);

		const widthLocal = Math.max(0.0001, sizeLocal.x);
		const heightLocal = Math.max(0.0001, sizeLocal.y);
		this.screenCssObject.position.copy(centerLocal);
		this.screenCssObject.position.z += 0.001;
		this.screenCssObject.scale.set(
			widthLocal / state.width,
			heightLocal / state.height,
			1,
		);

		this.screenMesh.add(this.screenCssObject);
	}

	private updateVideoOverlay() {
		if (!this.videoLayer || !this.videoIframe) return;

		if (
			!state.trashVideoOpen ||
			!state.trashWindowOpen ||
			state.currentWindow !== "desktop"
		) {
			this.videoLayer.style.display = "none";
			if (this.videoIframe.src !== "about:blank")
				this.videoIframe.src = "about:blank";
			this.videoEmbedUrl = null;
			return;
		}

		const vp = getVideoViewportRect();
		if (!vp) return;

		const padX = 4;
		const padY = 4;
		const fitX = Math.round(vp.x) + padX;
		const fitY = Math.round(vp.y) + padY;
		const fitW = Math.max(0, Math.round(vp.w) - padX * 2);
		const fitH = Math.max(0, Math.round(vp.h) - padY * 2);

		this.videoLayer.style.display = "block";
		this.videoLayer.style.left = `${fitX}px`;
		this.videoLayer.style.top = `${fitY}px`;
		this.videoLayer.style.width = `${fitW}px`;
		this.videoLayer.style.height = `${fitH}px`;

		const facingDot = this.getScreenFacingDot();
		const isFacingCamera = facingDot > 0.03;
		this.videoLayer.style.display = isFacingCamera ? "block" : "none";
		this.videoLayer.style.pointerEvents = isFacingCamera ? "auto" : "none";

		const nextEmbed =
			"https://www.youtube.com/embed/2zfqw8nhUwA?autoplay=0&rel=0&playsinline=1&modestbranding=1";
		if (this.videoEmbedUrl !== nextEmbed) {
			this.videoEmbedUrl = nextEmbed;
			this.videoIframe.src = nextEmbed;
		}
	}

	private bindEvents() {
		const onPointerEnter = () => {
			this.isHovered = true;
			this.controls.autoRotate = false;
		};

		const onPointerLeave = () => {
			this.isHovered = false;
			if (!this.isUserInteracting) {
				this.controls.autoRotate = true;
			}
		};

		const onControlsStart = () => {
			this.isUserInteracting = true;
			this.controls.autoRotate = false;
		};

		const onControlsEnd = () => {
			this.isUserInteracting = false;
			if (!this.isHovered) {
				this.controls.autoRotate = true;
			}
		};

		this.host.addEventListener("pointerenter", onPointerEnter);
		this.host.addEventListener("pointerleave", onPointerLeave);
		this.controls.addEventListener("start", onControlsStart);
		this.controls.addEventListener("end", onControlsEnd);

		this.cleanupFns.push(() => {
			this.host.removeEventListener("pointerenter", onPointerEnter);
			this.host.removeEventListener("pointerleave", onPointerLeave);
			this.controls.removeEventListener("start", onControlsStart);
			this.controls.removeEventListener("end", onControlsEnd);
		});

		this.ro = new ResizeObserver(() => this.resize());
		this.ro.observe(this.host);

		this.io = new IntersectionObserver(
			(entries) => {
				this.onScreen = entries.some((entry) => entry.isIntersecting);
				if (this.onScreen) this.maybeStart();
				else this.stop();
			},
			{ threshold: 0.05 },
		);
		this.io.observe(this.host);

		const onVis = () => {
			if (document.hidden) this.stop();
			else this.maybeStart();
		};
		document.addEventListener("visibilitychange", onVis);
		this.cleanupFns.push(() => {
			document.removeEventListener("visibilitychange", onVis);
		});
	}

	private resize() {
		if (this.disposed || !this.renderer || !this.cssRenderer) return;
		const { clientWidth: w, clientHeight: h } = this.host;
		if (w === 0 || h === 0) return;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		this.renderer.setPixelRatio(dpr);
		this.renderer.setSize(w, h);
		this.cssRenderer.setSize(w, h);
		this.camera.aspect = w / h;
		this.camera.updateProjectionMatrix();
	}

	start() {
		this.onScreen = true;
		this.maybeStart();
	}

	private maybeStart() {
		if (this.disposed || this.running || !this.onScreen || document.hidden)
			return;
		this.running = true;
		this.clock.getDelta();
		this.raf = requestAnimationFrame(this.loop);
	}

	stop() {
		this.running = false;
		if (this.raf) cancelAnimationFrame(this.raf);
		this.raf = 0;
	}

	private loop = () => {
		if (!this.running || this.disposed) return;

		this.ensureScreenDomOverlay();
		this.updateVideoOverlay();

		if (this.screenTexture && consumeUiDirty()) {
			this.screenTexture.needsUpdate = true;
		}

		this.controls.update();
		this.renderer.render(this.scene, this.camera);
		this.cssRenderer.render(this.scene, this.camera);
		this.raf = requestAnimationFrame(this.loop);
	};

	dispose() {
		this.disposed = true;
		this.stop();
		this.modelLoadingOverlay?.dispose();
		this.themeObserver?.disconnect();
		this.themeObserver = null;

		for (const fn of this.cleanupFns) fn();
		this.io?.disconnect();
		this.ro?.disconnect();
		this.controls?.dispose();
		this.screenTexture?.dispose();

		this.scene.traverse((obj) => {
			if (obj instanceof THREE.Mesh) {
				obj.geometry?.dispose();
				if (Array.isArray(obj.material)) {
					for (const m of obj.material) m.dispose();
				} else if (obj.material) {
					obj.material.dispose();
				}
			}
		});

		this.renderer?.dispose();
		this.renderer?.forceContextLoss?.();
		if (this.renderer?.domElement?.parentNode) {
			this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
		}
		if (this.cssRenderer?.domElement?.parentNode) {
			this.cssRenderer.domElement.parentNode.removeChild(
				this.cssRenderer.domElement,
			);
		}
	}
}
