export type AppPathParams = Record<string, string | number>;
export type AppSearch = Record<string, unknown>;
export type AppSearchUpdater =
	| AppSearch
	| ((previousSearch: AppSearch) => AppSearch);

export type AppLocationOptions = {
	to: string;
	params?: AppPathParams;
	search?: AppSearchUpdater;
};

type BuildAppHrefContext = {
	currentPathname?: string;
	currentSearch?: string;
};

const DASHBOARD_BASE_PATH = "/dashboard";
const PATH_PARAM_PATTERN = /\$([A-Za-z0-9_]+)/g;
const EXTERNAL_HREF_PATTERN = /^[A-Za-z][A-Za-z\d+.-]*:|^\/\//;
const HOST_ROOT_PATH_PATTERN =
	/^\/(?:api(?:\/|$)|downloads?(?:\/|$)|privacy(?:\/|$)|terms(?:[-/]|$))/;

/**
 * These destinations belong to the host rather than the dashboard app. They
 * must bypass Next's automatic `/dashboard` basePath handling.
 */
export function requiresDocumentNavigation(href: string): boolean {
	if (EXTERNAL_HREF_PATTERN.test(href) || href.startsWith("#")) {
		return true;
	}

	const pathname = href.split(/[?#]/, 1)[0] ?? "";
	return HOST_ROOT_PATH_PATTERN.test(pathname);
}

/**
 * Next applies `basePath` to Link and router destinations. Feature code works
 * with app-relative paths, so pathname comparisons use that same shape.
 */
export function normalizeAppPathname(pathname: string): string {
	if (pathname === DASHBOARD_BASE_PATH) {
		return "/";
	}

	if (pathname.startsWith(`${DASHBOARD_BASE_PATH}/`)) {
		return pathname.slice(DASHBOARD_BASE_PATH.length) || "/";
	}

	return pathname || "/";
}

export function parseAppSearch(search: string): AppSearch {
	const parsed: AppSearch = {};
	const searchParams = new URLSearchParams(
		search.startsWith("?") ? search.slice(1) : search,
	);

	for (const [key, value] of searchParams) {
		parsed[key] = value;
	}

	return parsed;
}

function serializeSearchValue(value: unknown): string | undefined {
	if (value === undefined) {
		return undefined;
	}

	if (typeof value === "string") {
		return value;
	}

	if (
		typeof value === "number" ||
		typeof value === "boolean" ||
		value === null
	) {
		return String(value);
	}

	return JSON.stringify(value);
}

export function serializeAppSearch(search: AppSearch): string {
	const searchParams = new URLSearchParams();

	for (const [key, value] of Object.entries(search)) {
		const serialized = serializeSearchValue(value);
		if (serialized !== undefined) {
			searchParams.set(key, serialized);
		}
	}

	return searchParams.toString();
}

function interpolatePath(pathname: string, params?: AppPathParams): string {
	return pathname.replace(PATH_PARAM_PATTERN, (_, key: string) => {
		const value = params?.[key];
		if (value === undefined) {
			throw new Error(`Missing route parameter "${key}" for "${pathname}"`);
		}

		return encodeURIComponent(String(value));
	});
}

function getParentPath(pathname: string): string {
	const normalized = normalizeAppPathname(pathname).replace(/\/+$/, "") || "/";
	if (normalized === "/") {
		return "/";
	}

	const segments = normalized.split("/").filter(Boolean);
	return segments.length <= 1 ? "/" : `/${segments.slice(0, -1).join("/")}`;
}

export function buildAppHref(
	{ to, params, search }: AppLocationOptions,
	context: BuildAppHrefContext = {},
): string {
	const hashIndex = to.indexOf("#");
	const hash = hashIndex === -1 ? "" : to.slice(hashIndex);
	const pathAndSearch = hashIndex === -1 ? to : to.slice(0, hashIndex);
	const queryIndex = pathAndSearch.indexOf("?");
	const rawPathname =
		queryIndex === -1 ? pathAndSearch : pathAndSearch.slice(0, queryIndex);
	const embeddedSearch =
		queryIndex === -1 ? "" : pathAndSearch.slice(queryIndex + 1);

	const pathname =
		rawPathname === ".."
			? getParentPath(context.currentPathname ?? "/")
			: interpolatePath(rawPathname, params);

	if (search === undefined) {
		return `${pathname}${embeddedSearch ? `?${embeddedSearch}` : ""}${hash}`;
	}

	const nextSearch =
		typeof search === "function"
			? search(parseAppSearch(context.currentSearch ?? ""))
			: search;
	const serializedSearch = serializeAppSearch(nextSearch);

	return `${pathname}${serializedSearch ? `?${serializedSearch}` : ""}${hash}`;
}
