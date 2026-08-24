import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { createAppleTexture } from "./apple-logo";

const CASE = 0xe6d6b3;
const CASE_INSET = 0xd9c9a6;
const KEYCAP = 0xeee6d8;
const BUTTON = 0xc9c6bc;
const SLOT = 0x1a1a1a;
const BEZEL = 0x2c302c;
const PHOSPHOR = 0x5f7d68;
const GLASS = 0x4e6d58;
const CABLE = 0xc8c8c8;
const PORT = 0x2a2a2a;

export const STUDIO_COLOR = 0x5a5a5a;

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
			roughness: 0.52,
			metalness: 0,
			clearcoat: 0.22,
			clearcoatRoughness: 0.55,
			bumpMap: bump,
			bumpScale: 0.018,
			sheen: 0.18,
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
	cast = true,
	receive = true,
): THREE.Mesh {
	const mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(x, y, z);
	mesh.castShadow = cast;
	mesh.receiveShadow = receive;
	parent.add(mesh);
	return mesh;
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
	const g = track(bag, new THREE.PlaneGeometry(w, h, 28, 22));
	const pos = g.attributes.position;
	if (!pos) return g;
	for (let i = 0; i < pos.count; i++) {
		const x = pos.getX(i) / (w * 0.5);
		const y = pos.getY(i) / (h * 0.5);
		const r2 = x * x + y * y;
		pos.setZ(i, bulge * Math.max(0, 1 - r2 * 0.92));
	}
	pos.needsUpdate = true;
	g.computeVertexNormals();
	return g;
}

function slopeTop(
	geo: THREE.BufferGeometry,
	depth: number,
	drop: number,
): THREE.BufferGeometry {
	const pos = geo.attributes.position;
	if (!pos) return geo;
	for (let i = 0; i < pos.count; i++) {
		const y = pos.getY(i);
		const z = pos.getZ(i);
		if (y > 0) {
			const t = (z + depth / 2) / depth;
			pos.setY(i, y - drop * t);
		}
	}
	pos.needsUpdate = true;
	geo.computeVertexNormals();
	return geo;
}

function cable(
	bag: Bag,
	material: THREE.Material,
	points: THREE.Vector3[],
	radius: number,
	parent: THREE.Object3D,
): THREE.Mesh {
	const curve = new THREE.CatmullRomCurve3(points);
	const g = track(bag, new THREE.TubeGeometry(curve, 96, radius, 8, false));
	return add(parent, g, material, 0, 0, 0);
}

function appleDecal(
	bag: Bag,
	texture: THREE.Texture,
	w: number,
	h: number,
	parent: THREE.Object3D,
	x: number,
	y: number,
	z: number,
	rotX = 0,
	rotY = 0,
	rotZ = 0,
): THREE.Mesh {
	const g = track(bag, new THREE.PlaneGeometry(w, h));
	const m = mat(
		bag,
		new THREE.MeshPhysicalMaterial({
			map: texture,
			transparent: true,
			roughness: 0.45,
			metalness: 0,
			side: THREE.DoubleSide,
			polygonOffset: true,
			polygonOffsetFactor: -2,
			polygonOffsetUnits: -2,
		}),
	);
	const mesh = add(parent, g, m, x, y, z, false, false);
	mesh.rotation.set(rotX, rotY, rotZ);
	return mesh;
}

function buildComputer(
	bag: Bag,
	caseMat: THREE.MeshPhysicalMaterial,
	insetMat: THREE.MeshPhysicalMaterial,
	parent: THREE.Group,
) {
	const W = 2.08;
	const H = 2.48;
	const D = 2.28;
	const body = track(bag, new RoundedBoxGeometry(W, H, D, 4, 0.09));
	const computer = new THREE.Group();
	computer.position.set(0.72, H / 2, 0);
	parent.add(computer);
	add(computer, body, caseMat, 0, 0, 0);

	const topFront = track(
		bag,
		new RoundedBoxGeometry(1.55, 0.04, 1.05, 2, 0.02),
	);
	add(computer, topFront, insetMat, -0.02, H / 2 - 0.012, 0.28);

	const topRear = track(bag, new RoundedBoxGeometry(0.95, 0.04, 0.55, 2, 0.02));
	add(computer, topRear, insetMat, 0.28, H / 2 - 0.012, -0.72);

	const handle = track(bag, new RoundedBoxGeometry(1.15, 0.22, 0.42, 2, 0.04));
	add(computer, handle, insetMat, -0.12, H / 2 - 0.14, -D / 2 + 0.18);

	const screenW = 1.48;
	const screenH = 1.16;
	const well = track(
		bag,
		new RoundedBoxGeometry(screenW + 0.08, screenH + 0.08, 0.16, 3, 0.06),
	);
	add(
		computer,
		well,
		mat(
			bag,
			new THREE.MeshPhysicalMaterial({
				color: BEZEL,
				roughness: 0.7,
				metalness: 0,
			}),
		),
		0,
		0.28,
		D / 2 - 0.05,
	);

	const phosphor = bulgePlane(bag, screenW * 0.92, screenH * 0.9, 0.07);
	const phosphorMat = mat(
		bag,
		new THREE.MeshPhysicalMaterial({
			color: PHOSPHOR,
			roughness: 0.55,
			metalness: 0,
			emissive: new THREE.Color(0x2a4a36),
			emissiveIntensity: 0.45,
		}),
	);
	add(computer, phosphor, phosphorMat, 0, 0.28, D / 2 - 0.09, false, true);

	const glass = bulgePlane(bag, screenW * 0.94, screenH * 0.92, 0.08);
	const glassMat = mat(
		bag,
		new THREE.MeshPhysicalMaterial({
			color: GLASS,
			roughness: 0.1,
			metalness: 0.04,
			clearcoat: 1,
			clearcoatRoughness: 0.08,
			transparent: true,
			opacity: 0.78,
			emissive: new THREE.Color(0x1a3324),
			emissiveIntensity: 0.18,
		}),
	);
	add(computer, glass, glassMat, 0, 0.28, D / 2 - 0.02, false, true);

	const lipOuter = roundedRect(screenW + 0.14, screenH + 0.14, 0.1);
	const lipInner = roundedRect(screenW * 0.9, screenH * 0.88, 0.08);
	lipOuter.holes.push(lipInner);
	const lipGeo = track(
		bag,
		new THREE.ExtrudeGeometry(lipOuter, {
			depth: 0.035,
			bevelEnabled: true,
			bevelThickness: 0.012,
			bevelSize: 0.01,
			bevelSegments: 2,
			curveSegments: 8,
		}),
	);
	add(computer, lipGeo, caseMat, 0, 0.28, D / 2 - 0.018);

	const drive = track(bag, new RoundedBoxGeometry(1.22, 0.34, 0.06, 2, 0.02));
	add(computer, drive, insetMat, 0.02, -0.62, D / 2 - 0.028);

	const slot = track(bag, new RoundedBoxGeometry(1.02, 0.055, 0.12, 1, 0.01));
	add(
		computer,
		slot,
		mat(bag, new THREE.MeshStandardMaterial({ color: SLOT, roughness: 0.9 })),
		0.0,
		-0.54,
		D / 2 - 0.01,
		false,
		true,
	);

	const eject = track(bag, new RoundedBoxGeometry(0.26, 0.16, 0.1, 1, 0.01));
	add(
		computer,
		eject,
		mat(bag, new THREE.MeshStandardMaterial({ color: SLOT, roughness: 0.9 })),
		0.48,
		-0.68,
		D / 2 - 0.02,
		false,
		true,
	);

	const chin = track(
		bag,
		new RoundedBoxGeometry(W - 0.12, 0.08, 0.06, 2, 0.02),
	);
	add(computer, chin, insetMat, 0, -H / 2 + 0.1, D / 2 - 0.03);

	addVents(bag, insetMat, computer, W, H);

	const rainbow = tex(bag, createAppleTexture("rainbow"));
	appleDecal(bag, rainbow, 0.1, 0.12, computer, -0.78, -0.42, D / 2 + 0.004);

	const portMat = mat(
		bag,
		new THREE.MeshStandardMaterial({ color: PORT, roughness: 0.8 }),
	);
	const kbPort = track(bag, new THREE.CylinderGeometry(0.035, 0.035, 0.06, 12));
	const kbPortMesh = add(
		computer,
		kbPort,
		portMat,
		W / 2 - 0.02,
		-H / 2 + 0.28,
		D / 2 - 0.22,
		false,
		true,
	);
	kbPortMesh.rotation.z = Math.PI / 2;

	const glow = new THREE.PointLight(0x6fa87a, 0.35, 2.4, 2);
	glow.position.set(0, 0.28, D / 2 - 0.2);
	computer.add(glow);

	return { computer, W, H, D };
}

function addVents(
	bag: Bag,
	insetMat: THREE.Material,
	computer: THREE.Group,
	W: number,
	H: number,
) {
	const slat = track(bag, new THREE.BoxGeometry(0.03, 0.018, 0.42));
	const cluster = (count: number, originY: number, originZ: number) => {
		for (let i = 0; i < count; i++) {
			add(
				computer,
				slat,
				insetMat,
				W / 2 - 0.012,
				originY + i * 0.038,
				originZ,
				false,
				true,
			);
		}
	};
	cluster(10, -H / 2 + 0.22, -0.18);
	cluster(5, -H / 2 + 0.22, 0.42);
}

function buildKeyboard(
	bag: Bag,
	caseMat: THREE.MeshPhysicalMaterial,
	insetMat: THREE.MeshPhysicalMaterial,
	parent: THREE.Group,
) {
	const W = 2.62;
	const H = 0.16;
	const D = 1.12;
	const keyboard = new THREE.Group();
	keyboard.position.set(-1.22, H / 2, 1.62);
	keyboard.rotation.y = 0.08;
	parent.add(keyboard);

	const body = track(bag, new RoundedBoxGeometry(W, H, D, 3, 0.05));
	add(keyboard, body, caseMat, 0, 0, 0);

	const well = track(
		bag,
		new RoundedBoxGeometry(W - 0.38, 0.04, D - 0.22, 2, 0.03),
	);
	add(keyboard, well, insetMat, 0.1, H / 2 - 0.012, 0);

	const keyMat = plastic(bag, KEYCAP, caseMat.bumpMap as THREE.Texture, {
		roughness: 0.42,
		clearcoat: 0.35,
		bumpScale: 0.008,
	});

	const unit = 0.128;
	const gap = 0.018;
	const keyH = 0.07;
	const keyD = 0.125;
	const rows: number[][] = [
		[...Array.from({ length: 13 }, () => 1), 1.55],
		[1.45, ...Array.from({ length: 12 }, () => 1), 1.5],
		[1.7, ...Array.from({ length: 11 }, () => 1), 1.75],
		[2.15, ...Array.from({ length: 10 }, () => 1), 2.2],
		[1.35, 1.35, 6.35, 1.35, 1.35],
	];

	const geoCache = new Map<string, THREE.BufferGeometry>();
	const keyGeo = (u: number) => {
		const key = u.toFixed(2);
		const existing = geoCache.get(key);
		if (existing) return existing;
		const g = track(
			bag,
			new RoundedBoxGeometry(unit * u - gap * 0.15, keyH, keyD, 2, 0.018),
		);
		geoCache.set(key, g);
		return g;
	};

	const startZ = 0.38;
	rows.forEach((row, ri) => {
		const rowWidth = row.reduce((sum, u) => sum + u * unit + gap, -gap);
		let x = -rowWidth / 2 + 0.1;
		const z = startZ - ri * (keyD + gap);
		for (const u of row) {
			const w = u * unit;
			add(keyboard, keyGeo(u), keyMat, x + w / 2, H / 2 + 0.012, z);
			x += w + gap;
		}
	});

	const emboss = tex(bag, createAppleTexture("emboss"));
	appleDecal(
		bag,
		emboss,
		0.09,
		0.11,
		keyboard,
		-W / 2 + 0.14,
		H / 2 + 0.003,
		-0.02,
		-Math.PI / 2,
	);

	const portMat = mat(
		bag,
		new THREE.MeshStandardMaterial({ color: PORT, roughness: 0.75 }),
	);
	const rj = track(bag, new THREE.BoxGeometry(0.06, 0.05, 0.08));
	add(keyboard, rj, portMat, W / 2 - 0.01, 0, D / 2 - 0.16, false, true);

	return { keyboard, W, H, D };
}

function buildMouse(
	bag: Bag,
	caseMat: THREE.MeshPhysicalMaterial,
	parent: THREE.Group,
) {
	const W = 0.52;
	const H = 0.22;
	const D = 0.82;
	const mouse = new THREE.Group();
	mouse.position.set(0.52, H / 2, 2.08);
	mouse.rotation.y = 0.18;
	parent.add(mouse);

	const bodyGeo = slopeTop(
		track(bag, new RoundedBoxGeometry(W, H, D, 3, 0.06)),
		D,
		0.05,
	);
	add(mouse, bodyGeo, caseMat, 0, 0, 0);

	const btn = track(bag, new RoundedBoxGeometry(0.28, 0.025, 0.22, 2, 0.02));
	const btnMat = plastic(bag, BUTTON, caseMat.bumpMap as THREE.Texture, {
		roughness: 0.48,
		bumpScale: 0.01,
	});
	add(mouse, btn, btnMat, 0, H / 2 - 0.012, -0.22);

	const emboss = tex(bag, createAppleTexture("emboss"));
	appleDecal(
		bag,
		emboss,
		0.08,
		0.1,
		mouse,
		-0.02,
		H / 2 + 0.004,
		0.12,
		-Math.PI / 2,
	);

	return { mouse, W, H, D };
}

function buildCables(
	bag: Bag,
	parent: THREE.Group,
	computer: { W: number; H: number; D: number },
	keyboard: { W: number; H: number; D: number },
) {
	const cableMat = mat(
		bag,
		new THREE.MeshPhysicalMaterial({
			color: CABLE,
			roughness: 0.35,
			metalness: 0.15,
			clearcoat: 0.4,
		}),
	);

	const kbEnd = new THREE.Vector3(
		-1.22 + (keyboard.W / 2) * Math.cos(0.08) - 0.02,
		0.08,
		1.62 + (keyboard.W / 2) * Math.sin(0.08) + 0.35,
	);
	const kbJack = new THREE.Vector3(
		0.72 + computer.W / 2,
		0.28,
		0 + computer.D / 2 - 0.22,
	);
	cable(
		bag,
		cableMat,
		[
			kbEnd,
			new THREE.Vector3(kbEnd.x + 0.35, 0.05, kbEnd.z + 0.05),
			new THREE.Vector3(kbJack.x - 0.15, 0.06, kbJack.z + 0.15),
			kbJack,
		],
		0.016,
		parent,
	);

	const mouseEnd = new THREE.Vector3(0.52, 0.12, 2.08 + 0.42);
	const mouseJack = new THREE.Vector3(
		0.72 + computer.W / 2 - 0.02,
		0.22,
		-computer.D / 2 + 0.15,
	);
	cable(
		bag,
		cableMat,
		[
			mouseEnd,
			new THREE.Vector3(1.15, 0.05, 2.35),
			new THREE.Vector3(2.15, 0.06, 1.55),
			new THREE.Vector3(2.35, 0.18, 0.2),
			new THREE.Vector3(2.05, 0.22, -0.85),
			mouseJack,
		],
		0.015,
		parent,
	);
}

export function createMacintoshModel(): MacintoshModel {
	const bag: Bag = { geos: [], mats: [], texs: [] };
	const bump = grain(bag);
	bump.repeat.set(6, 6);

	const caseMat = plastic(bag, CASE, bump);
	const insetMat = plastic(bag, CASE_INSET, bump, {
		roughness: 0.62,
		bumpScale: 0.012,
	});

	const group = new THREE.Group();
	const computer = buildComputer(bag, caseMat, insetMat, group);
	const keyboard = buildKeyboard(bag, caseMat, insetMat, group);
	buildMouse(bag, caseMat, group);
	buildCables(bag, group, computer, keyboard);

	return {
		group,
		dispose() {
			for (const g of bag.geos) g.dispose();
			for (const m of bag.mats) m.dispose();
			for (const t of bag.texs) t.dispose();
		},
	};
}
