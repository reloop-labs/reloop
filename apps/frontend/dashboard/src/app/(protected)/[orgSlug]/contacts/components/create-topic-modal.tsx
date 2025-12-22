"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";

import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import * as Switch from "@reloop/ui/switch";
import * as Textarea from "@reloop/ui/textarea";
import * as Tooltip from "@reloop/ui/tooltip";
import axios from "axios";
import { useCallback, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface CreateTopicModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const MAX_DESCRIPTION_LENGTH = 500;

export const CreateTopicModal = ({
	open,
	onOpenChange,
}: CreateTopicModalProps) => {
	const { mutate } = useSWRConfig();
	const [isCreating, setIsCreating] = useState(false);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [nameError, setNameError] = useState<string | null>(null);
	const [autoEnroll, setAutoEnroll] = useState<"enrolled" | "unenrolled">(
		"enrolled",
	);
	const [visibility, setVisibility] = useState<"private" | "public">("private");
	const formRef = useRef<HTMLFormElement>(null);

	const descriptionLength = description.length;
	const isDescriptionOverLimit = descriptionLength > MAX_DESCRIPTION_LENGTH;

	// Reset state when modal closes
	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			setName("");
			setDescription("");
			setNameError(null);
			setAutoEnroll("enrolled");
			setVisibility("private");
		}
		onOpenChange(isOpen);
	};

	// Validate form
	const validateForm = (): boolean => {
		if (!name.trim()) {
			setNameError("Topic name is required");
			return false;
		}
		setNameError(null);
		return true;
	};

	// Handle form submission
	const handleSubmit = useCallback(
		async (e?: React.FormEvent) => {
			e?.preventDefault();

			if (!validateForm()) {
				return;
			}

			if (isDescriptionOverLimit) {
				toast.error("Description exceeds maximum length");
				return;
			}

			setIsCreating(true);
			try {
				await axios.post(
					"/api/contacts/v1/topics/add",
					{
						name: name.trim(),
						description: description.trim() || undefined,
						autoEnroll,
						visibility,
					},
					{ headers: { credentials: "include" } },
				);

				toast.success("Topic created successfully");
				handleOpenChange(false);
				await mutate(
					(key: string) =>
						typeof key === "string" &&
						key.includes("/api/contacts/v1/topics/list"),
				);
			} catch (error) {
				console.error("Failed to create topic:", error);
				const errorMessage = axios.isAxiosError(error)
					? error.response?.data?.message || "Failed to create topic"
					: "Failed to create topic";
				toast.error(errorMessage);
			} finally {
				setIsCreating(false);
			}
		},
		[
			name,
			description,
			autoEnroll,
			visibility,
			isDescriptionOverLimit,
			mutate,
			handleOpenChange,
		],
	);

	// Command/Ctrl + Enter to submit
	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (open && !isCreating && name.trim() && !isDescriptionOverLimit) {
				handleSubmit();
			}
		},
		{ enableOnFormTags: true, enabled: open },
		[open, isCreating, name, isDescriptionOverLimit, handleSubmit],
	);

	return (
		<Modal.Root open={open} onOpenChange={handleOpenChange}>
			<Modal.Content
				className="rounded-2xl border border-stroke-soft-100/50 p-0.5 sm:max-w-[480px]"
				showClose={true}
			>
				<div className="rounded-2xl border border-stroke-soft-100/50">
					<Modal.Header className="before:border-stroke-soft-200/50">
						<div className="flex items-center justify-center">
							<Icon name="notification-indicator" className="h-4 w-4" />
						</div>
						<div className="flex-1">
							<Modal.Title>Create Topic</Modal.Title>
							<p className="mt-0.5 text-paragraph-xs text-text-sub-600">
								Create a new topic to organize your contacts
							</p>
						</div>
					</Modal.Header>
					<form ref={formRef} onSubmit={handleSubmit} className="flex flex-col">
						<Modal.Body className="relative space-y-4">
							{/* Form Section */}
							<div className="space-y-4">
								{/* Topic Name - relative container for Pro Tip positioning */}
								<div className="relative flex flex-col gap-1.5">
									<Label.Root htmlFor="topic-name">
										Topic Name
										<span className="text-primary-base">*</span>
									</Label.Root>
									<Input.Root size="small">
										<Input.Wrapper>
											<Input.Input
												id="topic-name"
												type="text"
												value={name}
												onChange={(e) => {
													setName(e.target.value);
													if (nameError) setNameError(null);
												}}
												placeholder="e.g., Product Updates"
												disabled={isCreating}
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
											htmlFor="topic-description"
											className="text-text-sub-600"
										>
											Description (Optional)
										</Label.Root>
									</div>
									<Textarea.Root
										simple
										id="topic-description"
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										placeholder="Describe this topic..."
										rows={2}
										disabled={isCreating}
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

							{/* Settings Section */}
							<div className="mt-2 space-y-3">
								{/* Auto Enroll Toggle */}
								<div className="flex items-center justify-between rounded-xl border border-stroke-soft-200 p-3">
									<div className="flex items-center gap-3">
										<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-weak-50">
											<Icon
												name="user-plus"
												className="h-4 w-4 text-text-sub-600"
											/>
										</div>
										<div>
											<div className="flex items-center gap-1">
												<p className="font-medium text-paragraph-sm text-text-strong-950">
													Auto Enroll Contacts
												</p>
												<Tooltip.Root>
													<Tooltip.Trigger asChild>
														<button
															type="button"
															className="text-text-sub-600 hover:text-text-strong-950"
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
																Contacts must be added manually to this topic.
															</p>
														</div>
													</Tooltip.Content>
												</Tooltip.Root>
											</div>
											<p className="text-paragraph-xs text-text-sub-600">
												{autoEnroll === "enrolled"
													? "New contacts are automatically enrolled"
													: "Contacts must be manually enrolled"}
											</p>
										</div>
									</div>
									<Switch.Root
										checked={autoEnroll === "enrolled"}
										onCheckedChange={(checked) =>
											setAutoEnroll(checked ? "enrolled" : "unenrolled")
										}
										disabled={isCreating}
										checkedColor="orange"
									/>
								</div>

								{/* Visibility Toggle */}
								<div className="flex items-center justify-between rounded-xl border border-stroke-soft-200 p-3">
									<div className="flex items-center gap-3">
										<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-weak-50">
											<Icon
												name={visibility === "public" ? "globe" : "lock"}
												className="h-4 w-4 text-text-sub-600"
											/>
										</div>
										<div>
											<div className="flex items-center gap-1">
												<p className="font-medium text-paragraph-sm text-text-strong-950">
													Public Topic
												</p>
												<Tooltip.Root>
													<Tooltip.Trigger asChild>
														<button
															type="button"
															className="text-text-sub-600 hover:text-text-strong-950"
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
																Only visible on preferences page if contact is
																subscribed.
															</p>
															<p className="text-paragraph-xs">
																<span className="font-semibold">Public:</span>{" "}
																Always visible on preferences page for all
																contacts.
															</p>
														</div>
													</Tooltip.Content>
												</Tooltip.Root>
											</div>
											<p className="text-paragraph-xs text-text-sub-600">
												{visibility === "public"
													? "Topic is visible to everyone"
													: "Topic is only visible to your team"}
											</p>
										</div>
									</div>
									<Switch.Root
										checked={visibility === "public"}
										onCheckedChange={(checked) =>
											setVisibility(checked ? "public" : "private")
										}
										disabled={isCreating}
										checkedColor="orange"
									/>
								</div>
							</div>
						</Modal.Body>
						<Modal.Footer className="mt-4 justify-end border-stroke-soft-100/50">
							<Button.Root
								type="submit"
								variant="neutral"
								size="xsmall"
								disabled={isCreating || !name.trim() || isDescriptionOverLimit}
							>
								{isCreating ? (
									<>
										<Spinner size={14} color="currentColor" />
										Creating...
									</>
								) : (
									<>
										Create Topic
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
						</Modal.Footer>
					</form>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
