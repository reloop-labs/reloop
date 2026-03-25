"use client";
import { ContactsApiDetails } from "@fe/dashboard/components/api-details/contacts";
import { FeedbackPopover } from "@fe/dashboard/components/feedback-popover";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { AddContactModal } from "./components/add-contact-modal";
import { AddPropertyModal } from "./components/add-property-modal";
import { ContactsTabs } from "./components/contacts-tabs";
import { CreateGroupModal } from "./components/create-group-modal";
import { CreateTopicModal } from "./components/create-topic-modal";
import { DocsButton } from "./components/docs-button";

interface Topic {
	id: string;
	name: string;
}

const ContactsLayout = ({ children }: { children: React.ReactNode }) => {
	const pathname = usePathname();
	const router = useRouter();

	// Modal States
	const [isContactModalOpen, setIsContactModalOpen] = useState(false);
	const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
	const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
	const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

	const isPropertiesPage = pathname.includes("/contacts/properties");
	const isTopicsPage = pathname.includes("/contacts/topics");
	const isGroupsPage = pathname.includes("/contacts/groups");
	const isAddTopicPage = pathname.endsWith("/contacts/topics/add");

	const isBulkImportPage = pathname.includes("/bulk-import");
	const isContactDetailPage = pathname.includes("/contacts/detail/");

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

	const handleAction = () => {
		if (isPropertiesPage) setIsPropertyModalOpen(true);
		else if (isTopicsPage) setIsTopicModalOpen(true);
		else if (isGroupsPage) setIsGroupModalOpen(true);
		else setIsContactModalOpen(true);
	};

	const actionLabel = isPropertiesPage
		? "Add Property"
		: isTopicsPage
			? "Create Topic"
			: isGroupsPage
				? "Create Group"
				: "Add Contact";

	return (
		<div>
			<div className="sticky top-0 z-10 flex h-12 items-center justify-start gap-2 border-stroke-soft-100 border-b bg-bg-white-0 px-2">
				<div className="flex w-full items-center justify-between">
					<div className="flex items-center gap-2">
						<Icon name="users" className="h-4 w-4" />
						<p className="font-medium text-sm">Contacts</p>
					</div>
					<div className="flex items-center justify-end">
						<FeedbackPopover />
						<ContactsApiDetails />
						<DocsButton />
					</div>
				</div>
			</div>
			<div className="mx-auto max-w-3xl sm:px-8">
				{/* Unified Header */}
				{!isContactDetailPage && (
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
							<h1 className="mt-2 font-medium text-2xl">{title}</h1>
						</div>
						{!isAddTopicPage && !isBulkImportPage && (
							<div className="flex items-center gap-2 self-end">
								<Button.Root
									variant="neutral"
									size="xsmall"
									onClick={handleAction}
								>
									<Icon name="plus" className="h-4 w-4" />
									{actionLabel}
								</Button.Root>
							</div>
						)}
					</div>
				)}

				{!isContactDetailPage && (
					<div className="mt-2">
						<ContactsTabs />
					</div>
				)}
				<div className={!isContactDetailPage ? "mt-4" : ""}>{children}</div>
			</div>

			{/* Modals */}
			<AddContactModal
				open={isContactModalOpen}
				onOpenChange={setIsContactModalOpen}
				topicId={topicId || undefined}
			/>
			<AddPropertyModal
				open={isPropertyModalOpen}
				onOpenChange={setIsPropertyModalOpen}
			/>
			<CreateTopicModal
				open={isTopicModalOpen}
				onOpenChange={setIsTopicModalOpen}
			/>
			<CreateGroupModal
				open={isGroupModalOpen}
				onOpenChange={setIsGroupModalOpen}
			/>
		</div>
	);
};

export default ContactsLayout;
