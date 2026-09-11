import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon, type IconName } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { ContactDetail } from "#/features/contacts/hooks/use-contacts-query";
import { queryKeys } from "#/lib/query-keys";
import { formatRelativeTime } from "#/utils/format-relative-time";
import { ContactStatusBadge } from "../components/contacts/contact-status-badge";
import { DeleteContactModal } from "../components/contacts/delete-contact-modal";
import { EditContactModal } from "../components/contacts/edit-contact-modal";
import type { ActivityFilter } from "./contact-email-history";
import { ContactEmailHistory } from "./contact-email-history";

interface PropertyValueWithName {
	id: string;
	propertyId: string;
	value: string;
	name: string;
	createdAt: string;
	updatedAt: string;
}

interface ContactHeaderProps {
	contact: ContactDetail | undefined;
	isLoading: boolean;
	propertyValues: PropertyValueWithName[];
	enrolledChannels?: {
		id: string;
		name: string;
		description?: string | null;
	}[];
}

interface ContactEngagementStats {
	total: number;
	sent: number;
	delivered: number;
	opened: number;
	clicked: number;
	bounced: number;
	failed: number;
	complained: number;
}

type EngagementRating =
	| "New"
	| "Excellent"
	| "Good"
	| "Fair"
	| "At risk"
	| "Poor";

/**
 * Client-side mirror of the backend engagement scorer
 * (apps/backend/logs/src/lib/contact-engagement-score.ts).
 * Used as a fallback if the API response predates the engagement field.
 * Score 0–100 from delivery (20%), opens (35%), click-to-open (25%),
 * scaled CTR (20%), minus bounce/fail/complaint penalties, shrunk toward
 * 50 when fewer than 5 delivered. Any complaint caps at 40.
 */
function scoreEngagementFallback(s: ContactEngagementStats): {
	score: number | null;
	rating: EngagementRating;
} {
	if (s.sent <= 0) return { score: null, rating: "New" };
	const total = Math.max(s.total, 1);
	const clamp01 = (n: number) =>
		Number.isNaN(n) ? 0 : Math.min(1, Math.max(0, n));
	const delivery = clamp01(s.delivered / Math.max(s.sent, 1));
	const open = clamp01(s.opened / Math.max(s.delivered, 1));
	const ctor = s.opened > 0 ? clamp01(s.clicked / s.opened) : 0;
	const ctrScaled = clamp01((s.clicked / Math.max(s.delivered, 1)) * 5);
	let value =
		100 * (0.2 * delivery + 0.35 * open + 0.25 * ctor + 0.2 * ctrScaled);
	value -=
		40 * (s.bounced / total) +
		25 * (s.failed / total) +
		60 * (s.complained / total);
	value = Math.min(100, Math.max(0, value));
	if (s.complained > 0) value = Math.min(value, 40);
	const confidence = Math.min(s.delivered / 5, 1);
	const score = Math.round(50 + (value - 50) * confidence);
	const rating: EngagementRating =
		score >= 80
			? "Excellent"
			: score >= 60
				? "Good"
				: score >= 40
					? "Fair"
					: score >= 20
						? "At risk"
						: "Poor";
	return { score, rating };
}

function scoreColor(rating: EngagementRating): string {
	switch (rating) {
		case "Excellent":
		case "Good":
			return "text-success-base";
		case "Fair":
			return "text-warning-base";
		case "At risk":
		case "Poor":
			return "text-error-base";
		default:
			return "text-text-soft-400";
	}
}

function useContactEngagement(email: string | undefined) {
	const statsQuery = useQuery({
		queryKey: [...queryKeys.contacts.activity(email ?? ""), "stats"],
		queryFn: async () => {
			const res = await fetch(
				`/api/logs/v1/emails/contact-activity?email=${encodeURIComponent(email ?? "")}&limit=1&page=1`,
				{ credentials: "include" },
			);
			if (!res.ok) throw new Error("Failed to load contact stats");
			return res.json() as Promise<{
				total: number;
				stats: ContactEngagementStats;
				engagement?: { score: number | null; rating: EngagementRating };
			}>;
		},
		enabled: !!email,
		staleTime: 30_000,
	});

	const stats = statsQuery.data?.stats;
	const engagement =
		statsQuery.data?.engagement ??
		(stats ? scoreEngagementFallback(stats) : undefined);

	return {
		statsQuery,
		stats,
		engagement,
		rating: engagement?.rating ?? ("New" as EngagementRating),
		scoreValue: engagement?.score,
	};
}

function ContactStatsRow({ email }: { email: string }) {
	const { statsQuery, stats } = useContactEngagement(email);

	const rows: {
		label: string;
		icon: IconName;
		value: React.ReactNode;
		title?: string;
		valueClassName?: string;
	}[] = [
		{
			label: "Total emails",
			icon: "mail",
			value: (stats?.total ?? statsQuery.data?.total ?? 0).toLocaleString(),
		},
		{
			label: "Sent",
			icon: "send-1",
			value: (stats?.sent ?? 0).toLocaleString(),
		},
		{
			label: "Delivered",
			icon: "check-circle",
			value: (stats?.delivered ?? 0).toLocaleString(),
		},
		{
			label: "Opened",
			icon: "eye-outline",
			value: (stats?.opened ?? 0).toLocaleString(),
		},
		{
			label: "Clicked",
			icon: "cursor-click",
			value: (stats?.clicked ?? 0).toLocaleString(),
		},
		{
			label: "Failed",
			icon: "cross-circle",
			value: ((stats?.bounced ?? 0) + (stats?.failed ?? 0)).toLocaleString(),
			title: "Bounced + failed deliveries",
			valueClassName:
				(stats?.bounced ?? 0) + (stats?.failed ?? 0) > 0
					? "text-error-base"
					: undefined,
		},
	];

	return (
		<section>
			<h3 className="mb-4 font-medium text-paragraph-sm text-text-strong-950">
				Statistics
			</h3>
			<div className="grid grid-cols-3 gap-x-8 gap-y-8">
				{rows.map((row) => (
					<DetailItem key={row.label} icon={row.icon} label={row.label}>
						{statsQuery.isPending ? (
							<Skeleton className="h-4 w-12 rounded" />
						) : statsQuery.isError ? (
							<span className="font-medium text-paragraph-sm text-text-soft-400">
								—
							</span>
						) : (
							<span
								title={row.title}
								className={cn(
									"font-medium text-paragraph-sm text-text-strong-950 tabular-nums",
									row.valueClassName,
								)}
							>
								{row.value}
							</span>
						)}
					</DetailItem>
				))}
			</div>
		</section>
	);
}

const activityTabItems = [
	{ title: "Activity", value: "all", iconName: "activity" },
	{ title: "Emails", value: "emails", iconName: "mail-single" },
	{ title: "Changes", value: "changes", iconName: "history" },
] as const;

function ContactActivityTabs({
	value,
	onChange,
}: {
	value: ActivityFilter;
	onChange: (value: ActivityFilter) => void;
}) {
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const activeIndex = activityTabItems.findIndex(
		(item) => item.value === value,
	);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const tab = buttonRefs.current[currentIdx];
	const rect = tab?.getBoundingClientRect();

	return (
		<TabMenuHorizontal.Root value={value}>
			<TabMenuHorizontal.List className="relative h-11 gap-0 border-b! py-0">
				{activityTabItems.map(
					({ value: itemValue, title, iconName }, index) => (
						<TabMenuHorizontal.Trigger
							ref={(el) => {
								if (el) buttonRefs.current[index] = el;
							}}
							onPointerEnter={() => setHoveredIdx(index)}
							onPointerLeave={() => setHoveredIdx(undefined)}
							className={cn(
								"flex cursor-pointer items-center gap-2 px-3 py-0! font-medium text-sm",
								hoveredIdx === undefined &&
									activeIndex === index &&
									"text-text-strong-950",
							)}
							key={itemValue}
							value={itemValue}
							onClick={() => onChange(itemValue)}
						>
							<Icon name={iconName} className="h-4 w-4" />
							{title}
						</TabMenuHorizontal.Trigger>
					),
				)}
				<AnimatePresence>
					{rect && activeIndex !== -1 ? (
						<motion.div
							className="absolute top-0 left-0 rounded-xl bg-neutral-alpha-10"
							initial={{
								pointerEvents: "none",
								width: rect.width,
								height: rect.height - 14,
								left:
									rect.left -
									(tab?.offsetParent?.getBoundingClientRect().left || 0),
								top:
									rect.top -
									(tab?.offsetParent?.getBoundingClientRect().top || 0) +
									7,
								opacity: 0,
							}}
							animate={{
								pointerEvents: "none",
								width: rect.width,
								height: rect.height - 14,
								left:
									rect.left -
									(tab?.offsetParent?.getBoundingClientRect().left || 0),
								top:
									rect.top -
									(tab?.offsetParent?.getBoundingClientRect().top || 0) +
									7,
								opacity: 1,
							}}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.14 }}
						/>
					) : null}
				</AnimatePresence>
			</TabMenuHorizontal.List>
		</TabMenuHorizontal.Root>
	);
}

const formatPropertyName = (name: string) => {
	return name
		.replace(/([A-Z])/g, " $1")
		.replace(/^./, (str) => str.toUpperCase())
		.trim();
};

function PropertyField({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-w-0 flex-col gap-1">
			<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
				{label}
			</span>
			<div className="min-w-0 font-medium text-paragraph-sm text-text-strong-950">
				{children}
			</div>
		</div>
	);
}

function DetailItem({
	icon,
	label,
	children,
}: {
	icon: IconName;
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-w-0 flex-col gap-1.5">
			<div className="flex items-center gap-1.5">
				<Icon name={icon} className="h-3.5 w-3.5 text-text-sub-600" />
				<span className="font-medium text-[10px] text-text-sub-600 uppercase tracking-wider">
					{label}
				</span>
			</div>
			{children}
		</div>
	);
}

export const ContactHeader = ({
	contact,
	isLoading,
	propertyValues,
	enrolledChannels = [],
}: ContactHeaderProps) => {
	const router = useRouter();
	const [copied, setCopied] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [activityTab, setActivityTab] = useState<ActivityFilter>("all");

	const {
		statsQuery: engagementQuery,
		rating: engagementRating,
		scoreValue: engagementScore,
	} = useContactEngagement(contact?.email);

	const handleCopyId = async () => {
		if (contact?.id) {
			try {
				await navigator.clipboard.writeText(contact.id);
				toast.success("Contact ID copied to clipboard");
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} catch {
				toast.error("Failed to copy ID");
			}
		}
	};

	const handleDeleteSuccess = () => {
		toast.success("Contact deleted");
		router.push("/contacts");
	};

	const displayName =
		contact?.firstName || contact?.lastName
			? `${contact?.firstName ?? ""} ${contact?.lastName ?? ""}`.trim()
			: (contact?.email ?? "Contact");
	const initial = (displayName.charAt(0) || "?").toUpperCase();

	if (!contact && !isLoading) {
		return (
			<div className="pt-10 pb-8">
				<div className="flex items-center justify-between">
					<div>
						<div className="flex items-center gap-1.5">
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								Contact{" "}
							</p>
							<p className="font-semibold text-paragraph-xs text-text-sub-600">
								•
							</p>
							<p className="font-medium text-paragraph-xs text-text-sub-600">
								---
							</p>
							<p className="font-semibold text-paragraph-xs text-text-sub-600">
								•
							</p>
							<div className="flex items-center gap-1 text-error-base">
								<Icon name="alert-circle" className="h-3.5 w-3.5" />
								<p className="font-medium text-paragraph-xs">Not found</p>
							</div>
						</div>
						<h1 className="font-medium text-title-h6 leading-8">
							Contact not found
						</h1>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="mx-auto w-full max-w-[760px] pb-16">
				<div className="px-4 pt-6 sm:px-6">
					{/* Avatar + name + actions row */}
					<div className="flex items-center gap-4">
						{isLoading ? (
							<Skeleton className="size-10 shrink-0 rounded-full" />
						) : (
							<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-500 font-semibold text-base text-white uppercase tracking-wide shadow-sm">
								{initial}
							</div>
						)}

						<div className="min-w-0 flex-1">
							{isLoading ? (
								<div className="flex items-center gap-2.5">
									<Skeleton className="h-7 w-48 rounded-lg" />
									<Skeleton className="h-6 w-24 rounded-md" />
								</div>
							) : (
								<div className="flex flex-wrap items-center gap-2.5">
									<h1 className="truncate font-medium text-[22px] text-text-strong-950 tracking-tight">
										{displayName}
									</h1>
									{contact?.status && (
										<ContactStatusBadge status={contact.status} />
									)}
								</div>
							)}
						</div>

						<div className="flex shrink-0 items-center gap-2">
							{isLoading ? (
								<>
									<Skeleton className="h-9 w-28 rounded-lg" />
									<Skeleton className="h-9 w-9 rounded-lg" />
								</>
							) : (
								<>
									<Button.Root
										type="button"
										variant="neutral"
										mode="stroke"
										size="xsmall"
										onClick={() => setIsEditModalOpen(true)}
									>
										Edit contact
									</Button.Root>
									{contact && (
										<Button.Root
											type="button"
											variant="neutral"
											mode="stroke"
											size="xsmall"
											aria-label="Delete contact"
											onClick={() => setIsDeleteModalOpen(true)}
										>
											<Icon
												name="trash"
												className="h-3.5 w-3.5 text-text-sub-600"
											/>
										</Button.Root>
									)}
								</>
							)}
						</div>
					</div>

					{!isLoading && contact?.suppressionReason && (
						<div className="mt-6 flex items-start gap-3 rounded-2xl border border-error-base/30 bg-error-base/10 px-4 py-3">
							<Icon
								name="alert-octagon"
								className="mt-0.5 h-5 w-5 flex-shrink-0 text-error-base"
							/>
							<div className="flex flex-col gap-0.5">
								<h3 className="font-medium text-error-base text-sm">
									Contact Suppressed
								</h3>
								<p className="text-error-base/80 text-sm">
									This contact has been automatically excluded from all
									communications due to a delivery issue or spam report.
								</p>
							</div>
						</div>
					)}

					{/* Content */}
					<div className="mt-8 flex flex-col gap-10">
						<section>
							<h3 className="mb-4 font-medium text-paragraph-sm text-text-strong-950">
								Properties
							</h3>
							{isLoading ? (
								<div className="grid grid-cols-3 gap-x-8 gap-y-8">
									{[0, 1, 2, 3, 4, 5].map((i) => (
										<div
											key={`property-skeleton-${i}`}
											className="flex flex-col gap-1"
										>
											<Skeleton className="h-2.5 w-16 rounded" />
											<Skeleton className="h-4 w-28 rounded" />
										</div>
									))}
								</div>
							) : (
								<div className="grid grid-cols-3 gap-x-8 gap-y-8">
									<PropertyField label="First name">
										{contact?.firstName || "—"}
									</PropertyField>
									<PropertyField label="Last name">
										{contact?.lastName || "—"}
									</PropertyField>
									{propertyValues.map((pv) => (
										<PropertyField
											key={pv.id}
											label={formatPropertyName(pv.name)}
										>
											{pv.value ? (
												<span className="block truncate">{pv.value}</span>
											) : (
												"—"
											)}
										</PropertyField>
									))}
								</div>
							)}
						</section>

						{isLoading ? (
							<div className="grid grid-cols-3 gap-x-12 gap-y-6">
								{[0, 1, 2, 3, 4].map((i) => (
									<div
										key={`detail-skeleton-${i}`}
										className="flex flex-col gap-1.5"
									>
										<Skeleton className="h-3.5 w-20 rounded" />
										<Skeleton className="h-4 w-28 rounded" />
									</div>
								))}
							</div>
						) : (
							contact && (
								<div className="grid grid-cols-3 gap-x-12 gap-y-6">
									<DetailItem icon="calendar" label="Created">
										<span className="font-medium text-paragraph-sm text-text-strong-950">
											{contact.createdAt
												? formatRelativeTime(contact.createdAt)
												: "—"}
										</span>
									</DetailItem>
									<DetailItem icon="hash" label="ID">
										<button
											className="group/copy flex w-fit cursor-pointer items-center gap-1.5"
											type="button"
											onClick={handleCopyId}
										>
											<code className="max-w-[120px] truncate rounded bg-neutral-alpha-10 px-2 py-1 font-medium font-mono text-text-strong-950 text-xs">
												{contact.id.slice(0, 18)}...
											</code>
											<Icon
												name={copied ? "check" : "copy"}
												className={cn(
													"h-3 w-3 flex-shrink-0 transition-all",
													copied ? "text-success-base" : "text-text-sub-600",
												)}
											/>
										</button>
									</DetailItem>
									<DetailItem icon="star" label="Score">
										{engagementQuery.isPending ? (
											<Skeleton className="h-4 w-16 rounded" />
										) : engagementQuery.isError || engagementScore == null ? (
											<span
												className="font-medium text-paragraph-sm text-text-soft-400"
												title="Not enough sending history to score this contact yet"
											>
												—
											</span>
										) : (
											<span
												className={cn(
													"font-medium text-paragraph-sm tabular-nums",
													scoreColor(engagementRating),
												)}
												title={`Engagement ${engagementScore}/100 · ${engagementRating}. Based on delivery (20%), opens (35%), click-to-open (25%), clicks (20%), minus bounce/fail/complaint penalties. Low scores hurt IP reputation — suppress or re-engage.`}
											>
												{engagementScore.toLocaleString()}
												<span className="font-normal text-text-sub-600">
													{" "}
													· {engagementRating}
												</span>
											</span>
										)}
									</DetailItem>
									<DetailItem icon="modules" label="Groups">
										{contact.groups && contact.groups.length > 0 ? (
											<span className="flex flex-wrap gap-x-3 gap-y-1 font-medium text-paragraph-sm text-text-strong-950">
												{contact.groups.map((group) => (
													<Link
														href={`/contacts/groups/${group.id}`}
														key={group.id}
														className="underline decoration-dashed underline-offset-4 transition-colors hover:text-primary-base"
													>
														{group.name}
													</Link>
												))}
											</span>
										) : (
											<span className="font-medium text-paragraph-sm text-text-soft-400 italic">
												No groups
											</span>
										)}
									</DetailItem>
									<DetailItem icon="notification-indicator" label="Channels">
										{enrolledChannels.length > 0 ? (
											<span className="flex flex-wrap gap-x-3 gap-y-1 font-medium text-paragraph-sm text-text-strong-950">
												{enrolledChannels.map((channel) => (
													<Link
														href={`/contacts?channelId=${channel.id}`}
														key={channel.id}
														className="underline decoration-dashed underline-offset-4 transition-colors hover:text-primary-base"
													>
														{channel.name}
													</Link>
												))}
											</span>
										) : (
											<span className="font-medium text-paragraph-sm text-text-soft-400 italic">
												No channels
											</span>
										)}
									</DetailItem>
								</div>
							)
						)}

						{!isLoading && contact?.email && (
							<ContactStatsRow email={contact.email} />
						)}

						{contact?.email && (
							<div>
								<ContactActivityTabs
									value={activityTab}
									onChange={setActivityTab}
								/>
								<div className="mt-8">
									<ContactEmailHistory
										contactId={contact.id}
										email={contact.email}
										contactCreatedAt={contact.createdAt}
										filter={activityTab}
									/>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>

			{contact && (
				<EditContactModal
					open={isEditModalOpen}
					onOpenChange={setIsEditModalOpen}
					contact={{ ...contact, properties: contact.properties ?? {} }}
				/>
			)}

			{contact && (
				<DeleteContactModal
					open={isDeleteModalOpen}
					onOpenChange={setIsDeleteModalOpen}
					contact={{ ...contact, properties: contact.properties ?? {} }}
					onDeleteSuccess={handleDeleteSuccess}
				/>
			)}
		</>
	);
};
