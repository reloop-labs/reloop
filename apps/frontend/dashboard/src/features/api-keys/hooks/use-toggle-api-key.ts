import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { queryKeys } from "#/lib/query-keys";
import type { ApiKeyData, ApiKeyListResponse } from "../types";
import {
	type ApiKeysListParams,
	useInvalidateApiKeys,
} from "./use-api-keys-query";

export function useToggleApiKey(listParams: ApiKeysListParams) {
	const invalidate = useInvalidateApiKeys();
	const [togglingId, setTogglingId] = useState<string | null>(null);

	const listParamsRef = useRef(listParams);
	listParamsRef.current = listParams;

	const toggleEnabled = useCallback(
		async (apiKey: ApiKeyData) => {
			try {
				setTogglingId(apiKey.id);
				const endpoint = apiKey.enabled
					? `/api/api-key/v1/disable/${apiKey.id}`
					: `/api/api-key/v1/enable/${apiKey.id}`;
				await axios.post(endpoint, {}, { withCredentials: true });
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
				throw error;
			} finally {
				setTogglingId(null);
				await invalidate();
			}
		},
		[invalidate],
	);

	return { togglingId, toggleEnabled };
}
