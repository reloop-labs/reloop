import * as THREE from "three";

const RAINBOW = [
	"#61bb46",
	"#fdb827",
	"#f5821f",
	"#e03a3e",
	"#963d97",
	"#009ddd",
];

function drawApple(ctx: CanvasRenderingContext2D, size: number) {
	const cx = size * 0.48;
	const cy = size * 0.56;
	const s = size * 0.42;

	ctx.beginPath();
	ctx.moveTo(cx, cy + s * 0.78);
	ctx.bezierCurveTo(
		cx - s * 1.05,
		cy + s * 0.78,
		cx - s * 1.12,
		cy - s * 0.12,
		cx - s * 0.55,
		cy - s * 0.48,
	);
	ctx.bezierCurveTo(
		cx - s * 0.28,
		cy - s * 0.68,
		cx - s * 0.02,
		cy - s * 0.62,
		cx,
		cy - s * 0.38,
	);
	ctx.bezierCurveTo(
		cx + s * 0.02,
		cy - s * 0.62,
		cx + s * 0.28,
		cy - s * 0.68,
		cx + s * 0.55,
		cy - s * 0.48,
	);
	ctx.bezierCurveTo(
		cx + s * 1.12,
		cy - s * 0.12,
		cx + s * 1.05,
		cy + s * 0.78,
		cx,
		cy + s * 0.78,
	);
	ctx.closePath();
	ctx.fill();

	ctx.beginPath();
	ctx.moveTo(cx + s * 0.02, cy - s * 0.42);
	ctx.bezierCurveTo(
		cx + s * 0.1,
		cy - s * 1.05,
		cx + s * 0.62,
		cy - s * 1.18,
		cx + s * 0.42,
		cy - s * 0.58,
	);
	ctx.bezierCurveTo(
		cx + s * 0.28,
		cy - s * 0.48,
		cx + s * 0.1,
		cy - s * 0.4,
		cx + s * 0.02,
		cy - s * 0.42,
	);
	ctx.closePath();
	ctx.fill();
}

export function createAppleTexture(
	kind: "rainbow" | "emboss",
): THREE.CanvasTexture {
	const size = 256;
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		const tex = new THREE.CanvasTexture(canvas);
		return tex;
	}

	if (kind === "rainbow") {
		const band = size / RAINBOW.length;
		for (let i = 0; i < RAINBOW.length; i++) {
			ctx.fillStyle = RAINBOW[i] ?? "#000";
			ctx.fillRect(0, i * band, size, band + 1);
		}
	} else {
		ctx.fillStyle = "#c4b394";
		ctx.fillRect(0, 0, size, size);
	}

	ctx.globalCompositeOperation = "destination-in";
	ctx.fillStyle = "#fff";
	drawApple(ctx, size);

	ctx.globalCompositeOperation = "destination-out";
	ctx.beginPath();
	ctx.arc(size * 0.78, size * 0.4, size * 0.16, 0, Math.PI * 2);
	ctx.fill();

	const tex = new THREE.CanvasTexture(canvas);
	tex.colorSpace = THREE.SRGBColorSpace;
	tex.anisotropy = 8;
	tex.needsUpdate = true;
	return tex;
}
