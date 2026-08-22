"use client";

import { parseAsString, useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import { AddAgentAddressModal } from "./components/add-agent-address-modal";
import { useAgentInbox } from "./components/agent-inbox-provider";
import { AgentInboxLayoutWrapper } from "./components/layout/agent-inbox-layout-wrapper";
import { ListPanelSkeleton } from "./components/mail-list/list-panel-skeleton";
import { AgentInboxEmptyState } from "./components/shared/empty-state";
import { SectionError } from "./components/shared/section-error";
import {
	AgentFolderPage,
	ArchiveFolderPage,
	DraftsFolderPage,
	InboxFolderPage,
	LabelFolderPage,
	NeedsApprovalFolderPage,
	SentFolderPage,
	SpamFolderPage,
	StarredFolderPage,
	TrashFolderPage,
	YouFolderPage,
} from "./pages/mailbox-folder-pages";

export function AgentInboxPage() {
	const { mailboxes, isLoadingMailboxes, mailboxesError, retryMailboxes } =
		useAgentInbox();
	const [mailboxIdParam] = useQueryState(
		"mailboxId",
		parseAsString.withDefault(""),
	);
	const [folderParam] = useQueryState(
		"folder",
		parseAsString.withDefault("inbox"),
	);
	const [isAddOpen, setIsAddOpen] = useState(false);

	const activeMailbox = useMemo(() => {
		if (!mailboxes || mailboxes.length === 0) return undefined;
		if (mailboxIdParam) {
			const found = mailboxes.find((m) => m.id === mailboxIdParam);
			if (found) return found;
		}
		return mailboxes[0];
	}, [mailboxes, mailboxIdParam]);

	if (isLoadingMailboxes && (!mailboxes || mailboxes.length === 0)) {
		return (
			<div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-panel-light p-4 dark:bg-panel-dark">
				<ListPanelSkeleton className="min-h-0 flex-1 shadow-none" />
			</div>
		);
	}

	if (mailboxesError && (!mailboxes || mailboxes.length === 0)) {
		return (
			<div className="flex h-full min-h-0 flex-1 items-center justify-center p-6 bg-panel-light dark:bg-panel-dark">
				<SectionError
					message="Couldn't load mailboxes"
					onRetry={() => void retryMailboxes()}
				/>
			</div>
		);
	}

	if (!isLoadingMailboxes && (!mailboxes || mailboxes.length === 0)) {
		return (
			<div className="flex h-full min-h-0 flex-1 items-center justify-center p-6 bg-panel-light dark:bg-panel-dark">
				<AgentInboxEmptyState onAddClick={() => setIsAddOpen(true)} />
				<AddAgentAddressModal
					isOpen={isAddOpen}
					onClose={() => setIsAddOpen(false)}
				/>
			</div>
		);
	}

	if (!activeMailbox) return null;

	const renderFolderContent = () => {
		if (folderParam === "drafts") {
			return <DraftsFolderPage />;
		}
		if (folderParam === "agent") {
			return <AgentFolderPage />;
		}
		if (folderParam === "starred") {
			return <StarredFolderPage />;
		}
		if (folderParam === "sent") {
			return <SentFolderPage />;
		}
		if (folderParam === "you") {
			return <YouFolderPage />;
		}
		if (folderParam === "spam") {
			return <SpamFolderPage />;
		}
		if (folderParam === "archive") {
			return <ArchiveFolderPage />;
		}
		if (folderParam === "trash") {
			return <TrashFolderPage />;
		}
		if (folderParam === "needs_approval") {
			return <NeedsApprovalFolderPage />;
		}
		if (folderParam.startsWith("label:")) {
			return <LabelFolderPage labelId={folderParam.slice(6)} />;
		}
		return <InboxFolderPage />;
	};

	return (
		<AgentInboxLayoutWrapper mailbox={activeMailbox} folder={folderParam}>
			{renderFolderContent()}
		</AgentInboxLayoutWrapper>
	);
}
