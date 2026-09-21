"use client";

import * as Checkbox from "@reloop/ui/checkbox";
import { cn } from "@reloop/ui/cn";
import { CodeBlock } from "@reloop/ui/code-block";
import {
	BrandLanguageIcon,
	type CopyCodeBlockIcon,
} from "@reloop/ui/copy-code-block";
import { Icon } from "@reloop/ui/icon";
import { JAVA_ICON } from "@reloop/ui/icons/java";
import { motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
	siAxios,
	siCurl,
	siDotnet,
	siGo,
	siJavascript,
	siNodedotjs,
	siPhp,
	siPython,
	siRuby,
	siRust,
	siTypescript,
} from "simple-icons";
import {
	type ApiSnippet,
	type ApiStatusCode,
	apiResponseSamples,
	apiResponseSchemas,
	apiStatusCodes,
} from "../content";

const SNIPPET_LANG: Record<string, string> = {
	curl: "bash",
	javascript: "javascript",
	typescript: "typescript",
	node: "javascript",
	nodejs: "javascript",
	axios: "javascript",
	python: "python",
	go: "go",
	java: "java",
	csharp: "csharp",
	php: "php",
	ruby: "ruby",
	rust: "rust",
};

const SNIPPET_ICON: Record<string, CopyCodeBlockIcon> = {
	curl: siCurl,
	javascript: siJavascript,
	typescript: siTypescript,
	node: siNodedotjs,
	nodejs: siNodedotjs,
	axios: siAxios,
	python: siPython,
	go: siGo,
	java: JAVA_ICON,
	csharp: siDotnet,
	php: siPhp,
	ruby: siRuby,
	// Pure black is invisible on dark UI — lift it to Rust orange.
	rust: { ...siRust, hex: "e24d2b" },
};

function LangMark({ id, className }: { id: string; className?: string }) {
	const icon = SNIPPET_ICON[id];
	const cls = className ?? "size-[18px]";
	if (!icon) {
		return <Icon name="terminal" className={cls} />;
	}
	return <BrandLanguageIcon icon={icon} className={cn("shrink-0", cls)} />;
}

function useCopy(value: string) {
	const [copied, setCopied] = useState(false);
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Clipboard may be unavailable outside a secure context.
		}
	};
	return { copied, copy };
}

export function AnimatedCopyIcon({
	copied,
	className,
}: {
	copied: boolean;
	className?: string;
}) {
	const iconClass = className ?? "size-3.5";
	return (
		<span className="relative flex size-4 items-center justify-center">
			<motion.span
				className="pointer-events-none absolute inset-0 flex items-center justify-center"
				initial={false}
				animate={{ scale: copied ? 0 : 1, opacity: copied ? 0 : 1 }}
				transition={{ duration: 0.18, ease: "easeInOut" }}
			>
				<Icon name="copy" className={iconClass} />
			</motion.span>
			<motion.span
				className="pointer-events-none absolute inset-0 flex items-center justify-center"
				initial={false}
				animate={{ scale: copied ? 1 : 0, opacity: copied ? 1 : 0 }}
				transition={{ duration: 0.18, ease: "easeInOut" }}
			>
				<svg
					viewBox="0 0 20 20"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className="size-6 text-primary-base"
					aria-hidden
				>
					<circle
						cx="10"
						cy="10"
						r="8"
						fill="currentColor"
						fillOpacity="0.08"
					/>
					<path
						d="M7 10.5L9 12.5L13 7.5"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="1.5"
					/>
				</svg>
			</motion.span>
		</span>
	);
}

function CardShell({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"overflow-hidden rounded-[16px] border border-black/[0.06] bg-bg-white-0 p-1 dark:border-white/[0.06] dark:bg-[#0c0c0c]",
				className,
			)}
		>
			{children}
		</div>
	);
}

export function RequestCard({
	snippets,
	activeId,
	onChange,
}: {
	snippets: [ApiSnippet, ...ApiSnippet[]];
	activeId: string;
	onChange: (id: string) => void;
}) {
	const [open, setOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement | null>(null);
	const menuListRef = useRef<HTMLDivElement | null>(null);
	const triggerRef = useRef<HTMLButtonElement | null>(null);
	const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(
		null,
	);
	const active = snippets.find((s) => s.id === activeId) ?? snippets[0];
	const lang = SNIPPET_LANG[active.id] ?? "bash";
	const { copied, copy } = useCopy(active.code);

	useEffect(() => {
		if (!open) return;
		const onDown = (e: PointerEvent) => {
			const target = e.target as Node;
			if (
				menuRef.current &&
				!menuRef.current.contains(target) &&
				menuListRef.current &&
				!menuListRef.current.contains(target)
			) {
				setOpen(false);
			}
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("pointerdown", onDown);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("pointerdown", onDown);
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);

	useEffect(() => {
		if (!open) {
			setMenuPos(null);
			return;
		}
		const update = () => {
			const el = triggerRef.current;
			if (!el) return;
			const rect = el.getBoundingClientRect();
			setMenuPos({
				top: rect.bottom + 6,
				right: window.innerWidth - rect.right,
			});
		};
		update();
		window.addEventListener("resize", update);
		window.addEventListener("scroll", update, true);
		return () => {
			window.removeEventListener("resize", update);
			window.removeEventListener("scroll", update, true);
		};
	}, [open]);

	const activeLabel = active.label;

	return (
		<CardShell>
			<div className="flex h-[46px] items-center justify-between gap-3 rounded-xl border border-black/[0.05] bg-[#fafafa] px-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
				<h2 className="font-semibold text-[12px] text-text-strong-950 tracking-tight dark:text-white">
					Request
				</h2>
				<div className="flex items-center gap-1.5">
					<div ref={menuRef} className="relative">
						<button
							ref={triggerRef}
							type="button"
							onClick={() => setOpen((v) => !v)}
							aria-label={`Request language ${activeLabel}`}
							aria-haspopup="listbox"
							aria-expanded={open}
							className={cn(
								"flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 font-medium text-[12px] text-text-strong-950 transition-colors hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4a9eff] dark:text-white dark:hover:bg-white/10",
								open && "ring-2 ring-[#4a9eff]",
							)}
						>
							<LangMark id={active.id} className="size-[18px]" />
							{activeLabel}
							<Icon
								name="chevron-down"
								className={cn(
									"size-3 text-text-sub-600 transition-transform dark:text-white/50",
									open && "rotate-180",
								)}
							/>
						</button>
						{open && menuPos
							? createPortal(
									<div
										ref={menuListRef}
										role="listbox"
										style={{ top: menuPos.top, right: menuPos.right }}
										className="fixed z-50 max-h-72 w-52 overflow-y-auto rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-1.5 shadow-lg dark:border-white/10 dark:bg-[#141414]"
									>
										<div className="flex flex-col gap-0.5">
											{snippets.map((s) => {
												const isActive = s.id === active.id;
												return (
													<button
														key={s.id}
														type="button"
														role="option"
														aria-selected={isActive}
														aria-label={`Request language ${s.label}`}
														onClick={() => {
															onChange(s.id);
															setOpen(false);
														}}
														className={cn(
															"flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left font-medium text-[12px] transition-colors",
															isActive
																? "bg-black/[0.06] font-medium text-text-strong-950 dark:bg-white/10 dark:text-white"
																: "text-text-strong-950 hover:bg-black/[0.04] dark:text-white/80 dark:hover:bg-white/5",
														)}
													>
														<LangMark id={s.id} className="size-4" />
														<span className="flex-1">{s.label}</span>
													</button>
												);
											})}
										</div>
									</div>,
									document.body,
								)
							: null}
					</div>
				</div>
			</div>
			{/* biome-ignore lint/a11y/useSemanticElements: mirrors reference docs markup (focusable code region) */}
			<div
				className="relative px-1 pt-1 pb-2"
				role="region"
				aria-label="Code snippet"
				// biome-ignore lint/a11y/noNoninteractiveTabindex: mirrors reference docs markup (focusable code region)
				tabIndex={0}
			>
				<div className="absolute top-4 right-4">
					<button
						type="button"
						onClick={copy}
						aria-label={copied ? "Copied" : "Copy code"}
						className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-black/[0.04] hover:text-text-strong-950 dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<AnimatedCopyIcon copied={copied} className="size-[13px]" />
					</button>
				</div>
				<CodeBlock
					key={active.id}
					code={active.code}
					lang={lang}
					hideLineNumbers
					className="!text-[12px] ![line-height:1.6]"
				/>
			</div>
		</CardShell>
	);
}

export function ResponseCard() {
	const schemaCheckboxId = useId();
	const [status, setStatus] = useState<ApiStatusCode>("200");
	const [showSchema, setShowSchema] = useState(false);
	const code = showSchema
		? apiResponseSchemas[status]
		: apiResponseSamples[status];
	const { copied, copy } = useCopy(code);

	return (
		<CardShell>
			<div className="rounded-xl border border-black/[0.05] bg-[#fafafa] px-4 pt-3.5 pb-3 dark:border-white/[0.08] dark:bg-white/[0.03]">
				<div className="flex items-center justify-between gap-3">
					<span className="font-semibold text-[12px] text-text-strong-950 tracking-tight dark:text-white">
						Sample Response
					</span>
					<button
						type="button"
						onClick={copy}
						aria-label={copied ? "Copied" : "Copy response"}
						className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-black/[0.04] hover:text-text-strong-950 dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<AnimatedCopyIcon copied={copied} className="size-3.5" />
					</button>
				</div>
				<div className="mt-2.5 flex items-center justify-between gap-3">
					<div
						role="tablist"
						aria-label="Response status"
						className="flex items-center gap-1.5"
					>
						{apiStatusCodes.map((code) => {
							const isActive = code === status;
							return (
								<button
									key={code}
									type="button"
									role="tab"
									aria-selected={isActive}
									onClick={() => setStatus(code)}
									className={cn(
										"cursor-pointer rounded-lg border px-2.5 py-1 font-medium font-mono text-[12px] transition-colors",
										isActive
											? "border-transparent bg-neutral-200/90 text-text-strong-950 dark:bg-white/15 dark:text-white"
											: "border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 hover:text-text-strong-950 dark:border-white/10 dark:bg-transparent dark:text-white/50 dark:hover:text-white",
									)}
								>
									{code}
								</button>
							);
						})}
					</div>
					<label
						htmlFor={schemaCheckboxId}
						className="flex cursor-pointer items-center gap-2 text-[12px] text-text-sub-600 dark:text-white/60"
					>
						<span className="font-medium">Schema</span>
						<Checkbox.Root
							id={schemaCheckboxId}
							checked={showSchema}
							onCheckedChange={(checked) => setShowSchema(checked === true)}
							aria-label="Show response schema"
						/>
					</label>
				</div>
			</div>
			<div className="px-1 pt-1 pb-2">
				<CodeBlock
					key={`${status}-${showSchema ? "schema" : "example"}`}
					code={code}
					lang="json"
					hideLineNumbers
					className="!text-[12px] ![line-height:1.6]"
				/>
			</div>
		</CardShell>
	);
}
