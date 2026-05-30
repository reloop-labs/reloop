"use client";

import type { DomainResponse } from "@fe/dashboard/types/api.types";
import * as Checkbox from "@reloop/ui/checkbox";
import * as Radio from "@reloop/ui/radio";
import { useParams } from "next/navigation";
import { useDomainActions } from "../hooks/use-domain-actions";

interface DomainTrackingSectionProps {
	domain?: DomainResponse;
	isLoading?: boolean;
}

export const DomainTrackingSection = ({
	domain,
	isLoading,
}: DomainTrackingSectionProps) => {
	const { domainId } = useParams();
	const { handleUpdateDomain } = useDomainActions(domainId as string, domain);
	const onToggleClickTracking = (value: boolean) => {
		if (!handleUpdateDomain) return;

		handleUpdateDomain(
			{ isClickTrackingEnabled: value },
			`Click tracking ${value ? "enabled" : "disabled"}`,
		);
	};

	const onToggleOpenTracking = (value: boolean) => {
		if (!handleUpdateDomain) return;

		handleUpdateDomain(
			{ isOpenTrackingEnabled: value },
			`Open tracking ${value ? "enabled" : "disabled"}`,
		);
	};

	const onTLSChange = (value: string) => {
		if (!handleUpdateDomain) return;

		handleUpdateDomain(
			{ tls: value as "opportunistic" | "enforced" },
			`TLS mode updated to ${value === "enforced" ? "Enforced" : "Opportunistic"}`,
		);
	};

	return (
		<div className="mt-7 mb-24 space-y-8">
			{/* Tracking Settings */}
			<div className="space-y-6">
				{/* Click Tracking */}
				<div className="flex items-start gap-4">
					<Checkbox.Root
						checked={domain?.isClickTrackingEnabled ?? false}
						onCheckedChange={onToggleClickTracking}
						disabled={isLoading}
					/>
					<div className="space-y-1">
						<div className="font-medium text-sm text-text-strong-950">
							Click Tracking
						</div>
						<div className="text-text-sub-600 text-xs">
							Track when recipients click links in your emails.
						</div>
					</div>
				</div>

				{/* Open Tracking */}
				<div className="flex items-start gap-4">
					<Checkbox.Root
						checked={domain?.isOpenTrackingEnabled ?? false}
						onCheckedChange={onToggleOpenTracking}
						disabled={isLoading}
					/>
					<div className="space-y-1">
						<div className="font-medium text-sm text-text-strong-950">
							Open Tracking
						</div>
						<div className="text-text-sub-600 text-xs">
							Track when recipients open your emails. Note: results can be
							inaccurate.
						</div>
					</div>
				</div>
			</div>

			{/* Tracking Link */}
			{domain && (
				<div className="rounded-xl border border-border-sub-200 bg-bg-weak-50 p-4">
					<div className="flex items-center justify-between">
						<div className="space-y-1">
							<div className="font-medium text-sm text-text-strong-950">
								Tracking Domain
							</div>
							<div className="text-text-sub-600 text-xs">
								The domain used to track clicks and opens.
							</div>
						</div>
						<div className="flex items-center gap-2 rounded-lg border border-border-sub-200 bg-white-0 px-3 py-1.5 text-xs text-text-strong-950 font-mono">
							{domain.trackingSubdomain}.{domain.domain}
						</div>
					</div>
				</div>
			)}

			{/* TLS Mode */}
			<div className="border-t border-border-sub-200 pt-8">
				<div className="font-medium text-sm text-text-strong-950 mb-4">
					TLS Mode
				</div>
				<Radio.Group
					value={domain?.tls ?? "opportunistic"}
					onValueChange={onTLSChange}
					disabled={isLoading}
					className="space-y-4"
				>
					<div className="flex items-start gap-4">
						<Radio.Item value="opportunistic" id="tls-opportunistic" className="mt-0.5" />
						<label htmlFor="tls-opportunistic" className="space-y-1 cursor-pointer">
							<div className="font-medium text-sm text-text-strong-950">
								Opportunistic
							</div>
							<div className="text-text-sub-600 text-xs">
								Attempt to deliver email using TLS, but fall back to plaintext if the recipient server doesn't support TLS.
							</div>
						</label>
					</div>

					<div className="flex items-start gap-4">
						<Radio.Item value="enforced" id="tls-enforced" className="mt-0.5" />
						<label htmlFor="tls-enforced" className="space-y-1 cursor-pointer">
							<div className="font-medium text-sm text-text-strong-950">
								Enforced
							</div>
							<div className="text-text-sub-600 text-xs">
								Only deliver email if the recipient server supports TLS. If it doesn't, delivery will fail.
							</div>
						</label>
					</div>
				</Radio.Group>
			</div>
		</div>
	);
};
