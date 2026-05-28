export function isLocal(name: string): boolean {
	if (process.env.NODE_ENV === "production") {
		return false;
	}
	const clean = name.toLowerCase();
	return (
		clean.endsWith(".local") ||
		clean.includes("local.reloop.sh") ||
		clean.includes(".local.") ||
		clean === "local"
	);
}
