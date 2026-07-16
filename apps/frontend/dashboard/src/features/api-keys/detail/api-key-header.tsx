import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import { AnimatedBackButton } from "#/features/dashboard/animated-back-button";
import { useInvalidateApiKeys } from "../hooks/use-api-keys-query";
import type { ApiKeyDetail } from "../types";
import {
	ApiKeyHeaderMenu,
	type HeaderMenuAction,
} from "./api-key-header-menu";
import { ApiKeyMetaGrid } from "./api-key-meta-grid";

export function ApiKeyHeader({
	apiKey,
	isLoading,
	isFailed,
	onDeleteApiKey,
}: {
	apiKey: ApiKeyDetail | undefined;
	isLoading: boolean;
	isFailed?: boolean;
	onDeleteApiKey?: () => void;
}) {
	const navigate = useNavigate();
	const invalidate = useInvalidateApiKeys();
	const [, setRotateId] = useQueryState("rotate");
	const [, setEditId] = useQueryState("edit");
	const [isToggling, setIsToggling] = useState(false);

	const handleToggleEnabled = async () => {
		if (!apiKey) return;
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

	const handleMenuAction = (id: HeaderMenuAction) => {
		if (id === "docs") {
			window.open("https://reloop.sh/docs/learn/api-keys", "_blank");
		} else if (id === "rotate" && apiKey?.id) {
			void setRotateId(apiKey.id);
		} else if (id === "edit" && apiKey?.id) {
			void setEditId(apiKey.id);
		} else if (id === "delete") {
			onDeleteApiKey?.();
		}
	};

	if (!apiKey && !isLoading) {
		return (
			<div className="pt-10 pb-2">
				<AnimatedBackButton
					onClick={() => void navigate({ to: "/api-keys" })}
				/>
				<div className="flex items-center justify-between pt-6">
					<h1 className="font-medium text-title-h6 leading-8">
						API key not found
					</h1>
				</div>
			</div>
		);
	}

	const displayName =
		apiKey?.name || apiKey?.start || apiKey?.prefix || "Unnamed";

	return (
		<div className="pt-10 pb-2">
			<AnimatedBackButton onClick={() => void navigate({ to: "/api-keys" })} />
			<div className="flex items-center justify-between pt-6">
				<div>
					{isLoading ? (
						<Skeleton className="mt-2 h-7 w-48 rounded-lg" />
					) : (
						<div className="flex items-center gap-1.5">
							<div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] bg-gradient-to-br from-neutral-600 to-neutral-500 font-semibold text-white text-xs uppercase tracking-wide shadow-sm">
								<Icon name="key-new" className="h-3 w-3" />
							</div>
							<h1 className="font-medium text-title-h6 leading-8">
								{displayName}
							</h1>
						</div>
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
								className="font-semibold"
								onClick={() => void handleToggleEnabled()}
								disabled={isToggling}
							>
								{isToggling ? (
									<Icon name="loader-2" className="h-4 w-4 animate-spin" />
								) : (
									<Icon
										name={apiKey.enabled ? "pause" : "play"}
										className="h-4 w-4"
									/>
								)}
								{apiKey.enabled ? "Disable" : "Enable"} API key
							</Button.Root>
							<ApiKeyHeaderMenu onAction={handleMenuAction} />
						</>
					) : null}
				</div>
			</div>

			<ApiKeyMetaGrid apiKey={apiKey} isLoading={isLoading} />
		</div>
	);
}
