"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, FileText, Search } from "lucide-react";
import { useRouter } from "next/navigation";
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
}

export function SearchDialog({ open, onOpenChange, tree }: SearchDialogProps) {
	const [query, setQuery] = React.useState("");
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
	}, [open, results, selectedIndex]);

	const handleSelect = (url: string) => {
		router.push(url);
		onOpenChange(false);
		setQuery("");
	};

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
								className="fixed inset-0 z-50 bg-fd-background/80 backdrop-blur-sm"
							/>
						</Dialog.Overlay>
						<Dialog.Content asChild>
							<div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[15vh]">
								<motion.div
									initial={{ opacity: 0, scale: 0.95, y: -20 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.95, y: -20 }}
									transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
									className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-fd-border bg-fd-popover"
								>
									<Dialog.Title className="sr-only">
										Search Documentation
									</Dialog.Title>
									<Dialog.Description className="sr-only">
										Search for guides, API references, and quickstarts.
									</Dialog.Description>

									{/* Search Input Area */}
									<div className="flex items-center border-fd-border border-b px-4 py-3">
										<Search className="mr-3 h-5 w-5 text-fd-muted-foreground" />
										<input
											className="flex-1 bg-transparent text-fd-foreground placeholder:text-fd-muted-foreground focus:outline-none sm:text-sm"
											placeholder="Search documentation..."
											value={query}
											onChange={(e) => setQuery(e.target.value)}
										/>
										<div className="flex items-center gap-1.5 rounded-md border border-fd-border bg-fd-muted px-1.5 py-0.5 font-medium text-[10px] text-fd-muted-foreground">
											<kbd>ESC</kbd>
										</div>
									</div>

									{/* Results Area */}
									<div className="max-h-[60vh] overflow-y-auto p-2">
										{query === "" ? (
											<div className="px-4 py-12 text-center">
												<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-fd-muted">
													<Search className="h-6 w-6 text-fd-muted-foreground" />
												</div>
												<h3 className="mt-4 font-semibold text-fd-foreground">
													Search Reloop Docs
												</h3>
												<p className="mt-1 text-fd-muted-foreground text-sm">
													Search for guides, API references, and quickstarts.
												</p>
											</div>
										) : results.length === 0 ? (
											<div className="px-4 py-12 text-center">
												<p className="text-fd-muted-foreground text-sm">
													No results found for "
													<span className="font-medium text-fd-foreground">
														{query}
													</span>
													"
												</p>
											</div>
										) : (
											<div className="space-y-1">
												{results.map((result, index) => (
													<button
														type="button"
														key={result.url}
														onClick={() => handleSelect(result.url)}
														onPointerEnter={() => setSelectedIndex(index)}
														className={cn(
															"group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
															index === selectedIndex
																? "bg-fd-accent"
																: "hover:bg-fd-accent/50",
														)}
													>
														<div
															className={cn(
																"flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-fd-border bg-fd-background transition-colors",
																index === selectedIndex
																	? "border-fd-foreground/10 bg-fd-background"
																	: "",
															)}
														>
															<FileText
																className={cn(
																	"h-4 w-4 transition-colors",
																	index === selectedIndex
																		? "text-fd-foreground"
																		: "text-fd-muted-foreground",
																)}
															/>
														</div>
														<div className="flex-1 overflow-hidden">
															<div className="flex items-center gap-1.5">
																{result.path.map((p, i) => (
																	<React.Fragment key={i}>
																		<span className="font-medium text-[11px] text-fd-muted-foreground/60 uppercase tracking-wider">
																			{p}
																		</span>
																		<ChevronRight className="h-3 w-3 text-fd-muted-foreground/30" />
																	</React.Fragment>
																))}
															</div>
															<div className="font-medium text-fd-foreground">
																{result.title}
															</div>
														</div>
														<div className="flex h-5 w-5 items-center justify-center rounded border border-fd-border bg-fd-muted font-medium text-[10px] text-fd-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
															↵
														</div>
													</button>
												))}
											</div>
										)}
									</div>

									{/* Footer */}
									<div className="flex items-center justify-between border-fd-border border-t bg-fd-muted/30 px-4 py-2 font-semibold text-[10px] text-fd-muted-foreground uppercase tracking-wider">
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
											<span className="text-fd-foreground">Reloop</span>
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
