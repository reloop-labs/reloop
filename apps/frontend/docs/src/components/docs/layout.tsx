"use client";

import type { ReactNode } from "react";
import type { PageTreeItem } from "../../lib/types";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

interface DocsLayoutProps {
	children: ReactNode;
	tree: PageTreeItem[];
}

export function DocsLayout({ children, tree }: DocsLayoutProps) {
	return (
		<div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-fd-background">
			<Navbar />
			<div className="mx-auto flex h-full min-h-0 w-full max-w-[1440px] flex-1 flex-row overflow-hidden">
				<Sidebar tree={tree} />
				<main
					id="nd-page"
					className="relative h-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
				>
					{children}
				</main>
			</div>
		</div>
	);
}
