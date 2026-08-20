"use client";

import { Logo } from "@reloop/ui/logo";
import dynamic from "next/dynamic";
import { type ReactNode, Suspense, useEffect, useState } from "react";
import type { PageTreeItem } from "../../lib/types";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

const SearchDialog = dynamic(
	() => import("./search-dialog").then((mod) => mod.SearchDialog),
	{ ssr: false },
);

interface DocsLayoutProps {
	children: ReactNode;
	tree: PageTreeItem[];
	pathname?: string;
}

export function DocsLayout({ children, tree, pathname }: DocsLayoutProps) {
	const [open, setOpen] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	// Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setIsSearchOpen(true);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	// Close mobile drawer on Escape
	useEffect(() => {
		if (!open) return;
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [open]);

	return (
		<div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-bg-white-0 dark:bg-black">
			{/* Top Header - border bottom matching dashboard */}
			<header className="z-50 flex h-12 w-full min-w-0 shrink-0 border-stroke-soft-100 border-b bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-black">
				<div className="mx-auto flex h-full w-full max-w-5xl border-stroke-soft-100 border-r md:max-w-7xl dark:border-stroke-soft-100/40">
					{/* Desktop Logo Area — match dashboard brand lockup with right border */}
					<div className="hidden shrink-0 items-center border-stroke-soft-100 border-r px-3 lg:flex lg:w-[270px] dark:border-stroke-soft-100/40">
						<a href="/" className="flex items-center gap-2">
							<Logo className="-ml-1 w-10 shrink-0" />
							<p className="-ml-2 font-semibold text-text-strong-950 dark:text-white">
								Reloop
							</p>
							<span className="inline-flex items-center rounded-full bg-bg-weak-50 px-2 py-0.5 font-bold text-[8px] text-text-sub-600 uppercase tracking-wide dark:bg-white/[0.06]">
								Beta
							</span>
						</a>
					</div>
					{/* Navigation Row - Fluid on all screens */}
					<div className="h-full min-w-0 flex-1">
						<Navbar onMobileMenuClick={() => setOpen(true)} />
					</div>
				</div>
			</header>

			{/*
			  Main first in DOM so HTML→text conversion reaches page content earlier
			  (AFDocs content-start-position). Visual order: sidebar left via order-*.
			*/}
			<div className="flex flex-1 flex-row overflow-hidden bg-bg-white-0 dark:bg-black">
				{/* Main Content Area - Extends to the right edge of viewport for scrollbar placement (DOM first) */}
				<main className="relative order-2 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-bg-white-0 dark:bg-black">
					<div
						id="nd-page"
						className="flex-1 overflow-y-auto overflow-x-hidden"
					>
						<div
							className="min-h-full w-full border-stroke-soft-100 border-r transition-all duration-300 dark:border-stroke-soft-100/40"
							style={{
								maxWidth: "calc(1280px - 270px)",
							}}
						>
							{children}
						</div>
					</div>
				</main>

				{/* Desktop Sidebar - visually left, fixed in viewport, dynamically padded to align with centered header */}
				<div
					className="order-1 hidden shrink-0 border-stroke-soft-100 border-r lg:flex dark:border-stroke-soft-100/40"
					style={{
						width: "calc(270px + max(0px, (100% - 1280px) / 2))",
						paddingLeft: "max(0px, (100% - 1280px) / 2)",
					}}
				>
					<Sidebar
						tree={tree}
						pathname={pathname}
						onSearchClick={() => setIsSearchOpen(true)}
					/>
				</div>
			</div>

			{/* Mobile Drawer — CSS transitions only, no framer-motion */}
			{/* Overlay */}
			<div
				className={`fixed inset-0 z-50 bg-black/15 backdrop-blur-[2px] transition-opacity duration-300 dark:bg-black/40 ${
					open
						? "pointer-events-auto opacity-100"
						: "pointer-events-none opacity-0"
				}`}
				onClick={() => setOpen(false)}
				aria-hidden={!open}
			/>
			{/* Drawer panel */}
			<div
				role="dialog"
				aria-modal={open}
				aria-label="Documentation Navigation"
				className={`fixed inset-y-0 left-0 z-50 w-[270px] border-stroke-soft-100 border-r bg-bg-white-0 p-0 transition-transform duration-300 ease-out focus:outline-none dark:border-stroke-soft-100/40 dark:bg-black ${
					open ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex h-12 items-center border-stroke-soft-100 border-b bg-bg-white-0 px-3 dark:border-stroke-soft-100/40 dark:bg-black">
					<a
						href="/"
						className="flex items-center gap-2"
						onClick={() => setOpen(false)}
					>
						<Logo className="-ml-1 w-10 shrink-0" />
						<p className="-ml-2 font-semibold text-text-strong-950 dark:text-white">
							Reloop
						</p>
						<span className="inline-flex items-center rounded-full bg-bg-weak-50 px-2 py-0.5 font-bold text-[8px] text-text-sub-600 uppercase tracking-wide dark:bg-white/[0.06]">
							Beta
						</span>
					</a>
				</div>
				<div className="h-[calc(100vh-3rem)] overflow-y-auto">
					<Sidebar
						tree={tree}
						isMobile
						onLinkClick={() => setOpen(false)}
						onSearchClick={() => setIsSearchOpen(true)}
						pathname={pathname}
					/>
				</div>
			</div>

			{isSearchOpen && (
				<Suspense fallback={null}>
					<SearchDialog
						open={isSearchOpen}
						onOpenChange={setIsSearchOpen}
						tree={tree}
					/>
				</Suspense>
			)}
		</div>
	);
}
