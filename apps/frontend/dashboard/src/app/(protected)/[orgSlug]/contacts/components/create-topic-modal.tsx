"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Kbd from "@reloop/ui/kbd";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import * as Textarea from "@reloop/ui/textarea";
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

	// Toggle card click handler
	const handleAutoEnrollClick = () => {
		if (!isCreating) {
			setAutoEnroll(autoEnroll === "enrolled" ? "unenrolled" : "enrolled");
		}
	};

	const handleVisibilityClick = () => {
		if (!isCreating) {
			setVisibility(visibility === "public" ? "private" : "public");
		}
	};

	return (
		<Modal.Root open={open} onOpenChange={handleOpenChange}>
			<Modal.Content
				className="rounded-2xl border border-stroke-soft-100/50 p-0.5 sm:max-w-[640px]"
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

									{/* Pro Tip - Absolutely positioned at top-right of Topic Name */}
									<div className="-top-[87px] absolute right-56 z-10 w-[160px] translate-x-full">
										<div className="relative pb-3">
											{/* Rounded bubble */}
											<div className="relative overflow-hidden rounded-[24px] border border-neutral-300/40 bg-white/60 p-3 shadow-black/10 shadow-lg backdrop-blur-lg dark:border-neutral-600/40 dark:bg-neutral-800/80">
												{/* Glass shine effect */}
												<div className="pointer-events-none absolute inset-0 rounded-[24px] bg-gradient-to-br from-white/50 via-transparent to-transparent dark:from-white/10" />

												{/* Header */}
												<div className="relative flex items-center gap-2">
													<Icon name="bulb" className="h-3 w-3" />
													<span className="font-semibold text-neutral-800 text-xs dark:text-neutral-200">
														Pro Tip
													</span>
												</div>

												{/* Content */}
												<p className="mt-1.5 whitespace-nowrap text-[11px] text-text-sub-600">
													Use descriptive names
												</p>

												{/* Examples */}
												<div className="relative mt-1.5 space-y-1 text-[10px] text-text-sub-600">
													<ul className="list-disc pl-5">
														<li>Product Updates</li>
														<li>Newsletter</li>
													</ul>
												</div>
											</div>

											{/* Bottom-left notch */}
											<div className="-bottom-0 absolute left-4">
												<svg
													width="20"
													height="16"
													viewBox="0 0 20 16"
													className="drop-shadow-sm"
												>
													<path
														d="M0 0 C0 0 4 0 10 0 L0 16 L0 0 Z"
														className="fill-white/60 dark:fill-neutral-800/80"
													/>
												</svg>
											</div>
										</div>
									</div>
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

							{/* Auto Enroll Option */}
							<div className="mt-4 border-stroke-soft-200/50">
								<button
									type="button"
									onClick={handleAutoEnrollClick}
									disabled={isCreating}
									className={`w-full cursor-pointer rounded-xl border p-3 text-left transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-neutral-300 ${
										autoEnroll === "enrolled"
											? "border-success-base/40 bg-success-lighter"
											: "border-stroke-soft-200 bg-bg-white-0 hover:bg-bg-weak-50"
									} ${isCreating ? "pointer-events-none opacity-50" : ""}`}
								>
									<div className="flex items-center justify-between">
										<div>
											<p
												className={`font-medium text-paragraph-sm ${
													autoEnroll === "enrolled"
														? "text-success-base"
														: "text-text-strong-950"
												}`}
											>
												Auto Enroll Contacts
											</p>
											<p
												className={`mt-0.5 text-paragraph-xs ${
													autoEnroll === "enrolled"
														? "text-success-base"
														: "text-text-sub-600"
												}`}
											>
												{autoEnroll === "enrolled"
													? "New contacts are automatically enrolled"
													: "Contacts must be manually enrolled"}
											</p>
										</div>
										<div
											className={`flex h-5 w-5 items-center justify-center rounded ${
												autoEnroll === "enrolled"
													? "bg-success-base"
													: "border border-stroke-soft-200"
											}`}
										>
											{autoEnroll === "enrolled" && (
												<Icon name="check" className="h-3 w-3 text-white" />
											)}
										</div>
									</div>
								</button>
							</div>

							{/* Visibility Option */}
							<div>
								<button
									type="button"
									onClick={handleVisibilityClick}
									disabled={isCreating}
									className={`w-full cursor-pointer rounded-xl border p-3 text-left transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-neutral-300 ${
										visibility === "public"
											? "border-primary-base/40 bg-primary-lighter"
											: "border-stroke-soft-200 bg-bg-white-0 hover:bg-bg-weak-50"
									} ${isCreating ? "pointer-events-none opacity-50" : ""}`}
								>
									<div className="flex items-center justify-between">
										<div>
											<p
												className={`font-medium text-paragraph-sm ${
													visibility === "public"
														? "text-primary-base"
														: "text-text-strong-950"
												}`}
											>
												Public Topic
											</p>
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
											<Kbd.Root className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px">
												⌘
											</Kbd.Root>
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
