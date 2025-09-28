"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useTheme } from "next-themes";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

interface FlickeringGridProps extends React.HTMLAttributes<HTMLDivElement> {
	squareSize?: number;
	gridGap?: number;
	flickerChance?: number;
	color?: string;
	width?: number;
	height?: number;
	className?: string;
	maxOpacity?: number;
	startImmediately?: boolean;
}

const FlickeringGrid = ({
	squareSize = 4,
	gridGap = 6,
	flickerChance = 0.3,
	color = "rgb(0, 0, 0)",
	width,
	height,
	className,
	maxOpacity = 0.3,
	startImmediately = false,
	...props
}: FlickeringGridProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [isInView, setIsInView] = useState(startImmediately);

	const gridStateRef = useRef<{
		squares: Float32Array;
		cols: number;
		rows: number;
		dpr: number;
		lastMaxOpacity: number;
	}>({
		squares: new Float32Array(0),
		cols: 0,
		rows: 0,
		dpr: 1,
		lastMaxOpacity: maxOpacity,
	});

	const memoizedColor = useMemo(() => {
		const toRGBA = (colorValue: string) => {
			if (typeof window === "undefined") return "rgba(0,0,0,";
			const tempCanvas = document.createElement("canvas");
			tempCanvas.width = tempCanvas.height = 1;
			const ctx = tempCanvas.getContext("2d");
			if (!ctx) return "rgba(0,0,0,";
			ctx.fillStyle = colorValue;
			ctx.fillRect(0, 0, 1, 1);
			const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
			return `rgba(${r},${g},${b},`;
		};
		return toRGBA(color);
	}, [color]);

	useEffect(() => {
		const canvas = canvasRef.current;
		const container = containerRef.current;
		if (!canvas || !container) return;

		const dpr = window.devicePixelRatio || 1;
		gridStateRef.current.dpr = dpr;

		const updateGridStructure = () => {
			const currentWidth = width || container.clientWidth;
			const currentHeight = height || container.clientHeight;

			if (
				canvas.width !== currentWidth * dpr ||
				canvas.height !== currentHeight * dpr
			) {
				canvas.width = currentWidth * dpr;
				canvas.height = currentHeight * dpr;
				canvas.style.width = `${currentWidth}px`;
				canvas.style.height = `${currentHeight}px`;
			}

			const newCols = Math.ceil(currentWidth / (squareSize + gridGap));
			const newRows = Math.ceil(currentHeight / (squareSize + gridGap));

			if (
				newCols !== gridStateRef.current.cols ||
				newRows !== gridStateRef.current.rows ||
				maxOpacity !== gridStateRef.current.lastMaxOpacity
			) {
				gridStateRef.current.cols = newCols;
				gridStateRef.current.rows = newRows;
				gridStateRef.current.squares = new Float32Array(newCols * newRows);
				for (let i = 0; i < gridStateRef.current.squares.length; i++) {
					gridStateRef.current.squares[i] = Math.random() * maxOpacity;
				}
				gridStateRef.current.lastMaxOpacity = maxOpacity;
			}
		};

		updateGridStructure();
		const resizeObserver = new ResizeObserver(updateGridStructure);
		resizeObserver.observe(container);
		return () => resizeObserver.disconnect();
	}, [width, height, squareSize, gridGap, maxOpacity]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !isInView) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let animationFrameId: number;
		let lastTime = performance.now();

		const animate = (time: number) => {
			const deltaTime = (time - lastTime) / 1000;
			lastTime = time;
			const { squares, cols, rows, dpr } = gridStateRef.current;

			for (let i = 0; i < squares.length; i++) {
				if (Math.random() < flickerChance * deltaTime) {
					squares[i] = Math.random() * maxOpacity;
				}
				squares[i] = Math.min(squares[i] || 0, maxOpacity);
			}

			ctx.clearRect(0, 0, canvas.width, canvas.height);
			for (let i = 0; i < cols; i++) {
				for (let j = 0; j < rows; j++) {
					const index = i * rows + j;
					if (index < squares.length) {
						const currentOpacity = squares[index];
						ctx.fillStyle = `${memoizedColor}${currentOpacity})`;
						ctx.fillRect(
							i * (squareSize + gridGap) * dpr,
							j * (squareSize + gridGap) * dpr,
							squareSize * dpr,
							squareSize * dpr,
						);
					}
				}
			}
			animationFrameId = requestAnimationFrame(animate);
		};
		animationFrameId = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(animationFrameId);
	}, [isInView, memoizedColor, flickerChance, maxOpacity, squareSize, gridGap]);

	useEffect(() => {
		if (startImmediately) {
			if (!isInView) setIsInView(true);
			return;
		}
		const canvas = canvasRef.current;
		if (!canvas) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry) setIsInView(entry.isIntersecting);
			},
			{ threshold: 0.01 },
		);
		observer.observe(canvas);
		return () => {
			observer.disconnect();
		};
	}, [startImmediately, isInView]);

	return (
		<div
			ref={containerRef}
			className={cn("h-full w-full", className)}
			{...props}
		>
			<canvas ref={canvasRef} className="pointer-events-none" />
		</div>
	);
};

interface GeneratedGridSettings {
	color: string;
	maxOpacity: number;
	flickerChance: number;
	squareSize: number;
	gridGap: number;
}

export const Globe = ({
	className,
	iconClassName,
}: {
	className?: string;
	iconClassName?: string;
}) => {
	const { resolvedTheme } = useTheme();
	const backgroundGridSettingsForEffect: GeneratedGridSettings = {
		color: resolvedTheme === "dark" ? "#FFFFFF" : "#000000",
		maxOpacity: 0.4,
		flickerChance: 0.45,
		squareSize: 2,
		gridGap: 1,
	};
	return (
		<div
			className={cn(
				"relative h-16 w-16 overflow-hidden rounded-xl border-2 border-stroke-soft-100",
				className,
			)}
		>
			<div className="relative flex h-full w-full items-center justify-center">
				<Icon
					name="globe"
					className={cn("relative h-8 w-8 opacity-80", iconClassName)}
				/>
				<FlickeringGrid
					className={cn("absolute inset-0 z-0")}
					{...backgroundGridSettingsForEffect}
					startImmediately={true}
				/>
			</div>
		</div>
	);
};
