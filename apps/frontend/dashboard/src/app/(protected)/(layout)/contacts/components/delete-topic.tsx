"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Modal from "@reloop/ui/modal";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";

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

	// Fetch contacts count for the topic
	const { data: contactsData, isLoading: isLoadingContacts } = useSWR<{
		total: number;
	}>(
		topicToDelete && isOpen
			? `/api/contacts/v1/topics/${topicToDelete.id}/contacts?limit=1`
			: null,
	);

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
			const timer = setTimeout(() => {
				setConfirmationText("");
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (isOpen && confirmationText === topicToDelete?.name && !isDeleting) {
				handleDelete();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: isOpen && !!topicToDelete },
		[isOpen, confirmationText, topicToDelete, isDeleting],
	);

	const handleClose = () => {
		setModal(null);
		setId(null);
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
						typeof key === "string" && key.startsWith("/api/contacts/v1/topics"),
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
				className="rounded-20 border-none p-0 sm:max-w-[480px]"
				showClose={true}
			>
				<div className="rounded-20 border border-stroke-soft-100/50 bg-bg-white-0">
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
							<div className="p-6">
								<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-error-base/10">
									<Icon name="trash" className="h-4 w-4 text-error-base" />
								</div>

								<Modal.Title className="font-medium text-text-strong-950 text-title-h5">
									Delete topic?
								</Modal.Title>
								<Modal.Description className="mb-6 text-pretty text-sm text-text-sub-600 leading-relaxed">
									This will permanently delete the topic. Any contacts enrolled
									in this topic will be unlinked but{" "}
									<span className="font-semibold text-text-strong-950">
										they will not be deleted
									</span>
									. This action cannot be undone.
								</Modal.Description>

								{/* Topic Stats Card */}
								<div className="mb-6 flex items-center gap-3 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/30">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error-base/10 text-error-base">
										<Icon name="notification-indicator" className="h-5 w-5" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium text-sm text-text-strong-950">
											{topicToDelete.name}
										</p>
										<p className="mt-0.5 truncate font-medium text-text-sub-600 text-xs">
											{isLoadingContacts ? (
												<span className="inline-flex items-center gap-1.5">
													<Icon
														name="loader-2"
														className="h-3 w-3 animate-spin"
													/>
													Loading contacts...
												</span>
											) : (
												<span>
													{contactsData?.total || 0} contact
													{contactsData?.total !== 1 ? "s" : ""} will be
													unlinked
												</span>
											)}
										</p>
									</div>
								</div>

								{/* Confirmation Input */}
								<div className="mb-2">
									<p className="mb-2 text-sm text-text-sub-600">
										Type{" "}
										<span className="inline-flex max-w-xs items-center gap-1 truncate rounded-[6px] border border-stroke-soft-100 bg-bg-weak-50/50 px-1.5 py-0.5 font-medium text-text-strong-950 text-xs dark:border-stroke-soft-100/40 dark:bg-bg-strong-200">
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
										to confirm
									</p>
									<Input.Root size="small" className="rounded-[10px]">
										<Input.Wrapper>
											<Input.Input
												type="text"
												value={confirmationText}
												onChange={(e) => setConfirmationText(e.target.value)}
												placeholder={topicToDelete.name}
											/>
										</Input.Wrapper>
									</Input.Root>
								</div>
							</div>

							<div className="flex flex-col-reverse justify-end gap-2 px-6 pb-6 sm:flex-row sm:items-center">
								<Button.Root
									type="button"
									variant="neutral"
									mode="stroke"
									onClick={handleClose}
									disabled={isDeleting}
									className="gap-1.5"
								>
									Cancel
									<span className="flex h-[19px] w-7 items-center justify-center rounded-[5px] border border-stroke-soft-100 bg-bg-weak-50/50 p-px font-medium text-[10px]">
										Esc
									</span>
								</Button.Root>
								<Button.Root
									type="submit"
									variant="error"
									disabled={isDeleting || confirmationText !== topicToDelete.name}
								>
									{isDeleting ? (
										"Deleting..."
									) : (
										<>
											Delete topic
											<span className="inline-flex items-center gap-0.5">
												<Icon
													name="command"
													className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
												/>
												<Icon
													name="enter"
													className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
												/>
											</span>
										</>
									)}
								</Button.Root>
							</div>
						</form>
					) : null}
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
