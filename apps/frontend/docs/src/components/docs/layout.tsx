"use client";
 
import * as Dialog from "@radix-ui/react-dialog";
import { Logo } from "@reloop/ui/logo";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { PageTreeItem } from "../../lib/types";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

interface DocsLayoutProps {
	children: ReactNode;
	tree: PageTreeItem[];
}

export function DocsLayout({ children, tree }: DocsLayoutProps) {
	const [open, setOpen] = useState(false);

	return (
		<div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-fd-background">
			{/* Unified Header */}
			<header className="z-50 flex h-12 w-full shrink-0 border-fd-border border-b bg-fd-background/80 backdrop-blur-md">
				{/* Desktop Logo Area - Only visible on LG+ */}
				<div className="hidden shrink-0 items-center border-fd-border border-r px-4 pt-1 lg:flex lg:w-60">
					<Link href="/" className="flex items-center">
						<Logo theme="light" className="w-12" />
					</Link>
				</div>
				{/* Navigation Row - Fluid on all screens */}
				<div className="flex-1">
					<Navbar onMobileMenuClick={() => setOpen(true)} />
				</div>
			</header>

			<div className="flex flex-1 flex-row overflow-hidden bg-[#fafafa] dark:bg-[#0a0a0a]">
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
								className="fixed inset-y-0 left-0 z-50 w-72 border-fd-border border-r bg-fd-background p-0 shadow-2xl focus:outline-none"
							>
								<div className="flex h-12 items-center border-fd-border border-b px-4">
									<Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
										<Logo theme="light" className="w-10" />
									</Link>
								</div>
								<div className="h-[calc(100vh-3rem)] overflow-y-auto">
									<Sidebar tree={tree} isMobile onLinkClick={() => setOpen(false)} />
								</div>
							</motion.div>
						</Dialog.Content>
					</Dialog.Portal>
				</Dialog.Root>

				{/* Desktop Sidebar - Only visible on LG+ */}
				<aside className="hidden shrink-0 border-fd-border border-r lg:block lg:w-60">
					<Sidebar tree={tree} />
				</aside>

				{/* Main Content Area - Fluid */}
				<main
					id="nd-page"
					className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-0 md:p-6 lg:p-8"
				>
					<div className="mx-auto min-h-full w-full rounded-none border-fd-border bg-fd-background shadow-none transition-all duration-300 md:rounded-xl md:border md:shadow-[0_1px_3px_rgba(0,0,0,0.02)] lg:max-w-[1250px]">
						{children}
					</div>
				</main>
			</div>
		</div>
	);
}
