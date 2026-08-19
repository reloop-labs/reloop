import { usePathname } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useUIStore } from "#/store/use-ui-store";

const STORAGE_KEY = "isSidebarCollapsed";

/**
 * Shared sidebar collapse state (Zustand).
 * In the template editor, it manages `isEditorSidebarPinned` independently so
 * navigating into and out of the editor never corrupts the user's dashboard sidebar preference.
 */
export function useSidebarCollapse() {
	const pathname = usePathname();
	const isTemplateEditor =
		Boolean(pathname.match(/\/templates\/[^/]+/)) &&
		!pathname.includes("/templates/new");

	const isDashboardCollapsed = useUIStore((s) => s.isSidebarCollapsed);
	const setDashboardCollapsed = useUIStore((s) => s.setIsSidebarCollapsed);
	const toggleDashboardCollapse = useUIStore((s) => s.toggleSidebarCollapse);

	const isEditorPinned = useUIStore((s) => s.isEditorSidebarPinned);
	const setIsEditorPinned = useUIStore((s) => s.setIsEditorSidebarPinned);
	const toggleEditorPinned = useUIStore((s) => s.toggleEditorSidebarPinned);

	useEffect(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved !== null) {
				setDashboardCollapsed(saved === "true");
			}
		} catch {
			// ignore
		}
	}, [setDashboardCollapsed]);

	const isCollapsed = isTemplateEditor ? !isEditorPinned : isDashboardCollapsed;

	const toggle = useCallback(() => {
		if (isTemplateEditor) {
			toggleEditorPinned();
		} else {
			toggleDashboardCollapse();
		}
	}, [isTemplateEditor, toggleEditorPinned, toggleDashboardCollapse]);

	const setCollapsed = useCallback(
		(value: boolean) => {
			if (isTemplateEditor) {
				setIsEditorPinned(!value);
			} else {
				setDashboardCollapsed(value);
			}
		},
		[isTemplateEditor, setIsEditorPinned, setDashboardCollapsed],
	);

	return {
		isCollapsed,
		setCollapsed,
		toggle,
	};
}
