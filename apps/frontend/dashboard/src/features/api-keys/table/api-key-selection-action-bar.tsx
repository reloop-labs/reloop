import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import type { Table } from "@tanstack/react-table";
import axios from "axios";
import { X } from "lucide-react";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import {
	ActionBar,
	ActionBarClose,
	ActionBarGroup,
	ActionBarItem,
	ActionBarSelection,
	ActionBarSeparator,
} from "#/components/data-table/action-bar";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { useInvalidateApiKeys } from "../hooks/use-api-keys-query";
import type { ApiKeyData } from "../types";

export function ApiKeySelectionActionBar({
	table,
}: {
	table: Table<ApiKeyData>;
}) {
	const selectedRows = table.getFilteredSelectedRowModel().rows;
	const selectedCount = selectedRows.length;
	const invalidate = useInvalidateApiKeys();
	const [, setDeleteId] = useQueryState("delete");
	const [busy, setBusy] = useState(false);

	const clearSelection = () => table.resetRowSelection();

	const runBulk = async (
		action: "enable" | "disable",
	): Promise<void> => {
		if (selectedCount === 0 || busy) return;
		setBusy(true);
		const keys = selectedRows.map((row) => row.original);
		let ok = 0;
		let failed = 0;

		try {
			for (const key of keys) {
				try {
					if (action === "enable") {
						if (!key.enabled) {
							await axios.post(
								`/api/api-key/v1/enable/${key.id}`,
								{},
								{ withCredentials: true },
							);
						}
					} else if (key.enabled) {
						await axios.post(
							`/api/api-key/v1/disable/${key.id}`,
							{},
							{ withCredentials: true },
						);
					}
					ok += 1;
				} catch {
					failed += 1;
				}
			}

			await invalidate();
			clearSelection();

			if (failed === 0) {
				toast.success(
					action === "enable"
						? `Enabled ${ok} API key${ok === 1 ? "" : "s"}`
						: `Disabled ${ok} API key${ok === 1 ? "" : "s"}`,
				);
			} else {
				toast.error(
					`${failed} of ${keys.length} action${keys.length === 1 ? "" : "s"} failed`,
				);
			}
		} finally {
			setBusy(false);
		}
	};

	const handleDelete = () => {
		if (selectedCount === 0 || busy) return;

		// Single key → typed confirm modal for key
		if (selectedCount === 1) {
			const first = selectedRows[0]?.original;
			if (!first) return;
			void setDeleteId(first.id);
			return;
		}

		// Multi-select → open bulk delete modal
		void setDeleteId("bulk");
	};

	// Hotkey for delete when rows are selected (D / Del / Backspace)
	useHotkeys(
		["d", "delete", "backspace"],
		(e) => {
			e.preventDefault();
			handleDelete();
		},
		{ enableOnFormTags: false, enabled: selectedCount > 0, preventDefault: true },
	);

	return (
		<ActionBar
			open={selectedCount > 0}
			onOpenChange={(open) => {
				if (!open) clearSelection();
			}}
		>
			<ActionBarSelection>
				<span className="font-semibold text-text-strong-950 tabular-nums">{selectedCount}</span>
				<span className="text-text-sub-600">selected</span>
				<ActionBarSeparator />
				<ActionBarClose>
					<X />
				</ActionBarClose>
			</ActionBarSelection>

			<ActionBarSeparator />

			<ActionBarGroup>
				<ActionBarItem
					disabled={busy}
					onClick={() => void runBulk("enable")}
				>
					<Icon name="check-circle" className="size-3.5" />
					Enable
				</ActionBarItem>
				<ActionBarItem
					disabled={busy}
					onClick={() => void runBulk("disable")}
				>
					<Icon name="cross-circle" className="size-3.5" />
					Disable
				</ActionBarItem>
				<FancyButton.Root
					variant="destructive"
					size="xsmall"
					disabled={busy}
					onClick={handleDelete}
					className="h-7 gap-1.5 rounded-full px-3 text-xs font-medium"
				>
					<FancyButton.Icon as={Icon} name="trash" className="size-3.5" />
					Delete {selectedCount} API key{selectedCount === 1 ? "" : "s"}
					<ActionKbd className="border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]">
						<svg
							viewBox="0 -0.5 25 25"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							className="size-3.5"
						>
							<path
								fillRule="evenodd"
								clipRule="evenodd"
								d="M5.91006 12.6651L8.35606 15.5261C8.59533 15.82 8.95209 15.9935 9.33106 16.0001L13.0501 15.9931H16.2391C18.0288 16.0036 19.4885 14.5618 19.5001 12.7721V10.2221C19.4891 8.43193 18.0292 6.98953 16.2391 7.00006L9.33106 7.00706C8.95226 7.01341 8.59552 7.18647 8.35606 7.48006L5.91006 10.3421C5.36331 11.0199 5.36331 11.9872 5.91006 12.6651V12.6651Z"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
							<path
								d="M12.1603 9.46359C11.864 9.17409 11.3892 9.17957 11.0997 9.47582C10.8102 9.77207 10.8156 10.2469 11.1119 10.5364L12.1603 9.46359ZM12.6469 12.0364C12.9431 12.3259 13.418 12.3204 13.7075 12.0242C13.997 11.7279 13.9915 11.2531 13.6953 10.9636L12.6469 12.0364ZM13.6963 10.9646C13.4006 10.6745 12.9258 10.6791 12.6357 10.9748C12.3456 11.2705 12.3502 11.7453 12.6458 12.0354L13.6963 10.9646ZM14.1748 13.5354C14.4705 13.8255 14.9454 13.8209 15.2355 13.5252C15.5255 13.2295 15.521 12.7547 15.2253 12.4646L14.1748 13.5354ZM13.6953 12.0364C13.9915 11.7469 13.997 11.2721 13.7075 10.9758C13.418 10.6796 12.9431 10.6741 12.6469 10.9636L13.6953 12.0364ZM11.1119 12.4636C10.8156 12.7531 10.8102 13.2279 11.0997 13.5242C11.3892 13.8204 11.864 13.8259 12.1603 13.5364L11.1119 12.4636ZM12.6458 10.9646C12.3502 11.2547 12.3456 11.7295 12.6357 12.0252C12.9258 12.3209 13.4006 12.3255 13.6963 12.0354L12.6458 10.9646ZM15.2253 10.5354C15.521 10.2453 15.5255 9.77046 15.2355 9.47477C14.9454 9.17909 14.4705 9.17454 14.1748 9.46462L15.2253 10.5354ZM11.1119 10.5364L12.6469 12.0364L13.6953 10.9636L12.1603 9.46359L11.1119 10.5364ZM12.6458 12.0354L14.1748 13.5354L15.2253 12.4646L13.6963 10.9646L12.6458 10.9646ZM12.6469 10.9636L11.1119 12.4636L12.1603 13.5364L13.6953 12.0364L12.6469 10.9636ZM13.6963 12.0354L15.2253 10.5354L14.1748 9.46462L12.6458 10.9646L13.6963 12.0354Z"
								fill="currentColor"
							/>
						</svg>
					</ActionKbd>
				</FancyButton.Root>
			</ActionBarGroup>
		</ActionBar>
	);
}

