import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
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
						onDeleteSuccess={(name) =>
							toast.success(`Webhook "${name}" has been successfully deleted.`)
						}
					/>
				</div>
			</div>
		</div>
	);
}
