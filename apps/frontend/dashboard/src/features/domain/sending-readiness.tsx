"use client";

import { Icon } from "@reloop/ui/icon";
import * as Switch from "@reloop/ui/switch";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { queryKeys } from "#/lib/query-keys";
import type { Domain } from "./types";

/** Shared by the From fields (campaigns, templates, workflows). */

export function isDomainVerified(d: Domain): boolean {
	return d.status === "active" || d.systemVerified || d.userVerifiedDomain;
}

/** A domain can be used as a From address: verified and sending on. */
export function canSendFrom(d: Domain): boolean {
	return isDomainVerified(d) && d.isSendingEmailEnabled !== false;
}

/** Turns sending on for a domain, then refreshes every domain query. */
export function useEnableSending(): (domainId: string) => Promise<void> {
	const queryClient = useQueryClient();
	return useCallback(
		async (domainId: string) => {
			const save = axios.patch(
				`/api/domain/v1/${domainId}`,
				{ sending_email: true },
				{ withCredentials: true },
			);
			toast.promise(save, {
				loading: "Enabling email sending...",
				success: "Sending enabled successfully",
				error: (error) =>
					axios.isAxiosError(error)
						? error.response?.data?.message ||
							"Failed to update domain settings"
						: "Failed to update domain settings",
			});
			try {
				await save;
			} finally {
				await queryClient.invalidateQueries({ queryKey: queryKeys.domain.all });
			}
		},
		[queryClient],
	);
}

export type FromDomainError = {
	title: string;
	description: string;
	actionText: string;
	actionLink: string;
};

/**
 * Why a typed From domain can't be used, or `null` when it can. Names the
 * actual blocker (not added / not verified / sending off) instead of a
 * generic "verify your domain".
 */
export function getFromDomainError(
	domains: Domain[],
	fromDomain: string,
): FromDomainError | null {
	const name = fromDomain.toLowerCase();
	const matches = domains.filter((d) => d.domain.toLowerCase() === name);
	if (matches.some(canSendFrom)) return null;

	const verified = matches.find(isDomainVerified);
	if (verified) {
		return {
			title: "Sending is off",
			description: `${verified.domain} is verified, but sending is turned off for it.`,
			actionText: "Turn on sending",
			actionLink: `/domain/${verified.id}`,
		};
	}
	const added = matches[0];
	if (added) {
		return {
			title: "Domain not verified yet",
			description: `Finish verifying ${added.domain} to send from it.`,
			actionText: "Finish verification",
			actionLink: `/domain/${added.id}`,
		};
	}
	return {
		title: "Domain not added",
		description: `Add ${fromDomain} to Reloop and verify it to send from it.`,
		actionText: "Add domain",
		actionLink: "/domain/add",
	};
}

const linkClassName =
	"inline-flex items-center gap-1 font-semibold text-paragraph-xs text-text-strong-950 underline decoration-dotted underline-offset-2 transition-colors hover:text-text-sub-600";

/**
 * Shown in a From dropdown when no domain can send. Says what's missing and
 * offers the shortest fix: turn sending back on in place, finish
 * verification, or add a domain.
 */
export function NoSendingDomainNotice({ domains }: { domains: Domain[] }) {
	const enableSending = useEnableSending();
	const [pendingId, setPendingId] = useState<string | null>(null);

	const sendingOff = domains.filter(
		(d) => isDomainVerified(d) && d.isSendingEmailEnabled === false,
	);
	const unverified = domains.find((d) => !isDomainVerified(d));

	let title: string;
	let description: string;
	if (sendingOff.length > 0) {
		title =
			sendingOff.length === 1
				? `Sending is off for ${sendingOff[0]?.domain}`
				: "Sending is off for your verified domains";
		description = "Switch it on to send from this domain.";
	} else if (unverified) {
		title = "No verified domains yet";
		description = `Finish verifying ${unverified.domain} to start sending.`;
	} else {
		title = "No domains yet";
		description = "Add and verify a domain to start sending.";
	}

	return (
		<div className="flex flex-col gap-2 p-3 text-left">
			<div className="flex items-center gap-2 text-text-sub-600">
				<Icon name="alert-circle" className="h-4 w-4 text-warning-base" />
				<span className="font-medium text-label-xs text-text-strong-950">
					{title}
				</span>
			</div>
			<p className="text-paragraph-xs text-text-sub-600">{description}</p>
			{sendingOff.length > 0 ? (
				<div className="flex flex-col gap-1.5">
					{sendingOff.slice(0, 3).map((d) => (
						// mousedown is cancelled so focus stays in the From input and the
						// dropdown doesn't close mid-click
						<div
							key={d.id}
							role="presentation"
							onMouseDown={(e) => e.preventDefault()}
							className="flex items-center justify-between gap-3 rounded-lg bg-bg-weak-50 px-2.5 py-2"
						>
							<div className="flex min-w-0 flex-col">
								<span className="truncate font-medium text-label-xs text-text-strong-950">
									{d.domain}
								</span>
								<a
									href={`/domain/${d.id}`}
									target="_blank"
									rel="noreferrer"
									className="inline-flex items-center gap-1 text-paragraph-xs text-text-sub-600 underline decoration-dotted underline-offset-2 hover:text-text-strong-950"
								>
									Open domain settings
									<Icon name="arrow-up-right" className="h-3 w-3" />
								</a>
							</div>
							<Switch.Root
								aria-label={`Turn on sending for ${d.domain}`}
								checked={pendingId === d.id}
								disabled={pendingId !== null}
								onCheckedChange={(checked) => {
									if (!checked) return;
									setPendingId(d.id);
									void enableSending(d.id)
										.catch(() => {})
										.finally(() => setPendingId(null));
								}}
							/>
						</div>
					))}
				</div>
			) : (
				<Link
					href={unverified ? `/domain/${unverified.id}` : "/domain/add"}
					className={linkClassName}
				>
					{unverified ? "Finish verification" : "Add domain"}
					<Icon name="arrow-right" className="h-3 w-3" />
				</Link>
			)}
		</div>
	);
}
