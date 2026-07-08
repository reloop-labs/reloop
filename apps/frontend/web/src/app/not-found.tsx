import { NotFoundIllustration } from "@reloop/web/components/not-found-illustration";
import type { Metadata } from "next";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export const metadata: Metadata = {
	title: "Page not found",
	description:
		"The page you're looking for couldn't be found. Return to Reloop or explore our documentation and features.",
	robots: { index: false, follow: false },
};

export default function NotFound() {
	return (
		<div className="flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-center px-4 py-16 text-center">
			<NotFoundIllustration className="mb-6" />
			<h1 className="mb-2 font-semibold text-lg text-text-strong-950 dark:text-white">
				Page not found
			</h1>
			<p className="text-sm text-text-sub-600 dark:text-white/50">
				We could not find the page you were looking for
			</p>
		</div>
	);
}
