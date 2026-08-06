import { Icon } from "@reloop/ui/icon";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useMemo } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import type { CommandAction } from "#/features/dashboard/command-menu";
import { useRegisterCommandActions } from "#/features/dashboard/command-menu-context";

import { useInvalidateApiKeys } from "../hooks/use-api-keys-query";
import { useApiKeyDetailQuery } from "../hooks/use-api-key-detail-query";
import { DeleteApiKeyModal } from "../modals/delete-api-key-modal";
import { EditApiKeyModal } from "../modals/edit-api-key-modal";
import { RotateApiKeyModal } from "../modals/rotate-api-key-modal";
import type { ApiKeyData } from "../types";
import { ActivitySection } from "./activity-section";
import { ApiKeyHeader } from "./api-key-header";
import { ApiKeySummary } from "./api-key-summary";

function toModalKey(apiKey: ApiKeyData | undefined): ApiKeyData[] {
	if (!apiKey) return [];
	return [
		{
			id: apiKey.id,
			name: apiKey.name,
			start: apiKey.start,
			prefix: apiKey.prefix,
			enabled: apiKey.enabled,
			requestCount: apiKey.requestCount,
			remaining: apiKey.remaining,
			expiresAt: apiKey.expiresAt,
			createdAt: apiKey.createdAt,
			lastRequest: apiKey.lastRequest,
			createdBy: apiKey.createdBy,
		},
	];
}

export function ApiKeyDetailPage({ apiKeyId }: { apiKeyId: string }) {
	const router = useRouter();
	const [, setDeleteId] = useQueryState("delete");
	const [, setRotateId] = useQueryState("rotate");
	const [, setEditId] = useQueryState("edit");
	const invalidate = useInvalidateApiKeys();

	const { data, error, isPending, isFetching, refetch } =
		useApiKeyDetailQuery(apiKeyId);

	const isLoading = isPending || (isFetching && !data);
	const apiKeysForModal = toModalKey(data);

	const handleToggleEnabled = async () => {
		if (!data) return;
		try {
			const endpoint = data.enabled
				? `/api/api-key/v1/disable/${data.id}`
				: `/api/api-key/v1/enable/${data.id}`;
			await axios.post(endpoint, {}, { withCredentials: true });
			await invalidate();
		} catch (error) {
			const message = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to toggle API key"
				: "Failed to toggle API key";
			toast.error(message);
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

	useHotkeys(
		"e",
		(e) => {
			if (!data?.id) return;
			e.preventDefault();
			void setEditId(data.id);
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"c",
		(e) => {
			if (!data?.id) return;
			e.preventDefault();
			void setRotateId(data.id);
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"s",
		(e) => {
			e.preventDefault();
			window.dispatchEvent(
				new CustomEvent("api-details:open", {
					detail: { docSection: "api-key" },
				}),
			);
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"d",
		(e) => {
			e.preventDefault();
			window.open("https://reloop.sh/docs/learn/api-keys", "_blank");
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"p",
		(e) => {
			if (!data) return;
			e.preventDefault();
			const prefix = data.start || data.prefix || "";
			if (prefix) void handleCopy(prefix, "API key prefix copied");
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"i",
		(e) => {
			if (!data?.id) return;
			e.preventDefault();
			void handleCopy(data.id, "API key ID copied");
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"t",
		(e) => {
			if (!data) return;
			e.preventDefault();
			void handleToggleEnabled();
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"x",
		(e) => {
			if (!data?.id) return;
			e.preventDefault();
			void setDeleteId(data.id);
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"mod+backspace",
		(e) => {
			e.preventDefault();
			router.push("/api-keys");
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	const actions = useMemo<CommandAction[]>(() => {
		if (!data) return [];
		return [
			{
				id: "back-to-api-keys",
				label: "Back to API Keys",
				icon: "arrow-left",
				shortcut: { label: "⌘⌫", keys: ["mod", "backspace"] },
				onSelect: () => router.push("/api-keys"),
			},
			{
				id: "edit-api-key",
				label: "Edit API Key",
				icon: "edit",
				shortcut: { label: "E", keys: ["e"] },
				onSelect: () => void setEditId(data.id),
			},
			{
				id: "rotate-api-key",
				label: "Rotate Key",
				icon: "rotate-cw",
				shortcut: { label: "C", keys: ["c"] },
				onSelect: () => void setRotateId(data.id),
			},
			{
				id: "open-api-reference",
				label: "Open API Reference",
				icon: "code",
				shortcut: { label: "S", keys: ["s"] },
				onSelect: () =>
					window.dispatchEvent(
						new CustomEvent("api-details:open", {
							detail: { docSection: "api-key" },
						}),
					),
			},
			{
				id: "go-to-docs",
				label: "Go to Docs",
				icon: "file-text",
				shortcut: { label: "D", keys: ["d"] },
				onSelect: () =>
					window.open("https://reloop.sh/docs/learn/api-keys", "_blank"),
			},
			{
				id: "copy-prefix",
				label: "Copy Key Prefix",
				icon: "copy",
				shortcut: { label: "P", keys: ["p"] },
				onSelect: () => {
					const prefix = data.start || data.prefix || "";
					if (prefix) void handleCopy(prefix, "API key prefix copied");
				},
			},
			{
				id: "copy-id",
				label: "Copy Key ID",
				icon: "copy",
				shortcut: { label: "I", keys: ["i"] },
				onSelect: () => void handleCopy(data.id, "API key ID copied"),
			},
			{
				id: "toggle-enabled",
				label: data.enabled ? "Disable API Key" : "Enable API Key",
				icon: data.enabled ? "cross-circle" : "check-circle",
				shortcut: { label: "T", keys: ["t"] },
				onSelect: () => void handleToggleEnabled(),
			},
			{
				id: "delete-api-key",
				label: "Delete API Key",
				icon: "trash",
				shortcut: { label: "X", keys: ["x"] },
				variant: "danger",
				onSelect: () => void setDeleteId(data.id),
			},
		];
	}, [data, setEditId, setRotateId, setDeleteId, invalidate]);

	useRegisterCommandActions(`api-key-detail-${apiKeyId}`, "API Key", actions);

	if (error && !data) {
		return (
			<div className="mx-auto max-w-5xl px-6 pb-12 sm:px-8">
				<div className="flex flex-col items-center justify-center gap-3 py-20">
					<Icon name="alert-circle" className="h-8 w-8 text-error-base" />
					<p className="text-sm text-text-sub-600">Failed to load API key</p>
					<button
						type="button"
						onClick={() => void refetch()}
						className="font-medium text-sm text-text-strong-950 underline-offset-2 hover:underline"
					>
						Try again
					</button>
				</div>
			</div>
		);
	}

	if (!data && !isLoading) {
		return (
			<div className="mx-auto max-w-5xl px-6 pb-12 sm:px-8">
				<div className="py-12 text-center">
					<h2 className="mb-2 font-semibold text-2xl text-text-strong-950">
						API key not found
					</h2>
					<p className="text-text-sub-600">
						The API key you&apos;re looking for doesn&apos;t exist or has been
						deleted.
					</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="mx-auto max-w-5xl space-y-8 px-6 pb-12 sm:px-8 pt-8">
				<ApiKeyHeader
					apiKey={data}
					isLoading={isLoading}
					isFailed={!!error}
					onRetry={() => void refetch()}
					onDeleteApiKey={() => {
						if (data?.id) void setDeleteId(data.id);
					}}
				/>

				<ApiKeySummary apiKey={data} isLoading={isLoading} />

				<section>
					<ActivitySection actorId={data?.id} />
				</section>
			</div>

			<DeleteApiKeyModal
				apiKeys={apiKeysForModal}
				onDeleteSuccess={() => {
					router.push("/api-keys");
				}}
			/>
			<RotateApiKeyModal apiKeys={apiKeysForModal} />
			<EditApiKeyModal apiKeys={apiKeysForModal} />
		</>
	);
}
