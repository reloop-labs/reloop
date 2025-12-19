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
				className="rounded-2xl border border-stroke-soft-100/50 p-0.5 sm:max-w-[720px]"
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
						<Modal.Body className="space-y-4">
							<div className="flex gap-6">
								{/* Form Section */}
								<div className="flex-1 space-y-4">
									<div className="border-stroke-soft-200/50 border-b border-dashed pb-4">
										<h3 className="font-medium text-text-strong-950">
											Topic Details
										</h3>
										<p className="mt-1 text-paragraph-xs text-text-sub-600">
											Give your topic a name and description
										</p>
									</div>

									{/* Topic Name */}
									<div className="flex flex-col gap-1.5">
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
									</div>

									{/* Description */}
									<div className="flex flex-col gap-1.5">
										<Label.Root
											htmlFor="topic-description"
											className="text-text-sub-600"
										>
											Description (Optional)
										</Label.Root>
										<div className="relative">
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

								{/* Pro Tip Section */}
								<div className="w-[220px] shrink-0">
									<div className="rounded-xl border border-stroke-soft-200/50 p-4">
										<div className="flex items-center gap-2">
											<Icon name="bulb" className="h-4 w-4 text-text-sub-600" />
											<span className="font-medium text-paragraph-xs text-text-sub-600 uppercase tracking-wide">
												Pro Tip
											</span>
										</div>
										<p className="mt-3 text-paragraph-sm text-text-sub-600">
											Use descriptive names for your topics
										</p>
										<div className="mt-3">
											<p className="text-paragraph-xs text-text-soft-400">
												Good examples:
											</p>
											<ul className="mt-1.5 space-y-1">
												<li className="flex items-center gap-2 text-paragraph-sm text-text-sub-600">
													<span className="h-1 w-1 rounded-full bg-text-sub-600" />
													Product Updates
												</li>
												<li className="flex items-center gap-2 text-paragraph-sm text-text-sub-600">
													<span className="h-1 w-1 rounded-full bg-text-sub-600" />
													Newsletter
												</li>
												<li className="flex items-center gap-2 text-paragraph-sm text-text-sub-600">
													<span className="h-1 w-1 rounded-full bg-text-sub-600" />
													Marketing Promotions
												</li>
											</ul>
										</div>
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
