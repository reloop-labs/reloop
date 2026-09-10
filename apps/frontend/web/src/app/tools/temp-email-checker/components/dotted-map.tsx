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

	return (
		<svg
			viewBox={`0 0 ${width} ${height}`}
			className={cn(
				"overflow-visible text-gray-500 dark:text-gray-500",
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

			{laidOutMarkers.map((marker, index) => {
				if (marker.visible === false) return null;

				const x = marker.x;
				const y = marker.y;
				const r = marker.size ?? dotRadius;

				return (
					<g key={`${marker.x}-${marker.y}-${index}`}>
						<circle cx={x} cy={y} r={r} fill={markerColor} />

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

			{renderSvgOverlay?.({
				markers: laidOutMarkers,
				width,
				height,
			})}
		</svg>
	);
}

const ORIGIN_CODE = "iad";

const HUBS: (Marker & { code: string })[] = [
	{ lat: 38.9, lng: -77.4, code: "iad", size: 1.15 },
	{ lat: 51.5, lng: -0.1, code: "lhr", visible: false },
	{ lat: 1.35, lng: 103.8, code: "sin", visible: false },
	{ lat: -23.5, lng: -46.6, code: "gru", visible: false },
];

const DESTINATIONS = ["lhr", "sin", "gru"] as const;

const MARKER_COLOR = "#f43f5e";
const MAP_WIDTH = 150;
const MAP_HEIGHT = 75;
const HOP_MS = 3200;
const TRAIL = 7;

type HubDot = { x: number; y: number; code?: string };

type HopRoute = {
	from: HubDot;
	to: HubDot;
	cx: number;
	cy: number;
	d: string;
};

function clamp01(n: number) {
	return n < 0 ? 0 : n > 1 ? 1 : n;
}

function span(t: number, a: number, b: number) {
	if (b === a) return t >= b ? 1 : 0;
	return clamp01((t - a) / (b - a));
}

/** CSS cubic-bezier(x1, y1, x2, y2) evaluated at time x in [0, 1]. */
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
const easeOut = cubicBezierEase(0.23, 1, 0.32, 1);

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

function buildArc(from: HubDot, to: HubDot): HopRoute {
	const dx = to.x - from.x;
	const dy = to.y - from.y;
	const dist = Math.hypot(dx, dy) || 1;
	const mx = (from.x + to.x) / 2;
	const my = (from.y + to.y) / 2;
	let nx = -dy / dist;
	let ny = dx / dist;
	if (ny > 0) {
		nx = -nx;
		ny = -ny;
	}
	const bulge = Math.min(18, Math.max(7, dist * 0.3));
	const cx = mx + nx * bulge;
	const cy = my + ny * bulge;
	return {
		from,
		to,
		cx,
		cy,
		d: `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`,
	};
}

function buildRoutes(markers: HubDot[]): HopRoute[] {
	const byCode = new Map(
		markers
			.filter((m): m is HubDot & { code: string } => Boolean(m.code))
			.map((m) => [m.code, m]),
	);
	const from = byCode.get(ORIGIN_CODE);
	if (!from) return [];
	const routes: HopRoute[] = [];
	for (const toCode of DESTINATIONS) {
		const to = byCode.get(toCode);
		if (to) routes.push(buildArc(from, to));
	}
	return routes;
}

function MailFlow({ markers }: { markers: HubDot[] }) {
	const routes = React.useMemo(() => buildRoutes(markers), [markers]);
	const pathRef = React.useRef<SVGPathElement>(null);
	const cometRef = React.useRef<SVGPathElement>(null);
	const packetRef = React.useRef<SVGGElement>(null);
	const sentRef = React.useRef<SVGGElement>(null);
	const receivedRef = React.useRef<SVGGElement>(null);
	const trailRefs = React.useRef<(SVGCircleElement | null)[]>([]);
	const glowId = React.useId().replace(/:/g, "");

	React.useEffect(() => {
		if (routes.length === 0) return;

		const reduce = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (reduce) return;

		const path = pathRef.current;
		const comet = cometRef.current;
		const packet = packetRef.current;
		const sent = sentRef.current;
		const received = receivedRef.current;
		if (!path || !comet || !packet || !sent || !received) return;

		const svg = path.ownerSVGElement;
		let inView = true;
		let visible = document.visibilityState === "visible";
		let elapsed = 0;
		let last = performance.now();
		let raf = 0;

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

		const setLabel = (el: SVGGElement, hub: HubDot, opacity: number) => {
			const reveal = easeOut(clamp01(opacity));
			el.setAttribute(
				"transform",
				`translate(${hub.x} ${hub.y - 5.2}) scale(${0.96 + 0.04 * reveal})`,
			);
			el.setAttribute("opacity", String(reveal));
		};

		const frame = (now: number) => {
			const active = inView && visible;
			if (active) elapsed += now - last;
			last = now;

			const cycle = HOP_MS * routes.length;
			const t = elapsed % cycle;
			const hopIndex = Math.min(routes.length - 1, Math.floor(t / HOP_MS));
			const local = (t - hopIndex * HOP_MS) / HOP_MS;
			const route = routes[hopIndex];
			if (!route) {
				raf = requestAnimationFrame(frame);
				return;
			}

			if (path.getAttribute("d") !== route.d) {
				path.setAttribute("d", route.d);
				comet.setAttribute("d", route.d);
			}

			const fade = 1 - span(local, 0.86, 1);
			const travel = easeTravel(span(local, 0.02, 0.72));
			const sentOp =
				span(local, 0, 0.07) * (1 - span(local, 0.48, 0.62)) * fade;
			const recvOp = span(local, 0.68, 0.78) * fade;
			const packetOp = span(local, 0.02, 0.08) * (1 - span(local, 0.72, 0.82));

			path.setAttribute("stroke-dashoffset", String(1 - travel));
			path.setAttribute("opacity", String(0.95 * fade));
			comet.setAttribute("stroke-dashoffset", String(-(travel - 0.045)));
			comet.setAttribute("opacity", String(packetOp * 0.95));

			const pos = quadPoint(
				travel,
				route.from.x,
				route.from.y,
				route.cx,
				route.cy,
				route.to.x,
				route.to.y,
			);
			packet.setAttribute("transform", `translate(${pos.x} ${pos.y})`);
			packet.setAttribute("opacity", String(packetOp));

			for (let i = 0; i < TRAIL; i++) {
				const trailT = Math.max(0, travel - (i + 1) * 0.016);
				const p = quadPoint(
					trailT,
					route.from.x,
					route.from.y,
					route.cx,
					route.cy,
					route.to.x,
					route.to.y,
				);
				const dot = trailRefs.current[i];
				if (!dot) continue;
				dot.setAttribute("cx", String(p.x));
				dot.setAttribute("cy", String(p.y));
				dot.setAttribute(
					"opacity",
					String(((TRAIL - i) / TRAIL) * 0.5 * packetOp),
				);
			}

			setLabel(sent, route.from, sentOp);
			setLabel(received, route.to, recvOp);

			raf = requestAnimationFrame(frame);
		};

		raf = requestAnimationFrame(frame);

		return () => {
			cancelAnimationFrame(raf);
			observer?.disconnect();
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, [routes]);

	if (routes.length === 0) return null;

	return (
		<g pointerEvents="none" aria-hidden="true">
			<defs>
				<filter
					id={`${glowId}-glow`}
					x="-180%"
					y="-180%"
					width="460%"
					height="460%"
				>
					<feGaussianBlur stdDeviation="0.55" result="blur" />
					<feMerge>
						<feMergeNode in="blur" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			</defs>

			<path
				ref={pathRef}
				d={routes[0]?.d}
				fill="none"
				stroke={MARKER_COLOR}
				strokeWidth={0.42}
				strokeLinecap="round"
				pathLength={1}
				strokeDasharray={1}
				strokeDashoffset={1}
				opacity={0}
			/>
			<path
				ref={cometRef}
				d={routes[0]?.d}
				fill="none"
				stroke="#fff"
				strokeWidth={0.7}
				strokeLinecap="round"
				pathLength={1}
				strokeDasharray="0.08 1"
				strokeDashoffset={0}
				opacity={0}
				filter={`url(#${glowId}-glow)`}
			/>

			{Array.from({ length: TRAIL }, (_, i) => (
				<circle
					key={i}
					ref={(el) => {
						trailRefs.current[i] = el;
					}}
					r={0.38 - i * 0.03}
					fill={MARKER_COLOR}
					opacity={0}
				/>
			))}

			<g ref={packetRef} opacity={0}>
				<circle
					r={1.45}
					fill={MARKER_COLOR}
					opacity={0.28}
					filter={`url(#${glowId}-glow)`}
				/>
				<circle r={0.78} fill="#fff" />
				<circle r={0.5} fill={MARKER_COLOR} />
			</g>

			<g ref={sentRef} opacity={0}>
				<StatusPill label="Email sent" width={18.2} />
			</g>
			<g ref={receivedRef} opacity={0}>
				<StatusPill label="Email received" width={23.6} />
			</g>
		</g>
	);
}

function StatusPill({ label, width }: { label: string; width: number }) {
	const height = 3.7;
	return (
		<>
			<rect
				x={-width / 2}
				y={-height - 0.35}
				width={width}
				height={height}
				rx={height / 2}
				fill={MARKER_COLOR}
			/>
			<polygon points={"0,0.55 -0.85,-0.4 0.85,-0.4"} fill={MARKER_COLOR} />
			<text
				x={0}
				y={-height / 2 - 0.28}
				textAnchor="middle"
				dominantBaseline="middle"
				fill="#fff"
				fontSize={2.05}
				fontWeight={600}
				fontFamily="ui-sans-serif, system-ui, sans-serif"
				letterSpacing={0.04}
			>
				{label}
			</text>
		</>
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
				dotColor="rgba(244,63,94,0.5)"
				markerColor={MARKER_COLOR}
				dotRadius={0.35}
				className="mx-auto h-auto w-full max-w-5xl"
				role="img"
				aria-label="Reloop servers routing email between regions"
				renderSvgOverlay={({ markers }) => <MailFlow markers={markers} />}
			/>
		</div>
	);
}
