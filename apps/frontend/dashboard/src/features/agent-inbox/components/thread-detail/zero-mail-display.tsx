import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useState, type ReactNode } from "react";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";
import {
	extractBareEmail,
	extractDisplayName,
	formatRecipient,
} from "../../lib/email-address";
import type { AgentMailbox } from "../../types";
import { ContactHoverCard } from "./contact-hover-card";
import { formatMessageTimestamp, formatZeroMessageTime } from "./date-utils";
import { HoverPopover } from "./hover-popover";
import { MessageActionBar } from "./message-action-bar";
import { MessageActionsDropdown } from "./message-actions-dropdown";
import { MessageAttachments } from "./message-attachments";
import { MessageBody } from "./message-body";
import { MessageDraftActions } from "./message-draft-actions";
import { MessageDraftBanner } from "./message-draft-banner";
import { MessageParsedData } from "./message-parsed-data";

const YouBadge = ({ className }: { className?: string }) => (
	<span
		className={cn(
			"inline-flex shrink-0 items-center rounded-md bg-[var(--inbox-muted-bg)] px-1.5 py-0.5 font-medium text-[10px] text-mail-muted ring-1 ring-mail-border/40 ring-inset",
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
	<div className="grid grid-cols-[52px_minmax(0,1fr)] items-start gap-x-2 gap-y-0.5">
		<span className="pt-0.5 text-right font-normal text-[12px] text-mail-muted">
			{label}
		</span>
		<div className="min-w-0 text-[12px] text-mail-foreground leading-relaxed">
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
}) => {
	const isLast = index === totalCount - 1;
	const [isCollapsed, setIsCollapsed] = useState(!isLast);

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
		(senderEmail ? senderEmail.split("@")[0] : "Unknown");
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
	const toList: string[] = (
		Array.isArray(rawTo) ? rawTo : [rawTo]
	).flatMap((addr) => {
		if (addr == null || addr === "") return [];
		return [String(addr)];
	});
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

	/** Any expanded message can reply / forward — not only the last one. */
	const actionsVisible = !isCollapsed;

	return (
		<div
			className={cn(
				"relative flex-1",
				index > 0 && "border-mail-border/30 border-t",
			)}
		>
			<div
				className="flex cursor-pointer flex-col pb-2"
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
					<div className="flex w-full gap-3">
						<ContactHoverCard
							name={realFromName}
							email={senderEmail}
							isYou={isOutbound}
						>
							<div
								className={cn(
									"mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold text-white text-xs uppercase transition-opacity hover:opacity-90",
									getAvatarGradient(senderEmail || senderName),
								)}
							>
								{getAvatarInitial(
									realFromName || msg.fromName || null,
									senderEmail || senderName,
								)}
							</div>
						</ContactHoverCard>

						<div className="flex w-full items-center justify-between gap-2">
							<div className="min-w-0 flex-1">
								<div className="flex flex-wrap items-center gap-2">
									<span className="truncate font-semibold text-mail-foreground text-sm">
										{senderName}
									</span>
									{isOutbound && <YouBadge />}
									{!isCollapsed && (
										<HoverPopover
											align="start"
											side="bottom"
											sideOffset={-3}
											contentClassName="w-[320px] p-3"
											trigger={
												<button
													type="button"
													className="text-mail-muted text-xs underline decoration-mail-border underline-offset-2 hover:text-mail-foreground"
												>
													Details
												</button>
											}
										>
											<div className="space-y-2">
												<DetailsRow label="from">
													<span className="inline-flex flex-wrap items-center gap-1.5 break-all">
														{fromDetails}
														{isOutbound && <YouBadge />}
													</span>
												</DetailsRow>
												<DetailsRow label="to">
													<span className="inline-flex flex-wrap items-center gap-1.5">
														{toRecipients.map((recipient, i) => (
															<span
																key={`details-${recipient.email}-${i}`}
																className="inline-flex items-center gap-1.5 break-all"
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
														<span className="break-words">
															{msg.subject || email?.subject}
														</span>
													</DetailsRow>
												) : null}
											</div>
										</HoverPopover>
									)}
								</div>
								{!isCollapsed && (
									<p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-mail-muted text-sm">
										<span>To:</span>
										{toRecipients.map((recipient, i) => (
											<span
												key={`${recipient.email}-${i}`}
												className="inline-flex items-center gap-1.5"
											>
												{i > 0 && (
													<span className="text-mail-muted/60">,</span>
												)}
												<span className="text-mail-muted">
													{recipient.email}
												</span>
												{recipient.isYou && <YouBadge />}
											</span>
										))}
									</p>
								)}
								{isCollapsed && (
									<p className="mt-0.5 line-clamp-1 text-mail-muted text-sm">
										{bodyText?.slice(0, 120) ||
											(typeof bodyHtml === "string"
												? bodyHtml.replace(/<[^>]+>/g, " ").slice(0, 120)
												: "")}
									</p>
								)}
							</div>

							<div className="flex shrink-0 items-center gap-1">
								<time className="whitespace-nowrap text-[11px] text-mail-muted tabular-nums">
									{formatZeroMessageTime(msg.messageAt)}
								</time>
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
						isCollapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
					)}
					onClick={(e) => e.stopPropagation()}
					onKeyDown={(e) => e.stopPropagation()}
				>
					<div className="min-h-0 overflow-hidden">
						<div className="px-4 pt-3 pb-2 pl-[3.75rem]">
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

							{actionsVisible && (
								<MessageActionBar
									onReply={onReply}
									onReplyAll={onReplyAll}
									onForward={onForward}
								/>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
