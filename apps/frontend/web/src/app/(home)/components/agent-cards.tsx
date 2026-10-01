import type { ReactNode } from "react";

function CliDiagram() {
	const line = "#ebebeb";
	const accent = "#006ffe";
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
				className="fill-white dark:fill-[#161619]"
			/>
			<circle
				cx="78"
				cy="34"
				r="4"
				fill={line}
				className="dark:fill-white/20"
			/>
			<circle
				cx="94"
				cy="34"
				r="4"
				fill={line}
				className="dark:fill-white/20"
			/>
			<circle
				cx="110"
				cy="34"
				r="4"
				fill={line}
				className="dark:fill-white/20"
			/>
			<text x="80" y="88" fontSize="12" fontFamily={mono} fill={accent}>
				$ reloop emails check \
			</text>
			<text
				x="80"
				y="110"
				fontSize="12"
				fontFamily={mono}
				fill={ink}
				className="fill-[#0c0a09] dark:fill-white/85"
			>
				user@example.com --json
			</text>
			<text
				x="80"
				y="142"
				fontSize="12"
				fontFamily={mono}
				fill={ink}
				className="fill-[#0c0a09] dark:fill-white/85"
			>
				{"{"} &quot;verdict&quot;:{" "}
				<tspan fill={accent}>&quot;clear&quot;</tspan>,
			</text>
			<text
				x="80"
				y="164"
				fontSize="12"
				fontFamily={mono}
				fill={ink}
				className="fill-[#0c0a09] dark:fill-white/85"
			>
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
			className="group grid gap-px md:grid-rows-[196px_266px]"
		>
			<div
				data-grid-content="true"
				data-slot="feature-card-content"
				className="space-y-4 rounded-[4px] bg-white p-6 md:px-12 md:pt-12 md:pb-6 dark:bg-black"
			>
				<CardHeader
					icon={
						<svg
							width="22"
							height="22"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#9ca3af"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden
						>
							<path d="M4 17 L9 12 L4 7" />
							<path d="M12 19 H20" />
						</svg>
					}
					title="Developer CLI"
					lede="Send email from your terminal."
					description="Test deliveries and fix configuration without a dashboard."
				/>
			</div>
			<div className="flex min-h-[266px] flex-col rounded-[4px] bg-white p-6 md:min-h-0 md:px-12 md:pt-6 md:pb-12 dark:bg-black">
				<div className="flex min-h-0 flex-1 items-center [&>svg]:max-h-[160px]">
					<CliDiagram />
				</div>
			</div>
		</a>
	);
}

function CardHeader({
	icon,
	title,
	lede,
	description,
}: {
	icon: ReactNode;
	title: string;
	lede: string;
	description: string;
}) {
	return (
		<>
			<h3
				data-slot="feature-card-title"
				className="flex items-center gap-2 text-base text-text-sub-600 leading-6 dark:text-white/55"
			>
				<span
					aria-hidden
					className="flex size-4 items-center justify-center [&>svg]:size-4"
				>
					{icon}
				</span>
				{title}
			</h3>
			<p
				data-slot="feature-card-description"
				className="max-w-lg font-medium text-text-sub-600 text-xl leading-7 dark:text-white/55"
			>
				<span className="text-text-strong-950 dark:text-white">{lede}</span>{" "}
				{description}
			</p>
		</>
	);
}

function McpDiagram() {
	const line = "#ebebeb";
	const accent = "#006ffe";
	const node = (x: number, y: number, glyph: ReactNode) => (
		<g key={`${x}-${y}`}>
			<circle
				cx={x}
				cy={y}
				r="22"
				fill="#ffffff"
				stroke={line}
				strokeWidth="1.5"
				className="fill-white stroke-[#ebebeb] dark:fill-[#1d1d20] dark:stroke-white/15"
			/>
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
			<g
				stroke={line}
				strokeWidth="1.5"
				className="stroke-[#ebebeb] dark:stroke-white/15"
			>
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
				className="fill-white stroke-[#ebebeb] dark:fill-[#1d1d20] dark:stroke-white/15"
			/>
			<text
				x="200"
				y="135"
				textAnchor="middle"
				fontSize="15"
				fontFamily="monospace"
				fill={accent}
				className="fill-blue-500 dark:fill-blue-400"
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
			{node(345, 130, <path d="M0 -9 V9 M-8 -4.5 L8 4.5 M-8 4.5 L8 -4.5" />)}
			{node(
				110,
				220,
				<>
					<rect x="-8" y="-6" width="16" height="11" rx="5.5" />
					<path d="M-4 5 L-6 9 L-1 5.5" />
				</>,
			)}
			{node(290, 220, <path d="M2 -9 L-4 1 H0 L-2 9 L4 -1 H0 L2 -9 Z" />)}
		</svg>
	);
}

function McpCard() {
	return (
		<a
			href="/docs/integrations/ai-tools/mcp-server"
			target="_blank"
			rel="noreferrer"
			className="group grid gap-px md:grid-rows-[196px_266px]"
		>
			<div
				data-grid-content="true"
				data-slot="feature-card-content"
				className="space-y-4 rounded-[4px] bg-white p-6 md:px-12 md:pt-12 md:pb-6 dark:bg-black"
			>
				<CardHeader
					icon={
						<svg
							width="22"
							height="22"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#9ca3af"
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
					}
					title="MCP Server"
					lede="Connect Reloop to your AI agent."
					description="Let Claude, Cursor, or Codex send and manage email."
				/>
			</div>
			<div className="flex min-h-[266px] flex-col rounded-[4px] bg-white p-6 md:min-h-0 md:px-12 md:pt-6 md:pb-12 dark:bg-black">
				<div className="flex min-h-0 flex-1 items-center [&>svg]:max-h-[160px]">
					<McpDiagram />
				</div>
			</div>
		</a>
	);
}

export function AgentCards() {
	return (
		<section
			id="integrations"
			aria-label="Four ways to use Reloop"
			className="w-full overflow-hidden border-[#ebebeb] border-y bg-white dark:border-[#292929] dark:bg-black"
		>
			<div className="grid w-full grid-cols-[minmax(24px,1fr)_minmax(0,1102px)_minmax(24px,1fr)] gap-px bg-[#ebebeb] max-[1099px]:grid-cols-[24px_minmax(0,1fr)_24px] max-[479px]:grid-cols-[8px_minmax(0,1fr)_8px] dark:bg-[#292929]">
				<div aria-hidden className="col-start-1 max-[1099px]:hidden">
					<div
						data-grid-content
						className="h-full rounded-[4px] bg-white dark:bg-black"
					/>
				</div>
				<div className="col-start-2 grid grid-cols-10 gap-px bg-[#ebebeb] dark:bg-[#292929]">
					<div
						aria-hidden
						data-grid-content
						className="rounded-[4px] bg-white max-[1099px]:hidden dark:bg-black"
					/>
					<div className="col-span-8 grid gap-px max-[1099px]:col-[1/-1] md:grid-cols-2">
						<McpCard />
						<CliCard />
					</div>
					<div
						aria-hidden
						data-grid-content
						className="rounded-[4px] bg-white max-[1099px]:hidden dark:bg-black"
					/>
				</div>
				<div aria-hidden className="col-start-3 max-[1099px]:hidden">
					<div
						data-grid-content
						className="h-full rounded-[4px] bg-white dark:bg-black"
					/>
				</div>
			</div>
		</section>
	);
}
