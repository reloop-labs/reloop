"use client";

import type { DomainResponse } from "@reloop/api";
import * as Switch from "@reloop/ui/switch";
import { groupDomainDnsRecords } from "./dns-record-groups";
import { DNSRecordTable } from "./dns-record-table";

interface DomainTrackingSectionProps {
	domain?: DomainResponse;
	isLoading?: boolean;
	handleUpdateDomain?: (
		payload: Partial<
			Pick<
				DomainResponse,
				"sendingEmail" | "receivingEmail" | "clickTracking" | "openTracking"
			>
		>,
		successMessage: string,
	) => Promise<void>;
	onCopyToClipboard?: (text: string, itemId: string) => void;
	copiedItems?: Set<string>;
}

export const DomainTrackingSection = ({
	domain,
	isLoading,
	handleUpdateDomain,
	onCopyToClipboard,
	copiedItems = new Set(),
}: DomainTrackingSectionProps) => {
	const { trackingRecords } = groupDomainDnsRecords(domain?.dnsRecords);

	const onToggleClickTracking = (value: boolean) => {
		if (!handleUpdateDomain) return;

		handleUpdateDomain(
			{ clickTracking: value },
			`Click tracking ${value ? "enabled" : "disabled"}`,
		);
	};

	const onToggleOpenTracking = (value: boolean) => {
		if (!handleUpdateDomain) return;

		handleUpdateDomain(
			{ openTracking: value },
			`Open tracking ${value ? "enabled" : "disabled"}`,
		);
	};

	return (
		<div className="mb-24">
			{/* Tracking Settings */}
			<div className="mb-10 space-y-6">
				{/* Click Tracking */}
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-1">
						<div className="font-medium text-sm text-text-strong-950">
							Click Tracking
						</div>
						<div className="text-text-sub-600 text-xs">
							Track when recipients click links in your emails.
						</div>
					</div>
					<Switch.Root
						checked={domain?.clickTracking ?? false}
						onCheckedChange={onToggleClickTracking}
						disabled={isLoading}
						checkedColor="orange"
					/>
				</div>

				{/* Open Tracking */}
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-1">
						<div className="font-medium text-sm text-text-strong-950">
							Open Tracking
						</div>
						<div className="text-text-sub-600 text-xs">
							Track when recipients open your emails. Note: results can be
							inaccurate.
						</div>
					</div>
					<Switch.Root
						checked={domain?.openTracking ?? false}
						onCheckedChange={onToggleOpenTracking}
						disabled={isLoading}
						checkedColor="orange"
					/>
				</div>
			</div>

			{/* DNS Records for Tracking */}
			{trackingRecords.length > 0 && (
				<div>
					<div className="mb-6 space-y-1">
						<div className="font-medium text-sm text-text-strong-950">
							DNS Records
						</div>
						<div className="text-text-sub-600 text-xs">
							Required DNS records for tracking to work correctly.
						</div>
					</div>
					<DNSRecordTable
						records={trackingRecords}
						onCopyToClipboard={onCopyToClipboard}
						copiedItems={copiedItems}
						isLoading={isLoading}
						loadingRows={1}
						tableId="tracking-"
					/>
				</div>
			)}
		</div>
	);
};
