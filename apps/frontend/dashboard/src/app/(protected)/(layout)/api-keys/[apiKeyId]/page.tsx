"use client";
import { LogList } from "@fe/dashboard/app/(protected)/(layout)/logs/components/log-list";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { useParams, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import useSWR from "swr";
import { DeleteApiKeyModal } from "../components/delete-api-key-modal";
import { EditApiKeyModal } from "../components/edit-api-key-modal";
import { RotateApiKeyModal } from "../components/rotate-api-key-modal";
import { ApiKeyHeader } from "./components/api-key-header";

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

const ApiKeyDetailPage = () => {
	const { apiKeyId } = useParams();
	const router = useRouter();
	const { activeOrganization } = useUserOrganization();
	const [, setDeleteId] = useQueryState("delete");

	const {
		data: apiKeyData,
		error,
		isLoading,
	} = useSWR<ApiKeyData>(apiKeyId ? `/api/api-key/v1/${apiKeyId}` : null, {
		revalidateOnFocus: false,
		revalidateOnReconnect: true,
	});

	const handleDeleteApiKey = () => {
		if (apiKeyData?.id) {
			setDeleteId(apiKeyData.id);
		}
	};

	const handleDeleteSuccess = () => {
		// Navigate back to API keys list after successful deletion
		if (activeOrganization?.slug) {
			router.push("/api-keys");
		}
	};

	const id = typeof apiKeyId === "string" ? apiKeyId : undefined;

	if (error) {
		return (
			<div className="mx-auto mt-10 max-w-5xl px-6 sm:px-8 pb-12">
				<LogList actorId={id} hideDocs />
			</div>
		);
	}

	if (!apiKeyData && !isLoading) {
		return (
			<div className="mx-auto max-w-3xl sm:px-8">
				<div className="py-12 text-center">
					<h2 className="mb-2 font-semibold text-2xl text-gray-900">
						API key not found
					</h2>
					<p className="text-gray-500">
						The API key you're looking for doesn't exist or has been deleted.
					</p>
				</div>
			</div>
		);
	}

	// Create the ApiKeyData array format expected by DeleteApiKeyModal
	const apiKeysForModal = apiKeyData
		? [
				{
					id: apiKeyData.id,
					name: apiKeyData.name,
					start: apiKeyData.start,
					prefix: apiKeyData.prefix,
					enabled: apiKeyData.enabled,
					requestCount: apiKeyData.requestCount,
					remaining: apiKeyData.remaining,
					expiresAt: apiKeyData.expiresAt,
					createdAt: apiKeyData.createdAt,
				},
			]
		: [];

	return (
		<>
			<div className="mx-auto max-w-5xl px-6 pb-6 sm:px-8">
				<ApiKeyHeader
					apiKey={apiKeyData}
					isLoading={isLoading}
					isFailed={!!error}
					onDeleteApiKey={handleDeleteApiKey}
				/>
				<LogList actorId={id} hideDocs />
			</div>

			<DeleteApiKeyModal
				apiKeys={apiKeysForModal}
				onDeleteSuccess={handleDeleteSuccess}
			/>
			<RotateApiKeyModal apiKeys={apiKeysForModal} />
			<EditApiKeyModal apiKeys={apiKeysForModal} />
		</>
	);
};

export default ApiKeyDetailPage;
