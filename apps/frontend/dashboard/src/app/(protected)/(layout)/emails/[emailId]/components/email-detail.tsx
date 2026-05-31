"use client";

import { cn } from "@reloop/ui/cn";
import { CodeBlock } from "@reloop/ui/code-block";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as TabMenu from "@reloop/ui/tab-menu-horizontal";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { EmailTimeline } from "./timeline";

interface EmailDetailProps {
	email?: {
		id: string;
		fromEmail: string;
		fromName: string | null;
		toEmails: string[];
		ccEmails: string[] | null;
		bccEmails: string[] | null;
		subject: string;
		textBody: string | null;
		htmlBody: string | null;
		errorMessage: string | null;
		provider: string;
		size: number;
		headers: Record<string, string> | null;
		sentAt: string | null;
		deliveredAt: string | null;
		createdAt: string;
		events?: {
			id: string;
			type: string;
			metadata: Record<string, string>;
			createdAt: string;
		}[];
	};
	isLoading: boolean;
}

function formatHtml(html: string): string {
	if (!html) return "";
	// Clean up by inserting newlines between tags if they aren't there
	const cleanHtml = html.replace(/>\s*</g, ">\n<");
	const lines = cleanHtml.split("\n");
	let indentLevel = 0;
	let formatted = "";
	const tab = "  "; // 2 spaces

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]?.trim();
		if (!line) continue;

		const isClosing = line.startsWith("</");
		const isSelfClosing =
			line.startsWith("<!") ||
			line.startsWith("<?") ||
			line.endsWith("/>") ||
			/^<(img|br|hr|input|meta|link|source|col|embed|area|base|param|track|wbr)/i.test(
				line,
			);

		if (isClosing) {
			indentLevel = Math.max(0, indentLevel - 1);
		}

		formatted += (formatted ? "\n" : "") + tab.repeat(indentLevel) + line;

		if (!isClosing && !isSelfClosing && line.startsWith("<")) {
			const tagMatch = line.match(/^<([a-zA-Z0-9:-]+)/);
			if (tagMatch) {
				const tagName = tagMatch[1];
				const closingTag = `</${tagName}>`;
				if (!line.includes(closingTag)) {
					indentLevel++;
				}
			}
		}
	}

	return formatted;
}

function IframePreview({ html }: { html: string }) {
	const iframeRef = useRef<HTMLIFrameElement>(null);

	useEffect(() => {
		const iframe = iframeRef.current;
		if (!iframe) return;

		let observer: ResizeObserver | null = null;

		const updateHeight = () => {
			if (iframe.contentWindow) {
				try {
					const doc = iframe.contentWindow.document;

					// Force height: auto on html/body inside the iframe to avoid viewport/height constraints
					if (doc.body) {
						doc.body.style.setProperty("height", "auto", "important");
					}
					if (doc.documentElement) {
						doc.documentElement.style.setProperty(
							"height",
							"auto",
							"important",
						);
					}

					// Read height directly from the body's scrollHeight/offsetHeight.
					// Since html and body have height: auto, they wrap the content, and
					// body.scrollHeight/offsetHeight represents the actual content size
					// without needing to collapse the iframe to 0px.
					const height = Math.max(
						doc.body?.scrollHeight || 0,
						doc.body?.offsetHeight || 0,
					);

					if (height > 0) {
						// Add a tiny buffer (4px) to ensure no scrollbars show due to subpixel rendering or margins
						iframe.style.height = `${height + 4}px`;
					}
				} catch (_e) {
					// Ignore cross-origin issues if any
				}
			}
		};

		const handleLoad = () => {
			if (observer) {
				observer.disconnect();
				observer = null;
			}

			updateHeight();

			if (iframe.contentWindow) {
				try {
					const body = iframe.contentWindow.document.body;
					if (body) {
						observer = new ResizeObserver(() => {
							updateHeight();
						});
						observer.observe(body);
					}
				} catch (_e) {
					// Ignore
				}
			}
		};

		// If the iframe document is already loaded
		if (iframe.contentWindow?.document.readyState === "complete") {
			handleLoad();
		}

		iframe.addEventListener("load", handleLoad);

		return () => {
			iframe.removeEventListener("load", handleLoad);
			if (observer) {
				observer.disconnect();
			}
		};
	}, [html]);

	return (
		<iframe
			ref={iframeRef}
			srcDoc={html}
			className="w-full overflow-hidden border-none"
			title="Email Preview"
			sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
		/>
	);
}

function CopyButton({ value, label }: { value: string; label?: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			toast.success(label ? `${label} copied` : "Copied");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Failed to copy");
		}
	}, [value, label]);

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="rounded p-1 text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
			title={`Copy ${label || "value"}`}
		>
			<Icon
				name={copied ? "check" : "copy"}
				className={cn("h-3 w-3", copied && "text-success-base")}
			/>
		</button>
	);
}

export const EmailDetail = ({ email, isLoading }: EmailDetailProps) => {
	const [activeTab, setActiveTab] = useState<string>("preview");
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	useEffect(() => {
		if (email) {
			setActiveTab(email.htmlBody ? "preview" : "plain");
		}
	}, [email]);

	if (isLoading) {
		return (
			<div className="space-y-8">
				<div className="space-y-4">
					<Skeleton className="h-6 w-32" />
					<div className="grid grid-cols-2 gap-8">
						<Skeleton className="h-20 w-full rounded-xl" />
						<Skeleton className="h-20 w-full rounded-xl" />
					</div>
				</div>
				<div className="space-y-4">
					<Skeleton className="h-6 w-32" />
					<Skeleton className="h-64 w-full rounded-xl" />
				</div>
			</div>
		);
	}

	if (!email) return null;

	const tabItems = [
		...(email.htmlBody
			? [
					{ title: "Preview", value: "preview", icon: "mail-single" as const },
					{ title: "Plain Text", value: "plain", icon: "file-text" as const },
					{ title: "HTML Source", value: "html", icon: "code" as const },
				]
			: [
					{
						title: "Plain Text",
						value: "plain",
						icon: "file-text" as const,
					},
				]),
	];

	const activeIndex = tabItems.findIndex((item) => item.value === activeTab);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const currentTab = buttonRefs.current[currentIdx];
	const rect = currentTab?.getBoundingClientRect();

	return (
		<div className="space-y-6">
			{/* Delivery Info - Email Header Style */}
			<section>
				<div className="flex flex-col gap-3.5">
					<div className="flex items-start gap-4">
						<span className="w-16 flex-shrink-0 font-medium text-paragraph-sm text-text-sub-600">
							From
						</span>
						<span className="font-medium text-paragraph-sm text-text-strong-950">
							{email.fromName
								? `${email.fromName} <${email.fromEmail}>`
								: email.fromEmail}
						</span>
					</div>
					<div className="flex items-start gap-4">
						<span className="w-16 flex-shrink-0 font-medium text-paragraph-sm text-text-sub-600">
							To
						</span>
						<span className="font-medium text-paragraph-sm text-text-strong-950">
							{email.toEmails.join(", ")}
						</span>
					</div>
					{email.ccEmails && email.ccEmails.length > 0 && (
						<div className="flex items-start gap-4">
							<span className="w-16 flex-shrink-0 font-medium text-paragraph-sm text-text-sub-600">
								Cc
							</span>
							<span className="font-medium text-paragraph-sm text-text-strong-950">
								{email.ccEmails.join(", ")}
							</span>
						</div>
					)}
					<div className="flex items-start gap-4">
						<span className="w-16 flex-shrink-0 font-medium text-paragraph-sm text-text-sub-600">
							Date
						</span>
						<span className="font-medium text-paragraph-sm text-text-strong-950">
							{new Date(email.createdAt).toLocaleString(undefined, {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
								hour: "2-digit",
								minute: "2-digit",
							})}
						</span>
					</div>
					<div className="flex items-start gap-4">
						<span className="w-16 flex-shrink-0 font-medium text-paragraph-sm text-text-sub-600">
							Subject
						</span>
						<span className="font-medium text-paragraph-sm text-text-strong-950">
							{email.subject}
						</span>
					</div>
				</div>
			</section>

			{/* Event Tracking Timeline */}
			<section className="py-4">
				<EmailTimeline
					events={email.events || []}
					sentAt={email.sentAt || email.createdAt}
					deliveredAt={email.deliveredAt}
				/>
			</section>

			{/* Error Message if failed */}
			{email.errorMessage && (
				<section>
					<h3 className="mb-4 font-medium text-paragraph-sm text-text-strong-950">
						Error Details
					</h3>
					<div className="rounded-xl border border-error-soft-200 bg-error-alpha-10 p-6">
						<p className="whitespace-pre-wrap font-mono text-error-base text-sm">
							{email.errorMessage}
						</p>
					</div>
				</section>
			)}

			{/* Content Preview Tabs */}
			<section>
				<TabMenu.Root value={activeTab} onValueChange={setActiveTab}>
					<TabMenu.List className="relative mb-6 h-10 gap-0 border-b! py-0">
						{tabItems.map((item, index) => (
							<TabMenu.Trigger
								key={item.value}
								value={item.value}
								ref={(el) => {
									if (el) buttonRefs.current[index] = el;
								}}
								onPointerEnter={() => setHoveredIdx(index)}
								onPointerLeave={() => setHoveredIdx(undefined)}
								className={cn(
									"flex cursor-pointer items-center gap-2 px-2.5 py-0! text-sm transition-colors",
									activeTab === item.value
										? "text-text-strong-950"
										: "text-text-sub-600 hover:text-text-strong-950",
								)}
							>
								<Icon name={item.icon} className="h-4 w-4" />
								{item.title}
							</TabMenu.Trigger>
						))}

						<AnimatePresence>
							{rect && activeIndex !== -1 && (
								<motion.div
									className="absolute top-0 left-0 rounded-lg bg-neutral-alpha-10"
									initial={{
										pointerEvents: "none",
										width: rect.width,
										height: rect.height - 20,
										left:
											rect.left -
											(currentTab?.offsetParent?.getBoundingClientRect().left ||
												0),
										top:
											rect.top -
											(currentTab?.offsetParent?.getBoundingClientRect().top ||
												0) +
											10,
										opacity: 0,
									}}
									animate={{
										pointerEvents: "none",
										width: rect.width,
										height: rect.height - 20,
										left:
											rect.left -
											(currentTab?.offsetParent?.getBoundingClientRect().left ||
												0),
										top:
											rect.top -
											(currentTab?.offsetParent?.getBoundingClientRect().top ||
												0) +
											10,
										opacity: 1,
									}}
									exit={{
										pointerEvents: "none",
										opacity: 0,
										width: rect.width,
										height: rect.height - 20,
										left:
											rect.left -
											(currentTab?.offsetParent?.getBoundingClientRect().left ||
												0),
										top:
											rect.top -
											(currentTab?.offsetParent?.getBoundingClientRect().top ||
												0) +
											10,
									}}
									transition={{ duration: 0.14 }}
								/>
							)}
						</AnimatePresence>
					</TabMenu.List>

					<div className="mb-10 overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/50">
						<TabMenu.Content value="preview">
							<div className="bg-white p-6">
								{email.htmlBody && <IframePreview html={email.htmlBody} />}
							</div>
						</TabMenu.Content>

						<TabMenu.Content value="plain">
							<div className="relative">
								<div className="absolute top-4 right-4 z-10">
									{email.textBody && (
										<CopyButton value={email.textBody} label="Plain Text" />
									)}
								</div>
								<pre className="whitespace-pre-wrap bg-bg-weak-50/50 p-6 font-mono text-sm text-text-strong-950">
									{email.textBody || "No text content"}
								</pre>
							</div>
						</TabMenu.Content>

						<TabMenu.Content value="html">
							<div className="relative">
								<div className="absolute top-4 right-4 z-10">
									{email.htmlBody && (
										<CopyButton value={email.htmlBody} label="HTML Source" />
									)}
								</div>
								<div className="bg-bg-weak-50/50">
									{email.htmlBody && (
										<CodeBlock code={formatHtml(email.htmlBody)} lang="html" />
									)}
								</div>
							</div>
						</TabMenu.Content>
					</div>
				</TabMenu.Root>
			</section>

			{/* Headers */}
			{email.headers && Object.keys(email.headers).length > 0 && (
				<section>
					<div className="mb-4 flex items-center justify-between">
						<h3 className="font-medium text-paragraph-sm text-text-strong-950">
							SMTP Headers
						</h3>
						<CopyButton
							value={JSON.stringify(email.headers, null, 2)}
							label="Headers"
						/>
					</div>
					<div className="overflow-auto rounded-xl border border-stroke-soft-100 p-6 dark:border-stroke-soft-100/50">
						<pre className="font-mono text-[11px] text-text-sub-600 leading-relaxed">
							{JSON.stringify(email.headers, null, 2)}
						</pre>
					</div>
				</section>
			)}
		</div>
	);
};
