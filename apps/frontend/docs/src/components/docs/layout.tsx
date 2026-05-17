"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Logo } from "@reloop/ui/logo";
import { motion } from "framer-motion";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import type { PageTreeItem } from "../../lib/types";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

interface DocsLayoutProps {
	children: ReactNode;
	tree: PageTreeItem[];
	pathname?: string;
}

export function DocsLayout({ children, tree, pathname }: DocsLayoutProps) {
	const [open, setOpen] = useState(false);

	return (
		<div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-bg-weak-50 dark:bg-black">
			{/* Unified Header - Borderless */}
			<header className="z-50 flex h-12 w-full shrink-0 bg-bg-weak-50/80 backdrop-blur-md dark:bg-black/80">
				{/* Desktop Logo Area - Only visible on LG+ */}
				<div className="hidden shrink-0 items-center px-4 pt-1 lg:flex lg:w-74">
					<Link href="/" className="flex items-center">
						<Logo theme="light" className="w-12" />
					</Link>
				</div>
				{/* Navigation Row - Fluid on all screens */}
				<div className="flex-1">
					<Navbar onMobileMenuClick={() => setOpen(true)} />
				</div>
			</header>

			<div className="flex flex-1 flex-row overflow-hidden bg-bg-weak-50 dark:bg-black">
				{/* Mobile Drawer */}
				<Dialog.Root open={open} onOpenChange={setOpen}>
					<Dialog.Portal>
						<Dialog.Overlay asChild>
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="fixed inset-0 z-50 bg-fd-background/60 backdrop-blur-sm"
							/>
						</Dialog.Overlay>
						<Dialog.Content asChild>
							<motion.div
								initial={{ x: "-100%" }}
								animate={{ x: 0 }}
								exit={{ x: "-100%" }}
								transition={{ type: "spring", damping: 25, stiffness: 200 }}
								className="fixed inset-y-0 left-0 z-50 w-72 border-fd-border border-r bg-fd-background p-0 focus:outline-none"
							>
								<div className="flex h-12 items-center border-fd-border border-b px-4">
									<Link
										href="/"
										className="flex items-center"
										onClick={() => setOpen(false)}
									>
										<Logo theme="light" className="w-10" />
									</Link>
								</div>
								<div className="h-[calc(100vh-3rem)] overflow-y-auto">
									<Sidebar
										tree={tree}
										isMobile
										onLinkClick={() => setOpen(false)}
										pathname={pathname}
									/>
								</div>
							</motion.div>
						</Dialog.Content>
					</Dialog.Portal>
				</Dialog.Root>

				{/* Desktop Sidebar - Only visible on LG+ */}
				<div className="hidden shrink-0 lg:flex lg:w-72">
					<Sidebar tree={tree} pathname={pathname} />
				</div>

				{/* Main Content Area - Seamless Card Layout */}
				<main
					id="nd-page"
					className="relative mr-2 mb-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]"
				>
					<div className="flex-1 overflow-y-auto overflow-x-hidden">
						<div className="mx-auto min-h-full w-full transition-all duration-300">
							{children}
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
