export function isActive(
	url: string,
	pathname: string,
	nested = true,
): boolean {
	let tempUrl = url;
	let tempPathname = pathname;

	// Strip /docs prefix if present for comparison
	if (tempPathname.startsWith("/docs"))
		tempPathname = tempPathname.slice(5) || "/";
	if (tempUrl.startsWith("/docs")) tempUrl = tempUrl.slice(5) || "/";

	if (tempUrl.endsWith("/") && tempUrl !== "/") tempUrl = tempUrl.slice(0, -1);
	if (tempPathname.endsWith("/") && tempPathname !== "/")
		tempPathname = tempPathname.slice(0, -1);

	return (
		tempUrl === tempPathname ||
		(nested && tempPathname.startsWith(`${tempUrl}/`))
	);
}
