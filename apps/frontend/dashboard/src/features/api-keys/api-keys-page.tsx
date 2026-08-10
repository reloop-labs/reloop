import { useQueryState } from "nuqs";
import { useMemo } from "react";
import type { CommandAction } from "#/features/dashboard/command-menu";
import { useRegisterCommandActions } from "#/features/dashboard/command-menu-context";
import { ApiKeyList } from "./list/api-key-list";
import { ApiKeyListHeader } from "./list/api-key-list-header";

const DOCS_URL = "https://reloop.sh/docs/learn/api-keys";

export function ApiKeysPage() {
	const [, setModal] = useQueryState("modal");

	const actions = useMemo<CommandAction[]>(
		() => [
			{
				id: "create-api-key",
				label: "Create API Key",
				icon: "plus",
				shortcut: { label: "C", keys: ["c"] },
				onSelect: () => void setModal("create-api-key"),
			},
			{
				id: "open-api-reference",
				label: "Open API Reference",
				icon: "code",
				shortcut: { label: "S", keys: ["s"] },
				onSelect: () =>
					window.dispatchEvent(
						new CustomEvent("api-details:open", {
							detail: { docSection: "api-key" },
						}),
					),
			},
			{
				id: "go-to-docs",
				label: "Go to Docs",
				icon: "file-text",
				shortcut: { label: "D", keys: ["d"] },
				onSelect: () => window.open(DOCS_URL, "_blank"),
			},
			{
				id: "select-all",
				label: "Select All",
				icon: "check-square",
				shortcut: { label: "⌘A", keys: ["mod+a"] },
				onSelect: () =>
					window.dispatchEvent(new CustomEvent("api-keys:select-all")),
			},
		],
		[setModal],
	);

	useRegisterCommandActions("api-keys", "API Keys", actions);

	return (
		<div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
			<ApiKeyListHeader />
			<ApiKeyList />
		</div>
	);
}
