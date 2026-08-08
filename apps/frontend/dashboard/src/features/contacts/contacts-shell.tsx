import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ChannelsApiDetails } from "#/components/api-details/channels";
import { ContactsApiDetails } from "#/components/api-details/contacts";
import { GroupsApiDetails } from "#/components/api-details/groups";
import { PropertiesApiDetails } from "#/components/api-details/properties";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { ContactsTabs } from "./components/contacts/contacts-tabs";
import { ContactsModals } from "./contacts-modals";

const DOCS_URL = "https://reloop.sh/docs/learn/contacts";

export function ContactsShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const router = useRouter();
	const [, setModal] = useQueryState("modal");
	const [deletedItemName, setDeletedItemName] = useState<string | null>(null);

	useEffect(() => {
		if (deletedItemName) {
			const timer = setTimeout(() => setDeletedItemName(null), 8000);
			return () => clearTimeout(timer);
		}
	}, [deletedItemName]);

	const isPropertiesPage = pathname.includes("/contacts/properties");
	const isChannelsPage = pathname.includes("/contacts/channels");
	const isGroupsPage = pathname.includes("/contacts/groups");
	const isBulkImportPage = pathname.includes("/bulk-import");
	const isDetailPage =
		pathname.includes("/contacts/detail/") ||
		Boolean(pathname.match(/\/contacts\/groups\/[^/]+$/)) ||
		Boolean(pathname.match(/\/contacts\/channels\/[^/]+$/));

	const handleAction = () => {
		if (isPropertiesPage) void setModal("add-property");
		else if (isChannelsPage) void setModal("create-channel");
		else if (isGroupsPage) void setModal("create-group");
		else router.push("/contacts/create");
	};

	const openDocs = () => window.open(DOCS_URL, "_blank");

	// C — Add / create. Select-all lives on the contacts table (⌘A).
	useHotkeys(
		"c",
		(e) => {
			e.preventDefault();
			handleAction();
		},
		{
			enableOnFormTags: false,
			preventDefault: true,
			enabled: !isBulkImportPage && !isDetailPage,
		},
	);

	useHotkeys(
		"d",
		(e) => {
			e.preventDefault();
			openDocs();
		},
		{
			enableOnFormTags: false,
			preventDefault: true,
			enabled: !isBulkImportPage && !isDetailPage,
		},
	);

	useHotkeys(
		"c+g",
		(e) => {
			e.preventDefault();
			void setModal("create-group");
		},
		{ enabled: !isBulkImportPage && !isDetailPage },
	);

	const title = isPropertiesPage
		? "Properties"
		: isChannelsPage
			? "Channels"
			: isGroupsPage
				? "Groups"
				: isBulkImportPage
					? "Bulk Import"
					: "Contacts";

	const subtitle = isPropertiesPage
		? "Manage custom attributes and metadata for your contact audience."
		: isChannelsPage
			? "Configure communication channels for sending messages."
			: isGroupsPage
				? "Organize contacts into custom groups and segments for targeting."
				: isBulkImportPage
					? "Bulk import contacts and custom attributes from a CSV file."
					: "Manage contacts, audiences, and properties for targeted email campaigns.";

	const headerIcon = isPropertiesPage
		? "tag"
		: isChannelsPage
			? "notification-indicator"
			: isGroupsPage
				? "modules"
				: isBulkImportPage
					? "upload"
					: "contacts";

	const actionLabel = isPropertiesPage
		? "Add property"
		: isChannelsPage
			? "Create channel"
			: isGroupsPage
				? "Create group"
				: "Add contact";

	const ApiDetailsComponent = isPropertiesPage
		? PropertiesApiDetails
		: isChannelsPage
			? ChannelsApiDetails
			: isGroupsPage
				? GroupsApiDetails
				: ContactsApiDetails;

	return (
		<>
			<div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
				{!isDetailPage && (
					<div className="flex flex-col gap-4 pt-2 pb-4 sm:flex-row sm:items-start sm:justify-between">
						<div>
							{isBulkImportPage && (
								<Button.Root
									onClick={() => router.push("/contacts")}
									variant="neutral"
									mode="stroke"
									size="xxsmall"
									className="mb-2 w-fit"
								>
									<Button.Icon>
										<Icon name="chevron-left" className="h-4 w-4" />
									</Button.Icon>
									Back
								</Button.Root>
							)}
							<div className="flex items-center gap-2.5">
								<Icon
									name={headerIcon}
									className="h-6 w-6 shrink-0 text-text-strong-950"
								/>
								<h1 className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
									{title}
								</h1>
							</div>
							<p className="mt-1 text-sm text-text-sub-600">{subtitle}</p>
						</div>

						{!isBulkImportPage && (
							<div className="flex shrink-0 items-center gap-2">
								<ApiDetailsComponent
									renderTrigger={({ open }) => (
										<Button.Root
											type="button"
											variant="neutral"
											mode="stroke"
											size="small"
											onClick={open}
											className="gap-1.5 rounded-xl"
											aria-keyshortcuts="s"
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
									onClick={handleAction}
									className="gap-1.5 rounded-xl"
									aria-keyshortcuts="c"
								>
									<Icon name="plus" className="h-4 w-4" />
									{actionLabel}
									<ActionKbd className="border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]">
										C
									</ActionKbd>
								</FancyButton.Root>
							</div>
						)}
					</div>
				)}

				<AnimatePresence>
					{deletedItemName && (
						<motion.div
							key="deleted-item-banner"
							initial={{ opacity: 0, y: -8, height: 0 }}
							animate={{ opacity: 1, y: 0, height: "auto" }}
							exit={{ opacity: 0, y: -8, height: 0 }}
							transition={{ duration: 0.2 }}
							className="mb-4 overflow-hidden"
						>
							<div className="flex items-center justify-between rounded-xl border border-[#B7F1D0] bg-[#E8FAF0] px-4 py-3 text-[#0F5C34] text-sm dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-200">
								<span>
									<span className="font-semibold">{deletedItemName}</span> has
									been successfully deleted.
								</span>
								<button
									type="button"
									onClick={() => setDeletedItemName(null)}
									className="p-1 text-[#0F5C34]/70 transition-colors hover:text-[#0F5C34] dark:text-emerald-200/70 dark:hover:text-emerald-200"
								>
									<Icon name="close" className="h-4 w-4" />
								</button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{isDetailPage || isBulkImportPage ? (
					<div>{children}</div>
				) : (
					<div className="space-y-4">
						<ContactsTabs />
						{children}
					</div>
				)}
			</div>

			<ContactsModals
				onDeleteChannelSuccess={(name) =>
					setDeletedItemName(`Channel "${name}"`)
				}
				onDeleteGroupSuccess={(name) => setDeletedItemName(`Group "${name}"`)}
				onDeletePropertySuccess={(name) =>
					setDeletedItemName(`Property "${name}"`)
				}
			/>
		</>
	);
}
