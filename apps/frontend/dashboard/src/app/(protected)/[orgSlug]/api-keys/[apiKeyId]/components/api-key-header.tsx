"use client";
import { formatRelativeTime } from "@fe/dashboard/utils/time";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { Skeleton } from "@reloop/ui/skeleton";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface ApiKeyData {
	id: string;
	name: string | null;
	start: string | null;
	prefix: string | null;
	organizationId: string;
	userId: string;
	refillInterval: number | null;
	refillAmount: number | null;
	lastRefillAt: string | null;
	enabled: boolean;
	rateLimitEnabled: boolean;
	rateLimitTimeWindow: number;
	rateLimitMax: number;
	requestCount: number;
	remaining: number | null;
	lastRequest: string | null;
	expiresAt: string | null;
	createdAt: string;
	updatedAt: string;
	permissions: string | null;
	metadata: string | null;
}

interface ApiKeyHeaderProps {
	apiKey: ApiKeyData | undefined;
	isLoading: boolean;
	isFailed?: boolean;
	onDeleteApiKey?: () => void;
}

const getStatusColor = (enabled: boolean) => {
	return enabled ? "text-green-600" : "text-gray-600";
};

const getStatusIcon = (enabled: boolean) => {
	return enabled ? "check-circle" : "x-circle";
};

export const ApiKeyHeader = ({
	apiKey,
	isLoading,
	isFailed,
	onDeleteApiKey,
}: ApiKeyHeaderProps) => {
	const { back } = useRouter();
	const [copied, setCopied] = useState(false);

	const handleCopyPrefix = async () => {
		const textToCopy = apiKey?.start || apiKey?.prefix || "";
		if (textToCopy) {
			try {
				await navigator.clipboard.writeText(textToCopy);
				toast.success("API key prefix copied to clipboard");
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			} catch {
				toast.error("Failed to copy prefix");
			}
		}
	};

	if (!apiKey && !isLoading) {
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
				<div className="flex justify-between pt-6">
					<div>
						<div className="flex items-center gap-1.5">
							<p className="font-medium text-paragraph-sm text-text-sub-600">
								API Key{" "}
							</p>
							<p className="font-semibold text-paragraph-sm text-text-sub-600">
								•
							</p>
							<p className="font-medium text-paragraph-sm text-text-sub-600">
								---
							</p>
							<p className="font-semibold text-paragraph-sm text-text-sub-600">
								•
							</p>
							<div className="flex items-center gap-1 text-red-600">
								<Icon name="alert-circle" className="h-3.5 w-3.5" />
								<p className="font-medium text-paragraph-sm">Not found</p>
							</div>
						</div>
						<h1 className="font-medium text-title-h4 leading-8">
							API key not found
						</h1>
					</div>
				</div>
			</div>
		);
	}

	const displayName =
		apiKey?.name || apiKey?.start || apiKey?.prefix || "Unnamed";
	const displayPrefix = apiKey?.start || apiKey?.prefix || "---";

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
			<div className="flex justify-between pt-6">
				<div>
					{isLoading ? (
						<>
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
							<Skeleton className="mt-2 mb-4 h-8 w-48 rounded-lg" />
						</>
					) : (
						<>
							<div className="flex items-center gap-1.5">
								<p className="font-medium text-paragraph-sm text-text-sub-600">
									API Key{" "}
								</p>
								<p className="font-semibold text-paragraph-sm text-text-sub-600">
									•
								</p>
								<p className="font-medium text-paragraph-sm text-text-sub-600">
									{isFailed
										? "---"
										: apiKey?.createdAt
											? formatRelativeTime(apiKey.createdAt)
											: "---"}
								</p>
								<p className="font-semibold text-paragraph-sm text-text-sub-600">
									•
								</p>
								<div
									className={`flex items-center gap-1 ${getStatusColor(apiKey?.enabled || false)}`}
								>
									<Icon
										name={getStatusIcon(apiKey?.enabled || false)}
										className="h-3.5 w-3.5"
									/>
									<p className="font-medium text-paragraph-sm">
										{apiKey?.enabled ? "Enabled" : "Disabled"}
									</p>
								</div>
							</div>
							<div className="flex items-center">
								<h1 className="font-semibold text-title-h4">{displayName}</h1>
								<Button.Root
									variant="neutral"
									mode="ghost"
									size="xxsmall"
									onClick={handleCopyPrefix}
									className="mt-1"
								>
									<Icon
										name={copied ? "check" : "clipboard-copy"}
										className={`h-5 w-5 ${copied ? "text-green-600" : ""}`}
									/>
								</Button.Root>
							</div>
							{apiKey?.prefix && (
								<p className="mt-2 font-mono text-label-sm text-text-sub-600">
									{displayPrefix}
								</p>
							)}
						</>
					)}
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
					) : apiKey ? (
						<>
							<Button.Root
								variant="neutral"
								size="xsmall"
								onClick={() => {
									// TODO: Implement toggle enable/disable
									toast.info("Toggle enable/disable not yet implemented");
								}}
							>
								<Icon
									name={apiKey.enabled ? "pause" : "play"}
									className="h-4 w-4"
								/>
								{apiKey.enabled ? "Disable" : "Enable"} API key
							</Button.Root>
							<PopoverRoot>
								<PopoverTrigger asChild>
									<Button.Root variant="neutral" mode="stroke" size="xsmall">
										<Icon name="more-vertical" className="h-4 w-4 rotate-90" />
									</Button.Root>
								</PopoverTrigger>
								<PopoverContent align="end" side="bottom" className="p-2">
									<div className="flex flex-col gap-1">
										<Button.Root
											variant="neutral"
											mode="ghost"
											size="small"
											onClick={() =>
												window.open("https://reloop.sh/docs/api-keys", "_blank")
											}
											className="w-full justify-start"
										>
											<Icon name="file-text" className="h-4 w-4" />
											Go to docs
										</Button.Root>
										<Button.Root
											variant="neutral"
											mode="ghost"
											size="small"
											onClick={() => {
												// TODO: Implement rotate
												toast.info("Rotate API key not yet implemented");
											}}
											className="w-full justify-start"
										>
											<Icon name="rotate-cw" className="h-4 w-4" />
											Rotate key
										</Button.Root>
										<Button.Root
											variant="neutral"
											mode="ghost"
											size="small"
											onClick={() => {
												// TODO: Implement edit
												toast.info("Edit API key not yet implemented");
											}}
											className="w-full justify-start"
										>
											<Icon name="edit" className="h-4 w-4" />
											Edit API key
										</Button.Root>
										<Button.Root
											variant="error"
											mode="ghost"
											size="small"
											onClick={() => onDeleteApiKey?.()}
											className="w-full justify-start"
										>
											<Icon name="trash" className="h-4 w-4" />
											Delete API key
										</Button.Root>
									</div>
								</PopoverContent>
							</PopoverRoot>
						</>
					) : null}
				</div>
			</div>

			{isLoading ? (
				<div className="mt-8 mb-3 flex w-full items-center justify-between border-stroke-soft-200 border-b border-dashed pb-8">
					<div className="flex gap-8">
						<div className="">
							<div className="flex items-center gap-1.5">
								<Icon name="key" className="h-4 w-4 text-blue-600" />
								<span className="font-medium text-sm text-text-sub-600">
									Total Requests
								</span>
							</div>
							<Skeleton className="h-8 w-12" />
						</div>
						<div className="">
							<div className="flex items-center gap-1.5">
								<Icon name="activity-2" className="h-4 w-4 text-success-base" />
								<span className="font-medium text-sm text-text-sub-600">
									Remaining
								</span>
							</div>
							<Skeleton className="h-8 w-12" />
						</div>
						<div className="">
							<div className="flex items-center gap-1.5">
								<Icon name="clock" className="h-4 w-4 text-text-sub-600" />
								<span className="font-medium text-sm text-text-sub-600">
									Last Request
								</span>
							</div>
							<Skeleton className="h-8 w-16" />
						</div>
					</div>
				</div>
			) : (
				<div className="mt-8 mb-3 flex w-full items-center justify-between border-stroke-soft-200 border-b border-dashed pb-8">
					<div className="flex gap-8">
						<div className="">
							<div className="flex items-center gap-1.5">
								<Icon name="key" className="h-4 w-4 text-blue-600" />
								<span className="font-medium text-sm text-text-sub-600">
									Total Requests
								</span>
							</div>
							<span className="font-bold text-2xl text-text-strong-950">
								{apiKey?.requestCount || 0}
							</span>
						</div>
						<div className="">
							<div className="flex items-center gap-1.5">
								<Icon name="activity-2" className="h-4 w-4 text-success-base" />
								<span className="font-medium text-sm text-text-sub-600">
									Remaining
								</span>
							</div>
							<span className="text-left font-bold text-2xl text-text-strong-950">
								{apiKey?.remaining !== null && apiKey?.remaining !== undefined
									? apiKey.remaining
									: "∞"}
							</span>
						</div>
						<div className="">
							<div className="flex items-center gap-1.5">
								<Icon name="clock" className="h-4 w-4 text-text-sub-600" />
								<span className="font-medium text-sm text-text-sub-600">
									Last Request
								</span>
							</div>
							<span className="font-bold text-2xl text-text-strong-950">
								{apiKey?.lastRequest
									? formatRelativeTime(apiKey.lastRequest)
									: "Never"}
							</span>
						</div>
					</div>
					{apiKey?.rateLimitEnabled && (
						<div className="flex flex-col gap-2">
							<div className="flex items-center gap-1.5">
								<Icon name="gauge" className="h-4 w-4 text-text-sub-600" />
								<span className="font-medium text-sm text-text-sub-600">
									Rate Limit
								</span>
							</div>
							<div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50 py-0.5 pr-0.5 pl-2">
								<span className="w-42 font-medium text-xs">
									{apiKey.rateLimitMax} /{" "}
									{Math.round(apiKey.rateLimitTimeWindow / 1000)}s
								</span>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};
