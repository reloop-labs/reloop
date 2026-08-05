import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useRef, useState } from "react";
import { siCursor } from "simple-icons";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";

const MCP_INSTALL_CMD = "npx @reloop/mcp-server@latest install";
const LLMS_FULL_URL = "https://reloop.sh/llms-full-docs.txt";
const CURSOR_MCP_URL = "https://cursor.com/mcp";
const VSCODE_MCP_URL = "vscode://reloop.mcp-server";

/** VS Code logo (viewBox 0 0 32 32). */
const VSCODE_LOGO_PATH =
	"M30.865 3.448l-6.583-3.167c-0.766-0.37-1.677-0.214-2.276 0.385l-12.609 11.505-5.495-4.167c-0.51-0.391-1.229-0.359-1.703 0.073l-1.76 1.604c-0.583 0.526-0.583 1.443-0.005 1.969l4.766 4.349-4.766 4.349c-0.578 0.526-0.578 1.443 0.005 1.969l1.76 1.604c0.479 0.432 1.193 0.464 1.703 0.073l5.495-4.172 12.615 11.51c0.594 0.599 1.505 0.755 2.271 0.385l6.589-3.172c0.693-0.333 1.13-1.031 1.13-1.802v-21.495c0-0.766-0.443-1.469-1.135-1.802zM24.005 23.266l-9.573-7.266 9.573-7.266z";

type MenuRow =
	| {
			id: string;
			kind: "action";
			title: string;
			description: string;
			icon: "copy" | "terminal";
			onSelect: () => void | Promise<void>;
	  }
	| {
			id: string;
			kind: "link";
			title: string;
			description: string;
			href: string;
			icon: "file-text" | "cursor" | "vscode";
	  };

/**
 * Compact "Copy for AI" control for the language-pills row.
 * Primary click copies the integration prompt; chevron opens LLM / MCP actions
 * (same set as docs page actions).
 */
export function CopyForAiButton({
	prompt,
	className,
}: {
	prompt: string;
	className?: string;
}) {
	const [copied, setCopied] = useState(false);
	const [mcpCopied, setMcpCopied] = useState(false);
	const [open, setOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const itemRefs = useRef<(HTMLButtonElement | HTMLAnchorElement | null)[]>([]);

	const flashCopied = () => {
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1800);
	};

	const handleCopyPrompt = async () => {
		try {
			await navigator.clipboard.writeText(prompt);
			flashCopied();
		} catch {
			// ignore
		}
	};

	const handleCopyMcp = async () => {
		try {
			await navigator.clipboard.writeText(MCP_INSTALL_CMD);
			setMcpCopied(true);
			window.setTimeout(() => setMcpCopied(false), 1800);
		} catch {
			// ignore
		}
	};

	const rows: MenuRow[] = [
		{
			id: "copy-prompt",
			kind: "action",
			title: copied ? "Copied!" : "Copy page",
			description: "Copy page as Markdown for LLMs",
			icon: "copy",
			onSelect: async () => {
				await handleCopyPrompt();
				setOpen(false);
			},
		},
		{
			id: "llms-full",
			kind: "link",
			title: "llms-full.txt",
			description: "View all docs as Markdown for LLMs",
			href: LLMS_FULL_URL,
			icon: "file-text",
		},
		{
			id: "copy-mcp",
			kind: "action",
			title: mcpCopied ? "Copied!" : "Copy MCP install command",
			description: "Copy npx command to install MCP server",
			icon: "terminal",
			onSelect: async () => {
				await handleCopyMcp();
				setOpen(false);
			},
		},
		{
			id: "cursor-mcp",
			kind: "link",
			title: "Connect to Cursor",
			description: "Install MCP Server on Cursor",
			href: CURSOR_MCP_URL,
			icon: "cursor",
		},
		{
			id: "vscode-mcp",
			kind: "link",
			title: "Connect to VS Code",
			description: "Install MCP Server on VS Code",
			href: VSCODE_MCP_URL,
			icon: "vscode",
		},
	];

	const currentTab =
		hoverIdx !== undefined
			? (itemRefs.current[hoverIdx] ?? undefined)
			: undefined;
	const currentRect = currentTab?.getBoundingClientRect();

	return (
		<div className={cn("inline-flex shrink-0 items-center", className)}>
			{/* Primary: copy prompt */}
			<Button.Root
				type="button"
				variant="neutral"
				mode="stroke"
				size="xsmall"
				onClick={() => void handleCopyPrompt()}
				className="gap-1.5 rounded-r-none rounded-l-xl border-r-0"
			>
				{copied ? (
					<>
						<Icon
							name="check-circle"
							className="size-3.5 shrink-0 text-green-600"
						/>
						<span>Copied</span>
					</>
				) : (
					<span>Copy for AI</span>
				)}
			</Button.Root>

			{/* Dropdown: LLM + MCP actions */}
			<Dropdown.Root
				open={open}
				onOpenChange={(next) => {
					setOpen(next);
					if (!next) setHoverIdx(undefined);
				}}
			>
				<Dropdown.Trigger asChild>
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="xsmall"
						className="rounded-r-xl rounded-l-none px-1.5"
						aria-label="More AI and MCP actions"
					>
						<Icon
							name="chevron-down"
							className={cn(
								"size-3.5 transition-transform duration-200",
								open && "rotate-180",
							)}
						/>
					</Button.Root>
				</Dropdown.Trigger>
				<Dropdown.Content
					align="end"
					className="w-[min(320px,calc(100vw-2rem))] rounded-2xl p-1.5 shadow-regular-md"
				>
					<div className="relative">
						{rows.map((row, idx) => {
							const iconBox = (
								<div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 text-text-sub-600 dark:border-stroke-soft-100/50">
									{row.icon === "copy" || row.icon === "terminal" ? (
										<Icon name={row.icon} className="size-4" />
									) : row.icon === "file-text" ? (
										<Icon name="file-text" className="size-4" />
									) : row.icon === "cursor" ? (
										<svg
											viewBox="0 0 24 24"
											className="size-4 shrink-0 fill-current"
											xmlns="http://www.w3.org/2000/svg"
											aria-hidden
										>
											<path d={siCursor.path} />
										</svg>
									) : (
										<svg
											viewBox="0 0 32 32"
											className="size-4 shrink-0 fill-current"
											xmlns="http://www.w3.org/2000/svg"
											aria-hidden
										>
											<path d={VSCODE_LOGO_PATH} />
										</svg>
									)}
								</div>
							);

							const label = (
								<div className="flex min-w-0 flex-col items-start gap-0.5">
									<span className="flex items-center gap-1 font-medium text-sm text-text-strong-950">
										{row.title}
										{row.kind === "link" ? (
											<Icon
												name="arrow-up-right"
												className="size-3 opacity-50"
											/>
										) : null}
									</span>
									<span className="text-text-sub-600 text-xs leading-snug">
										{row.description}
									</span>
								</div>
							);

							const className = cn(
								"relative z-10 flex w-full items-center gap-3 rounded-xl! px-2.5 py-2 text-left transition-colors",
								!currentRect && hoverIdx === idx && "bg-neutral-alpha-10",
							);

							if (row.kind === "link") {
								return (
									<a
										key={row.id}
										href={row.href}
										target="_blank"
										rel="noreferrer noopener"
										ref={(el) => {
											itemRefs.current[idx] = el;
										}}
										onPointerEnter={() => setHoverIdx(idx)}
										onPointerLeave={() => setHoverIdx(undefined)}
										onClick={() => setOpen(false)}
										className={className}
									>
										{iconBox}
										{label}
									</a>
								);
							}

							return (
								<button
									key={row.id}
									type="button"
									ref={(el) => {
										itemRefs.current[idx] = el;
									}}
									onPointerEnter={() => setHoverIdx(idx)}
									onPointerLeave={() => setHoverIdx(undefined)}
									onClick={() => void row.onSelect()}
									className={className}
								>
									{iconBox}
									{label}
								</button>
							);
						})}

						<AnimatedHoverBackground
							rect={currentRect}
							tabElement={currentTab}
							className="rounded-xl"
						/>
					</div>
				</Dropdown.Content>
			</Dropdown.Root>
		</div>
	);
}
