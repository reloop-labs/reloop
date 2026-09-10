"use client";

import { cn } from "@reloop/ui/cn";
import * as React from "react";
import { createMap } from "svg-dotted-map";

export interface Marker {
	lat: number;
	lng: number;
	size?: number;
	code?: string;
	visible?: boolean;
	color?: string;
	kind?: "hub" | "probe";
	hub?: string;
	labelDx?: number;
	labelDy?: number;
}

/** addMarkers returns markers with lat/lng removed; only x, y and other props (e.g. size) remain */
type MapMarker<M extends Marker> = Omit<M, "lat" | "lng"> & {
	x: number;
	y: number;
};

export interface DottedMapProps<M extends Marker = Marker>
	extends React.SVGProps<SVGSVGElement> {
	width?: number;
	height?: number;
	mapSamples?: number;
	markers?: M[];
	dotColor?: string;
	markerColor?: string;
	dotRadius?: number;
	stagger?: boolean;

	renderMarkerOverlay?: (args: {
		marker: MapMarker<M>;
		index: number;
		x: number;
		y: number;
		r: number;
	}) => React.ReactNode;

	renderSvgOverlay?: (args: {
		markers: MapMarker<M>[];
		points: { x: number; y: number }[];
		width: number;
		height: number;
	}) => React.ReactNode;
}

export function DottedMap<M extends Marker = Marker>({
	width = 150,
	height = 75,
	mapSamples = 5000,
	markers = [],
	dotColor = "currentColor",
	markerColor = "#FF6900",
	dotRadius = 0.2,
	stagger = true,
	renderMarkerOverlay,
	renderSvgOverlay,
	className,
	style,
	...svgProps
}: DottedMapProps<M>) {
	const { points, addMarkers } = React.useMemo(
		() => createMap({ width, height, mapSamples }),
		[width, height, mapSamples],
	);
	const processedMarkers = React.useMemo(
		() => addMarkers(markers),
		[addMarkers, markers],
	);

	// Compute stagger helpers in a single, simple pass
	const { xStep, yToRowIndex } = React.useMemo(() => {
		const sorted = [...points].sort((a, b) => a.y - b.y || a.x - b.x);
		const rowMap = new Map<number, number>();
		let step = 0;
		let prevY = Number.NaN;
		let prevXInRow = Number.NaN;

		for (const p of sorted) {
			if (p.y !== prevY) {
				// new row
				prevY = p.y;
				prevXInRow = Number.NaN;
				if (!rowMap.has(p.y)) rowMap.set(p.y, rowMap.size);
			}
			if (!Number.isNaN(prevXInRow)) {
				const delta = p.x - prevXInRow;
				if (delta > 0) step = step === 0 ? delta : Math.min(step, delta);
			}
			prevXInRow = p.x;
		}

		return { xStep: step || 1, yToRowIndex: rowMap };
	}, [points]);

	const laidOutMarkers = React.useMemo(() => {
		return processedMarkers.map((marker) => {
			const rowIndex = yToRowIndex.get(marker.y) ?? 0;
			const offsetX = stagger && rowIndex % 2 === 1 ? xStep / 2 : 0;
			return { ...marker, x: marker.x + offsetX, y: marker.y };
		});
	}, [processedMarkers, stagger, xStep, yToRowIndex]);

	const laidOutPoints = React.useMemo(() => {
		return points.map((point) => {
			const rowIndex = yToRowIndex.get(point.y) ?? 0;
			const offsetX = stagger && rowIndex % 2 === 1 ? xStep / 2 : 0;
			return { x: point.x + offsetX, y: point.y };
		});
	}, [points, stagger, xStep, yToRowIndex]);

	return (
		<svg
			viewBox={`0 0 ${width} ${height}`}
			className={cn(
				"overflow-visible text-[#D2D2D2] dark:text-neutral-600",
				className,
			)}
			style={{ width: "100%", height: "100%", ...style }}
			{...svgProps}
		>
			{points.map((point, index) => {
				const rowIndex = yToRowIndex.get(point.y) ?? 0;
				const offsetX = stagger && rowIndex % 2 === 1 ? xStep / 2 : 0;
				return (
					<circle
						cx={point.x + offsetX}
						cy={point.y}
						r={dotRadius}
						fill={dotColor}
						key={`${point.x}-${point.y}-${index}`}
					/>
				);
			})}

			{renderSvgOverlay?.({
				markers: laidOutMarkers,
				points: laidOutPoints,
				width,
				height,
			})}

			{laidOutMarkers.map((marker, index) => {
				if (marker.visible === false) return null;

				const x = marker.x;
				const y = marker.y;
				const r = marker.size ?? dotRadius;

				return (
					<g key={`${marker.x}-${marker.y}-${index}`}>
						<circle cx={x} cy={y} r={r} fill={marker.color ?? markerColor} />

						{renderMarkerOverlay?.({
							marker,
							index,
							x,
							y,
							r,
						})}
					</g>
				);
			})}
		</svg>
	);
}

const MAP_WIDTH = 150;
const MAP_HEIGHT = 75;
const HOP_MS = 4800;
const STAGGER_MS = 900;
const SLOTS_PER_HUB = 1;
const MIN_DEST_DIST = 16;
const MIN_PAIR_DIST = 20;
const MIN_LINE_DIST = 9;
const TIP_RADIUS = 0.42;
const DEST_RADIUS = 0.38;
const TOOL_COLOR = "#006ffe";
const BADGE_FONT = 1.5;
const BADGE_INK = "#1C1917";
const BADGE_WARM = "#F6F1EA";
const RETURN_EVENTS = ["Opened", "Link Clicked"] as const;

const HUBS: Marker[] = [
	{
		code: "iad",
		lat: 38.95,
		lng: -77.45,
		color: TOOL_COLOR,
		kind: "hub",
		size: 0.62,
	},
	{
		code: "sin",
		lat: 1.35,
		lng: 103.82,
		color: TOOL_COLOR,
		kind: "hub",
		size: 0.62,
	},
];

type LaidOut = MapMarker<Marker>;
type XY = { x: number; y: number };

type Slot = {
	hub: LaidOut;
	color: string;
	delay: number;
};

type HopGeom = {
	d: string;
	dBack: string;
	cx: number;
	cy: number;
	to: XY;
	labelX: number;
	labelY: number;
};

function span(t: number, a: number, b: number) {
	if (b === a) return t >= b ? 1 : 0;
	if (t <= a) return 0;
	if (t >= b) return 1;
	return (t - a) / (b - a);
}

function pickReturnEvent() {
	return (
		RETURN_EVENTS[Math.floor(Math.random() * RETURN_EVENTS.length)] ?? "Opened"
	);
}

function applyBadge(
	text: SVGTextElement,
	badge: SVGRectElement,
	label: string,
) {
	const width = label.length * 0.92 + 2.2;
	const height = 2.4;
	text.textContent = label;
	badge.setAttribute("x", String(-width / 2));
	badge.setAttribute("y", String(-height / 2));
	badge.setAttribute("width", String(width));
	badge.setAttribute("height", String(height));
	badge.setAttribute("rx", String(height / 2));
	badge.setAttribute("fill", BADGE_INK);
	text.setAttribute("fill", BADGE_WARM);
}

function distToSegment(point: XY, a: XY, b: XY) {
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	const len2 = dx * dx + dy * dy || 1;
	const t = Math.max(
		0,
		Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / len2),
	);
	return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy));
}

function pickDest(points: XY[], hub: XY, taken: XY[], avoid: XY[]): XY | null {
	if (points.length === 0) return null;
	for (let attempt = 0; attempt < 48; attempt++) {
		const point = points[(Math.random() * points.length) | 0];
		if (!point) continue;
		if (point.x < 8 || point.x > MAP_WIDTH - 8) continue;
		if (point.y < 6 || point.y > MAP_HEIGHT - 6) continue;
		if (Math.hypot(point.x - hub.x, point.y - hub.y) < MIN_DEST_DIST) continue;
		if (
			taken.some(
				(other) =>
					Math.hypot(point.x - other.x, point.y - other.y) < MIN_PAIR_DIST,
			)
		) {
			continue;
		}
		if (avoid.some((item) => distToSegment(item, hub, point) < MIN_LINE_DIST)) {
			continue;
		}
		return point;
	}
	return null;
}

function splitXFor(hubs: XY[]) {
	if (hubs.length < 2) return MAP_WIDTH / 2;
	const xs = hubs.map((hub) => hub.x);
	return (Math.min(...xs) + Math.max(...xs)) / 2;
}

function pointsForHub(points: XY[], hub: XY, splitX: number) {
	const gap = 4;
	if (hub.x < splitX) return points.filter((point) => point.x < splitX - gap);
	return points.filter((point) => point.x > splitX + gap);
}

function makeHop(from: XY, to: XY, splitX: number): HopGeom {
	const dx = to.x - from.x;
	const dy = to.y - from.y;
	const dist = Math.hypot(dx, dy) || 1;
	const mx = (from.x + to.x) / 2;
	const my = (from.y + to.y) / 2;
	const nx = -dy / dist;
	const ny = dx / dist;
	const bulge = (0.22 + Math.random() * 0.16) * (Math.random() < 0.5 ? 1 : -1);
	let cx = mx + nx * dist * bulge;
	const cy = my + ny * dist * bulge;
	if (from.x < splitX) cx = Math.min(cx, splitX - 2);
	else cx = Math.max(cx, splitX + 2);
	let px = nx;
	let py = ny;
	if (py > 0) {
		px = -px;
		py = -py;
	}
	const labelX = Math.min(MAP_WIDTH - 10, Math.max(10, to.x + px * 3.6));
	const labelY = Math.min(MAP_HEIGHT - 5, Math.max(4, to.y + py * 3.1));
	return {
		to,
		cx,
		cy,
		d: `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`,
		dBack: `M ${to.x} ${to.y} Q ${cx} ${cy} ${from.x} ${from.y}`,
		labelX,
		labelY,
	};
}

function buildSlots(markers: LaidOut[]): Slot[] {
	const slots: Slot[] = [];
	const hubs = HUBS.map((hub) =>
		markers.find((m) => m.code === hub.code),
	).filter((hub): hub is LaidOut => Boolean(hub));
	for (const [hubIndex, hub] of hubs.entries()) {
		for (let i = 0; i < SLOTS_PER_HUB; i++) {
			slots.push({
				hub,
				color: TOOL_COLOR,
				delay: i * STAGGER_MS + hubIndex * STAGGER_MS,
			});
		}
	}
	return slots;
}

function cubicBezierEase(x1: number, y1: number, x2: number, y2: number) {
	return (x: number) => {
		if (x <= 0) return 0;
		if (x >= 1) return 1;
		let t = x;
		for (let i = 0; i < 8; i++) {
			const u = 1 - t;
			const current = 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t;
			const dx = 3 * u * u * x1 + 6 * u * t * (x2 - x1) + 3 * t * t * (1 - x2);
			if (Math.abs(dx) < 1e-6) break;
			t -= (current - x) / dx;
		}
		const u = 1 - t;
		return 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t;
	};
}

const easeTravel = cubicBezierEase(0.77, 0, 0.175, 1);

function quadPoint(
	t: number,
	x0: number,
	y0: number,
	x1: number,
	y1: number,
	x2: number,
	y2: number,
) {
	const u = 1 - t;
	return {
		x: u * u * x0 + 2 * u * t * x1 + t * t * x2,
		y: u * u * y0 + 2 * u * t * y1 + t * t * y2,
	};
}

function hideHop(
	path: SVGPathElement,
	tip: SVGCircleElement,
	dest: SVGCircleElement,
	label: SVGGElement,
) {
	path.setAttribute("opacity", "0");
	tip.setAttribute("opacity", "0");
	dest.setAttribute("opacity", "0");
	label.setAttribute("opacity", "0");
}

function NetworkOverlay({
	markers,
	points,
}: {
	markers: LaidOut[];
	points: XY[];
}) {
	const slots = React.useMemo(() => buildSlots(markers), [markers]);
	const pathRefs = React.useRef<(SVGPathElement | null)[]>([]);
	const tipRefs = React.useRef<(SVGCircleElement | null)[]>([]);
	const destRefs = React.useRef<(SVGCircleElement | null)[]>([]);
	const labelRefs = React.useRef<(SVGGElement | null)[]>([]);
	const badgeRefs = React.useRef<(SVGRectElement | null)[]>([]);
	const textRefs = React.useRef<(SVGTextElement | null)[]>([]);

	React.useEffect(() => {
		if (slots.length === 0 || points.length === 0) return;
		const reduce = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (reduce) return;

		const svg = pathRefs.current[0]?.ownerSVGElement;
		let inView = true;
		let visible = document.visibilityState === "visible";
		let elapsed = 0;
		let last = performance.now();
		let raf = 0;
		const cycleFor = slots.map(() => -1);
		const hops: (HopGeom | null)[] = slots.map(() => null);
		const returnEventFor = slots.map(() => pickReturnEvent());
		const badgeLabelFor = slots.map(() => "");
		const splitX = splitXFor(slots.map((slot) => slot.hub));
		const poolFor = slots.map((slot) => pointsForHub(points, slot.hub, splitX));

		const observer =
			svg && "IntersectionObserver" in window
				? new IntersectionObserver(
						([entry]) => {
							inView = entry?.isIntersecting ?? false;
						},
						{ threshold: 0.15 },
					)
				: null;
		if (svg && observer) observer.observe(svg);

		const onVisibility = () => {
			visible = document.visibilityState === "visible";
		};
		document.addEventListener("visibilitychange", onVisibility);

		const frame = (now: number) => {
			const active = inView && visible;
			if (active) elapsed += now - last;
			last = now;

			for (let i = 0; i < slots.length; i++) {
				const slot = slots[i];
				const path = pathRefs.current[i];
				const tip = tipRefs.current[i];
				const dest = destRefs.current[i];
				const label = labelRefs.current[i];
				const badge = badgeRefs.current[i];
				const text = textRefs.current[i];
				if (!slot || !path || !tip || !dest || !label || !badge || !text) {
					continue;
				}

				const phase = elapsed - slot.delay;
				if (phase < 0) {
					hideHop(path, tip, dest, label);
					continue;
				}

				const cycle = Math.floor(phase / HOP_MS);
				const local = (phase % HOP_MS) / HOP_MS;
				if (cycle !== cycleFor[i]) {
					cycleFor[i] = cycle;
					const others = hops
						.map((hop, j) => (j === i || !hop ? null : hop.to))
						.filter((p): p is XY => Boolean(p));
					const avoid = [
						...others,
						...slots
							.filter((_, j) => j !== i)
							.map((item) => ({ x: item.hub.x, y: item.hub.y })),
					];
					const to = pickDest(poolFor[i] ?? points, slot.hub, others, avoid);
					if (!to) {
						hops[i] = null;
						hideHop(path, tip, dest, label);
						continue;
					}
					const hop = makeHop(slot.hub, to, splitX);
					const other = hops.find((item, j) => j !== i && item);
					if (
						other &&
						Math.hypot(
							hop.labelX - other.labelX,
							hop.labelY - other.labelY,
						) < 14
					) {
						hop.labelX = 2 * hop.to.x - hop.labelX;
						hop.labelY = 2 * hop.to.y - hop.labelY;
					}
					hops[i] = hop;
					returnEventFor[i] = pickReturnEvent();
					badgeLabelFor[i] = "";
					dest.setAttribute("cx", String(to.x));
					dest.setAttribute("cy", String(to.y));
					path.setAttribute("d", hop.d);
				}

				const hop = hops[i];
				if (!hop || local > 0.88) {
					hideHop(path, tip, dest, label);
					continue;
				}

				const outbound = local < 0.46;
				const badgeText = outbound
					? "Delivered"
					: (returnEventFor[i] ?? "Opened");
				const travel = outbound
					? easeTravel(span(local, 0.02, 0.26))
					: easeTravel(span(local, 0.5, 0.78));
				const d = outbound ? hop.d : hop.dBack;
				if (path.getAttribute("d") !== d) path.setAttribute("d", d);

				const pathFade = outbound
					? 1 - span(local, 0.42, 0.46)
					: 1 - span(local, 0.78, 0.86);
				path.setAttribute("stroke", slot.color);
				path.setAttribute("stroke-dashoffset", String(1 - travel));
				path.setAttribute("opacity", String(pathFade));

				const x0 = outbound ? slot.hub.x : hop.to.x;
				const y0 = outbound ? slot.hub.y : hop.to.y;
				const x2 = outbound ? hop.to.x : slot.hub.x;
				const y2 = outbound ? hop.to.y : slot.hub.y;
				const pos = quadPoint(travel, x0, y0, hop.cx, hop.cy, x2, y2);
				const tipOp = outbound
					? span(local, 0.02, 0.05) * (1 - span(local, 0.26, 0.3))
					: span(local, 0.5, 0.54) * (1 - span(local, 0.78, 0.84));
				tip.setAttribute("cx", String(pos.x));
				tip.setAttribute("cy", String(pos.y));
				tip.setAttribute("fill", slot.color);
				tip.setAttribute("opacity", String(tipOp));
				dest.setAttribute("fill", slot.color);

				dest.setAttribute(
					"opacity",
					String(span(local, 0.24, 0.28) * (1 - span(local, 0.8, 0.88))),
				);

				if (badgeLabelFor[i] !== badgeText) {
					badgeLabelFor[i] = badgeText;
					applyBadge(text, badge, badgeText);
				}
				const labelOp = outbound
					? span(local, 0.24, 0.3) * (1 - span(local, 0.4, 0.45))
					: span(local, 0.5, 0.56) * (1 - span(local, 0.78, 0.86));
				label.setAttribute(
					"transform",
					`translate(${hop.labelX} ${hop.labelY})`,
				);
				label.setAttribute("opacity", String(labelOp));
			}

			raf = requestAnimationFrame(frame);
		};

		raf = requestAnimationFrame(frame);
		return () => {
			cancelAnimationFrame(raf);
			observer?.disconnect();
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, [slots, points]);

	return (
		<g pointerEvents="none" aria-hidden="true">
			{slots.map((slot, i) => (
				<g key={`${slot.hub.code}-${slot.delay}`}>
					<path
						ref={(el) => {
							pathRefs.current[i] = el;
						}}
						fill="none"
						stroke={slot.color}
						strokeWidth={0.28}
						strokeLinecap="round"
						pathLength={1}
						strokeDasharray={1}
						strokeDashoffset={1}
						opacity={0}
					/>
					<circle
						ref={(el) => {
							tipRefs.current[i] = el;
						}}
						r={TIP_RADIUS}
						opacity={0}
					/>
					<circle
						ref={(el) => {
							destRefs.current[i] = el;
						}}
						r={DEST_RADIUS}
						opacity={0}
					/>
					<g
						ref={(el) => {
							labelRefs.current[i] = el;
						}}
						opacity={0}
					>
						<rect
							ref={(el) => {
								badgeRefs.current[i] = el;
							}}
							x={-6.2}
							y={-1.2}
							width={12.4}
							height={2.4}
							rx={1.2}
							fill={BADGE_INK}
						/>
						<text
							ref={(el) => {
								textRefs.current[i] = el;
							}}
							textAnchor="middle"
							dominantBaseline="middle"
							fill={BADGE_WARM}
							fontSize={BADGE_FONT}
							fontWeight={500}
							letterSpacing={-0.0375}
							fontFamily="ui-sans-serif, system-ui, sans-serif"
						>
							Delivered
						</text>
					</g>
				</g>
			))}
		</g>
	);
}

export function TempEmailDottedMap() {
	return (
		<div className="border-stroke-soft-100 border-b px-4 py-16 sm:px-8 sm:py-20 lg:px-12 dark:border-white/10">
			<DottedMap
				width={MAP_WIDTH}
				height={MAP_HEIGHT}
				mapSamples={5000}
				markers={HUBS}
				dotColor="currentColor"
				dotRadius={0.32}
				className="mx-auto h-auto w-full max-w-5xl"
				role="img"
				aria-label="Reloop servers routing email between regions"
				renderSvgOverlay={({ markers, points }) => (
					<NetworkOverlay markers={markers} points={points} />
				)}
			/>
		</div>
	);
}
