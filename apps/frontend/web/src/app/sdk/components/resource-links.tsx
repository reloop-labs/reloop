import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import type { ReactNode } from "react";
import { getFramework, type FrameworkSlug } from "../frameworks";
import type { LanguageSlug } from "../languages";
import { LanguageIcon } from "./language-icon";

const GITHUB_SDK: Record<LanguageSlug, string> = {
	nodejs: "https://github.com/reloop-labs/reloop-node",
	python: "https://github.com/reloop-labs/reloop-python",
	go: "https://github.com/reloop-labs/reloop-go",
	rust: "https://github.com/reloop-labs/reloop-rust",
	php: "https://github.com/reloop-labs/reloop-php",
	ruby: "https://github.com/reloop-labs/reloop-ruby",
	elixir: "https://github.com/reloop-labs/reloop-elixir",
	java: "https://github.com/reloop-labs/reloop-java",
	dotnet: "https://github.com/reloop-labs/reloop-dotnet",
};

const FRAMEWORK_EXAMPLES_PATH: Partial<Record<FrameworkSlug, string>> = {
	nextjs: "/docs/examples/nodejs/nextjs",
	express: "/docs/examples/nodejs/express",
	django: "/docs/examples/python/django",
	fastapi: "/docs/examples/python/fastapi",
	flask: "/docs/examples/python/flask",
	laravel: "/docs/examples/php/laravel",
	rails: "/docs/examples/ruby/rails",
	gin: "/docs/examples/go/gin",
};

const LANGUAGE_EXAMPLES_PATH: Partial<Record<LanguageSlug, string>> = {
	nodejs: "/docs/examples/nodejs",
	python: "/docs/examples/python",
	php: "/docs/examples/php",
	ruby: "/docs/examples/ruby",
	go: "/docs/examples/go",
	rust: "/docs/examples/rust",
};

const EXAMPLE_REPO_FOLDER: Partial<Record<FrameworkSlug, string>> = {
	nextjs: "nextjs",
	express: "express",
	fastapi: "fastapi",
	django: "django",
	flask: "flask",
	gin: "gin",
	rails: "rails",
	laravel: "laravel",
};

const EXAMPLES_REPO = "https://github.com/reloop-labs/reloop-examples";

export function getExamplesPath(
	languageSlug: LanguageSlug,
	frameworkSlug?: FrameworkSlug | null,
): string {
	if (frameworkSlug && FRAMEWORK_EXAMPLES_PATH[frameworkSlug]) {
		return FRAMEWORK_EXAMPLES_PATH[frameworkSlug];
	}
	return LANGUAGE_EXAMPLES_PATH[languageSlug] ?? "/docs/examples";
}

function exampleRepoUrl(frameworkSlug?: FrameworkSlug | null): string {
	const folder = frameworkSlug ? EXAMPLE_REPO_FOLDER[frameworkSlug] : undefined;
	return folder ? `${EXAMPLES_REPO}/tree/main/${folder}` : EXAMPLES_REPO;
}

function ShapesIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden
		>
			<path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z" />
			<rect x="3" y="14" width="7" height="7" rx="1" />
			<circle cx="17.5" cy="17.5" r="3.5" />
		</svg>
	);
}

type ResourceAccent = "blue" | "teal" | "orange";

const RESOURCE_CARD_ACCENTS: Record<
	ResourceAccent,
	{
		wash: string;
		glow: string;
		hatch: string;
		hatchImage: string;
		hatchMask: string;
		ringOuter: string;
		ringInner: string;
		ink: string;
	}
> = {
	blue: {
		wash: "bg-gradient-to-br from-sky-100/90 via-blue-50/70 to-indigo-100/80 dark:from-sky-950/40 dark:via-blue-950/30 dark:to-indigo-950/45",
		glow: "bg-gradient-to-br from-blue-500/[0.16] via-sky-400/[0.10] to-indigo-500/[0.06] dark:from-blue-500/[0.20] dark:via-sky-400/[0.14] dark:to-indigo-500/[0.10]",
		hatch: "text-sky-500/20 dark:text-sky-400/18",
		hatchImage:
			"repeating-linear-gradient(-45deg, transparent 0, transparent 2.5px, currentColor 2.5px, currentColor 3.1px)",
		hatchMask:
			"linear-gradient(to bottom right, black 0%, black 32%, transparent 68%)",
		ringOuter: "text-sky-400/20 dark:text-sky-400/25",
		ringInner: "text-blue-500/30 dark:text-sky-300/32",
		ink: "group-hover:text-blue-600 dark:group-hover:text-sky-400",
	},
	teal: {
		wash: "bg-gradient-to-br from-teal-100/90 via-cyan-50/70 to-emerald-100/70 dark:from-teal-950/40 dark:via-cyan-950/30 dark:to-emerald-950/40",
		glow: "bg-gradient-to-br from-teal-500/[0.16] via-cyan-400/[0.10] to-emerald-500/[0.06] dark:from-teal-500/[0.20] dark:via-cyan-400/[0.14] dark:to-emerald-500/[0.10]",
		hatch: "text-teal-500/20 dark:text-teal-400/18",
		hatchImage:
			"repeating-linear-gradient(-45deg, transparent 0, transparent 2.5px, currentColor 2.5px, currentColor 3.1px)",
		hatchMask:
			"linear-gradient(to bottom right, black 0%, black 32%, transparent 68%)",
		ringOuter: "text-teal-400/20 dark:text-teal-400/25",
		ringInner: "text-teal-500/30 dark:text-cyan-300/32",
		ink: "group-hover:text-teal-600 dark:group-hover:text-teal-400",
	},
	orange: {
		wash: "bg-gradient-to-bl from-orange-100/90 via-amber-50/70 to-yellow-100/70 dark:from-orange-950/40 dark:via-amber-950/30 dark:to-yellow-950/40",
		glow: "bg-gradient-to-bl from-orange-500/[0.16] via-amber-400/[0.10] to-yellow-500/[0.06] dark:from-orange-500/[0.20] dark:via-amber-400/[0.14] dark:to-yellow-500/[0.10]",
		hatch: "text-orange-500/20 dark:text-orange-400/18",
		hatchImage:
			"repeating-linear-gradient(45deg, transparent 0, transparent 2.5px, currentColor 2.5px, currentColor 3.1px)",
		hatchMask:
			"linear-gradient(to bottom left, black 0%, black 32%, transparent 68%)",
		ringOuter: "text-orange-400/20 dark:text-orange-400/25",
		ringInner: "text-orange-500/30 dark:text-amber-300/32",
		ink: "group-hover:text-orange-600 dark:group-hover:text-orange-400",
	},
};

function ResourceCard({
	href,
	title,
	external,
	accent,
	icon,
}: {
	href: string;
	title: string;
	external?: boolean;
	accent: ResourceAccent;
	icon: ReactNode;
}) {
	const theme = RESOURCE_CARD_ACCENTS[accent];
	const className = cn(
		"group relative flex h-full w-full max-w-[168px] min-h-[180px] flex-col justify-between overflow-hidden rounded-[18px] border border-stroke-soft-200/80 bg-bg-weak-50/50 p-4 transition-colors duration-300 sm:min-h-[200px] sm:p-5",
		"dark:border-white/[0.08] dark:bg-white/[0.03]",
	);

	const content = (
		<>
			<div
				aria-hidden
				className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${theme.wash}`}
				style={{
					maskImage: theme.hatchMask,
					WebkitMaskImage: theme.hatchMask,
				}}
			/>
			<div
				aria-hidden
				className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${theme.hatch}`}
				style={{
					backgroundImage: theme.hatchImage,
					maskImage: theme.hatchMask,
					WebkitMaskImage: theme.hatchMask,
				}}
			/>

			<div className="relative z-10 flex shrink-0 items-start">
				<div className="relative flex size-6 items-center justify-center sm:size-7">
					<div
						aria-hidden
						className={`-translate-x-1/2 -translate-y-[51%] pointer-events-none absolute top-1/2 left-1/2 size-28 scale-90 rounded-full opacity-0 blur-2xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-100 ${theme.glow}`}
					/>
					<svg
						aria-hidden
						className="-translate-x-1/2 -translate-y-[51%] pointer-events-none absolute top-1/2 left-1/2 size-[9.5rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
						viewBox="0 0 160 160"
						fill="none"
					>
						<g className={theme.ringOuter}>
							<circle
								cx="80"
								cy="80"
								r="72"
								stroke="currentColor"
								strokeWidth="0.75"
								strokeDasharray="4 4"
								fill="none"
							/>
							<circle
								cx="80"
								cy="80"
								r="50"
								stroke="currentColor"
								strokeWidth="1"
								fill="none"
							/>
						</g>
						<g className={theme.ringInner}>
							<circle
								cx="80"
								cy="80"
								r="28"
								stroke="currentColor"
								strokeWidth="1.35"
								strokeDasharray="0.01 4.5"
								strokeLinecap="round"
								fill="none"
							/>
						</g>
					</svg>
					<span
						className={cn(
							"relative z-10 text-text-strong-950 transition-colors duration-300 dark:text-white",
							theme.ink,
						)}
					>
						{icon}
					</span>
				</div>
			</div>

			<span
				className={cn(
					"relative z-10 min-w-0 font-medium text-[15px] text-text-strong-950 leading-snug tracking-[-0.01em] transition-colors duration-300 dark:text-white",
					theme.ink,
				)}
			>
				{title}
			</span>
		</>
	);

	if (external) {
		return (
			<a
				href={href}
				target="_blank"
				rel="noreferrer"
				className={className}
			>
				{content}
			</a>
		);
	}

	return (
		<Link href={href} className={className}>
			{content}
		</Link>
	);
}

type ResourceLink = {
	href: string;
	icon: string | "shapes";
	iconFill: "none" | "currentColor";
	title: string;
	external?: boolean;
};

export function ResourceLinks({
	languageSlug,
	languageName,
	name,
	frameworkSlug,
	className,
	variant = "links",
}: {
	languageSlug: LanguageSlug;
	languageName: string;
	/** Selected framework or language display name, e.g. Next.js */
	name: string;
	docsPath?: string;
	frameworkSlug?: FrameworkSlug | null;
	className?: string;
	variant?: "links" | "cards";
}) {
	if (variant === "cards") {
		const frameworkIcon = frameworkSlug
			? getFramework(frameworkSlug)?.icon
			: undefined;

		return (
			<div className={cn("flex flex-wrap gap-3 sm:gap-4", className)}>
				<ResourceCard
					href={exampleRepoUrl(frameworkSlug)}
					title={`${name} example`}
					external
					accent="blue"
					icon={
						frameworkIcon ? (
							<LanguageIcon icon={frameworkIcon} className="size-6" />
						) : (
							<Icon name="integration" fill="none" className="size-6" />
						)
					}
				/>
				<ResourceCard
					href="/docs/api"
					title="API reference"
					accent="teal"
					icon={<ShapesIcon className="size-6" />}
				/>
				<ResourceCard
					href={GITHUB_SDK[languageSlug]}
					title={languageName}
					external
					accent="orange"
					icon={<Icon name="github" fill="currentColor" className="size-6" />}
				/>
			</div>
		);
	}

	const links: ResourceLink[] = [
		{
			href: exampleRepoUrl(frameworkSlug),
			icon: "integration",
			iconFill: "none",
			title: `${name} example`,
			external: true,
		},
		{
			href: "/docs/api",
			icon: "shapes",
			iconFill: "none",
			title: "API reference",
		},
		{
			href: GITHUB_SDK[languageSlug],
			icon: "github",
			iconFill: "currentColor",
			title: `${languageName} SDK`,
			external: true,
		},
	];

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			{links.map((link) => {
				const itemClassName =
					"inline-flex items-center gap-2 font-medium text-[13px] text-text-strong-950 transition-colors duration-150 hover:text-text-sub-600 dark:text-white dark:hover:text-white/70";

				const content = (
					<>
						{link.icon === "shapes" ? (
							<ShapesIcon className="size-3.5 shrink-0" />
						) : (
							<Icon
								name={link.icon}
								fill={link.iconFill}
								className="size-3.5 shrink-0"
								aria-hidden
							/>
						)}
						{link.title}
					</>
				);

				if (link.external) {
					return (
						<a
							key={link.title}
							href={link.href}
							target="_blank"
							rel="noreferrer"
							className={itemClassName}
						>
							{content}
						</a>
					);
				}

				return (
					<Link key={link.title} href={link.href} className={itemClassName}>
						{content}
					</Link>
				);
			})}
		</div>
	);
}
