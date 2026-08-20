"use client";

import { cn } from "@reloop/ui/cn";
import { useState } from "react";
import { SceneGlyph } from "./_shared/scene-header";

const COS = Math.sqrt(3) / 2;
const SIN = 0.5;
const S = 62;
const H = 20;
const GAP = 186;
const CX = 360;
const PAD_TOP = 92;
const VIEW_W = 720;
const VIEW_H = PAD_TOP + (5 - 1) * GAP + 2 * S + H + 80;

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

function iso(x: number, y: number, z: number) {
	return {
		x: (x - z) * COS,
		y: (x + z) * SIN - y,
	};
}

function lerp(
	a: { x: number; y: number },
	b: { x: number; y: number },
	t: number,
) {
	return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function boxCorners(oy: number) {
	const top = {
		nw: iso(-S, H, -S),
		ne: iso(S, H, -S),
		se: iso(S, H, S),
		sw: iso(-S, H, S),
	};
	const bot = {
		nw: iso(-S, 0, -S),
		ne: iso(S, 0, -S),
		se: iso(S, 0, S),
		sw: iso(-S, 0, S),
	};
	const map = (p: { x: number; y: number }) => ({ x: CX + p.x, y: oy + p.y });
	return {
		t: {
			nw: map(top.nw),
			ne: map(top.ne),
			se: map(top.se),
			sw: map(top.sw),
		},
		b: {
			nw: map(bot.nw),
			ne: map(bot.ne),
			se: map(bot.se),
			sw: map(bot.sw),
		},
	};
}

function d(points: { x: number; y: number }[], close = true) {
	const [first, ...rest] = points;
	if (!first) return "";
	return `M ${first.x.toFixed(1)} ${first.y.toFixed(1)} ${rest
		.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
		.join(" ")}${close ? " Z" : ""}`;
}

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

function Chevrons({
	x,
	y,
	dir,
}: {
	x: number;
	y: number;
	dir: "up" | "down";
}) {
	const sign = dir === "up" ? 1 : -1;
	return (
		<g
			transform={`translate(${x} ${y})`}
			fill="none"
			stroke="currentColor"
			strokeWidth="1.35"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="text-text-strong-950 dark:text-white"
		>
			{[0, 1, 2].map((i) => {
				const oy = (i - 1) * 13 * sign;
				const opacity = dir === "up" ? 0.22 + i * 0.18 : 0.58 - i * 0.18;
				const dPath =
					dir === "up"
						? "M -8 5 L 0 -5 L 8 5"
						: "M -8 -5 L 0 5 L 8 -5";
				return (
					<path
						key={i}
						d={dPath}
						transform={`translate(0 ${oy})`}
						opacity={opacity}
					/>
				);
			})}
		</g>
	);
}

function IsoBox({
	layer,
	oy,
	active,
	onSelect,
}: {
	layer: Layer;
	oy: number;
	active: boolean;
	onSelect: () => void;
}) {
	const { t, b } = boxCorners(oy);
	const centroid = {
		x: (t.nw.x + t.ne.x + t.se.x + t.sw.x) / 4,
		y: (t.nw.y + t.ne.y + t.se.y + t.sw.y) / 4,
	};
	const vLeft = lerp(t.sw, centroid, 0.2);
	const vApex = lerp(t.se, centroid, 0.14);
	const vRight = lerp(t.ne, centroid, 0.2);

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
					cx={centroid.x}
					cy={centroid.y + 10}
					rx={2 * S * COS * scale + 18}
					ry={S * scale + 8}
					fill="none"
					stroke="currentColor"
					strokeWidth="1"
					opacity={0.045 - i * 0.01}
					className="text-text-strong-950 dark:text-white"
				/>
			))}

			<path
				d={d([t.sw, t.se, b.se, b.sw])}
				className="fill-bg-white-0 dark:fill-[#0c0c0c]"
				stroke="currentColor"
				strokeWidth="1.15"
				strokeLinejoin="round"
				vectorEffect="non-scaling-stroke"
				opacity={active ? 0.95 : 0.72}
			/>
			<path
				d={d([t.ne, t.se, b.se, b.ne])}
				className="fill-bg-white-0 dark:fill-[#0c0c0c]"
				stroke="currentColor"
				strokeWidth="1.15"
				strokeLinejoin="round"
				vectorEffect="non-scaling-stroke"
				opacity={active ? 0.95 : 0.72}
			/>
			<path
				d={d([t.nw, t.ne, t.se, t.sw])}
				className="fill-bg-white-0 dark:fill-[#111]"
				stroke="currentColor"
				strokeWidth="1.15"
				strokeLinejoin="round"
				vectorEffect="non-scaling-stroke"
				opacity={active ? 0.98 : 0.78}
			/>

			<path
				d={`M ${vLeft.x.toFixed(1)} ${vLeft.y.toFixed(1)} L ${vApex.x.toFixed(1)} ${vApex.y.toFixed(1)} L ${vRight.x.toFixed(1)} ${vRight.y.toFixed(1)}`}
				fill="none"
				stroke="currentColor"
				strokeWidth="1.05"
				strokeDasharray="4 3.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				vectorEffect="non-scaling-stroke"
				opacity={0.38}
			/>

			<g
				transform={`translate(${centroid.x} ${centroid.y - 1}) scale(0.68 ${0.68 * 0.577}) translate(-100 -100)`}
				className={cn(
					"text-text-strong-950 dark:text-white",
					active ? "opacity-85" : "opacity-60",
				)}
			>
				<LayerIcon icon={layer.icon} />
			</g>
		</g>
	);
}

export default function ReloopEngine() {
	const [activeId, setActiveId] = useState("engine");

	return (
		<section
			id="engine"
			aria-labelledby="engine-heading"
			className="relative w-full overflow-hidden bg-bg-white-0 py-16 sm:py-20 lg:py-24 dark:bg-transparent"
		>
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
						className="mx-auto h-auto w-full max-w-[640px] text-text-strong-950 dark:text-white"
						role="img"
						aria-label="Reloop engine as five isometric layers"
					>
						{LAYERS.map((layer, index) => {
							if (index === LAYERS.length - 1) return null;
							const oy = PAD_TOP + index * GAP;
							const nextOy = PAD_TOP + (index + 1) * GAP;
							const y = (oy + S + (nextOy - S - H)) / 2;
							const span = 2 * S * COS + 16;
							return (
								<g key={`chevrons-${layer.id}`}>
									<Chevrons x={CX - span} y={y} dir="up" />
									<Chevrons x={CX + span} y={y} dir="down" />
								</g>
							);
						})}

						{LAYERS.map((layer, index) => (
							<IsoBox
								key={layer.id}
								layer={layer}
								oy={PAD_TOP + index * GAP}
								active={activeId === layer.id}
								onSelect={() => setActiveId(layer.id)}
							/>
						))}
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
