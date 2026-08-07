import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import type { CommandAction } from "#/features/dashboard/command-menu";
import { useRegisterCommandActions } from "#/features/dashboard/command-menu-context";
import { useWebhooks } from "#/features/webhooks/components/use-webhooks";
import { WebhookError } from "#/features/webhooks/components/webhook-error";
import { WebhookTable } from "#/features/webhooks/components/webhook-table";
import { WebhookToolbar } from "#/features/webhooks/components/webhook-toolbar";
import { WebhooksListHeader } from "./webhooks-list-header";

export function WebhooksPage() {
	const router = useRouter();
	const {
		statusFilter,
		setStatusFilter,
		searchQuery,
		setSearchQuery,
		webhooks,
		isLoading,
		error,
		isTotalEmpty,
		mutate,
	} = useWebhooks();

	const [deletedName, setDeletedName] = useState<string | null>(null);

	const actions = useMemo<CommandAction[]>(
		() => [
			{
				id: "create-webhook",
				label: "Create Webhook",
				icon: "plus",
				shortcut: { label: "C", keys: ["c"] },
				onSelect: () => router.push("/webhooks/create"),
			},
			{
				id: "open-api-reference",
				label: "Open API Reference",
				icon: "code",
				shortcut: { label: "S", keys: ["s"] },
				onSelect: () =>
					window.dispatchEvent(
						new CustomEvent("api-details:open", {
							detail: { docSection: "webhooks" },
						}),
					),
			},
			{
				id: "go-to-docs",
				label: "Go to Docs",
				icon: "file-text",
				shortcut: { label: "D", keys: ["d"] },
				onSelect: () =>
					window.open("https://reloop.sh/docs/webhooks", "_blank"),
			},
		],
		[router],
	);

	useRegisterCommandActions("webhooks", "Webhooks", actions);

	useHotkeys(
		"c",
		(e) => {
			e.preventDefault();
			router.push("/webhooks/create");
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"s",
		(e) => {
			e.preventDefault();
			window.dispatchEvent(
				new CustomEvent("api-details:open", {
					detail: { docSection: "webhooks" },
				}),
			);
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"d",
		(e) => {
			e.preventDefault();
			window.open("https://reloop.sh/docs/webhooks", "_blank");
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useEffect(() => {
		if (deletedName) {
			const timer = setTimeout(() => setDeletedName(null), 8000);
			return () => clearTimeout(timer);
		}
	}, [deletedName]);

	if (error) {
		return (
			<div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
				<WebhooksListHeader />
				<WebhookError />
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
			<WebhooksListHeader />

			<div className="pb-8">
				<AnimatePresence>
					{deletedName && (
						<motion.div
							key="deleted-banner"
							initial={{ opacity: 0, y: -8, height: 0 }}
							animate={{ opacity: 1, y: 0, height: "auto" }}
							exit={{ opacity: 0, y: -8, height: 0 }}
							transition={{ duration: 0.2 }}
							className="mb-4 overflow-hidden"
						>
							<div className="flex items-center justify-between rounded-xl border border-[#B7F1D0] bg-[#E8FAF0] px-4 py-3 text-[#0F5C34] text-sm dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-200">
								<span>
									Webhook &quot;
									<span className="font-semibold">{deletedName}</span>&quot; has
									been successfully deleted.
								</span>
								<button
									type="button"
									onClick={() => setDeletedName(null)}
									className="p-1 text-[#0F5C34]/70 transition-colors hover:text-[#0F5C34] dark:text-emerald-200/70 dark:hover:text-emerald-200"
								>
									<Icon name="close" className="h-4 w-4" />
								</button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{!isTotalEmpty && (
					<WebhookToolbar
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
						statusFilter={statusFilter}
						onStatusFilterChange={setStatusFilter}
					/>
				)}

				<div className={isTotalEmpty ? "" : "mt-4"}>
					<WebhookTable
						webhooks={webhooks}
						isLoading={isLoading}
						loadingRows={4}
						isTotalEmpty={isTotalEmpty}
						searchQuery={searchQuery}
						statusFilter={statusFilter}
						onClearFilters={() => {
							setSearchQuery("");
							setStatusFilter("all");
						}}
						onMutate={mutate}
						onDeleteSuccess={(name) => setDeletedName(name)}
					/>
				</div>
			</div>
		</div>
	);
}
