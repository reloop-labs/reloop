"use client";

import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

const DOCS_URL = "https://reloop.sh/docs/learn/emails";

export function CampaignsListHeader() {
	const router = useRouter();
	const openCreate = () => router.push("/campaigns/create");
	const openDocs = () => window.open(DOCS_URL, "_blank");

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
			openCreate();
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	return (
		<div className="flex flex-col gap-4 pt-2 pb-4 sm:flex-row sm:items-start sm:justify-between">
			<div>
				<div className="flex items-center gap-2.5">
					<Icon
						name="mega-phone"
						className="h-6 w-6 shrink-0 text-text-strong-950"
					/>
					<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
						Campaigns
					</h1>
				</div>
				<p className="mt-1 text-sm text-text-sub-600">
					Broadcast newsletters and email updates directly to all your contacts.
				</p>
			</div>

			<div className="flex shrink-0 items-center gap-2">
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
					onClick={openCreate}
					className="gap-1.5 rounded-xl"
					aria-keyshortcuts="c"
				>
					<Icon name="plus" className="h-4 w-4" />
					Create campaign
					<ActionKbd className="border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]">
						C
					</ActionKbd>
				</FancyButton.Root>
			</div>
		</div>
	);
}
