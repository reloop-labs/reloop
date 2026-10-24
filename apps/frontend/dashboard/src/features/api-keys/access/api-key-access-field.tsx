"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import * as SegmentedControl from "@reloop/ui/segmented-control";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useState } from "react";
import type { DomainListResponse } from "#/features/domain/types";
import type { ApiKeyScopeEntry } from "../types";

/** One allowed domain: every address on it, or only the listed ones. */
export type ApiKeyAccessEntry = {
	domainId: string;
	domain: string;
	allAddresses: boolean;
	/** Full lowercase addresses on `domain`. */
	emails: string[];
};

export type ApiKeyAccessValue = {
	restricted: boolean;
	entries: ApiKeyAccessEntry[];
};

export const FULL_ACCESS: ApiKeyAccessValue = {
	restricted: false,
	entries: [],
};

/** Request body `scope` for create/update; [] means full access. */
export function accessToScope(
	value: ApiKeyAccessValue,
): { domainId: string; email?: string }[] {
	if (!value.restricted) return [];
	return value.entries.flatMap((entry) =>
		entry.allAddresses
			? [{ domainId: entry.domainId }]
			: entry.emails.map((email) => ({ domainId: entry.domainId, email })),
	);
}

export function scopeToAccess(
	scope: ApiKeyScopeEntry[] | undefined,
): ApiKeyAccessValue {
	if (!scope || scope.length === 0) return FULL_ACCESS;
	const byDomain = new Map<string, ApiKeyAccessEntry>();
	for (const item of scope) {
		const entry = byDomain.get(item.domainId) ?? {
			domainId: item.domainId,
			domain: item.domain,
			allAddresses: false,
			emails: [],
		};
		if (item.email === null) entry.allAddresses = true;
		else entry.emails.push(item.email);
		byDomain.set(item.domainId, entry);
	}
	return { restricted: true, entries: [...byDomain.values()] };
}

/** Why the value can't be saved yet, or null when it can. */
export function accessError(value: ApiKeyAccessValue): string | null {
	if (!value.restricted) return null;
	if (value.entries.length === 0) return "Add at least one domain.";
	const empty = value.entries.find(
		(e) => !e.allAddresses && e.emails.length === 0,
	);
	if (empty) {
		return `Add an address on ${empty.domain}, or allow all of its addresses.`;
	}
	return null;
}

function useOrgDomains(enabled: boolean) {
	return useQuery({
		queryKey: ["domain", "list", "api-key-access"],
		queryFn: async () => {
			const res = await fetch("/api/domain/v1/list?limit=100&page=1", {
				credentials: "include",
			});
			if (!res.ok) throw new Error(`Failed to load domains (${res.status})`);
			return (await res.json()) as DomainListResponse;
		},
		enabled,
		staleTime: 60_000,
	});
}

export function ApiKeyAccessField({
	value,
	onChange,
	disabled = false,
	showError = false,
}: {
	value: ApiKeyAccessValue;
	onChange: (value: ApiKeyAccessValue) => void;
	disabled?: boolean;
	/** Show the validation message (e.g. after a submit attempt). */
	showError?: boolean;
}) {
	const { data, isLoading } = useOrgDomains(value.restricted);
	const domains = (data?.domains ?? []).filter((d) => !d.deletedAt);
	const available = domains.filter(
		(d) => !value.entries.some((e) => e.domainId === d.id),
	);
	const error = showError ? accessError(value) : null;

	const updateEntry = (domainId: string, patch: Partial<ApiKeyAccessEntry>) =>
		onChange({
			...value,
			entries: value.entries.map((e) =>
				e.domainId === domainId ? { ...e, ...patch } : e,
			),
		});

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between gap-3">
				<Label.Root className="font-medium text-text-strong-950 text-xs dark:text-white">
					Access
				</Label.Root>
				<SegmentedControl.Root
					value={value.restricted ? "restricted" : "full"}
					onValueChange={(next) =>
						onChange(
							next === "full"
								? FULL_ACCESS
								: { restricted: true, entries: value.entries },
						)
					}
				>
					<SegmentedControl.List className="h-8 w-auto rounded-xl">
						<SegmentedControl.Trigger
							value="full"
							disabled={disabled}
							className="cursor-pointer px-2.5 text-xs"
						>
							Full access
						</SegmentedControl.Trigger>
						<SegmentedControl.Trigger
							value="restricted"
							disabled={disabled}
							className="cursor-pointer px-2.5 text-xs"
						>
							Specific domains
						</SegmentedControl.Trigger>
					</SegmentedControl.List>
				</SegmentedControl.Root>
			</div>

			<p className="text-text-sub-600 text-xs leading-relaxed dark:text-white/60">
				{value.restricted
					? "This key can only send from, and sign in to mailboxes on, the domains and addresses below. It can't manage API keys."
					: "This key can send from any domain and sign in to any mailbox in this organization."}
			</p>

			{value.restricted ? (
				<div className="flex flex-col gap-2">
					{value.entries.map((entry) => (
						<AccessEntryCard
							key={entry.domainId}
							entry={entry}
							disabled={disabled}
							onChange={(patch) => updateEntry(entry.domainId, patch)}
							onRemove={() =>
								onChange({
									...value,
									entries: value.entries.filter(
										(e) => e.domainId !== entry.domainId,
									),
								})
							}
						/>
					))}

					<Dropdown.Root>
						<Dropdown.Trigger asChild>
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								size="xsmall"
								disabled={disabled || isLoading || available.length === 0}
								className="w-fit"
							>
								<Button.Icon as={Icon} name="plus" />
								{isLoading
									? "Loading domains…"
									: available.length === 0 && domains.length > 0
										? "All domains added"
										: domains.length === 0
											? "No domains yet"
											: "Add domain"}
							</Button.Root>
						</Dropdown.Trigger>
						<Dropdown.Content
							align="start"
							className="max-h-64 overflow-y-auto"
						>
							{available.map((d) => (
								<Dropdown.Item
									key={d.id}
									onSelect={() =>
										onChange({
											...value,
											entries: [
												...value.entries,
												{
													domainId: d.id,
													domain: d.domain,
													allAddresses: true,
													emails: [],
												},
											],
										})
									}
								>
									<Dropdown.ItemIcon as={Icon} name="globe" />
									<span className="truncate">{d.domain}</span>
								</Dropdown.Item>
							))}
						</Dropdown.Content>
					</Dropdown.Root>
				</div>
			) : null}

			{error ? <p className="text-error-base text-xs">{error}</p> : null}
		</div>
	);
}

function AccessEntryCard({
	entry,
	disabled,
	onChange,
	onRemove,
}: {
	entry: ApiKeyAccessEntry;
	disabled: boolean;
	onChange: (patch: Partial<ApiKeyAccessEntry>) => void;
	onRemove: () => void;
}) {
	const [draft, setDraft] = useState("");
	const [draftError, setDraftError] = useState<string | null>(null);

	// Accept "support" or "support@domain"; anything else on another domain is an error.
	const commitDraft = () => {
		const raw = draft
			.trim()
			.toLowerCase()
			.replace(/[,;\s]+$/, "");
		if (!raw) return;
		const email = raw.includes("@") ? raw : `${raw}@${entry.domain}`;
		const [local, domain] = [
			email.slice(0, email.lastIndexOf("@")),
			email.slice(email.lastIndexOf("@") + 1),
		];
		if (!local || /[\s<>@]/.test(local)) {
			setDraftError("That isn't a valid address.");
			return;
		}
		if (domain !== entry.domain.toLowerCase()) {
			setDraftError(`Addresses here must end in @${entry.domain}.`);
			return;
		}
		if (!entry.emails.includes(email)) {
			onChange({ emails: [...entry.emails, email] });
		}
		setDraft("");
		setDraftError(null);
	};

	return (
		<div className="flex flex-col gap-2.5 rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-2.5 dark:border-stroke-soft-100/40">
			<div className="flex items-center gap-2">
				<Icon name="globe" className="size-4 shrink-0 text-text-sub-600" />
				<span className="min-w-0 flex-1 truncate font-medium text-sm text-text-strong-950 dark:text-white">
					{entry.domain}
				</span>
				<SegmentedControl.Root
					value={entry.allAddresses ? "all" : "specific"}
					onValueChange={(next) => onChange({ allAddresses: next === "all" })}
				>
					<SegmentedControl.List className="h-7 w-auto rounded-lg">
						<SegmentedControl.Trigger
							value="all"
							disabled={disabled}
							className="cursor-pointer px-2 text-[11px]"
						>
							All addresses
						</SegmentedControl.Trigger>
						<SegmentedControl.Trigger
							value="specific"
							disabled={disabled}
							className="cursor-pointer px-2 text-[11px]"
						>
							Specific
						</SegmentedControl.Trigger>
					</SegmentedControl.List>
				</SegmentedControl.Root>
				<button
					type="button"
					onClick={onRemove}
					disabled={disabled}
					aria-label={`Remove ${entry.domain}`}
					className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950"
				>
					<X className="size-3.5" strokeWidth={2.5} />
				</button>
			</div>

			{entry.allAddresses ? null : (
				<div className="flex flex-col gap-1">
					<label
						className={cn(
							"flex min-h-[38px] cursor-text flex-wrap items-center gap-1.5 rounded-lg border border-stroke-soft-100 bg-bg-white-0 px-2 py-1.5 transition duration-200 ease-out focus-within:border-stroke-strong-950 focus-within:shadow-button-important-focus dark:border-stroke-soft-100/40",
							disabled && "pointer-events-none opacity-50",
						)}
					>
						{entry.emails.map((email) => (
							<span
								key={email}
								className="inline-flex h-6 max-w-full items-center gap-1 rounded-full border border-stroke-soft-100 bg-bg-weak-50 py-0.5 pr-1.5 pl-2.5 text-paragraph-sm text-text-strong-950 dark:border-stroke-soft-100/40"
							>
								<span className="truncate font-medium">{email}</span>
								<button
									type="button"
									onClick={(e) => {
										e.preventDefault();
										onChange({
											emails: entry.emails.filter((x) => x !== email),
										});
									}}
									aria-label={`Remove ${email}`}
									className="flex size-3.5 cursor-pointer items-center justify-center rounded-full text-text-sub-600 hover:bg-stroke-soft-200 hover:text-text-strong-950"
								>
									<X className="size-3" strokeWidth={2.5} />
								</button>
							</span>
						))}
						<span className="flex min-w-[140px] flex-1 items-center">
							<input
								type="text"
								value={draft}
								disabled={disabled}
								onChange={(e) => {
									setDraft(e.target.value);
									setDraftError(null);
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === "," || e.key === " ") {
										e.preventDefault();
										commitDraft();
									} else if (
										e.key === "Backspace" &&
										!draft &&
										entry.emails.length > 0
									) {
										onChange({ emails: entry.emails.slice(0, -1) });
									}
								}}
								onBlur={commitDraft}
								placeholder={entry.emails.length === 0 ? "support" : ""}
								aria-label={`Address on ${entry.domain}`}
								className="w-full min-w-0 bg-transparent text-paragraph-sm text-text-strong-950 outline-none placeholder:text-text-soft-400"
							/>
							{draft.includes("@") ? null : (
								<span className="shrink-0 text-paragraph-sm text-text-soft-400">
									@{entry.domain}
								</span>
							)}
						</span>
					</label>
					{draftError ? (
						<p className="text-error-base text-xs">{draftError}</p>
					) : (
						<p className="text-text-soft-400 text-xs">
							Type a name and press Enter. Add as many as you need.
						</p>
					)}
				</div>
			)}
		</div>
	);
}
