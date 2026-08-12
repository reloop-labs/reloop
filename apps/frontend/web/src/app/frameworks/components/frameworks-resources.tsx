import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import type { ReactNode } from "react";
import type { BrandIcon } from "../../languages/components/language-icon";
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

/**
 * Auth-style graph for API key:
 * top request pill → shield node → horizontal dashed timeline
 */
function ApiKeyVisual() {
	const timelineDots = [0, 1, 2, 3, 4] as const;

	return (
		<div className="relative mx-auto flex w-full max-w-[240px] flex-col items-center py-1">
			{/* Top — API key as request pill */}
			<div className="relative z-10 inline-flex items-center gap-1.5 rounded-full border border-stroke-soft-200 bg-bg-white-0 px-3 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:border-white/15 dark:bg-black dark:shadow-none">
				<span className="rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-text-sub-600 dark:bg-white/[0.06] dark:text-white/50">
					KEY
				</span>
				<code className="font-mono text-[11.5px] text-text-strong-950 tracking-tight dark:text-white">
					rl_live_••••
				</code>
			</div>

			{/* Vertical dashed connector */}
			<div
				aria-hidden
				className="h-8 w-px border-stroke-soft-300 border-l border-dashed dark:border-white/20"
			/>

			{/* Center — shield / authorized */}
			<div className="relative z-10 flex size-14 items-center justify-center rounded-full border border-stroke-soft-200 bg-bg-white-0 shadow-[0_2px_12px_rgba(0,0,0,0.05)] ring-[6px] ring-stroke-soft-200/50 dark:border-white/15 dark:bg-black dark:shadow-none dark:ring-white/10">
				<svg
					viewBox="0 0 24 24"
					className="size-6 text-text-strong-950 dark:text-white"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.6"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden
				>
					<path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
					<path d="m9.5 12 1.8 1.8L15 10" />
				</svg>
			</div>

			{/* Vertical dashed connector into timeline */}
			<div
				aria-hidden
				className="h-8 w-px border-stroke-soft-300 border-l border-dashed dark:border-white/20"
			/>

			{/* Bottom — horizontal dashed timeline with nodes */}
			<div className="relative flex w-full max-w-[200px] items-center justify-between">
				{/* Dashed line through centers of dots */}
				<div
					aria-hidden
					className="absolute top-1/2 right-1 left-1 h-px -translate-y-1/2 border-stroke-soft-300 border-t border-dashed dark:border-white/20"
				/>
				{timelineDots.map((i) => (
					<span
						key={i}
						aria-hidden
						className={
							i === 2
								? "relative z-10 size-2.5 rounded-full border-2 border-stroke-soft-300 bg-bg-white-0 dark:border-white/30 dark:bg-black"
								: "relative z-10 size-1.5 rounded-full bg-stroke-soft-300 dark:bg-white/25"
						}
					/>
				))}
			</div>
		</div>
	);
}

/**
 * Domain visual — same background language as the blog product CTA card:
 * grey diagonal hatch, concentric orbital rings, soft blue glow.
 */
function DomainVisual() {
	return (
		<div className="relative mx-auto flex aspect-[16/10] w-full max-w-[280px] items-center justify-center overflow-hidden rounded-xl bg-bg-weak-50/40 p-3.5 text-text-strong-950 dark:bg-neutral-900/30 dark:text-white">
			{/* Subtle grey diagonal hatch pattern */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
				style={{
					backgroundImage:
						"repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 10px)",
				}}
			/>

			{/* Subtle grey concentric orbital & dotted rings */}
			<svg
				className="pointer-events-none absolute inset-0 size-full text-text-strong-950/[0.05] dark:text-white/[0.06]"
				viewBox="0 0 200 120"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden
			>
				<circle
					cx="100"
					cy="60"
					r="28"
					stroke="currentColor"
					strokeDasharray="3 3"
				/>
				<circle
					cx="100"
					cy="60"
					r="54"
					stroke="currentColor"
					strokeWidth="0.75"
				/>
				<circle
					cx="100"
					cy="60"
					r="82"
					stroke="currentColor"
					strokeDasharray="4 4"
				/>
			</svg>

			{/* Ultra subtle blue glow */}
			<div
				aria-hidden
				className="pointer-events-none absolute size-32 rounded-full bg-gradient-to-tr from-blue-500/[0.06] via-sky-400/[0.04] to-indigo-500/[0.04] blur-2xl dark:from-blue-500/[0.08] dark:via-sky-400/[0.06] dark:to-indigo-500/[0.06]"
			/>

			{/* Globe + domain label */}
			<div className="relative z-10 flex flex-col items-center gap-2.5">
				<div className="flex size-12 items-center justify-center rounded-full border border-stroke-soft-200/80 bg-bg-white-0 shadow-sm dark:border-white/15 dark:bg-black/60">
					<Icon
						name="globe"
						className="size-5 text-text-strong-950 dark:text-white"
						aria-hidden
					/>
				</div>
				<span className="rounded-full border border-stroke-soft-200/80 bg-bg-white-0/90 px-3 py-1 font-mono text-[11.5px] text-text-strong-950 tracking-tight shadow-sm dark:border-white/15 dark:bg-black/70 dark:text-white">
					send.apple.com
				</span>
			</div>
		</div>
	);
}

type MarqueeItem = {
	slug: string;
	name: string;
	icon: BrandIcon;
};

function MarqueeChip({ item }: { item: MarqueeItem }) {
	return (
		<span
			className="inline-flex size-10 shrink-0 items-center justify-center rounded-[12px] border border-stroke-soft-200 bg-bg-white-0 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:border-white/10 dark:bg-white/[0.04]"
			style={{ color: `#${item.icon.hex}` }}
			title={item.name}
		>
			<LanguageIcon icon={item.icon} className="size-4" />
		</span>
	);
}

/**
 * Infinite horizontal marquee row.
 * Duplicates items so `translateX(-50%)` loops seamlessly.
 */
function MarqueeRow({
	items,
	reverse = false,
	duration = 28,
}: {
	items: MarqueeItem[];
	reverse?: boolean;
	duration?: number;
}) {
	const loop = [...items, ...items];

	return (
		<div className="flex overflow-hidden">
			<div
				className="flex w-max gap-2.5 pr-2.5 will-change-transform motion-reduce:animate-none"
				style={{
					animation: `infinite-scroll ${duration}s linear infinite`,
					animationDirection: reverse ? "reverse" : "normal",
				}}
			>
				{loop.map((item, i) => (
					<MarqueeChip key={`${item.slug}-${i}`} item={item} />
				))}
			</div>
		</div>
	);
}

/**
 * Two-row marquee: frameworks L→R on top, languages R→L below.
 * Soft edge fade like a component mannequin / logo wall.
 */
function LanguageVisual() {
	const frameworkItems: MarqueeItem[] = frameworks.map((fw) => ({
		slug: fw.slug,
		name: fw.name,
		icon: fw.icon,
	}));
	const languageItems: MarqueeItem[] = languages.map((lang) => ({
		slug: lang.slug,
		name: lang.name,
		icon: lang.icon,
	}));

	return (
		<div
			className="relative w-full overflow-hidden py-2"
			style={{
				maskImage:
					"linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
				WebkitMaskImage:
					"linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
			}}
		>
			<div className="flex flex-col gap-2.5">
				{/* Frameworks — left → right */}
				<MarqueeRow items={frameworkItems} reverse duration={32} />
				{/* Languages — right → left (opposite) */}
				<MarqueeRow items={languageItems} reverse={false} duration={26} />
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
							"group relative flex min-h-0 cursor-pointer flex-col overflow-hidden px-5 pb-10 pt-8 transition-colors duration-200 hover:bg-bg-weak-50/50 sm:px-7 sm:pb-12 sm:pt-10 dark:hover:bg-white/[0.02]";

						const content = (
							<>
								<p className="relative z-10 font-mono text-[11px] text-text-sub-600 uppercase tracking-[0.08em] dark:text-white/45">
									[step {step.step}]
								</p>

								{/* Visual */}
								<div className="relative z-10 mt-5 mb-8 flex min-h-[220px] flex-1 items-center justify-center sm:min-h-[240px]">
									<div className="pointer-events-none w-full max-w-[280px]">
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
