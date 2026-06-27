import { usePathname, useSearchParams } from "next/navigation";

/**
 * Hook to generate navigation paths containing the goBackTo parameter
 * using the Next.js router state so that back button navigations
 * return to the correct previous page.
 */
export const useGetBackToUrl = () => {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	return (targetPath: string) => {
		const currentPath =
			pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
		const parts = targetPath.split("#");
		const pathWithoutHash = parts[0] ?? "";
		const hash = parts[1];
		const separator = pathWithoutHash.includes("?") ? "&" : "?";
		const newPath = `${pathWithoutHash}${separator}goBackTo=${encodeURIComponent(currentPath)}`;
		return hash ? `${newPath}#${hash}` : newPath;
	};
};
