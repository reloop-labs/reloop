import type { ReactNode } from "react";
import {
	siClaude,
	siCursor,
	siGooglegemini,
	siMistralai,
	siModelcontextprotocol,
	siOllama,
	siOpenrouter,
} from "simple-icons";

const OPENAI_PATH =
	"M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zm-9.66-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1402-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1683a.0757.0757 0 0 1-.071 0l-4.8303-2.7866A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1635a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.6069 1.4997-2.602-1.4997z";

function CliDiagram() {
	const mono = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

	return (
		<svg
			viewBox="0 0 500 252"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="h-auto w-full select-none"
			aria-hidden
		>
			{/* Monochrome traffic dots */}
			<circle cx="28" cy="22" r="4" className="fill-zinc-300 dark:fill-zinc-700" />
			<circle cx="42" cy="22" r="4" className="fill-zinc-300 dark:fill-zinc-700" />
			<circle cx="56" cy="22" r="4" className="fill-zinc-300 dark:fill-zinc-700" />

			{/* Shell session title with shortcut (no bg) */}
			<text
				x="76"
				y="26"
				fontSize="10"
				fontFamily={mono}
				className="fill-zinc-500 dark:fill-zinc-400 font-medium"
				letterSpacing="-0.01em"
			>
				<tspan className="fill-zinc-400 dark:fill-zinc-500 font-semibold">⌘1</tspan>
				<tspan className="fill-zinc-300 dark:fill-zinc-700"> · </tspan>
				developer@mac ~ reloop
			</text>

			{/* Terminal header banner */}
			<text
				x="24"
				y="56"
				fontSize="13"
				fontWeight="700"
				fontFamily={mono}
				className="fill-zinc-950 dark:fill-white"
			>
				Reloop CLI
			</text>
			<text
				x="116"
				y="56"
				fontSize="10"
				fontFamily={mono}
				className="fill-zinc-500 dark:fill-zinc-400"
			>
				v0.4.2 · Send email from your terminal
			</text>

			{/* Divider rule */}
			<line
				x1="24"
				y1="72"
				x2="476"
				y2="72"
				className="stroke-zinc-200 dark:stroke-zinc-800"
				strokeWidth="1"
				strokeDasharray="3 3"
			/>

			{/* Sending email command */}
			<text
				x="24"
				y="96"
				fontSize="11.5"
				fontFamily={mono}
				className="fill-zinc-900 dark:fill-zinc-100 font-medium"
			>
				<tspan className="fill-zinc-950 dark:fill-white font-bold">$</tspan> reloop emails send \
			</text>
			<text
				x="44"
				y="114"
				fontSize="11"
				fontFamily={mono}
				className="fill-zinc-600 dark:fill-zinc-400"
			>
				--to user@example.com \
			</text>
			<text
				x="44"
				y="132"
				fontSize="11"
				fontFamily={mono}
				className="fill-zinc-600 dark:fill-zinc-400"
			>
				--subject &quot;Welcome to Reloop&quot; \
			</text>
			<text
				x="44"
				y="150"
				fontSize="11"
				fontFamily={mono}
				className="fill-zinc-600 dark:fill-zinc-400"
			>
				--json
			</text>

			{/* Delivery confirmation */}
			<text
				x="24"
				y="176"
				fontSize="10.5"
				fontFamily={mono}
				className="fill-zinc-950 dark:fill-white font-semibold"
			>
				✓ <tspan className="fill-zinc-500 dark:fill-zinc-400 font-normal">queued → sent → delivered (78ms)</tspan>
			</text>

			{/* JSON Output from send */}
			<text
				x="24"
				y="198"
				fontSize="10"
				fontFamily={mono}
				className="fill-zinc-500 dark:fill-zinc-400"
			>
				{"{"} &quot;id&quot;: <tspan className="fill-zinc-800 dark:fill-zinc-200">&quot;msg_01jh8q...&quot;</tspan>, &quot;to&quot;: <tspan className="fill-zinc-800 dark:fill-zinc-200">&quot;user@example.com&quot;</tspan>, &quot;status&quot;: <tspan className="fill-zinc-800 dark:fill-zinc-200">&quot;delivered&quot;</tspan> {"}"}
			</text>

			{/* Next prompt ready to send with blinking cursor */}
			<text
				x="24"
				y="232"
				fontSize="11.5"
				fontFamily={mono}
				className="fill-zinc-900 dark:fill-zinc-100 font-medium"
			>
				<tspan className="fill-zinc-950 dark:fill-white font-bold">$</tspan> reloop emails send --to dev@company.com{" "}
				<tspan className="fill-zinc-950 dark:fill-white animate-pulse font-normal">
					&#x2588;
				</tspan>
			</text>
		</svg>
	);
}

function CliCard() {
	return (
		<div className="grid gap-px md:grid-rows-[196px_280px]">
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
			<div className="flex min-h-[280px] flex-col rounded-[4px] bg-white p-4 sm:p-5 md:min-h-0 md:px-5 md:py-5 dark:bg-black">
				<div className="flex min-h-0 flex-1 items-center justify-center [&>svg]:max-h-[220px] [&>svg]:w-full">
					<CliDiagram />
				</div>
			</div>
		</div>
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

const SATELLITE_NODES = [
	{
		id: "openai",
		name: "OpenAI / Codex",
		x: 60,
		y: 130,
		path: OPENAI_PATH,
		wire: "M79 130 H166",
		port: { x: 162, y: 126 },
	},
	{
		id: "claude",
		name: "Anthropic Claude",
		x: 105,
		y: 40,
		path: siClaude.path,
		wire: "M105 59 V76 Q105 82 111 82 H180 Q186 82 186 88 V105",
		port: { x: 182, y: 101 },
	},
	{
		id: "gemini",
		name: "Google Gemini",
		x: 220,
		y: 34,
		path: siGooglegemini.path,
		wire: "M220 53 V105",
		port: { x: 216, y: 101 },
	},
	{
		id: "cursor",
		name: "Cursor",
		x: 335,
		y: 40,
		path: siCursor.path,
		wire: "M335 59 V76 Q335 82 329 82 H260 Q254 82 254 88 V105",
		port: { x: 250, y: 101 },
	},
	{
		id: "mistral",
		name: "Mistral AI",
		x: 105,
		y: 220,
		path: siMistralai.path,
		wire: "M105 201 V184 Q105 178 111 178 H180 Q186 178 186 172 V155",
		port: { x: 182, y: 151 },
	},
	{
		id: "ollama",
		name: "Ollama",
		x: 220,
		y: 226,
		path: siOllama.path,
		wire: "M220 207 V155",
		port: { x: 216, y: 151 },
	},
	{
		id: "openrouter",
		name: "OpenRouter",
		x: 335,
		y: 220,
		path: siOpenrouter.path,
		wire: "M335 201 V184 Q335 178 329 178 H260 Q254 178 254 172 V155",
		port: { x: 250, y: 151 },
	},
];

function McpDiagram() {
	const line = "#ebebeb";
	const port = "#d4d4d8";

	return (
		<svg
			viewBox="0 0 500 260"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="h-auto w-full"
			aria-hidden
		>
			{/* base wire paths from satellite agents to MCP */}
			<g
				stroke={line}
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="stroke-[#ebebeb] dark:stroke-white/15"
			>
				{SATELLITE_NODES.map((item) => (
					<path key={`wire-${item.id}`} d={item.wire} />
				))}
				{/* bridge wire connecting MCP Server to Reloop API */}
				<path d="M274 130 H366" />
			</g>

			{/* terminal port chips on the central MCP pill */}
			<g fill={port} className="fill-zinc-300 dark:fill-white/25">
				{SATELLITE_NODES.map((item) => (
					<rect
						key={`port-${item.id}`}
						x={item.port.x}
						y={item.port.y}
						width="8"
						height="8"
						rx="1.5"
					/>
				))}
				{/* MCP right port to Reloop API */}
				<rect x="270" y="126" width="8" height="8" rx="1.5" />
				{/* Reloop API left port receiving from MCP */}
				<rect x="362" y="126" width="8" height="8" rx="1.5" />
			</g>

			{/* central MCP Server pill */}
			<rect
				x="166"
				y="105"
				width="108"
				height="50"
				rx="14"
				fill="#ffffff"
				stroke={line}
				strokeWidth="1.5"
				className="fill-white stroke-[#ebebeb] dark:fill-[#161619] dark:stroke-white/15"
			/>

			{/* MCP Icon */}
			<svg
				x="210"
				y="111"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				className="fill-zinc-950 dark:fill-white"
			>
				<path d={siModelcontextprotocol.path} />
			</svg>
			<text
				x="220"
				y="145"
				textAnchor="middle"
				fontSize="11"
				fontWeight="600"
				letterSpacing="-0.02em"
				className="fill-zinc-950 font-sans tracking-tight dark:fill-white"
			>
				MCP Server
			</text>

			{/* right-side data pill — where MCP connects */}
			<rect
				x="366"
				y="105"
				width="108"
				height="50"
				rx="14"
				fill="#ffffff"
				stroke={line}
				strokeWidth="1.5"
				className="fill-white stroke-[#ebebeb] dark:fill-[#161619] dark:stroke-white/15"
			/>

			{/* database / server icon */}
			<svg
				x="410"
				y="111"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="stroke-zinc-950 dark:stroke-white"
				aria-hidden
			>
				<ellipse cx="12" cy="5" rx="8" ry="3" />
				<path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
				<path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
			</svg>
			<text
				x="420"
				y="145"
				textAnchor="middle"
				fontSize="11"
				fontWeight="600"
				letterSpacing="-0.02em"
				className="fill-zinc-950 font-sans tracking-tight dark:fill-white"
			>
				Your Data
			</text>

			{/* outer satellite nodes */}
			{SATELLITE_NODES.map((item) => (
				<g key={item.id} className="group/node cursor-pointer">
					<title>{item.name}</title>

					{/* node circle */}
					<circle
						cx={item.x}
						cy={item.y}
						r="19"
						fill="#ffffff"
						stroke={line}
						strokeWidth="1.5"
						className="fill-white stroke-[#ebebeb] transition-all duration-200 group-hover/node:stroke-zinc-950 dark:fill-[#161619] dark:stroke-white/15 dark:group-hover/node:stroke-white"
					/>

					{/* brand icon */}
					<svg
						x={item.x - 9}
						y={item.y - 9}
						width="18"
						height="18"
						viewBox="0 0 24 24"
						className="fill-zinc-700 transition-colors duration-200 group-hover/node:fill-zinc-950 dark:fill-zinc-300 dark:group-hover/node:fill-white"
					>
						<path d={item.path} />
					</svg>
				</g>
			))}
		</svg>
	);
}

function McpCard() {
	return (
		<div className="grid gap-px md:grid-rows-[196px_280px]">
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
							fill="currentColor"
							className="text-zinc-400 dark:text-zinc-500"
							aria-hidden
						>
							<path d={siModelcontextprotocol.path} />
						</svg>
					}
					title="MCP Server"
					lede="Connect Reloop to your AI agent."
					description="Let Claude, Cursor, or Codex send and manage email."
				/>
			</div>
			<div className="flex min-h-[280px] flex-col rounded-[4px] bg-white p-4 sm:p-5 md:min-h-0 md:px-5 md:py-5 dark:bg-black">
				<div className="flex min-h-0 flex-1 items-center justify-center [&>svg]:max-h-[240px] [&>svg]:w-full">
					<McpDiagram />
				</div>
			</div>
		</div>
	);
}

export function AgentCards() {
	return (
		<section
			id="integrations"
			aria-label="Four ways to use Reloop"
			className="w-full overflow-hidden border-[#ebebeb] border-y bg-white dark:border-[#292929] dark:bg-black"
		>
			<div className="grid w-full grid-cols-[minmax(24px,1fr)_minmax(0,1280px)_minmax(24px,1fr)] gap-px bg-[#ebebeb] max-[1279px]:grid-cols-[24px_minmax(0,1fr)_24px] max-[479px]:grid-cols-[8px_minmax(0,1fr)_8px] dark:bg-[#292929]">
				<div aria-hidden className="col-start-1 max-[1279px]:hidden">
					<div
						data-grid-content
						className="h-full rounded-[4px] bg-white dark:bg-black"
					/>
				</div>
				<div className="col-start-2 grid grid-cols-10 gap-px bg-[#ebebeb] dark:bg-[#292929]">
					<div
						aria-hidden
						data-grid-content
						className="rounded-[4px] bg-white max-[1279px]:hidden dark:bg-black"
					/>
					<div className="col-span-8 grid gap-px max-[1279px]:col-[1/-1] md:grid-cols-2">
						<McpCard />
						<CliCard />
					</div>
					<div
						aria-hidden
						data-grid-content
						className="rounded-[4px] bg-white max-[1279px]:hidden dark:bg-black"
					/>
				</div>
				<div aria-hidden className="col-start-3 max-[1279px]:hidden">
					<div
						data-grid-content
						className="h-full rounded-[4px] bg-white dark:bg-black"
					/>
				</div>
			</div>
		</section>
	);
}
