"use client";

import * as Alert from "@reloop/ui/alert";
import { Skeleton } from "@reloop/ui/skeleton";

interface StatusBannerProps {
	status: "pending" | "success" | "error" | "warning";
	isLoading?: boolean;
}

export const StatusBanner = ({ status, isLoading }: StatusBannerProps) => {
	const getStatusVariant = () => {
		switch (status) {
			case "pending":
				return "warning";
			case "success":
				return "success";
			case "error":
				return "error";
			case "warning":
				return "warning";
			default:
				return "warning";
		}
	};

	const getStatusContent = () => {
		switch (status) {
			case "pending":
				return {
					title: "Looking for DNS Records in your domain provider...",
					description:
						"It may take a few minutes or hours, depending on the DNS provider propagation time.",
				};
			case "success":
				return {
					title: "DNS Records Found",
					description: "We found the DNS records in your domain provider.",
				};
			case "error":
				return {
					title: "No DNS Records Found",
					description:
						"We couldn't find the DNS records in your domain provider. Please check your DNS settings.",
				};
			case "warning":
				return {
					title: "No DNS Records Found",
					description:
						"We couldn't find the DNS records in your domain provider. Please check your DNS settings.",
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
			case "pending":
				return "border-warning-base";
			case "success":
				return "border-success-base";
			case "error":
				return "border-error-base";
			case "warning":
				return "border-warning-base";
			default:
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
