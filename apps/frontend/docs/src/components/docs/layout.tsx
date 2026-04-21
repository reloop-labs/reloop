"use client";

import type { PageTreeItem } from "@reloop/fe-docs/lib/types";
import type { ReactNode } from "react";
import { DocTabs } from "../doc-tabs";
import { Sidebar } from "./sidebar";

interface DocsLayoutProps {
	children: ReactNode;
	tree: PageTreeItem[];
}

export function DocsLayout({ children, tree }: DocsLayoutProps) {
	return (
		<div className="flex min-h-screen flex-col">
			<DocTabs />
			<div className="container flex-1 items-start md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
				<Sidebar tree={tree} />
				<main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]">
					<div className="mx-auto w-full min-w-0">{children}</div>
				</main>
			</div>
		</div>
	);
}
