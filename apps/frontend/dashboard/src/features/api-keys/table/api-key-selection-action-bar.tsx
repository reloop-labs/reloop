"use client";

import { Icon } from "@reloop/ui/icon";
import type { Table } from "@tanstack/react-table";
import axios from "axios";
import { X } from "lucide-react";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import {
	ActionBar,
	ActionBarClose,
	ActionBarGroup,
	ActionBarItem,
	ActionBarSelection,
	ActionBarSeparator,
} from "#/components/data-table/action-bar";
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
		action: "enable" | "disable" | "delete",
	): Promise<void> => {
		if (selectedCount === 0 || busy) return;
		setBusy(true);
		const keys = selectedRows.map((row) => row.original);
		let ok = 0;
		let failed = 0;

		try {
			for (const key of keys) {
				try {
					if (action === "delete") {
						await axios.delete(`/api/api-key/v1/${key.id}`, {
							withCredentials: true,
						});
					} else if (action === "enable") {
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
					action === "delete"
						? `Deleted ${ok} API key${ok === 1 ? "" : "s"}`
						: action === "enable"
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

		// Single key → typed confirm modal
		if (selectedCount === 1) {
			const first = selectedRows[0]?.original;
			if (!first) return;
			void setDeleteId(first.id);
			return;
		}

		// Multi-select → confirm then bulk delete
		const confirmed = window.confirm(
			`Delete ${selectedCount} API keys? This cannot be undone.`,
		);
		if (!confirmed) return;
		void runBulk("delete");
	};

	return (
		<ActionBar
			open={selectedCount > 0}
			onOpenChange={(open) => {
				if (!open) clearSelection();
			}}
		>
			<ActionBarSelection>
				<span className="font-medium">{selectedCount}</span>
				<span>selected</span>
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
				<ActionBarItem
					variant="destructive"
					disabled={busy}
					onClick={handleDelete}
				>
					<Icon name="trash" className="size-3.5" />
					Delete
				</ActionBarItem>
			</ActionBarGroup>
		</ActionBar>
	);
}
