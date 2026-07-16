import { ChannelsApiDetails } from "#/components/api-details/channels";
import { ContactsApiDetails } from "#/components/api-details/contacts";
import { GroupsApiDetails } from "#/components/api-details/groups";
import { PropertiesApiDetails } from "#/components/api-details/properties";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryState } from "nuqs";
import { useHotkeys } from "react-hotkeys-hook";
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

	const actionLabel = isPropertiesPage
		? "Add Property"
		: isChannelsPage
			? "Create Channel"
			: isGroupsPage
				? "Create Group"
				: "Add Contact";

	return (
		<>
			<div className="mx-auto max-w-3xl space-y-8 p-6 lg:p-8">
				{!isDetailPage && (
					<div className="flex items-center justify-between pb-6">
						<div className="flex flex-col gap-1">
							{isBulkImportPage && (
								<Button.Root
									onClick={() => void navigate({ to: "/contacts" })}
									variant="neutral"
									mode="stroke"
									size="xxsmall"
									className="w-fit"
								>
									<Button.Icon>
										<Icon name="chevron-left" className="h-4 w-4" />
									</Button.Icon>
									Back
								</Button.Root>
							)}
							<h1 className="font-medium text-2xl">{title}</h1>
						</div>
						{!isBulkImportPage && (
							<div className="flex items-center gap-2 self-end">
								<Button.Root
									variant="neutral"
									mode="stroke"
									size="xsmall"
									onClick={() =>
										window.open("https://reloop.sh/docs/features/contacts", "_blank")
									}
									className="gap-1.5"
								>
									<Icon name="file-text" className="h-4 w-4" />
									Docs
									<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-200 p-px font-medium text-[10px] uppercase">
										D
									</span>
								</Button.Root>
								<Button.Root
									variant="neutral"
									size="xsmall"
									onClick={handleAction}
									className="gap-2"
								>
									<Icon name="plus" className="h-4 w-4" />
									{actionLabel}
									{isGroupsPage ? (
										<span className="inline-flex items-center gap-0.5 text-[10px] uppercase">
											<span className="rounded-sm border border-stroke-soft-100/20 px-1">
												c
											</span>
											<span className="rounded-sm border border-stroke-soft-100/20 px-1">
												g
											</span>
										</span>
									) : (
										<span className="inline-flex items-center gap-0.5">
											<Icon
												name="command"
												className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
											/>
											<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100/20 p-px font-medium text-[10px] uppercase">
												A
											</span>
										</span>
									)}
								</Button.Root>
								{isPropertiesPage ? (
									<PropertiesApiDetails size="xsmall" mode="ghost" />
								) : isChannelsPage ? (
									<ChannelsApiDetails size="xsmall" mode="ghost" />
								) : isGroupsPage ? (
									<GroupsApiDetails size="xsmall" mode="ghost" />
								) : (
									<ContactsApiDetails size="xsmall" mode="ghost" />
								)}
							</div>
						)}
					</div>
				)}

				{!isDetailPage && !isBulkImportPage && (
					<div className="mt-2">
						<ContactsTabs />
					</div>
				)}
				<div className={!isDetailPage ? "mt-4" : ""}>{children}</div>
			</div>

			<ContactsModals />
		</>
	);
}
