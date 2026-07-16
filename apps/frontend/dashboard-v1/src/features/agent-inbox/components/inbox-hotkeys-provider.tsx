import type { ReactNode } from "react";
import { HotkeysProvider } from "react-hotkeys-hook";

export const InboxHotkeysProvider = ({ children }: { children: ReactNode }) => {
	return (
		<HotkeysProvider initiallyActiveScopes={["inbox-list"]}>
			{children}
		</HotkeysProvider>
	);
};
