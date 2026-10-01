"use client";

import { adminErrorMessage, adminPatch } from "@fe/console/lib/admin-api";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Drawer from "@reloop/ui/drawer";
import { Icon } from "@reloop/ui/icon";
import {
	AlertOctagon,
	AlertTriangle,
	Building2,
	CheckCircle2,
	ExternalLink,
	Flame,
	Info,
	Mail,
	Shield,
	ShieldAlert,
	ShieldCheck,
	User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type SuspectSeverity = "low" | "medium" | "high" | "critical";
export type SuspectCategory = "spam" | "phishing" | "fraud" | "abuse" | "other";

export type SuspectionDrawerProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	entityType: "user" | "organization";
	entityId: string;
	entityName: string;
	entityIdentifier: string; // email for user, slug for org
	entityEmail?: string | null;
	entitySlug?: string | null;
	initialIsSuspect?: boolean;
	initialReason?: string | null;
	initialSeverity?: SuspectSeverity | null;
	initialCategory?: SuspectCategory | null;
	associatedCount?: number;
	onSuccess?: () => void;
};

const CATEGORIES: Array<{
	id: SuspectCategory;
	label: string;
	desc: string;
	icon: typeof AlertTriangle;
}> = [
	{
		id: "spam",
		label: "Spamming",
		desc: "Unsolicited cold blasts, high complaints",
		icon: Flame,
	},
	{
		id: "fraud",
		label: "Scam / Fraud",
		desc: "Impersonation, card scams, stolen credentials",
		icon: ShieldAlert,
	},
	{
		id: "phishing",
		label: "Phishing",
		desc: "Lure links, fake login pages, wallet stealers",
		icon: AlertOctagon,
	},
	{
		id: "abuse",
		label: "System Abuse",
		desc: "SMS gateway targets, extreme bounce rate",
		icon: AlertTriangle,
	},
	{
		id: "other",
		label: "Other Discretion",
		desc: "Suspicious sign-up patterns or custom trigger",
		icon: Info,
	},
];

const SEVERITIES: Array<{
	id: SuspectSeverity;
	label: string;
	color: string;
	activeRing: string;
}> = [
	{
		id: "low",
		label: "Low",
		color: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
		activeRing: "ring-blue-500/30 border-blue-500",
	},
	{
		id: "medium",
		label: "Medium",
		color: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
		activeRing: "ring-amber-500/30 border-amber-500",
	},
	{
		id: "high",
		label: "High",
		color: "text-orange-600 dark:text-orange-400 bg-orange-500/10",
		activeRing: "ring-orange-500/30 border-orange-500",
	},
	{
		id: "critical",
		label: "Critical",
		color: "text-red-600 dark:text-red-400 bg-red-500/10",
		activeRing: "ring-red-500/40 border-red-500",
	},
];

const QUICK_REASONS = [
	"Bulk cold spamming pattern",
	"High bounce rate & invalid addresses",
	"Phishing / crypto lure links detected",
	"Stolen credit card scam attempt",
	"SMS gateway email abuse",
	"Disposable email domain cluster",
];

export function SuspectionDrawer({
	open,
	onOpenChange,
	entityType,
	entityId,
	entityName,
	entityIdentifier,
	entityEmail,
	entitySlug,
	initialIsSuspect = false,
	initialReason = "",
	initialSeverity = "high",
	initialCategory = "spam",
	associatedCount = 0,
	onSuccess,
}: SuspectionDrawerProps) {
	const [isSuspect, setIsSuspect] = useState<boolean>(initialIsSuspect);
	const [reason, setReason] = useState<string>(initialReason || "");
	const [severity, setSeverity] = useState<SuspectSeverity>(
		initialSeverity || "high",
	);
	const [category, setCategory] = useState<SuspectCategory>(
		initialCategory || "spam",
	);
	const [propagate, setPropagate] = useState<boolean>(true);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (open) {
			setIsSuspect(initialIsSuspect);
			setReason(initialReason || "");
			setSeverity(initialSeverity || "high");
			setCategory(initialCategory || "spam");
			setPropagate(true);
		}
	}, [open, initialIsSuspect, initialReason, initialSeverity, initialCategory]);

	const handleSave = async () => {
		setSaving(true);
		try {
			if (entityType === "user") {
				await adminPatch(`/users/${entityId}/suspect`, {
					isSuspect,
					reason: isSuspect ? reason.trim() : null,
					severity: isSuspect ? severity : null,
					category: isSuspect ? category : null,
					flagOrganizations: propagate,
				});
			} else {
				await adminPatch(`/organizations/${entityId}/suspect`, {
					isSuspect,
					reason: isSuspect ? reason.trim() : null,
					severity: isSuspect ? severity : null,
					category: isSuspect ? category : null,
					flagUsers: propagate,
				});
			}

			toast.success(
				isSuspect
					? `Saved straight to database: Marked as suspected ${propagate ? (entityType === "user" ? "and flagged associated orgs" : "and flagged member users") : ""}`
					: "Suspect flag cleared in database",
			);
			onOpenChange(false);
			onSuccess?.();
		} catch (err) {
			toast.error(adminErrorMessage(err));
		} finally {
			setSaving(false);
		}
	};

	return (
		<Drawer.Root open={open} onOpenChange={onOpenChange}>
			<Drawer.Content className="w-full max-w-xl border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#121212]">
				{/* Drawer Header */}
				<Drawer.Header className="flex items-center justify-between border-stroke-soft-100 border-b px-6 py-4.5 dark:border-stroke-soft-100/40">
					<div className="flex min-w-0 items-center gap-3">
						<div
							className={cn(
								"flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
								isSuspect
									? "bg-red-500/10 text-red-600 dark:text-red-400"
									: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
							)}
						>
							{isSuspect ? (
								<ShieldAlert className="h-5 w-5" />
							) : (
								<ShieldCheck className="h-5 w-5" />
							)}
						</div>
						<div className="min-w-0">
							<div className="flex items-center gap-2">
								<Drawer.Title className="truncate font-semibold text-[16px] text-text-strong-950">
									Suspection Management
								</Drawer.Title>
								{isSuspect ? (
									<span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 font-medium text-[11px] text-red-600 dark:text-red-400">
										<span className="h-1.5 w-1.5 rounded-full bg-red-500" />
										Suspect
									</span>
								) : (
									<span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-[11px] text-emerald-600 dark:text-emerald-400">
										<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
										Clean
									</span>
								)}
							</div>
							<p className="truncate text-[12px] text-text-sub-600">
								Flag spam / scam abuse straight into the database
							</p>
						</div>
					</div>
				</Drawer.Header>

				{/* Drawer Body */}
				<Drawer.Body className="space-y-6 overflow-y-auto px-6 py-5">
					{/* Entity Target Card */}
					<div className="rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/60 p-4 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
						<div className="flex items-center justify-between gap-3">
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-stroke-soft-200 bg-bg-white-0 text-text-strong-950 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
									{entityType === "user" ? (
										<User className="h-4 w-4" />
									) : (
										<Building2 className="h-4 w-4" />
									)}
								</div>
								<div className="min-w-0">
									<p className="truncate font-semibold text-[13px] text-text-strong-950">
										{entityName}
									</p>
									<div className="flex items-center gap-1.5 text-text-sub-600">
										{entityEmail || (entityType === "user" ? entityIdentifier : null) ? (
											<div className="flex items-center gap-1">
												<Mail className="h-3 w-3 text-text-soft-400 shrink-0" />
												<span className="truncate font-mono text-[11px] text-text-strong-950 dark:text-gray-200">
													{entityEmail || entityIdentifier}
												</span>
											</div>
										) : (
											<p className="truncate font-mono text-[11px] text-text-sub-600">
												{entityIdentifier}
											</p>
										)}
									</div>
									{entitySlug ? (
										<p className="text-[10px] text-text-soft-400 font-mono">
											slug: {entitySlug}
										</p>
									) : null}
								</div>
							</div>
							<div className="text-right">
								<span className="rounded-md border border-stroke-soft-200 bg-bg-white-0 px-2 py-1 text-[11px] text-text-sub-600 capitalize dark:border-white/10 dark:bg-white/[0.04]">
									{entityType}
								</span>
								{associatedCount > 0 ? (
									<p className="mt-1 text-[11px] text-text-sub-600">
										{associatedCount}{" "}
										{entityType === "user" ? "organizations" : "members"}
									</p>
								) : null}
							</div>
						</div>

						{/* Quick Link to inspect their sent emails */}
						<div className="mt-3 flex items-center justify-between border-t border-stroke-soft-100 pt-2.5 dark:border-white/5">
							<span className="text-[11px] text-text-sub-600">
								Inspect sent spam / outbound logs:
							</span>
							<Button.Root asChild variant="neutral" mode="stroke" size="small">
								<a
									href={
										entityType === "organization"
											? `/emails?organizationId=${entityId}`
											: `/emails?userId=${entityId}`
									}
									target="_blank"
									rel="noreferrer"
									className="inline-flex items-center gap-1.5 text-[11px]"
								>
									<Mail className="h-3 w-3" />
									View Sent Emails
									<ExternalLink className="h-2.5 w-2.5 opacity-60" />
								</a>
							</Button.Root>
						</div>
					</div>

					{/* Action Status Selection */}
					<div className="space-y-2">
						<label className="font-semibold text-[12px] text-text-strong-950 uppercase tracking-wider">
							Suspect Status
						</label>
						<div className="grid grid-cols-2 gap-3">
							<button
								type="button"
								onClick={() => setIsSuspect(true)}
								className={cn(
									"flex flex-col items-start rounded-xl border p-3.5 text-left transition-all",
									isSuspect
										? "border-red-500/50 bg-red-500/[0.06] ring-2 ring-red-500/20 dark:border-red-500/60 dark:bg-red-500/10"
										: "border-stroke-soft-200 bg-bg-white-0 hover:bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-white/[0.02] dark:hover:bg-white/[0.05]",
								)}
							>
								<div className="flex w-full items-center justify-between">
									<span className="font-semibold text-[13px] text-red-600 dark:text-red-400">
										Mark as Suspect
									</span>
									<ShieldAlert
										className={cn(
											"h-4 w-4",
											isSuspect
												? "text-red-600 dark:text-red-400"
												: "text-text-sub-600",
										)}
									/>
								</div>
								<p className="mt-1 text-[11px] text-text-sub-600 leading-snug">
									Flags this account for scamming, spamming, or phishing.
								</p>
							</button>

							<button
								type="button"
								onClick={() => setIsSuspect(false)}
								className={cn(
									"flex flex-col items-start rounded-xl border p-3.5 text-left transition-all",
									!isSuspect
										? "border-emerald-500/50 bg-emerald-500/[0.06] ring-2 ring-emerald-500/20 dark:border-emerald-500/60 dark:bg-emerald-500/10"
										: "border-stroke-soft-200 bg-bg-white-0 hover:bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-white/[0.02] dark:hover:bg-white/[0.05]",
								)}
							>
								<div className="flex w-full items-center justify-between">
									<span className="font-semibold text-[13px] text-emerald-600 dark:text-emerald-400">
										Clear Suspect Flag
									</span>
									<CheckCircle2
										className={cn(
											"h-4 w-4",
											!isSuspect
												? "text-emerald-600 dark:text-emerald-400"
												: "text-text-sub-600",
										)}
									/>
								</div>
								<p className="mt-1 text-[11px] text-text-sub-600 leading-snug">
									Restores clean standing and clears suspicion marks.
								</p>
							</button>
						</div>
					</div>

					{isSuspect ? (
						<>
							{/* Category Selection */}
							<div className="space-y-2">
								<label className="font-semibold text-[12px] text-text-strong-950 uppercase tracking-wider">
									Suspicion Category
								</label>
								<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
									{CATEGORIES.map((cat) => {
										const IconComp = cat.icon;
										const selected = category === cat.id;
										return (
											<button
												key={cat.id}
												type="button"
												onClick={() => setCategory(cat.id)}
												className={cn(
													"flex flex-col items-start rounded-xl border p-2.5 text-left transition-all",
													selected
														? "border-text-strong-950 bg-bg-weak-50 font-medium text-text-strong-950 ring-1 ring-text-strong-950 dark:border-white dark:bg-white/[0.08] dark:text-white dark:ring-white"
														: "border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 hover:bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-white/[0.02] dark:hover:bg-white/[0.05]",
												)}
											>
												<div className="flex w-full items-center justify-between">
													<span className="font-medium text-[12px]">
														{cat.label}
													</span>
													<IconComp className="h-3.5 w-3.5 opacity-70" />
												</div>
												<span className="mt-0.5 line-clamp-1 text-[10px] text-text-sub-600">
													{cat.desc}
												</span>
											</button>
										);
									})}
								</div>
							</div>

							{/* Severity Selection */}
							<div className="space-y-2">
								<label className="font-semibold text-[12px] text-text-strong-950 uppercase tracking-wider">
									Risk / Severity Level
								</label>
								<div className="grid grid-cols-4 gap-2">
									{SEVERITIES.map((sev) => {
										const selected = severity === sev.id;
										return (
											<button
												key={sev.id}
												type="button"
												onClick={() => setSeverity(sev.id)}
												className={cn(
													"flex flex-col items-center justify-center rounded-xl border py-2 px-1 text-center transition-all",
													selected
														? cn(
																sev.activeRing,
																"border font-semibold shadow-xs ring-2",
															)
														: "border-stroke-soft-200 bg-bg-white-0 hover:bg-bg-weak-50 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]",
												)}
											>
												<span
													className={cn(
														"rounded-md px-1.5 py-0.5 text-[11px] font-medium",
														sev.color,
													)}
												>
													{sev.label}
												</span>
											</button>
										);
									})}
								</div>
							</div>

							{/* Reason / Notes */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<label className="font-semibold text-[12px] text-text-strong-950 uppercase tracking-wider">
										Reason & Evidence
									</label>
									<span className="text-[11px] text-text-sub-600">
										Saved directly into DB
									</span>
								</div>
								<textarea
									rows={3}
									value={reason}
									onChange={(e) => setReason(e.target.value)}
									placeholder="Describe reasons why this user/org is suspected of spamming, scamming, or fraud..."
									className="block w-full resize-none rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 text-[13px] text-text-strong-950 placeholder:text-text-soft-400 outline-none transition focus:border-text-strong-950 focus:ring-1 focus:ring-text-strong-950 dark:border-stroke-soft-100/40 dark:bg-white/[0.02] dark:focus:border-white"
								/>

								{/* Quick Reasons Chips */}
								<div className="flex flex-wrap gap-1.5 pt-1">
									{QUICK_REASONS.map((qr) => (
										<button
											key={qr}
											type="button"
											onClick={() =>
												setReason((prev) => (prev ? `${prev}; ${qr}` : qr))
											}
											className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50/50 px-2 py-0.5 text-[11px] text-text-sub-600 hover:border-stroke-soft-300 hover:text-text-strong-950 dark:border-stroke-soft-100/40 dark:bg-white/[0.04] dark:hover:border-white/20"
										>
											+ {qr}
										</button>
									))}
								</div>
							</div>
						</>
					) : (
						<div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 text-[12px] text-emerald-800 dark:text-emerald-300">
							<p className="font-medium">Clearing suspect flag</p>
							<p className="mt-1 text-emerald-700 dark:text-emerald-400">
								This entity will be marked as normal in the database. Suspicion
								reason, category, and severity will be cleared.
							</p>
						</div>
					)}

					{/* Dual Scope / Org & User Level Sync Checkbox */}
					<div className="rounded-xl border border-stroke-soft-200 bg-bg-weak-50/40 p-3.5 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
						<label className="flex items-start gap-3 cursor-pointer">
							<input
								type="checkbox"
								checked={propagate}
								onChange={(e) => setPropagate(e.target.checked)}
								className="mt-0.5 h-4 w-4 rounded border-stroke-soft-200 text-text-strong-950 focus:ring-text-strong-950 dark:border-white/20"
							/>
							<div className="min-w-0">
								<p className="font-medium text-[12px] text-text-strong-950">
									{entityType === "user"
										? "Save at org level as well (Also flag associated organizations)"
										: "Save at user level as well (Also flag member users)"}
								</p>
								<p className="mt-0.5 text-[11px] text-text-sub-600 leading-snug">
									{entityType === "user"
										? "Synchronizes the suspect mark into the database for all organizations this user belongs to, preventing evasion."
										: "Synchronizes the suspect mark into the database for all user members within this organization."}
								</p>
							</div>
						</label>
					</div>
				</Drawer.Body>

				{/* Drawer Footer */}
				<Drawer.Footer className="flex items-center justify-end gap-2.5 border-stroke-soft-100 border-t px-6 py-4 dark:border-stroke-soft-100/40">
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="medium"
						disabled={saving}
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button.Root>
					<Button.Root
						variant={isSuspect ? "error" : "primary"}
						mode="filled"
						size="medium"
						disabled={saving}
						onClick={handleSave}
					>
						{saving
							? "Saving to database…"
							: isSuspect
								? "Save Suspect Status"
								: "Save Clean Status"}
					</Button.Root>
				</Drawer.Footer>
			</Drawer.Content>
		</Drawer.Root>
	);
}
