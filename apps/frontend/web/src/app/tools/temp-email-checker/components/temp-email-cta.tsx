"use client";

import { hostedSignupHref } from "@reloop/web/lib/site";
import Link from "next/link";

export interface TempEmailCtaProps {
	headlineLine1?: string;
	headlineLine2?: string;
	subtext?: string;
	primaryLabel?: string;
	primaryHref?: string;
	secondaryLabel?: string;
	secondaryHref?: string;
	secondaryExternal?: boolean;
	/**
	 * Position of the blueprint email illustration relative to the copy.
	 * Defaults to "right".
	 */
	illustrationPosition?: "left" | "right";
}

/**
 * Blueprint Email Illustration depicting an email envelope in vector drafting / CAD construction view.
 * Modeled after the Apple icon grid / SVG construction wireframes with:
 * - Bounding squircle / frame
 * - Extended blueprint grid lines
 * - Concentric circular construction guides
 * - 45° diagonal fold rays
 * - Envelope geometry with top flap & bottom seams
 * - CAD anchor handles
 * - Technical dimension callouts (320px width, 180px height, R20 radius)
 */
function BlueprintEmailIllustration() {
	const anchorNodes = [
		{ id: "flap-apex", x: 240, y: 176 },
		{ id: "top-left", x: 80, y: 90 },
		{ id: "top-right", x: 400, y: 90 },
		{ id: "bottom-left", x: 80, y: 270 },
		{ id: "bottom-right", x: 400, y: 270 },
		{ id: "flap-open-apex", x: 240, y: 22 },
		{ id: "center-cross", x: 240, y: 160 },
	];

	return (
		<div className="relative w-full max-w-[480px] select-none">
			<svg
				viewBox="0 0 480 320"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className="h-auto w-full"
			>
				<defs>
					{/* Primary blueprint stroke gradient */}
					<linearGradient
						id="blueprintStroke"
						x1="40"
						y1="20"
						x2="440"
						y2="300"
						gradientUnits="userSpaceOnUse"
					>
						<stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
						<stop offset="50%" stopColor="#dbeafe" stopOpacity="0.95" />
						<stop offset="100%" stopColor="#ffffff" stopOpacity="0.85" />
					</linearGradient>

					{/* Subtle envelope inner fill gradient */}
					<linearGradient
						id="envelopeFill"
						x1="80"
						y1="90"
						x2="400"
						y2="270"
						gradientUnits="userSpaceOnUse"
					>
						<stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
						<stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
					</linearGradient>
				</defs>

				{/* 1. EXTENDED BLUEPRINT GRID LINES */}
				<g opacity="0.32" stroke="white" strokeWidth="0.85">
					{/* Vertical grid lines */}
					<line x1="40" y1="10" x2="40" y2="310" />
					<line x1="80" y1="10" x2="80" y2="310" />
					<line x1="120" y1="10" x2="120" y2="310" />
					<line x1="160" y1="10" x2="160" y2="310" />
					<line x1="200" y1="10" x2="200" y2="310" />
					<line x1="280" y1="10" x2="280" y2="310" />
					<line x1="320" y1="10" x2="320" y2="310" />
					<line x1="360" y1="10" x2="360" y2="310" />
					<line x1="400" y1="10" x2="400" y2="310" />
					<line x1="440" y1="10" x2="440" y2="310" />

					{/* Horizontal grid lines */}
					<line x1="20" y1="22" x2="460" y2="22" />
					<line x1="20" y1="56" x2="460" y2="56" />
					<line x1="20" y1="90" x2="460" y2="90" />
					<line x1="20" y1="125" x2="460" y2="125" />
					<line x1="20" y1="195" x2="460" y2="195" />
					<line x1="20" y1="230" x2="460" y2="230" />
					<line x1="20" y1="270" x2="460" y2="270" />
					<line x1="20" y1="300" x2="460" y2="300" />
				</g>

				{/* 2. PRIMARY CENTER AXES (Stronger dashed drafting lines) */}
				<g stroke="white" strokeWidth="1" strokeDasharray="6 4" opacity="0.45">
					{/* Vertical Center Axis (x=240) */}
					<line x1="240" y1="8" x2="240" y2="312" />
					{/* Horizontal Center Axis (y=160) */}
					<line x1="16" y1="160" x2="464" y2="160" />
				</g>

				{/* 3. ICON SQUIRCLE / BOUNDING MASK (Matching Apple Icon Grid reference) */}
				<rect
					x="36"
					y="18"
					width="408"
					height="284"
					rx="52"
					fill="none"
					stroke="white"
					strokeWidth="1"
					strokeDasharray="6 5"
					opacity="0.25"
				/>

				{/* 4. CONCENTRIC DRAFTING CIRCLES (Centered at x=240, y=160) */}
				<g stroke="white" strokeWidth="0.85" opacity="0.28" fill="none">
					{/* Inner core circle */}
					<circle cx="240" cy="160" r="44" />
					{/* Mid construction circle */}
					<circle cx="240" cy="160" r="92" strokeDasharray="3 3" />
					{/* Envelope height guide circle */}
					<circle cx="240" cy="160" r="140" />
					{/* Outer boundary guide circle */}
					<circle cx="240" cy="160" r="185" strokeDasharray="4 4" />

					{/* Flap apex tangent circle (showing curvature construction) */}
					<circle
						cx="240"
						cy="176"
						r="16"
						strokeDasharray="2 2"
						strokeWidth="1"
						opacity="0.8"
					/>

					{/* Corner radius guide circles at the 4 envelope corners */}
					<circle cx="100" cy="110" r="20" strokeDasharray="2 2" />
					<circle cx="380" cy="110" r="20" strokeDasharray="2 2" />
					<circle cx="100" cy="250" r="20" strokeDasharray="2 2" />
					<circle cx="380" cy="250" r="20" strokeDasharray="2 2" />
				</g>

				{/* 5. 45-DEGREE DIAGONAL CONSTRUCTION RAYS */}
				<g stroke="white" strokeWidth="0.85" opacity="0.28">
					{/* Diagonal Ray 1: Top-Left through center to Bottom-Right */}
					<line x1="80" y1="0" x2="400" y2="320" />
					{/* Diagonal Ray 2: Top-Right through center to Bottom-Left */}
					<line x1="400" y1="0" x2="80" y2="320" />
					{/* Envelope diagonal fold rays extending out */}
					<line
						x1="40"
						y1="50"
						x2="240"
						y2="250"
						strokeDasharray="4 4"
						opacity="0.6"
					/>
					<line
						x1="440"
						y1="50"
						x2="240"
						y2="250"
						strokeDasharray="4 4"
						opacity="0.6"
					/>
				</g>

				{/* 6. CAD INTERSECTION TICK MARKS (+) */}
				<g opacity="0.35" stroke="white" strokeWidth="1">
					<path d="M 76 90 H 84 M 80 86 V 94" />
					<path d="M 396 90 H 404 M 400 86 V 94" />
					<path d="M 76 270 H 84 M 80 266 V 274" />
					<path d="M 396 270 H 404 M 400 266 V 274" />
					<path d="M 236 90 H 244 M 240 86 V 94" />
					<path d="M 236 270 H 244 M 240 266 V 274" />
					<path d="M 76 160 H 84 M 80 156 V 164" />
					<path d="M 396 160 H 404 M 400 156 V 164" />
				</g>

				{/* 8. OPEN FLAP GHOST CONSTRUCTION (Upper inverted triangle in dashed lines) */}
				<path
					d="M 82 92 L 232 24 C 236 21, 244 21, 248 24 L 398 92"
					fill="rgba(255, 255, 255, 0.02)"
					stroke="white"
					strokeWidth="1.25"
					strokeDasharray="4 4"
					strokeOpacity="0.32"
				/>

				{/* 9. MAIN ENVELOPE RECTANGLE (Base body) */}
				<rect
					x="80"
					y="90"
					width="320"
					height="180"
					rx="20"
					fill="url(#envelopeFill)"
					stroke="url(#blueprintStroke)"
					strokeWidth="2"
					className="drop-shadow-xs"
				/>

				{/* 10. INTERIOR BOTTOM ENVELOPE SEAM FOLDS */}
				<g
					stroke="white"
					strokeWidth="1.25"
					opacity="0.38"
					strokeDasharray="4 4"
				>
					{/* Bottom-left to center-left fold */}
					<line x1="84" y1="266" x2="216" y2="162" />
					{/* Bottom-right to center-right fold */}
					<line x1="396" y1="266" x2="264" y2="162" />
				</g>

				{/* 11. PRIMARY ENVELOPE DOWNWARD FOLD FLAP (Front flap) */}
				<path
					d="
						M 82 92
						L 229 174
						C 235 178, 245 178, 251 174
						L 398 92
					"
					fill="none"
					stroke="url(#blueprintStroke)"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>

				{/* 12. BLUEPRINT DIMENSION & CAD SPECS ANNOTATIONS */}
				{/* Top Width Dimension Bar (320.0 px) */}
				<g opacity="0.75">
					<line
						x1="80"
						y1="40"
						x2="400"
						y2="40"
						stroke="white"
						strokeWidth="0.85"
					/>
					<path
						d="M 80 35 V 45 M 400 35 V 45"
						stroke="white"
						strokeWidth="0.85"
					/>
					<rect
						x="200"
						y="32"
						width="80"
						height="16"
						rx="3"
						fill="#256bf5"
						stroke="white"
						strokeWidth="0.75"
						strokeOpacity="0.4"
					/>
					<text
						x="240"
						y="43.5"
						fill="white"
						fontSize="8.5"
						fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
						textAnchor="middle"
						letterSpacing="0.04em"
					>
						W: 320.0px
					</text>
				</g>

				{/* Right Height Dimension Bar (180.0 px) */}
				<g opacity="0.75">
					<line
						x1="428"
						y1="90"
						x2="428"
						y2="270"
						stroke="white"
						strokeWidth="0.85"
					/>
					<path
						d="M 423 90 H 433 M 423 270 H 433"
						stroke="white"
						strokeWidth="0.85"
					/>
					<rect
						x="414"
						y="172"
						width="28"
						height="16"
						rx="3"
						fill="#256bf5"
						stroke="white"
						strokeWidth="0.75"
						strokeOpacity="0.4"
					/>
					<text
						x="428"
						y="183.5"
						fill="white"
						fontSize="8"
						fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
						textAnchor="middle"
					>
						180
					</text>
				</g>

				{/* Corner Radius Callout (R20) */}
				<g opacity="0.7">
					<text
						x="62"
						y="82"
						fill="white"
						fontSize="8.5"
						fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
					>
						R20
					</text>
				</g>

				{/* Flap Angle Callout (45°) */}
				<g opacity="0.6">
					<text
						x="142"
						y="126"
						fill="white"
						fontSize="8"
						fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
					>
						∠45.0°
					</text>
				</g>

				{/* 13. CAD VECTOR ANCHOR HANDLES */}
				{anchorNodes.map((node) => (
					<g key={node.id}>
						{/* The Vector Square Node */}
						<rect
							x={node.x - 4}
							y={node.y - 4}
							width="8"
							height="8"
							rx="1.5"
							fill="#ffffff"
							stroke="#1660f0"
							strokeWidth="1.5"
						/>

						{/* Center core dot */}
						<rect
							x={node.x - 1}
							y={node.y - 1}
							width="2"
							height="2"
							fill="#1660f0"
							opacity="0.85"
						/>
					</g>
				))}
			</svg>
		</div>
	);
}

export function TempEmailCta({
	headlineLine1 = "Ready to scale your email?",
	headlineLine2 = "Let's talk.",
	subtext = "3,000 free emails every month. Modern email infrastructure and deliverability built for developers.",
	primaryLabel = "Get started free",
	primaryHref = hostedSignupHref,
	secondaryLabel = "Schedule call",
	secondaryHref = "https://cal.com/pranavp/30",
	secondaryExternal = true,
	illustrationPosition = "right",
}: TempEmailCtaProps) {
	return (
		<section className="w-full px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
			<div className="group relative mx-auto w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/20 bg-[#256bf5] p-8 transition-all duration-300 sm:rounded-[32px] sm:p-12 lg:p-14">
				<div className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
					{/* Blueprint Email Illustration Column */}
					<div
						className={`relative flex items-center justify-center lg:col-span-5 ${
							illustrationPosition === "left"
								? "order-2 lg:order-1 lg:justify-start"
								: "order-2 lg:order-2 lg:justify-end"
						}`}
					>
						<BlueprintEmailIllustration />
					</div>

					{/* Heading, Subhead, and Actions Column */}
					<div
						className={`flex flex-col items-start text-left lg:col-span-7 ${
							illustrationPosition === "left"
								? "order-1 lg:order-2 lg:pl-6"
								: "order-1 lg:order-1 lg:pr-6"
						}`}
					>
						<h2 className="font-medium text-2xl text-white tracking-[-0.025em] sm:text-3xl lg:text-[32px] lg:leading-[1.2]">
							<span>{headlineLine1}</span>
							<br />
							<span className="font-medium text-white">{headlineLine2}</span>
						</h2>

						{subtext && (
							<p className="mt-4 max-w-lg text-[14.5px] text-white/85 leading-relaxed sm:text-[15.5px]">
								{subtext}
							</p>
						)}

						<div className="mt-8 flex flex-wrap items-center gap-3.5 sm:mt-10">
							{/* Primary Button */}
							<Link
								href={primaryHref}
								className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-2.5 font-medium text-[#0f172a] text-[14.5px] transition-all duration-200 hover:bg-neutral-100 active:scale-[0.98]"
							>
								{primaryLabel}
							</Link>

							{/* Secondary Button */}
							{secondaryExternal ? (
								<a
									href={secondaryHref}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/12 px-6 py-2.5 font-medium text-[14.5px] text-white backdrop-blur-xs transition-all duration-200 hover:border-white/40 hover:bg-white/20 active:scale-[0.98]"
								>
									{secondaryLabel}
								</a>
							) : (
								<Link
									href={secondaryHref}
									className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/12 px-6 py-2.5 font-medium text-[14.5px] text-white backdrop-blur-xs transition-all duration-200 hover:border-white/40 hover:bg-white/20 active:scale-[0.98]"
								>
									{secondaryLabel}
								</Link>
							)}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
