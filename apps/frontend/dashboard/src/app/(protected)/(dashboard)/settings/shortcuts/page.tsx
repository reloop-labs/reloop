import type { Metadata } from "next";
import { ShortcutsPage } from "#/features/settings/shortcuts/shortcuts-page";

export const metadata: Metadata = {
	title: "Shortcuts — Reloop",
	description: "Keyboard shortcuts and navigation hotkeys for Reloop dashboard.",
};

export default function Page() {
	return <ShortcutsPage />;
}
