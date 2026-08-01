import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { ApiKeyAvatar } from "#/features/api-keys/components/api-key-avatar";
import { AnimatedBackButton } from "#/features/dashboard/animated-back-button";

import { useInvalidateApiKeys } from "../hooks/use-api-keys-query";
import type { ApiKeyDetail } from "../types";
import { ApiKeyHeaderMenu, type HeaderMenuAction } from "./api-key-header-menu";

export function ApiKeyHeader({
	apiKey,
	isLoading,
	isFailed,
	onRetry,
	onDeleteApiKey,
}: {
	apiKey: ApiKeyDetail | undefined;
	isLoading: boolean;
	isFailed?: boolean;
	onRetry?: () => void;
	onDeleteApiKey?: () => void;
}) {
	const router = useRouter();
	const invalidate = useInvalidateApiKeys();
	const [, setRotateId] = useQueryState("rotate");
	const [, setEditId] = useQueryState("edit");
	const [isToggling, setIsToggling] = useState(false);

	const handleToggleEnabled = async () => {
		if (!apiKey || isToggling) return;
		try {
			setIsToggling(true);
			const endpoint = apiKey.enabled
				? `/api/api-key/v1/disable/${apiKey.id}`
				: `/api/api-key/v1/enable/${apiKey.id}`;
			await axios.post(endpoint, {}, { withCredentials: true });
			await invalidate();
			toast.success(
				apiKey.enabled
					? "API key disabled successfully"
					: "API key enabled successfully",
			);
		} catch (error) {
			const message = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to toggle API key"
				: "Failed to toggle API key";
			toast.error(message);
		} finally {
			setIsToggling(false);
		}
	};

	const handleCopy = async (value: string, successMessage: string) => {
		try {
			await navigator.clipboard.writeText(value);
			toast.success(successMessage);
		} catch {
			toast.error("Failed to copy");
		}
	};

	const handleMenuAction = (id: HeaderMenuAction) => {
		if (id === "docs") {
			window.open("https://reloop.sh/docs/learn/api-keys", "_blank");
			return;
		}
		if (id === "rotate" && apiKey?.id) {
			void setRotateId(apiKey.id);
			return;
		}
		if (id === "edit" && apiKey?.id) {
			void setEditId(apiKey.id);
			return;
		}
		if (id === "copy-prefix" && apiKey) {
			const prefix = apiKey.start || apiKey.prefix || "";
			if (prefix) void handleCopy(prefix, "API key prefix copied");
			return;
		}
		if (id === "copy-id" && apiKey?.id) {
			void handleCopy(apiKey.id, "API key ID copied");
			return;
		}
		if (id === "toggle") {
			void handleToggleEnabled();
			return;
		}
		if (id === "delete") {
			onDeleteApiKey?.();
		}
	};

	if (!apiKey && !isLoading) {
		return (
			<div className="pt-10 pb-2">
				<AnimatedBackButton onClick={() => router.push("/api-keys")} />
				<div className="flex items-center justify-between pt-6">
					<div>
						<div className="flex items-center gap-1.5 text-error-base">
							<Icon name="alert-circle" className="h-3.5 w-3.5" />
							<p className="font-medium text-paragraph-xs">Not found</p>
						</div>
						<h1 className="mt-1 font-medium text-title-h6 leading-8">
							API key not found
						</h1>
					</div>
				</div>
			</div>
		);
	}

	const displayName =
		apiKey?.name || apiKey?.start || apiKey?.prefix || "Unnamed";
	const displayPrefix = apiKey?.start || apiKey?.prefix || "—";

	return (
		<div className="pt-10 pb-2">
			<AnimatedBackButton onClick={() => router.push("/api-keys")} />

			<div className="flex items-start justify-between gap-4 pt-6">
				<div className="min-w-0">
					{isLoading ? (
						<div className="flex items-center gap-3">
							<Skeleton className="h-10 w-10 shrink-0 rounded-[12px]" />
							<div className="flex min-w-0 flex-col gap-1.5">
								<div className="flex items-center gap-2">
									<Skeleton className="h-6 w-40 rounded-lg" />
									<Skeleton className="h-5 w-16 rounded-full" />
								</div>
								<Skeleton className="h-4 w-48 rounded-lg" />
							</div>
						</div>
					) : (
						<div className="flex min-w-0 items-center gap-3">
							<ApiKeyAvatar
								seed={apiKey?.id || displayName}
								size="md"
								alt={`${displayName} avatar`}
							/>
							<div className="min-w-0">
								<div className="flex min-w-0 flex-wrap items-center gap-2">
									<h1 className="truncate font-semibold text-text-strong-950 text-title-h6 leading-8 tracking-tight">
										{displayName}
									</h1>
									{apiKey ? (
										<span
											className={cn(
												"inline-flex shrink-0 items-center rounded-full px-2 py-0.5 font-medium text-[11px]",
												apiKey.enabled
													? "bg-success-lighter text-success-base"
													: "bg-error-lighter text-error-base",
											)}
										>
											{apiKey.enabled ? "Active" : "Disabled"}
										</span>
									) : null}
								</div>
								<p className="truncate font-medium font-mono text-[13px] text-text-sub-600 leading-snug">
									{displayPrefix}
									{displayPrefix !== "—" ? "…" : ""}
								</p>
							</div>
						</div>
					)}
				</div>

				<div className="flex shrink-0 items-center gap-2">
					{isLoading ? (
						<>
							<Skeleton className="h-8 w-20 rounded-lg" />
							<Skeleton className="h-8 w-28 rounded-lg" />
							<Skeleton className="h-8 w-8 rounded-lg" />
						</>
					) : isFailed ? (
						<Button.Root
							variant="error"
							size="small"
							mode="lighter"
							onClick={onRetry}
						>
							Try again
						</Button.Root>
					) : apiKey ? (
						<>
							<Button.Root
								variant="neutral"
								mode="stroke"
								size="xsmall"
								className="font-semibold"
								onClick={() => void setEditId(apiKey.id)}
							>
								<Icon name="edit" className="h-3.5 w-3.5" />
								Edit
							</Button.Root>
							<FancyButton.Root
								variant="blue"
								size="xsmall"
								onClick={() => void setRotateId(apiKey.id)}
							>
								<Icon name="rotate-cw" className="h-3.5 w-3.5" />
								Rotate key
							</FancyButton.Root>
							<ApiKeyHeaderMenu
								enabled={apiKey.enabled}
								onAction={handleMenuAction}
							/>
						</>
					) : null}
				</div>
			</div>
		</div>
	);
}
