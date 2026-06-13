import { DocsLayout } from "@reloop/fe-docs/components/docs/layout";
import { source } from "@reloop/fe-docs/lib/source";
import type { PageTreeItem } from "@reloop/fe-docs/lib/types";
import { NotFoundClient } from "./not-found-client";

export default function NotFound() {
	const tree = source.pageTree.children as PageTreeItem[];

	return (
		<DocsLayout tree={tree} pathname="/404">
			<NotFoundClient tree={tree} />
		</DocsLayout>
	);
}
