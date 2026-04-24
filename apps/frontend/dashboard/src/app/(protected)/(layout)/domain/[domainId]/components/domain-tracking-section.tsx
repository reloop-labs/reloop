"use client";

import type { DomainResponse } from "@reloop/api";
import * as Checkbox from "@reloop/ui/checkbox";
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
		<div className="mt-7 mb-24">
			{/* Tracking Settings */}
			<div className="mb-10 space-y-6">
				{/* Click Tracking */}
				<div className="flex items-start gap-4">
					<Checkbox.Root
						checked={domain?.clickTracking ?? false}
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
						checked={domain?.openTracking ?? false}
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
		</div>
	);
};
