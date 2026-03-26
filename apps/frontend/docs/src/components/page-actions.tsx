"use client";
import * as ButtonGroup from "@reloop/ui/button-group";
import * as DropdownMenu from "@reloop/ui/dropdown";
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

	return (
		<ButtonGroup.Root size="xsmall">
			<ButtonGroup.Item
				onClick={onCopy}
				disabled={isLoading}
				className="min-w-9"
			>
				<ButtonGroup.Icon as={checked ? Check : Copy} className="size-3.5" />
			</ButtonGroup.Item>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild>
					<ButtonGroup.Item className="px-1.5">
						<ChevronDown className="size-3.5 text-text-sub-600" />
					</ButtonGroup.Item>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" className="w-[320px]">
					<DropdownMenu.Item
						onClick={onCopy}
						className="flex-col items-start gap-0.5 py-3"
					>
						<div className="flex items-center gap-2 font-medium text-text-strong-950">
							<DropdownMenu.ItemIcon as={Copy} className="size-4" />
							Copy page
						</div>
						<div className="ml-6 text-text-sub-600 text-xs">
							Copy page as Markdown for LLMs
						</div>
					</DropdownMenu.Item>

					<DropdownMenu.Item
						asChild
						className="flex-col items-start gap-0.5 py-3"
					>
						<a href="/llms-full.txt" target="_blank" rel="noreferrer noopener">
							<div className="flex w-full items-center gap-2 font-medium text-text-strong-950">
								<DropdownMenu.ItemIcon as={FileText} className="size-4" />
								llms-full.txt
								<ExternalLinkIcon className="ml-auto size-3 text-text-soft-400" />
							</div>
							<div className="ml-6 text-text-sub-600 text-xs">
								View all docs as Markdown for LLMs
							</div>
						</a>
					</DropdownMenu.Item>

					<DropdownMenu.Item
						onClick={onCopyMCP}
						className="flex-col items-start gap-0.5 py-3"
					>
						<div className="flex w-full items-center gap-2 font-medium text-text-strong-950">
							<DropdownMenu.ItemIcon as={Terminal} className="size-4" />
							{mcpChecked ? "Copied!" : "Copy MCP install command"}
						</div>
						<div className="ml-6 text-text-sub-600 text-xs">
							Copy npx command to install MCP server
						</div>
					</DropdownMenu.Item>

					<DropdownMenu.Item
						asChild
						className="flex-col items-start gap-0.5 py-3"
					>
						<a
							href="https://cursor.com/mcp"
							target="_blank"
							rel="noreferrer noopener"
						>
							<div className="flex w-full items-center gap-2 font-medium text-text-strong-950">
								<DropdownMenu.ItemIcon as={Box} className="size-4" />
								Connect to Cursor
								<ExternalLinkIcon className="ml-auto size-3 text-text-soft-400" />
							</div>
							<div className="ml-6 text-text-sub-600 text-xs">
								Install MCP Server on Cursor
							</div>
						</a>
					</DropdownMenu.Item>

					<DropdownMenu.Item
						asChild
						className="flex-col items-start gap-0.5 py-3"
					>
						<a
							href="vscode://reloop.mcp-server"
							target="_blank"
							rel="noreferrer noopener"
						>
							<div className="flex w-full items-center gap-2 font-medium text-text-strong-950">
								<DropdownMenu.ItemIcon as={Code} className="size-4" />
								Connect to VS Code
								<ExternalLinkIcon className="ml-auto size-3 text-text-soft-400" />
							</div>
							<div className="ml-6 text-text-sub-600 text-xs">
								Install MCP Server on VS Code
							</div>
						</a>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</ButtonGroup.Root>
	);
}
