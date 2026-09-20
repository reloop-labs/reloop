"use client";

import { cn } from "@reloop/ui/cn";
import { useRef } from "react";

export interface FooterWordmarkProps {
	className?: string;
}

export function FooterWordmark({ className }: FooterWordmarkProps) {
	const textRef = useRef<SVGTextElement>(null);
	// Initial calibrated fallback coordinates for viewBox="0 0 1000 200"

	return (
		<div
			className={cn(
				"relative flex w-full select-none items-center justify-center overflow-hidden py-12 sm:py-16 lg:py-20",
				className,
			)}
		>
			<div className="block w-full max-w-4xl px-4">
				<span className="sr-only">reloop.sh</span>
				<svg
					viewBox="0 0 1000 190"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className="h-auto w-full overflow-visible"
					aria-hidden="true"
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
						y="135"
						textAnchor="middle"
						dominantBaseline="middle"
						style={{
							fontFamily:
								"var(--font-geist-sans), 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
							fontWeight: 800,
						}}
						fontSize="180"
						className="transition-colors duration-200"
					>
						{/* "reloop." in high-contrast dashed stroke with hollow fill */}
						<tspan
							fill="none"
							strokeWidth="2.2"
							strokeDasharray="4.5 4"
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

					{/* Blue cursor pointer accent over the top-left of 'sh' */}
				</svg>
			</div>
		</div>
	);
}
