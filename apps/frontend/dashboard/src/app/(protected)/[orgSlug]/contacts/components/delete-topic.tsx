"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Kbd from "@reloop/ui/kbd";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { useParams } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface Topic {
	id: string;
	name: string;
	description: string | null;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface DeleteTopicModalProps {
	topics: Topic[];
}

export const DeleteTopicModal = ({ topics }: DeleteTopicModalProps) => {
	const { orgSlug } = useParams();
	const [deleteId, setDeleteId] = useQueryState("delete");
	const [isDeleting, setIsDeleting] = useState(false);
	const [confirmationText, setConfirmationText] = useState("");
	const [isCopied, setIsCopied] = useState(false);
	const { mutate } = useSWRConfig();

	const topicToDelete = topics.find((topic) => topic.id === deleteId);

	useEffect(() => {
		if (isCopied) {
			const timer = setTimeout(() => {
				setIsCopied(false);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [isCopied]);

	const handleClose = () => {
		setDeleteId(null);
		setConfirmationText("");
	};

	const handleDelete = async () => {
		if (!topicToDelete) return;

		setIsDeleting(true);
		try {
			await axios.delete(`/api/contacts/v1/topics/${topicToDelete.id}`, {
				withCredentials: true,
			});

			toast.success(`${topicToDelete.name} deleted successfully`);

			if (orgSlug) {
				window.location.href = `/dashboard/${orgSlug}/topics`;
				return;
			}
			handleClose();
			mutate(
				(key: string) =>
					typeof key === "string" && key.startsWith("/api/contacts/v1/topics"),
			);
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to delete topic"
				: "Failed to delete topic";
			toast.error(errorMessage);
			setIsDeleting(false);
		}
	};

	return (
		<Modal.Root
			open={!!deleteId}
			onOpenChange={(open) => {
				if (!open) {
					handleClose();
				}
			}}
		>
			<Modal.Content
				className="rounded-2xl border border-stroke-soft-100/50 p-0.5 sm:max-w-[480px]"
				showClose={true}
			>
				<div className="rounded-2xl border border-stroke-soft-100/50">
					<Modal.Header className="before:border-stroke-soft-200/50">
						<div className="flex-1">
							<Modal.Title className="text-sm">Delete Topic</Modal.Title>
						</div>
					</Modal.Header>
					<Modal.Body className="space-y-4">
						<div className="flex flex-col gap-1">
							<p className="text-paragraph-sm text-text-sub-600">
								Are you sure you want to delete this topic?
							</p>
							<p className="font-medium text-error-base text-paragraph-sm">
								This will permanently delete the topic and unsubscribe all
								contacts from it.
							</p>
						</div>
						<div className="flex flex-col gap-2">
							<p className="text-paragraph-sm text-text-strong-950">
								Type{" "}
								<span className="inline-flex items-center gap-1 rounded-md border border-stroke-soft-200 bg-bg-weak-50 px-2 py-0.5 font-mono text-paragraph-xs text-text-strong-950">
									{topicToDelete?.name}
									<button
										type="button"
										onClick={async () => {
											try {
												await navigator.clipboard.writeText(
													topicToDelete?.name || "",
												);
												setIsCopied(true);
											} catch {
												toast.error("Failed to copy topic name");
											}
										}}
										className="text-text-sub-600 transition-colors hover:text-text-strong-950"
									>
										<Icon
											name={isCopied ? "check" : "copy"}
											className={`h-3 w-3 ${isCopied ? "text-success-base" : ""}`}
										/>
									</button>
								</span>{" "}
								to confirm.
							</p>
							<Input.Root size="small">
								<Input.Wrapper>
									<Input.Input
										type="text"
										value={confirmationText}
										onChange={(e) => setConfirmationText(e.target.value)}
										placeholder="Enter topic name"
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
					</Modal.Body>
					<Modal.Footer className="mt-4 justify-end border-stroke-soft-100/50">
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={handleClose}
							disabled={isDeleting}
						>
							Cancel
							<Kbd.Root className="bg-bg-weak-50 text-[10px]">Esc</Kbd.Root>
						</Button.Root>
						<Button.Root
							variant="error"
							size="small"
							onClick={handleDelete}
							disabled={isDeleting || confirmationText !== topicToDelete?.name}
						>
							{isDeleting ? (
								<>
									<Spinner size={16} />
									Deleting...
								</>
							) : (
								"Delete Topic"
							)}
						</Button.Root>
					</Modal.Footer>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
