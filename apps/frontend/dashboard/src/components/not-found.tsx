import { Icon } from "@reloop/ui/icon";
import { NotFoundIllustration } from "@reloop/ui/not-found-illustration";
import { Link } from "#/lib/navigation";

/** App-wide 404 for TanStack Router (root + defaultNotFoundComponent). */
export function NotFound() {
	return (
		<div className="flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-center px-4 py-16 text-center">
			<NotFoundIllustration className="mb-6" />
			<h1 className="mb-2 font-semibold text-lg text-text-strong-950 dark:text-white">
				Page not found
			</h1>
			<p className="text-sm text-text-sub-600 dark:text-white/50">
				We could not find the page you were looking for.
			</p>
			<div className="mt-8">
				<Link
					to="/"
					className="inline-flex h-11 items-center justify-center gap-2.5 rounded-full bg-[#0a0d12] pr-8 pl-6 font-semibold text-[15px] text-white transition-colors hover:bg-[#0a0d12]/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
				>
					<Icon name="arrow-left" className="size-4" aria-hidden />
					Return home
				</Link>
			</div>
		</div>
	);
}
