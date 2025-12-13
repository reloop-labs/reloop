"use client";

import type { DomainStatus } from "@reloop/api/types";
import * as Alert from "@reloop/ui/alert";
import { Skeleton } from "@reloop/ui/skeleton";

interface StatusBannerProps {
	status: DomainStatus;
	isLoading?: boolean;
}

export const StatusBanner = ({ status, isLoading }: StatusBannerProps) => {
	const getStatusVariant = () => {
		switch (status) {
			case "start-verify":
				return "feature";
			case "verifying":
				return "warning";
			case "active":
				return "success";
			case "suspended":
				return "error";
			case "failed":
				return "error";
		}
	};

	const getStatusContent = () => {
		switch (status) {
			case "start-verify":
				return {
					title: "Start verifying your domain DNS records",
					description:
						"Once you have added the DNS records, click the button above to verify them.",
				};
			case "verifying":
				return {
					title: "We are verifying the DNS records...",
					description:
						"It may take a few minutes or hours, depending on the DNS provider propagation time.",
				};
			case "active":
				return {
					title: "DNS Records Found",
					description:
						"We found the DNS records in your domain provider. We are verifying them now.",
				};
			case "suspended":
				return {
					title: "We Suspended Your Domain",
					description:
						"We suspended your domain because it looks suspicious. Please contact support if you think this is a mistake.",
				};
			case "failed":
				return {
					title: "We couldn't find the DNS records in your domain provider.",
					description: "Please check your DNS settings and try again.",
				};
			default:
				return {
					title: "Looking for DNS Records in your domain provider...",
					description:
						"It may take a few minutes or hours, depending on the DNS provider propagation time.",
				};
		}
	};

	const getBorderClass = () => {
		switch (status) {
			case "start-verify":
				return "";
			case "verifying":
				return "border-warning-base";
			case "active":
				return "border-success-base";
			case "suspended":
				return "border-error-base";
			case "failed":
				return "border-error-base";
		}
	};

	const { title, description } = getStatusContent();

	return isLoading ? (
		<Skeleton className="h-20 w-full animate-pulse rounded-xl" />
	) : (
		<Alert.Root
			variant="lighter"
			status={getStatusVariant()}
			size="large"
			className={`w-full rounded-xl border ${getBorderClass()} shadow-regular-md ring-1 ring-stroke-soft-200 ring-inset rounded-2xl`}
		>
			<div className="space-y-0.5">
				<div className="font-medium text-base">{title}</div>
				<p className="text-paragraph-sm">{description}</p>
			</div>
		</Alert.Root >
	);
};
