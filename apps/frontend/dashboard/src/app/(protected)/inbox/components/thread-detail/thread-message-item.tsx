"use client";

import {
	getAvatarGradient,
	getAvatarInitial,
} from "@fe/dashboard/utils/avatar";
import * as Avatar from "@reloop/ui/avatar";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useRef, useState } from "react";
import type { AgentMailbox } from "../../types";

dayjs.extend(relativeTime);

const LANGUAGE_NAMES: Record<string, string> = {
	es: "Spanish",
	fr: "French",
	de: "German",
	it: "Italian",
	ja: "Japanese",
	zh: "Chinese",
	pt: "Portuguese",
	ru: "Russian",
	ar: "Arabic",
	hi: "Hindi",
};

interface ThreadMessageItemProps {
	msg: any;
	index: number;
	mailbox: AgentMailbox | undefined;
	thread: any;
	isTranslated: boolean;
	targetLanguage: string;
	translatedHtmlMap: Record<string, string>;
	translatedTextMap: Record<string, string>;
	parsedExpanded: boolean;
	onToggleParsed: () => void;
	onReply: () => void;
	onForward: () => void;
	onDelete: () => void;
	onToggleRead: (isRead: boolean) => void;
	onMarkSpam: (isSpam: boolean) => void;
	onTranslate: () => void;
	onPrint: () => void;
	onDownload: () => void;
	onShowOriginal: () => void;
	onPrototypeAction: (action: string) => void;
	isExpanded: boolean;
	onToggleExpand: () => void;
	onApproveSend?: () => void;
	onEditReply?: () => void;
}

export const ThreadMessageItem = ({
	msg,
	index,
	mailbox,
	thread,
	isTranslated,
	targetLanguage,
	translatedHtmlMap,
	translatedTextMap,
	parsedExpanded,
	onToggleParsed,
	onReply,
	onForward,
	onDelete,
	onToggleRead,
	onMarkSpam,
	onTranslate,
	onPrint,
	onDownload,
	onShowOriginal,
	onPrototypeAction,
	isExpanded,
	onToggleExpand,
	onApproveSend,
	onEditReply,
}: ThreadMessageItemProps) => {
	const isOutbound = msg.direction === "outbound";
	const isApproval = msg.status === "needs_approval";
	const isAgent = msg.direction === "agent" || msg.isAgent;
	const email = msg.email;
	const msgId = msg.id;
	const key = `${msgId}-${targetLanguage}`;

	const bodyHtml = isTranslated
		? translatedHtmlMap[key] || "Translating..."
		: email?.htmlBody;
	const bodyText = isTranslated
		? translatedTextMap[key] || "Translating..."
		: email?.textBody;

	const displayAttachments = (email?.attachments || []).map((att: any) => {
		const name = att.filename || att.name || "Attachment";
		const size =
			typeof att.size === "number"
				? `${(att.size / 1024).toFixed(1)} KB`
				: att.size || "Unknown size";
		return { name, size, ...att };
	});

	// Auto-size iframe to its content
	const [iframeHeight, setIframeHeight] = useState(350);
	const iframeRef = useRef<HTMLIFrameElement>(null);

	const handleIframeLoad = () => {
		const iframe = iframeRef.current;
		if (!iframe) return;
		try {
			const doc = iframe.contentDocument || iframe.contentWindow?.document;
			if (doc?.body) {
				const h = doc.documentElement.scrollHeight || doc.body.scrollHeight;
				setIframeHeight(Math.max(h, 120));
			}
		} catch {
			// sandboxed — rely on postMessage from the inline script instead
		}
	};

	// Listen for height updates posted by the ResizeObserver inside the iframe
	useEffect(() => {
		const handler = (e: MessageEvent) => {
			if (
				e.data?.type === "iframe-height" &&
				typeof e.data.height === "number" &&
				iframeRef.current &&
				e.source === iframeRef.current.contentWindow
			) {
				setIframeHeight(Math.max(e.data.height, 120));
			}
		};
		window.addEventListener("message", handler);
		return () => window.removeEventListener("message", handler);
	}, []);

	const getBadge = () => {
		if (isApproval) {
			return (
				<span className="rounded bg-amber-500/10 px-2 py-0.5 font-bold text-[10px] text-amber-700 dark:text-amber-400 uppercase tracking-wide">
					needs you
				</span>
			);
		}
		if (isOutbound) {
			return (
				<span className="rounded bg-emerald-500/10 px-2 py-0.5 font-bold text-[10px] text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
					via you
				</span>
			);
		}
		if (isAgent) {
			return (
				<span className="rounded bg-blue-500/10 px-2 py-0.5 font-bold text-[10px] text-blue-700 dark:text-blue-400 uppercase tracking-wide">
					via agent
				</span>
			);
		}
		return null;
	};

	const accentColor = isApproval
		? "#f59e0b" // orange
		: isOutbound
			? "#10b981" // green
			: "#3b82f6"; // blue

	const snippet = email?.textBody?.substring(0, 75).replace(/\s+/g, " ") || "";

	return (
		<div className="relative rounded-xl border border-stroke-soft-100 bg-white shadow-sm dark:border-stroke-soft-100/10 dark:bg-neutral-900 overflow-hidden">
			{/* Actor colored side indicator bar */}
			<div
				className="absolute left-0 top-0 bottom-0 w-[4px]"
				style={{ backgroundColor: accentColor }}
			/>

			{!isExpanded ? (
				/* Collapsed View */
				<div
					role="button"
					onClick={onToggleExpand}
					className="flex cursor-pointer select-none items-center justify-between gap-4 px-6 py-4 hover:bg-neutral-50/50 dark:hover:bg-neutral-850/30 transition-colors pl-7"
				>
					<div className="flex min-w-0 items-center gap-3">
						<Avatar.Root size="32" color="gray" className="shrink-0">
							<Avatar.Image asChild>
								<div
									className={cn(
										"flex h-full w-full items-center justify-center rounded-full font-semibold text-[11px] text-white uppercase tracking-wide shadow-sm",
										isOutbound
											? "bg-emerald-600"
											: getAvatarGradient(msg.fromEmail || "default"),
									)}
								>
									{isOutbound
										? "ME"
										: getAvatarInitial(
												msg.fromName ?? null,
												msg.fromEmail || "U",
											)}
								</div>
							</Avatar.Image>
						</Avatar.Root>
						<span className="font-semibold text-label-sm text-text-strong-950 dark:text-white shrink-0">
							{isOutbound
								? "You"
								: isApproval
									? "Agent Draft"
									: msg.fromName ||
										(msg.fromEmail ? msg.fromEmail.split("@")[0] : "Unknown")}
						</span>
						{getBadge()}
						<span className="truncate text-text-soft-400 text-xs font-normal">
							{snippet}
						</span>
					</div>
					<div className="flex shrink-0 items-center gap-2 text-text-soft-400 text-xs font-medium">
						<span>{dayjs(msg.messageAt).format("ddd, MMM D, h:mm A")}</span>
						<Icon name="chevron-down" className="h-4 w-4" />
					</div>
				</div>
			) : (
				/* Expanded View */
				<div className="pl-1">
					{/* Clickable Header */}
					<div
						role="button"
						onClick={onToggleExpand}
						className="flex cursor-pointer select-none items-start justify-between gap-4 px-6 pt-5 pb-4 hover:bg-neutral-50/20 dark:hover:bg-neutral-850/10 transition-colors"
					>
						{/* Left: Avatar + Info */}
						<div
							className="flex min-w-0 items-start gap-3"
							onClick={(e) => {
								if ((e.target as HTMLElement).closest(".group\\/tome")) {
									e.stopPropagation();
								}
							}}
						>
							<div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
								<Avatar.Root size="32" color="gray">
									<Avatar.Image asChild>
										<div
											className={cn(
												"flex h-full w-full items-center justify-center rounded-full font-semibold text-[11px] text-white uppercase tracking-wide shadow-sm",
												isOutbound
													? "bg-emerald-600"
													: getAvatarGradient(msg.fromEmail || "default"),
											)}
										>
											{isOutbound
												? "ME"
												: getAvatarInitial(
														msg.fromName ?? null,
														msg.fromEmail || "U",
													)}
										</div>
									</Avatar.Image>
								</Avatar.Root>
							</div>

							<div className="flex min-w-0 flex-col">
								<div className="flex flex-wrap items-baseline gap-1.5 font-normal">
									<span className="font-semibold text-label-sm text-text-strong-950 dark:text-white">
										{isOutbound
											? "You"
											: isApproval
												? "Agent Draft"
												: msg.fromName ||
													(msg.fromEmail ? msg.fromEmail.split("@")[0] : "Unknown")}
									</span>
									{msg.fromEmail && (
										<span className="font-normal text-text-soft-400 text-xs">
											&lt;{msg.fromEmail}&gt;
										</span>
									)}
									{getBadge()}
								</div>

								{/* To block with hover detail card */}
								<div className="group/tome relative mt-0.5 inline-flex cursor-pointer items-center gap-1 text-text-soft-400 text-xs">
									<span>to {isOutbound ? email?.toEmails?.join(", ") : "me"}</span>
									<Icon name="chevron-down" className="h-3 w-3" />

									<div className="pointer-events-none absolute top-full left-0 z-30 mt-1.5 flex w-80 origin-top-left scale-95 flex-col gap-2 rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-3 text-text-sub-600 opacity-0 shadow-xl transition-all duration-150 group-hover/tome:pointer-events-auto group-hover/tome:scale-100 group-hover/tome:opacity-100 dark:border-stroke-soft-100/30 dark:bg-neutral-900 dark:text-text-sub-400">
										<div className="grid grid-cols-[50px_minmax(0,1fr)] gap-x-2 gap-y-1.5 font-normal text-xs leading-relaxed">
											<span className="text-right font-medium text-text-soft-400">
												from:
											</span>
											<span className="truncate font-semibold text-text-strong-950 dark:text-white">
												{msg.fromName
													? `${msg.fromName} <${msg.fromEmail || ""}>`
													: msg.fromEmail || ""}
											</span>

											<span className="text-right font-medium text-text-soft-400">
												to:
											</span>
											<span className="truncate font-semibold text-text-strong-950 dark:text-white">
												{email?.toEmails?.join(", ") || mailbox?.email || "me"}
											</span>

											{email?.ccEmails && email.ccEmails.length > 0 && (
												<>
													<span className="text-right font-medium text-text-soft-400">
														cc:
													</span>
													<span className="truncate font-semibold text-text-strong-950 dark:text-white">
														{email.ccEmails.join(", ")}
													</span>
												</>
											)}

											<span className="text-right font-medium text-text-soft-400">
												date:
											</span>
											<span className="font-semibold text-text-strong-950 dark:text-white">
												{dayjs(msg.messageAt).format(
													"ddd, MMM D, YYYY [at] h:mm A",
												)}
											</span>

											<span className="text-right font-medium text-text-soft-400">
												subject:
											</span>
											<span className="break-words font-semibold text-text-strong-950 dark:text-white">
												{msg.subject || thread.subject}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Right: Date + Actions + Up Chevron */}
						<div
							className="flex shrink-0 items-center gap-2"
							onClick={(e) => e.stopPropagation()}
						>
							<span className="text-text-soft-400 text-xs">
								{dayjs(msg.messageAt).format("ddd, MMM D, h:mm A")}
							</span>

							<Dropdown.Root>
								<Dropdown.Trigger asChild>
									<button
										type="button"
										className="rounded-lg p-1.5 text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/10"
										title="More actions"
									>
										<svg
											className="h-4 w-4"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<circle cx="12" cy="12" r="1" />
											<circle cx="12" cy="5" r="1" />
											<circle cx="12" cy="19" r="1" />
										</svg>
									</button>
								</Dropdown.Trigger>
								<Dropdown.Content
									align="end"
									className="w-56 rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-1.5 shadow-lg dark:border-stroke-soft-100/30 dark:bg-neutral-900"
								>
									<Dropdown.Item
										onClick={onReply}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<Icon name="reply" className="h-3.5 w-3.5" />
										<span>Reply</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={onForward}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<Icon name="forward" className="h-3.5 w-3.5" />
										<span>Forward</span>
									</Dropdown.Item>

									<div className="my-1 h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />

									<Dropdown.Item
										onClick={onDelete}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-error-base text-xs transition-colors hover:bg-red-50/50 dark:hover:bg-red-950/20"
									>
										<Icon name="trash" className="h-3.5 w-3.5" />
										<span>Delete</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={() => onToggleRead(false)}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<Icon name="mail-send" className="h-3.5 w-3.5" />
										<span>Mark as unread</span>
									</Dropdown.Item>

									<div className="my-1 h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />

									<Dropdown.Item
										onClick={() => onMarkSpam(true)}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<Icon name="cross-circle" className="h-3.5 w-3.5" />
										<span>Report spam</span>
									</Dropdown.Item>

									<div className="my-1 h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />

									<Dropdown.Item
										onClick={onTranslate}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<Icon name="translate" className="h-3.5 w-3.5" />
										<span>Translate message</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={onPrint}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<Icon name="printer" className="h-3.5 w-3.5" />
										<span>Print</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={onDownload}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<Icon name="file-download" className="h-3.5 w-3.5" />
										<span>Download message</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={onShowOriginal}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<Icon name="code" className="h-3.5 w-3.5" />
										<span>Show original</span>
									</Dropdown.Item>
								</Dropdown.Content>
							</Dropdown.Root>

							<button
								type="button"
								onClick={onToggleExpand}
								className="rounded-lg p-1 text-text-soft-400 hover:bg-neutral-100 hover:text-text-strong-950 dark:hover:bg-zinc-800"
							>
								<Icon name="chevron-up" className="h-4 w-4" />
							</button>
						</div>
					</div>

					{/* Draft held warning banner inside the card body */}
					{isApproval && (
						<div className="mx-6 mb-4 flex items-center gap-2.5 rounded-xl border border-amber-250 bg-amber-50/70 px-4 py-3 font-semibold text-amber-800 text-xs dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400">
							<svg
								className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth="2.2"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
								/>
							</svg>
							<span>
								Draft prepared by agent
								<span className="mx-1.5 font-normal opacity-50">·</span>
								held for your approval before sending
							</span>
						</div>
					)}

					{/* Message Body */}
					<div className="relative px-6 pt-0 pb-4">
						{bodyHtml ? (
							<div className="overflow-hidden rounded-xl border border-stroke-soft-100/50">
								<iframe
									ref={iframeRef}
									onLoad={handleIframeLoad}
									srcDoc={`
										<!DOCTYPE html>
										<html>
										<head>
											<meta charset="utf-8">
											<style>
												* { box-sizing: border-box; }
												html, body {
													overflow: hidden;
												}
												body {
													font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
													font-size: 14px;
													line-height: 1.5;
													color: #1c1917;
													margin: 0;
													padding: 16px;
													background-color: #ffffff;
												}
												img { max-width: 100%; height: auto; }
											</style>
										</head>
										<body>
											${
												isTranslated
													? `<div style="background:#fef08a;color:#854d0e;padding:8px 12px;margin-bottom:12px;border-radius:6px;font-size:12px;font-weight:500;font-family:sans-serif;">Dynamic ${LANGUAGE_NAMES[targetLanguage] || targetLanguage} Translation</div>`
													: ""
											}
											${bodyHtml}
											<script>
												(function() {
													function sendHeight() {
														var h = document.documentElement.scrollHeight || document.body.scrollHeight;
														window.parent.postMessage({ type: 'iframe-height', height: h }, '*');
													}
													window.addEventListener('load', sendHeight);
													if (typeof ResizeObserver !== 'undefined') {
														new ResizeObserver(sendHeight).observe(document.body);
													}
												})();
											</script>
										</body>
										</html>
									`}
									sandbox="allow-popups allow-popups-to-escape-sandbox allow-scripts"
									style={{ height: iframeHeight }}
									className="w-full border-0 bg-white transition-[height] duration-150"
									title="Email HTML body"
								/>
							</div>
						) : (
							<div className="flex flex-col gap-3">
								{isTranslated && (
									<div className="rounded-lg bg-yellow-50 px-3 py-2 font-medium text-[12px] text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-200">
										Dynamic {LANGUAGE_NAMES[targetLanguage] || targetLanguage}{" "}
										Translation
									</div>
								)}
								<p className="whitespace-pre-wrap text-label-sm text-text-strong-950 leading-relaxed dark:text-neutral-350">
									{bodyText}
								</p>
							</div>
						)}
					</div>

					{/* Draft Action Controls inline inside the card */}
					{isApproval && (onApproveSend || onEditReply) && (
						<div className="mx-6 mb-5 flex items-center gap-3 border-t border-stroke-soft-100/60 pt-4 dark:border-stroke-soft-100/10">
							<button
								type="button"
								onClick={onApproveSend}
								className="flex items-center gap-2 rounded-xl bg-text-strong-950 px-4 py-2.5 font-semibold text-white text-xs shadow-sm transition-all hover:opacity-85 dark:bg-white dark:text-neutral-900"
							>
								<Icon name="send" className="h-3.5 w-3.5" />
								<span>Approve &amp; send</span>
							</button>

							<button
								type="button"
								onClick={onEditReply}
								className="flex items-center gap-2 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-4 py-2.5 font-semibold text-text-sub-600 text-xs transition-all hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-stroke-soft-100/30 dark:bg-neutral-800/20"
							>
								<Icon name="edit" className="h-3.5 w-3.5" />
								<span>Edit reply</span>
							</button>

							<button
								type="button"
								onClick={onForward}
								className="flex items-center gap-2 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-4 py-2.5 font-semibold text-text-sub-600 text-xs transition-all hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-stroke-soft-100/30 dark:bg-neutral-800/20"
							>
								<Icon name="forward" className="h-3.5 w-3.5" />
								<span>Forward</span>
							</button>
						</div>
					)}

					{/* Attachments */}
					{displayAttachments.length > 0 && (
						<div className="border-stroke-soft-100 border-t px-6 py-4 dark:border-stroke-soft-100/10">
							<h3 className="mb-3 font-medium text-label-sm text-text-sub-600">
								Attachments
							</h3>
							<ul className="flex flex-col gap-2">
								{displayAttachments.map((file: any) => (
									<li key={file.name}>
										<button
											type="button"
											onClick={() => onPrototypeAction(`Download ${file.name}`)}
											className="flex w-full items-center gap-3 rounded-lg border border-stroke-soft-100 px-3 py-2 text-left transition-colors hover:bg-bg-weak-50 dark:border-stroke-soft-100/10"
										>
											<Icon
												name="file"
												className="h-4 w-4 shrink-0 text-text-sub-600"
											/>
											<div className="min-w-0 flex-1">
												<p className="truncate text-label-sm text-text-strong-950 dark:text-neutral-300">
													{file.name}
												</p>
												<p className="text-label-xs text-text-soft-400">
													{file.size}
												</p>
											</div>
											<Icon
												name="file-download"
												className="h-4 w-4 text-text-soft-400"
											/>
										</button>
									</li>
								))}
							</ul>
						</div>
					)}

					{/* Parsed Metadata */}
					{msg.parsed && Object.keys(msg.parsed).length > 0 && (
						<div className="border-stroke-soft-100 border-t px-6 py-4 dark:border-stroke-soft-100/10">
							<button
								type="button"
								onClick={onToggleParsed}
								className="mb-3 flex w-full items-center justify-between text-left"
							>
								<span className="font-medium text-label-sm text-text-sub-600">
									Parsed data
								</span>
								<Icon
									name="chevron-down"
									className={cn(
										"h-4 w-4 text-text-sub-600 transition-transform",
										parsedExpanded && "rotate-180",
									)}
								/>
							</button>
							{parsedExpanded && (
								<div className="flex flex-col gap-2 rounded-lg border border-stroke-soft-100 bg-bg-weak-50/50 p-3 dark:border-stroke-soft-100/10 dark:bg-bg-weak-50/20">
									{Object.entries(msg.parsed).map(([k, v]) => (
										<div
											key={k}
											className="grid grid-cols-[minmax(0,120px)_1fr] gap-2 text-label-sm"
										>
											<span className="font-medium text-text-soft-400 capitalize">
												{k.replace(/([A-Z])/g, " $1").trim()}
											</span>
											<span className="break-words text-text-strong-950 dark:text-neutral-350">
												{typeof v === "object"
													? JSON.stringify(v)
													: String(v)}
											</span>
										</div>
									))}
								</div>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

