"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdCommand } from "@reloop/ui/kbd-command";
import { KbdEnter } from "@reloop/ui/kbd-enter";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import * as Switch from "@reloop/ui/switch";
import * as Textarea from "@reloop/ui/textarea";
import * as Tooltip from "@reloop/ui/tooltip";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface Channel {
	id: string;
	name: string;
	description: string | null;
	defaultSubscription?: "opt_in" | "opt_out";
	visibility?: "private" | "public";
}

interface EditChannelModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	channel: Channel | null;
}

const MAX_DESCRIPTION_LENGTH = 500;

export const EditChannelModal = ({
	open,
	onOpenChange,
	channel,
}: EditChannelModalProps) => {
	const { mutate } = useSWRConfig();
	const [isSaving, setIsSaving] = useState(false);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [nameError, setNameError] = useState<string | null>(null);
	const [visibility, setVisibility] = useState<"private" | "public">("private");
	const formRef = useRef<HTMLFormElement>(null);

	// Populate form when channel changes
	useEffect(() => {
		if (channel && open) {
			setName(channel.name);
			setDescription(channel.description || "");
			setVisibility(channel.visibility || "private");
			setNameError(null);
		}
	}, [channel, open]);

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
			setNameError("Channel name is required");
			return false;
		}
		setNameError(null);
		return true;
	};

	const handleSubmit = useCallback(
		async (e?: React.FormEvent) => {
			e?.preventDefault();

			if (!channel) return;

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
					`/api/contacts/v1/channels/${channel.id}`,
					{
						name: name.trim(),
						description: description.trim() || undefined,
						visibility,
					},
					{ withCredentials: true },
				);

				toast.success("Channel updated successfully");
				handleOpenChange(false);
				await mutate(
					(key: string) =>
						typeof key === "string" && key.includes("/api/contacts/v1/channels"),
				);
			} catch (error) {
				console.error("Failed to update channel:", error);
				const errorMessage = axios.isAxiosError(error)
					? error.response?.data?.message || "Failed to update channel"
					: "Failed to update channel";
				toast.error(errorMessage);
			} finally {
				setIsSaving(false);
			}
		},
		[channel, name, description, visibility, isDescriptionOverLimit, mutate],
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
							<Modal.Title>Edit Channel</Modal.Title>
						</div>
					</Modal.Header>
					<form ref={formRef} onSubmit={handleSubmit} className="flex flex-col">
						<Modal.Body className="relative space-y-4">
							{/* Form Section */}
							<div className="space-y-4">
								{/* Channel Name */}
								<div className="relative flex flex-col gap-1.5">
									<Label.Root htmlFor="edit-channel-name">
										Channel Name
										<span className="text-primary-base">*</span>
									</Label.Root>
									<Input.Root size="small">
										<Input.Wrapper>
											<Input.Input
												id="edit-channel-name"
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
											htmlFor="edit-channel-description"
											className="text-text-sub-600"
										>
											Description (Optional)
										</Label.Root>
									</div>
									<Textarea.Root
										simple
										id="edit-channel-description"
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										placeholder="Describe this channel..."
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

							{/* Settings Section */}
							<div className="mt-2 space-y-3">
								{/* Default Subscription Toggle (Read-only) */}
								<div className="flex items-center justify-between rounded-xl border border-stroke-soft-200 p-3 opacity-60">
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
													Default Subscription
												</p>
												<Tooltip.Root>
													<Tooltip.Trigger asChild>
														<button type="button" className="text-text-sub-600">
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
																<span className="font-semibold">Opt In:</span>{" "}
																All new contacts are automatically added to this
																channel.
															</p>
															<p className="text-paragraph-xs">
																<span className="font-semibold">Opt Out:</span>{" "}
																Contacts must be added manually to this channel.
															</p>
														</div>
													</Tooltip.Content>
												</Tooltip.Root>
											</div>
											<p className="text-paragraph-xs text-text-sub-600">
												{channel?.defaultSubscription === "opt_in"
													? "New contacts are automatically enrolled"
													: "Contacts must be manually enrolled"}
											</p>
										</div>
									</div>
									<Switch.Root
										checked={channel?.defaultSubscription === "opt_in"}
										disabled={true}
										checkedColor="#22c55e"
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
													Public Channel
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
													? "Channel is visible to everyone"
													: "Channel is only visible to your team"}
											</p>
										</div>
									</div>
									<Switch.Root
										checked={visibility === "public"}
										onCheckedChange={(checked) =>
											setVisibility(checked ? "public" : "private")
										}
										disabled={isSaving}
										checkedColor="orange"
									/>
								</div>
							</div>
						</Modal.Body>
						<Modal.Footer className="mt-4 flex items-center justify-end gap-3 border-stroke-soft-100/50">
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								size="xsmall"
								onClick={() => handleOpenChange(false)}
								disabled={isSaving}
							>
								Cancel
								<KbdEsc />
							</Button.Root>
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
											<KbdCommand />
											<KbdEnter />
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
