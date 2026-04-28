"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

interface PreferencesPreviewProps {
	name: string;
	description: string;
	defaultSubscription: "opt_in" | "opt_out";
	visibility: "private" | "public";
}

export const PreferencesPreview = ({
	name,
	description,
	defaultSubscription,
	visibility,
}: PreferencesPreviewProps) => {
	const displayName = name.trim() || "Your Topic Name";
	const displayDescription = description.trim() || null;
	const isSubscribed = defaultSubscription === "opt_in";

	return (
		<div className="flex flex-col gap-3">
			{/* Label */}
			<div className="flex items-center gap-2">
				<p className="font-medium text-xs text-text-soft-400 uppercase tracking-wider">
					Live Preview
				</p>
				<div className="h-px flex-1 bg-stroke-soft-100" />
			</div>

			{/* Browser-like chrome */}
			<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-sm">
				{/* Faux browser bar */}
				<div className="flex items-center gap-2 border-stroke-soft-100 border-b bg-bg-weak-50/60 px-3 py-2.5">
					<div className="flex gap-1.5">
						<div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
						<div className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
						<div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
					</div>
					<div className="mx-2 flex flex-1 items-center gap-1.5 rounded-md border border-stroke-soft-100 bg-bg-white-0 px-2.5 py-1">
						<Icon name="lock" className="h-2.5 w-2.5 shrink-0 text-text-soft-400" />
						<span className="truncate text-[10px] text-text-soft-400">
							app.reloop.io/preferences
						</span>
					</div>
				</div>

				{/* Preferences Center UI */}
				<div className="p-4">
					{/* Page header */}
					<div className="mb-4 flex items-center gap-2">
						<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bg-weak-50">
							<Icon
								name="notification-indicator"
								className="h-3.5 w-3.5 text-text-sub-600"
							/>
						</div>
						<div>
							<p className="font-semibold text-xs text-text-strong-950">
								Preferences Center
							</p>
							<p className="text-[10px] text-text-soft-400">
								Manage your subscriptions
							</p>
						</div>
					</div>

					{/* Divider */}
					<div className="mb-3 h-px bg-stroke-soft-100" />

					{/* Topic card — what the contact sees */}
					<PreviewTopicCard
						name={displayName}
						description={displayDescription}
						isSubscribed={isSubscribed}
						visibility={visibility}
						isPlaceholder={!name.trim()}
					/>

					{/* Ghost card to show context */}
					<PreviewGhostCard />
					<PreviewGhostCard faded />
				</div>
			</div>

			{/* Legend */}
			<div className="rounded-xl border border-stroke-soft-100 bg-bg-weak-50/40 p-3">
				<p className="mb-2 font-medium text-xs text-text-sub-600">
					How this topic appears
				</p>
				<div className="flex flex-col gap-1.5">
					<LegendRow
						icon="globe"
						label="Visibility"
						value={
							visibility === "public"
								? "Visible to all contacts"
								: "Only subscribed contacts"
						}
						highlight={visibility === "public"}
					/>
					<LegendRow
						icon="user-plus"
						label="Auto-enroll"
						value={
							defaultSubscription === "opt_in"
								? "All new contacts enrolled"
								: "Manual enrollment only"
						}
						highlight={defaultSubscription === "opt_in"}
					/>
				</div>
			</div>
		</div>
	);
};

/* ─── Topic Card inside Preview ─── */
const PreviewTopicCard = ({
	name,
	description,
	isSubscribed,
	visibility,
	isPlaceholder,
}: {
	name: string;
	description: string | null;
	isSubscribed: boolean;
	visibility: "private" | "public";
	isPlaceholder: boolean;
}) => {
	return (
		<div
			className={cn(
				"mb-2 rounded-xl border p-3 transition-all duration-200",
				isPlaceholder
					? "border-dashed border-stroke-soft-200 bg-bg-weak-50/50"
					: "border-stroke-soft-200 bg-bg-white-0 shadow-xs",
			)}
		>
			<div className="flex items-start justify-between gap-2">
				<div className="flex min-w-0 items-start gap-2">
					<div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-neutral-700 to-neutral-500 shadow-sm">
						<Icon
							name="notification-indicator"
							className="h-3 w-3 text-white"
						/>
					</div>
					<div className="min-w-0">
						<p
							className={cn(
								"truncate font-medium text-xs",
								isPlaceholder
									? "italic text-text-soft-400"
									: "text-text-strong-950",
							)}
						>
							{name}
						</p>
						{description ? (
							<p className="mt-0.5 line-clamp-2 text-[10px] leading-relaxed text-text-soft-400">
								{description}
							</p>
						) : (
							<p className="mt-0.5 text-[10px] text-text-soft-400/60 italic">
								No description
							</p>
						)}
						<div className="mt-1.5 flex items-center gap-1.5">
							{/* Visibility badge */}
							<span
								className={cn(
									"inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[9px] font-medium",
									visibility === "public"
										? "border-primary-base/20 bg-primary-base/5 text-primary-base"
										: "border-stroke-soft-200 bg-bg-weak-50 text-text-soft-400",
								)}
							>
								<Icon
									name={visibility === "public" ? "globe" : "lock"}
									className="h-2 w-2"
								/>
								{visibility}
							</span>
						</div>
					</div>
				</div>

				{/* Toggle */}
				<div className="shrink-0">
					<MiniToggle checked={isSubscribed} />
				</div>
			</div>
		</div>
	);
};

/* ─── Ghost cards for context ─── */
const PreviewGhostCard = ({ faded }: { faded?: boolean }) => (
	<div
		className={cn(
			"mb-2 rounded-xl border border-dashed border-stroke-soft-100 p-3",
			faded ? "opacity-30" : "opacity-50",
		)}
	>
		<div className="flex items-center justify-between gap-2">
			<div className="flex items-center gap-2">
				<div className="h-6 w-6 rounded-md bg-bg-weak-50" />
				<div className="space-y-1">
					<div className="h-2 w-20 rounded bg-bg-weak-50" />
					<div className="h-1.5 w-28 rounded bg-bg-weak-50" />
				</div>
			</div>
			<div className="h-3.5 w-7 rounded-full bg-bg-weak-50" />
		</div>
	</div>
);

/* ─── Mini toggle visual ─── */
const MiniToggle = ({ checked }: { checked: boolean }) => (
	<div
		className={cn(
			"relative flex h-4 w-7 cursor-default items-center rounded-full transition-colors duration-200",
			checked ? "bg-orange-400" : "bg-stroke-soft-200",
		)}
	>
		<div
			className={cn(
				"absolute h-3 w-3 rounded-full bg-white shadow-sm transition-all duration-200",
				checked ? "left-3.5" : "left-0.5",
			)}
		/>
	</div>
);

/* ─── Legend Row ─── */
const LegendRow = ({
	icon,
	label,
	value,
	highlight,
}: {
	icon: string;
	label: string;
	value: string;
	highlight: boolean;
}) => (
	<div className="flex items-center gap-2">
		<Icon
			name={icon}
			className={cn(
				"h-3 w-3 shrink-0",
				highlight ? "text-orange-500" : "text-text-soft-400",
			)}
		/>
		<span className="text-[10px] text-text-soft-400">{label}:</span>
		<span
			className={cn(
				"text-[10px] font-medium",
				highlight ? "text-text-strong-950" : "text-text-sub-600",
			)}
		>
			{value}
		</span>
	</div>
);
