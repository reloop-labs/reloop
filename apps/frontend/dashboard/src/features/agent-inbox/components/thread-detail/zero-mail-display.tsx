import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { type ReactNode, useState } from "react";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";
import {
	extractBareEmail,
	extractDisplayName,
	formatRecipient,
} from "../../lib/email-address";
import type { AgentMailbox } from "../../types";
import { ContactHoverCard } from "./contact-hover-card";
import { formatMessageHeaderTime, formatMessageTimestamp } from "./date-utils";
import { HoverPopover } from "./hover-popover";
import { MessageActionsDropdown } from "./message-actions-dropdown";
import { MessageAttachments } from "./message-attachments";
import { MessageBody } from "./message-body";
import { MessageDraftActions } from "./message-draft-actions";
import { MessageDraftBanner } from "./message-draft-banner";
import { MessageParsedData } from "./message-parsed-data";

const YouBadge = ({ className }: { className?: string }) => (
	<span
		className={cn(
			"inline-flex shrink-0 items-center rounded-full bg-(--inbox-muted-bg) px-1.5 py-0.5 font-semibold text-[10px] text-mail-muted ring-1 ring-mail-border/40 ring-inset",
			className,
		)}
	>
		You
	</span>
);

const DetailsRow = ({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) => (
	<div className="grid grid-cols-[52px_auto] items-center gap-x-2">
		<span className="text-right font-normal text-[12px] text-mail-muted">
			{label}
		</span>
		<div className="whitespace-nowrap text-[12px] text-mail-foreground leading-none">
			{children}
		</div>
	</div>
);

export const ZeroMailDisplay = ({
	msg,
	mailbox,
	index,
	totalCount,
	isTranslated,
	targetLanguage,
	translatedHtmlMap,
	translatedTextMap,
	parsedExpanded,
	onToggleParsed,
	onReply,
	onReplyAll,
	onForward,
	onDelete,
	onPrint,
	onApproveSend,
	onEditReply,
	isStarred = false,
	onToggleStar,
	forceExpanded = false,
}: {
	msg: any;
	mailbox: AgentMailbox | undefined;
	index: number;
	totalCount: number;
	isTranslated: boolean;
	targetLanguage: string;
	translatedHtmlMap: Record<string, string>;
	translatedTextMap: Record<string, string>;
	parsedExpanded: boolean;
	onToggleParsed: () => void;
	onReply: () => void;
	onReplyAll?: () => void;
	onForward: () => void;
	onDelete: () => void;
	onPrint: () => void;
	onApproveSend?: () => void;
	onEditReply?: () => void;
	isStarred?: boolean;
	onToggleStar?: () => void;
	/** Keep the message open while an inline reply is anchored to it. */
	forceExpanded?: boolean;
}) => {
	const isLast = index === totalCount - 1;
	const [isCollapsed, setIsCollapsed] = useState(!isLast);
	const collapsed = forceExpanded ? false : isCollapsed;

	const isOutbound = msg.direction === "outbound";
	const isApproval = msg.status === "needs_approval";

	const email = msg.email;
	const rawFrom = msg.fromEmail || email?.fromEmail || "";
	const senderEmail = extractBareEmail(rawFrom);
	const rawFromName = String(msg.fromName || email?.fromName || "").trim();
	const realFromName =
		extractDisplayName(rawFromName) ||
		(rawFromName && !rawFromName.includes("@")
			? rawFromName.replace(/["<>]/g, "").trim()
			: "") ||
		extractDisplayName(rawFrom) ||
		(senderEmail ? (senderEmail.split("@")[0] ?? "Unknown") : "Unknown");
	// Outbound: show the address you sent from; "You" is a badge, not the title.
	const senderName = isOutbound ? senderEmail || realFromName : realFromName;
	const fromDetails = formatRecipient(rawFromName || realFromName, rawFrom);

	const key = `${msg.id}-${targetLanguage}`;
	const bodyHtml = isTranslated
		? translatedHtmlMap[key] || "Translating..."
		: email?.htmlBody || msg.htmlBody;
	const bodyText = isTranslated
		? translatedTextMap[key] || "Translating..."
		: email?.textBody || msg.textBody;

	const mailboxEmail = extractBareEmail(mailbox?.email || "").toLowerCase();
	const rawTo = email?.toEmails ?? msg.toEmails ?? mailbox?.email ?? [];
	const toList: string[] = (Array.isArray(rawTo) ? rawTo : [rawTo]).flatMap(
		(addr) => {
			if (addr == null || addr === "") return [];
			return [String(addr)];
		},
	);
	const toRecipients = (
		toList.length > 0 ? toList : mailbox?.email ? [mailbox.email] : []
	)
		.map((addr) => {
			const bare = extractBareEmail(addr);
			const display = formatRecipient(null, addr) || bare;
			return {
				email: bare,
				display,
				isYou: Boolean(mailboxEmail && bare.toLowerCase() === mailboxEmail),
			};
		})
		.filter((r) => r.email.length > 0);

	const displayAttachments = (email?.attachments || msg.attachments || []).map(
		(att: any) => ({
			id: att.id,
			name: att.filename || att.name || "Attachment",
			size:
				typeof att.size === "number"
					? `${(att.size / 1024).toFixed(1)} KB`
					: att.size || "Unknown size",
			contentType: att.contentType,
			isInline: att.isInline,
			inboundEmailId: att.inboundEmailId || email?.id || msg.inboundEmailId,
			messageId: email?.id || msg.inboundEmailId || msg.id,
			...att,
		}),
	);

	const toggleCollapse = () => {
		if (isLast) return;
		setIsCollapsed((v) => !v);
	};

	const toLineLabel = (() => {
		const onlyYou =
			toRecipients.length > 0 && toRecipients.every((r) => r.isYou);
		const first = toRecipients[0];
		if (onlyYou || (first?.isYou && toRecipients.length === 1)) return "to me";
		if (toRecipients.length === 0) return "to —";
		if (toRecipients.length === 1) {
			const label =
				first.display && !first.display.includes("@")
					? first.display
					: first.email.split("@")[0] || first.email;
			return `to ${first.isYou ? "me" : label}`;
		}
		const names = toRecipients
			.slice(0, 2)
			.map((r) =>
				r.isYou
					? "me"
					: r.display && !r.display.includes("@")
						? r.display.split(/\s+/)[0]
						: r.email.split("@")[0],
			)
			.join(", ");
		const extra = toRecipients.length > 2 ? ` +${toRecipients.length - 2}` : "";
		return `to ${names}${extra}`;
	})();

	return (
		<div
			className={cn(
				"relative flex-1",
				index > 0 && "border-mail-border/30 border-t",
			)}
		>
			<div
				className={cn(
					"flex cursor-pointer flex-col",
					forceExpanded ? "pb-0" : "pb-2",
				)}
				onClick={toggleCollapse}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						toggleCollapse();
					}
				}}
				role={isLast ? undefined : "button"}
				tabIndex={isLast ? undefined : 0}
			>
				<div className="mt-3 flex w-full items-start justify-between gap-3 px-4">
					<div className="flex w-full min-w-0 gap-3">
						<ContactHoverCard
							name={realFromName}
							email={senderEmail}
							isYou={isOutbound}
						>
							<div
								className={cn(
									"mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full font-semibold text-sm text-white uppercase transition-opacity hover:opacity-90",
									getAvatarGradient(senderEmail || senderName),
								)}
							>
								{getAvatarInitial(
									realFromName || msg.fromName || null,
									senderEmail || senderName,
								)}
							</div>
						</ContactHoverCard>

						<div className="flex min-w-0 flex-1 items-start justify-between gap-2">
							<div className="min-w-0 flex-1">
								{/* Name + email on one line (Gmail-style) */}
								<div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
									<span className="truncate font-semibold text-[15px] text-mail-foreground leading-5">
										{isOutbound ? "me" : realFromName || senderName}
									</span>
									{isOutbound && <YouBadge />}
									{senderEmail && !isOutbound && (
										<span className="truncate text-[13px] text-mail-muted leading-5">
											&lt;{senderEmail}&gt;
										</span>
									)}
									{isOutbound && senderEmail && (
										<span className="truncate text-[13px] text-mail-muted leading-5">
											&lt;{senderEmail}&gt;
										</span>
									)}
								</div>

								{/* to me ▾ / preview when collapsed */}
								{!collapsed ? (
									<div className="mt-0.5 flex min-w-0 items-center">
										<HoverPopover
											align="start"
											side="bottom"
											sideOffset={4}
											contentClassName="w-max max-w-[min(520px,calc(100vw-2rem))] overflow-x-auto p-3"
											trigger={
												<button
													type="button"
													onClick={(e) => e.stopPropagation()}
													className="inline-flex max-w-full items-center gap-0.5 rounded-md py-0.5 text-[13px] text-mail-muted leading-5 transition-colors hover:text-mail-foreground"
												>
													<span className="truncate">{toLineLabel}</span>
													<svg
														width="12"
														height="12"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="2"
														strokeLinecap="round"
														strokeLinejoin="round"
														className="shrink-0 opacity-70"
														aria-hidden
													>
														<path d="M6 9l6 6 6-6" />
													</svg>
												</button>
											}
										>
											<div className="space-y-2">
												<DetailsRow label="from">
													<span className="inline-flex items-center gap-1.5 whitespace-nowrap">
														{fromDetails}
														{isOutbound && <YouBadge />}
													</span>
												</DetailsRow>
												<DetailsRow label="to">
													<span className="inline-flex items-center gap-1.5 whitespace-nowrap">
														{toRecipients.map((recipient, i) => (
															<span
																key={`details-${recipient.email}-${i}`}
																className="inline-flex items-center gap-1.5 whitespace-nowrap"
															>
																{i > 0 && (
																	<span className="text-mail-muted">,</span>
																)}
																<span>{recipient.email}</span>
																{recipient.isYou && <YouBadge />}
															</span>
														))}
													</span>
												</DetailsRow>
												<DetailsRow label="date">
													{formatMessageTimestamp(msg.messageAt)}
												</DetailsRow>
												{msg.subject || email?.subject ? (
													<DetailsRow label="subject">
														<span className="whitespace-nowrap">
															{msg.subject || email?.subject}
														</span>
													</DetailsRow>
												) : null}
											</div>
										</HoverPopover>
									</div>
								) : (
									<p className="mt-0.5 line-clamp-1 text-[13px] text-mail-muted">
										{bodyText?.slice(0, 120) ||
											(typeof bodyHtml === "string"
												? bodyHtml.replace(/<[^>]+>/g, " ").slice(0, 120)
												: "")}
									</p>
								)}
							</div>

							{/* Superhuman-style meta: date · star · reply · more (no emoji) — always visible */}
							<div
								className="flex shrink-0 items-center gap-0.5 pt-0.5"
								onClick={(e) => e.stopPropagation()}
								onKeyDown={(e) => e.stopPropagation()}
							>
								<time className="mr-1.5 whitespace-nowrap text-[12px] text-mail-muted tabular-nums">
									{formatMessageHeaderTime(msg.messageAt)}
								</time>
								{onToggleStar && (
									<button
										type="button"
										title={isStarred ? "Unstar" : "Star"}
										aria-label={isStarred ? "Unstar" : "Star"}
										onClick={(e) => {
											e.stopPropagation();
											onToggleStar();
										}}
										className={cn(
											"inline-flex size-7 items-center justify-center rounded-md transition-colors hover:bg-[var(--inbox-row-hover)]",
											isStarred
												? "text-[var(--inbox-star)]"
												: "text-mail-muted hover:text-amber-500",
										)}
									>
										<Icon
											name={isStarred ? "star-filled" : "star"}
											className="h-4 w-4"
										/>
									</button>
								)}
								<button
									type="button"
									title="Reply"
									aria-label="Reply"
									onClick={(e) => {
										e.stopPropagation();
										onReply();
									}}
									className="inline-flex size-7 items-center justify-center rounded-md text-mail-muted transition-colors hover:bg-[var(--inbox-row-hover)] hover:text-mail-foreground"
								>
									<Icon name="reply" className="h-4 w-4" />
								</button>
								<MessageActionsDropdown
									onReply={onReply}
									onReplyAll={onReplyAll}
									onForward={onForward}
									onPrint={onPrint}
									onDelete={onDelete}
								/>
							</div>
						</div>
					</div>
				</div>

				<div
					className={cn(
						"grid overflow-hidden duration-200",
						collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
					)}
					onClick={(e) => e.stopPropagation()}
					onKeyDown={(e) => e.stopPropagation()}
				>
					<div className="min-h-0 overflow-hidden">
						<div
							className={cn(
								"px-4 pt-3 pl-[3.75rem]",
								forceExpanded ? "pb-0" : "pb-2",
							)}
						>
							<MessageBody
								bodyHtml={bodyHtml}
								bodyText={bodyText}
								isTranslated={isTranslated}
								targetLanguage={targetLanguage}
								messageId={msg.id}
							/>

							{isApproval && (
								<div className="mt-4">
									<MessageDraftBanner messageAt={msg.messageAt} />
								</div>
							)}

							{isApproval && (onApproveSend || onEditReply) && (
								<div className="mt-4">
									<MessageDraftActions
										onApproveSend={onApproveSend ?? (() => {})}
										onEditReply={onEditReply ?? (() => {})}
										onForward={onForward}
									/>
								</div>
							)}

							{displayAttachments.length > 0 && (
								<div className="mt-4">
									<MessageAttachments
										attachments={displayAttachments}
										messageId={email?.id || msg.inboundEmailId}
									/>
								</div>
							)}

							{msg.parsed && Object.keys(msg.parsed).length > 0 && (
								<div className="mt-4 rounded-lg border border-mail-border/30 bg-[var(--inbox-muted-bg)]/50">
									<MessageParsedData
										parsed={msg.parsed}
										isExpanded={parsedExpanded}
										onToggle={onToggleParsed}
									/>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
