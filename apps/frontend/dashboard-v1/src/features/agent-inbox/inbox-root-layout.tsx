import { cn } from "@reloop/ui/cn";
import { Provider as JotaiProvider } from "jotai";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { AgentInboxProvider } from "./components/agent-inbox-provider";
import { InboxHotkeysProvider } from "./components/inbox-hotkeys-provider";
import { InboxSidebarProvider } from "./components/inbox-sidebar-context";
import "./inbox.css";

export default function AgentInboxSectionLayout({
	children,
}: {
	children: ReactNode;
}) {
	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const isDark = mounted ? resolvedTheme === "dark" : true;

	return (
		<div
			className={cn("inbox-zero-theme fixed inset-0 z-40", isDark && "dark")}
		>
			<AgentInboxProvider>
				<JotaiProvider>
					<InboxSidebarProvider>
						<InboxHotkeysProvider>{children}</InboxHotkeysProvider>
					</InboxSidebarProvider>
				</JotaiProvider>
			</AgentInboxProvider>
		</div>
	);
}
