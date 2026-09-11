import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import * as StatusBadge from "@reloop/ui/status-badge";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import type { AudienceStatus } from "#/features/contacts/audience";
import {
	getStatusIcon as getSharedStatusIcon,
	getStatusColorClass,
	getStatusLabel,
} from "#/features/contacts/audience";
import type { ContactDetail } from "#/features/contacts/hooks/use-contacts-query";
import { formatRelativeTime } from "#/utils/format-relative-time";
import { queryKeys } from "#/lib/query-keys";
import { DeleteContactModal } from "../components/contacts/delete-contact-modal";
import { EditContactModal } from "../components/contacts/edit-contact-modal";
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
	enrolledChannels?: { id: string; name: string }[];
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

function ContactStatsRow({ email }: { email: string }) {
	const statsQuery = useQuery({
		queryKey: [...queryKeys.contacts.activity(email), "stats"],
		queryFn: async () => {
			const res = await fetch(
				`/api/logs/v1/emails/contact-activity?email=${encodeURIComponent(email)}&limit=1&page=1`,
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
	const engagement = statsQuery.data?.engagement ??
		(stats ? scoreEngagementFallback(stats) : undefined);
	const rating = engagement?.rating ?? "New";
	const scoreValue = engagement?.score;

	const rows: {
		label: string;
		icon: "mail" | "mail-send" | "eye-outline" | "cursor" | "star";
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
			icon: "mail-send",
			value: (stats?.sent ?? 0).toLocaleString(),
		},
		{
			label: "Opened",
			icon: "eye-outline",
			value: (stats?.opened ?? 0).toLocaleString(),
		},
		{
			label: "Clicked",
			icon: "cursor",
			value: (stats?.clicked ?? 0).toLocaleString(),
		},
		{
			label: "Score",
			icon: "star",
			value:
				scoreValue == null ? (
					"—"
				) : (
					<>
						{scoreValue.toLocaleString()}
						<span className="font-normal text-text-sub-600"> · {rating}</span>
					</>
				),
			title:
				scoreValue == null
					? "Not enough sending history to score this contact yet"
					: `Engagement ${scoreValue}/100 · ${rating}. Based on delivery (20%), opens (35%), click-to-open (25%), clicks (20%), minus bounce/fail/complaint penalties. Low scores hurt IP reputation — suppress or re-engage.`,
			valueClassName:
				scoreValue == null ? "text-text-soft-400" : scoreColor(rating),
		},
	];

	return (
		<div className="group flex w-full flex-col">
			<div className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-2 pb-3 dark:border-white/5 dark:bg-white/[0.02]">
				<span className="font-medium text-lg text-text-strong-950 dark:text-white">
					Statistics
				</span>
			</div>

			<div className="-mt-1.5 overflow-hidden rounded-xl border border-stroke-soft-100 bg-white px-5 pt-4 pb-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.01]">
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
					{rows.map((row) => (
						<div key={row.label} className="min-w-0">
							<p className="font-medium text-[11px] text-text-sub-600 uppercase tracking-wider">
								{row.label}
							</p>
							{statsQuery.isPending ? (
								<Skeleton className="mt-1 h-5 w-16 rounded-lg" />
							) : statsQuery.isError ? (
								<p className="mt-1 truncate font-medium text-sm text-text-soft-400 tabular-nums">
									—
								</p>
							) : (
								<p
									title={row.title}
									className={cn(
										"mt-1 truncate font-medium text-sm text-text-strong-950 tabular-nums",
										row.valueClassName,
									)}
								>
									{row.value}
								</p>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

const formatPropertyName = (name: string) => {
	return name
		.replace(/([A-Z])/g, " $1")
		.replace(/^./, (str) => str.toUpperCase())
		.trim();
};

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

	const statusLabel = contact?.status
		? getStatusLabel(contact.status as AudienceStatus)
		: null;
	const statusBadgeStatus =
		contact?.status?.toLowerCase() === "subscribed"
			? ("completed" as const)
			: ("failed" as const);
	const groupCount = contact?.groups?.length ?? 0;
	const channelCount = enrolledChannels.length;
	const propertyCount = propertyValues.length;

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
				{/* Pastel banner */}
				<div className="h-28 rounded-2xl bg-gradient-to-r from-[#F9DEE2] via-[#FCF0E3] to-[#DCEEF6] sm:h-32 dark:from-[#F9DEE2]/25 dark:via-[#FCF0E3]/15 dark:to-[#DCEEF6]/20" />

				<div className="px-4 sm:px-6">
					{/* Avatar + actions row (Twitter-style) */}
					<div className="-mt-10 mb-4 flex items-end justify-between gap-4">
						{isLoading ? (
							<Skeleton className="size-20 rounded-full" />
						) : (
							<div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-neutral-600 to-neutral-500 font-semibold text-2xl text-white uppercase tracking-wide shadow-sm ring-4 ring-white dark:ring-[#0a0a0b]">
								{initial}
							</div>
						)}

						<div className="flex shrink-0 items-center gap-2 pb-1">
							{isLoading ? (
								<Skeleton className="h-9 w-28 rounded-lg" />
							) : (
								<Button.Root
									type="button"
									variant="neutral"
									mode="stroke"
									size="xsmall"
									onClick={() => setIsEditModalOpen(true)}
								>
									Edit contact
								</Button.Root>
							)}
						</div>
					</div>

					{/* Name + subscription badge */}
					{isLoading ? (
						<div className="flex items-center gap-2.5">
							<Skeleton className="h-7 w-48 rounded-lg" />
							<Skeleton className="h-6 w-24 rounded-md" />
						</div>
					) : (
						<div className="flex flex-wrap items-center gap-2.5">
							<h1 className="font-medium text-[22px] text-text-strong-950 tracking-tight">
								{displayName}
							</h1>
							{statusLabel && (
								<StatusBadge.Root variant="light" status={statusBadgeStatus}>
									<StatusBadge.Icon
										as={Icon}
										name={
											contact?.status?.toLowerCase() === "subscribed"
												? "check-circle"
												: "minus-circle"
										}
										className="h-3.5 w-3.5"
									/>
									{statusLabel}
								</StatusBadge.Root>
							)}
						</div>
					)}

					{/* Meta line */}
					{isLoading ? (
						<Skeleton className="mt-2 h-4 w-64 rounded" />
					) : (
						<p className="mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-[14px] text-text-sub-600">
							<span className="flex items-center gap-1.5">
								<Icon name="users" className="h-3.5 w-3.5" />
								{groupCount} group{groupCount === 1 ? "" : "s"}
							</span>
							<span className="flex items-center gap-1.5">
								<Icon
									name="notification-indicator"
									className="h-3.5 w-3.5"
								/>
								{channelCount} channel{channelCount === 1 ? "" : "s"}
							</span>
							<span className="flex items-center gap-1.5">
								<Icon name="tag" className="h-3.5 w-3.5" />
								{propertyCount} propert{propertyCount === 1 ? "y" : "ies"}
							</span>
						</p>
					)}

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
						{!isLoading && contact?.email && (
							<ContactStatsRow email={contact.email} />
						)}

						{contact?.email && (
							<ContactEmailHistory
								contactId={contact.id}
								email={contact.email}
								contactCreatedAt={contact.createdAt}
								filter="all"
							/>
						)}

						<section>
								<h3 className="mb-3 text-[15px] text-text-sub-600">
									Properties
								</h3>
								{isLoading ? (
									<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 dark:border-white/10">
										{[0, 1, 2, 3].map((i) => (
											<div
												key={`property-skeleton-${i}`}
												className="flex items-center justify-between border-stroke-soft-200 border-b px-4 py-4 last:border-b-0 sm:px-5 dark:border-white/10"
											>
												<Skeleton className="h-4 w-24 rounded" />
												<Skeleton className="h-4 w-32 rounded" />
											</div>
										))}
									</div>
								) : (
									<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-white dark:border-white/10 dark:bg-white/[0.02]">
										<div className="flex items-center justify-between gap-4 border-stroke-soft-200 border-b px-4 py-4 sm:px-5 dark:border-white/10">
											<span className="font-medium text-[15px] text-text-strong-950">
												Email
											</span>
											<span className="truncate font-medium text-[15px] text-text-strong-950">
												{contact?.email}
											</span>
										</div>
										<div className="flex items-center justify-between gap-4 border-stroke-soft-200 border-b px-4 py-4 sm:px-5 dark:border-white/10">
											<span className="font-medium text-[15px] text-text-strong-950">
												First name
											</span>
											<span className="font-medium text-[15px] text-text-strong-950">
												{contact?.firstName || "—"}
											</span>
										</div>
										<div className="flex items-center justify-between gap-4 border-stroke-soft-200 border-b px-4 py-4 sm:px-5 dark:border-white/10">
											<span className="font-medium text-[15px] text-text-strong-950">
												Last name
											</span>
											<span className="font-medium text-[15px] text-text-strong-950">
												{contact?.lastName || "—"}
											</span>
										</div>
										<div className="flex items-center justify-between gap-4 border-stroke-soft-200 border-b px-4 py-4 sm:px-5 dark:border-white/10">
											<span className="font-medium text-[15px] text-text-strong-950">
												Status
											</span>
											<span
												className={cn(
													"flex items-center gap-1.5 font-medium text-[15px]",
													getStatusColorClass(
														contact?.status as AudienceStatus,
													),
												)}
											>
												<Icon
													name={
														getSharedStatusIcon(
															contact?.status as AudienceStatus,
														) as Parameters<typeof Icon>[0]["name"]
													}
													className="h-3.5 w-3.5"
												/>
												{statusLabel}
											</span>
										</div>
										<div className="flex items-center justify-between gap-4 border-stroke-soft-200 border-b px-4 py-4 sm:px-5 dark:border-white/10">
											<span className="font-medium text-[15px] text-text-strong-950">
												Groups
											</span>
											{contact?.groups && contact.groups.length > 0 ? (
												<span className="flex max-w-[60%] flex-wrap justify-end gap-x-3 gap-y-1">
													{contact.groups.map((group) => (
														<Link
															href={`/contacts/groups/${group.id}`}
															key={group.id}
															className="font-medium text-[15px] text-text-strong-950 underline decoration-dashed underline-offset-4 transition-colors hover:text-primary-base"
														>
															{group.name}
														</Link>
													))}
												</span>
											) : (
												<span className="text-[15px] text-text-soft-400">
													—
												</span>
											)}
										</div>
										<div className="flex items-center justify-between gap-4 border-stroke-soft-200 border-b px-4 py-4 sm:px-5 dark:border-white/10">
											<span className="font-medium text-[15px] text-text-strong-950">
												Channels
											</span>
											{enrolledChannels.length > 0 ? (
												<span className="max-w-[60%] truncate font-medium text-[15px] text-text-strong-950">
													{enrolledChannels.map((c) => c.name).join(" · ")}
												</span>
											) : (
												<span className="text-[15px] text-text-soft-400">
													—
												</span>
											)}
										</div>
										{propertyValues.map((pv, idx) => {
											const isLast =
												idx === propertyValues.length - 1 &&
												!contact?.createdAt;
											return (
												<div
													key={pv.id}
													className={cn(
														"flex items-center justify-between gap-4 px-4 py-4 sm:px-5",
														!isLast &&
															"border-stroke-soft-200 border-b dark:border-white/10",
													)}
												>
													<span className="font-medium text-[15px] text-text-strong-950">
														{formatPropertyName(pv.name)}
													</span>
													<span className="max-w-[60%] truncate text-right font-medium text-[15px] text-text-strong-950">
														{pv.value || "—"}
													</span>
												</div>
											);
										})}
										{contact?.createdAt && (
											<div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
												<span className="font-medium text-[15px] text-text-strong-950">
													Created
												</span>
												<span className="font-medium text-[15px] text-text-strong-950">
													{formatRelativeTime(contact.createdAt)}
												</span>
											</div>
										)}
										{contact?.id && (
											<div className="flex items-center justify-between gap-4 border-stroke-soft-200 border-t px-4 py-4 sm:px-5 dark:border-white/10">
												<span className="font-medium text-[15px] text-text-strong-950">
													ID
												</span>
												<button
													className="group/copy flex cursor-pointer items-center gap-1.5"
													type="button"
													onClick={handleCopyId}
												>
													<code className="max-w-[160px] truncate rounded bg-neutral-alpha-10 px-2 py-1 font-medium font-mono text-text-strong-950 text-xs">
														{contact.id.slice(0, 18)}...
													</code>
													<Icon
														name={copied ? "check" : "copy"}
														className={cn(
															"h-3 w-3 flex-shrink-0 transition-all",
															copied
																? "text-success-base"
																: "text-text-sub-600",
														)}
													/>
												</button>
											</div>
										)}
									</div>
								)}
							</section>
					</div>

					{!isLoading && contact && (
						<div className="mt-6">
							<p className="mb-3 font-medium text-label-md text-text-strong-950">
								Danger zone
							</p>
							<div className="rounded-xl border border-error-light py-2 pr-2.5 pl-3">
								<div className="flex items-center justify-between gap-4">
									<div>
										<p className="font-medium text-label-sm text-text-strong-950">
											Delete contact
										</p>
										<p className="text-paragraph-xs text-text-sub-600">
											Permanently delete this contact and all its associated
											data. This cannot be undone.
										</p>
									</div>
									<FancyButton.Root
										variant="destructive"
										size="xsmall"
										type="button"
										onClick={() => setIsDeleteModalOpen(true)}
									>
										<FancyButton.Icon
											as={Icon}
											name="trash-2"
											className="ml-0.5 h-3.5 w-3.5"
										/>
										Delete contact
									</FancyButton.Root>
								</div>
							</div>
						</div>
					)}
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
