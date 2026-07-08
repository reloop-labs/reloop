"use client";

import { PanelLeft } from "lucide-react";

export const InboxSidebarToggle = ({
	onClick,
}: {
	onClick: () => void;
}) => (
	<button
		type="button"
		onClick={onClick}
		className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-mail-muted transition-colors hover:bg-[#202020]"
		aria-label="Toggle sidebar"
	>
		<PanelLeft className="h-4 w-4" />
	</button>
);
