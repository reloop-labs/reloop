"use client";

import {
	getAvatarGradient,
	getAvatarInitial,
} from "@fe/dashboard/utils/avatar";
import { cn } from "@reloop/ui/cn";
import { Calendar } from "lucide-react";
import type { AttachmentItem } from "./message-attachments";
import { MessageAttachments } from "./message-attachments";
import { ThreadAiSummary } from "./thread-ai-summary";

export interface ThreadParticipant {
	name: string;
	email: string;
}

interface ThreadHeaderProps {
	subject: string;
	messageCount: number;
	dateRangeLabel: string | null;
	participants: ThreadParticipant[];
	summary: string | null;
	attachments: AttachmentItem[];
	labels?: Array<{ id?: string; name: string; color?: string | null }>;
}

const shortName = (p: ThreadParticipant) => {
	const cleaned = (p.name || "").replace(/["<>]/g, "").trim();
	if (cleaned) return cleaned.split(/\s+/)[0] || cleaned;
	return p.email.split("@")[0] || p.email;
};

/**
 * Zero-style thread header: subject, date range, participants,
 * AI summary shell, and aggregated attachment chips.
 */
export const ThreadHeader = ({
	subject,
	messageCount,
	dateRangeLabel,
	participants,
	summary,
	attachments,
	labels,
}: ThreadHeaderProps) => {
	const visiblePeople = participants.slice(0, 3);
	const overflow = participants.length - visiblePeople.length;

	return (
		<div className="border-mail-border border-b px-4 py-4">
			<h1 className="inline-flex items-center gap-2 font-medium text-base text-mail-foreground leading-snug">
				<span>
					{subject}{" "}
					{messageCount > 1 && (
						<span className="text-[#8C8C8C]">[{messageCount}]</span>
					)}
				</span>
			</h1>

			{dateRangeLabel && (
				<div className="mt-1.5 flex items-center gap-1.5 text-[#8C8C8C] text-sm">
					<Calendar className="h-3.5 w-3.5" />
					<span>{dateRangeLabel}</span>
				</div>
			)}

			{(participants.length > 0 || (labels && labels.length > 0)) && (
				<div className="mt-2 flex flex-wrap items-center gap-2">
					{labels?.map((label) => (
						<span
							key={label.id || label.name}
							className="rounded-md border border-mail-border/50 bg-[var(--inbox-muted-bg)] px-2 py-0.5 text-mail-foreground text-xs"
						>
							{label.name}
						</span>
					))}
					{labels && labels.length > 0 && participants.length > 0 && (
						<div className="relative h-3 w-0.5 rounded-full bg-[#8C8C8C]/30" />
					)}
					<div className="flex flex-wrap items-center gap-2 text-[#8C8C8C] text-sm">
						{visiblePeople.map((person) => (
							<div
								key={person.email}
								className="flex items-center gap-1.5"
								title={`${person.name || person.email} <${person.email}>`}
							>
								<div
									className={cn(
										"flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-semibold text-[9px] text-white uppercase",
										getAvatarGradient(person.email),
									)}
								>
									{getAvatarInitial(person.name || null, person.email)}
								</div>
								<span className="text-mail-foreground">
									{shortName(person)}
								</span>
							</div>
						))}
						{overflow > 0 && (
							<span className="text-sm">
								+{overflow} {overflow === 1 ? "other" : "others"}
							</span>
						)}
					</div>
				</div>
			)}

			<ThreadAiSummary summary={summary} />

			{attachments.length > 0 && (
				<div className="mt-3">
					<MessageAttachments
						attachments={attachments}
						showLabel
						label="Attachments"
					/>
				</div>
			)}
		</div>
	);
};
