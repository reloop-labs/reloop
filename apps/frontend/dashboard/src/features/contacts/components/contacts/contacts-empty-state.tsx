import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { useRouter } from "next/navigation";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsString,
	useQueryState,
} from "nuqs";
import type { ReactNode } from "react";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

const actionKbdOnSolidClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

interface ContactsEmptyStateProps {
	onAddContact?: () => void;
	searchQuery?: string;
	onClearSearch?: () => void;
	title?: string;
	description?: string;
	buttonText?: string;
	/** Override the default single-key ActionKbd (e.g. sequence "A" "C"). */
	shortcut?: ReactNode;
}

export function ContactsEmptyState({
	onAddContact,
	searchQuery = "",
	onClearSearch,
	title,
	description,
	buttonText,
	shortcut,
}: ContactsEmptyStateProps) {
	const router = useRouter();
	const [statusFilter, setStatusFilter] = useQueryState(
		"status",
		parseAsArrayOf(parseAsString).withDefault([]),
	);
	const [channelId, setChannelId] = useQueryState(
		"channelId",
		parseAsString.withDefault(""),
	);
	const [, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);
	const [, setSearchQuery] = useQueryState(
		"search",
		parseAsString.withDefault(""),
	);

	const isFiltered =
		searchQuery.trim() !== "" ||
		statusFilter.length > 0 ||
		channelId.trim() !== "";

	const handleClearFilters = () => {
		void setStatusFilter([]);
		void setSearchQuery("");
		void setChannelId(null);
		void setCurrentPage(1);
		onClearSearch?.();
	};

	const handleAddContact = () => {
		if (onAddContact) {
			onAddContact();
		} else {
			router.push("/contacts/create");
		}
	};

	return (
		<div className="flex flex-col items-center px-6 py-12 text-center dark:bg-bg-weak-50/30">
			<div className="mb-4 flex items-center justify-center">
				<Icon
					name={isFiltered ? "search" : "users"}
					className="h-8 w-8 text-text-sub-600"
				/>
			</div>
			<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
				{title ?? (isFiltered ? "No contacts found" : "Create your first contact")}
			</h3>
			<p className="mx-auto mb-6 max-w-75 text-balance font-medium text-[12px] text-text-sub-600">
				{description ??
					(isFiltered
						? "Try adjusting your search or filters."
						: "Add contacts manually, import a CSV, or let your app sync them automatically.")}
			</p>
			{isFiltered ? (
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={handleClearFilters}
					className="gap-1.5 rounded-xl"
				>
					<Icon name="cross-circle" className="h-4 w-4 text-text-sub-600" />
					Clear filters
				</Button.Root>
			) : (
				<FancyButton.Root
					type="button"
					variant="blue"
					size="small"
					onClick={handleAddContact}
					className="gap-1.5 rounded-xl"
				>
					<Icon name="plus" className="h-4 w-4" />
					{buttonText ?? "Add contact"}
					{shortcut ?? (
						<ActionKbd className={actionKbdOnSolidClassName}>C</ActionKbd>
					)}
				</FancyButton.Root>
			)}
		</div>
	);
}
