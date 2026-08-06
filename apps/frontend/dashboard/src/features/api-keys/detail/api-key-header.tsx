import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import axios from "axios";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { ApiKeyAvatar } from "#/features/api-keys/components/api-key-avatar";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

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
			<div>
				<div className="flex items-center justify-between">
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

	return (
		<div>
			<div className="flex items-center justify-between">
				<div>
					{isLoading ? (
						<div className="flex items-center gap-3">
							<Skeleton className="h-12 w-12 shrink-0 rounded-[14px]" />
							<div className="flex min-w-0 flex-col gap-1.5">
								<Skeleton className="h-4 w-14 rounded-full" />
								<Skeleton className="h-6 w-48 rounded-lg" />
							</div>
						</div>
					) : (
						<div className="flex min-w-0 items-center gap-3">
							<ApiKeyAvatar
								seed={apiKey?.id || displayName}
								size="lg"
								alt={`${displayName} avatar`}
							/>
							<div className="min-w-0">
								<p className="font-medium text-paragraph-xs text-text-sub-600">
									API Key
								</p>
								<h1 className="mb-0.5 truncate font-semibold text-title-h6 leading-5">
									{displayName}
								</h1>
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
								className="gap-1.5 font-semibold"
								onClick={() => void setEditId(apiKey.id)}
							>
								<Icon name="edit" className="h-3.5 w-3.5" />
								<span>Edit</span>
								<ActionKbd className="ml-0.5 w-auto min-w-4 px-1">E</ActionKbd>
							</Button.Root>
							<FancyButton.Root
								variant="blue"
								size="xsmall"
								className="gap-1.5"
								onClick={() => void setRotateId(apiKey.id)}
							>
								<Icon name="rotate-cw" className="h-3.5 w-3.5" />
								<span>Rotate key</span>
								<ActionKbd className="ml-0.5 w-auto min-w-4 border-white/25 bg-white/15 px-1 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]">
									C
								</ActionKbd>
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
