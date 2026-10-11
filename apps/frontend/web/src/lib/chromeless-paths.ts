/** Full-screen tool routes that bring their own chrome. */
export function isChromelessPath(pathname: string | null): boolean {
	if (!pathname) return false;
	return (
		pathname === "/twitter" ||
		pathname.startsWith("/twitter/") ||
		pathname.startsWith("/tools/email-html-editor/")
	);
}
