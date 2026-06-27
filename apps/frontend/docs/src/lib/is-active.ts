export function normalizeDocsPathname(
	pathname: string | null | undefined,
): string {
	let normalized = pathname || "";

	if (normalized.startsWith("/docs")) {
		normalized = normalized.slice(5) || "/";
	}

	if (normalized.endsWith("/") && normalized !== "/") {
		normalized = normalized.slice(0, -1);
	}

	return normalized;
}

export function isActive(
	url: string,
	pathname: string | null | undefined,
	nested = true,
): boolean {
	let tempUrl = url || "";
	let tempPathname = normalizeDocsPathname(pathname);

	if (tempUrl.startsWith("/docs")) tempUrl = tempUrl.slice(5) || "/";

	if (tempUrl.endsWith("/") && tempUrl !== "/") tempUrl = tempUrl.slice(0, -1);
	if (tempPathname.endsWith("/") && tempPathname !== "/")
		tempPathname = tempPathname.slice(0, -1);

	return (
		tempUrl === tempPathname ||
		(nested && tempPathname.startsWith(`${tempUrl}/`))
	);
}
