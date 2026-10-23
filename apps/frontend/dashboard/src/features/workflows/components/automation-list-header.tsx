"use client";

import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { useHotkeys } from "react-hotkeys-hook";
import {
	ActionKbd,
	actionKbdOnSolidClassName,
} from "#/features/dashboard/keyboard-shortcuts-reveal";

const DOCS_URL = "https://reloop.sh/docs/learn/workflows";

export function AutomationListHeader({
	onCreate,
	createLabel = "Create automation",
	title = "Automation",
	icon = "workflow",
}: {
	onCreate: () => void;
	createLabel?: string;
	title?: string;
	icon?: string;
}) {
	const openDocs = () => window.open(DOCS_URL, "_blank");

	useHotkeys(
		"d",
		(e) => {
			e.preventDefault();
			openDocs();
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	return (
		<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-2 pb-4 sm:flex-nowrap sm:items-start">
			<div>
				<div className="flex items-center gap-2.5">
					<Icon name={icon} className="h-6 w-6 shrink-0 text-text-strong-950" />
					<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						{title}
					</h1>
				</div>
			</div>

			<div className="ml-auto flex shrink-0 items-center gap-2">
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={openDocs}
					className="gap-1.5 rounded-xl max-sm:hidden"
					aria-keyshortcuts="d"
				>
					Documentation
					<ActionKbd>D</ActionKbd>
				</Button.Root>
				<FancyButton.Root
					type="button"
					variant="neutral"
					size="small"
					onClick={onCreate}
					className="gap-1.5 rounded-xl"
					aria-keyshortcuts="c"
				>
					<Icon name="plus" className="h-4 w-4" />
					{createLabel}
					<ActionKbd className={actionKbdOnSolidClassName}>C</ActionKbd>
				</FancyButton.Root>
			</div>
		</div>
	);
}
