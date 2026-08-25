import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { createAppleTexture, createBackLabelTexture } from "./apple-logo";

const CASE = 0xd8c69e;
const CASE_INSET = 0xccbb92;
const SLOT = 0x121210;
const BEZEL = 0x2e322d;
const PHOSPHOR = 0x5d7a68;
const GLASS = 0x4e6d58;

const W = 2.1;
const H = 2.5;
const D = 1.8;
const DROP = 0.45;
const X_TAPER = 0.16;
const LEAN = 0.08;
const SLOPE_ANGLE = Math.atan(DROP / D);

export const WALL_COLOR = 0x434b57;
export const FLOOR_COLOR = 0x8e8e8b;

export interface MacintoshModel {
	group: THREE.Group;
	dispose: () => void;
}

interface Bag {
	geos: THREE.BufferGeometry[];
	mats: THREE.Material[];
	texs: THREE.Texture[];
}

function track<T extends THREE.BufferGeometry>(bag: Bag, g: T): T {
	bag.geos.push(g);
	return g;
}

function mat<T extends THREE.Material>(bag: Bag, m: T): T {
	bag.mats.push(m);
	return m;
}

function tex<T extends THREE.Texture>(bag: Bag, t: T): T {
	bag.texs.push(t);
	return t;
}

function grain(bag: Bag, size = 128): THREE.DataTexture {
	const data = new Uint8Array(size * size);
	for (let i = 0; i < data.length; i++) {
		data[i] = 170 + Math.floor(Math.random() * 85);
	}
	const t = new THREE.DataTexture(data, size, size, THREE.RedFormat);
	t.wrapS = THREE.RepeatWrapping;
	t.wrapT = THREE.RepeatWrapping;
	t.needsUpdate = true;
	return tex(bag, t);
}

function plastic(
	bag: Bag,
	color: number,
	bump: THREE.Texture,
	extra?: THREE.MeshPhysicalMaterialParameters,
): THREE.MeshPhysicalMaterial {
	return mat(
		bag,
		new THREE.MeshPhysicalMaterial({
			color,
			roughness: 0.55,
			metalness: 0,
			clearcoat: 0.2,
			clearcoatRoughness: 0.6,
			bumpMap: bump,
			bumpScale: 0.016,
			sheen: 0.15,
			sheenColor: new THREE.Color(color),
			sheenRoughness: 0.85,
			...extra,
		}),
	);
}

function add(
	parent: THREE.Object3D,
	geometry: THREE.BufferGeometry,
	material: THREE.Material,
	x: number,
	y: number,
	z: number,
	cast = false,
	receive = false,
): THREE.Mesh {
	const mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	mesh.castShadow = cast;
	mesh.receiveShadow = receive;
	parent.add(mesh);
	return mesh;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
	const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
	return t * t * (3 - 2 * t);
}

function topY(z: number): number {
	return H / 2 - DROP * ((D / 2 - z) / D);
}

function backZ(y: number): number {
	return -D / 2 + LEAN * ((y + H / 2) / H) * 0.1;
}

function caseProfile(geo: THREE.BufferGeometry): THREE.BufferGeometry {
	const pos = geo.attributes.position;
	if (!pos) return geo;
	for (let i = 0; i < pos.count; i++) {
		const x0 = pos.getX(i);
		const y0 = pos.getY(i);
		const z0 = pos.getZ(i);

		const h = (y0 + H / 2) / H;
		const t = (D / 2 - z0) / D;

		// Top rear slope and diagonal chamfer
		const slopeFactor = smoothstep(0.52, 0.98, h);
		const y = y0 - DROP * t * slopeFactor;
		const x = x0 * (1 - X_TAPER * h * t * 0.32);

		// Slight backward screen slant on the front face (3-4 degree backward lean)
		const leanFactor = (y0 + H / 2) / H;
		const z = z0 - LEAN * (1 - leanFactor) * (1 - t * 0.8);

		pos.setXYZ(i, x, y, z);
	}
	pos.needsUpdate = true;
	geo.computeVertexNormals();
	return geo;
}

function roundedRect(w: number, h: number, r: number): THREE.Shape {
	const s = new THREE.Shape();
	const hw = w / 2;
	const hh = h / 2;
	const rad = Math.min(r, hw, hh);
	s.moveTo(-hw + rad, -hh);
	s.lineTo(hw - rad, -hh);
	s.quadraticCurveTo(hw, -hh, hw, -hh + rad);
	s.lineTo(hw, hh - rad);
	s.quadraticCurveTo(hw, hh, hw - rad, hh);
	s.lineTo(-hw + rad, hh);
	s.quadraticCurveTo(-hw, hh, -hw, hh - rad);
	s.lineTo(-hw, -hh + rad);
	s.quadraticCurveTo(-hw, -hh, -hw + rad, -hh);
	return s;
}

function bulgePlane(
	bag: Bag,
	w: number,
	h: number,
	bulge: number,
): THREE.PlaneGeometry {
	const g = track(bag, new THREE.PlaneGeometry(w, h, 32, 26));
	const pos = g.attributes.position;
	if (!pos) return g;
	for (let i = 0; i < pos.count; i++) {
		const x = pos.getX(i) / (w * 0.5);
		const y = pos.getY(i) / (h * 0.5);
		const r2 = x * x + y * y;
		pos.setZ(i, bulge * Math.max(0, 1 - r2 * 0.9));
	}
	pos.needsUpdate = true;
	g.computeVertexNormals();
	return g;
}

function decal(
	bag: Bag,
	texture: THREE.Texture,
	w: number,
	h: number,
	parent: THREE.Object3D,
	x: number,
	y: number,
	z: number,
	rotY = 0,
): THREE.Mesh {
	const g = track(bag, new THREE.PlaneGeometry(w, h));
	const m = mat(
		bag,
		new THREE.MeshPhysicalMaterial({
			map: texture,
			transparent: true,
			roughness: 0.35,
			metalness: 0.1,
			side: THREE.FrontSide,
			polygonOffset: true,
			polygonOffsetFactor: -4,
			polygonOffsetUnits: -4,
		}),
	);
	const mesh = add(parent, g, m, x, y, z, false, false);
	mesh.rotation.y = rotY;
	return mesh;
}

function buildMonitor(bag: Bag, parent: THREE.Group) {
	const bump = grain(bag);
	bump.repeat.set(6, 6);
	const caseMat = plastic(bag, CASE, bump);
	const insetMat = plastic(bag, CASE_INSET, bump, {
		roughness: 0.62,
		bumpScale: 0.012,
	});
	const darkMat = mat(
		bag,
		new THREE.MeshStandardMaterial({ color: SLOT, roughness: 0.9 }),
	);

	const monitor = new THREE.Group();
	monitor.position.set(0, H / 2, 0);
	parent.add(monitor);

	const body = caseProfile(track(bag, new RoundedBoxGeometry(W, H, D, 6, 0.1)));
	add(monitor, body, caseMat, 0, 0, 0);

	buildScreen(bag, caseMat, darkMat, monitor);
	buildFrontDetails(bag, monitor);
	buildTopRear(bag, caseMat, insetMat, darkMat, monitor);
	buildSideVents(bag, darkMat, monitor);
	buildBackDetails(bag, darkMat, monitor);

	const glow = new THREE.PointLight(0x6fa87a, 0.12, 2.2, 2);
	glow.position.set(0, 0.32, D / 2 - 0.2);
	monitor.add(glow);
}

function buildScreen(
	bag: Bag,
	caseMat: THREE.MeshPhysicalMaterial,
	darkMat: THREE.MeshStandardMaterial,
	monitor: THREE.Group,
) {
	const screenY = 0.26;
	const screenW = 1.48;
	const screenH = 1.18;

	// Smooth recessed bezel well leading into the screen
	const bezelOuter = roundedRect(screenW + 0.22, screenH + 0.22, 0.14);
	const bezelInner = roundedRect(screenW, screenH, 0.08);
	bezelOuter.holes.push(bezelInner);
	const bezelGeo = track(
		bag,
		new THREE.ExtrudeGeometry(bezelOuter, {
			depth: 0.05,
			bevelEnabled: true,
			bevelThickness: 0.02,
			bevelSize: 0.015,
			bevelSegments: 3,
			curveSegments: 10,
		}),
	);
	add(monitor, bezelGeo, caseMat, 0, screenY, D / 2 - 0.02);

	// Inner dark bezel border
	const innerBezel = track(
		bag,
		new RoundedBoxGeometry(screenW + 0.02, screenH + 0.02, 0.06, 2, 0.04),
	);
	add(
		monitor,
		innerBezel,
		mat(
			bag,
			new THREE.MeshStandardMaterial({
				color: 0x222622,
				roughness: 0.85,
			}),
		),
		0,
		screenY,
		D / 2 - 0.04,
	);

	// Phosphor CRT curved display surface
	const phosphor = bulgePlane(bag, screenW - 0.02, screenH - 0.02, 0.035);
	const phosphorMat = mat(
		bag,
		new THREE.MeshPhysicalMaterial({
			color: 0x3d6c52,
			roughness: 0.45,
			metalness: 0.02,
			emissive: new THREE.Color(0x1e3f2c),
			emissiveIntensity: 0.32,
			clearcoat: 0.6,
			clearcoatRoughness: 0.25,
		}),
	);
	add(monitor, phosphor, phosphorMat, 0, screenY, D / 2 + 0.015, false, true);

	// Curved glass overlay
	const glass = bulgePlane(bag, screenW, screenH, 0.042);
	const glassMat = mat(
		bag,
		new THREE.MeshPhysicalMaterial({
			color: 0x486b58,
			roughness: 0.08,
			metalness: 0.02,
			clearcoat: 1,
			clearcoatRoughness: 0.08,
			transparent: true,
			opacity: 0.32,
			depthWrite: false,
		}),
	);
	add(monitor, glass, glassMat, 0, screenY, D / 2 + 0.022, false, true);

	// Floppy disk drive slot with lower beveled groove
	const slotWidth = 0.62;
	const slotHeight = 0.032;
	const slotX = 0.28;
	const slotY = -0.66;
	const slotZ = D / 2 + 0.002;

	// Main horizontal slot opening
	const slotGeo = track(
		bag,
		new RoundedBoxGeometry(slotWidth, slotHeight, 0.06, 1, 0.006),
	);
	add(monitor, slotGeo, darkMat, slotX, slotY, slotZ - 0.02, false, true);

	// Floppy drive lower bevel / tray groove
	const trayGeo = track(
		bag,
		new RoundedBoxGeometry(slotWidth + 0.04, 0.014, 0.03, 1, 0.004),
	);
	const trayMat = mat(
		bag,
		new THREE.MeshStandardMaterial({
			color: 0xbaa983,
			roughness: 0.8,
		}),
	);
	add(monitor, trayGeo, trayMat, slotX, slotY - 0.022, slotZ - 0.01, false, true);

	// Eject notch hole on the right of the slot
	const ejectGeo = track(
		bag,
		new RoundedBoxGeometry(0.12, 0.08, 0.05, 1, 0.008),
	);
	add(
		monitor,
		ejectGeo,
		darkMat,
		slotX + slotWidth / 2 - 0.04,
		slotY - 0.045,
		slotZ - 0.02,
		false,
		true,
	);

	// Rainbow Apple logo on bottom-left chin
	const rainbow = tex(bag, createAppleTexture("rainbow"));
	decal(bag, rainbow, 0.1, 0.12, monitor, -0.72, -0.66, D / 2 + 0.006);
}

function buildFrontDetails(bag: Bag, monitor: THREE.Group) {
	const caseBump = grain(bag);
	caseBump.repeat.set(4, 4);
	const caseMat = plastic(bag, CASE, caseBump);
	const darkMat = mat(
		bag,
		new THREE.MeshStandardMaterial({ color: 0x222220, roughness: 0.85 }),
	);

	// Recessed pedestal / base foot underneath the front overhang
	const footWidth = W - 0.22;
	const footHeight = 0.18;
	const footDepth = D - 0.15;
	const footY = -H / 2 + footHeight / 2 - 0.01;
	const footZ = 0.05;

	const footGeo = track(
		bag,
		new RoundedBoxGeometry(footWidth, footHeight, footDepth, 2, 0.02),
	);
	add(monitor, footGeo, caseMat, 0, footY, footZ);

	// Front chin overhang step
	const chinLipGeo = track(
		bag,
		new RoundedBoxGeometry(W - 0.08, 0.03, 0.06, 1, 0.008),
	);
	add(monitor, chinLipGeo, caseMat, 0, -H / 2 + 0.18, D / 2 - 0.02);

	// Keyboard RJ11 port on the bottom-right of the recessed foot
	const portGeo = track(
		bag,
		new RoundedBoxGeometry(0.09, 0.07, 0.04, 1, 0.006),
	);
	add(
		monitor,
		portGeo,
		darkMat,
		footWidth / 2 - 0.16,
		footY - 0.02,
		D / 2 - 0.06,
		false,
		true,
	);

	// Front bezel casing parting line (groove running around top and sides)
	const seamMat = mat(
		bag,
		new THREE.MeshStandardMaterial({ color: 0xb5a37d, roughness: 0.95 }),
	);
	const seamGeo = track(
		bag,
		new RoundedBoxGeometry(W + 0.004, H + 0.004, 0.008, 1, 0.002),
	);
	add(monitor, seamGeo, seamMat, 0, 0, D / 2 - 0.28, false, true);
}

function buildTopRear(
	bag: Bag,
	caseMat: THREE.MeshPhysicalMaterial,
	insetMat: THREE.MeshPhysicalMaterial,
	darkMat: THREE.MeshStandardMaterial,
	monitor: THREE.Group,
) {
	// Top handle recess pocket in center
	const pocketZ = -D / 2 + 0.44;
	const pocketY = topY(pocketZ) - 0.06;

	const pocket = track(bag, new RoundedBoxGeometry(0.88, 0.16, 0.44, 2, 0.03));
	const pocketMesh = add(monitor, pocket, insetMat, 0, pocketY, pocketZ);
	pocketMesh.rotation.x = -SLOPE_ANGLE;

	// Handle bar inside recess
	const barZ = pocketZ + 0.11;
	const barY = topY(barZ) - 0.01;
	const bar = track(bag, new RoundedBoxGeometry(0.8, 0.05, 0.16, 2, 0.02));
	const barMesh = add(monitor, bar, caseMat, 0, barY, barZ);
	barMesh.rotation.x = -SLOPE_ANGLE;

	// Vertical cooling slats inside handle recess back wall
	for (let i = 0; i < 9; i++) {
		const slat = track(bag, new THREE.BoxGeometry(0.022, 0.1, 0.2));
		const slatMesh = add(
			monitor,
			slat,
			darkMat,
			-0.34 + i * 0.085,
			topY(pocketZ - 0.12) - 0.03,
			pocketZ - 0.12,
			false,
			true,
		);
		slatMesh.rotation.x = -SLOPE_ANGLE;
	}

	// Sloped shoulder cooling vents on left and right sides
	for (const side of [-1, 1]) {
		for (let i = 0; i < 6; i++) {
			const z = -D / 2 + 0.22 + i * 0.062;
			const slat = track(bag, new THREE.BoxGeometry(0.32, 0.016, 0.04));
			const slatMesh = add(
				monitor,
				slat,
				darkMat,
				side * 0.68,
				topY(z) - 0.005,
				z,
				false,
				true,
			);
			slatMesh.rotation.x = -SLOPE_ANGLE;
		}

		// Top flat panel groove lines (rectangular inset border on shoulders)
		const grooveMat = mat(
			bag,
			new THREE.MeshStandardMaterial({ color: 0xbaa983, roughness: 0.9 }),
		);
		const grooveZ = -D / 2 + 0.58;
		const grooveY = topY(grooveZ) + 0.002;
		const groove = track(bag, new THREE.BoxGeometry(0.38, 0.004, 0.44));
		const grooveMesh = add(
			monitor,
			groove,
			grooveMat,
			side * 0.68,
			grooveY,
			grooveZ,
			false,
			true,
		);
		grooveMesh.rotation.x = -SLOPE_ANGLE;
	}
}

function buildSideVents(
	bag: Bag,
	darkMat: THREE.MeshStandardMaterial,
	monitor: THREE.Group,
) {
	const caseBump = grain(bag);
	caseBump.repeat.set(4, 4);
	const ribMat = plastic(bag, CASE, caseBump);

	const ventDepth = 0.95;
	const ventZ = -D / 2 + ventDepth / 2 + 0.08;

	for (const side of [-1, 1]) {
		const sideX = side * (W / 2 - 0.008);

		// 6 horizontal vent slats
		for (let i = 0; i < 6; i++) {
			const y = -H / 2 + 0.12 + i * 0.038;
			const slat = track(bag, new THREE.BoxGeometry(0.035, 0.016, ventDepth));
			add(monitor, slat, darkMat, sideX, y, ventZ, false, true);
		}

		// Vertical divider ribs across the slats
		for (let j = 0; j < 6; j++) {
			const rz = ventZ - ventDepth / 2 + 0.1 + j * 0.15;
			const rib = track(bag, new THREE.BoxGeometry(0.04, 0.22, 0.018));
			add(
				monitor,
				rib,
				ribMat,
				sideX,
				-H / 2 + 0.12 + 2.5 * 0.038,
				rz,
				false,
				true,
			);
		}
	}
}

function buildBackDetails(
	bag: Bag,
	darkMat: THREE.MeshStandardMaterial,
	monitor: THREE.Group,
) {
	// Upper-Left Macintosh Metallic Badge (as seen in the reference photo)
	const badgeY = 0.44;
	const badgeZ = backZ(badgeY);
	const badgeX = -0.54;

	// 3D metallic plate backing with slight chamfer
	const plateGeo = track(
		bag,
		new RoundedBoxGeometry(0.56, 0.17, 0.016, 2, 0.008),
	);
	const plateMat = mat(
		bag,
		new THREE.MeshStandardMaterial({
			color: 0xc8c6c0,
			metalness: 0.65,
			roughness: 0.35,
		}),
	);
	const plate = add(
		monitor,
		plateGeo,
		plateMat,
		badgeX,
		badgeY,
		badgeZ - 0.004,
		true,
		true,
	);
	plate.rotation.y = Math.PI;

	// High-resolution decal on the plate
	const labelTex = tex(bag, createBackLabelTexture());
	const decalMesh = decal(
		bag,
		labelTex,
		0.54,
		0.16,
		monitor,
		badgeX,
		badgeY,
		badgeZ - 0.013,
		Math.PI,
	);

	// Vertical service / battery latch slot on far left edge
	const slotGeo = track(
		bag,
		new RoundedBoxGeometry(0.035, 0.26, 0.025, 1, 0.006),
	);
	add(
		monitor,
		slotGeo,
		darkMat,
		-W / 2 + 0.035,
		0.04,
		backZ(0.04) - 0.004,
		false,
		true,
	);

	// Stepped base molding on bottom rear corner
	const stepMat = mat(
		bag,
		new THREE.MeshStandardMaterial({ color: 0x222220, roughness: 0.85 }),
	);
	const stepGeo = track(
		bag,
		new RoundedBoxGeometry(W - 0.06, 0.025, 0.035, 1, 0.004),
	);
	add(monitor, stepGeo, stepMat, 0, -H / 2 + 0.015, backZ(-H / 2) - 0.006);
}

export function createMacintoshModel(): MacintoshModel {
	const bag: Bag = { geos: [], mats: [], texs: [] };
	const group = new THREE.Group();
	buildMonitor(bag, group);

	return {
		group,
		dispose() {
			for (const g of bag.geos) g.dispose();
			for (const m of bag.mats) m.dispose();
			for (const t of bag.texs) t.dispose();
		},
	};
}
