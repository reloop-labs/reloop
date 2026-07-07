"use client";
import { ChannelsApiDetails } from "@fe/dashboard/components/api-details/channels";
import { ContactsApiDetails } from "@fe/dashboard/components/api-details/contacts";
import { GroupsApiDetails } from "@fe/dashboard/components/api-details/groups";
import { PropertiesApiDetails } from "@fe/dashboard/components/api-details/properties";
import { DocsButton } from "@fe/dashboard/components/docs-button";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { KbdCommand } from "@reloop/ui/kbd-command";
import { KbdKey } from "@reloop/ui/kbd-key";
import { usePathname, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useHotkeys } from "react-hotkeys-hook";
import useSWR from "swr";
import { ContactsModals } from "./components/contacts/contacts-modals";
import { ContactsTabs } from "./components/contacts/contacts-tabs";

interface Channel {
	id: string;
	name: string;
}

const ContactsLayout = ({ children }: { children: React.ReactNode }) => {
	const pathname = usePathname();
	const router = useRouter();

	// Modal State via URL
	const [, setModal] = useQueryState("modal");

	const isPropertiesPage = pathname.includes("/contacts/properties");
	const isChannelsPage = pathname.includes("/contacts/channels");
	const isGroupsPage = pathname.includes("/contacts/groups");
	const isBulkImportPage = pathname.includes("/bulk-import");
	const isContactDetailPage = pathname.includes("/contacts/detail/");
	const isGroupDetailPage =
		pathname.match(/\/contacts\/groups\/([^/]+)/) !== null;
	const isChannelDetailPage =
		pathname.match(/\/contacts\/channels\/([^/]+)$/) !== null;
	const isDetailPage =
		isContactDetailPage || isGroupDetailPage || isChannelDetailPage;

	const handleAction = () => {
		if (isPropertiesPage) setModal("add-property");
		else if (isChannelsPage) setModal("create-channel");
		else if (isGroupsPage) setModal("create-group");
		else setModal("add-contact");
	};

	useHotkeys(
		"mod+a",
		(e) => {
			e.preventDefault();
			if (!isGroupsPage) {
				handleAction();
			}
		},
		{
			enabled: !isBulkImportPage && !isDetailPage,
		},
	);

	useHotkeys(
		"c+g",
		(e) => {
			e.preventDefault();
			setModal("create-group");
		},
		{
			enabled: !isBulkImportPage && !isDetailPage,
		},
	);

	// Extract channelId if on a channel subpage
	const channelIdMatch = pathname.match(/\/contacts\/channels\/([^/]+)/);
	const channelId = channelIdMatch ? channelIdMatch[1] : null;

	const { data: channelData } = useSWR<Channel>(
		channelId ? `/api/contacts/v1/channels/${channelId}` : null,
	);

	const getHeaderConfig = () => {
		if (isBulkImportPage) return { title: "Bulk Import", showBack: true };
		if (channelId)
			return { title: channelData?.name || "Channel Details", showBack: true };
		if (isPropertiesPage) return { title: "Properties", showBack: false };
		if (isChannelsPage) return { title: "Channels", showBack: false };
		if (isGroupsPage) return { title: "Groups", showBack: false };
		return { title: "Contacts", showBack: false };
	};

	const { title, showBack } = getHeaderConfig();

	const actionLabel = isPropertiesPage
		? "Add Property"
		: isChannelsPage
			? "Create Channel"
			: isGroupsPage
				? "Create Group"
				: "Add Contact";

	return (
		<>
			<div className="mx-auto max-w-4xl space-y-8 p-6 lg:p-8">
				{!isDetailPage && (
					<div className="flex items-center justify-between pb-6">
						<div className="flex flex-col gap-1">
							{showBack && (
								<Button.Root
									onClick={() => router.back()}
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
								<DocsButton
									slug={
										isPropertiesPage
											? "features/contacts/properties"
											: isChannelsPage
												? "features/contacts/channels"
												: isGroupsPage
													? "features/contacts/groups"
													: "features/contacts"
									}
									size="xsmall"
								/>
								<Button.Root
									variant="neutral"
									size="xsmall"
									onClick={handleAction}
									className="gap-2"
								>
									<Icon name="plus" className="h-4 w-4" />
									{actionLabel}
									{isGroupsPage ? (
										<span className="inline-flex items-center gap-0.5">
											<KbdKey>c</KbdKey>
											<KbdKey>g</KbdKey>
										</span>
									) : (
										<span className="inline-flex items-center gap-0.5">
											<KbdCommand />
											<KbdKey>a</KbdKey>
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

			{/* Global Contacts Modals */}
			<ContactsModals channelId={channelId || undefined} />
		</>
	);
};

export default ContactsLayout;
