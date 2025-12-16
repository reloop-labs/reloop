"use client";
import { SomethingWentWrong } from "@fe/dashboard/components/something-went-wrong";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { useParams, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import useSWR from "swr";
import { DeleteApiKeyModal } from "../components/delete-api-key-modal";
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
			router.push(`/${activeOrganization.slug}/api-keys`);
		}
	};

	if (error) {
		return (
			<div className="mx-auto max-w-3xl sm:px-8">
				<SomethingWentWrong />
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
			<div className="mx-auto max-w-3xl sm:px-8">
				<ApiKeyHeader
					apiKey={apiKeyData}
					isLoading={isLoading}
					isFailed={!!error}
					onDeleteApiKey={handleDeleteApiKey}
				/>
			</div>
			<DeleteApiKeyModal apiKeys={apiKeysForModal} onDeleteSuccess={handleDeleteSuccess} />
		</>
	);
};

export default ApiKeyDetailPage;
