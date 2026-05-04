"use client";

import * as Button from "@reloop/ui/button";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { CollabPresence } from "./collobration/Collabpresence";
import { ConnectionStatus } from "./collobration/ConnectionStatus";
import type { ConnectionStatus as ConnectionStatusType } from "./collobration/hooks/useCollaboration";

interface EditorHeaderActionsProps {
	connectionStatus: ConnectionStatusType;
	isSynced: boolean;
}

export const EditorHeaderActions = ({
	connectionStatus,
	isSynced,
}: EditorHeaderActionsProps) => {
	const params = useParams<{ templateId: string }>();
	const templateId = params?.templateId;
	const router = useRouter();
	const [isPublishing, setIsPublishing] = useState(false);

	const handlePublish = async () => {
		if (!templateId) return;
		setIsPublishing(true);
		try {
			await fetch(`/api/template/v1/${templateId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: "published" }),
				credentials: "include",
			});
			// Optionally show success toast
		} catch (error) {
			console.error("Failed to publish template:", error);
		} finally {
			setIsPublishing(false);
		}
	};

	const handleDelete = async () => {
		if (
			!templateId ||
			!confirm("Are you sure you want to delete this template?")
		)
			return;

		try {
			await fetch(`/api/template/v1/${templateId}`, {
				method: "DELETE",
				credentials: "include",
			});
			router.push("/templates");
		} catch (error) {
			console.error("Failed to delete template:", error);
		}
	};

	return (
		<div className="flex items-center gap-4">
			<CollabPresence />
			<ConnectionStatus status={connectionStatus} isSynced={isSynced} />
			<Dropdown.Root>
				<Dropdown.Trigger asChild>
					<Button.Root variant="neutral" mode="ghost" size="xxsmall">
						<Icon name="more-horizontal" className="h-4 w-4" />
					</Button.Root>
				</Dropdown.Trigger>
				<Dropdown.Content align="end" className="w-48">
					<Dropdown.Item
						onClick={() => {
							/* Duplicate logic */
						}}
					>
						<Icon name="copy" className="h-4 w-4" />
						Duplicate
					</Dropdown.Item>
					<Dropdown.Separator />
					<Dropdown.Item onClick={handleDelete} className="text-red-600">
						<Icon name="trash" className="h-4 w-4" />
						Delete
					</Dropdown.Item>
				</Dropdown.Content>
			</Dropdown.Root>
			<Button.Root
				variant="primary"
				size="xsmall"
				onClick={handlePublish}
				disabled={isPublishing}
			>
				{isPublishing ? "Publishing..." : "Publish"}
			</Button.Root>
		</div>
	);
};
