import { cn } from "@reloop/ui/cn";
import {
	Bell,
	Briefcase,
	Calendar,
	ChevronDown,
	Star,
	Tag,
	User,
	Zap,
} from "lucide-react";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";
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
	entityTag?: "invoice" | "support" | "order" | "security" | null;
	isImportant?: boolean;
	isStarred?: boolean;
}

const shortName = (p: ThreadParticipant) => {
	const cleaned = (p.name || "").replace(/["<>]/g, "").trim();
	if (cleaned) return cleaned.split(/\s+/)[0] || cleaned;
	return p.email.split("@")[0] || p.email;
};

type CategoryBadge = {
	key: string;
	label: string;
	bg: string;
	icon: React.ReactNode;
};

const buildCategoryBadges = ({
	entityTag,
	isImportant,
	isStarred,
	labels,
}: {
	entityTag?: ThreadHeaderProps["entityTag"];
	isImportant?: boolean;
	isStarred?: boolean;
	labels?: ThreadHeaderProps["labels"];
}): CategoryBadge[] => {
	const badges: CategoryBadge[] = [];
	const labelNames = (labels ?? []).map((l) => l.name.toLowerCase());

	if (isImportant) {
		badges.push({
			key: "important",
			label: "Important",
			bg: "bg-[#F59E0D]",
			icon: <Zap className="h-3.5 w-3.5 fill-white text-white" />,
		});
	}
	if (isStarred) {
		badges.push({
			key: "starred",
			label: "Starred",
			bg: "bg-yellow-500",
			icon: <Star className="h-3.5 w-3.5 fill-white text-white" />,
		});
	}

	const hasWork =
		labelNames.some((n) => /work|invoice|support/.test(n)) ||
		entityTag === "invoice" ||
		entityTag === "support";
	const hasPromotions = labelNames.some((n) => /promo|marketing/.test(n));
	const hasUpdates =
		labelNames.some((n) => /update|alert|notif|security/.test(n)) ||
		entityTag === "security" ||
		entityTag === "order";
	const hasPersonal = labelNames.some((n) => /personal|person/.test(n));

	// Match Zero screenshot defaults: personal (green) + updates (purple)
	if (hasPersonal || (!hasWork && !hasPromotions)) {
		badges.push({
			key: "personal",
			label: "Personal",
			bg: "bg-[#39AE4A]",
			icon: <User className="h-3.5 w-3.5 fill-white text-white" />,
		});
	}
	if (hasUpdates || (!hasWork && !hasPromotions)) {
		badges.push({
			key: "updates",
			label: "Updates",
			bg: "bg-[#8B5CF6]",
			icon: <Bell className="h-3.5 w-3.5 fill-white text-white" />,
		});
	}
	if (hasWork) {
		badges.push({
			key: "work",
			label: "Work",
			bg: "bg-blue-600",
			icon: <Briefcase className="h-3.5 w-3.5 text-white" />,
		});
	}
	if (hasPromotions) {
		badges.push({
			key: "promotions",
			label: "Promotions",
			bg: "bg-[#F43F5E]",
			icon: <Tag className="h-3.5 w-3.5 fill-white text-white" />,
		});
	}

	return badges.slice(0, 3);
};

/**
 * Zero-style thread header:
 * subject → date range → category icons | participant pills → AI summary → attachments
 */
export const ThreadHeader = ({
	subject,
	messageCount,
	dateRangeLabel,
	participants,
	summary,
	attachments,
	labels,
	entityTag,
	isImportant,
	isStarred,
}: ThreadHeaderProps) => {
	const visiblePeople = participants.slice(0, 3);
	const overflow = participants.length - visiblePeople.length;
	const categoryBadges = buildCategoryBadges({
		entityTag,
		isImportant,
		isStarred,
		labels,
	});

	return (
		<div className="border-mail-border border-b px-4 py-4">
			{/* Row 1: Subject */}
			<h1 className="font-medium text-base text-mail-foreground leading-snug">
				{subject}
				{messageCount > 1 && (
					<span className="text-[#8C8C8C]"> [{messageCount}]</span>
				)}
			</h1>

			{/* Row 2: Date range */}
			{dateRangeLabel && (
				<div className="mt-1.5 flex items-center gap-1.5 text-[#8C8C8C] text-sm">
					<Calendar className="h-3.5 w-3.5 shrink-0" />
					<span>{dateRangeLabel}</span>
				</div>
			)}

			{/* Row 3: Category badges | participant pills */}
			{(categoryBadges.length > 0 || participants.length > 0) && (
				<div className="mt-2.5 flex flex-wrap items-center gap-2">
					{categoryBadges.length > 0 && (
						<div className="flex items-center gap-1">
							<div className="flex items-center">
								{categoryBadges.map((badge, index) => (
									<span
										key={badge.key}
										title={badge.label}
										className={cn(
											"inline-flex h-6 w-6 items-center justify-center rounded-md border-2 border-panel-light transition-transform dark:border-panel-dark",
											badge.bg,
											index > 0 && "-ml-1.5",
										)}
									>
										{badge.icon}
									</span>
								))}
							</div>
							<ChevronDown className="ml-0.5 h-3 w-3 text-[#8C8C8C]" />
						</div>
					)}

					{categoryBadges.length > 0 && participants.length > 0 && (
						<div className="mx-0.5 h-3 w-px rounded-full bg-[#8C8C8C]/40" />
					)}

					<div className="flex flex-wrap items-center gap-1.5">
						{visiblePeople.map((person) => (
							<div
								key={person.email}
								className="inline-flex items-center justify-start gap-1.5 overflow-hidden rounded-full border border-mail-border bg-panel-light p-1 pr-2"
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
							<span className="text-[#8C8C8C] text-sm">
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
