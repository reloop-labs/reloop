import { cn } from "@reloop/ui/cn";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";
import { resolveLabelColor } from "../../lib/label-colors";
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
 * Calm thread header: subject → real labels + people → AI summary → attachments
 */
export const ThreadHeader = ({
	subject,
	messageCount,
	participants,
	summary,
	attachments,
	labels,
}: ThreadHeaderProps) => {
	const showPeople = participants.length > 2;
	const visiblePeople = showPeople ? participants.slice(0, 3) : [];
	const overflow = showPeople ? participants.length - visiblePeople.length : 0;
	const realLabels = (labels ?? []).filter((l) => l.name?.trim());
	const showMetaRow = realLabels.length > 0 || showPeople;

	return (
		<div className="border-mail-border/40 border-b px-4 py-4 pl-17">
			<h1 className="font-semibold text-[22px] text-mail-foreground leading-snug tracking-tight">
				{subject}
				{messageCount > 1 && (
					<span className="font-medium text-mail-muted"> [{messageCount}]</span>
				)}
			</h1>

			{showMetaRow && (
				<div className="mt-2.5 flex flex-wrap items-center gap-2">
					{realLabels.length > 0 && (
						<div className="flex flex-wrap items-center gap-1.5">
							{realLabels.map((label) => (
								<span
									key={label.id ?? label.name}
									className="inline-flex items-center gap-1.5 rounded-full border border-mail-border/40 bg-[var(--inbox-muted-bg)] px-2 py-0.5 font-medium text-[11px] text-mail-foreground"
								>
									<span
										className="size-2 shrink-0 rounded-full"
										style={{
											backgroundColor: resolveLabelColor(
												label.color ?? undefined,
											),
										}}
									/>
									{label.name}
								</span>
							))}
						</div>
					)}

					{realLabels.length > 0 && showPeople && (
						<div className="mx-0.5 h-3 w-px rounded-full bg-mail-border" />
					)}

					{showPeople && (
						<div className="flex flex-wrap items-center gap-1.5">
							{visiblePeople.map((person) => (
								<div
									key={person.email}
									className="inline-flex items-center justify-start gap-1.5 overflow-hidden rounded-full border border-mail-border/40 bg-panel-light p-1 pr-2 dark:bg-panel-dark"
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
									<span className="font-medium text-mail-foreground text-sm leading-none">
										{shortName(person)}
									</span>
								</div>
							))}
							{overflow > 0 && (
								<span className="text-mail-muted text-sm">
									+{overflow} {overflow === 1 ? "other" : "others"}
								</span>
							)}
						</div>
					)}
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
