"use client";

import { cn } from "@reloop/ui/cn";
import { useId, useState } from "react";
import { SceneGlyph } from "./_shared/scene-header";

/** Linear isometric tile: 464×~264, stacked 220px apart. */
const TILE_W = 464;
const TILE_GAP = 220;
const TILE_EXTENT = 268;
const VIEW_W = 640;
const ORIGIN_X = (VIEW_W - TILE_W) / 2;
const ICON_CX = 232;
const ICON_CY = 118;

const TILE_FILL =
	"M430.894 117.559a2 2 0 0 1 1.106 1.789v49.819c0 3.03-1.712 5.8-4.422 7.156l-188.423 94.211a16 16 0 0 1-14.31 0l-191.74-95.87A2 2 0 0 1 32 172.875v-53.527c0-.758.428-1.451 1.106-1.789l191.739-95.87a16 16 0 0 1 14.31 0z";
const TILE_FOLD =
	"m40 122.111 186.633 93.317a12 12 0 0 0 10.734 0L424 122.111";
const TILE_OUTLINE =
	"M225.068 22.137a15.5 15.5 0 0 1 13.864 0l190.633 95.316a3.5 3.5 0 0 1 1.935 3.13v51.057a3.5 3.5 0 0 1-1.935 3.13l-190.633 95.316a15.5 15.5 0 0 1-13.864 0L34.435 174.77a3.5 3.5 0 0 1-1.935-3.13v-51.057a3.5 3.5 0 0 1 1.935-3.13z";

const CHEVRON_DOWN =
	"M374.795 188.316a1.124 1.124 0 1 0-1.59 1.591l6 6c.435.435 1.14.44 1.581.01l6-5.854a1.126 1.126 0 0 0-1.572-1.611l-5.204 5.078z";
const CHEVRON_UP =
	"M89.204 275.907a1.126 1.126 0 0 0 1.592-1.591l-6-6a1.125 1.125 0 0 0-1.582-.01l-6 5.854a1.125 1.125 0 0 0 1.572 1.611l5.204-5.078 5.215 5.214Z";

interface Layer {
	id: string;
	name: string;
	role: string;
	icon: "agents" | "flows" | "mail" | "engine" | "smtp";
}

const LAYERS: Layer[] = [
	{
		id: "agents",
		name: "AI Agents & Inbox",
		role: "Autonomous agents and inbound loops",
		icon: "agents",
	},
	{
		id: "workflows",
		name: "Visual Workflows",
		role: "Event-driven sequences and webhooks",
		icon: "flows",
	},
	{
		id: "templates",
		name: "React Email",
		role: "Server-side JSX template compilation",
		icon: "mail",
	},
	{
		id: "engine",
		name: "Reloop Engine",
		role: "High-throughput mail delivery pipeline",
		icon: "engine",
	},
	{
		id: "smtp",
		name: "SMTP & MTAs",
		role: "Multi-region SMTP, DKIM and IP warming",
		icon: "smtp",
	},
];

const VIEW_H = (LAYERS.length - 1) * TILE_GAP + TILE_EXTENT + 16;

function ReloopMark() {
	return (
		<g fill="currentColor" stroke="none">
			<rect x={55} y={51} width={83} height={8} />
			<rect x={55} y={59} width={75} height={8} transform="rotate(90 55 59)" />
			<rect
				x={146}
				y={59}
				width={46}
				height={8}
				transform="rotate(90 146 59)"
			/>
			<rect
				x={154}
				y={69}
				width={44}
				height={8}
				transform="rotate(90 154 69)"
			/>
			<rect
				x={138}
				y={59}
				width={46}
				height={8}
				transform="rotate(90 138 59)"
			/>
			<rect
				x={130}
				y={59}
				width={46}
				height={8}
				transform="rotate(90 130 59)"
			/>
			<rect
				x={90}
				y={105}
				width={29}
				height={8}
				transform="rotate(90 90 105)"
			/>
			<rect
				x={82}
				y={105}
				width={29}
				height={8}
				transform="rotate(90 82 105)"
			/>
			<rect
				x={138}
				y={105}
				width={8}
				height={8}
				transform="rotate(90 138 105)"
			/>
			<rect
				x={146}
				y={105}
				width={8}
				height={8}
				transform="rotate(90 146 105)"
			/>
			<rect
				x={146}
				y={134}
				width={8}
				height={8}
				transform="rotate(90 146 134)"
			/>
			<rect
				x={130}
				y={105}
				width={8}
				height={8}
				transform="rotate(90 130 105)"
			/>
			<rect
				x={122}
				y={105}
				width={8}
				height={8}
				transform="rotate(90 122 105)"
			/>
			<rect x={98} y={77} width={10} height={8} transform="rotate(90 98 77)" />
			<rect x={90} y={77} width={10} height={8} transform="rotate(90 90 77)" />
			<rect x={82} y={77} width={10} height={8} transform="rotate(90 82 77)" />
			<rect
				x={146}
				y={113}
				width={21}
				height={8}
				transform="rotate(90 146 113)"
			/>
			<rect
				x={154}
				y={122}
				width={20}
				height={8}
				transform="rotate(90 154 122)"
			/>
			<rect
				x={138}
				y={113}
				width={21}
				height={8}
				transform="rotate(90 138 113)"
			/>
			<rect
				x={130}
				y={113}
				width={21}
				height={8}
				transform="rotate(90 130 113)"
			/>
			<rect
				x={98}
				y={113}
				width={21}
				height={8}
				transform="rotate(90 98 113)"
			/>
			<rect x={55} y={134} width={83} height={8} />
			<rect x={63} y={142} width={83} height={8} />
		</g>
	);
}

function LayerIcon({ icon }: { icon: Layer["icon"] }) {
	const stroke = {
		fill: "none",
		stroke: "currentColor",
		strokeWidth: 5.5,
		strokeLinecap: "round" as const,
		strokeLinejoin: "round" as const,
	};

	if (icon === "engine") {
		return (
			<g transform="translate(100 100) scale(1.28) translate(-100 -100)">
				<ReloopMark />
			</g>
		);
	}

	if (icon === "agents") {
		return (
			<g {...stroke}>
				<rect x="48" y="62" width="104" height="76" rx="18" />
				<circle cx="82" cy="98" r="8" fill="currentColor" stroke="none" />
				<circle cx="118" cy="98" r="8" fill="currentColor" stroke="none" />
				<path d="M78 138v18M122 138v18M70 164h60M100 62V42" />
				<circle cx="100" cy="34" r="8" />
			</g>
		);
	}

	if (icon === "flows") {
		return (
			<g {...stroke}>
				<circle cx="64" cy="58" r="16" />
				<circle cx="136" cy="58" r="16" />
				<circle cx="100" cy="142" r="16" />
				<path d="M80 58h40M70 72 90 128M130 72 110 128" />
			</g>
		);
	}

	if (icon === "mail") {
		return (
			<g {...stroke}>
				<rect x="40" y="58" width="120" height="84" rx="12" />
				<path d="m48 72 52 44 52-44" />
			</g>
		);
	}

	return (
		<g {...stroke}>
			<rect x="46" y="44" width="108" height="32" rx="7" />
			<rect x="46" y="86" width="108" height="32" rx="7" />
			<rect x="46" y="128" width="108" height="24" rx="7" />
			<path d="M68 60h0.01M68 102h0.01" />
		</g>
	);
}

function TileBlock({
	layer,
	uid,
	active,
	onSelect,
}: {
	layer: Layer;
	uid: string;
	active: boolean;
	onSelect: () => void;
}) {
	return (
		<g
			className="cursor-pointer"
			onClick={onSelect}
			role="button"
			tabIndex={0}
			aria-label={layer.name}
			aria-pressed={active}
			onKeyDown={(event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					onSelect();
				}
			}}
		>
			{[1.55, 1.28, 1].map((scale, i) => (
				<ellipse
					key={scale}
					cx={ICON_CX}
					cy={ICON_CY + 18}
					rx={210 * scale}
					ry={108 * scale}
					fill="none"
					stroke="currentColor"
					strokeWidth="1"
					opacity={active ? 0.09 - i * 0.02 : 0.055 - i * 0.012}
					className="text-text-strong-950 dark:text-white"
				/>
			))}

			<g filter={`url(#${uid}-shadow)`}>
				<path
					d={TILE_FILL}
					className="fill-bg-white-0 dark:fill-[#0c0c0c]"
					opacity={active ? 1 : 0.96}
				/>
				<path
					d={TILE_FOLD}
					className="reloop-engine-dash-iso stroke-[#3E3E44] dark:stroke-[#8A8F98]"
					fill="none"
					strokeDasharray="2 4"
					strokeLinecap="round"
				/>
				<path
					d={TILE_OUTLINE}
					fill="none"
					className="stroke-[#D0D6E0] dark:stroke-[#3E3E44]"
				/>
			</g>

			<path
				d="M232 226.611v31"
				fill="none"
				stroke="currentColor"
				strokeLinecap="round"
				opacity={0.4}
				className="text-[#62666D] dark:text-white"
			/>

			<g
				transform={`translate(${ICON_CX} ${ICON_CY}) scale(0.7 0.35) translate(-100 -100)`}
				className={cn(
					"text-[#5C6169] dark:text-[#C8CDD4]",
					active ? "opacity-90" : "opacity-70",
				)}
			>
				<LayerIcon icon={layer.icon} />
			</g>
		</g>
	);
}

function GapDecor({ index, uid }: { index: number; uid: string }) {
	const dy = index * TILE_GAP;
	const opacities = [0.3, 0.5, 0.7, 0.3, 0.5, 0.7];

	return (
		<g>
			<path
				className="reloop-engine-dash-up stroke-[#3E3E44] dark:stroke-[#8A8F98]"
				strokeDasharray="2 6"
				strokeLinecap="round"
				d={`M32.5 ${192.611 + dy}v127`}
			/>
			<path
				className="reloop-engine-dash-down stroke-[#3E3E44] dark:stroke-[#8A8F98]"
				strokeDasharray="2 6"
				strokeLinecap="round"
				d={`M431.5 ${192.611 + dy}v127`}
			/>
			<path
				className="reloop-engine-dash-down stroke-[#3E3E44] dark:stroke-[#8A8F98]"
				strokeDasharray="2 6"
				strokeLinecap="round"
				d={`M232.5 ${290.611 + dy}v127`}
			/>

			<g mask={`url(#${uid}-mask-down-${index})`}>
				<g transform={`translate(0 ${dy})`}>
					<g className="reloop-engine-chevron-down text-text-strong-950 dark:text-white">
						{opacities.map((opacity, i) => (
							<path
								key={`dn-${i}`}
								d={CHEVRON_DOWN}
								fill="currentColor"
								opacity={opacity}
								transform={`translate(0 ${i * 16})`}
							/>
						))}
					</g>
				</g>
			</g>

			<g mask={`url(#${uid}-mask-up-${index})`}>
				<g transform={`translate(0 ${dy})`}>
					<g className="reloop-engine-chevron-up text-text-strong-950 dark:text-white">
						{opacities.map((opacity, i) => (
							<path
								key={`up-${i}`}
								d={CHEVRON_UP}
								fill="currentColor"
								opacity={opacity}
								transform={`translate(0 ${-i * 16})`}
							/>
						))}
					</g>
				</g>
			</g>
		</g>
	);
}

export default function ReloopEngine() {
	const [activeId, setActiveId] = useState("engine");
	const uid = useId().replace(/:/g, "");

	return (
		<section
			id="engine"
			aria-labelledby="engine-heading"
			className="relative w-full overflow-hidden bg-bg-white-0 py-16 sm:py-20 lg:py-24 dark:bg-transparent"
		>
			<style>{`
				@keyframes reloop-engine-dash {
					to { stroke-dashoffset: -24; }
				}
				@keyframes reloop-engine-chevron-down {
					from { transform: translateY(-16px); }
					to { transform: translateY(16px); }
				}
				@keyframes reloop-engine-chevron-up {
					from { transform: translateY(16px); }
					to { transform: translateY(-16px); }
				}
				@media (prefers-reduced-motion: no-preference) {
					.reloop-engine-dash-iso,
					.reloop-engine-dash-up,
					.reloop-engine-dash-down {
						animation: reloop-engine-dash 1.4s linear infinite;
					}
					.reloop-engine-dash-down {
						animation-direction: reverse;
					}
					.reloop-engine-chevron-down {
						animation: reloop-engine-chevron-down 2.6s linear infinite;
					}
					.reloop-engine-chevron-up {
						animation: reloop-engine-chevron-up 2.6s linear infinite;
					}
				}
			`}</style>

			<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col items-center text-center">
					<div className="inline-flex items-center gap-2 rounded-full border border-stroke-soft-200 bg-bg-soft-50/80 px-3 py-1 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.04]">
						<SceneGlyph icon="zap" color="orange" />
						<span className="font-mono text-[12px] text-text-sub-600 uppercase tracking-wider dark:text-white/70">
							Architecture & Stack
						</span>
					</div>

					<h2
						id="engine-heading"
						className="mt-4 font-semibold text-3xl text-text-strong-950 tracking-tight sm:text-4xl lg:text-5xl dark:text-white"
					>
						The Reloop powerful engine.
					</h2>

					<p className="mt-3.5 max-w-2xl text-[15px] text-text-sub-600 leading-relaxed sm:text-base dark:text-white/60">
						Five synchronized layers built for sub-millisecond dispatch,
						bulletproof deliverability, and developer flexibility from wire
						protocols to autonomous agents.
					</p>
				</div>

				<div className="relative mx-auto mt-10 max-w-3xl lg:mt-12">
					<svg
						viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
						className="mx-auto h-auto w-full max-w-[640px] overflow-visible text-text-strong-950 dark:text-white"
						role="img"
						aria-label="Reloop engine as five isometric layers"
					>
						<defs>
							<linearGradient
								id={`${uid}-grad`}
								x1="0"
								x2="0"
								y1="0"
								y2="1"
							>
								<stop offset="0%" stopColor="white" stopOpacity="0" />
								<stop offset="25%" stopColor="white" stopOpacity="1" />
								<stop offset="75%" stopColor="white" stopOpacity="1" />
								<stop offset="100%" stopColor="white" stopOpacity="0" />
							</linearGradient>
							<filter
								id={`${uid}-shadow`}
								width="464"
								height="320"
								x="0"
								y="-1.889"
								colorInterpolationFilters="sRGB"
								filterUnits="userSpaceOnUse"
							>
								<feFlood floodOpacity="0" result="BackgroundImageFix" />
								<feColorMatrix
									in="SourceAlpha"
									result="hardAlpha"
									values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
								/>
								<feOffset dy="12" />
								<feGaussianBlur stdDeviation="16" />
								<feComposite in2="hardAlpha" operator="out" />
								<feColorMatrix values="0 0 0 0 0.0313726 0 0 0 0 0.0352941 0 0 0 0 0.0392157 0 0 0 0.55 0" />
								<feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
								<feBlend
									in="SourceGraphic"
									in2="effect1_dropShadow"
									result="shape"
								/>
							</filter>
							{LAYERS.slice(0, -1).map((_, index) => {
								const dy = index * TILE_GAP;
								return (
									<g key={`masks-${index}`}>
										<mask
											id={`${uid}-mask-down-${index}`}
											maskContentUnits="userSpaceOnUse"
										>
											<rect
												x="366"
												y={226 + dy}
												width="30"
												height="56"
												fill={`url(#${uid}-grad)`}
											/>
										</mask>
										<mask
											id={`${uid}-mask-up-${index}`}
											maskContentUnits="userSpaceOnUse"
										>
											<rect
												x="70"
												y={232 + dy}
												width="30"
												height="56"
												fill={`url(#${uid}-grad)`}
											/>
										</mask>
									</g>
								);
							})}
						</defs>

						<g transform={`translate(${ORIGIN_X} 0)`}>
							{[...LAYERS].reverse().map((layer, reverseIndex) => {
								const index = LAYERS.length - 1 - reverseIndex;
								return (
									<g
										key={layer.id}
										transform={`translate(0 ${index * TILE_GAP})`}
									>
										<TileBlock
											layer={layer}
											uid={uid}
											active={activeId === layer.id}
											onSelect={() => setActiveId(layer.id)}
										/>
									</g>
								);
							})}

							{LAYERS.slice(0, -1).map((layer, index) => (
								<GapDecor key={`gap-${layer.id}`} index={index} uid={uid} />
							))}
						</g>
					</svg>

					<ul className="mx-auto mt-4 grid max-w-3xl grid-cols-1 gap-2 sm:grid-cols-5 sm:gap-3">
						{LAYERS.map((layer, index) => {
							const active = activeId === layer.id;
							return (
								<li key={layer.id}>
									<button
										type="button"
										onClick={() => setActiveId(layer.id)}
										aria-pressed={active}
										className={cn(
											"flex w-full flex-col items-start rounded-xl border px-3 py-2.5 text-left motion-safe:transition-[border-color,background-color,transform] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.23,1,0.32,1)] motion-safe:active:scale-[0.97]",
											active
												? "border-stroke-strong-950 bg-bg-weak-50 dark:border-white/35 dark:bg-white/[0.06]"
												: "border-stroke-soft-200 bg-bg-white-0/80 hover:border-stroke-strong-950 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/30",
										)}
									>
										<span className="font-mono text-[10px] tracking-[0.16em] text-text-sub-600 dark:text-white/45">
											0{index + 1}
										</span>
										<span
											className={cn(
												"mt-1 font-medium text-[13px] leading-tight",
												active
													? "text-text-strong-950 dark:text-white"
													: "text-text-sub-600 dark:text-white/70",
											)}
										>
											{layer.name}
										</span>
									</button>
								</li>
							);
						})}
					</ul>

					<p className="mx-auto mt-3 max-w-xl text-center text-[13px] text-text-sub-600 dark:text-white/50">
						{LAYERS.find((layer) => layer.id === activeId)?.role}
					</p>
				</div>
			</div>
		</section>
	);
}
