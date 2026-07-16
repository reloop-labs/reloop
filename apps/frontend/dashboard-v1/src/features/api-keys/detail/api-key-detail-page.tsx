import { Icon } from "@reloop/ui/icon";
import { useNavigate } from "@tanstack/react-router";
import { useQueryState } from "nuqs";
import { useApiKeyDetailQuery } from "../hooks/use-api-key-detail-query";
import { DeleteApiKeyModal } from "../modals/delete-api-key-modal";
import { EditApiKeyModal } from "../modals/edit-api-key-modal";
import { RotateApiKeyModal } from "../modals/rotate-api-key-modal";
import type { ApiKeyData } from "../types";
import { ActivitySection } from "./activity-section";
import { ApiKeyHeader } from "./api-key-header";

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
	const navigate = useNavigate();
	const [, setDeleteId] = useQueryState("delete");
	const { data, error, isPending, isFetching, refetch } =
		useApiKeyDetailQuery(apiKeyId);

	const isLoading = isPending || (isFetching && !data);
	const apiKeysForModal = toModalKey(data);

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
			<div className="mx-auto max-w-3xl sm:px-8">
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
			<div className="mx-auto max-w-5xl px-6 pb-6 sm:px-8">
				<ApiKeyHeader
					apiKey={data}
					isLoading={isLoading}
					isFailed={!!error}
					onDeleteApiKey={() => {
						if (data?.id) void setDeleteId(data.id);
					}}
				/>
				<ActivitySection actorId={data?.id} />
			</div>

			<DeleteApiKeyModal
				apiKeys={apiKeysForModal}
				onDeleteSuccess={() => {
					void navigate({ to: "/api-keys" });
				}}
			/>
			<RotateApiKeyModal apiKeys={apiKeysForModal} />
			<EditApiKeyModal apiKeys={apiKeysForModal} />
		</>
	);
}
