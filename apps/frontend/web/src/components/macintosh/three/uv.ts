import * as THREE from "three";

export function generatePlanarUVs(geometry: THREE.BufferGeometry): void {
	const pos = geometry.attributes.position;
	if (!pos) return;

	const uvs = new Float32Array(pos.count * 2);

	let minX = Number.POSITIVE_INFINITY;
	let maxX = Number.NEGATIVE_INFINITY;
	let minY = Number.POSITIVE_INFINITY;
	let maxY = Number.NEGATIVE_INFINITY;

	for (let i = 0; i < pos.count; i++) {
		minX = Math.min(minX, pos.getX(i));
		maxX = Math.max(maxX, pos.getX(i));
		minY = Math.min(minY, pos.getY(i));
		maxY = Math.max(maxY, pos.getY(i));
	}

	const w = maxX - minX || 1;
	const h = maxY - minY || 1;

	for (let i = 0; i < pos.count; i++) {
		uvs[i * 2] = (pos.getX(i) - minX) / w;
		uvs[i * 2 + 1] = (pos.getY(i) - minY) / h;
	}

	geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
}
