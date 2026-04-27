"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Modal from "@reloop/ui/modal";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
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
	const pathname = usePathname();
	const router = useRouter();

	const [modal, setModal] = useQueryState("modal");
	const [id, setId] = useQueryState("id");
	const [isDeleting, setIsDeleting] = useState(false);
	const [confirmationText, setConfirmationText] = useState("");
	const [isCopied, setIsCopied] = useState(false);
	const { mutate } = useSWRConfig();

	const isOpen = modal === "delete-topic";
	const topicToDelete = topics.find((topic) => topic.id === id);

	useEffect(() => {
		if (isCopied) {
			const timer = setTimeout(() => {
				setIsCopied(false);
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [isCopied]);

	// Reset confirmation when modal closes or topic changes
	useEffect(() => {
		if (!isOpen) {
			setConfirmationText("");
		}
	}, [isOpen]);

	const handleClose = () => {
		setModal(null);
		setId(null);
		setConfirmationText("");
	};

	const handleDelete = async () => {
		if (!topicToDelete) return;
		if (confirmationText !== topicToDelete.name) {
			toast.error("Please enter the correct topic name to confirm deletion");
			return;
		}

		setIsDeleting(true);
		try {
			await axios.delete(`/api/contacts/v1/topics/${topicToDelete.id}`, {
				withCredentials: true,
			});

			toast.success(`${topicToDelete.name} deleted successfully`);

			const isTopicDetailPage = pathname?.includes(`/${topicToDelete.id}`);

			handleClose();

			if (isTopicDetailPage) {
				router.push("/contacts/topics");
			} else {
				mutate(
					(key: string) =>
						typeof key === "string" &&
						key.startsWith("/api/contacts/v1/topics"),
				);
			}
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to delete topic"
				: "Failed to delete topic";
			toast.error(errorMessage);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<Modal.Root
			open={isOpen}
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
							<Modal.Title>Delete Topic</Modal.Title>
						</div>
					</Modal.Header>

					{!topicToDelete && isOpen ? (
						<div className="flex h-[200px] flex-col items-center justify-center space-y-4 p-8 text-center">
							<Icon
								name="loader-2"
								className="h-8 w-8 animate-spin text-text-sub-600"
							/>
							<p className="text-sm text-text-sub-600">
								Loading topic details...
							</p>
						</div>
					) : topicToDelete ? (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								if (confirmationText === topicToDelete.name && !isDeleting) {
									handleDelete();
								}
							}}
						>
							<Modal.Body className="space-y-4">
								<div>
									<p className="text-sm text-text-sub-600">
										Are you sure you want to delete this topic?
									</p>
									<p className="mt-1 font-medium text-error-base text-sm">
										This will permanently delete the topic and unsubscribe all
										contacts from it.
									</p>
								</div>

								<div className="space-y-2">
									<p className="text-sm text-text-strong-950">
										Type{" "}
										<span className="inline-flex max-w-xs items-center gap-1 truncate rounded-md border border-stroke-soft-100 bg-bg-weak-50/50 px-2 py-1 font-mono text-text-strong-950 text-xs">
											{topicToDelete.name}
											<button
												type="button"
												onClick={async () => {
													try {
														await navigator.clipboard.writeText(
															topicToDelete.name,
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
												className="px-2"
												value={confirmationText}
												onChange={(e) => setConfirmationText(e.target.value)}
												placeholder="Enter topic name"
											/>
										</Input.Wrapper>
									</Input.Root>
								</div>
							</Modal.Body>
							<Modal.Footer className="mt-4 flex items-center justify-end gap-3 border-stroke-soft-100/50">
								<Button.Root
									type="button"
									variant="neutral"
									mode="stroke"
									size="xsmall"
									onClick={handleClose}
									disabled={isDeleting}
								>
									Cancel
									<KbdEsc />
								</Button.Root>
								<Button.Root
									type="submit"
									variant="error"
									size="xsmall"
									disabled={
										confirmationText !== topicToDelete.name || isDeleting
									}
								>
									{isDeleting ? (
										<>
											<Icon name="loader-2" className="h-4 w-4 animate-spin" />
											Deleting...
										</>
									) : (
										"Delete Topic"
									)}
								</Button.Root>
							</Modal.Footer>
						</form>
					) : null}
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
