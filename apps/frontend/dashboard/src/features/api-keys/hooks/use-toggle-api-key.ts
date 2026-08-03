import axios from "axios";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import type { ApiKeyData } from "../types";
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
				await invalidate();
				setTogglingId(null);
			} catch (error) {
				setTogglingId(null);
				const message = axios.isAxiosError(error)
					? error.response?.data?.message || "Failed to toggle API key"
					: "Failed to toggle API key";
				toast.error(message);
				throw error;
			}
		},
		[invalidate],
	);

	return { togglingId, toggleEnabled };
}
