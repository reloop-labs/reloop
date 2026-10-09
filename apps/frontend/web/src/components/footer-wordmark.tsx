"use client";

import { cn } from "@reloop/ui/cn";
import { useCallback, useEffect, useRef, useState } from "react";

export interface FooterWordmarkProps {
	className?: string;
}

const FULL_TEXT = "Reloop.sh";
const VIEW_W = 1000;
const VIEW_H = 180;
/** Generous hover target around each em cell */
const HIT_PAD = 8;
/** Snug padding around the tight glyph ink box */
const INK_PAD = 2;

interface LetterBox {
	x: number;
	y: number;
	width: number;
	height: number;
}

/** Offscreen raster for glyph ink scanning (reused across measures) */
let scanCanvas: HTMLCanvasElement | null = null;
const SCAN_SIZE = 384;
const SCAN_PEN_X = 48;
const SCAN_BASELINE = 224;
/** Alpha threshold — skips faint antialiasing fringe */
const SCAN_ALPHA = 8;

/**
 * Rasterize each glyph of the wordmark with the element's own computed
 * font and scan the alpha channel for exact ink bounds.
 * Returns per-glyph boxes relative to pen x=0 / alphabetic baseline y=0,
 * plus the main-text baseline in SVG units — or null when the canvas
 * font doesn't match the SVG layout (e.g. webfont still loading).
 */
function scanGlyphInk(
	el: SVGTextElement,
	svgAdvance: number,
): { boxes: (LetterBox | null)[]; baseline: number } | null {
	try {
		if (!scanCanvas) {
			scanCanvas = document.createElement("canvas");
			scanCanvas.width = SCAN_SIZE;
			scanCanvas.height = SCAN_SIZE;
		}
		const ctx = scanCanvas.getContext("2d", { willReadFrequently: true });
		if (!ctx) return null;
		const cs = getComputedStyle(el);
		ctx.font = `${cs.fontStyle || "normal"} ${cs.fontWeight || "800"} ${cs.fontSize || "180px"} ${cs.fontFamily || "sans-serif"}`;
		ctx.textAlign = "left";
		ctx.textBaseline = "alphabetic";
		ctx.fillStyle = "#000";

		// The rasterizer must shape exactly like the SVG text — prove it
		// by comparing total advances before trusting any pixels.
		const probe = ctx.measureText(FULL_TEXT);
		if (Math.abs(probe.width - svgAdvance) > 2) return null;
		const fa = probe.fontBoundingBoxAscent;
		const fd = probe.fontBoundingBoxDescent;
		if (!fa || !fd) return null;

		const boxes = FULL_TEXT.split("").map((ch) => {
			ctx.clearRect(0, 0, SCAN_SIZE, SCAN_SIZE);
			ctx.fillText(ch, SCAN_PEN_X, SCAN_BASELINE);
			const data = ctx.getImageData(0, 0, SCAN_SIZE, SCAN_SIZE).data;
			let minX = Number.POSITIVE_INFINITY;
			let minY = Number.POSITIVE_INFINITY;
			let maxX = -1;
			let maxY = -1;
			for (let y = 0; y < SCAN_SIZE; y++) {
				for (let x = 0; x < SCAN_SIZE; x++) {
					if ((data[(y * SCAN_SIZE + x) * 4 + 3] ?? 0) >= SCAN_ALPHA) {
						if (x < minX) minX = x;
						if (x > maxX) maxX = x;
						if (y < minY) minY = y;
						if (y > maxY) maxY = y;
					}
				}
			}
			if (maxX < 0) return null;
			return {
				x: minX - SCAN_PEN_X,
				y: minY - SCAN_BASELINE,
				width: maxX - minX + 1,
				height: maxY - minY + 1,
			};
		});

		// Baseline: the em cell top plus the font ascent. The measured
		// font box (fa + fd) matches the em cell height exactly.
		const e0 = el.getExtentOfChar(0);
		const k = e0.height / (fa + fd);
		return { boxes, baseline: e0.y + fa * k };
	} catch {
		return null;
	}
}

export function FooterWordmark({ className }: FooterWordmarkProps) {
	const textRef = useRef<SVGTextElement>(null);
	/** Full em cells from the browser layout — used as hover targets */
	const [cells, setCells] = useState<LetterBox[] | null>(null);
	/** Tight per-glyph ink boxes — used for the selection box */
	const [ink, setInk] = useState<LetterBox[] | null>(null);
	const [hovered, setHovered] = useState<number | null>(null);
	/** Last hovered ink box, so fade-out happens in place */
	const [resting, setResting] = useState<LetterBox | null>(null);
	// Calibrated coordinates for viewBox="0 0 1000 180"

	const measure = useCallback(() => {
		const el = textRef.current;
		if (!el) return;
		try {
			// getNumberOfChars accounts for both tspans in one text element
			const n =
				typeof el.getNumberOfChars === "function"
					? el.getNumberOfChars()
					: FULL_TEXT.length;
			if (!n) return;
			const nextCells: LetterBox[] = [];
			for (let i = 0; i < n; i++) {
				const e = el.getExtentOfChar(i);
				nextCells.push({ x: e.x, y: e.y, width: e.width, height: e.height });
			}
			setCells(nextCells);

			// Tight ink bounds per glyph via pixel scanning.
			// Neither SVG getBBox nor canvas actualBoundingBox returns
			// tight glyph ink in this setup (both yield full em-height
			// boxes), so rasterize each glyph and scan the alpha channel:
			// ground truth of what's actually painted.
			// - pen X comes from getStartPositionOfChar (includes kerning
			//   and the textAnchor="middle" centering shift),
			// - ink offsets come from the scanned pixels, relative to the
			//   canvas pen / alphabetic baseline,
			// - the main-text baseline is the em-cell top plus the font
			//   ascent (the measured font box matches the em cell exactly,
			//   so no guessing involved).
			// The canvas advance is cross-checked against the SVG advance;
			// on mismatch (font not ready) we keep the previous boxes.
			const penX: (number | null)[] = [];
			for (let i = 0; i < n; i++) {
				try {
					penX.push(el.getStartPositionOfChar(i).x);
				} catch {
					penX.push(null);
				}
			}
			const total = el.getComputedTextLength();
			const scanned = scanGlyphInk(el, total);
			if (!scanned) return;
			const { boxes: glyphs, baseline } = scanned;
			const nextInk: LetterBox[] = nextCells.map((cell, i) => {
				const px = penX[i];
				const g = glyphs[i];
				if (px == null || !g) return cell;
				return {
					x: px + g.x,
					y: baseline + g.y,
					width: g.width,
					height: g.height,
				};
			});
			setInk(nextInk);
		} catch {
			// Fonts not ready yet — retry on fonts.ready / rAF
		}
	}, []);

	useEffect(() => {
		let raf = 0;
		let cancelled = false;
		let ro: ResizeObserver | null = null;
		const kick = () => {
			if (!cancelled) measure();
		};
		measure();
		raf = requestAnimationFrame(measure);
		// The scan must run against the real Geist outlines — a fallback
		// font has matching advances by design but different ink, and the
		// svg element never resizes on a font swap (fixed aspect ratio),
		// so re-measure on every font arrival signal, not just ready.
		const fonts = document.fonts;
		if (fonts) {
			fonts.ready.then(kick).catch(() => {});
			// Explicitly wait for the exact face + glyphs we rasterize.
			if (typeof fonts.load === "function") {
				fonts
					.load("800 180px Geist", FULL_TEXT)
					.then(kick)
					.catch(() => {});
			}
			fonts.addEventListener("loadingdone", kick);
		}
		if (typeof ResizeObserver !== "undefined") {
			ro = new ResizeObserver(() => measure());
			if (textRef.current?.ownerSVGElement) {
				ro.observe(textRef.current.ownerSVGElement);
			}
		}
		window.addEventListener("resize", measure);
		return () => {
			cancelled = true;
			cancelAnimationFrame(raf);
			ro?.disconnect();
			fonts?.removeEventListener("loadingdone", kick);
			window.removeEventListener("resize", measure);
		};
	}, [measure]);

	useEffect(() => {
		if (hovered != null && ink?.[hovered]) setResting(ink[hovered]);
	}, [hovered, ink]);

	const target = hovered != null && ink?.[hovered] ? ink[hovered] : null;
	const display = target ?? resting;
	const visible = target != null && display != null;
	const sel = display
		? {
				x: display.x - INK_PAD,
				y: display.y - INK_PAD,
				w: display.width + INK_PAD * 2,
				h: display.height + INK_PAD * 2,
			}
		: null;

	return (
		<div
			className={cn(
				"relative flex w-full select-none items-center justify-center overflow-hidden py-12 sm:py-16 lg:py-20",
				className,
			)}
		>
			<style>{`
				.wordmark-glide {
					transition:
						left var(--duration-slow, 400ms) var(--ease-smooth-out, cubic-bezier(0.22, 1, 0.36, 1)),
						top var(--duration-slow, 400ms) var(--ease-smooth-out, cubic-bezier(0.22, 1, 0.36, 1)),
						width var(--duration-slow, 400ms) var(--ease-smooth-out, cubic-bezier(0.22, 1, 0.36, 1)),
						height var(--duration-slow, 400ms) var(--ease-smooth-out, cubic-bezier(0.22, 1, 0.36, 1)),
						opacity var(--duration-fast, 250ms) var(--ease-out, ease-out);
					will-change: left, top, width, height;
				}
				.wordmark-handle { animation: wordmark-handle-pop var(--duration-fast, 250ms) var(--ease-bounce, cubic-bezier(0.34, 1.36, 0.64, 1)) backwards; }
				@keyframes wordmark-handle-pop { from { opacity: 0; scale: 0.4; } to { opacity: 1; scale: 1; } }
				@media (prefers-reduced-motion: reduce) {
					.wordmark-glide { transition: none !important; }
					.wordmark-handle { animation: none !important; }
				}
			`}</style>
			<div
				className="block w-full max-w-4xl px-4"
				onMouseLeave={() => setHovered(null)}
			>
				<span className="sr-only">reloop.sh</span>
				<div className="relative w-full">
					<svg
						viewBox="0 0 1000 180"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						className="block h-auto w-full overflow-visible"
						role="img"
						aria-label="Reloop.sh wordmark — hover each letter to inspect"
					>
						<defs>
							{/* Fancy blue gradient for the wordmark */}
							<linearGradient
								id="wordmark-fancy-gradient"
								x1="0%"
								y1="0%"
								x2="100%"
								y2="100%"
							>
								<stop offset="0%" stopColor="#60a5fa" />
								<stop offset="100%" stopColor="#2563eb" />
							</linearGradient>

							{/* Soft glow filter */}
							<filter
								id="cursor-glow"
								x="-30%"
								y="-30%"
								width="160%"
								height="160%"
								filterUnits="userSpaceOnUse"
							>
								<feDropShadow
									dx="0"
									dy="2"
									stdDeviation="4"
									floodColor="#3b82f6"
									floodOpacity="0.45"
								/>
							</filter>
						</defs>

						{/* Combined wordmark text for optimal natural font kerning */}
						<text
							ref={textRef}
							x="500"
							y="90"
							textAnchor="middle"
							dominantBaseline="central"
							style={{
								fontFamily:
									"var(--font-geist-sans), 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
								fontWeight: 800,
							}}
							fontSize="180"
							className="transition-colors duration-200"
						>
							{/* "Reloop." in stroke outline with hollow fill */}
							<tspan
								fill="none"
								strokeWidth="2.2"
								strokeLinecap="round"
								strokeLinejoin="round"
								stroke="url(#wordmark-fancy-gradient)"
								className="transition-all duration-300 dark:stroke-white/80"
							>
								Reloop.
							</tspan>

							{/* "sh" in solid fill with fancy gradient */}
							<tspan
								stroke="none"
								fill="url(#wordmark-fancy-gradient)"
								className="transition-colors duration-200 dark:fill-white"
							>
								sh
							</tspan>
						</text>

						{/* Per-letter hit areas (transparent, capture hover/focus) */}
						{cells?.map((b, i) => (
							<rect
								key={`hit-${i}`}
								x={b.x - HIT_PAD}
								y={b.y - HIT_PAD}
								width={b.width + HIT_PAD * 2}
								height={b.height + HIT_PAD * 2}
								fill="transparent"
								style={{ cursor: "default" }}
								onMouseEnter={() => setHovered(i)}
								onFocus={() => setHovered(i)}
								onBlur={() => setHovered((h) => (h === i ? null : h))}
								tabIndex={0}
								aria-label={`Letter ${FULL_TEXT[i]}`}
							/>
						))}
					</svg>

					{/* Figma-style selection box — HTML overlay so it glides
					    smoothly between letters via CSS transitions */}
					{sel && (
						<div
							aria-hidden="true"
							className="wordmark-glide pointer-events-none absolute border-2 border-[#3b82f6] bg-[#3b82f6]/10"
							style={{
								left: `${(sel.x / VIEW_W) * 100}%`,
								top: `${(sel.y / VIEW_H) * 100}%`,
								width: `${(sel.w / VIEW_W) * 100}%`,
								height: `${(sel.h / VIEW_H) * 100}%`,
								opacity: visible ? 1 : 0,
							}}
						>
							{visible &&
								[
									{ left: "0%", top: "0%" },
									{ left: "50%", top: "0%" },
									{ left: "100%", top: "0%" },
									{ left: "100%", top: "50%" },
									{ left: "100%", top: "100%" },
									{ left: "50%", top: "100%" },
									{ left: "0%", top: "100%" },
									{ left: "0%", top: "50%" },
								].map((p, i) => (
									<span
										key={`handle-${i}`}
										className="wordmark-handle -translate-x-1/2 -translate-y-1/2 absolute size-2 border-[#3b82f6] border-[1.5px] bg-white"
										style={{
											left: p.left,
											top: p.top,
											animationDelay: `${i * 40}ms`,
										}}
									/>
								))}
							{/* Figma-style size badge, rides along with the box */}
							<div
								className="-translate-x-1/2 absolute top-full left-1/2 mt-2 whitespace-nowrap rounded-md bg-[#3b82f6] px-1.5 py-0.5 font-medium text-[11px] text-white tabular-nums shadow-sm"
								style={{ opacity: visible ? 1 : 0 }}
							>
								{display &&
									`${Math.round(display.width)} × ${Math.round(display.height)}`}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
