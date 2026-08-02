import { useMemo } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import type { CommandAction } from "#/features/dashboard/command-menu";
import { useRegisterCommandActions } from "#/features/dashboard/command-menu-context";
import { LogList } from "./log-list";
import { LogsListHeader } from "./logs-list-header";

export function LogsPage() {
	const actions = useMemo<CommandAction[]>(
		() => [
			{
				id: "open-api-reference",
				label: "Open API Reference",
				icon: "code",
				shortcut: { label: "S", keys: ["s"] },
				onSelect: () =>
					window.dispatchEvent(
						new CustomEvent("api-details:open", {
							detail: { docSection: "logs" },
						}),
					),
			},
			{
				id: "go-to-docs",
				label: "Go to Docs",
				icon: "file-text",
				shortcut: { label: "D", keys: ["d"] },
				onSelect: () =>
					window.open("https://reloop.sh/docs/learn/logs", "_blank"),
			},
		],
		[],
	);

	useRegisterCommandActions("logs", "Logs", actions);

	useHotkeys(
		"s",
		(e) => {
			e.preventDefault();
			window.dispatchEvent(
				new CustomEvent("api-details:open", {
					detail: { docSection: "logs" },
				}),
			);
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"d",
		(e) => {
			e.preventDefault();
			window.open("https://reloop.sh/docs/learn/logs", "_blank");
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	return (
		<div className="mx-auto max-w-6xl space-y-5 p-6 lg:p-8">
			<LogsListHeader />
			<LogList />
		</div>
	);
}
