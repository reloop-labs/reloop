"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import * as Textarea from "@reloop/ui/textarea";
import * as Tooltip from "@reloop/ui/tooltip";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface Topic {
	id: string;
	name: string;
	description: string | null;
	autoEnroll?: "enrolled" | "unenrolled";
	visibility?: "private" | "public";
}

interface EditTopicModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	topic: Topic | null;
}

const MAX_DESCRIPTION_LENGTH = 500;

export const EditTopicModal = ({
	open,
	onOpenChange,
	topic,
}: EditTopicModalProps) => {
	const { mutate } = useSWRConfig();
	const [isSaving, setIsSaving] = useState(false);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [nameError, setNameError] = useState<string | null>(null);
	const [visibility, setVisibility] = useState<"private" | "public">("private");
	const formRef = useRef<HTMLFormElement>(null);

	// Populate form when topic changes
	useEffect(() => {
		if (topic && open) {
			setName(topic.name);
			setDescription(topic.description || "");
			setVisibility(topic.visibility || "private");
			setNameError(null);
		}
	}, [topic, open]);

	const descriptionLength = description.length;
	const isDescriptionOverLimit = descriptionLength > MAX_DESCRIPTION_LENGTH;

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			setName("");
			setDescription("");
			setNameError(null);
		}
		onOpenChange(isOpen);
	};

	const validateForm = (): boolean => {
		if (!name.trim()) {
			setNameError("Topic name is required");
			return false;
		}
		setNameError(null);
		return true;
	};

	const handleSubmit = useCallback(
		async (e?: React.FormEvent) => {
			e?.preventDefault();

			if (!topic) return;

			if (!validateForm()) {
				return;
			}

			if (isDescriptionOverLimit) {
				toast.error("Description exceeds maximum length");
				return;
			}

			setIsSaving(true);
			try {
				await axios.patch(
					`/api/contacts/v1/topics/${topic.id}`,
					{
						name: name.trim(),
						description: description.trim() || undefined,
						visibility,
					},
					{ withCredentials: true },
				);

				toast.success("Topic updated successfully");
				handleOpenChange(false);
				await mutate(
					(key: string) =>
						typeof key === "string" && key.includes("/api/contacts/v1/topics"),
				);
			} catch (error) {
				console.error("Failed to update topic:", error);
				const errorMessage = axios.isAxiosError(error)
					? error.response?.data?.message || "Failed to update topic"
					: "Failed to update topic";
				toast.error(errorMessage);
			} finally {
				setIsSaving(false);
			}
		},
		[topic, name, description, visibility, isDescriptionOverLimit, mutate],
	);

	// Enter to submit
	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (open && !isSaving && name.trim() && !isDescriptionOverLimit) {
				handleSubmit();
			}
		},
		{ enableOnFormTags: ["INPUT"] },
		[open, isSaving, name, isDescriptionOverLimit, handleSubmit],
	);

	const handleVisibilityClick = () => {
		if (!isSaving) {
			setVisibility(visibility === "public" ? "private" : "public");
		}
	};

	return (
		<Modal.Root open={open} onOpenChange={handleOpenChange}>
			<Modal.Content
				className="rounded-2xl border border-stroke-soft-100/50 p-0.5 sm:max-w-[480px]"
				showClose={true}
			>
				<div className="rounded-2xl border border-stroke-soft-100/50">
					<Modal.Header className="before:border-stroke-soft-200/50">
						<div className="flex items-center justify-center">
							<Icon name="edit-2" className="h-4 w-4" />
						</div>
						<div className="flex-1">
							<Modal.Title>Edit Topic</Modal.Title>
						</div>
					</Modal.Header>
					<form ref={formRef} onSubmit={handleSubmit} className="flex flex-col">
						<Modal.Body className="relative space-y-4">
							{/* Form Section */}
							<div className="space-y-4">
								{/* Topic Name */}
								<div className="relative flex flex-col gap-1.5">
									<Label.Root htmlFor="edit-topic-name">
										Topic Name
										<span className="text-primary-base">*</span>
									</Label.Root>
									<Input.Root size="small">
										<Input.Wrapper>
											<Input.Input
												id="edit-topic-name"
												type="text"
												value={name}
												onChange={(e) => {
													setName(e.target.value);
													if (nameError) setNameError(null);
												}}
												placeholder="e.g., Product Updates"
												disabled={isSaving}
											/>
										</Input.Wrapper>
									</Input.Root>
									{nameError && (
										<p className="text-error-base text-paragraph-xs">
											{nameError}
										</p>
									)}
								</div>

								{/* Description */}
								<div className="relative flex flex-col gap-1.5">
									<div className="flex items-center justify-between">
										<Label.Root
											htmlFor="edit-topic-description"
											className="text-text-sub-600"
										>
											Description (Optional)
										</Label.Root>
									</div>
									<Textarea.Root
										simple
										id="edit-topic-description"
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										placeholder="Describe this topic..."
										rows={2}
										disabled={isSaving}
										hasError={isDescriptionOverLimit}
										className="min-h-[60px] resize-none"
									/>
									<span
										className={`absolute right-1.5 bottom-0 text-subheading-2xs ${
											isDescriptionOverLimit
												? "text-error-base"
												: "text-text-soft-400"
										}`}
									>
										{descriptionLength}/{MAX_DESCRIPTION_LENGTH}
									</span>
								</div>
							</div>

							{/* Auto Enroll Option (Read-only) */}
							<div className="mt-4 border-stroke-soft-200/50">
								<div
									className={`w-full cursor-not-allowed rounded-xl border p-3 text-left opacity-60 ${
										topic?.autoEnroll === "enrolled"
											? "border-success-base/40 bg-success-lighter"
											: "border-stroke-soft-200 bg-bg-white-0"
									}`}
								>
									<div className="flex items-center justify-between">
										<div>
											<div className="flex items-center gap-1">
												<p
													className={`font-medium text-paragraph-sm ${
														topic?.autoEnroll === "enrolled"
															? "text-success-base"
															: "text-text-strong-950"
													}`}
												>
													Auto Enroll Contacts
												</p>
												<Tooltip.Root>
													<Tooltip.Trigger asChild>
														<button
															type="button"
															className={
																topic?.autoEnroll === "enrolled"
																	? "text-success-base"
																	: "text-text-sub-600"
															}
														>
															<Icon
																name="info-outline"
																className="h-3.5 w-3.5"
															/>
														</button>
													</Tooltip.Trigger>
													<Tooltip.Content
														side="top"
														variant="light"
														className="max-w-[280px] p-3"
														sideOffset={-2}
													>
														<div className="space-y-2">
															<p className="text-paragraph-xs">
																<span className="font-semibold">Enrolled:</span>{" "}
																All new contacts are automatically added to this
																topic.
															</p>
															<p className="text-paragraph-xs">
																<span className="font-semibold">
																	Unenrolled:
																</span>{" "}
																Contacts are not added by default. They must be
																added manually to this topic.
															</p>
														</div>
													</Tooltip.Content>
												</Tooltip.Root>
											</div>
											<p
												className={`mt-0.5 text-paragraph-xs ${
													topic?.autoEnroll === "enrolled"
														? "text-success-base"
														: "text-text-sub-600"
												}`}
											>
												{topic?.autoEnroll === "enrolled"
													? "New contacts are automatically enrolled"
													: "Contacts must be manually enrolled"}
											</p>
										</div>
										<div
											className={`flex h-5 w-5 items-center justify-center rounded ${
												topic?.autoEnroll === "enrolled"
													? "bg-success-base"
													: "border border-stroke-soft-200"
											}`}
										>
											{topic?.autoEnroll === "enrolled" && (
												<Icon name="check" className="h-3 w-3 text-white" />
											)}
										</div>
									</div>
								</div>
							</div>

							{/* Visibility Option */}
							<div>
								<button
									type="button"
									onClick={handleVisibilityClick}
									disabled={isSaving}
									className={`w-full cursor-pointer rounded-xl border p-3 text-left transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-neutral-300 ${
										visibility === "public"
											? "border-primary-base/40 bg-primary-lighter"
											: "border-stroke-soft-200 bg-bg-white-0 hover:bg-bg-weak-50"
									} ${isSaving ? "pointer-events-none opacity-50" : ""}`}
								>
									<div className="flex items-center justify-between">
										<div>
											<div className="flex items-center gap-1">
												<p
													className={`font-medium text-paragraph-sm ${
														visibility === "public"
															? "text-primary-base"
															: "text-text-strong-950"
													}`}
												>
													Public Topic
												</p>
												<Tooltip.Root>
													<Tooltip.Trigger asChild>
														<button
															type="button"
															onClick={(e) => e.stopPropagation()}
															className={
																visibility === "public"
																	? "text-primary-base"
																	: "text-text-sub-600 hover:text-text-strong-950"
															}
														>
															<Icon
																name="info-outline"
																className="h-3.5 w-3.5"
															/>
														</button>
													</Tooltip.Trigger>
													<Tooltip.Content
														side="top"
														variant="light"
														className="max-w-[220px] p-3"
														sideOffset={-2}
													>
														<div className="space-y-2">
															<p className="text-paragraph-xs">
																<span className="font-semibold">Private:</span>{" "}
																Only visible on the email preferences page if
																the contact is subscribed to it.
															</p>
															<p className="text-paragraph-xs">
																<span className="font-semibold">Public:</span>{" "}
																Always visible on the email preferences page for
																all contacts.
															</p>
														</div>
													</Tooltip.Content>
												</Tooltip.Root>
											</div>
											<p
												className={`mt-0.5 text-paragraph-xs ${
													visibility === "public"
														? "text-primary-base"
														: "text-text-sub-600"
												}`}
											>
												{visibility === "public"
													? "Topic is visible to everyone"
													: "Topic is only visible to your team"}
											</p>
										</div>
										<div
											className={`flex h-5 w-5 items-center justify-center rounded ${
												visibility === "public"
													? "bg-primary-base"
													: "border border-stroke-soft-200"
											}`}
										>
											{visibility === "public" && (
												<Icon name="check" className="h-3 w-3 text-white" />
											)}
										</div>
									</div>
								</button>
							</div>
						</Modal.Body>
						<Modal.Footer className="mt-4 justify-end border-stroke-soft-100/50">
							<Button.Root
								type="submit"
								variant="neutral"
								size="xsmall"
								disabled={isSaving || !name.trim() || isDescriptionOverLimit}
							>
								{isSaving ? (
									<>
										<Spinner size={14} color="currentColor" />
										Updating...
									</>
								) : (
									<>
										Update
										<span className="inline-flex items-center gap-0.5">
											<Icon
												name="enter"
												className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
											/>
										</span>
									</>
								)}
							</Button.Root>
						</Modal.Footer>
					</form>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
