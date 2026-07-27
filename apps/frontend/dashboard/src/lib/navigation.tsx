"use client";

import NextLink from "next/link";
import {
	useParams as useNextParams,
	usePathname,
	useRouter,
	useSearchParams,
} from "next/navigation";
import {
	type ComponentPropsWithoutRef,
	forwardRef,
	useCallback,
	useMemo,
} from "react";
import {
	type AppLocationOptions,
	type AppPathParams,
	type AppSearch,
	buildAppHref,
	normalizeAppPathname,
	parseAppSearch,
	requiresDocumentNavigation,
} from "./navigation-url";

export type AppNavigateOptions = AppLocationOptions & {
	replace?: boolean;
};

export type AppLinkProps = Omit<
	ComponentPropsWithoutRef<typeof NextLink>,
	"href"
> &
	Omit<AppLocationOptions, "search"> & {
		search?: AppSearch;
	};

/**
 * Compatibility link for feature code. Next applies `/dashboard` from
 * `next.config.ts`; this component only resolves typed path/search inputs.
 */
export const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(
	function AppLink({ to, params, search, ...props }, ref) {
		const href = buildAppHref({ to, params, search });

		if (requiresDocumentNavigation(href)) {
			const {
				onNavigate: _onNavigate,
				prefetch: _prefetch,
				replace: _replace,
				scroll: _scroll,
				...anchorProps
			} = props;
			return <a {...anchorProps} ref={ref} href={href} />;
		}

		return <NextLink {...props} ref={ref} href={href} />;
	},
);

export const Link = AppLink;

function getCurrentSearch(): string {
	return typeof window === "undefined" ? "" : window.location.search;
}

export function useAppNavigation() {
	const router = useRouter();
	const nextPathname = usePathname();
	const currentPathname = normalizeAppPathname(nextPathname);

	const getHref = useCallback(
		(options: AppLocationOptions) =>
			buildAppHref(options, {
				currentPathname,
				currentSearch: getCurrentSearch(),
			}),
		[currentPathname],
	);

	const push = useCallback(
		(options: AppLocationOptions) => {
			const href = getHref(options);
			if (requiresDocumentNavigation(href)) {
				window.location.assign(href);
				return;
			}
			router.push(href);
		},
		[getHref, router],
	);

	const replace = useCallback(
		(options: AppLocationOptions) => {
			const href = getHref(options);
			if (requiresDocumentNavigation(href)) {
				window.location.replace(href);
				return;
			}
			router.replace(href);
		},
		[getHref, router],
	);

	const navigate = useCallback(
		(options: AppNavigateOptions) => {
			if (options.replace) {
				replace(options);
				return;
			}

			push(options);
		},
		[push, replace],
	);

	const back = useCallback(() => {
		router.back();
	}, [router]);

	return useMemo(
		() => ({
			push,
			replace,
			back,
			navigate,
		}),
		[back, navigate, push, replace],
	);
}

/** TanStack-compatible callable used while feature imports are migrated. */
export function useNavigate() {
	return useAppNavigation().navigate;
}

export function useAppPathname(): string {
	return normalizeAppPathname(usePathname());
}

export function useAppSearch(): AppSearch {
	const searchParams = useSearchParams();
	return useMemo(() => parseAppSearch(searchParams.toString()), [searchParams]);
}

type AppRouterState = {
	location: {
		pathname: string;
		search: AppSearch;
	};
};

/**
 * Prefer this when only the pathname is needed. `useRouterState` also reads
 * search params (via `useSearchParams`), which can suspend under Next.js and
 * blank the tree to the nearest Suspense fallback on hard refresh.
 */
export function useRouterPathname(): string {
	return useAppPathname();
}

export function useRouterState<T>({
	select,
}: {
	select: (state: AppRouterState) => T;
}): T {
	const pathname = useAppPathname();
	const search = useAppSearch();
	return select({ location: { pathname, search } });
}

export function useParams<
	TParams extends Record<string, string | string[] | undefined> = Record<
		string,
		string | string[] | undefined
	>,
>(_options?: { strict?: boolean }): TParams {
	return useNextParams() as TParams;
}

export type { AppLocationOptions, AppPathParams, AppSearch };
