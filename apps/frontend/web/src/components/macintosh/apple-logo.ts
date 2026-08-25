import * as THREE from "three";

const RAINBOW = [
	"#61bb46",
	"#fdb827",
	"#f5821f",
	"#e03a3e",
	"#963d97",
	"#009ddd",
];

function traceApple(ctx: CanvasRenderingContext2D, size: number) {
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
}

function drawApple(ctx: CanvasRenderingContext2D, size: number) {
	traceApple(ctx, size);
	ctx.fill();
}

function fillRainbow(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
) {
	ctx.save();
	ctx.translate(x, y);
	traceApple(ctx, size);
	ctx.clip();
	const band = size / RAINBOW.length;
	for (let i = 0; i < RAINBOW.length; i++) {
		ctx.fillStyle = RAINBOW[i] ?? "#000";
		ctx.fillRect(-size, i * band, size * 3, band + 1);
	}
	ctx.restore();
}

export function createAppleTexture(
	kind: "rainbow" | "emboss",
): THREE.CanvasTexture {
	const size = 512;
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		return new THREE.CanvasTexture(canvas);
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

export function createBackLabelTexture(): THREE.CanvasTexture {
	const w = 1024;
	const h = 320;
	const canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		return new THREE.CanvasTexture(canvas);
	}

	const r = 28;
	// Metallic brushed badge base
	const grad = ctx.createLinearGradient(0, 0, 0, h);
	grad.addColorStop(0, "#d2d0cb");
	grad.addColorStop(0.3, "#bcb9b2");
	grad.addColorStop(0.7, "#a8a59e");
	grad.addColorStop(1, "#94918a");

	ctx.beginPath();
	ctx.moveTo(r, 0);
	ctx.lineTo(w - r, 0);
	ctx.quadraticCurveTo(w, 0, w, r);
	ctx.lineTo(w, h - r);
	ctx.quadraticCurveTo(w, h, w - r, h);
	ctx.lineTo(r, h);
	ctx.quadraticCurveTo(0, h, 0, h - r);
	ctx.lineTo(0, r);
	ctx.quadraticCurveTo(0, 0, r, 0);
	ctx.closePath();
	ctx.fillStyle = grad;
	ctx.fill();

	// Subtle brushed bevel border
	ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
	ctx.lineWidth = 4;
	ctx.stroke();

	// Subtle inner shadow border
	ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
	ctx.lineWidth = 2;
	ctx.stroke();

	// Apple Rainbow Logo on the left
	fillRainbow(ctx, 48, 36, 210);

	// "Macintosh" wordmark in classic Apple Garamond / serif typography
	ctx.textBaseline = "middle";
	ctx.font =
		"italic 600 116px 'Apple Garamond', 'Garamond', 'Georgia', 'Times New Roman', serif";

	// Embossed shadow
	ctx.fillStyle = "rgba(40, 38, 32, 0.65)";
	ctx.fillText("Macintosh", 294, h / 2 + 5);

	// Top highlight
	ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
	ctx.fillText("Macintosh", 290, h / 2 - 2);

	// Main lettering
	ctx.fillStyle = "#edebe6";
	ctx.fillText("Macintosh", 292, h / 2 + 2);

	const tex = new THREE.CanvasTexture(canvas);
	tex.colorSpace = THREE.SRGBColorSpace;
	tex.anisotropy = 8;
	tex.needsUpdate = true;
	return tex;
}
