import type { ReactNode } from "react";

export function WireNode({
	cx,
	cy,
	r = 3,
	accent = false,
}: {
	cx: number;
	cy: number;
	r?: number;
	accent?: boolean;
}) {
	if (accent) {
		return (
			<>
				<circle
					cx={cx}
					cy={cy}
					r={r + 2}
					className="text-primary-base opacity-0 dark:opacity-30"
					fill="currentColor"
				/>
				<circle
					cx={cx}
					cy={cy}
					r={r}
					className="fill-current text-text-strong-950 opacity-50 dark:text-primary-base dark:opacity-100"
				/>
			</>
		);
	}

	return (
		<circle
			cx={cx}
			cy={cy}
			r={r}
			fill="currentColor"
			fillOpacity={0.5}
		/>
	);
}

export function WireLine({
	d,
	opacity = 0.25,
	accent = false,
	dashed = false,
}: {
	d: string;
	opacity?: number;
	accent?: boolean;
	dashed?: boolean;
}) {
	if (accent) {
		return (
			<>
				<path
					d={d}
					fill="none"
					stroke="currentColor"
					strokeOpacity={opacity}
					strokeWidth="1"
					strokeDasharray={dashed ? "4 4" : undefined}
					className="dark:hidden"
				/>
				<path
					d={d}
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeDasharray={dashed ? "4 4" : undefined}
					className="text-primary-base opacity-0 dark:opacity-80"
				/>
			</>
		);
	}

	return (
		<path
			d={d}
			fill="none"
			stroke="currentColor"
			strokeOpacity={opacity}
			strokeWidth="1"
			strokeDasharray={dashed ? "4 4" : undefined}
		/>
	);
}

export function RoundedFrame({
	x,
	y,
	width,
	height,
	rx = 8,
	opacity = 0.3,
	accent = false,
}: {
	x: number;
	y: number;
	width: number;
	height: number;
	rx?: number;
	opacity?: number;
	accent?: boolean;
}) {
	if (accent) {
		return (
			<>
				<rect
					x={x}
					y={y}
					width={width}
					height={height}
					rx={rx}
					fill="none"
					stroke="currentColor"
					strokeOpacity={opacity}
					strokeWidth="1"
					className="dark:hidden"
				/>
				<rect
					x={x}
					y={y}
					width={width}
					height={height}
					rx={rx}
					fill="none"
					stroke="currentColor"
					strokeWidth="1"
					className="text-primary-base opacity-0 dark:opacity-80"
				/>
			</>
		);
	}

	return (
		<rect
			x={x}
			y={y}
			width={width}
			height={height}
			rx={rx}
			fill="none"
			stroke="currentColor"
			strokeOpacity={opacity}
			strokeWidth="1"
		/>
	);
}

export function AccentCircle({
	cx,
	cy,
	r,
	opacity = 0.22,
}: {
	cx: number;
	cy: number;
	r: number;
	opacity?: number;
}) {
	return (
		<>
			<circle
				cx={cx}
				cy={cy}
				r={r}
				fill="none"
				stroke="currentColor"
				strokeOpacity={opacity}
				strokeWidth="1"
				className="dark:hidden"
			/>
			<circle
				cx={cx}
				cy={cy}
				r={r}
				fill="none"
				stroke="currentColor"
				strokeWidth="1"
				className="text-primary-base opacity-0 dark:opacity-80"
			/>
		</>
	);
}

export function DocLines({
	x,
	y,
	widths = [48, 36, 42],
	spacing = 8,
	opacity = 0.18,
}: {
	x: number;
	y: number;
	widths?: number[];
	spacing?: number;
	opacity?: number;
}) {
	return (
		<>
			{widths.map((width, index) => (
				<line
					key={`${x}-${y}-${width}-${index}`}
					x1={x}
					y1={y + index * spacing}
					x2={x + width}
					y2={y + index * spacing}
					stroke="currentColor"
					strokeOpacity={opacity}
					strokeWidth="1"
				/>
			))}
		</>
	);
}

export function MonoLabel({
	x,
	y,
	label,
}: {
	x: number;
	y: number;
	label: string;
}) {
	return (
		<text
			x={x}
			y={y}
			className="fill-current font-mono text-[9px] opacity-0 dark:opacity-40"
			textAnchor="middle"
		>
			{label}
		</text>
	);
}

export function BroadcastRays({
	cx,
	cy,
	count = 6,
	length = 36,
	opacity = 0.12,
}: {
	cx: number;
	cy: number;
	count?: number;
	length?: number;
	opacity?: number;
}) {
	return (
		<>
			{Array.from({ length: count }, (_, index) => {
				const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
				const x2 = cx + Math.cos(angle) * length;
				const y2 = cy + Math.sin(angle) * length;

				return (
					<line
						key={`ray-${index}`}
						x1={cx}
						y1={cy}
						x2={x2}
						y2={y2}
						stroke="currentColor"
						strokeOpacity={opacity}
						strokeWidth="1"
					/>
				);
			})}
		</>
	);
}

export function ArtGroup({ children }: { children: ReactNode }) {
	return <g>{children}</g>;
}
