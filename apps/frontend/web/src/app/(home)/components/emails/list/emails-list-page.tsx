"use client";

import type { RefObject } from "react";
import type { EmailItem } from "../_shared/data";
import { AnimateIn } from "../_shared/animate-in";
import { EmailsListHeader } from "./header";
import { EmailsListTabs } from "./tabs";
import { EmailsListToolbar } from "./toolbar";
import { EmailsListTable } from "./table";

export function EmailsListPage({
	emails,
	mounted,
	highlightedId,
	onRowClick,
	targetRowRef,
	targetEmailId,
	isRowPressed,
}: {
	emails: EmailItem[];
	mounted: boolean;
	highlightedId?: string | null;
	onRowClick?: (email: EmailItem) => void;
	targetRowRef?: RefObject<HTMLDivElement | null>;
	targetEmailId?: string | null;
	isRowPressed?: boolean;
}) {
	return (
		<div className="mx-auto max-w-6xl space-y-6 overflow-hidden p-6 lg:p-8">
			<EmailsListHeader mounted={mounted} />
			<EmailsListTabs mounted={mounted} />

			<div className="mt-4 pb-8">
				<div className="space-y-4">
					<EmailsListToolbar mounted={mounted} />

					<AnimateIn mounted={mounted} delay={0.2} y={10}>
						<EmailsListTable
							emails={emails}
							mounted={mounted}
							highlightedId={highlightedId}
							onRowClick={onRowClick}
							targetRowRef={targetRowRef}
							targetEmailId={targetEmailId}
							isRowPressed={isRowPressed}
						/>
					</AnimateIn>
				</div>
			</div>
		</div>
	);
}
