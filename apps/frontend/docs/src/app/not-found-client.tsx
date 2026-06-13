"use client";

import {
	ArrowRight,
	BookOpen,
	Code,
	ExternalLink,
	Library,
	Search,
	Webhook,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SearchDialog } from "@reloop/fe-docs/components/docs/search-dialog";
import type { PageTreeItem } from "@reloop/fe-docs/lib/types";

interface NotFoundClientProps {
	tree: PageTreeItem[];
}

export function NotFoundClient({ tree }: NotFoundClientProps) {
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	const navigationCards = [
		{
			title: "Documentation & Guides",
			description: "Learn how to integrate Reloop and start sending emails.",
			icon: BookOpen,
			url: "/",
			color: "text-blue-500",
			hoverBorder: "hover:border-blue-500/30 dark:hover:border-blue-500/20",
			hoverBg: "hover:bg-blue-500/[0.01]",
		},
		{
			title: "API Reference",
			description: "Browse fully interactive API endpoints and code samples.",
			icon: Code,
			url: "/api",
			color: "text-emerald-500",
			hoverBorder: "hover:border-emerald-500/30 dark:hover:border-emerald-500/20",
			hoverBg: "hover:bg-emerald-500/[0.01]",
		},
		{
			title: "Webhooks Reference",
			description: "Configure webhooks and listen for real-time delivery events.",
			icon: Webhook,
			url: "/webhooks",
			color: "text-pink-500",
			hoverBorder: "hover:border-pink-500/30 dark:hover:border-pink-500/20",
			hoverBg: "hover:bg-pink-500/[0.01]",
		},
		{
			title: "Knowledge Base",
			description: "Find articles, FAQs, and advanced developer tutorials.",
			icon: Library,
			url: "/knowledge-base",
			color: "text-amber-500",
			hoverBorder: "hover:border-amber-500/30 dark:hover:border-amber-500/20",
			hoverBg: "hover:bg-amber-500/[0.01]",
		},
		{
			title: "Reloop Dashboard",
			description: "Manage your API keys, email templates, and view system logs.",
			icon: ExternalLink,
			url: "https://dashboard.reloop.sh",
			color: "text-violet-500",
			hoverBorder: "hover:border-violet-500/30 dark:hover:border-violet-500/20",
			hoverBg: "hover:bg-violet-500/[0.01]",
			external: true,
		},
	];

	return (
		<div className="relative flex min-h-[calc(100vh-8rem)] w-full items-center justify-center overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
			<div className="w-full max-w-4xl space-y-12 text-center">
				{/* 404 Hero Header */}
				<div className="space-y-4">
					<div className="inline-flex items-center gap-1.5 rounded-full border border-stroke-soft-100 bg-bg-white-0/80 px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-sm dark:border-stroke-soft-100/40 dark:bg-white/5">
						<span className="flex h-2 w-2 rounded-full bg-red-500" />
						<span className="text-text-sub-600">404 Error</span>
					</div>
					<h1 className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-500 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl dark:from-white dark:via-gray-100 dark:to-gray-400">
						Lost in transit
					</h1>
					<p className="mx-auto max-w-lg text-base text-text-sub-600 leading-relaxed">
						We couldn't deliver the page you were looking for. It might have been moved, deleted, or never existed in the first place.
					</p>
				</div>

				{/* Interactive Search Bar */}
				<div className="mx-auto max-w-lg">
					<button
						type="button"
						onClick={() => setIsSearchOpen(true)}
						className="group flex w-full items-center gap-3 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 text-left transition-all hover:border-black/15 dark:border-stroke-soft-100/40 dark:bg-[#0d0d0d] dark:hover:border-white/15"
					>
						<Search className="h-5 w-5 text-text-sub-600 transition-colors group-hover:text-black dark:group-hover:text-white" />
						<span className="flex-1 font-medium text-sm text-text-sub-600 transition-colors group-hover:text-black/80 dark:group-hover:text-white/80">
							Search the documentation...
						</span>
						<div className="flex items-center gap-1 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 px-2 py-1 font-medium font-mono text-[10px] text-text-sub-600 dark:border-stroke-soft-100/30 dark:bg-white/5">
							<kbd>⌘</kbd>
							<kbd>K</kbd>
						</div>
					</button>
				</div>

				{/* Quick Navigation Options */}
				<div className="space-y-6">
					<h2 className="text-xs font-bold uppercase tracking-wider text-text-sub-600">
						Or choose a direct route
					</h2>

					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-left">
						{navigationCards.map((card) => {
							const IconComponent = card.icon;
							return (
								<div key={card.title} className="group">
									<Link
										href={card.url}
										target={card.external ? "_blank" : undefined}
										rel={card.external ? "noopener noreferrer" : undefined}
										className={`flex h-full flex-col justify-between rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-5 transition-all dark:border-stroke-soft-100/30 dark:bg-[#080808] ${card.hoverBorder} ${card.hoverBg}`}
									>
										<div className="space-y-3">
											{/* Icon Wrapper */}
											<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bg-weak-50 dark:bg-white/5">
												<IconComponent className={`h-5 w-5 ${card.color}`} />
											</div>
											{/* Text Content */}
											<div className="space-y-1">
												<h3 className="font-semibold text-sm text-[#171717] dark:text-white flex items-center gap-1.5">
													{card.title}
													{card.external && (
														<ExternalLink className="h-3 w-3 opacity-40" />
													)}
												</h3>
												<p className="text-xs text-text-sub-600 leading-normal">
													{card.description}
												</p>
											</div>
										</div>
										
										{/* Bottom Action Link */}
										<div className="mt-4 flex items-center gap-1 font-semibold text-xs text-text-sub-600 transition-colors group-hover:text-black dark:group-hover:text-white">
											<span>Go to section</span>
											<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
										</div>
									</Link>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* Search Dialog portal instance for immediate click trigger */}
			<SearchDialog
				open={isSearchOpen}
				onOpenChange={setIsSearchOpen}
				tree={tree}
			/>
		</div>
	);
}
