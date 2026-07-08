import { DocsLayout } from "@reloop/fe-docs/components/docs/layout";
import { source } from "@reloop/fe-docs/lib/source";
import type { PageTreeItem } from "@reloop/fe-docs/lib/types";
import { NotFoundIllustration } from "@reloop/ui/not-found-illustration";

export default function NotFound() {
	const tree = source.pageTree.children as PageTreeItem[];

	return (
		<DocsLayout tree={tree} pathname="/404">
			<div className="flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-center px-4 py-16 text-center">
				<NotFoundIllustration className="mb-6" />
				<h1 className="mb-2 font-semibold text-lg text-text-strong-950 dark:text-white">
					Page not found
				</h1>
				<p className="text-sm text-text-sub-600 dark:text-white/50">
					We could not find the page you were looking for
				</p>
			</div>
		</DocsLayout>
	);
}


