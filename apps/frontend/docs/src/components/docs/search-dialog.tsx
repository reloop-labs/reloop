"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import * as React from "react";
import { cn } from "../../lib/cn";
import type { PageTreeItem } from "../../lib/types";

interface SearchDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tree: PageTreeItem[];
}

interface SearchResult {
	title: string;
	url: string;
	path: string[];
	method?: string;
}

export function SearchDialog({ open, onOpenChange, tree }: SearchDialogProps) {
	const [query, setQuery] = useQueryState("q", { defaultValue: "" });
	const [results, setResults] = React.useState<SearchResult[]>([]);
	const [selectedIndex, setSelectedIndex] = React.useState(0);
	const router = useRouter();

	// Flatten tree for searching
	const allPages = React.useMemo(() => {
		const pages: SearchResult[] = [];
		const traverse = (items: PageTreeItem[], path: string[] = []) => {
			for (const item of items) {
				if (item.type === "page") {
					pages.push({
						title: item.name as string,
						url: item.url,
						path: path,
						method: item.method,
					});
				} else if (item.type === "folder") {
					traverse(item.children, [...path, item.name as string]);
				}
			}
		};
		traverse(tree);
		return pages;
	}, [tree]);

	// Simple fuzzy search
	React.useEffect(() => {
		if (!query) {
			setResults([]);
			return;
		}

		const filtered = allPages
			.filter(
				(page) =>
					page.title.toLowerCase().includes(query.toLowerCase()) ||
					page.path.some((p) => p.toLowerCase().includes(query.toLowerCase())),
			)
			.slice(0, 8);

		setResults(filtered);
		setSelectedIndex(0);
	}, [query, allPages]);

	const handleSelect = React.useCallback(
		(url: string) => {
			router.push(url);
			onOpenChange(false);
			setQuery("");
		},
		[router, onOpenChange, setQuery],
	);

	// Keyboard navigation
	React.useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setSelectedIndex((prev) => (prev + 1) % Math.max(results.length, 1));
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setSelectedIndex(
					(prev) => (prev - 1 + results.length) % Math.max(results.length, 1),
				);
			} else if (e.key === "Enter" && results[selectedIndex]) {
				e.preventDefault();
				handleSelect(results[selectedIndex].url);
			}
		};

		if (open) {
			window.addEventListener("keydown", handleKeyDown);
		}
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [open, results, selectedIndex, handleSelect]);

	const groupedResults = React.useMemo(() => {
		const groups: Array<{
			name: string;
			items: Array<{ result: SearchResult; originalIndex: number }>;
		}> = [];

		for (let i = 0; i < results.length; i++) {
			const res = results[i];
			if (!res) continue;
			const groupName =
				res.path.length > 0 ? res.path.join(" › ") : "Documentation";

			let group = groups.find((g) => g.name === groupName);
			if (!group) {
				group = { name: groupName, items: [] };
				groups.push(group);
			}
			group.items.push({ result: res, originalIndex: i });
		}
		return groups;
	}, [results]);

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<AnimatePresence>
				{open && (
					<Dialog.Portal forceMount>
						<Dialog.Overlay asChild>
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="fixed inset-0 z-50 bg-black/15 backdrop-blur-[2px] dark:bg-black/40"
							/>
						</Dialog.Overlay>
						<Dialog.Content asChild>
							<div
								className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[15vh]"
								onClick={(e) => {
									if (e.target === e.currentTarget) {
										onOpenChange(false);
									}
								}}
							>
								<motion.div
									initial={{ opacity: 0, scale: 0.97, y: 24 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.97, y: 24 }}
									transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
									className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-2xl dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]"
								>
									<Dialog.Title className="sr-only">
										Search Documentation
									</Dialog.Title>
									<Dialog.Description className="sr-only">
										Search for guides, API references, and quickstarts.
									</Dialog.Description>

									{/* Search Input Area */}
									<div className="flex items-center border-stroke-soft-100 border-b px-4 py-3 dark:border-stroke-soft-100/40">
										<Search className="mr-3 h-5 w-5 text-text-sub-600" />
										<input
											className="flex-1 bg-transparent text-[#171717] placeholder:text-text-sub-600 focus:outline-none sm:text-sm dark:text-white"
											placeholder="Search documentation..."
											value={query}
											onChange={(e) => setQuery(e.target.value)}
										/>
										<div className="flex items-center gap-1.5 rounded-md border border-stroke-soft-200 bg-bg-weak-50 px-1.5 py-0.5 font-medium text-[10px] text-text-sub-600 dark:border-stroke-soft-100/30 dark:bg-white/5">
											<kbd>ESC</kbd>
										</div>
									</div>

									{/* Results Area */}
									<div className="max-h-[60vh] overflow-y-auto p-2">
										{query === "" ? (
											<div className="px-4 py-12 text-center">
												<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-bg-weak-50 dark:bg-white/5">
													<Search className="h-6 w-6 text-text-sub-600" />
												</div>
												<h3 className="mt-4 font-semibold text-[#171717] dark:text-white">
													Search Reloop Docs
												</h3>
												<p className="mt-1 text-sm text-text-sub-600">
													Search for guides, API references, and quickstarts.
												</p>
											</div>
										) : results.length === 0 ? (
											<div className="px-4 py-12 text-center">
												<p className="text-sm text-text-sub-600">
													No results found for "
													<span className="font-medium text-[#171717] dark:text-white">
														{query}
													</span>
													"
												</p>
											</div>
										) : (
											<div className="space-y-4">
												{groupedResults.map((group, groupIdx) => (
													<div
														key={group.name}
														className={cn(
															"space-y-0.5",
															groupIdx > 0 && "mt-3",
														)}
													>
														<div className="px-3 py-1 font-bold text-[10px] text-text-sub-600/60 uppercase tracking-wider">
															{group.name}
														</div>
														{group.items.map(({ result, originalIndex }) => (
															<button
																type="button"
																key={result.url}
																onClick={() => handleSelect(result.url)}
																onPointerEnter={() =>
																	setSelectedIndex(originalIndex)
																}
																className={cn(
																	"group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors",
																	originalIndex === selectedIndex
																		? "bg-black/5 dark:bg-white/5"
																		: "hover:bg-black/[0.03] dark:hover:bg-white/[0.03]",
																)}
															>
																<div
																	className={cn(
																		"flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 bg-bg-white-0 transition-colors dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]",
																		originalIndex === selectedIndex
																			? "border-[#171717]/10 dark:border-white/10"
																			: "",
																	)}
																>
																	{result.method ? (
																		<span
																			className={cn(
																				"rounded px-1 py-0.5 font-bold text-[8px] uppercase leading-none tracking-wide",
																				result.method === "GET" &&
																					"bg-green-500/15 text-green-600 dark:bg-green-500/20 dark:text-green-400",
																				result.method === "POST" &&
																					"bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
																				result.method === "DELETE" &&
																					"bg-red-500/15 text-red-500 dark:bg-red-500/20 dark:text-red-400",
																				result.method === "PATCH" &&
																					"bg-orange-500/15 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
																				result.method === "PUT" &&
																					"bg-purple-500/15 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
																			)}
																		>
																			{result.method === "DELETE"
																				? "DEL"
																				: result.method}
																		</span>
																	) : (
																		<FileText
																			className={cn(
																				"h-3.5 w-3.5 transition-colors",
																				originalIndex === selectedIndex
																					? "text-[#171717] dark:text-white"
																					: "text-text-sub-600",
																			)}
																		/>
																	)}
																</div>
																<div className="flex-1 overflow-hidden">
																	<div className="truncate font-medium text-[#171717] text-sm dark:text-white">
																		{result.title}
																	</div>
																</div>
																<div className="flex h-5 w-5 items-center justify-center rounded border border-stroke-soft-200 bg-bg-weak-50 font-medium text-[10px] text-text-sub-600 opacity-0 transition-opacity group-hover:opacity-100 dark:border-stroke-soft-100/40 dark:bg-white/5">
																	↵
																</div>
															</button>
														))}
													</div>
												))}
											</div>
										)}
									</div>

									{/* Footer */}
									<div className="flex items-center justify-between border-stroke-soft-100 border-t bg-bg-weak-50/50 px-4 py-2 font-semibold text-[10px] text-text-sub-600 uppercase tracking-wider dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
										<div className="flex gap-4">
											<span className="flex items-center gap-1">
												<kbd className="font-sans">↑↓</kbd> Navigate
											</span>
											<span className="flex items-center gap-1">
												<kbd className="font-sans">↵</kbd> Select
											</span>
										</div>
										<div className="flex items-center gap-1">
											Search by{" "}
											<span className="text-[#171717] dark:text-white">
												Reloop
											</span>
										</div>
									</div>
								</motion.div>
							</div>
						</Dialog.Content>
					</Dialog.Portal>
				)}
			</AnimatePresence>
		</Dialog.Root>
	);
}
