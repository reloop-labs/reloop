import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import type { ReactNode } from "react";
import { type FrameworkSlug, getFramework } from "../frameworks";
import { getLanguage, type LanguageSlug } from "../languages";
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

type Rgb = [number, number, number];

const NAMED_RGB: Record<"blue" | "teal" | "orange", Rgb> = {
	blue: [56, 189, 248],
	teal: [45, 212, 191],
	orange: [251, 146, 60],
};

function hexToRgb(hex: string): Rgb {
	const h = hex.replace("#", "");
	return [
		Number.parseInt(h.slice(0, 2), 16),
		Number.parseInt(h.slice(2, 4), 16),
		Number.parseInt(h.slice(4, 6), 16),
	];
}

function isDimRgb([r, g, b]: Rgb): boolean {
	return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.28;
}

function resolveRgb(hex?: string, fallback: Rgb = NAMED_RGB.blue): Rgb {
	if (!hex) return fallback;
	return hexToRgb(hex);
}

function rgba(rgb: Rgb, a: number): string {
	return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;
}

function ResourceCard({
	href,
	title,
	external,
	accent,
	hex,
	icon,
}: {
	href: string;
	title: string;
	external?: boolean;
	accent: keyof typeof NAMED_RGB;
	hex?: string;
	icon: ReactNode;
}) {
	const brand = resolveRgb(hex, NAMED_RGB[accent]);
	const dim = isDimRgb(brand);
	// Light keeps the true brand (charcoal for black marks). Dark lifts black so the bloom reads.
	const lightRgb: Rgb = dim ? [24, 24, 27] : brand;
	const darkRgb: Rgb = dim ? [228, 228, 231] : brand;
	const inkLight = `rgb(${lightRgb[0]}, ${lightRgb[1]}, ${lightRgb[2]})`;
	const inkDark = `rgb(${darkRgb[0]}, ${darkRgb[1]}, ${darkRgb[2]})`;

	const className = cn(
		"group relative flex h-full min-h-[180px] w-full max-w-[154px] flex-col justify-between overflow-hidden border border-stroke-soft-100 bg-bg-white-0 p-4 transition-colors duration-200 ease-out sm:min-h-[200px] sm:p-5",
		"text-text-strong-950 dark:border-white/10 dark:bg-black dark:text-white",
		"hover:bg-bg-weak-50/70 dark:hover:bg-white/[0.03]",
	);

	const content = (
		<>
			<div className="relative z-10 flex shrink-0 items-start justify-between">
				<div className="relative flex size-9 items-center justify-center border border-stroke-soft-100 sm:size-10 dark:border-white/10">
					<span className="relative z-10">{icon}</span>
				</div>
				<Icon
					name="arrow-up-right"
					className="group-hover:-translate-y-0.5 size-3.5 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
					aria-hidden
				/>
			</div>

			<span className="relative z-10 min-w-0 font-medium text-[15px] leading-snug tracking-[-0.01em]">
				{title}
			</span>
		</>
	);

	const cardStyle = {
		["--card-ink" as string]: inkLight,
		["--card-ink-dark" as string]: inkDark,
		["--card-ring" as string]: rgba(lightRgb, 0.28),
		["--card-ring-dark" as string]: rgba(darkRgb, 0.4),
	};

	if (external) {
		return (
			<a
				href={href}
				target="_blank"
				rel="noreferrer"
				className={className}
				style={cardStyle}
			>
				{content}
			</a>
		);
	}

	return (
		<Link href={href} className={className} style={cardStyle}>
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
		const framework = frameworkSlug ? getFramework(frameworkSlug) : undefined;
		const language = getLanguage(languageSlug);
		const exampleIcon = framework?.icon ?? language?.icon;

		return (
			<div className={cn("flex flex-wrap gap-3 sm:gap-4", className)}>
				<ResourceCard
					href={exampleRepoUrl(frameworkSlug)}
					title={`${name} example`}
					external
					accent="blue"
					hex={exampleIcon?.hex}
					icon={
						exampleIcon ? (
							<LanguageIcon icon={exampleIcon} className="size-5" />
						) : (
							<Icon name="integration" fill="none" className="size-5" />
						)
					}
				/>
				<ResourceCard
					href="/docs/api"
					title="API reference"
					accent="orange"
					icon={<ShapesIcon className="size-5" />}
				/>
				<ResourceCard
					href={GITHUB_SDK[languageSlug]}
					title={`${languageName} SDK`}
					external
					accent="blue"
					hex={language?.icon.hex}
					icon={<Icon name="github" fill="currentColor" className="size-5" />}
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
					"inline-flex items-center gap-2 font-medium text-[13px] text-text-strong-950  hover:text-text-sub-600 dark:text-white dark:hover:text-white/70";

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
