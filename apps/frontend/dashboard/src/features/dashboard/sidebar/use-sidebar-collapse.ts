import { usePathname } from "next/navigation";
import { useCallback } from "react";
import { useUIStore } from "#/store/use-ui-store";

/** Full-viewport canvas editors: templates, campaign edit, automation builder. */
export function isCanvasEditorPath(pathname: string): boolean {
	return (
		/\/templates\/[^/]+/.test(pathname) ||
		/\/campaigns\/[^/]+\/edit/.test(pathname) ||
		/\/automation\/(?!(?:triggers|events)(?:\/|$))[^/]+/.test(pathname)
	);
}

/**
 * Shared sidebar collapse state (Zustand).
 * In canvas editors, it manages `isEditorSidebarPinned` independently so
 * navigating into and out of the editor never corrupts the user's dashboard sidebar preference.
 */
export function useSidebarCollapse() {
	const pathname = usePathname();
	const isTemplateEditor = isCanvasEditorPath(pathname);

	const isDashboardCollapsed = useUIStore((s) => s.isSidebarCollapsed);
	const setDashboardCollapsed = useUIStore((s) => s.setIsSidebarCollapsed);
	const toggleDashboardCollapse = useUIStore((s) => s.toggleSidebarCollapse);

	const isEditorPinned = useUIStore((s) => s.isEditorSidebarPinned);
	const setIsEditorPinned = useUIStore((s) => s.setIsEditorSidebarPinned);
	const toggleEditorPinned = useUIStore((s) => s.toggleEditorSidebarPinned);

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
