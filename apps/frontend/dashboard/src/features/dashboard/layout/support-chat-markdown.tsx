"use client";

import { cn } from "@reloop/ui/cn";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SupportChatMarkdownProps {
	content: string;
	mine: boolean;
	className?: string;
}

function CodeBlockWithCopy({
	children,
	codeText,
	mine,
}: {
	children: React.ReactNode;
	codeText: string;
	mine: boolean;
}) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(codeText);
		setCopied(true);
		setTimeout(() => setCopied(false), 1800);
	};

	return (
		<div className="group/code relative my-2">
			{codeText ? (
				<button
					type="button"
					onClick={handleCopy}
					aria-label="Copy code"
					className={cn(
						"absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded transition-opacity",
						"opacity-0 group-hover/code:opacity-100 focus:opacity-100",
						mine
							? "bg-white/20 text-white hover:bg-white/30"
							: "bg-bg-white-0/80 text-text-sub-600 shadow-sm hover:bg-bg-white-0 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20",
					)}
				>
					{copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
				</button>
			) : null}
			{children}
		</div>
	);
}

export function SupportChatMarkdown({
	content,
	mine,
	className,
}: SupportChatMarkdownProps) {
	return (
		<div
			className={cn(
				"text-[13px] leading-relaxed break-words",
				mine ? "text-white" : "text-text-strong-950 dark:text-white/90",
				className,
			)}
		>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					p: ({ children }) => (
						<p className="mb-1.5 whitespace-pre-wrap last:mb-0">{children}</p>
					),
					a: ({ href, children }) => (
						<a
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							className={cn(
								"font-medium underline underline-offset-2 transition-colors",
								mine
									? "text-white decoration-white/60 hover:decoration-white"
									: "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",
							)}
						>
							{children}
						</a>
					),
					strong: ({ children }) => (
						<strong className="font-semibold">{children}</strong>
					),
					em: ({ children }) => <em className="italic">{children}</em>,
					ul: ({ children }) => (
						<ul className="my-1.5 list-disc space-y-1 pl-5">{children}</ul>
					),
					ol: ({ children }) => (
						<ol className="my-1.5 list-decimal space-y-1 pl-5">{children}</ol>
					),
					li: ({ children }) => <li className="leading-relaxed">{children}</li>,
					blockquote: ({ children }) => (
						<blockquote
							className={cn(
								"my-2 border-l-2 pl-3 italic",
								mine
									? "border-white/40 text-white/90"
									: "border-stroke-soft-200 text-text-sub-600 dark:border-white/20 dark:text-white/70",
							)}
						>
							{children}
						</blockquote>
					),
					h1: ({ children }) => (
						<h1 className="my-2 font-bold text-[15px]">{children}</h1>
					),
					h2: ({ children }) => (
						<h2 className="my-2 font-semibold text-[14px]">{children}</h2>
					),
					h3: ({ children }) => (
						<h3 className="my-1.5 font-semibold text-[13px]">{children}</h3>
					),
					hr: () => (
						<hr
							className={cn(
								"my-2.5 border-t",
								mine ? "border-white/20" : "border-stroke-soft-200 dark:border-white/10",
							)}
						/>
					),
					table: ({ children }) => (
						<div className="my-2 overflow-x-auto">
							<table className="w-full border-collapse text-left text-[12px]">
								{children}
							</table>
						</div>
					),
					th: ({ children }) => (
						<th
							className={cn(
								"border-b pb-1.5 font-semibold",
								mine ? "border-white/20" : "border-stroke-soft-200 dark:border-white/20",
							)}
						>
							{children}
						</th>
					),
					td: ({ children }) => (
						<td
							className={cn(
								"border-b py-1.5",
								mine ? "border-white/10" : "border-stroke-soft-100 dark:border-white/10",
							)}
						>
							{children}
						</td>
					),
					pre: ({ children, node }) => {
						let rawText = "";
						try {
							const codeNode = node?.children?.[0];
							if (codeNode && "children" in codeNode && Array.isArray(codeNode.children)) {
								rawText = codeNode.children
									.map((c: any) => c.value || "")
									.join("");
							}
						} catch {
							rawText = "";
						}

						return (
							<CodeBlockWithCopy codeText={rawText} mine={mine}>
								<pre
									className={cn(
										"my-1.5 overflow-x-auto rounded-xl p-3 font-mono text-[12px] leading-snug",
										mine
											? "border border-white/15 bg-black/25 text-white selection:bg-white/30"
											: "border border-stroke-soft-200 bg-bg-weak-100 text-text-strong-950 dark:border-white/10 dark:bg-black/40 dark:text-white/90",
									)}
								>
									{children}
								</pre>
							</CodeBlockWithCopy>
						);
					},
					code: ({ className: codeClassName, children, ...props }) => {
						const isInline = !codeClassName && typeof children === "string" && !children.includes("\n");
						if (isInline) {
							return (
								<code
									className={cn(
										"rounded px-1.5 py-0.5 font-mono text-[12px]",
										mine
											? "bg-white/20 text-white"
											: "border border-stroke-soft-200 bg-bg-weak-100 text-text-strong-950 dark:border-white/10 dark:bg-white/[0.08] dark:text-white/90",
									)}
									{...props}
								>
									{children}
								</code>
							);
						}
						return (
							<code className="font-mono text-[12px]" {...props}>
								{children}
							</code>
						);
					},
				}}
			>
				{content}
			</ReactMarkdown>
		</div>
	);
}
