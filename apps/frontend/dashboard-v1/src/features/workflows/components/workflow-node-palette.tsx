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
		<div className="absolute top-4 left-4 z-10 flex flex-col gap-2 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-2 shadow-regular-sm dark:border-stroke-soft-100/60 dark:bg-bg-white-0/95">
			<p className="px-1.5 font-mono text-[10px] text-text-soft-400 uppercase tracking-[0.12em]">
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
