"use client";

import { parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import { AgentInboxCommonUseCasesSidebar } from "./common-use-cases-sidebar";
import { useAgentInbox } from "./components/agent-inbox-provider";
import { CreateInboxInlineCard } from "./components/create-inbox-inline-card";
import { AgentInboxLayoutWrapper } from "./components/layout/agent-inbox-layout-wrapper";
import { AgentInboxContent } from "./components/mail-list/agent-inbox-content";
import { SectionError } from "./components/shared/section-error";
import { AgentMailboxListHeader } from "./list/agent-mailbox-list-header";
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
import type { AgentMailbox } from "./types";

const PLACEHOLDER_MAILBOX: AgentMailbox = {
	id: "loading",
	email: "",
	label: "",
	status: "active",
	securityLevel: 1,
	createdAt: "",
};

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

	const activeMailbox = useMemo(() => {
		if (!mailboxes || mailboxes.length === 0) return undefined;
		if (mailboxIdParam) {
			const found = mailboxes.find((m) => m.id === mailboxIdParam);
			if (found) return found;
		}
		return mailboxes[0];
	}, [mailboxes, mailboxIdParam]);

	// Always maintain layout during initial mailbox loading
	if (isLoadingMailboxes && (!mailboxes || mailboxes.length === 0)) {
		return (
			<AgentInboxLayoutWrapper
				mailbox={PLACEHOLDER_MAILBOX}
				folder={folderParam}
			>
				<AgentInboxContent
					mailbox={PLACEHOLDER_MAILBOX}
					folder={folderParam}
					threads={[]}
				/>
			</AgentInboxLayoutWrapper>
		);
	}

	if (mailboxesError && (!mailboxes || mailboxes.length === 0)) {
		return (
			<div className="flex h-full min-h-0 flex-1 items-center justify-center p-6">
				<SectionError
					message="Couldn't load mailboxes"
					onRetry={() => void retryMailboxes()}
				/>
			</div>
		);
	}

	if (!isLoadingMailboxes && (!mailboxes || mailboxes.length === 0)) {
		return (
			<div className="h-full flex-1 overflow-y-auto">
				<div className="mx-auto max-w-6xl space-y-6 p-6 lg:p-8">
					<AgentMailboxListHeader />

					<div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
						<div className="lg:col-span-7 xl:col-span-7">
							<CreateInboxInlineCard />
						</div>

						<div className="lg:col-span-5 xl:col-span-5">
							<AgentInboxCommonUseCasesSidebar />
						</div>
					</div>
				</div>
			</div>
		);
	}

	const currentMailbox = activeMailbox ?? PLACEHOLDER_MAILBOX;

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
		<AgentInboxLayoutWrapper mailbox={currentMailbox} folder={folderParam}>
			{renderFolderContent()}
		</AgentInboxLayoutWrapper>
	);
}
