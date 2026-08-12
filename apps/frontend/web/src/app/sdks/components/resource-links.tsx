import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import type { FrameworkSlug } from "../frameworks";
import type { LanguageSlug } from "../languages";

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

type ResourceLink = {
	href: string;
	icon: string | "shapes";
	iconFill: "none" | "currentColor";
	title: string;
	external?: boolean;
};

export function ResourceLinks({
	languageSlug,
	docsPath,
	frameworkSlug,
	className,
}: {
	languageSlug: LanguageSlug;
	docsPath: string;
	frameworkSlug?: FrameworkSlug | null;
	className?: string;
}) {
	const links: ResourceLink[] = [
		{
			href: GITHUB_SDK[languageSlug],
			icon: "github",
			iconFill: "currentColor",
			title: "GitHub",
			external: true,
		},
		{
			href: exampleRepoUrl(frameworkSlug),
			icon: "brackets",
			iconFill: "currentColor",
			title: "Example repo",
			external: true,
		},
		{
			href: getExamplesPath(languageSlug, frameworkSlug),
			icon: "integration",
			iconFill: "none",
			title: "Examples",
		},
		{
			href: "/docs/api",
			icon: "shapes",
			iconFill: "none",
			title: "API reference",
		},
		{
			href: docsPath,
			icon: "file-text",
			iconFill: "none",
			title: "Docs",
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
