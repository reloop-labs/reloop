"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";

interface WorkflowNodePaletteProps {
	onAddSendEmail: () => void;
}

export const WorkflowNodePalette = ({
	onAddSendEmail,
}: WorkflowNodePaletteProps) => {
	return (
		<div className="absolute top-4 left-4 z-10 flex flex-col gap-2 rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-2 shadow-regular-sm dark:border-stroke-soft-100/50 dark:bg-bg-white-0/95">
			<p className="px-2 font-semibold text-[10px] text-text-sub-600 uppercase tracking-wider">
				Add step
			</p>
			<Button.Root
				variant="neutral"
				mode="stroke"
				size="xsmall"
				className="justify-start gap-2"
				onClick={onAddSendEmail}
			>
				<Icon name="mail-single" className="h-4 w-4" />
				Send email
			</Button.Root>
		</div>
	);
};
