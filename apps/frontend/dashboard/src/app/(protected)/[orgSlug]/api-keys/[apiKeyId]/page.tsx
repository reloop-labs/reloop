"use client";
import { SomethingWentWrong } from "@fe/dashboard/components/something-went-wrong";
import { useParams } from "next/navigation";
import useSWR from "swr";
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

	const {
		data: apiKeyData,
		error,
		isLoading,
	} = useSWR<ApiKeyData>(apiKeyId ? `/api/api-key/v1/${apiKeyId}` : null, {
		revalidateOnFocus: false,
		revalidateOnReconnect: true,
	});

	if (error) {
		return (
			<div className="mx-auto max-w-3xl">
				<SomethingWentWrong />
			</div>
		);
	}

	if (!apiKeyData && !isLoading) {
		return (
			<div className="mx-auto max-w-3xl">
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

	return (
		<div className="mx-auto max-w-3xl">
			<ApiKeyHeader
				apiKey={apiKeyData}
				isLoading={isLoading}
				isFailed={!!error}
				onDeleteApiKey={() => {}}
			/>
		</div>
	);
};

export default ApiKeyDetailPage;
