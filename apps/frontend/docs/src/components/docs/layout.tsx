"use client";

import type { PageTreeItem } from "../../lib/types";
import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";

interface DocsLayoutProps {
	children: ReactNode;
	tree: PageTreeItem[];
}

export function DocsLayout({ children, tree }: DocsLayoutProps) {
	return (
		<div className="flex h-screen w-full flex-col overflow-hidden bg-white">
			<Navbar />
			<div className="mx-auto flex w-full max-w-[1440px] flex-1 overflow-hidden md:grid md:grid-cols-[240px_minmax(0,1fr)]">
				<Sidebar tree={tree} />
				<main id="nd-page" className="relative flex-1 overflow-y-auto overflow-x-hidden">
					{children}
				</main>
			</div>
		</div>
	);
}
