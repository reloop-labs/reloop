"use client";
import { ContactsApiDetails } from "@fe/dashboard/components/api-details/contacts";
import { DocsButton } from "@fe/dashboard/components/docs-button";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { KbdCommand } from "@reloop/ui/kbd-command";
import { KbdKey } from "@reloop/ui/kbd-key";
import { usePathname, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useHotkeys } from "react-hotkeys-hook";
import useSWR from "swr";
import { ContactsModals } from "./components/contacts-modals";
import { ContactsTabs } from "./components/contacts-tabs";

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
	const isAddChannelPage = pathname.endsWith("/contacts/channels/add");
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
		else if (isChannelsPage) router.push("/contacts/channels/add");
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
			enabled: !isAddChannelPage && !isBulkImportPage && !isDetailPage,
		},
	);

	useHotkeys(
		"c+g",
		(e) => {
			e.preventDefault();
			setModal("create-group");
		},
		{
			enabled: !isAddChannelPage && !isBulkImportPage && !isDetailPage,
		},
	);

	// Extract channelId if on a channel subpage
	const channelIdMatch = pathname.match(/\/contacts\/channels\/([^/]+)/);
	const channelId = channelIdMatch && !isAddChannelPage ? channelIdMatch[1] : null;

	const { data: channelData } = useSWR<Channel>(
		channelId ? `/api/contacts/v1/channels/${channelId}` : null,
	);

	const getHeaderConfig = () => {
		if (isAddChannelPage) return { title: "Create Channel", showBack: true };
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
			<div
				className={`mx-auto sm:px-8 ${isAddChannelPage ? "max-w-5xl" : "max-w-3xl"}`}
			>
				{/* Unified Header */}
				{!isDetailPage && (
					<div className="flex items-center justify-between pt-10 pb-6">
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
						{!isAddChannelPage && !isBulkImportPage && (
							<div className="flex items-center gap-2 self-end">
								<DocsButton slug="contacts" size="xsmall" />
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
								<ContactsApiDetails size="xsmall" mode="ghost" />
							</div>
						)}
					</div>
				)}

				{!isDetailPage && !isAddChannelPage && !isBulkImportPage && (
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
