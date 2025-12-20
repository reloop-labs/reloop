"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useState } from "react";
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

	const descriptionLength = description.length;
	const isDescriptionOverLimit = descriptionLength > MAX_DESCRIPTION_LENGTH;

	// Reset state when modal closes
	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			setName("");
			setDescription("");
			setNameError(null);
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
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		if (isDescriptionOverLimit) {
			toast.error("Description exceeds maximum length");
			return;
		}

		setIsCreating(true);
		try {
			const response = await fetch("/api/contacts/v1/topics/add", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: name.trim(),
					description: description.trim() || null,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || "Failed to create topic");
			}

			toast.success("Topic created successfully");
			handleOpenChange(false);
			await mutate(
				(key: string) =>
					typeof key === "string" &&
					key.includes("/api/contacts/v1/topics/list"),
			);
		} catch (error) {
			console.error("Failed to create topic:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to create topic",
			);
		} finally {
			setIsCreating(false);
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
							<Icon name="notification-indicator" className="h-4 w-4" />
						</div>
						<div className="flex-1">
							<Modal.Title>Create Topic</Modal.Title>
							<p className="mt-0.5 text-paragraph-xs text-text-sub-600">
								Create a new topic to organize your contacts
							</p>
						</div>
					</Modal.Header>
					<form onSubmit={handleSubmit} className="flex flex-col">
						<Modal.Body className="relative space-y-4">
							{/* Form Section */}
							<div className="space-y-4">
								<div className="border-stroke-soft-200/50 border-b border-dashed pb-4">
									<h3 className="font-medium text-text-strong-950">
										Topic Details
									</h3>
									<p className="mt-1 text-paragraph-xs text-text-sub-600">
										Give your topic a name and description
									</p>
								</div>

								{/* Topic Name - relative container for Pro Tip positioning */}
								<div className="relative flex flex-col gap-1.5">
									<Label.Root htmlFor="topic-name">
										Topic Name
										<span className="text-primary-base">*</span>
									</Label.Root>
									<input
										id="topic-name"
										type="text"
										value={name}
										onChange={(e) => {
											setName(e.target.value);
											if (nameError) setNameError(null);
										}}
										placeholder="e.g., Product Updates"
										className="w-full rounded-xl bg-bg-white-0 px-3 py-2.5 text-paragraph-sm text-text-strong-950 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset transition duration-200 ease-out placeholder:text-text-soft-400 hover:bg-bg-weak-50 hover:ring-transparent focus:shadow-button-important-focus focus:outline-none focus:ring-stroke-strong-950 focus:hover:bg-bg-white-0 focus:hover:ring-stroke-strong-950"
										disabled={isCreating}
									/>
									{nameError && (
										<p className="text-error-base text-paragraph-xs">
											{nameError}
										</p>
									)}

									{/* Pro Tip - Absolutely positioned at top-right of Topic Name */}
									<div className="-top-28 absolute right-40 z-10 w-[160px] translate-x-full">
										<div className="relative pb-3">
											{/* Rounded bubble */}
											<div className="relative overflow-hidden rounded-[24px] border border-neutral-300/40 bg-white/60 p-4 shadow-black/10 shadow-lg backdrop-blur-lg dark:border-neutral-600/40 dark:bg-neutral-800/80">
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
												<p className="mt-2 whitespace-nowrap text-[11px] text-text-sub-600">
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
								<div className="flex flex-col gap-1.5">
									<Label.Root
										htmlFor="topic-description"
										className="text-text-sub-600"
									>
										Description (Optional)
									</Label.Root>
									<div className="">
										<textarea
											id="topic-description"
											value={description}
											onChange={(e) => setDescription(e.target.value)}
											placeholder="Describe this topic..."
											rows={4}
											className="w-full resize-y rounded-xl bg-bg-white-0 px-3 py-2.5 text-paragraph-sm text-text-strong-950 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset transition duration-200 ease-out placeholder:text-text-soft-400 hover:bg-bg-weak-50 hover:ring-transparent focus:shadow-button-important-focus focus:outline-none focus:ring-stroke-strong-950 focus:hover:bg-bg-white-0 focus:hover:ring-stroke-strong-950"
											disabled={isCreating}
										/>
										<span
											className={`absolute right-3 bottom-2 text-paragraph-xs ${
												isDescriptionOverLimit
													? "text-error-base"
													: "text-text-soft-400"
											}`}
										>
											{descriptionLength}/{MAX_DESCRIPTION_LENGTH}
										</span>
									</div>
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
										<Icon name="enter" className="h-4 w-4" />
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
