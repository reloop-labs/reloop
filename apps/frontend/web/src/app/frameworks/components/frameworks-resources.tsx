import Link from "next/link";
import type { ReactNode } from "react";
import { LanguageIcon } from "../../languages/components/language-icon";
import { frameworks } from "../../languages/frameworks";
import { languages } from "../../languages/languages";

type Prerequisite = {
	step: number;
	title: string;
	body: string;
	href: string;
	visual: ReactNode;
};

/** Step 1 — Dashboard-style API key row */
function ApiKeyVisual() {
	return (
		<div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-black dark:shadow-none">
			<div className="flex items-center justify-between border-stroke-soft-200 border-b px-3.5 py-2.5 dark:border-white/10">
				<span className="font-medium text-[11px] text-text-sub-600 dark:text-white/45">
					API keys
				</span>
				<span className="rounded-md border border-stroke-soft-200 px-2 py-0.5 font-medium text-[10px] text-text-strong-950 dark:border-white/10 dark:text-white">
					Create key
				</span>
			</div>
			<div className="flex items-center gap-3 px-3.5 py-3">
				<span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.04]">
					<svg
						viewBox="0 0 24 24"
						className="size-3.5 text-text-strong-950 dark:text-white"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.75"
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden
					>
						<path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
					</svg>
				</span>
				<div className="min-w-0 flex-1">
					<p className="font-medium text-[12px] text-text-strong-950 dark:text-white">
						Production
					</p>
					<p className="mt-0.5 truncate font-mono text-[11px] text-text-sub-600 dark:text-white/45">
						rl_live_8f3a••••••••c2
					</p>
				</div>
				<span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-[10px] text-emerald-600 dark:text-emerald-400">
					Active
				</span>
			</div>
			<div className="border-stroke-soft-200 border-t px-3.5 py-2 dark:border-white/10">
				<p className="font-mono text-[10.5px] text-text-sub-600 dark:text-white/40">
					RELOOP_API_KEY=rl_live_…
				</p>
			</div>
		</div>
	);
}

/** Step 2 — Domain dashboard with verified DNS */
function DomainVisual() {
	const records = [
		{ name: "SPF", value: "v=spf1 include:_spf.reloop.sh ~all" },
		{ name: "DKIM", value: "reloop._domainkey TXT" },
		{ name: "DMARC", value: "v=DMARC1; p=none; rua=…" },
	];

	return (
		<div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-black dark:shadow-none">
			<div className="flex items-center justify-between border-stroke-soft-200 border-b px-3.5 py-2.5 dark:border-white/10">
				<div className="min-w-0">
					<p className="font-medium text-[12px] text-text-strong-950 dark:text-white">
						send.apple.com
					</p>
					<p className="mt-0.5 font-mono text-[10px] text-text-sub-600 dark:text-white/40">
						Sending domain
					</p>
				</div>
				<span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-[10px] text-emerald-600 dark:text-emerald-400">
					<span className="size-1.5 rounded-full bg-emerald-500" />
					Verified
				</span>
			</div>
			<ul className="divide-y divide-stroke-soft-200 dark:divide-white/10">
				{records.map((row) => (
					<li
						key={row.name}
						className="flex items-center gap-2.5 px-3.5 py-2.5"
					>
						<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
							<svg
								width="10"
								height="10"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="3"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden
							>
								<path d="M20 6 9 17l-5-5" />
							</svg>
						</span>
						<div className="min-w-0 flex-1">
							<p className="font-semibold text-[11px] text-text-strong-950 dark:text-white">
								{row.name}
							</p>
							<p className="truncate font-mono text-[10px] text-text-sub-600 dark:text-white/45">
								{row.value}
							</p>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}

/** Step 3 — Static SDK / language picker grid */
function LanguageVisual() {
	const items = [
		...languages.slice(0, 4).map((lang) => ({
			slug: lang.slug,
			name: lang.name,
			icon: lang.icon,
			meta: lang.installCommand.split(" ").slice(-1)[0] ?? lang.packageName,
		})),
		...frameworks.slice(0, 2).map((fw) => ({
			slug: fw.slug,
			name: fw.name,
			icon: fw.icon,
			meta: fw.languageName,
		})),
	];

	return (
		<div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-black dark:shadow-none">
			<div className="border-stroke-soft-200 border-b px-3.5 py-2.5 dark:border-white/10">
				<p className="font-medium text-[11px] text-text-sub-600 dark:text-white/45">
					Official SDKs
				</p>
			</div>
			<div className="grid grid-cols-3 gap-px bg-stroke-soft-200 dark:bg-white/10">
				{items.map((item) => (
					<div
						key={item.slug}
						className="flex flex-col items-center gap-1.5 bg-bg-white-0 px-2 py-3 dark:bg-black"
					>
						<span
							className="inline-flex size-8 items-center justify-center rounded-lg border border-stroke-soft-200 dark:border-white/10"
							style={{ color: `#${item.icon.hex}` }}
						>
							<LanguageIcon icon={item.icon} className="size-3.5" />
						</span>
						<span className="truncate text-center font-medium text-[10px] text-text-strong-950 dark:text-white">
							{item.name}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

/** Step 4 — Email activity / delivery log row */
function EmailSentVisual() {
	return (
		<div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:border-white/10 dark:bg-black dark:shadow-none">
			<div className="flex items-center justify-between border-stroke-soft-200 border-b px-3.5 py-2.5 dark:border-white/10">
				<span className="font-medium text-[11px] text-text-sub-600 dark:text-white/45">
					Activity
				</span>
				<span className="font-mono text-[10px] text-text-sub-600 dark:text-white/40">
					Just now
				</span>
			</div>
			<div className="px-3.5 py-3">
				<div className="flex items-start gap-2.5">
					<span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-200 bg-bg-weak-50 dark:border-white/10 dark:bg-white/[0.04]">
						<svg
							viewBox="0 0 24 24"
							className="size-3.5 text-text-strong-950 dark:text-white"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.75"
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden
						>
							<path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
							<path d="m3.5 7.5 8.5 6 8.5-6" />
						</svg>
					</span>
					<div className="min-w-0 flex-1">
						<div className="flex items-center justify-between gap-2">
							<p className="truncate font-medium text-[12px] text-text-strong-950 dark:text-white">
								Welcome to Acme
							</p>
							<span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-[10px] text-emerald-600 dark:text-emerald-400">
								<span className="size-1.5 rounded-full bg-emerald-500" />
								Delivered
							</span>
						</div>
						<p className="mt-0.5 truncate text-[11px] text-text-sub-600 dark:text-white/50">
							to hello@customer.com
						</p>
						<p className="mt-1.5 font-mono text-[10px] text-text-sub-600 dark:text-white/40">
							id · msg_01h8k2f9…
						</p>
					</div>
				</div>
			</div>
			<div className="border-stroke-soft-200 border-t px-3.5 py-2 dark:border-white/10">
				<div className="flex items-center gap-3 font-mono text-[10px] text-text-sub-600 dark:text-white/40">
					<span>from · send.apple.com</span>
					<span aria-hidden>·</span>
					<span>200 OK</span>
				</div>
			</div>
		</div>
	);
}

const prerequisites: Prerequisite[] = [
	{
		step: 1,
		title: "An API key.",
		body: "Create a free account and copy a key. Drop it in your env—never commit the real value.",
		href: "/dashboard/signup",
		visual: <ApiKeyVisual />,
	},
	{
		step: 2,
		title: "A sending domain.",
		body: "Pick the domain you want to send from and verify it so mail lands in the inbox, not spam.",
		href: "/docs/learn/domain",
		visual: <DomainVisual />,
	},
	{
		step: 3,
		title: "A language.",
		body: "Choose the SDK for your stack—Node, Python, Go, PHP, Ruby, and more—or call the REST API.",
		href: "#sdk-guides",
		visual: <LanguageVisual />,
	},
	{
		step: 4,
		title: "An email sent.",
		body: "Call send once. Reloop delivers the message and returns an id you can track end to end.",
		href: "/docs/quickstart",
		visual: <EmailSentVisual />,
	},
];

export default function FrameworksResources() {
	return (
		<section className="relative w-full max-w-full overflow-x-clip border-stroke-soft-200 border-t bg-bg-white-0 text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white">
			<div className="relative mx-auto w-full max-w-5xl border-stroke-soft-200 border-x md:max-w-7xl dark:border-white/10">
				{/* Header */}
				<div className="px-6 py-12 text-left sm:px-10 sm:py-14 lg:px-12">
					<h2 className="font-semibold text-text-strong-950 text-xl tracking-tight sm:text-2xl lg:text-[1.65rem] dark:text-white">
						All you need to get started.
					</h2>
					<p className="mt-2 max-w-lg text-[13.5px] text-text-sub-600 sm:text-[14.5px] dark:text-white/60">
						Four things. Then send from any framework with the official SDK.
					</p>
				</div>

				{/* 2×2 grid */}
				<div className="grid grid-cols-1 gap-px border-stroke-soft-200 border-t bg-stroke-soft-200 sm:grid-cols-2 dark:border-white/10 dark:bg-white/10">
					{prerequisites.map((step) => {
						const className =
							"group relative flex min-h-0 cursor-pointer flex-col overflow-hidden bg-bg-white-0 px-5 pb-10 pt-8 transition-colors duration-200 hover:bg-bg-weak-50/80 sm:px-8 sm:pb-12 sm:pt-10 lg:px-10 dark:bg-black dark:hover:bg-white/[0.03]";

						const content = (
							<>
								<p className="relative z-10 font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.08em] dark:text-white/45">
									[step {step.step}]
								</p>

								{/* Visual — static product UI mock */}
								<div className="relative z-10 mt-5 mb-8 flex min-h-[220px] flex-1 items-center justify-center sm:min-h-[240px]">
									<div className="pointer-events-none w-full max-w-[300px]">
										{step.visual}
									</div>
								</div>

								<div className="relative z-10">
									<h3 className="font-semibold text-[16px] text-text-strong-950 tracking-tight sm:text-[17px] dark:text-white">
										{step.title}
									</h3>
									<p className="mt-2 max-w-[36ch] text-[13.5px] text-text-sub-600 leading-relaxed sm:text-[14px] dark:text-white/55">
										{step.body}
									</p>
								</div>
							</>
						);

						if (step.href.startsWith("#")) {
							return (
								<a key={step.title} href={step.href} className={className}>
									{content}
								</a>
							);
						}

						return (
							<Link key={step.title} href={step.href} className={className}>
								{content}
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
}
