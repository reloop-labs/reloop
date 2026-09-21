"use client";

import { cn } from "@reloop/ui/cn";
import { CodeBlock } from "@reloop/ui/code-block";
import { Icon } from "@reloop/ui/icon";
import { useEffect, useRef, useState } from "react";
import {
	type ApiSnippet,
	type ApiStatusCode,
	apiResponseSamples,
	apiResponseSchemas,
	apiStatusCodes,
} from "../content";

const SNIPPET_LANG: Record<string, string> = {
	curl: "bash",
	node: "javascript",
	python: "python",
	go: "go",
};

const DEVICON_SRC: Record<string, string> = {
	node: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg",
	python:
		"https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg",
	go: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/go/go-original.svg",
};

function LangMark({ id, className }: { id: string; className?: string }) {
	const src = DEVICON_SRC[id];
	const cls = className ?? "size-4";
	if (!src) {
		return <Icon name="terminal" className={cls} />;
	}
	return (
		<img
			src={src}
			alt=""
			aria-hidden
			loading="lazy"
			className={cls}
			draggable={false}
		/>
	);
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
				"overflow-hidden rounded-[16px] border border-black/[0.06] bg-bg-white-0 p-1.5 dark:border-white/[0.06] dark:bg-[#0c0c0c]",
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
	const active = snippets.find((s) => s.id === activeId) ?? snippets[0];
	const lang = SNIPPET_LANG[active.id] ?? "bash";
	const { copied, copy } = useCopy(active.code);

	useEffect(() => {
		if (!open) return;
		const onDown = (e: PointerEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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

	const activeLabel = active.id === "node" ? "JavaScript" : active.label;

	return (
		<CardShell>
			<div className="flex h-[46px] items-center justify-between gap-3 rounded-xl border border-black/[0.05] bg-[#fafafa] px-4 dark:border-white/[0.08] dark:bg-white/[0.03]">
				<h2 className="font-semibold text-[12px] text-text-strong-950 tracking-tight dark:text-white">
					Request
				</h2>
				<div className="flex items-center gap-1.5">
					<div ref={menuRef} className="relative">
						<button
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
						{open ? (
							<div
								role="listbox"
								className="absolute right-0 z-20 mt-1.5 w-52 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-1.5 shadow-lg dark:border-white/10 dark:bg-[#141414]"
							>
								{snippets.map((s) => {
									const isActive = s.id === active.id;
									const label = s.id === "node" ? "JavaScript" : s.label;
									return (
										<button
											key={s.id}
											type="button"
											role="option"
											aria-selected={isActive}
											aria-label={`Request language ${label}`}
											onClick={() => {
												onChange(s.id);
												setOpen(false);
											}}
											className={cn(
												"flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[14px] transition-colors",
												isActive
													? "bg-black/[0.06] font-medium text-text-strong-950 dark:bg-white/10 dark:text-white"
													: "text-text-strong-950 hover:bg-black/[0.04] dark:text-white/80 dark:hover:bg-white/5",
											)}
										>
											<LangMark id={s.id} className="size-[18px]" />
											<span className="flex-1">{label}</span>
										</button>
									);
								})}
							</div>
						) : null}
					</div>
				</div>
			</div>
			{/* biome-ignore lint/a11y/useSemanticElements: mirrors reference docs markup (focusable code region) */}
			<div
				className="relative px-2 pt-2 pb-3"
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
						<Icon name={copied ? "check" : "copy"} className="size-[13px]" />
					</button>
				</div>
				<CodeBlock
					key={active.id}
					code={active.code}
					lang={lang}
					hideLineNumbers
					codeExtraPadding
					className="!text-[13.5px] ![line-height:1.75] sm:!text-[14px]"
				/>
			</div>
		</CardShell>
	);
}

export function ResponseCard() {
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
					<span className="font-semibold text-[16px] text-text-strong-950 tracking-tight dark:text-white">
						Sample Response
					</span>
					<button
						type="button"
						onClick={copy}
						aria-label={copied ? "Copied" : "Copy response"}
						className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-text-sub-600 transition-colors hover:bg-black/[0.04] hover:text-text-strong-950 dark:text-white/55 dark:hover:bg-white/10 dark:hover:text-white"
					>
						<Icon name={copied ? "check" : "copy"} className="size-3.5" />
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
					<button
						type="button"
						role="switch"
						aria-checked={showSchema}
						onClick={() => setShowSchema((v) => !v)}
						className="flex cursor-pointer items-center gap-2 text-[13px] text-text-sub-600 dark:text-white/60"
					>
						<span className="font-medium">Schema</span>
						<span
							aria-hidden
							className={cn(
								"flex h-5 w-9 items-center rounded-full border p-0.5 transition-colors",
								showSchema
									? "justify-end border-transparent bg-text-strong-950 dark:bg-white"
									: "justify-start border-stroke-soft-100 bg-bg-white-0 dark:border-white/15 dark:bg-white/10",
							)}
						>
							<span
								className={cn(
									"size-3.5 rounded-full transition-colors",
									showSchema
										? "bg-bg-white-0 dark:bg-black"
										: "bg-neutral-300 dark:bg-white/40",
								)}
							/>
						</span>
					</button>
				</div>
			</div>
			<div className="px-2 pt-2 pb-3">
				<CodeBlock
					key={`${status}-${showSchema ? "schema" : "example"}`}
					code={code}
					lang="json"
					hideLineNumbers
					codeExtraPadding
					className="!text-[13.5px] ![line-height:1.75] sm:!text-[14px]"
				/>
			</div>
		</CardShell>
	);
}
