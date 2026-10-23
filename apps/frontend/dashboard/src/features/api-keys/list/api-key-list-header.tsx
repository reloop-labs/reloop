"use client";

import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { useQueryState } from "nuqs";
import { useHotkeys } from "react-hotkeys-hook";
import { ApiKeysApiDetails } from "#/components/api-details/api-keys";
import {
	ActionKbd,
	actionKbdOnSolidClassName,
} from "#/features/dashboard/keyboard-shortcuts-reveal";

const DOCS_URL = "https://reloop.sh/docs/learn/api-keys";

export function ApiKeyListHeader() {
	const [, setModal] = useQueryState("modal");

	const openCreateModal = () => void setModal("create-api-key");
	const openDocs = () => window.open(DOCS_URL, "_blank");

	// A: Browse samples (wired inside ApiKeysApiDetails / ApiDetailsDrawer)
	// D: Documentation
	// C: Create API key
	useHotkeys(
		"d",
		(e) => {
			e.preventDefault();
			openDocs();
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"c",
		(e) => {
			e.preventDefault();
			openCreateModal();
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	return (
		<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-2 pb-4 sm:flex-nowrap sm:items-start">
			<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
				API Keys
			</h1>

			<div className="ml-auto flex shrink-0 items-center gap-2">
				<ApiKeysApiDetails
					renderTrigger={({ open }) => (
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={open}
							className="gap-1.5 rounded-xl max-sm:hidden"
							aria-keyshortcuts="a"
						>
							<Icon name="code" className="h-4 w-4 text-text-sub-600" />
							SDK
							<ActionKbd>S</ActionKbd>
						</Button.Root>
					)}
				/>
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
					onClick={openCreateModal}
					className="gap-1.5 rounded-xl"
					aria-keyshortcuts="c"
				>
					<Icon name="plus" className="h-4 w-4" />
					Create API key
					{/* Light keycap so it reads on the dark fill */}
					<ActionKbd className={actionKbdOnSolidClassName}>C</ActionKbd>
				</FancyButton.Root>
			</div>
		</div>
	);
}
