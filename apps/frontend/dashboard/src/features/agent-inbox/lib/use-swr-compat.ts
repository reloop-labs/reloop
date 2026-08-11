import {
	keepPreviousData,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { apiFetch } from "#/features/agent-inbox/lib/api-fetch";

/**
 * Minimal SWR-shaped wrapper over React Query for the agent-inbox port.
 * Supports `mutate()`, `isLoading`, and key-based fetching used throughout
 * the Next inbox components.
 */

type MutatorCallback<T> = (
	current?: T,
) => T | undefined | Promise<T | undefined>;

async function defaultFetcher<T>(url: string): Promise<T> {
	const res = await apiFetch(url);
	if (!res.ok) {
		throw new Error(`Request failed (${res.status}): ${url}`);
	}
	return res.json() as Promise<T>;
}

type SwrOptions = {
	revalidateOnFocus?: boolean;
	keepPreviousData?: boolean;
	[key: string]: unknown;
};

function isFetcher<T>(value: unknown): value is (url: string) => Promise<T> {
	return typeof value === "function";
}

export function useSWR<T = unknown>(
	key: string | null | undefined,
	fetcherOrOptions?: ((url: string) => Promise<T>) | null | SwrOptions,
	maybeOptions?: SwrOptions,
) {
	const queryClient = useQueryClient();
	const queryKey = ["agent-inbox", key ?? ""] as const;

	const fetcher = isFetcher<T>(fetcherOrOptions) ? fetcherOrOptions : null;
	const options: SwrOptions | undefined = isFetcher<T>(fetcherOrOptions)
		? maybeOptions
		: (fetcherOrOptions ?? maybeOptions ?? undefined);

	const query = useQuery<T>({
		queryKey,
		queryFn: () => {
			const url = key as string;
			if (fetcher) {
				return fetcher(url);
			}
			return defaultFetcher<T>(url);
		},
		enabled: !!key,
		refetchOnWindowFocus: options?.revalidateOnFocus ?? true,
		placeholderData: options?.keepPreviousData ? keepPreviousData : undefined,
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
