"use client";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";
import { DeleteTopicModal } from "../../contacts/components/delete-topic";
import { EditTopicModal } from "../../contacts/components/edit-topic-modal";
import { TopicHeader } from "./components/topic-header";

interface Topic {
	id: string;
	name: string;
	description: string | null;
	organizationId: string;
	autoEnroll?: "enrolled" | "unenrolled";
	visibility?: "private" | "public";
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

const TopicDetailPage = () => {
	const { topicId } = useParams();
	const { mutate } = useSWRConfig();
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [, setDeleteId] = useQueryState("delete");

	const {
		data: topicData,
		error: topicError,
		isLoading: topicLoading,
	} = useSWR<Topic>(`/api/contacts/v1/topics/${topicId}`, {
		revalidateOnFocus: true,
		revalidateOnReconnect: true,
	});

	const handleToggleVisibility = async (
		topicIdParam: string,
		currentValue: "private" | "public",
	) => {
		const newValue = currentValue === "public" ? "private" : "public";
		try {
			const response = await fetch(`/api/contacts/v1/topics/${topicIdParam}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ visibility: newValue }),
			});
			if (!response.ok) throw new Error("Failed to update visibility");
			toast.success(`Visibility set to ${newValue}`);
			mutate(
				(key: string) =>
					typeof key === "string" && key.startsWith("/api/contacts/v1/topics"),
			);
		} catch {
			toast.error("Failed to update visibility");
		}
	};

	const handleDelete = () => {
		if (topicData?.id) {
			setDeleteId(topicData.id);
		}
	};

	const handleEdit = () => {
		setIsEditModalOpen(true);
	};

	if (topicLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Spinner />
			</div>
		);
	}

	if (topicError) {
		return (
			<div className="mx-auto max-w-3xl sm:px-8">
				<div className="flex flex-col items-center justify-center gap-2 p-4">
					<Icon name="alert-circle" className="h-8 w-8 text-red-500" />
					<p className="text-center text-sm text-text-sub-600">
						Failed to load topic
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<TopicHeader
				topic={topicData}
				isLoading={topicLoading}
				isFailed={!!topicError}
				onDelete={handleDelete}
				onEdit={handleEdit}
				onToggleVisibility={handleToggleVisibility}
			/>

			{/* Edit Topic Modal */}
			<EditTopicModal
				open={isEditModalOpen}
				onOpenChange={setIsEditModalOpen}
				topic={topicData || null}
			/>

			{/* Delete Topic Modal */}
			<DeleteTopicModal topics={topicData ? [topicData] : []} />
		</div>
	);
};

export default TopicDetailPage;
