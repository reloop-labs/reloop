"use client";

import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { AgentMailbox } from "../../mock-data";

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
}: ThreadMessageItemProps) => {
	const isOutbound = msg.direction === "outbound";
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

	return (
		<div
			className={cn(
				"flex flex-col border-stroke-soft-100/50 border-b pb-6 dark:border-stroke-soft-100/10",
				index > 0 && "pt-6",
			)}
		>
			{/* Sender Meta Row */}
			<div className="flex items-start justify-between gap-4 px-6 pb-2">
				{/* Left: Avatar + Info */}
				<div className="flex min-w-0 items-start gap-3">
					<div
						className={cn(
							"flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-semibold text-sm transition-all duration-300",
							isOutbound
								? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
								: "border-primary-base/20 bg-primary-base/10 text-primary-base",
						)}
					>
						{isOutbound
							? "Me"
							: msg.fromName
								? msg.fromName.charAt(0).toUpperCase()
								: msg.fromEmail
									? msg.fromEmail.charAt(0).toUpperCase()
									: "?"}
					</div>

					<div className="flex min-w-0 flex-col">
						<div className="flex flex-wrap items-baseline gap-1.5">
							<span className="font-semibold text-label-sm text-text-strong-950 dark:text-white">
								{isOutbound
									? "You"
									: msg.fromName ||
										(msg.fromEmail
											? msg.fromEmail.split("@")[0]
											: "Unknown")}
							</span>
							{msg.fromEmail && (
								<span className="font-normal text-text-soft-400 text-xs">
									&lt;{msg.fromEmail}&gt;
								</span>
							)}
							{isOutbound && (
								<span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-medium text-[10px] text-emerald-600 dark:text-emerald-400">
									Sent
								</span>
							)}
							{!isOutbound && (
								<button
									type="button"
									onClick={() => onPrototypeAction("Unsubscribe")}
									className="ml-1 font-medium text-primary-base text-xs hover:underline"
								>
									Unsubscribe
								</button>
							)}
						</div>

						{/* To block with hover detail card */}
						<div className="group/tome relative mt-0.5 inline-flex cursor-pointer items-center gap-1 text-text-soft-400 text-xs">
							<span>
								to {isOutbound ? email?.toEmails?.join(", ") : "me"}
							</span>
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
										{email?.toEmails?.join(", ") ||
											mailbox?.email ||
											"me"}
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

				{/* Right: Date + Action Icons */}
				<div className="flex shrink-0 items-center gap-2">
					<span className="text-text-soft-400 text-xs">
						{dayjs(msg.messageAt).format("ddd, MMM D, h:mm A")} (
						{dayjs(msg.messageAt).fromNow()})
					</span>

					{!isOutbound && (
						<div className="flex items-center gap-0.5 text-text-soft-400">
							<button
								type="button"
								onClick={() => onPrototypeAction("Star message")}
								className="rounded-lg p-1.5 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/10"
								title="Star message"
							>
								<svg
									className="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
								>
									<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
								</svg>
							</button>

							<button
								type="button"
								onClick={onReply}
								className="rounded-lg p-1.5 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/10"
								title="Reply"
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
									<polyline points="9 17 4 12 9 7" />
									<path d="M20 18v-2a4 4 0 0 0-4-4H4" />
								</svg>
							</button>

							<Dropdown.Root>
								<Dropdown.Trigger asChild>
									<button
										type="button"
										className="rounded-lg p-1.5 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/10"
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
										<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
											<polyline points="9 17 4 12 9 7" />
											<path d="M20 18v-2a4 4 0 0 0-4-4H4" />
										</svg>
										<span>Reply</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={onForward}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
											<polyline points="15 17 20 12 15 7" />
											<path d="M4 18v-2a4 4 0 0 1 4-4h12" />
										</svg>
										<span>Forward</span>
									</Dropdown.Item>

									<div className="my-1 h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />

									<Dropdown.Item
										onClick={onDelete}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-error-base text-xs transition-colors hover:bg-red-50/50 dark:hover:bg-red-950/20"
									>
										<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
											<polyline points="3 6 5 6 21 6" />
											<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
											<line x1="10" y1="11" x2="10" y2="17" />
											<line x1="14" y1="11" x2="14" y2="17" />
										</svg>
										<span>Delete</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={() => onToggleRead(false)}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
											<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
											<polyline points="22,6 12,13 2,6" />
										</svg>
										<span>Mark as unread</span>
									</Dropdown.Item>

									<div className="my-1 h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />

									<Dropdown.Item
										onClick={() => onMarkSpam(true)}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
											<polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
											<line x1="12" y1="8" x2="12" y2="12" />
											<line x1="12" y1="16" x2="12.01" y2="16" />
										</svg>
										<span>Report spam</span>
									</Dropdown.Item>

									<div className="my-1 h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />

									<Dropdown.Item
										onClick={onTranslate}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
											<circle cx="12" cy="12" r="10" />
											<line x1="2" y1="12" x2="22" y2="12" />
											<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
										</svg>
										<span>Translate message</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={onPrint}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
											<polyline points="6 9 6 2 18 2 18 9" />
											<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
											<rect x="6" y="14" width="12" height="8" />
										</svg>
										<span>Print</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={onDownload}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
											<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
											<polyline points="7 10 12 15 17 10" />
											<line x1="12" y1="15" x2="12" y2="3" />
										</svg>
										<span>Download message</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={onShowOriginal}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
											<polyline points="16 18 22 12 16 6" />
											<polyline points="8 6 2 12 8 18" />
										</svg>
										<span>Show original</span>
									</Dropdown.Item>
								</Dropdown.Content>
							</Dropdown.Root>
						</div>
					)}
				</div>
			</div>

			{/* Message Body */}
			<div className="relative px-6 pt-0 pb-4">
				{bodyHtml ? (
					<div className="overflow-hidden rounded-xl border border-stroke-soft-100 dark:border-stroke-soft-100/30">
						<iframe
							srcDoc={`
								<!DOCTYPE html>
								<html>
								<head>
									<meta charset="utf-8">
									<style>
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
								</body>
								</html>
							`}
							sandbox="allow-popups allow-popups-to-escape-sandbox"
							className="min-h-[350px] w-full border-0 bg-white"
							title="Email HTML body"
						/>
					</div>
				) : (
					<div className="flex flex-col gap-3">
						{isTranslated && (
							<div className="rounded-lg bg-yellow-50 px-3 py-2 font-medium text-[12px] text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-200">
								Dynamic {LANGUAGE_NAMES[targetLanguage] || targetLanguage} Translation
							</div>
						)}
						<p className="whitespace-pre-wrap text-label-sm text-text-strong-950 leading-relaxed dark:text-neutral-300">
							{bodyText}
						</p>
					</div>
				)}
			</div>

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
									onClick={() =>
										onPrototypeAction(`Download ${file.name}`)
									}
									className="flex w-full items-center gap-3 rounded-lg border border-stroke-soft-100 px-3 py-2 text-left transition-colors hover:bg-bg-weak-50 dark:border-stroke-soft-100/10"
								>
									<Icon
										name="file-text"
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
									<span className="break-words text-text-strong-950 dark:text-neutral-300">
										{typeof v === "object" ? JSON.stringify(v) : String(v)}
									</span>
								</div>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
};
