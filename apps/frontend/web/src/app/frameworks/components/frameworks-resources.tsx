import { cn } from "@reloop/ui/cn";
import Link from "next/link";
import type { ReactNode } from "react";
import { LanguageIcon } from "../../languages/components/language-icon";
import { languages } from "../../languages/languages";

type Prerequisite = {
	title: string;
	body: string;
	href: string;
	visual: ReactNode;
};

function DotGrid() {
	return (
		<div
			aria-hidden
			className="pointer-events-none absolute inset-0 text-text-strong-950/[0.14] dark:text-white/[0.14]"
			style={{
				backgroundImage:
					"radial-gradient(circle, currentColor 1px, transparent 1px)",
				backgroundSize: "16px 16px",
				maskImage:
					"radial-gradient(ellipse at 50% 45%, black 15%, transparent 72%)",
				WebkitMaskImage:
					"radial-gradient(ellipse at 50% 45%, black 15%, transparent 72%)",
			}}
		/>
	);
}

/** Floating field-list mock — API key setup */
function ApiKeyVisual() {
	const rows = [
		{ label: "API key", value: "rl_live_••••••••", active: true },
		{ label: "Environment", value: "Production", active: false },
		{ label: "Permission", value: "Send only", active: false },
	];

	return (
		<div className="w-full max-w-[260px] overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-black dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
			<div className="flex items-center justify-between border-stroke-soft-200 border-b px-3.5 py-2.5 dark:border-white/10">
				<span className="font-medium text-[11px] text-text-sub-600 dark:text-white/45">
					Credentials
				</span>
				<span className="flex size-5 items-center justify-center rounded-md border border-stroke-soft-200 text-text-sub-600 dark:border-white/10 dark:text-white/40">
					<svg
						width="10"
						height="10"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.25"
						strokeLinecap="round"
						aria-hidden
					>
						<path d="M12 5v14M5 12h14" />
					</svg>
				</span>
			</div>
			<ul className="divide-y divide-stroke-soft-200 dark:divide-white/10">
				{rows.map((row) => (
					<li
						key={row.label}
						className={cn(
							"flex items-center justify-between gap-3 px-3.5 py-2.5",
							row.active && "bg-bg-weak-50 dark:bg-white/[0.04]",
						)}
					>
						<span className="flex min-w-0 items-center gap-2">
							<span className="flex size-5 shrink-0 items-center justify-center rounded-md border border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/50">
								<svg
									width="10"
									height="10"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									aria-hidden
								>
									<rect x="3" y="11" width="18" height="11" rx="2" />
									<path d="M7 11V7a5 5 0 0 1 10 0v4" />
								</svg>
							</span>
							<span className="truncate text-[12px] text-text-strong-950 dark:text-white">
								{row.label}
							</span>
						</span>
						<span className="shrink-0 font-mono text-[10.5px] text-text-sub-600 dark:text-white/45">
							{row.value}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}

/** Floating domain list with verify toggles */
function DomainVisual() {
	const rows = [
		{ domain: "yourdomain.com", on: true },
		{ domain: "mail.yourdomain.com", on: true },
		{ domain: "staging.yourdomain.com", on: false },
	];

	return (
		<div className="w-full max-w-[260px] overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-black dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
			<div className="flex items-center justify-between border-stroke-soft-200 border-b px-3.5 py-2.5 dark:border-white/10">
				<span className="font-medium text-[11px] text-text-sub-600 dark:text-white/45">
					Sending domains
				</span>
				<span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-[10px] text-emerald-600 dark:text-emerald-400">
					<span className="size-1.5 rounded-full bg-emerald-500" />
					Verified
				</span>
			</div>
			<ul className="space-y-0 p-2.5">
				{rows.map((row) => (
					<li
						key={row.domain}
						className="flex items-center justify-between gap-3 rounded-xl px-2.5 py-2"
					>
						<span
							className={cn(
								"truncate font-medium text-[12px] tracking-tight",
								row.on
									? "text-text-strong-950 dark:text-white"
									: "text-text-sub-600/50 dark:text-white/30",
							)}
						>
							{row.domain}
						</span>
						<span
							className={cn(
								"relative h-5 w-9 shrink-0 rounded-full",
								row.on
									? "bg-primary-base"
									: "bg-stroke-soft-200 dark:bg-white/15",
							)}
							aria-hidden
						>
							<span
								className={cn(
									"absolute top-0.5 size-4 rounded-full bg-white shadow-sm",
									row.on ? "left-4" : "left-0.5",
								)}
							/>
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}

/** Floating language / SDK picker */
function LanguageVisual() {
	const previewLangs = languages.slice(0, 6);

	return (
		<div className="w-full max-w-[260px] overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-black dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
			<div className="border-stroke-soft-200 border-b px-3.5 py-2.5 dark:border-white/10">
				<span className="font-medium text-[11px] text-text-sub-600 dark:text-white/45">
					Official SDKs
				</span>
			</div>
			<div className="grid grid-cols-3 gap-2 p-3">
				{previewLangs.map((lang) => (
					<span
						key={lang.slug}
						className="flex flex-col items-center gap-1.5 rounded-xl border border-stroke-soft-200 bg-bg-weak-50/80 px-2 py-2.5 dark:border-white/10 dark:bg-white/[0.03]"
					>
						<span
							className="inline-flex size-7 items-center justify-center"
							style={{ color: `#${lang.icon.hex}` }}
						>
							<LanguageIcon icon={lang.icon} className="size-4" />
						</span>
						<span className="truncate text-center font-medium text-[10px] text-text-sub-600 dark:text-white/50">
							{lang.name}
						</span>
					</span>
				))}
			</div>
		</div>
	);
}

const prerequisites: Prerequisite[] = [
	{
		title: "An API key.",
		body: "Create a free account and copy a key. Drop it in your env—never commit the real value.",
		href: "/dashboard/signup",
		visual: <ApiKeyVisual />,
	},
	{
		title: "A sending domain.",
		body: "Pick the domain you want to send from and verify it so mail lands in the inbox, not spam.",
		href: "/docs/learn/domain",
		visual: <DomainVisual />,
	},
	{
		title: "A language.",
		body: "Choose the SDK for your stack—Node, Python, Go, PHP, Ruby, and more—or call the REST API.",
		href: "#sdk-guides",
		visual: <LanguageVisual />,
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
						Three things. Then send from any framework with the official SDK.
					</p>
				</div>

				{/* Three columns */}
				<div className="grid grid-cols-1 divide-y divide-stroke-soft-200 border-stroke-soft-200 border-t sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-white/10 dark:border-white/10">
					{prerequisites.map((step) => {
						const className =
							"group flex min-h-0 cursor-pointer flex-col px-5 pb-10 pt-8 transition-colors duration-200 hover:bg-bg-weak-50/50 sm:px-7 sm:pb-12 sm:pt-10 dark:hover:bg-white/[0.02]";

						const content = (
							<>
								{/* Visual — floating mock on soft dot grid */}
								<div className="relative mb-8 flex min-h-[240px] flex-1 items-center justify-center sm:min-h-[260px]">
									<DotGrid />
									<div className="pointer-events-none relative z-10 w-full max-w-[260px]">
										{step.visual}
									</div>
								</div>

								{/* Copy under the mock */}
								<div className="relative z-10">
									<h3 className="font-semibold text-[16px] text-text-strong-950 tracking-tight sm:text-[17px] dark:text-white">
										{step.title}
									</h3>
									<p className="mt-2 max-w-[28ch] text-[13.5px] text-text-sub-600 leading-relaxed sm:text-[14px] dark:text-white/55">
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
