"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

interface CurveDef {
	startYRatio: number;
	endYOffset: number;
	cp1xRatio: number;
	cp2xRatio: number;
}

const CURVES: CurveDef[] = [
	{ startYRatio: 0.05, endYOffset: -18, cp1xRatio: 0.42, cp2xRatio: 0.58 },
	{ startYRatio: 0.12, endYOffset: -14, cp1xRatio: 0.44, cp2xRatio: 0.56 },
	{ startYRatio: 0.22, endYOffset: -10, cp1xRatio: 0.45, cp2xRatio: 0.55 },
	{ startYRatio: 0.34, endYOffset: -6, cp1xRatio: 0.46, cp2xRatio: 0.54 },
	{ startYRatio: 0.45, endYOffset: -2, cp1xRatio: 0.48, cp2xRatio: 0.52 },
	{ startYRatio: 0.55, endYOffset: 2, cp1xRatio: 0.48, cp2xRatio: 0.52 },
	{ startYRatio: 0.66, endYOffset: 6, cp1xRatio: 0.46, cp2xRatio: 0.54 },
	{ startYRatio: 0.78, endYOffset: 10, cp1xRatio: 0.45, cp2xRatio: 0.55 },
	{ startYRatio: 0.88, endYOffset: 14, cp1xRatio: 0.44, cp2xRatio: 0.56 },
	{ startYRatio: 0.95, endYOffset: 18, cp1xRatio: 0.42, cp2xRatio: 0.58 },
];

type ParticleType = "blue" | "green" | "neutral";

interface Particle {
	curveIndex: number;
	t: number;
	speed: number;
	size: number;
	type: ParticleType;
	baseAlpha: number;
}

function getBezierPoint(
	p0: { x: number; y: number },
	p1: { x: number; y: number },
	p2: { x: number; y: number },
	p3: { x: number; y: number },
	t: number,
) {
	const oneMinusT = 1 - t;
	const a = oneMinusT * oneMinusT * oneMinusT;
	const b = 3 * oneMinusT * oneMinusT * t;
	const c = 3 * oneMinusT * t * t;
	const d = t * t * t;
	return {
		x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
		y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
	};
}

function initParticles(seedOffset = 0): Particle[] {
	const particles: Particle[] = [];
	const particleCount = 22;

	for (let i = 0; i < particleCount; i++) {
		const curveIndex = i % CURVES.length;
		// Pseudo-random deterministic distribution based on index and seed
		const pseudoRand1 = ((i * 17 + seedOffset * 31) % 100) / 100;
		const pseudoRand2 = ((i * 23 + seedOffset * 47) % 100) / 100;
		const pseudoRand3 = ((i * 37 + seedOffset * 13) % 100) / 100;

		let type: ParticleType = "neutral";
		if (pseudoRand1 < 0.25) {
			type = "blue";
		} else if (pseudoRand1 < 0.42) {
			type = "green";
		}

		particles.push({
			curveIndex,
			t: (i / particleCount + pseudoRand2 * 0.3) % 1,
			speed: 0.045 + pseudoRand3 * 0.04,
			size: pseudoRand1 < 0.3 ? 4.5 : pseudoRand2 < 0.5 ? 3.5 : 4,
			type,
			baseAlpha: type === "neutral" ? 0.45 + pseudoRand2 * 0.25 : 0.85,
		});
	}

	return particles;
}

function FlowCanvas({ seed = 0 }: { seed?: number }) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const { resolvedTheme } = useTheme();

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let animationFrameId: number;
		let lastTimestamp: number | null = null;
		const particles = initParticles(seed);

		const isDark = resolvedTheme === "dark";

		// Colors based on theme
		const colors = {
			blue: isDark ? "#52a8ff" : "#006ffe",
			green: isDark ? "#34d399" : "#10b981",
			neutral: isDark
				? "rgba(255, 255, 255, 0.45)"
				: "rgba(100, 116, 139, 0.55)",
			lineStart: isDark ? "rgba(255, 255, 255, 0)" : "rgba(100, 116, 139, 0)",
			lineMid: isDark
				? "rgba(255, 255, 255, 0.09)"
				: "rgba(100, 116, 139, 0.20)",
			lineEnd: isDark
				? "rgba(255, 255, 255, 0.18)"
				: "rgba(100, 116, 139, 0.32)",
		};

		const handleResize = () => {
			const rect = canvas.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			canvas.width = Math.max(1, Math.round(rect.width * dpr));
			canvas.height = Math.max(1, Math.round(rect.height * dpr));
		};

		handleResize();
		const resizeObserver = new ResizeObserver(() => handleResize());
		resizeObserver.observe(canvas);

		const render = (timestamp: number) => {
			if (lastTimestamp === null) lastTimestamp = timestamp;
			const delta = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
			lastTimestamp = timestamp;

			const rect = canvas.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			const width = rect.width;
			const height = rect.height;

			if (width <= 0 || height <= 0) {
				animationFrameId = requestAnimationFrame(render);
				return;
			}

			ctx.save();
			ctx.scale(dpr, dpr);
			ctx.clearRect(0, 0, width, height);

			const centerY = height / 2;

			// 1. Draw curves
			for (const curve of CURVES) {
				const p0 = { x: 0, y: height * curve.startYRatio };
				const p3 = { x: width, y: centerY + curve.endYOffset };
				const cp1 = { x: width * curve.cp1xRatio, y: p0.y };
				const cp2 = { x: width * curve.cp2xRatio, y: p3.y };

				const gradient = ctx.createLinearGradient(0, p0.y, width, p3.y);
				gradient.addColorStop(0, colors.lineStart);
				gradient.addColorStop(0.18, colors.lineMid);
				gradient.addColorStop(0.85, colors.lineMid);
				gradient.addColorStop(1, colors.lineEnd);

				ctx.beginPath();
				ctx.moveTo(p0.x, p0.y);
				ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p3.x, p3.y);
				ctx.strokeStyle = gradient;
				ctx.lineWidth = 1;
				ctx.stroke();
			}

			// 2. Update and draw particles
			for (const p of particles) {
				p.t += p.speed * delta;
				if (p.t > 1) {
					p.t = 0;
				}

				const curve = CURVES[p.curveIndex];
				if (!curve) continue;

				const p0 = { x: 0, y: height * curve.startYRatio };
				const p3 = { x: width, y: centerY + curve.endYOffset };
				const cp1 = { x: width * curve.cp1xRatio, y: p0.y };
				const cp2 = { x: width * curve.cp2xRatio, y: p3.y };

				const pt = getBezierPoint(p0, cp1, cp2, p3, p.t);

				// Alpha fade at ends
				let alpha = p.baseAlpha;
				if (p.t < 0.12) {
					alpha *= p.t / 0.12;
				} else if (p.t > 0.88) {
					alpha *= (1 - p.t) / 0.12;
				}

				ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
				ctx.fillStyle = colors[p.type];

				// Draw crisp square
				const halfSize = p.size / 2;
				ctx.fillRect(
					Math.round(pt.x - halfSize),
					Math.round(pt.y - halfSize),
					p.size,
					p.size,
				);
			}

			ctx.restore();
			animationFrameId = requestAnimationFrame(render);
		};

		animationFrameId = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(animationFrameId);
			resizeObserver.disconnect();
		};
	}, [resolvedTheme, seed]);

	return <canvas ref={canvasRef} className="block size-full" />;
}

export function TempEmailHeroLines() {
	return (
		<>
			{/* Left Canvas: Flows from viewport left edge into input's left edge */}
			<div
				className="-translate-y-1/2 pointer-events-none absolute top-[74px] right-full hidden md:block"
				style={{
					width: "calc(50vw - 50%)",
					height: "clamp(420px, calc((50vw - 50%) * 1.25), 850px)",
				}}
				aria-hidden="true"
			>
				<FlowCanvas seed={1} />
			</div>

			{/* Right Canvas: Flows from viewport right edge into input's right edge */}
			<div
				className="-translate-y-1/2 pointer-events-none absolute top-[74px] left-full hidden rotate-180 md:block"
				style={{
					width: "calc(50vw - 50%)",
					height: "clamp(420px, calc((50vw - 50%) * 1.25), 850px)",
				}}
				aria-hidden="true"
			>
				<FlowCanvas seed={2} />
			</div>
		</>
	);
}
