import * as Button from "@reloop/ui/button";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryState } from "nuqs";
import { useHotkeys } from "react-hotkeys-hook";
import { ContactsCommonUseCasesSidebar } from "./common-use-cases-sidebar";
import { ContactsTabs } from "./components/contacts/contacts-tabs";
import { ContactsModals } from "./contacts-modals";

export function ContactsShell({ children }: { children: React.ReactNode }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const navigate = useNavigate();
	const [, setModal] = useQueryState("modal");

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
		else void setModal("add-contact");
	};

	useHotkeys(
		"mod+a",
		(e) => {
			e.preventDefault();
			if (!isGroupsPage) handleAction();
		},
		{ enabled: !isBulkImportPage && !isDetailPage },
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

	return (
		<>
			<div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
				{!isDetailPage && (
					<div className="flex flex-col gap-4 pt-2 pb-4 sm:flex-row sm:items-start sm:justify-between">
						<div>
							{isBulkImportPage && (
								<Button.Root
									onClick={() => void navigate({ to: "/contacts" })}
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
								<Button.Root
									type="button"
									variant="neutral"
									mode="stroke"
									size="small"
									onClick={() =>
										window.open(
											"https://reloop.sh/docs/features/contacts",
											"_blank",
										)
									}
									className="gap-1.5 rounded-xl"
								>
									<Icon
										name="video-guide"
										className="h-4 w-4 text-text-sub-600"
									/>
									Video guide
								</Button.Root>
								<Button.Root
									type="button"
									variant="neutral"
									mode="stroke"
									size="small"
									onClick={() =>
										window.open(
											"https://reloop.sh/docs/features/contacts",
											"_blank",
										)
									}
									className="rounded-xl"
								>
									Documentation
								</Button.Root>
								<FancyButton.Root
									type="button"
									variant="blue"
									size="small"
									onClick={handleAction}
									className="gap-1.5 rounded-xl"
								>
									<Icon name="plus" className="h-4 w-4" />
									{actionLabel}
								</FancyButton.Root>
							</div>
						)}
					</div>
				)}

				{isDetailPage || isBulkImportPage ? (
					<div>{children}</div>
				) : (
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
						<div className="space-y-4 lg:col-span-8 xl:col-span-8">
							<ContactsTabs />
							{children}
						</div>
						<div className="lg:col-span-4 xl:col-span-4">
							<ContactsCommonUseCasesSidebar />
						</div>
					</div>
				)}
			</div>

			<ContactsModals />
		</>
	);
}
