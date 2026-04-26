"use client";

import { Logo } from "@reloop/ui/logo";
import Link from "next/link";
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
			{/* Unified Header */}
			<header className="z-50 flex h-12 w-full shrink-0 border-fd-border border-b bg-fd-background">
				<div className="flex w-60 shrink-0 items-center border-fd-border border-r px-4 pt-1">
					<Link href="/" className="flex items-center">
						<Logo theme="light" className="w-12" />
					</Link>
				</div>
				<div className="flex-1">
					<Navbar />
				</div>
			</header>

			<div className="flex flex-1 flex-row overflow-hidden">
				<Sidebar tree={tree} />
				<main
					id="nd-page"
					className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
				>
					{children}
				</main>
			</div>
		</div>
	);
}
