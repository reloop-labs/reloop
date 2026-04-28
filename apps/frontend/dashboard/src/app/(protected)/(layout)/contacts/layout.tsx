"use client";
import { ContactsApiDetails } from "@fe/dashboard/components/api-details/contacts";
import { DocsButton } from "@fe/dashboard/components/docs-button";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { usePathname, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useHotkeys } from "react-hotkeys-hook";
import useSWR from "swr";
import { ContactsModals } from "./components/contacts-modals";
import { ContactsTabs } from "./components/contacts-tabs";
import { KbdCommand } from "@reloop/ui/kbd-command";
import { KbdKey } from "@reloop/ui/kbd-key";

interface Topic {
	id: string;
	name: string;
}

const ContactsLayout = ({ children }: { children: React.ReactNode }) => {
	const pathname = usePathname();
	const router = useRouter();

	// Modal State via URL
	const [, setModal] = useQueryState("modal");

	const isPropertiesPage = pathname.includes("/contacts/properties");
	const isTopicsPage = pathname.includes("/contacts/topics");
	const isGroupsPage = pathname.includes("/contacts/groups");
	const isAddTopicPage = pathname.endsWith("/contacts/topics/add");
	const isBulkImportPage = pathname.includes("/bulk-import");
	const isContactDetailPage = pathname.includes("/contacts/detail/");
	const isGroupDetailPage =
		pathname.match(/\/contacts\/groups\/([^/]+)/) !== null;
	const isTopicDetailPage =
		pathname.match(/\/contacts\/topics\/([^/]+)$/) !== null;
	const isDetailPage =
		isContactDetailPage || isGroupDetailPage || isTopicDetailPage;

	const handleAction = () => {
		if (isPropertiesPage) setModal("add-property");
		else if (isTopicsPage) setModal("create-topic");
		else if (isGroupsPage) setModal("create-group");
		else setModal("add-contact");
	};

	useHotkeys(
		"mod+a",
		(e) => {
			e.preventDefault();
			handleAction();
		},
		{
			enabled: !isAddTopicPage && !isBulkImportPage && !isDetailPage,
		},
	);

	// Extract topicId if on a topic subpage
	const topicIdMatch = pathname.match(/\/contacts\/topics\/([^/]+)/);
	const topicId = topicIdMatch && !isAddTopicPage ? topicIdMatch[1] : null;

	const { data: topicData } = useSWR<Topic>(
		topicId ? `/api/contacts/v1/topics/${topicId}` : null,
	);

	const getHeaderConfig = () => {
		if (isAddTopicPage) return { title: "Create Topic", showBack: true };
		if (isBulkImportPage) return { title: "Bulk Import", showBack: true };
		if (topicId)
			return { title: topicData?.name || "Topic Details", showBack: true };
		if (isPropertiesPage) return { title: "Properties", showBack: false };
		if (isTopicsPage) return { title: "Topics", showBack: false };
		if (isGroupsPage) return { title: "Groups", showBack: false };
		return { title: "Contacts", showBack: false };
	};

	const { title, showBack } = getHeaderConfig();

	const actionLabel = isPropertiesPage
		? "Add Property"
		: isTopicsPage
			? "Create Topic"
			: isGroupsPage
				? "Create Group"
				: "Add Contact";

	return (
		<>
			<div className="mx-auto max-w-3xl sm:px-8">
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
						{!isAddTopicPage && !isBulkImportPage && (
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
									<span className="inline-flex items-center gap-0.5">
										<KbdCommand />
										<KbdKey>a</KbdKey>
									</span>
								</Button.Root>
								<ContactsApiDetails size="xsmall" mode="ghost" />
							</div>
						)}
					</div>
				)}

				{!isDetailPage && (
					<div className="mt-2">
						<ContactsTabs />
					</div>
				)}
				<div className={!isDetailPage ? "mt-4" : ""}>{children}</div>
			</div>

			{/* Global Contacts Modals */}
			<ContactsModals topicId={topicId || undefined} />
		</>
	);
};

export default ContactsLayout;
