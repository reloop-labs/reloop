"use client";

import {
	Box,
	Check,
	ChevronDown,
	Code,
	Copy,
	ExternalLinkIcon,
	FileText,
	Terminal,
} from "lucide-react";
import { useRef, useState } from "react";
import { siAnthropic } from "simple-icons";

const cache = new Map<string, string>();

export function PageActions({
	/**
	 * A URL to fetch the raw Markdown/MDX content of page
	 */
	markdownUrl,
	rawContent,
}: {
	markdownUrl?: string;
	rawContent?: string;
}) {
	const [isLoading, setLoading] = useState(false);

	const [checked, setChecked] = useState(false);
	const [mcpChecked, setMcpChecked] = useState(false);

	const onCopy = async () => {
		if (rawContent) {
			await navigator.clipboard.writeText(rawContent);
			setChecked(true);
			setTimeout(() => setChecked(false), 2000);
			return;
		}
		if (!markdownUrl) return;
		const cached = cache.get(markdownUrl);
		if (cached) {
			await navigator.clipboard.writeText(cached);
		} else {
			setLoading(true);
			try {
				const res = await fetch(markdownUrl);
				if (!res.ok) {
					throw new Error(`Failed to fetch markdown: ${res.status}`);
				}
				const content = await res.text();
				cache.set(markdownUrl, content);
				await navigator.clipboard.writeText(content);
			} catch (error) {
				console.error("Copy failed:", error);
				return; // Don't show success if it failed
			} finally {
				setLoading(false);
			}
		}
		setChecked(true);
		setTimeout(() => setChecked(false), 2000);
	};

	const onCopyMCP = async () => {
		await navigator.clipboard.writeText(
			"npx @reloop/mcp-server@latest install",
		);
		setMcpChecked(true);
		setTimeout(() => setMcpChecked(false), 2000);
	};

	const [isOpen, setOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const itemRefs = useRef<(HTMLButtonElement | HTMLAnchorElement | null)[]>([]);

	const activeItem = hoverIdx !== undefined ? itemRefs.current[hoverIdx] : null;
	const left = activeItem?.offsetLeft ?? 0;
	const top = activeItem?.offsetTop ?? 0;
	const width = activeItem?.offsetWidth ?? 0;
	const height = activeItem?.offsetHeight ?? 0;

	return (
		<div className="relative flex items-center rounded-xl border border-stroke-soft-100 text-sm">
			<button
				type="button"
				onClick={() => onCopy()}
				disabled={isLoading}
				className="flex h-8 items-center gap-2 rounded-l-xl px-3 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
			>
				{isLoading ? (
					<div className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
				) : checked ? (
					<Check className="size-3.5" />
				) : (
					<Copy className="size-3.5" />
				)}
				<span className="font-medium text-[#171717] dark:text-white">
					{isLoading ? "Copying..." : checked ? "Copied!" : "Copy page"}
				</span>
			</button>
			<div className="h-4 w-px border-stroke-soft-100 border-l" />
			<div className="relative">
				<button
					type="button"
					onClick={() => setOpen(!isOpen)}
					className="flex h-8 w-8 items-center justify-center rounded-r-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5"
				>
					<ChevronDown
						className={`size-3.5 text-text-sub-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
					/>
				</button>

				{isOpen && (
					<>
						{/* Overlay to close on outside click */}
						<div
							className="fixed inset-0 z-40"
							onClick={() => setOpen(false)}
						/>
						<div className="absolute top-full right-0 z-50 mt-1 w-[340px] rounded-2xl border border-stroke-soft-100 bg-bg-white-0 p-1.5 shadow-lg dark:bg-[#0a0a0a]">
							{hoverIdx !== undefined && activeItem && (
								<div
									className="pointer-events-none absolute rounded-xl bg-bg-soft-100 transition-all duration-200 ease-out dark:bg-white/5"
									style={{
										width,
										height,
										transform: `translate3d(${left}px, ${top}px, 0)`,
										opacity: 1,
									}}
								/>
							)}

							<button
								type="button"
								ref={(el) => {
									itemRefs.current[0] = el;
								}}
								onPointerEnter={() => setHoverIdx(0)}
								onPointerLeave={() => setHoverIdx(undefined)}
								onClick={() => {
									onCopy();
									setOpen(false);
								}}
								className="relative z-10 flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors"
							>
								<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 text-text-sub-600">
									<Copy className="size-4.5" />
								</div>
								<div className="flex flex-col items-start gap-0.5">
									<span className="font-medium text-[#171717] dark:text-white">
										Copy page
									</span>
									<span className="text-text-sub-600 text-xs">
										Copy page as Markdown for LLMs
									</span>
								</div>
							</button>

							<a
								href="https://chat.openai.com"
								target="_blank"
								rel="noreferrer noopener"
								ref={(el) => {
									itemRefs.current[1] = el;
								}}
								onPointerEnter={() => setHoverIdx(1)}
								onPointerLeave={() => setHoverIdx(undefined)}
								className="relative z-10 flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors"
							>
								<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 text-text-sub-600">
									<svg
										viewBox="0 0 24 24"
										className="h-4.5 w-4.5 fill-current"
										xmlns="http://www.w3.org/2000/svg"
									>
										<title>OpenAI</title>
										<path d="M21.55 10.004a5.416 5.416 0 00-.478-4.501c-1.217-2.09-3.662-3.166-6.05-2.66A5.59 5.59 0 0010.831 1C8.39.995 6.224 2.546 5.473 4.838A5.553 5.553 0 001.76 7.496a5.487 5.487 0 00.691 6.5 5.416 5.416 0 00.477 4.502c1.217 2.09 3.662 3.165 6.05 2.66A5.586 5.586 0 0013.168 23c2.443.006 4.61-1.546 5.361-3.84a5.553 5.553 0 003.715-2.66 5.488 5.488 0 00-.693-6.497v.001zm-8.381 11.558a4.199 4.199 0 01-2.675-.954c.034-.018.093-.05.132-.074l4.44-2.53a.71.71 0 00.364-.623v-6.176l1.877 1.069c.02.01.033.029.036.05v5.115c-.003 2.274-1.870-4.118-4.174 4.123zM4.192 17.78a4.059 4.059 0 01-.498-2.763c.032.02.09.055.131.078l4.44 2.53c.225.13.504.13.73 0l5.42-3.088v2.138a.068.068 0 01-.027.057L9.9 19.288c-1.999 1.136-4.552.46-5.707-1.51h-.001zM3.023 8.216A4.15 4.15 0 015.198 6.41l-.002.151v5.06a.711.711 0 00.364.624l5.42 3.087-1.876 1.07a.067.067 0 01-.063.005l-4.489-2.559c-1.995-1.14-2.679-3.658-1.53-5.63h.001zm15.417 3.54l-5.42-3.088L14.896 7.6a.067.067 0 01.063-.006l4.489 2.557c1.998 1.14 2.683 3.662 1.529 5.633a4.163 4.163 0 01-2.174 1.807V12.38a.71.71 0 00-.363-.623zm1.867-2.773a6.04 6.04 0 00-.132-.078l-4.44-2.53a.731.731 0 00-.729 0l-5.42 3.088V7.325a.068.068 0 01.027-.057L14.1 4.713c2-1.137 4.555-.46 5.707 1.513.487.833.664 1.809.499 2.757h.001zm-11.741 3.81l-1.877-1.068a.065.065 0 01-.036-.051V6.559c.001-2.277 1.873-4.122 4.181-4.12.976 0 1.92.338 2.671.954-.034.018-.092.05-.131.073l-4.44 2.53a.71.71 0 00-.365.623l-.003 6.173v.002zm1.02-2.168L12 9.25l2.414 1.375v2.75L12 14.75l-2.415-1.375v-2.75z" />
									</svg>
								</div>
								<div className="flex flex-col items-start gap-0.5">
									<span className="flex items-center gap-1 font-medium text-[#171717] dark:text-white">
										Open in ChatGPT{" "}
										<ExternalLinkIcon className="size-3 opacity-50" />
									</span>
									<span className="text-text-sub-600 text-xs">
										Ask questions about this page
									</span>
								</div>
							</a>

							<a
								href="https://claude.ai"
								target="_blank"
								rel="noreferrer noopener"
								ref={(el) => {
									itemRefs.current[2] = el;
								}}
								onPointerEnter={() => setHoverIdx(2)}
								onPointerLeave={() => setHoverIdx(undefined)}
								className="relative z-10 flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors"
							>
								<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 text-text-sub-600">
									<svg
										role="img"
										viewBox="0 0 24 24"
										className="h-4.5 w-4.5 fill-current"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path d={siAnthropic.path} />
									</svg>
								</div>
								<div className="flex flex-col items-start gap-0.5">
									<span className="flex items-center gap-1 font-medium text-[#171717] dark:text-white">
										Open in Claude{" "}
										<ExternalLinkIcon className="size-3 opacity-50" />
									</span>
									<span className="text-text-sub-600 text-xs">
										Ask questions about this page
									</span>
								</div>
							</a>

							<button
								type="button"
								ref={(el) => {
									itemRefs.current[3] = el;
								}}
								onPointerEnter={() => setHoverIdx(3)}
								onPointerLeave={() => setHoverIdx(undefined)}
								onClick={() => {
									onCopyMCP();
									setOpen(false);
								}}
								className="relative z-10 flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors"
							>
								<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 text-text-sub-600">
									<Terminal className="size-4.5" />
								</div>
								<div className="flex flex-col items-start gap-0.5">
									<span className="font-medium text-[#171717] dark:text-white">
										{mcpChecked ? "Copied!" : "Copy MCP install command"}
									</span>
									<span className="text-text-sub-600 text-xs">
										Copy npx command to install MCP server
									</span>
								</div>
							</button>

							<a
								href="https://cursor.com/mcp"
								target="_blank"
								rel="noreferrer noopener"
								ref={(el) => {
									itemRefs.current[4] = el;
								}}
								onPointerEnter={() => setHoverIdx(4)}
								onPointerLeave={() => setHoverIdx(undefined)}
								className="relative z-10 flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors"
							>
								<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 text-text-sub-600">
									<Box className="size-4.5" />
								</div>
								<div className="flex flex-col items-start gap-0.5">
									<span className="flex items-center gap-1 font-medium text-[#171717] dark:text-white">
										Connect to Cursor{" "}
										<ExternalLinkIcon className="size-3 opacity-50" />
									</span>
									<span className="text-text-sub-600 text-xs">
										Install MCP Server on Cursor
									</span>
								</div>
							</a>

							<a
								href="vscode://reloop.mcp-server"
								target="_blank"
								rel="noreferrer noopener"
								ref={(el) => {
									itemRefs.current[5] = el;
								}}
								onPointerEnter={() => setHoverIdx(5)}
								onPointerLeave={() => setHoverIdx(undefined)}
								className="relative z-10 flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors"
							>
								<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 text-text-sub-600">
									<Code className="size-4.5" />
								</div>
								<div className="flex flex-col items-start gap-0.5">
									<span className="flex items-center gap-1 font-medium text-[#171717] dark:text-white">
										Connect to VS Code{" "}
										<ExternalLinkIcon className="size-3 opacity-50" />
									</span>
									<span className="text-text-sub-600 text-xs">
										Install MCP Server on VS Code
									</span>
								</div>
							</a>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
