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
				return "warning";
			case "verifying":
				return "success";
			case "active":
				return "error";
			case "suspended":
				return "warning";
			case "failed":
				return "warning";
		}
	};

	const getStatusContent = () => {
		switch (status) {
			case "start-verify":
				return {
					title: "Looking for DNS Records in your domain provider...",
					description:
						"It may take a few minutes or hours, depending on the DNS provider propagation time.",
				};
			case "verifying":
				return {
					title: "DNS Records Found",
					description: "We found the DNS records in your domain provider.",
				};
			case "active":
				return {
					title: "No DNS Records Found",
					description:
						"We couldn't find the DNS records in your domain provider. Please check your DNS settings.",
				};
			case "suspended":
				return {
					title: "No DNS Records Found",
					description:
						"We couldn't find the DNS records in your domain provider. Please check your DNS settings.",
				};
			case "failed":
				return {
					title: "Looking for DNS Records in your domain provider...",
					description:
						"It may take a few minutes or hours, depending on the DNS provider propagation time.",
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
				return "border-warning-base";
			case "verifying":
				return "border-success-base";
			case "active":
				return "border-error-base";
			case "suspended":
				return "border-warning-base";
			case "failed":
				return "border-warning-base";
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
			className={`w-full rounded-xl border ${getBorderClass()} text-paragraph-sm shadow-regular-md ring-1 ring-stroke-soft-200 ring-inset`}
		>
			<div className="space-y-2.5">
				<div className="space-y-1">
					<div className="font-medium text-paragraph-sm">{title}</div>
					<div>{description}</div>
				</div>
			</div>
		</Alert.Root>
	);
};
