import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
	createMacintoshModel,
	type MacintoshModel,
	STUDIO_COLOR,
} from "./model";

const MAX_DPR = 2;
const STUDIO = new THREE.Color(STUDIO_COLOR);

export class MacintoshRenderer {
	private host: HTMLElement;
	private renderer!: THREE.WebGLRenderer;
	private scene = new THREE.Scene();
	private camera!: THREE.PerspectiveCamera;
	private controls!: OrbitControls;
	private model: MacintoshModel | null = null;
	private clock = new THREE.Clock();
	private raf = 0;
	private running = false;
	private disposed = false;
	private onScreen = true;
	private io?: IntersectionObserver;
	private ro?: ResizeObserver;
	private wireMat: THREE.MeshBasicMaterial | null = null;
	private envMap: THREE.Texture | null = null;
	private reduceMotion = false;

	constructor(host: HTMLElement) {
		this.host = host;
		this.reduceMotion =
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	}

	mount(): boolean {
		const { clientWidth: w, clientHeight: h } = this.host;
		const width = Math.max(1, w);
		const height = Math.max(1, h);
		const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: false,
			powerPreference: "high-performance",
			failIfMajorPerformanceCaveat: false,
		});
		this.renderer.setPixelRatio(dpr);
		this.renderer.setSize(width, height);
		this.renderer.setClearColor(STUDIO, 1);
		this.renderer.outputColorSpace = THREE.SRGBColorSpace;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1.05;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		this.host.appendChild(this.renderer.domElement);
		Object.assign(this.renderer.domElement.style, {
			position: "absolute",
			inset: "0",
			width: "100%",
			height: "100%",
			display: "block",
			outline: "none",
			touchAction: "none",
			userSelect: "none",
			WebkitUserSelect: "none",
		});
		this.renderer.domElement.tabIndex = 0;

		this.scene.background = STUDIO;
		this.scene.fog = new THREE.Fog(STUDIO, 12, 28);

		const pmrem = new THREE.PMREMGenerator(this.renderer);
		const room = new RoomEnvironment();
		this.envMap = pmrem.fromScene(room, 0.04).texture;
		this.scene.environment = this.envMap;
		this.scene.environmentIntensity = 0.42;
		room.dispose();
		pmrem.dispose();

		this.camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 60);
		this.camera.position.set(4.15, 3.55, 5.35);

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.08;
		this.controls.enablePan = false;
		this.controls.minDistance = 4.2;
		this.controls.maxDistance = 14;
		this.controls.minPolarAngle = 0.35;
		this.controls.maxPolarAngle = Math.PI / 2 - 0.08;
		this.controls.target.set(0.15, 0.95, 0.55);
		this.controls.autoRotate = !this.reduceMotion;
		this.controls.autoRotateSpeed = 0.45;
		this.controls.update();

		this.lights();
		this.ground();

		this.model = createMacintoshModel();
		this.scene.add(this.model.group);

		this.bind();
		return true;
	}

	private lights() {
		const hemi = new THREE.HemisphereLight(0xe8e8e8, 0x3d3d3d, 0.55);
		this.scene.add(hemi);

		const key = new THREE.DirectionalLight(0xfff6e8, 2.15);
		key.position.set(-3.2, 8.5, 5.5);
		key.castShadow = true;
		key.shadow.mapSize.set(2048, 2048);
		key.shadow.bias = -0.00015;
		key.shadow.normalBias = 0.02;
		const cam = key.shadow.camera;
		cam.near = 1;
		cam.far = 24;
		cam.left = -8;
		cam.right = 8;
		cam.top = 8;
		cam.bottom = -8;
		this.scene.add(key);

		const fill = new THREE.DirectionalLight(0xdde4ee, 0.55);
		fill.position.set(6, 3.2, 2.5);
		this.scene.add(fill);

		const rim = new THREE.DirectionalLight(0xffffff, 0.35);
		rim.position.set(1.5, 5, -6);
		this.scene.add(rim);
	}

	private ground() {
		const mesh = new THREE.Mesh(
			new THREE.PlaneGeometry(40, 40),
			new THREE.ShadowMaterial({ opacity: 0.28, color: 0x000000 }),
		);
		mesh.rotation.x = -Math.PI / 2;
		mesh.receiveShadow = true;
		mesh.name = "ground";
		this.scene.add(mesh);
	}

	setWireframe(on: boolean) {
		if (this.disposed) return;
		if (on) {
			if (!this.wireMat) {
				this.wireMat = new THREE.MeshBasicMaterial({
					color: 0xe8e8e8,
					wireframe: true,
					transparent: true,
					opacity: 0.9,
				});
			}
			this.scene.overrideMaterial = this.wireMat;
			this.scene.background = new THREE.Color(0x3a3a3a);
			this.renderer.setClearColor(0x3a3a3a, 1);
			if (this.scene.fog instanceof THREE.Fog)
				this.scene.fog.color.set(0x3a3a3a);
		} else {
			this.scene.overrideMaterial = null;
			this.scene.background = STUDIO;
			this.renderer.setClearColor(STUDIO, 1);
			if (this.scene.fog instanceof THREE.Fog)
				this.scene.fog.color.copy(STUDIO);
		}
	}

	private bind() {
		this.ro = new ResizeObserver(() => this.resize());
		this.ro.observe(this.host);

		this.io = new IntersectionObserver(
			(entries) => {
				this.onScreen = entries.some((e) => e.isIntersecting);
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

		const stopAuto = () => {
			this.controls.autoRotate = false;
		};
		this.renderer.domElement.addEventListener("pointerdown", stopAuto);

		this.cleanupFns.push(() => {
			document.removeEventListener("visibilitychange", onVis);
			this.renderer.domElement.removeEventListener("pointerdown", stopAuto);
		});
	}

	private cleanupFns: (() => void)[] = [];

	private resize() {
		if (this.disposed) return;
		const { clientWidth: w, clientHeight: h } = this.host;
		if (w === 0 || h === 0) return;
		const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
		this.renderer.setPixelRatio(dpr);
		this.renderer.setSize(w, h);
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
		this.controls.update();
		this.renderer.render(this.scene, this.camera);
		this.raf = requestAnimationFrame(this.loop);
	};

	dispose() {
		this.disposed = true;
		this.stop();
		for (const fn of this.cleanupFns) fn();
		this.io?.disconnect();
		this.ro?.disconnect();
		this.controls?.dispose();
		this.model?.dispose();
		this.wireMat?.dispose();
		this.envMap?.dispose();
		this.scene.traverse((obj) => {
			if (obj instanceof THREE.Mesh) {
				if (obj.name === "ground") {
					obj.geometry.dispose();
					if (obj.material instanceof THREE.Material) obj.material.dispose();
				}
			}
		});
		this.renderer?.dispose();
		this.renderer?.forceContextLoss?.();
		if (this.renderer?.domElement.parentNode) {
			this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
		}
	}
}
