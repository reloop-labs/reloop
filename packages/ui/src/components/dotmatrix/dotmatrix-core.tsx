"use client";

import type { CSSProperties } from "react";
import "./dotmatrix-loader.css";
import type { DotMatrixPhase } from "./dotmatrix-hooks";

export type MatrixPattern =
	| "diamond"
	| "full"
	| "outline"
	| "rose"
	| "cross"
	| "rings";
export type DotShape = "circle" | "square" | "diamond" | "hearts";

export interface DotMatrixCommonProps {
	size?: number;
	dotSize?: number;
	color?: string;
	speed?: number;
	ariaLabel?: string;
	className?: string;
	pattern?: MatrixPattern;
	muted?: boolean;
	bloom?: boolean;
	halo?: number;
	animated?: boolean;
	hoverAnimated?: boolean;
	dotClassName?: string;
	dotShape?: DotShape;
	opacityBase?: number;
	opacityMid?: number;
	opacityPeak?: number;
	cellPadding?: number;
	boxSize?: number;
	minSize?: number;
}

export interface DotAnimationContext {
	index: number;
	row: number;
	col: number;
	distanceFromCenter: number;
	angleFromCenter: number;
	radiusNormalized: number;
	manhattanDistance: number;
	phase: DotMatrixPhase;
	isActive: boolean;
	reducedMotion: boolean;
}

export interface DotAnimationState {
	className?: string;
	style?: CSSProperties;
}

export type DotAnimationResolver = (
	ctx: DotAnimationContext,
) => DotAnimationState;

export function cx(
	...values: Array<string | undefined | null | false>
): string {
	return values.filter(Boolean).join(" ");
}

export const MATRIX_SIZE = 5;
const CENTER = Math.floor(MATRIX_SIZE / 2);
const RANGE = Array.from({ length: MATRIX_SIZE }, (_, index) => index);
const MAX_TRBL = (MATRIX_SIZE - 1) * 2;

export function trBlPathNormFromIndex(index: number): number {
	const { row, col } = indexToCoord(index);
	return (row + (MATRIX_SIZE - 1 - col)) / MAX_TRBL;
}

export const FULL_INDEXES = RANGE.flatMap((row) =>
	RANGE.map((col) => rowMajorIndex(row, col)),
);

export function rowMajorIndex(row: number, col: number): number {
	return row * MATRIX_SIZE + col;
}

export function indexToCoord(index: number): { row: number; col: number } {
	return {
		row: Math.floor(index / MATRIX_SIZE),
		col: index % MATRIX_SIZE,
	};
}

function buildSpiralInwardOrderToIndexMap(): number[] {
	const CELLS = MATRIX_SIZE * MATRIX_SIZE;
	const order = new Array<number>(CELLS);
	let top = 0;
	let bottom = MATRIX_SIZE - 1;
	let left = 0;
	let right = MATRIX_SIZE - 1;
	let t = 0;

	while (top <= bottom && left <= right) {
		for (let c = left; c <= right; c++) {
			order[t++] = rowMajorIndex(top, c);
		}
		top++;
		for (let r = top; r <= bottom; r++) {
			order[t++] = rowMajorIndex(r, right);
		}
		right--;
		if (top <= bottom) {
			for (let c = right; c >= left; c--) {
				order[t++] = rowMajorIndex(bottom, c);
			}
			bottom--;
		}
		if (left <= right) {
			for (let r = bottom; r >= top; r--) {
				order[t++] = rowMajorIndex(r, left);
			}
			left++;
		}
	}
	return order;
}

export const SPIRAL_INWARD_ORDER_TO_INDEX = buildSpiralInwardOrderToIndexMap();

export const SPIRAL_INWARD_INDEX_TO_ORDER = new Array<number>(
	MATRIX_SIZE * MATRIX_SIZE,
);
for (let order = 0; order < SPIRAL_INWARD_ORDER_TO_INDEX.length; order++) {
	const index = SPIRAL_INWARD_ORDER_TO_INDEX[order];
	if (index !== undefined) {
		SPIRAL_INWARD_INDEX_TO_ORDER[index] = order;
	}
}

export function spiralInwardOrderValue(index: number): number {
	return SPIRAL_INWARD_INDEX_TO_ORDER[index] ?? 0;
}

export function spiralInwardNormFromIndex(index: number): number {
	const order = SPIRAL_INWARD_INDEX_TO_ORDER[index] ?? 0;
	return order / (MATRIX_SIZE * MATRIX_SIZE - 1);
}

export function DotMatrixBase({
	size = 24,
	dotSize = 3,
	color,
	speed = 1,
	ariaLabel,
	className,
	dotClassName,
	dotShape = "circle",
	muted = false,
	bloom = false,
	halo,
	opacityBase = 0.16,
	opacityMid = 0.32,
	opacityPeak = 1,
	phase = "running",
	onMouseEnter,
	onMouseLeave,
	reducedMotion = false,
	animationResolver,
}: DotMatrixCommonProps & {
	phase?: DotMatrixPhase;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	reducedMotion?: boolean;
	animationResolver: DotAnimationResolver;
}) {
	const rootStyle = {
		width: size,
		height: size,
		"--dmx-speed": speed,
		"--dmx-opacity-base": opacityBase,
		"--dmx-opacity-mid": opacityMid,
		"--dmx-opacity-peak": opacityPeak,
		...(color ? { "--dmx-dot-fill": color } : {}),
		...(halo !== undefined ? { "--dmx-halo-level": halo } : {}),
	} as CSSProperties;

	return (
		<span
			role="status"
			aria-label={ariaLabel}
			className={cx(
				"dmx-root",
				`dmx-dot-shape-${dotShape}`,
				muted && "dmx-muted",
				bloom && "dmx-bloom",
				className,
			)}
			style={rootStyle}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
		>
			<span className="dmx-grid" style={{ width: size, height: size }}>
				{FULL_INDEXES.map((index) => {
					const { row, col } = indexToCoord(index);
					const distanceFromCenter = Math.hypot(row - CENTER, col - CENTER);
					const angleFromCenter = Math.atan2(row - CENTER, col - CENTER);
					const radiusNormalized = distanceFromCenter / (Math.SQRT2 * CENTER);
					const manhattanDistance = Math.abs(row - CENTER) + Math.abs(col - CENTER);

					const ctx: DotAnimationContext = {
						index,
						row,
						col,
						distanceFromCenter,
						angleFromCenter,
						radiusNormalized,
						manhattanDistance,
						phase,
						isActive: true,
						reducedMotion,
					};

					const anim = animationResolver(ctx);

					return (
						<span
							key={index}
							className="flex items-center justify-center"
							style={{ width: size / MATRIX_SIZE, height: size / MATRIX_SIZE }}
						>
							<span
								className={cx("dmx-dot", anim.className, dotClassName)}
								style={{
									width: dotSize,
									height: dotSize,
									...anim.style,
								}}
							/>
						</span>
					);
				})}
			</span>
		</span>
	);
}
