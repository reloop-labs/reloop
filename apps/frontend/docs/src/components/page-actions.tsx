"use client";
import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
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
import { useState } from "react";

const cache = new Map<string, string>();

export function PageActions({
	/**
	 * A URL to fetch the raw Markdown/MDX content of page
	 */
	markdownUrl,
}: {
	markdownUrl: string;
}) {
	const [isLoading, setLoading] = useState(false);

	const [checked, onCopy] = useCopyButton(async () => {
		const cached = cache.get(markdownUrl);
		if (cached) return navigator.clipboard.writeText(cached);

		setLoading(true);
		try {
			const res = await fetch(markdownUrl);
			const content = await res.text();
			cache.set(markdownUrl, content);
			await navigator.clipboard.writeText(content);
		} finally {
			setLoading(false);
		}
	});

	const [mcpChecked, onCopyMCP] = useCopyButton(async () => {
		await navigator.clipboard.writeText(
			"npx @reloop/mcp-server@latest install",
		);
	});

	const [isOpen, setOpen] = useState(false);

	return (
		<div className="relative flex items-center rounded-xl border text-sm">
			<button
				type="button"
				onClick={onCopy}
				disabled={isLoading}
				className="flex h-8 min-w-9 items-center justify-center rounded-l-xl px-2 transition-colors hover:bg-fd-accent/30"
			>
				{checked ? (
					<Check className="size-3.5" />
				) : (
					<Copy className="size-3.5" />
				)}
			</button>
			<div className="h-4 w-px border-border border-l" />
			<div className="relative">
				<button
					type="button"
					onClick={() => setOpen(!isOpen)}
					className="flex h-8 items-center justify-center rounded-r-lg px-2.5 transition-colors hover:bg-fd-accent/30"
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
						<div className="absolute top-full right-0 z-50 mt-1 w-[320px] rounded-2xl border bg-fd-popover p-1 shadow-lg">
							<button
								type="button"
								onClick={(e) => {
									onCopy(e);
									setOpen(false);
								}}
								className="flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-3 text-left transition-colors hover:bg-fd-accent/30"
							>
								<div className="flex items-center gap-2 font-medium text-text-strong-950">
									<Copy className="size-4" />
									Copy page
								</div>
								<div className="ml-6 text-fd-muted-foreground text-text-sub-600 text-xs">
									Copy page as Markdown for LLMs
								</div>
							</button>

							<a
								href="/llms-full.txt"
								target="_blank"
								rel="noreferrer noopener"
								className="flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-3 transition-colors hover:bg-fd-accent/30"
							>
								<div className="flex w-full items-center gap-2 font-medium text-text-strong-950">
									<FileText className="size-4" />
									llms-full.txt
									<ExternalLinkIcon className="ml-auto size-3 text-text-soft-400" />
								</div>
								<div className="ml-6 text-fd-muted-foreground text-text-sub-600 text-xs">
									View all docs as Markdown for LLMs
								</div>
							</a>

							<button
								type="button"
								onClick={(e) => {
									onCopyMCP(e);
									setOpen(false);
								}}
								className="flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-3 text-left transition-colors hover:bg-fd-accent/30"
							>
								<div className="flex w-full items-center gap-2 font-medium text-text-strong-950">
									<Terminal className="size-4" />
									{mcpChecked ? "Copied!" : "Copy MCP install command"}
								</div>
								<div className="ml-6 text-fd-muted-foreground text-text-sub-600 text-xs">
									Copy npx command to install MCP server
								</div>
							</button>

							<a
								href="https://cursor.com/mcp"
								target="_blank"
								rel="noreferrer noopener"
								className="flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-3 transition-colors hover:bg-fd-accent/30"
							>
								<div className="flex w-full items-center gap-2 font-medium text-text-strong-950">
									<Box className="size-4" />
									Connect to Cursor
									<ExternalLinkIcon className="ml-auto size-3 text-text-soft-400" />
								</div>
								<div className="ml-6 text-fd-muted-foreground text-text-sub-600 text-xs">
									Install MCP Server on Cursor
								</div>
							</a>

							<a
								href="vscode://reloop.mcp-server"
								target="_blank"
								rel="noreferrer noopener"
								className="flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-3 transition-colors hover:bg-fd-accent/30"
							>
								<div className="flex w-full items-center gap-2 font-medium text-text-strong-950">
									<Code className="size-4" />
									Connect to VS Code
									<ExternalLinkIcon className="ml-auto size-3 text-text-soft-400" />
								</div>
								<div className="ml-6 text-fd-muted-foreground text-text-sub-600 text-xs">
									Install MCP Server on VS Code
								</div>
							</a>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
