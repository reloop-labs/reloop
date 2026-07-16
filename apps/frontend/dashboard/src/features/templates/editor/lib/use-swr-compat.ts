/**
 * Minimal SWR-shaped wrapper over React Query for the template editor port.
 * Supports `mutate()`, `isLoading`, and key-based fetching used throughout
 * the Next template editor components.
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";

type MutatorCallback<T> = (
	current?: T,
) => T | undefined | Promise<T | undefined>;

async function defaultFetcher<T>(url: string): Promise<T> {
	const res = await fetch(url, { credentials: "include" });
	if (!res.ok) {
		throw new Error(`Request failed (${res.status}): ${url}`);
	}
	return res.json() as Promise<T>;
}

export function useSWR<T = unknown>(
	key: string | null | undefined,
	fetcher?: ((url: string) => Promise<T>) | null,
	_options?: Record<string, unknown>,
) {
	const queryClient = useQueryClient();
	const queryKey = ["template-editor", key ?? ""] as const;

	const query = useQuery({
		queryKey,
		queryFn: () => {
			const url = key as string;
			if (typeof fetcher === "function") {
				return fetcher(url);
			}
			return defaultFetcher<T>(url);
		},
		enabled: !!key,
	});

	const mutate = async (
		data?: T | MutatorCallback<T>,
		opts?: boolean | { revalidate?: boolean },
	) => {
		const revalidate =
			typeof opts === "boolean" ? opts : (opts?.revalidate ?? true);

		if (typeof data === "function") {
			const current = queryClient.getQueryData<T>(queryKey);
			const next = await (data as MutatorCallback<T>)(current);
			if (next !== undefined) {
				queryClient.setQueryData(queryKey, next);
			}
		} else if (data !== undefined) {
			queryClient.setQueryData(queryKey, data);
		}

		if (revalidate && key) {
			await queryClient.invalidateQueries({ queryKey });
		}
	};

	return {
		data: query.data,
		error: query.error,
		isLoading: query.isPending,
		isValidating: query.isFetching,
		mutate,
	};
}
