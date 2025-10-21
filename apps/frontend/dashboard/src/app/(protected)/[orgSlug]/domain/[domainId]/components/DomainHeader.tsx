"use client";

import * as Button from "@reloop/ui/button";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useRouter } from "next/navigation";

interface DomainHeaderProps {
	domainId: string;
	lastUpdated?: string;
	status?: "pending" | "verified" | "failed";
	isLoading?: boolean;
	isFailed?: boolean;
}

export const DomainHeader = ({
	domainId,
	lastUpdated = "20 minutes ago",
	status,
	isLoading,
	isFailed,
}: DomainHeaderProps) => {
	const { back } = useRouter();
	const getStatusColor = (status?: "pending" | "verified" | "failed") => {
		switch (status) {
			case "verified":
				return "text-success-base";
			case "failed":
				return "text-error-base";
			case "pending":
			default:
				return "text-warning-base";
		}
	};

	const getStatusIcon = (status?: "pending" | "verified" | "failed") => {
		switch (status) {
			case "verified":
				return "check-circle";
			case "failed":
				return "cross-circle";
			default:
				return "time";
		}
	};
	return (
		<div className="pt-10 pb-8">
			<Button.Root
				onClick={() => back()}
				variant="neutral"
				mode="stroke"
				size="xxsmall"
			>
				<Button.Icon>
					<Icon name="chevron-left" className="h-4 w-4" />
				</Button.Icon>
				Back
			</Button.Root>
			<div className="flex items-end justify-between pt-6">
				<div>
					{isLoading ? (
						<div className="flex items-center gap-1.5">
							<Skeleton className="h-4 w-12 rounded-full" />
							<Skeleton className="h-1 w-1 rounded-full" />
							<Skeleton className="h-4 w-20 rounded-full" />
							<Skeleton className="h-1 w-1 rounded-full" />
							<div className="flex items-center gap-1">
								<Skeleton className="h-3.5 w-3.5 rounded-full" />
								<Skeleton className="h-4 w-16 rounded-full" />
							</div>
						</div>
					) : (
						<div className="flex items-center gap-1.5">
							<p className="font-medium text-paragraph-sm text-text-sub-600">
								Domain{" "}
							</p>
							<p className="font-semibold text-paragraph-sm text-text-sub-600">
								•
							</p>
							<p className="font-medium text-paragraph-sm text-text-sub-600">
								{isFailed ? "---" : lastUpdated}
							</p>
							<p className="font-semibold text-paragraph-sm text-text-sub-600">
								•
							</p>
							<div
								className={`flex items-center gap-1 ${getStatusColor(status)}`}
							>
								<Icon name={getStatusIcon(status)} className="h-3.5 w-3.5" />
								<p className="font-medium text-paragraph-sm capitalize">
									{status}
								</p>
							</div>
						</div>
					)}
					<h1 className="font-medium text-title-h4 leading-8">{domainId}</h1>
				</div>

				<div className="flex items-center gap-2">
					{isLoading ? (
						<>
							<Skeleton className="h-9 w-32 rounded-lg" />
							<Skeleton className="h-9 w-9 rounded-lg" />
						</>
					) : isFailed ? (
						<Button.Root variant="error" size="small" mode="lighter">
							Try Again
						</Button.Root>
					) : (
						<>
							<Button.Root
								variant="neutral"
								size="small"
								className="font-semibold"
							>
								Verify DNS Records
							</Button.Root>
							<Dropdown.Root>
								<Dropdown.Trigger asChild>
									<Button.Root variant="neutral" mode="stroke" size="xsmall">
										<Icon name="more-vertical" className="h-4 w-4 rotate-90" />
									</Button.Root>
								</Dropdown.Trigger>
								<Dropdown.Content align="end" className="w-48">
									<Dropdown.Item
										onClick={() =>
											window.open("https://reloop.sh/docs/domain", "_blank")
										}
										className="gap-2"
									>
										<Icon name="file-text" className="h-4 w-4" />
										Go to docs
									</Dropdown.Item>
									<Dropdown.Item
										onClick={() => {
											// TODO: Implement remove domain functionality
											console.log("Remove domain");
										}}
										className="gap-2 text-error-base"
									>
										<Icon name="trash" className="h-4 w-4" />
										Remove domain
									</Dropdown.Item>
								</Dropdown.Content>
							</Dropdown.Root>
						</>
					)}
				</div>
			</div>
		</div>
	);
};
