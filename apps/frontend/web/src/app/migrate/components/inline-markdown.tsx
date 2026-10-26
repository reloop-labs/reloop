import Link from "next/link";
import type { ReactNode } from "react";

const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

/** Renders the inline subset blog posts use in steps: **bold**, `code` and [links](/path). */
export function InlineMarkdown({ text }: { text: string }) {
	const parts = text.split(TOKEN).filter(Boolean);
	return (
		<>
			{parts.map((part, index): ReactNode => {
				const key = `${index}-${part}`;
				if (part.startsWith("**")) {
					return (
						<strong
							key={key}
							className="font-medium text-text-strong-950 dark:text-white"
						>
							{part.slice(2, -2)}
						</strong>
					);
				}
				if (part.startsWith("`")) {
					return (
						<code
							key={key}
							className="rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-mono text-[0.85em] text-text-strong-950 dark:bg-white/[0.08] dark:text-white"
						>
							{part.slice(1, -1)}
						</code>
					);
				}
				const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
				if (link) {
					const [, label, href = ""] = link;
					const className =
						"text-text-strong-950 underline decoration-stroke-soft-200 underline-offset-2 transition-colors hover:decoration-text-strong-950 dark:text-white dark:decoration-white/25 dark:hover:decoration-white";
					return href.startsWith("/") ? (
						<Link key={key} href={href} className={className}>
							{label}
						</Link>
					) : (
						<a
							key={key}
							href={href}
							target="_blank"
							rel="noreferrer"
							className={className}
						>
							{label}
						</a>
					);
				}
				return part;
			})}
		</>
	);
}
