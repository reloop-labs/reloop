"use client";

import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import type { AgentMailbox, InboundThread } from "../mock-data";
import { useAgentInbox } from "./agent-inbox-provider";

dayjs.extend(relativeTime);

interface ThreadDetailProps {
	thread: InboundThread | null;
	mailbox: AgentMailbox | undefined;
	onBack?: () => void;
	showBack?: boolean;
}

const _MetaRow = ({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) => (
	<div className="flex gap-2 text-label-sm">
		<span className="w-16 shrink-0 text-text-soft-400">{label}</span>
		<span className="min-w-0 text-text-sub-600">{children}</span>
	</div>
);

const SectionTitle = ({ children }: { children: ReactNode }) => (
	<h3 className="mb-3 font-medium text-label-sm text-text-sub-600">
		{children}
	</h3>
);

const translateText = async (
	text: string,
	targetLang: string,
): Promise<string> => {
	if (text.length < 1800) {
		const res = await fetch(
			`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`,
		);
		if (!res.ok) throw new Error("Translation failed");
		const data = await res.json();
		return data[0].map((x: any) => x[0]).join("");
	}
	const chunks = text.match(/.{1,1500}/g) || [text];
	const results = await Promise.all(
		chunks.map(async (chunk) => {
			try {
				const res = await fetch(
					`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(chunk)}`,
				);
				if (!res.ok) return chunk;
				const data = await res.json();
				return data[0].map((x: any) => x[0]).join("");
			} catch {
				return chunk;
			}
		}),
	);
	return results.join("");
};

export const ThreadDetail = ({
	thread,
	mailbox,
	onBack,
	showBack,
}: ThreadDetailProps) => {
	const [parsedExpanded, setParsedExpanded] = useState(true);
	const { deleteMessage, markMessageRead, markMessageSpam, sendReply } =
		useAgentInbox();
	const [rawHeadersExpanded, setRawHeadersExpanded] = useState(false);
	const [isTranslated, setIsTranslated] = useState(false);
	const [translatedHtmlMap, setTranslatedHtmlMap] = useState<
		Record<string, string>
	>({});
	const [translatedTextMap, setTranslatedTextMap] = useState<
		Record<string, string>
	>({});
	const [targetLanguage, setTargetLanguage] = useState("es");
	const [isTranslating, setIsTranslating] = useState(false);
	const [showReplyComposer, setShowReplyComposer] = useState(false);
	const [replyBody, setReplyBody] = useState("");

	const { data: threadData, mutate: mutateThread } = useSWR<any>(
		thread?.threadId ? `/api/inbox/v1/threads/${thread.threadId}` : null,
	);

	useEffect(() => {
		setIsTranslated(false);
		setTranslatedHtmlMap({});
		setTranslatedTextMap({});
		setTargetLanguage("es");
		setIsTranslating(false);
		setShowReplyComposer(false);
		setReplyBody("");
	}, [thread?.id]);

	if (!thread) {
		return (
			<div className="flex min-h-[500px] flex-col items-center justify-center gap-1 p-8 text-center">
				<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
					<Icon name="inbox" className="h-5 w-5 text-text-sub-600" />
				</div>
				<h3 className="font-semibold text-base text-text-strong-950">
					Select a message to inspect
				</h3>
				<p className="mx-auto max-w-sm text-balance font-medium text-[12px] text-text-sub-600">
					Click any message on the left to review parsing, timeline, and
					approval actions.
				</p>
				<div className="mt-4 flex items-center gap-1.5 text-text-soft-400 text-xs">
					<Icon name="arrow-left" className="h-3.5 w-3.5" />
					<span className="font-medium">Pick a message to get started</span>
				</div>
			</div>
		);
	}

	const handlePrototypeAction = (action: string) => {
		toast.info(`${action} — prototype only`);
	};

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this message?")) return;
		try {
			await deleteMessage(thread.id);
			toast.success("Message deleted");
			if (onBack) onBack();
		} catch (err: any) {
			toast.error(err.message || "Failed to delete message");
		}
	};

	const handleToggleRead = async (isRead: boolean) => {
		try {
			await markMessageRead(thread.id, isRead);
			toast.success(isRead ? "Marked as Handled" : "Marked as Active");
		} catch (err: any) {
			toast.error(err.message || "Failed to update status");
		}
	};

	const handleMarkSpam = async (isSpam: boolean) => {
		try {
			await markMessageSpam(thread.id, isSpam);
			toast.success(isSpam ? "Marked as Spam" : "Marked as Not Spam");
		} catch (err: any) {
			toast.error(err.message || "Failed to mark as spam");
		}
	};

	const displayMessages = useMemo(() => {
		if (!thread) return [];
		if (!threadData?.messages || threadData.messages.length === 0) {
			return [
				{
					id: thread.id,
					direction: "inbound",
					fromEmail: thread.from.email,
					fromName: thread.from.name || null,
					messageAt: thread.receivedAt,
					subject: thread.subject,
					email: {
						id: thread.id,
						fromEmail: thread.from.email,
						toEmails: [mailbox?.email || ""],
						subject: thread.subject,
						textBody: thread.bodyText,
						htmlBody: thread.bodyHtml,
						attachments: thread.attachments || [],
						createdAt: thread.receivedAt,
					},
					parsed: thread.parsed,
				},
			];
		}

		const sorted = [...threadData.messages].sort(
			(a, b) =>
				new Date(a.messageAt).getTime() - new Date(b.messageAt).getTime(),
		);

		return sorted.map((msg) => {
			if (msg.inboundEmailId === thread.id || msg.id === thread.id) {
				return {
					...msg,
					parsed: thread.parsed || msg.parsed,
				};
			}
			return msg;
		});
	}, [threadData, thread, mailbox]);

	const handleDownload = () => {
		try {
			const element = document.createElement("a");
			const messagesHtml = displayMessages
				.map((msg) => {
					const body = msg.email?.htmlBody || msg.email?.textBody || "";
					return `
					<div style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
						<strong>From:</strong> ${msg.fromName ? `${msg.fromName} <${msg.fromEmail}>` : msg.fromEmail}<br>
						<strong>Date:</strong> ${msg.messageAt}<br><br>
						${body}
					</div>
				`;
				})
				.join("");

			const file = new Blob(
				[
					`
				<html>
				<head><title>${thread.subject}</title></head>
				<body style="font-family: sans-serif; padding: 20px;">
					<h2>${thread.subject}</h2>
					${messagesHtml}
				</body>
				</html>
			`,
				],
				{
					type: "text/html",
				},
			);
			element.href = URL.createObjectURL(file);
			element.download = `${thread.subject.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.html`;
			document.body.appendChild(element);
			element.click();
			document.body.removeChild(element);
			toast.success("Message downloaded successfully");
		} catch (err) {
			toast.error("Failed to download message");
		}
	};

	const handlePrint = () => {
		try {
			const printWindow = window.open("", "_blank");
			if (printWindow) {
				const messagesHtml = displayMessages
					.map((msg) => {
						const msgKey = `${msg.id}-${targetLanguage}`;
						const body = isTranslated
							? translatedHtmlMap[msgKey] || translatedTextMap[msgKey] || ""
							: msg.email?.htmlBody || msg.email?.textBody || "";
						const formattedBody =
							body.includes("<body") || body.includes("<html")
								? body
								: `<pre style="white-space: pre-wrap;">${body}</pre>`;
						return `
						<div style="margin-bottom: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px;">
							<div style="font-weight: bold; font-size: 14px;">${msg.fromName ? `${msg.fromName} &lt;${msg.fromEmail}&gt;` : msg.fromEmail}</div>
							<div style="font-size: 12px; color: #4b5563; margin-bottom: 10px;">
								Date: ${dayjs(msg.messageAt).format("ddd, MMM D, YYYY [at] h:mm A")}
							</div>
							<div>${formattedBody}</div>
						</div>
					`;
					})
					.join("");

				printWindow.document.write(`
					<!DOCTYPE html>
					<html>
					<head>
						<title>${thread.subject}</title>
						<style>
							body {
								font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
								font-size: 14px;
								line-height: 1.5;
								color: #1c1917;
								padding: 20px;
							}
							hr {
								border: 0;
								border-top: 1px solid #e5e7eb;
								margin: 20px 0;
							}
						</style>
					</head>
					<body>
						<h1 style="font-size: 20px; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">${thread.subject}</h1>
						${messagesHtml}
						<script>
							window.onload = function() {
								setTimeout(function() {
									window.print();
									window.close();
								}, 300);
							};
						</script>
					</body>
					</html>
				`);
				printWindow.document.close();
			} else {
				window.print();
			}
		} catch (err) {
			window.print();
		}
	};

	const handleReply = () => {
		setShowReplyComposer(true);
	};

	const handleSendReply = async () => {
		if (!replyBody.trim()) return;
		const replyPromise = sendReply(thread.id, replyBody.trim());
		toast.promise(replyPromise, {
			loading: "Sending reply...",
			success: () => {
				setReplyBody("");
				setShowReplyComposer(false);
				if (thread.threadId) {
					mutateThread();
				}
				return `Reply sent to ${thread.from.email} successfully`;
			},
			error: (err) => {
				return err instanceof Error ? err.message : "Failed to send reply";
			},
		});
	};

	const handleForward = () => {
		toast.info("Forward message — Composer prototype only");
	};

	const handleBlock = () => {
		toast.success(`Blocked sender ${thread.from.email}`);
	};

	const performTranslation = async (
		msgId: string,
		textBody: string,
		htmlBody: string | undefined,
		lang: string,
	) => {
		const key = `${msgId}-${lang}`;
		if (htmlBody && !translatedHtmlMap[key]) {
			setIsTranslating(true);
			try {
				const parser = new DOMParser();
				const doc = parser.parseFromString(htmlBody, "text/html");

				const textNodes: Node[] = [];
				const walk = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null);
				let node;
				while ((node = walk.nextNode())) {
					if (node.nodeValue?.trim()) {
						textNodes.push(node);
					}
				}

				await Promise.all(
					textNodes.map(async (n) => {
						if (n.nodeValue) {
							try {
								const t = await translateText(n.nodeValue.trim(), lang);
								n.nodeValue = t;
							} catch {
								// ignore
							}
						}
					}),
				);

				setTranslatedHtmlMap((prev) => ({
					...prev,
					[key]: doc.body.innerHTML,
				}));
				toast.success("Translated email dynamically");
			} catch (err) {
				toast.error("Failed to translate dynamically");
			} finally {
				setIsTranslating(false);
			}
		}

		if (textBody && !translatedTextMap[key]) {
			setIsTranslating(true);
			try {
				const t = await translateText(textBody, lang);
				setTranslatedTextMap((prev) => ({
					...prev,
					[key]: t,
				}));
				toast.success("Translated email dynamically");
			} catch (err) {
				toast.error("Failed to translate dynamically");
			} finally {
				setIsTranslating(false);
			}
		}
	};

	const handleTranslate = async () => {
		if (isTranslated) {
			setIsTranslated(false);
			return;
		}

		setIsTranslated(true);
		await Promise.all(
			displayMessages.map((msg) =>
				performTranslation(
					msg.id,
					msg.email?.textBody || "",
					msg.email?.htmlBody,
					targetLanguage,
				),
			),
		);
	};

	const handleLanguageChange = async (lang: string) => {
		setTargetLanguage(lang);
		await Promise.all(
			displayMessages.map((msg) =>
				performTranslation(
					msg.id,
					msg.email?.textBody || "",
					msg.email?.htmlBody,
					lang,
				),
			),
		);
	};

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

	const translatedHtml = translatedHtmlMap[targetLanguage];
	const translatedText = translatedTextMap[targetLanguage];

	return (
		<div className="flex h-full min-h-0 flex-col">
			<div className="min-h-0 flex-1 overflow-y-auto">
				{/* Subject Header */}
				<div className="border-stroke-soft-100 border-b px-6 py-5 dark:border-stroke-soft-100/40">
					<h1 className="flex items-center gap-2 font-medium text-text-strong-950 text-xl">
						{thread.subject}
					</h1>
				</div>

				{/* Sender Meta Row */}
				<div className="flex items-start justify-between gap-4 px-6 pt-4 pb-2">
					{/* Left side: Avatar + Sender Info */}
					<div className="flex min-w-0 items-start gap-3">
						{/* Avatar Circle */}
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary-base/20 bg-primary-base/10 font-semibold text-primary-base text-sm">
							{thread.from.name
								? thread.from.name.charAt(0).toUpperCase()
								: thread.from.email.charAt(0).toUpperCase() || "?"}
						</div>

						<div className="flex min-w-0 flex-col">
							{/* Name <email> and Unsubscribe */}
							<div className="flex flex-wrap items-baseline gap-1.5">
								<span className="font-semibold text-label-sm text-text-strong-950">
									{thread.from.name || thread.from.email.split("@")[0]}
								</span>
								<span className="font-normal text-text-soft-400 text-xs">
									&lt;{thread.from.email}&gt;
								</span>
								<button
									type="button"
									onClick={() => handlePrototypeAction("Unsubscribe")}
									className="ml-1 font-medium text-primary-base text-xs hover:underline"
								>
									Unsubscribe
								</button>
							</div>

							{/* To block with hover details */}
							<div className="group/tome relative mt-0.5 inline-flex cursor-pointer items-center gap-1 text-text-soft-400 text-xs">
								<span>to me</span>
								<Icon name="chevron-down" className="h-3 w-3" />

								{/* Hover Detail Card */}
								<div className="pointer-events-none absolute top-full left-0 z-30 mt-1.5 flex w-80 origin-top-left scale-95 flex-col gap-2 rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-3 text-text-sub-600 opacity-0 shadow-xl transition-all duration-150 group-hover/tome:pointer-events-auto group-hover/tome:scale-100 group-hover/tome:opacity-100 dark:border-stroke-soft-100/30 dark:bg-neutral-900 dark:text-text-sub-400">
									<div className="grid grid-cols-[50px_minmax(0,1fr)] gap-x-2 gap-y-1.5 font-normal text-xs leading-relaxed">
										<span className="text-right text-text-soft-400">from:</span>
										<span className="truncate font-medium text-text-strong-950 dark:text-white">
											{thread.from.name
												? `${thread.from.name} <${thread.from.email}>`
												: thread.from.email}
										</span>

										<span className="text-right text-text-soft-400">to:</span>
										<span className="truncate font-medium text-text-strong-950 dark:text-white">
											{mailbox?.email || "me"}
										</span>

										<span className="text-right text-text-soft-400">date:</span>
										<span className="font-medium text-text-strong-950 dark:text-white">
											{dayjs(thread.receivedAt).format(
												"ddd, MMM D, YYYY [at] h:mm A",
											)}
										</span>

										<span className="text-right text-text-soft-400">
											subject:
										</span>
										<span className="break-words font-medium text-text-strong-950 dark:text-white">
											{thread.subject}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Right side: Date + Action Icons */}
					<div className="flex shrink-0 items-center gap-2">
						<span className="text-text-soft-400 text-xs">
							{dayjs(thread.receivedAt).format("ddd, MMM D, h:mm A")} (
							{dayjs(thread.receivedAt).fromNow()})
						</span>

						<div className="flex items-center gap-0.5 text-text-soft-400">
							<button
								type="button"
								onClick={() => handlePrototypeAction("Star message")}
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
								onClick={handleReply}
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
										onClick={handleReply}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<svg
											className="h-3.5 w-3.5"
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
										<span>Reply</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={handleForward}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<svg
											className="h-3.5 w-3.5"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<polyline points="15 17 20 12 15 7" />
											<path d="M4 18v-2a4 4 0 0 1 4-4h12" />
										</svg>
										<span>Forward</span>
									</Dropdown.Item>

									<div className="my-1 h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />

									<Dropdown.Item
										onClick={handleDelete}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-error-base text-xs transition-colors hover:bg-red-50/50 dark:hover:bg-red-950/20"
									>
										<svg
											className="h-3.5 w-3.5"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<polyline points="3 6 5 6 21 6" />
											<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
											<line x1="10" y1="11" x2="10" y2="17" />
											<line x1="14" y1="11" x2="14" y2="17" />
										</svg>
										<span>Delete</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={() => handleToggleRead(false)}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<svg
											className="h-3.5 w-3.5"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
											<polyline points="22,6 12,13 2,6" />
										</svg>
										<span>Mark as unread</span>
									</Dropdown.Item>

									<div className="my-1 h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />

									<Dropdown.Item
										onClick={handleBlock}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<svg
											className="h-3.5 w-3.5"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<circle cx="12" cy="12" r="10" />
											<line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
										</svg>
										<span className="truncate">
											Block "
											{thread.from.name || thread.from.email.split("@")[0]}"
										</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={() => handleMarkSpam(true)}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<svg
											className="h-3.5 w-3.5"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
											<line x1="12" y1="8" x2="12" y2="12" />
											<line x1="12" y1="16" x2="12.01" y2="16" />
										</svg>
										<span>Report spam</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={() => handleMarkSpam(true)}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<svg
											className="h-3.5 w-3.5"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
											<line x1="12" y1="8" x2="12" y2="12" />
											<line x1="12" y1="16" x2="12.01" y2="16" />
										</svg>
										<span>Report phishing</span>
									</Dropdown.Item>

									<div className="my-1 h-px bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />

									<Dropdown.Item
										onClick={() =>
											handlePrototypeAction("Filter messages like this")
										}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<svg
											className="h-3.5 w-3.5"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<line x1="4" y1="21" x2="4" y2="14" />
											<line x1="4" y1="10" x2="4" y2="3" />
											<line x1="12" y1="21" x2="12" y2="12" />
											<line x1="12" y1="8" x2="12" y2="3" />
											<line x1="20" y1="21" x2="20" y2="16" />
											<line x1="20" y1="12" x2="20" y2="3" />
											<line x1="1" y1="14" x2="7" y2="14" />
											<line x1="9" y1="8" x2="15" y2="8" />
											<line x1="17" y1="16" x2="23" y2="16" />
										</svg>
										<span>Filter messages</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={handleTranslate}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<svg
											className="h-3.5 w-3.5"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<circle cx="12" cy="12" r="10" />
											<line x1="2" y1="12" x2="22" y2="12" />
											<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
										</svg>
										<span>Translate message</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={handlePrint}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<svg
											className="h-3.5 w-3.5"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<polyline points="6 9 6 2 18 2 18 9" />
											<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
											<rect x="6" y="14" width="12" height="8" />
										</svg>
										<span>Print</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={handleDownload}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<svg
											className="h-3.5 w-3.5"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
											<polyline points="7 10 12 15 17 10" />
											<line x1="12" y1="15" x2="12" y2="3" />
										</svg>
										<span>Download message</span>
									</Dropdown.Item>

									<Dropdown.Item
										onClick={() => setRawHeadersExpanded(true)}
										className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-text-strong-950 text-xs transition-colors hover:bg-bg-weak-50 dark:text-white dark:hover:bg-zinc-800"
									>
										<svg
											className="h-3.5 w-3.5"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<polyline points="16 18 22 12 16 6" />
											<polyline points="8 6 2 12 8 18" />
										</svg>
										<span>Show original</span>
									</Dropdown.Item>
								</Dropdown.Content>
							</Dropdown.Root>
						</div>
					</div>
				</div>

				{isTranslated && (
					<div className="mx-5 mb-4 flex items-center justify-between gap-3 rounded-xl border border-stroke-soft-100 bg-bg-weak-50 p-3 font-medium text-label-sm dark:border-stroke-soft-100/30 dark:bg-neutral-800/40">
						<div className="flex items-center gap-2 text-text-sub-600 dark:text-neutral-400">
							<Icon name="translate" className="h-4 w-4 text-primary-base" />
							<span>Translated to</span>
							<select
								value={targetLanguage}
								onChange={(e) => handleLanguageChange(e.target.value)}
								className="cursor-pointer rounded-lg border border-stroke-soft-100 bg-bg-white-0 px-2.5 py-1 font-semibold text-text-strong-950 text-xs shadow-sm outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
							>
								<option value="es">Spanish (Español)</option>
								<option value="fr">French (Français)</option>
								<option value="de">German (Deutsch)</option>
								<option value="it">Italian (Italiano)</option>
								<option value="ja">Japanese (日本語)</option>
								<option value="zh">Chinese (中文)</option>
								<option value="pt">Portuguese (Português)</option>
								<option value="ru">Russian (Русский)</option>
								<option value="ar">Arabic (العربية)</option>
								<option value="hi">Hindi (हिन्दी)</option>
							</select>
						</div>
						<button
							type="button"
							onClick={() => setIsTranslated(false)}
							className="font-semibold text-primary-base text-xs hover:underline"
						>
							Show original
						</button>
					</div>
				)}

				<div className="relative px-5 pt-0 pb-4">
					{isTranslating && (
						<div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-bg-white-0/80 backdrop-blur-sm dark:bg-neutral-900/80">
							<div className="flex flex-col items-center gap-3">
								<svg
									className="h-8 w-8 animate-spin text-primary-base"
									viewBox="0 0 24 24"
									fill="none"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									/>
								</svg>
								<span className="font-semibold text-text-sub-600 text-xs dark:text-neutral-400">
									Translating dynamically...
								</span>
							</div>
						</div>
					)}

					{thread.bodyHtml ? (
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
											img {
												max-width: 100%;
												height: auto;
											}
										</style>
									</head>
									<body>
										${isTranslated ? `<div style="background:#fef08a;color:#854d0e;padding:8px 12px;margin-bottom:12px;border-radius:6px;font-size:12px;font-weight:500;font-family:sans-serif;">Dynamic ${LANGUAGE_NAMES[targetLanguage] || targetLanguage} Translation</div>` : ""}
										${isTranslated ? translatedHtml || "Translating..." : thread.bodyHtml}
									</body>
									</html>
								`}
								sandbox="allow-popups allow-popups-to-escape-sandbox"
								className="min-h-[450px] w-full border-0 bg-white"
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
							<p className="whitespace-pre-wrap text-label-sm text-text-strong-950 leading-relaxed">
								{isTranslated
									? translatedText || "Translating..."
									: thread.bodyText}
							</p>
						</div>
					)}
				</div>

				{thread.attachments && thread.attachments.length > 0 && (
					<div className="border-stroke-soft-100 border-t px-5 py-4 dark:border-stroke-soft-100/40">
						<SectionTitle>Attachments</SectionTitle>
						<ul className="flex flex-col gap-2">
							{thread.attachments.map((file) => (
								<li key={file.name}>
									<button
										type="button"
										onClick={() =>
											handlePrototypeAction(`Download ${file.name}`)
										}
										className="flex w-full items-center gap-3 rounded-lg border border-stroke-soft-100 px-3 py-2 text-left transition-colors hover:bg-bg-weak-50 dark:border-stroke-soft-100/40"
									>
										<Icon
											name="file-text"
											className="h-4 w-4 shrink-0 text-text-sub-600"
										/>
										<div className="min-w-0 flex-1">
											<p className="truncate text-label-sm text-text-strong-950">
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

				{thread.parsed && Object.keys(thread.parsed).length > 0 && (
					<div className="border-stroke-soft-100 border-t px-5 py-4 dark:border-stroke-soft-100/40">
						<button
							type="button"
							onClick={() => setParsedExpanded((v) => !v)}
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
							<div className="flex flex-col gap-2 rounded-lg border border-stroke-soft-100 bg-bg-weak-50/50 p-3 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/20">
								{Object.entries(thread.parsed).map(([key, value]) => (
									<div
										key={key}
										className="grid grid-cols-[minmax(0,120px)_1fr] gap-2 text-label-sm"
									>
										<span className="font-medium text-text-soft-400 capitalize">
											{key.replace(/([A-Z])/g, " $1").trim()}
										</span>
										<span className="break-words text-text-strong-950">
											{typeof value === "object"
												? JSON.stringify(value)
												: String(value)}
										</span>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{!showReplyComposer ? (
					<div className="mx-5 my-6 flex items-center gap-3">
						<button
							type="button"
							onClick={() => setShowReplyComposer(true)}
							className="flex items-center gap-2 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-4 py-2 font-semibold text-label-sm text-text-sub-600 transition-all hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-stroke-soft-100/30 dark:bg-neutral-800/20"
						>
							<svg
								className="h-3.5 w-3.5"
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
							<span>Reply</span>
						</button>
						<button
							type="button"
							onClick={handleForward}
							className="flex items-center gap-2 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-4 py-2 font-semibold text-label-sm text-text-sub-600 transition-all hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-stroke-soft-100/30 dark:bg-neutral-800/20"
						>
							<svg
								className="h-3.5 w-3.5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<polyline points="15 17 20 12 15 7" />
								<path d="M4 18v-2a4 4 0 0 1 4-4h12" />
							</svg>
							<span>Forward</span>
						</button>
					</div>
				) : (
					<div className="mx-5 my-6 rounded-xl border border-stroke-soft-100 bg-bg-white-0 shadow-sm dark:border-stroke-soft-100/30 dark:bg-neutral-900/40">
						{/* Composer Header */}
						<div className="flex items-center justify-between border-stroke-soft-100 border-b px-4 py-3 dark:border-stroke-soft-100/30">
							<div className="flex flex-col gap-1 text-label-sm">
								<div className="flex items-center gap-2 text-text-soft-400">
									<span className="w-12">To:</span>
									<span className="font-semibold text-text-strong-950 dark:text-white">
										{thread.from.name
											? `${thread.from.name} <${thread.from.email}>`
											: thread.from.email}
									</span>
								</div>
								<div className="flex items-center gap-2 text-text-soft-400">
									<span className="w-12">From:</span>
									<span className="text-text-sub-600 dark:text-neutral-400">
										{mailbox?.email || "agent@local.reloop.sh"}
									</span>
								</div>
							</div>
							<button
								type="button"
								onClick={() => setShowReplyComposer(false)}
								className="rounded-lg p-1.5 text-text-soft-400 hover:bg-bg-weak-50 dark:hover:bg-white/10"
							>
								<Icon name="cross" className="h-4 w-4" />
							</button>
						</div>

						{/* Text Area */}
						<div className="px-4 py-3">
							<textarea
								value={replyBody}
								onChange={(e) => setReplyBody(e.target.value)}
								placeholder={`Reply to ${thread.from.name || thread.from.email.split("@")[0]}...`}
								rows={5}
								className="w-full resize-none bg-transparent text-label-sm text-text-strong-950 placeholder-text-soft-400 outline-none dark:text-white"
							/>
						</div>

						{/* Composer Footer Actions */}
						<div className="flex items-center justify-between rounded-b-xl border-stroke-soft-100 border-t bg-bg-weak-50/30 px-4 py-2.5 dark:border-stroke-soft-100/30 dark:bg-neutral-900/20">
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={handleSendReply}
									disabled={!replyBody.trim()}
									className="flex items-center gap-1.5 rounded-lg bg-primary-base px-4.5 py-1.5 font-semibold text-label-sm text-white transition-all hover:bg-primary-hover active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
								>
									<span>Send</span>
									<svg
										className="h-3.5 w-3.5 rotate-45"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<line x1="22" y1="2" x2="11" y2="13" />
										<polygon points="22 2 15 22 11 13 2 9 22 2" />
									</svg>
								</button>
								<button
									type="button"
									className="rounded-lg p-1.5 text-text-soft-400 hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/10"
									title="Attach files"
									onClick={() => toast.info("Attachment uploading prototype")}
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
										<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
									</svg>
								</button>
							</div>

							<button
								type="button"
								onClick={() => {
									setReplyBody("");
									setShowReplyComposer(false);
								}}
								className="rounded-lg p-1.5 text-text-soft-400 hover:bg-red-50 hover:text-error-base dark:hover:bg-red-950/20"
								title="Discard draft"
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
									<polyline points="3 6 5 6 21 6" />
									<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
								</svg>
							</button>
						</div>
					</div>
				)}
			</div>

			{rawHeadersExpanded && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
					<div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-xl border border-stroke-soft-100 bg-bg-white-0 shadow-2xl dark:border-stroke-soft-100/30 dark:bg-neutral-900">
						<div className="flex items-center justify-between border-stroke-soft-100 border-b p-4 dark:border-stroke-soft-100/30">
							<h3 className="font-semibold text-sm text-text-strong-950 dark:text-white">
								Original Message Source
							</h3>
							<button
								type="button"
								onClick={() => setRawHeadersExpanded(false)}
								className="rounded-lg p-1.5 text-text-soft-400 hover:bg-bg-weak-50 dark:hover:bg-white/10"
							>
								<Icon name="cross" className="h-4 w-4" />
							</button>
						</div>
						<div className="flex-1 select-text overflow-auto bg-bg-weak-50/30 p-4 font-mono text-[11px] text-text-sub-600 dark:bg-neutral-950/20 dark:text-neutral-400">
							<pre className="whitespace-pre-wrap leading-relaxed">
								{JSON.stringify(
									{
										messageId: thread.id,
										mailboxId: thread.mailboxId,
										from: thread.from,
										subject: thread.subject,
										receivedAt: thread.receivedAt,
										securityLevel: thread.securityLevel,
										attachments: thread.attachments,
										timeline: thread.timeline,
									},
									null,
									2,
								)}
							</pre>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
