"use client";

import { PanelLeftOpenIcon } from "./zero-icons";

export const InboxSidebarToggle = ({ onClick }: { onClick: () => void }) => (
	<button
		type="button"
		onClick={onClick}
		className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-mail-muted transition-colors hover:bg-[var(--inbox-hover)]"
		aria-label="Toggle sidebar"
	>
		<PanelLeftOpenIcon className="h-[12px] w-[14px]" />
	</button>
);
