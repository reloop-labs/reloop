import { Icon } from "@reloop/ui/icon";
import type { ReactNode } from "react";

function ApiDiagram() {
	const line = "#e7e7e7";
	const accent = "#f43f5e";
	const soft = "#fecdd3";
	const bar = (x: number, y: number, w: number, fill: string, o = 1) => (
		<rect
			key={`${x}-${y}`}
			x={x}
			y={y}
			width={w}
			height="7"
			rx="3.5"
			fill={fill}
			opacity={o}
		/>
	);

	return (
		<svg
			viewBox="0 0 400 250"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="h-auto w-full"
			aria-hidden
		>
			{/* back YAML card */}
			<g>
				<rect
					x="28"
					y="18"
					width="150"
					height="150"
					rx="16"
					fill="#ffffff"
					stroke={line}
					strokeWidth="1.5"
				/>
				<text
					x="103"
					y="44"
					textAnchor="middle"
					fontSize="12"
					fontFamily="monospace"
					letterSpacing="2"
					fill="#a8a29e"
				>
					YAML
				</text>
				<line x1="28" y1="58" x2="178" y2="58" stroke={line} strokeWidth="1.5" />
				{bar(48, 74, 52, line)}
				{bar(48, 90, 84, line)}
				{bar(48, 106, 34, line)}
			</g>
			{/* back JSON card */}
			<g>
				<rect
					x="222"
					y="18"
					width="150"
					height="150"
					rx="16"
					fill="#ffffff"
					stroke={line}
					strokeWidth="1.5"
				/>
				<text
					x="297"
					y="44"
					textAnchor="middle"
					fontSize="12"
					fontFamily="monospace"
					letterSpacing="2"
					fill="#a8a29e"
				>
					JSON
				</text>
				<line x1="222" y1="58" x2="372" y2="58" stroke={line} strokeWidth="1.5" />
				{bar(242, 74, 40, line)}
				{bar(242, 90, 68, line)}
				{bar(242, 106, 30, line)}
			</g>
			{/* front endpoint card */}
			<g>
				<rect
					x="90"
					y="92"
					width="220"
					height="132"
					rx="18"
					fill="#ffffff"
					stroke={line}
					strokeWidth="1.5"
				/>
				<rect x="110" y="114" width="62" height="26" rx="13" fill={accent} />
				<text
					x="141"
					y="131"
					textAnchor="middle"
					fontSize="12"
					fontWeight="600"
					fontFamily="monospace"
					fill="#ffffff"
				>
					POST
				</text>
				{bar(184, 118, 58, accent)}
				{bar(184, 132, 30, soft)}
				{bar(218, 132, 46, soft)}
				<rect
					x="110"
					y="156"
					width="62"
					height="26"
					rx="13"
					fill={soft}
				/>
				<text
					x="141"
					y="173"
					textAnchor="middle"
					fontSize="12"
					fontWeight="600"
					fontFamily="monospace"
					fill={accent}
				>
					GET
				</text>
				{bar(184, 160, 26, line)}
				{bar(184, 174, 52, accent)}
				{bar(240, 174, 24, line)}
			</g>
		</svg>
	);
}

function ApiCard() {
	return (
		<a
			href="/docs/api-reference"
			target="_blank"
			rel="noreferrer"
			className="group flex flex-col bg-bg-white-0 px-4 py-6 sm:px-5 sm:py-8 lg:px-6 lg:py-8 dark:bg-black"
		>
			<div className="flex items-center gap-2.5">
				<svg
					width="22"
					height="22"
					viewBox="0 0 24 24"
					fill="none"
					stroke="#f43f5e"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden
				>
					<path d="M8 6 L3 12 L8 18" />
					<path d="M16 6 L21 12 L16 18" />
				</svg>
				<h3 className="text-balance font-semibold text-text-strong-950 text-[16px] tracking-[-0.025em] dark:text-white">
					API Reference
				</h3>
			</div>
			<p className="mt-3 text-[16px] font-medium text-text-strong-950 leading-snug tracking-[-0.025em] dark:text-white">
				Auto-generated from your API spec.
			</p>
			<div className="mt-6 mb-4">
				<ApiDiagram />
			</div>
			<div className="mt-auto flex items-center justify-between border-stroke-soft-100 border-t pt-4 dark:border-white/10">
				<span className="font-mono text-[11px] tracking-[0.14em] text-text-soft-400 uppercase dark:text-white/30">
					FEA. [02]
				</span>
				<span className="inline-flex items-center gap-1.5 font-medium text-[13px] text-text-strong-950 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
					<span>Explore API Reference</span>
					<Icon
						name="arrow-right"
						className="size-3 transition-transform duration-200 group-hover:translate-x-0.5"
						aria-hidden
					/>
				</span>
			</div>
		</a>
	);
}

function CliDiagram() {
	const line = "#e7e7e7";
	const accent = "#f43f5e";
	const ink = "#0c0a09";
	const mono = "monospace";

	return (
		<svg
			viewBox="0 0 400 220"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="h-auto w-full"
			aria-hidden
		>
			<rect
				x="60"
				y="18"
				width="280"
				height="184"
				rx="14"
				fill="#ffffff"
				stroke={line}
				strokeWidth="1.5"
			/>
			<circle cx="84" cy="42" r="4" fill={line} />
			<circle cx="100" cy="42" r="4" fill={line} />
			<circle cx="116" cy="42" r="4" fill={line} />
			<line x1="60" y1="58" x2="340" y2="58" stroke={line} strokeWidth="1.5" />
			<text x="80" y="88" fontSize="12" fontFamily={mono} fill={accent}>
				$ reloop emails check \
			</text>
			<text x="80" y="110" fontSize="12" fontFamily={mono} fill={ink}>
				user@example.com --json
			</text>
			<text x="80" y="142" fontSize="12" fontFamily={mono} fill={ink}>
				{"{"} &quot;verdict&quot;:{" "}
				<tspan fill={accent}>&quot;clear&quot;</tspan>,
			</text>
			<text x="80" y="164" fontSize="12" fontFamily={mono} fill={ink}>
				&quot;confidence&quot;: <tspan fill={accent}>0.98</tspan> {"}"}
			</text>
		</svg>
	);
}

function CliCard() {
	return (
		<a
			href="/docs/integrations/ai-tools/cli-agents"
			target="_blank"
			rel="noreferrer"
			className="group flex flex-col bg-bg-white-0 px-4 py-6 sm:px-5 sm:py-8 lg:px-6 lg:py-8 dark:bg-black"
		>
			<div className="flex items-center gap-2.5">
				<svg
					width="22"
					height="22"
					viewBox="0 0 24 24"
					fill="none"
					stroke="#f43f5e"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden
				>
					<path d="M4 17 L9 12 L4 7" />
					<path d="M12 19 H20" />
				</svg>
				<h3 className="text-balance font-semibold text-text-strong-950 text-[16px] tracking-[-0.025em] dark:text-white">
					Developer CLI
				</h3>
			</div>
			<p className="mt-3 text-[16px] font-medium text-text-strong-950 leading-snug tracking-[-0.025em] dark:text-white">
				Deterministic commands for humans and agents.
			</p>
			<div className="mt-6 mb-4">
				<CliDiagram />
			</div>
			<div className="mt-auto flex items-center justify-between border-stroke-soft-100 border-t pt-4 dark:border-white/10">
				<span className="font-mono text-[11px] tracking-[0.14em] text-text-soft-400 uppercase dark:text-white/30">
					FEA. [03]
				</span>
				<span className="inline-flex items-center gap-1.5 font-medium text-[13px] text-text-strong-950 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
					<span>CLI Reference</span>
					<Icon
						name="arrow-right"
						className="size-3 transition-transform duration-200 group-hover:translate-x-0.5"
						aria-hidden
					/>
				</span>
			</div>
		</a>
	);
}

function SkillsDiagram() {
	const line = "#e7e7e7";
	const accent = "#f43f5e";

	return (
		<svg
			viewBox="0 0 400 220"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="h-auto w-full"
			aria-hidden
		>
			<rect
				x="110"
				y="46"
				width="200"
				height="120"
				rx="16"
				fill="#ffffff"
				stroke={line}
				strokeWidth="1.5"
			/>
			<rect
				x="96"
				y="60"
				width="200"
				height="120"
				rx="16"
				fill="#ffffff"
				stroke={line}
				strokeWidth="1.5"
			/>
			<rect
				x="82"
				y="74"
				width="200"
				height="120"
				rx="16"
				fill="#ffffff"
				stroke={accent}
				strokeWidth="1.5"
			/>
			<text
				x="102"
				y="106"
				fontSize="12"
				fontFamily="monospace"
				fill={accent}
			>
				reloop-skills/
			</text>
			<g fontSize="11" fontFamily="monospace">
				<rect x="102" y="120" width="62" height="24" rx="12" fill="#fff1f2" />
				<text x="133" y="136" textAnchor="middle" fill={accent}>
					check
				</text>
				<rect x="170" y="120" width="56" height="24" rx="12" fill="#fff1f2" />
				<text x="198" y="136" textAnchor="middle" fill={accent}>
					send
				</text>
				<rect x="102" y="150" width="66" height="24" rx="12" fill="#fff1f2" />
				<text x="135" y="166" textAnchor="middle" fill={accent}>
					verify
				</text>
			</g>
			<path
				d="M318 52 C319 46 321 44 327 43 C321 42 319 40 318 34 C317 40 315 42 309 43 C315 44 317 46 318 52 Z"
				fill={accent}
			/>
		</svg>
	);
}

function SkillsCard() {
	return (
		<a
			href="/docs/integrations/agent-skills/reloop-skill"
			target="_blank"
			rel="noreferrer"
			className="group flex flex-col bg-bg-white-0 px-4 py-6 sm:px-5 sm:py-8 lg:px-6 lg:py-8 dark:bg-black"
		>
			<div className="flex items-center gap-2.5">
				<svg
					width="22"
					height="22"
					viewBox="0 0 24 24"
					fill="none"
					stroke="#f43f5e"
					strokeWidth="1.8"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden
				>
					<path d="M12 3 C12.5 8 13.5 9.5 19 10 C13.5 10.5 12.5 12 12 17 C11.5 12 10.5 10.5 5 10 C10.5 9.5 11.5 8 12 3 Z" />
				</svg>
				<h3 className="text-balance font-semibold text-text-strong-950 text-[16px] tracking-[-0.025em] dark:text-white">
					Agent Skills
				</h3>
			</div>
			<p className="mt-3 text-[16px] font-medium text-text-strong-950 leading-snug tracking-[-0.025em] dark:text-white">
				Teach your agents every Reloop workflow.
			</p>
			<div className="mt-6 mb-4">
				<SkillsDiagram />
			</div>
			<div className="mt-auto flex items-center justify-between border-stroke-soft-100 border-t pt-4 dark:border-white/10">
				<span className="font-mono text-[11px] tracking-[0.14em] text-text-soft-400 uppercase dark:text-white/30">
					FEA. [04]
				</span>
				<span className="inline-flex items-center gap-1.5 font-medium text-[13px] text-text-strong-950 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
					<span>Install Agent Skills</span>
					<Icon
						name="arrow-right"
						className="size-3 transition-transform duration-200 group-hover:translate-x-0.5"
						aria-hidden
					/>
				</span>
			</div>
		</a>
	);
}

function McpDiagram() {
	const line = "#e7e7e7";
	const accent = "#f43f5e";
	const node = (x: number, y: number, glyph: ReactNode) => (
		<g key={`${x}-${y}`}>
			<circle cx={x} cy={y} r="22" fill="#ffffff" stroke={line} strokeWidth="1.5" />
			<g
				transform={`translate(${x},${y})`}
				stroke={accent}
				strokeWidth="1.8"
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				{glyph}
			</g>
		</g>
	);

	return (
		<svg
			viewBox="0 0 400 260"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="h-auto w-full"
			aria-hidden
		>
			{/* connectors */}
			<g stroke={line} strokeWidth="1.5">
				<path d="M110 62 V84 H140 V100" />
				<path d="M290 62 V84 H260 V100" />
				<path d="M77 130 H140" />
				<path d="M260 130 H323" />
				<path d="M110 198 V176 H140 V160" />
				<path d="M290 198 V176 H260 V160" />
			</g>
			{/* node dots on the wires */}
			<g fill={accent}>
				<rect x="136" y="80" width="8" height="8" rx="1.5" />
				<rect x="196" y="80" width="8" height="8" rx="1.5" />
				<rect x="136" y="172" width="8" height="8" rx="1.5" />
				<rect x="196" y="172" width="8" height="8" rx="1.5" />
			</g>
			{/* central API pill */}
			<rect
				x="140"
				y="100"
				width="120"
				height="60"
				rx="16"
				fill="#ffffff"
				stroke={line}
				strokeWidth="1.5"
			/>
			<text
				x="200"
				y="135"
				textAnchor="middle"
				fontSize="15"
				fontFamily="monospace"
				fill={accent}
			>
				{"{API}"}
			</text>
			{node(
				110,
				40,
				<>
					<circle r="7" />
					<path d="M5 -5 L9 -9 M-5 5 L-9 9" />
				</>,
			)}
			{node(
				290,
				40,
				<>
					<circle r="4" />
					<circle r="8" strokeDasharray="2 2" />
				</>,
			)}
			{node(
				55,
				130,
				<path d="M0 -9 C1 -3 3 -1 9 0 C3 1 1 3 0 9 C-1 3 -3 1 -9 0 C-3 -1 -1 -3 0 -9 Z" />,
			)}
			{node(
				345,
				130,
				<>
					<path d="M0 -9 V9 M-8 -4.5 L8 4.5 M-8 4.5 L8 -4.5" />
				</>,
			)}
			{node(
				110,
				220,
				<>
					<rect x="-8" y="-6" width="16" height="11" rx="5.5" />
					<path d="M-4 5 L-6 9 L-1 5.5" />
				</>,
			)}
			{node(
				290,
				220,
				<path d="M2 -9 L-4 1 H0 L-2 9 L4 -1 H0 L2 -9 Z" />,
			)}
		</svg>
	);
}

function McpCard() {
	return (
		<a
			href="/docs/integrations/ai-tools/mcp-server"
			target="_blank"
			rel="noreferrer"
			className="group flex flex-col bg-bg-white-0 px-4 py-6 sm:px-5 sm:py-8 lg:px-6 lg:py-8 dark:bg-black"
		>
			<div className="flex items-center gap-2.5">
				<svg
					width="22"
					height="22"
					viewBox="0 0 24 24"
					fill="none"
					stroke="#f43f5e"
					strokeWidth="1.8"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden
				>
					<circle cx="6" cy="6" r="2.5" />
					<circle cx="18" cy="6" r="2.5" />
					<circle cx="6" cy="18" r="2.5" />
					<path d="M8.5 6 H15.5 M6 8.5 V15.5 M8 16.5 L15 8" />
				</svg>
				<h3 className="text-balance font-semibold text-text-strong-950 text-[16px] tracking-[-0.025em] dark:text-white">
					MCP Server
				</h3>
			</div>
			<p className="mt-3 text-[16px] font-medium text-text-strong-950 leading-snug tracking-[-0.025em] dark:text-white">
				Connect your APIs to AI agents.
			</p>
			<div className="mt-6 mb-4">
				<McpDiagram />
			</div>
			<div className="mt-auto flex items-center justify-between border-stroke-soft-100 border-t pt-4 dark:border-white/10">
				<span className="font-mono text-[11px] tracking-[0.14em] text-text-soft-400 uppercase dark:text-white/30">
					FEA. [01]
				</span>
				<span className="inline-flex items-center gap-1.5 font-medium text-[13px] text-text-strong-950 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
					<span>Explore MCP Server</span>
					<Icon
						name="arrow-right"
						className="size-3 transition-transform duration-200 group-hover:translate-x-0.5"
						aria-hidden
					/>
				</span>
			</div>
		</a>
	);
}

export function AgentCards() {
	return (
		<div className="grid grid-cols-1 gap-px border-stroke-soft-100 border-b bg-stroke-soft-100 sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10 dark:bg-white/10">
			<McpCard />
			<ApiCard />
			<CliCard />
			<SkillsCard />
		</div>
	);
}
