import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";

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
			<div className="mx-auto max-w-5xl px-6 pb-12 sm:px-8">
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

				<section className="mt-8">
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
