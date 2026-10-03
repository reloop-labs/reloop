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

const SATELLITE_NODES = [
	{
		id: "mcp",
		name: "Model Context Protocol",
		x: 48,
		y: 130,
		path: siModelcontextprotocol.path,
		wire: "M68 130 H138",
		port: { x: 134, y: 126 },
		isMcp: true,
	},
	{
		id: "claude",
		name: "Anthropic Claude",
		x: 105,
		y: 45,
		path: siClaude.path,
		wire: "M105 65 V84 H155 V102",
		port: { x: 151, y: 98 },
	},
	{
		id: "gemini",
		name: "Google Gemini",
		x: 200,
		y: 38,
		path: siGooglegemini.path,
		wire: "M200 58 V102",
		port: { x: 196, y: 98 },
	},
	{
		id: "cursor",
		name: "Cursor",
		x: 295,
		y: 45,
		path: siCursor.path,
		wire: "M295 65 V84 H245 V102",
		port: { x: 241, y: 98 },
	},
	{
		id: "openai",
		name: "OpenAI",
		x: 352,
		y: 130,
		path: OPENAI_PATH,
		wire: "M332 130 H262",
		port: { x: 258, y: 126 },
	},
	{
		id: "openrouter",
		name: "OpenRouter",
		x: 295,
		y: 215,
		path: siOpenrouter.path,
		wire: "M295 195 V176 H245 V158",
		port: { x: 241, y: 154 },
	},
	{
		id: "ollama",
		name: "Ollama",
		x: 200,
		y: 222,
		path: siOllama.path,
		wire: "M200 202 V158",
		port: { x: 196, y: 154 },
	},
	{
		id: "mistral",
		name: "Mistral AI",
		x: 105,
		y: 215,
		path: siMistralai.path,
		wire: "M105 195 V176 H155 V158",
		port: { x: 151, y: 154 },
	},
];

function McpDiagram() {
	const line = "#ebebeb";
	const accent = "#006ffe";

	return (
		<svg
			viewBox="0 0 400 260"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className="h-auto w-full"
			aria-hidden
		>
			{/* base wire paths */}
			<g
				stroke={line}
				strokeWidth="1.5"
				className="stroke-[#ebebeb] dark:stroke-white/15"
			>
				{SATELLITE_NODES.map((item) => (
					<path key={`wire-${item.id}`} d={item.wire} />
				))}
			</g>

			{/* animated signal data flow pulses */}
			<g stroke={accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
				{SATELLITE_NODES.map((item) => (
					<path
						key={`pulse-${item.id}`}
						d={item.wire}
						strokeDasharray="4 16"
					>
						<animate
							attributeName="stroke-dashoffset"
							from="20"
							to="0"
							dur="2.5s"
							repeatCount="indefinite"
						/>
					</path>
				))}
			</g>

			{/* terminal port chips on the central pill */}
			<g fill={accent}>
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
			</g>

			{/* central Reloop API pill */}
			<rect
				x="138"
				y="102"
				width="124"
				height="56"
				rx="14"
				fill="#ffffff"
				stroke={line}
				strokeWidth="1.5"
				className="fill-white stroke-[#ebebeb] dark:fill-[#18181b] dark:stroke-white/15"
			/>

			{/* Reloop mark */}
			<svg
				x="189"
				y="107"
				width="22"
				height="22"
				viewBox="0 0 200 200"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className="overflow-visible"
			>
				<rect x={55} y={51} width={83} height={8} className="fill-[#2C2C2C] dark:fill-[#D2D2D2]" />
				<rect x={55} y={59} width={75} height={8} transform="rotate(90 55 59)" className="fill-[#2C2C2C] dark:fill-[#D2D2D2]" />
				<rect x={146} y={59} width={46} height={8} transform="rotate(90 146 59)" className="fill-[#2C2C2C] dark:fill-[#D2D2D2]" />
				<rect x={154} y={69} width={44} height={8} transform="rotate(90 154 69)" className="fill-[#2C2C2C] dark:fill-[#D2D2D2]" />
				<rect x={138} y={59} width={46} height={8} transform="rotate(90 138 59)" className="fill-[#4D4D4D] dark:fill-[#878787]" />
				<rect x={130} y={59} width={46} height={8} transform="rotate(90 130 59)" className="fill-[#4D4D4D] dark:fill-[#878787]" />
				<rect x={90} y={105} width={29} height={8} transform="rotate(90 90 105)" className="fill-[#4D4D4D] dark:fill-[#878787]" />
				<rect x={82} y={105} width={29} height={8} transform="rotate(90 82 105)" className="fill-[#4D4D4D] dark:fill-[#878787]" />
				<rect x={138} y={105} width={8} height={8} transform="rotate(90 138 105)" className="fill-[#2C2C2C] dark:fill-[#D2D2D2]" />
				<rect x={146} y={105} width={8} height={8} transform="rotate(90 146 105)" className="fill-[#2C2C2C] dark:fill-[#D2D2D2]" />
				<rect x={146} y={134} width={8} height={8} transform="rotate(90 146 134)" className="fill-[#2C2C2C] dark:fill-[#D2D2D2]" />
				<rect x={130} y={105} width={8} height={8} transform="rotate(90 130 105)" className="fill-[#4D4D4D] dark:fill-[#878787]" />
				<rect x={122} y={105} width={8} height={8} transform="rotate(90 122 105)" className="fill-[#4D4D4D] dark:fill-[#878787]" />
				<rect x={98} y={77} width={10} height={8} transform="rotate(90 98 77)" className="fill-[#2C2C2C] dark:fill-[#D2D2D2]" />
				<rect x={90} y={77} width={10} height={8} transform="rotate(90 90 77)" className="fill-[#4D4D4D] dark:fill-[#878787]" />
				<rect x={82} y={77} width={10} height={8} transform="rotate(90 82 77)" className="fill-[#4D4D4D] dark:fill-[#878787]" />
				<rect x={146} y={113} width={21} height={8} transform="rotate(90 146 113)" className="fill-[#2C2C2C] dark:fill-[#D2D2D2]" />
				<rect x={154} y={122} width={20} height={8} transform="rotate(90 154 122)" className="fill-[#2C2C2C] dark:fill-[#D2D2D2]" />
				<rect x={138} y={113} width={21} height={8} transform="rotate(90 138 113)" className="fill-[#4D4D4D] dark:fill-[#878787]" />
				<rect x={130} y={113} width={21} height={8} transform="rotate(90 130 113)" className="fill-[#4D4D4D] dark:fill-[#878787]" />
				<rect x={98} y={113} width={21} height={8} transform="rotate(90 98 113)" className="fill-[#2C2C2C] dark:fill-[#D2D2D2]" />
				<rect x={55} y={134} width={83} height={8} className="fill-[#2C2C2C] dark:fill-[#D2D2D2]" />
				<rect x={63} y={142} width={83} height={8} className="fill-[#2C2C2C] dark:fill-[#D2D2D2]" />
			</svg>
			<text
				x="200"
				y="146"
				textAnchor="middle"
				fontSize="11"
				fontWeight="600"
				letterSpacing="-0.02em"
				className="fill-zinc-950 font-sans tracking-tight dark:fill-white"
			>
				Reloop API
			</text>

			{/* outer satellite nodes */}
			{SATELLITE_NODES.map((item) => (
				<g key={item.id} className="group/node cursor-pointer">
					<title>{item.name}</title>

					{/* subtle pulsing outer ring for MCP */}
					{item.isMcp && (
						<circle
							cx={item.x}
							cy={item.y}
							r="24"
							fill="none"
							stroke="#006ffe"
							strokeWidth="1"
							strokeDasharray="3 3"
							opacity="0.45"
							className="animate-[spin_12s_linear_infinite]"
							style={{ transformOrigin: `${item.x}px ${item.y}px` }}
						/>
					)}

					{/* node circle */}
					<circle
						cx={item.x}
						cy={item.y}
						r="20"
						fill="#ffffff"
						stroke={item.isMcp ? "#006ffe" : line}
						strokeWidth="1.5"
						className={`fill-white stroke-[#ebebeb] transition-all duration-200 group-hover/node:stroke-blue-500 dark:fill-[#1d1d20] dark:stroke-white/15 ${
							item.isMcp ? "stroke-blue-500 dark:stroke-blue-400" : ""
						}`}
					/>

					{/* brand icon */}
					<svg
						x={item.x - 10}
						y={item.y - 10}
						width="20"
						height="20"
						viewBox="0 0 24 24"
						className={`transition-colors duration-200 ${
							item.isMcp
								? "fill-blue-600 dark:fill-blue-400"
								: "fill-zinc-800 group-hover/node:fill-blue-600 dark:fill-zinc-200 dark:group-hover/node:fill-blue-400"
						}`}
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
							fill="currentColor"
							className="text-zinc-400 group-hover:text-blue-500 dark:text-zinc-500 dark:group-hover:text-blue-400 transition-colors"
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
