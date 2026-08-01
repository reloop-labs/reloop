"use client";

import { ApiKeysApiDetails } from "#/components/api-details/api-keys";
import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { useQueryState } from "nuqs";
import { useHotkeys } from "react-hotkeys-hook";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

const DOCS_URL = "https://reloop.sh/docs/learn/api-keys";

export function ApiKeyListHeader() {
	const [, setModal] = useQueryState("modal");

	const openCreateModal = () => void setModal("create-api-key");
	const openDocs = () => window.open(DOCS_URL, "_blank");

	// A — Browse samples (wired inside ApiKeysApiDetails / ApiDetailsDrawer)
	// D — Documentation
	// C — Create API key
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
		<div className="flex flex-col gap-4 pt-2 pb-4 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<div className="flex items-center gap-2.5">
					<Icon
						name="key-new"
						className="h-6 w-6 shrink-0 text-text-strong-950"
					/>
					<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						API Keys
					</h1>
				</div>
				<p className="mt-1 text-sm text-text-sub-600">
					Create keys to send email from your app over the API or SMTP.
				</p>
			</div>

			<div className="flex shrink-0 items-center gap-2">
				<ApiKeysApiDetails
					renderTrigger={({ open }) => (
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={open}
							className="gap-1.5 rounded-xl"
							aria-keyshortcuts="a"
						>
							<Icon name="code" className="h-4 w-4 text-text-sub-600" />
							Browse samples
							<ActionKbd>A</ActionKbd>
						</Button.Root>
					)}
				/>
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={openDocs}
					className="gap-1.5 rounded-xl"
					aria-keyshortcuts="d"
				>
					Documentation
					<ActionKbd>D</ActionKbd>
				</Button.Root>
				<FancyButton.Root
					type="button"
					variant="blue"
					size="small"
					onClick={openCreateModal}
					className="gap-1.5 rounded-xl"
					aria-keyshortcuts="c"
				>
					<Icon name="plus" className="h-4 w-4" />
					Create API key
					{/* Light keycap so it reads on the blue fill */}
					<ActionKbd className="border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]">
						C
					</ActionKbd>
				</FancyButton.Root>
			</div>
		</div>
	);
}
