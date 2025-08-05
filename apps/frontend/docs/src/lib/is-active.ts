export function isActive(
	url: string,
	pathname: string,
	nested = true,
): boolean {
	let tempUrl = url;
	let tempPathname = pathname;
	if (tempUrl.endsWith("/")) tempUrl = tempUrl.slice(0, -1);
	if (tempPathname.endsWith("/")) tempPathname = tempPathname.slice(0, -1);
	return (
		tempUrl === tempPathname || (nested && tempPathname.startsWith(`${url}/`))
	);
}
