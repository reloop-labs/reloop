import { cn } from "@reloop/ui/cn";
import * as React from "react";
import { createMap } from "svg-dotted-map";

export interface Marker {
	lat: number;
	lng: number;
	size?: number;
	pulse?: boolean;
	code?: string;
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
	pulse?: boolean;

	renderMarkerOverlay?: (args: {
		marker: MapMarker<M>;
		index: number;
		x: number;
		y: number;
		r: number;
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
	pulse = false,
	renderMarkerOverlay,
	className,
	style,
	...svgProps
}: DottedMapProps<M>) {
	const { points, addMarkers } = createMap({
		width,
		height,
		mapSamples,
	});
	const processedMarkers = addMarkers(markers);

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

	return (
		<svg
			viewBox={`0 0 ${width} ${height}`}
			className={cn("text-gray-500 dark:text-gray-500", className)}
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

			{processedMarkers.map((marker, index) => {
				const rowIndex = yToRowIndex.get(marker.y) ?? 0;
				const offsetX = stagger && rowIndex % 2 === 1 ? xStep / 2 : 0;

				const x = marker.x + offsetX;
				const y = marker.y;
				const r = marker.size ?? dotRadius;
				const shouldPulse = pulse
					? marker.pulse !== false
					: marker.pulse === true;
				const pulseTo = r * 2.8;

				return (
					<g key={`${marker.x}-${marker.y}-${index}`}>
						<circle cx={x} cy={y} r={r} fill={markerColor} />

						{shouldPulse ? (
							<g pointerEvents="none">
								<circle
									cx={x}
									cy={y}
									r={r}
									fill="none"
									stroke={markerColor}
									strokeOpacity={1}
									strokeWidth={0.35}
								>
									<animate
										attributeName="r"
										values={`${r};${pulseTo}`}
										dur="1.4s"
										repeatCount="indefinite"
									/>
									<animate
										attributeName="opacity"
										values="1;0"
										dur="1.4s"
										repeatCount="indefinite"
									/>
								</circle>
								<circle
									cx={x}
									cy={y}
									r={r}
									fill="none"
									stroke={markerColor}
									strokeOpacity={0.9}
									strokeWidth={0.3}
								>
									<animate
										attributeName="r"
										values={`${r};${pulseTo}`}
										dur="1.4s"
										begin="0.7s"
										repeatCount="indefinite"
									/>
									<animate
										attributeName="opacity"
										values="0.9;0"
										dur="1.4s"
										begin="0.7s"
										repeatCount="indefinite"
									/>
								</circle>
							</g>
						) : null}

						{renderMarkerOverlay?.({
							marker: { ...marker, x, y },
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

const HUBS: (Marker & { code: string })[] = [
	{ lat: 38.9, lng: -77.4, code: "iad", size: 0.9, pulse: true },
	{ lat: 51.5, lng: -0.1, code: "lhr", size: 0.9, pulse: true },
	{ lat: 1.35, lng: 103.8, code: "sin", size: 0.9, pulse: true },
	{ lat: -23.5, lng: -46.6, code: "gru", size: 0.9, pulse: true },
];

export function TempEmailDottedMap() {
	return (
		<div className="border-stroke-soft-100 border-b px-4 py-16 sm:px-8 sm:py-20 lg:px-12 dark:border-white/10">
			<DottedMap
				width={150}
				height={75}
				mapSamples={5000}
				markers={HUBS}
				dotColor="rgba(244,63,94,0.5)"
				markerColor="#f43f5e"
				dotRadius={0.35}
				pulse
				className="mx-auto h-auto w-full max-w-5xl"
				role="img"
				aria-label="Dotted world map"
				renderMarkerOverlay={({ marker, x, y }) => (
					<text
						x={x + 2}
						y={y + 1}
						fontSize={2.6}
						fontFamily="monospace"
						fill="#8a8a8a"
					>
						{(marker as { code?: string }).code}
					</text>
				)}
			/>
		</div>
	);
}
