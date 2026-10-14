import { cn } from "@reloop/ui/cn";
import { EnterIcon } from "@reloop/ui/enter-icon";
import { Icon } from "@reloop/ui/icon";
import { MCP_PAGE_PATH } from "@reloop/web/lib/landing/ai-tools/mcp";
import Link from "next/link";
import type { ReactNode } from "react";
import { SectionSeparator } from "../../../(home)/components/section-separator";
import { toolPath } from "../../../tools/email-html-editor/content";

const mockCard =
	"w-full max-w-[420px] rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-white/[0.03] dark:shadow-black/40";

function Cursor({
	name,
	color,
	className,
}: {
	name: string;
	color: string;
	className?: string;
}) {
	return (
		<span aria-hidden className={cn("absolute flex items-start", className)}>
			<svg viewBox="0 0 16 16" className="size-4" style={{ color }}>
				<path
					d="M2 1.5 13.5 7 8 8.5 6 14 2 1.5Z"
					fill="currentColor"
					stroke="white"
					strokeWidth="1.2"
					strokeLinejoin="round"
				/>
			</svg>
			<span
				className="-ml-0.5 mt-3 rounded-md px-1.5 py-0.5 font-medium text-[11px] text-white shadow-sm"
				style={{ backgroundColor: color }}
			>
				{name}
			</span>
		</span>
	);
}

function Avatar({ initial, color }: { initial: string; color: string }) {
	return (
		<span
			className="-ml-1.5 flex size-6 items-center justify-center rounded-full font-semibold text-[10.5px] text-white ring-2 ring-bg-white-0 first:ml-0 dark:ring-black"
			style={{ backgroundColor: color }}
		>
			{initial}
		</span>
	);
}

function CollaborationMock() {
	return (
		<div className={cn(mockCard, "relative")}>
			<div className="flex items-center justify-between border-stroke-soft-100 border-b px-4 py-2.5 dark:border-white/10">
				<span className="font-medium text-[12.5px] text-text-strong-950 dark:text-white">
					welcome.html
				</span>
				<span className="flex items-center">
					<Avatar initial="M" color="#7c3aed" />
					<Avatar initial="L" color="#0891b2" />
					<Avatar initial="A" color="#ea580c" />
				</span>
			</div>
			<div className="flex flex-col gap-3 px-5 py-5">
				<span className="font-semibold text-[17px] text-text-strong-950 dark:text-white">
					Welcome to Acme,{" "}
					<span className="rounded-sm bg-[#7c3aed]/15 px-0.5">Jordan</span>
				</span>
				<span className="h-2 w-[88%] rounded-full bg-bg-soft-200 dark:bg-white/10" />
				<span className="h-2 w-[70%] rounded-full bg-bg-soft-200 dark:bg-white/10" />
				<span className="mt-1 inline-flex h-8 w-28 items-center justify-center rounded-lg bg-text-strong-950 font-medium text-[12px] text-text-white-0 ring-2 ring-[#0891b2] ring-offset-2 ring-offset-bg-white-0 dark:bg-white dark:text-black dark:ring-offset-black">
					Get started
				</span>
			</div>
			<Cursor name="Maya" color="#7c3aed" className="top-[66px] left-[236px]" />
			<Cursor
				name="Leo"
				color="#0891b2"
				className="bottom-[10px] left-[118px]"
			/>
		</div>
	);
}

function SendMock() {
	return (
		<div className={cn(mockCard, "overflow-hidden")}>
			<div className="flex items-center justify-between border-stroke-soft-100 border-b px-4 py-2.5 dark:border-white/10">
				<span className="font-mono text-[12px] text-text-sub-600 dark:text-white/60">
					POST /api/mail/v1/send
				</span>
				<span className="rounded-md bg-[#16a34a]/10 px-1.5 py-0.5 font-medium font-mono text-[#15803d] text-[11px] dark:text-[#4ade80]">
					200 OK
				</span>
			</div>
			<pre className="overflow-hidden px-4 py-4 font-mono text-[12.5px] text-text-sub-600 leading-[1.7] [font-feature-settings:'calt'_0,'liga'_0] dark:text-white/60">
				{"{\n"}
				{'  "to": "jordan@example.com",\n'}
				{'  "template": {\n'}
				{'    "id": '}
				<span className="text-text-strong-950 dark:text-white">
					"tmpl_k3x9q2v7m1wz"
				</span>
				{",\n"}
				{'    "variables": {\n'}
				{'      "first_name": '}
				<span className="text-text-strong-950 dark:text-white">"Jordan"</span>
				{"\n    }\n  }\n}"}
			</pre>
		</div>
	);
}

const VERSIONS: {
	label: string;
	note: string;
	time: string;
	current?: boolean;
}[] = [
	{ label: "v4", note: "New hero image", time: "Now", current: true },
	{ label: "v3", note: "Shorter subject line", time: "2h ago" },
	{ label: "v2", note: "Updated button copy", time: "Yesterday" },
	{ label: "v1", note: "First version", time: "Mar 12" },
];

function HistoryMock() {
	return (
		<div className={cn(mockCard, "overflow-hidden")}>
			<div className="flex items-center gap-2 border-stroke-soft-100 border-b px-4 py-2.5 dark:border-white/10">
				<Icon
					name="history"
					className="size-3.5 text-text-sub-600 dark:text-white/60"
					aria-hidden
				/>
				<span className="font-medium text-[12.5px] text-text-strong-950 dark:text-white">
					History
				</span>
			</div>
			<ul>
				{VERSIONS.map((v) => (
					<li
						key={v.label}
						className={cn(
							"flex items-center gap-3 border-stroke-soft-100 border-b px-4 py-3 last:border-b-0 dark:border-white/10",
							v.label === "v2" && "bg-bg-weak-50 dark:bg-white/[0.04]",
						)}
					>
						<span className="w-6 font-medium font-mono text-[12px] text-text-soft-400 dark:text-white/40">
							{v.label}
						</span>
						<span className="flex min-w-0 flex-1 flex-col">
							<span className="truncate text-[13px] text-text-strong-950 dark:text-white">
								{v.note}
							</span>
							<span className="text-[11.5px] text-text-soft-400 dark:text-white/40">
								{v.time}
							</span>
						</span>
						{v.current ? (
							<span className="rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-medium text-[11px] text-text-sub-600 dark:bg-white/[0.06] dark:text-white/60">
								Published
							</span>
						) : v.label === "v2" ? (
							<span className="inline-flex items-center gap-1 rounded-md bg-text-strong-950 px-2 py-1 font-medium text-[11px] text-text-white-0 dark:bg-white dark:text-black">
								<Icon name="undo" className="size-3" aria-hidden />
								Restore
							</span>
						) : null}
					</li>
				))}
			</ul>
		</div>
	);
}

const AI_IDEAS = [
	"A welcome email for new users",
	"A password reset with a 30 minute link",
	"A receipt that matches my screenshot",
];

function AiMock() {
	return (
		<div className="flex w-full max-w-[420px] flex-col gap-3">
			<div className="flex items-center gap-2.5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-3.5 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-white/[0.03]">
				<span className="text-[14px] text-text-strong-950 dark:text-white">
					Design an email for
				</span>
				<span className="h-4 w-px animate-pulse bg-text-strong-950 dark:bg-white" />
			</div>
			<div className={cn(mockCard, "overflow-hidden")}>
				<div className="flex items-center gap-2 border-stroke-soft-100 border-b bg-bg-weak-50 px-4 py-2.5 dark:border-white/10 dark:bg-white/[0.04]">
					<Icon
						name="sparkling"
						className="size-3.5 text-text-strong-950 dark:text-white"
						aria-hidden
					/>
					<span className="font-medium text-[12.5px] text-text-strong-950 dark:text-white">
						Ask the agent
					</span>
				</div>
				<ul>
					{AI_IDEAS.map((idea, index) => (
						<li
							key={idea}
							className={cn(
								"flex items-center justify-between gap-3 border-stroke-soft-100 border-b px-4 py-3 text-[13px] last:border-b-0 dark:border-white/10",
								index === 0
									? "text-text-strong-950 dark:text-white"
									: "text-text-sub-600 dark:text-white/55",
							)}
						>
							<span className="truncate">{idea}</span>
							{index === 0 && (
								<kbd className="inline-flex items-center gap-1 rounded-md border border-stroke-soft-200 bg-bg-weak-50 px-1.5 py-0.5 font-sans text-[11px] text-text-sub-600 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/60">
									<EnterIcon /> Enter
								</kbd>
							)}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}

function ChatMock() {
	return (
		<div className={cn(mockCard, "overflow-hidden")}>
			<div className="flex items-center justify-between border-stroke-soft-100 border-b px-4 py-2.5 dark:border-white/10">
				<span className="font-medium text-[12.5px] text-text-strong-950 dark:text-white">
					Your AI assistant
				</span>
				<span className="inline-flex items-center gap-1.5 rounded-full bg-bg-weak-50 px-2 py-0.5 text-[11px] text-text-sub-600 dark:bg-white/[0.06] dark:text-white/60">
					<span className="size-1.5 rounded-full bg-[#16a34a]" />
					Reloop connected
				</span>
			</div>
			<div className="flex flex-col gap-3 px-4 py-4">
				<p className="ml-auto max-w-[88%] rounded-2xl rounded-tr-md bg-bg-weak-50 px-3 py-2 text-[12.5px] text-text-strong-950 leading-relaxed dark:bg-white/[0.06] dark:text-white">
					Make a password reset email for Acme with a 30 minute link and save it
					to Reloop.
				</p>
				<span className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-stroke-soft-100 px-2 py-1 font-mono text-[11.5px] text-text-sub-600 dark:border-white/10 dark:text-white/60">
					<Icon
						name="check"
						className="size-3 text-text-strong-950 dark:text-white"
						aria-hidden
					/>
					reloop · create_template
				</span>
				<div className="flex flex-col gap-2 text-[12.5px] text-text-sub-600 leading-relaxed dark:text-white/60">
					<p>
						Done.{" "}
						<strong className="font-semibold text-text-strong-950 dark:text-white">
							Password reset
						</strong>{" "}
						is saved and published, ready to send by ID.
					</p>
					<span className="flex flex-wrap gap-1.5">
						{["first_name", "reset_url"].map((name) => (
							<code
								key={name}
								className="rounded-md border border-stroke-soft-100 bg-bg-weak-50 px-1.5 py-0.5 font-mono text-[11px] text-text-strong-950 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/80"
							>
								{`{{{${name}}}}`}
							</code>
						))}
					</span>
					<p>Want me to send a test to your inbox?</p>
				</div>
			</div>
		</div>
	);
}

type Feature = {
	id: string;
	icon: string;
	title: string;
	description: ReactNode;
	points: string[];
	link: { label: string; href: string };
	mock: ReactNode;
	/** Faded labels in the tiles above and below the mock. */
	ghost: [string[], string[]];
};

const FEATURES: Feature[] = [
	{
		id: "collaboration",
		icon: "cursor",
		title: "Real-time collaboration",
		description: (
			<>
				Bring design, copy and engineering into{" "}
				<strong>one shared editor</strong>. Everyone works on the same template
				at the same time, so nothing gets lost between tools.
			</>
		),
		points: [
			"Live cursors show who is editing what",
			"Changes appear for everyone instantly",
			"No more passing HTML files around",
		],
		link: { label: "Learn more", href: "/docs/learn/templates" },
		mock: <CollaborationMock />,
		ghost: [
			["Subject", "Preview", "From"],
			["Editors", "Comments", "Status"],
		],
	},
	{
		id: "send",
		icon: "code",
		title: "Send with a template ID",
		description: (
			<>
				Your app sends <strong>a template ID and a few values</strong>. Reloop
				fills in the variables and delivers the latest published version.
			</>
		),
		points: [
			"One API call to send any template",
			"Default values so nothing sends blank",
			"Update copy without shipping code",
		],
		link: {
			label: "Read the API docs",
			href: "/docs/api/mail/post-api-mail-v1send",
		},
		mock: <SendMock />,
		ghost: [
			["Method", "Endpoint", "API key"],
			["Status", "Message ID", "Sent at"],
		],
	},
	{
		id: "history",
		icon: "history",
		title: "Version history",
		description: (
			<>
				Every publish is saved, so you can{" "}
				<strong>go back to any earlier version</strong> the moment something
				looks wrong.
			</>
		),
		points: [
			"Edit drafts without touching live email",
			"Compare two versions side by side",
			"Restore an old version in one click",
		],
		link: { label: "Learn more", href: "/docs/learn/templates" },
		mock: <HistoryMock />,
		ghost: [
			["Draft", "Author", "Edited"],
			["Version", "Published", "Diff"],
		],
	},
	{
		id: "ai-agent",
		icon: "sparkling",
		title: "AI email agent",
		description: (
			<>
				Describe the email you need and{" "}
				<strong>add a screenshot you like</strong>. The agent designs the whole
				email and hands it to you ready to edit.
			</>
		),
		points: [
			"Matches the layout and colors of your image",
			"Adds the variables for you",
			"Checks the quality before you see it",
		],
		link: { label: "Try the editor", href: toolPath },
		mock: <AiMock />,
		ghost: [
			["Prompt", "Image", "Brand"],
			["Layout", "Variables", "Score"],
		],
	},
	{
		id: "ai-tools",
		icon: "agent",
		title: "Build from ChatGPT, Claude or Cursor",
		description: (
			<>
				Skip the editor completely. Connect Reloop to the AI tool you already
				use and <strong>just ask for the email</strong>. It writes the template,
				saves it to Reloop, and can send it for you.
			</>
		),
		points: [
			"Works with any app that supports MCP",
			"Saved as a real template you can edit later",
			"Connect in one command with the Reloop CLI",
		],
		link: { label: "Connect your AI tool", href: MCP_PAGE_PATH },
		mock: <ChatMock />,
		ghost: [
			["Client", "Server", "Signed in"],
			["Tool", "Template", "Status"],
		],
	},
];

const tile = "bg-bg-white-0 dark:bg-black";

/** Faded label + bar rows, like a form peeking out of a neighbouring tile. */
function GhostTile({
	labels,
	fade,
}: {
	labels: string[];
	fade: "top" | "bottom";
}) {
	return (
		<div aria-hidden className={cn(tile, "flex items-center")}>
			<div
				className={cn(
					"flex w-full flex-col justify-center gap-3 px-6 py-5 sm:px-8",
					fade === "top"
						? "[mask-image:linear-gradient(to_bottom,transparent,black_70%)]"
						: "[mask-image:linear-gradient(to_top,transparent,black_70%)]",
				)}
			>
				{labels.map((label, i) => (
					<span key={label} className="flex items-center gap-6">
						<span className="w-20 shrink-0 text-[13.5px] text-text-sub-600 dark:text-white/50">
							{label}
						</span>
						<span
							className="h-2 rounded-full bg-bg-soft-200 dark:bg-white/10"
							style={{ width: `${30 + i * 18}%` }}
						/>
					</span>
				))}
			</div>
		</div>
	);
}

function FeatureBlock({
	feature,
	flipped,
}: {
	feature: Feature;
	flipped: boolean;
}) {
	return (
		<section
			id={`feature-${feature.id}`}
			aria-labelledby={`feature-${feature.id}-heading`}
			className="grid bg-bg-white-0 lg:grid-cols-2 dark:bg-black"
		>
			<div
				className={cn(
					"flex flex-col items-start px-4 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20",
					flipped && "lg:order-2",
				)}
			>
				<span className="flex size-12 items-center justify-center rounded-full border border-stroke-soft-100 bg-bg-white-0 text-text-strong-950 shadow-[0_6px_20px_-8px_rgba(15,23,42,0.2)] dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
					<Icon name={feature.icon} className="size-5" aria-hidden />
				</span>
				<h3
					id={`feature-${feature.id}-heading`}
					className="mt-6 text-balance font-semibold text-[1.6rem] text-text-strong-950 leading-[1.15] tracking-tight sm:text-[2rem] dark:text-white"
				>
					{feature.title}
				</h3>
				<p className="mt-4 max-w-[30rem] text-[15px] text-text-sub-600 leading-relaxed sm:text-[16.5px] dark:text-white/60 [&_strong]:font-semibold [&_strong]:text-text-strong-950 dark:[&_strong]:text-white">
					{feature.description}
				</p>
				<ul className="mt-6 mb-10 flex flex-col gap-3">
					{feature.points.map((point) => (
						<li
							key={point}
							className="flex items-center gap-3 text-[15px] text-text-sub-600 sm:text-[15.5px] dark:text-white/65"
						>
							<Icon
								name="check"
								className="size-4 shrink-0 text-text-strong-950 dark:text-white"
								aria-hidden
							/>
							{point}
						</li>
					))}
				</ul>
				<Link
					href={feature.link.href}
					className="mt-auto inline-flex h-9 items-center rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3.5 font-medium text-[13.5px] text-text-strong-950 shadow-xs transition-colors hover:bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
				>
					{feature.link.label}
				</Link>
			</div>

			{/* Tile grid: the mock sits in the center tile, flanked by empty tiles. */}
			<div
				className={cn(
					"grid grid-cols-1 grid-rows-[100px_auto_100px] gap-px border-stroke-soft-100 border-t bg-stroke-soft-100 sm:grid-cols-[1fr_minmax(0,440px)_1fr] lg:border-t-0 dark:border-white/10 dark:bg-white/10",
					flipped ? "lg:order-1 lg:border-r" : "lg:border-l",
				)}
			>
				<div aria-hidden className={cn(tile, "hidden sm:block")} />
				<GhostTile labels={feature.ghost[0]} fade="top" />
				<div aria-hidden className={cn(tile, "hidden sm:block")} />

				<div aria-hidden className={cn(tile, "hidden sm:block")} />
				<div
					className={cn(
						tile,
						"relative flex items-center justify-center px-4 py-8 sm:px-3",
					)}
				>
					<div
						aria-hidden
						className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.07),transparent_65%)]"
					/>
					<div className="relative flex w-full justify-center">
						{feature.mock}
					</div>
				</div>
				<div aria-hidden className={cn(tile, "hidden sm:block")} />

				<div aria-hidden className={cn(tile, "hidden sm:block")} />
				<GhostTile labels={feature.ghost[1]} fade="bottom" />
				<div aria-hidden className={cn(tile, "hidden sm:block")} />
			</div>
		</section>
	);
}

export function FeaturesSection() {
	return (
		<>
			<section
				id="features"
				aria-labelledby="features-heading"
				className="grid w-full gap-4 bg-bg-white-0 px-4 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:items-end lg:gap-12 lg:px-12 dark:bg-black"
			>
				<h2
					id="features-heading"
					className="text-balance font-semibold text-[2rem] text-text-strong-950 leading-[1.1] tracking-tight sm:text-[2.6rem] dark:text-white"
				>
					Everything your team needs to ship emails
				</h2>
				<p className="max-w-xl text-balance text-[15px] text-text-sub-600 leading-relaxed sm:text-[17px] dark:text-white/60">
					Design together, send with one API call, undo any change, and let AI
					make the first draft.
				</p>
			</section>

			{FEATURES.map((feature, index) => (
				<div key={feature.id}>
					<SectionSeparator className="h-24 sm:h-24" />
					<FeatureBlock feature={feature} flipped={index % 2 === 1} />
				</div>
			))}
		</>
	);
}
