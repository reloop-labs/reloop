"use client";

import * as Button from "@reloop/ui/button";
import * as Checkbox from "@reloop/ui/checkbox";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdCommand } from "@reloop/ui/kbd-command";
import { KbdEnter } from "@reloop/ui/kbd-enter";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import * as Textarea from "@reloop/ui/textarea";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";
import { CreateChannelPreview } from "./create-channel-preview";

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
	const { data: channelsData } = useSWR<{ channels: Channel[] }>(
		open ? "/api/contacts/v1/channels/list?limit=10" : null,
	);
	const [isSaving, setIsSaving] = useState(false);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [nameError, setNameError] = useState<string | null>(null);
	const [visibility, setVisibility] = useState<"private" | "public">("private");
	const [defaultSubscription, setDefaultSubscription] = useState<
		"opt_in" | "opt_out"
	>("opt_in");
	const formRef = useRef<HTMLFormElement>(null);

	// Populate form when channel changes
	useEffect(() => {
		if (channel && open) {
			setName(channel.name);
			setDescription(channel.description || "");
			setVisibility(channel.visibility || "private");
			setDefaultSubscription(channel.defaultSubscription || "opt_in");
			setNameError(null);
		}
	}, [channel, open]);

	const descriptionLength = description.length;
	const isDescriptionOverLimit = descriptionLength > MAX_DESCRIPTION_LENGTH;

	const handleOpenChange = useCallback(
		(isOpen: boolean) => {
			if (!isOpen) {
				setName("");
				setDescription("");
				setNameError(null);
			}
			onOpenChange(isOpen);
		},
		[onOpenChange],
	);

	const validateForm = useCallback((): boolean => {
		if (!name.trim()) {
			setNameError("Channel name is required");
			return false;
		}
		setNameError(null);
		return true;
	}, [name]);

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
						defaultSubscription,
					},
					{ withCredentials: true },
				);

				toast.success("Channel updated successfully");
				handleOpenChange(false);
				await mutate(
					(key: string) =>
						typeof key === "string" &&
						key.includes("/api/contacts/v1/channels"),
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
		[
			channel,
			name,
			description,
			visibility,
			defaultSubscription,
			isDescriptionOverLimit,
			mutate,
			handleOpenChange,
			validateForm,
		],
	);

	// Enter to submit
	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (open && !isSaving && name.trim() && !isDescriptionOverLimit) {
				handleSubmit();
			}
		},
		{ enableOnFormTags: true, enabled: open },
		[open, isSaving, name, isDescriptionOverLimit, handleSubmit],
	);

	const previewChannel = {
		id: channel?.id || "editing-channel",
		name: name.trim(),
		description: description.trim() || null,
		defaultSubscription,
		visibility,
	};

	return (
		<Modal.Root open={open} onOpenChange={handleOpenChange}>
			<Modal.Content
				className="rounded-2xl border border-stroke-soft-100 p-0.5 sm:max-w-[860px]"
				showClose={true}
			>
				<div className="rounded-2xl border border-stroke-soft-100">
					<Modal.Header className="before:border-stroke-soft-100 dark:border-stroke-soft-100/40">
						<div className="flex items-center justify-center">
							<Icon name="tag" className="h-4 w-4" />
						</div>
						<div className="flex-1">
							<Modal.Title className="font-semibold">Edit Channel</Modal.Title>
						</div>
					</Modal.Header>
					<div className="flex flex-col lg:flex-row lg:items-stretch lg:divide-x lg:divide-stroke-soft-100 dark:lg:divide-stroke-soft-100/40">
						{/* Left Column: Form */}
						<form
							ref={formRef}
							onSubmit={handleSubmit}
							className="flex flex-1 flex-col"
						>
							<Modal.Body className="relative space-y-4">
								<div className="space-y-4">
									<div className="relative flex flex-col gap-1.5">
										<Label.Root htmlFor="edit-channel-name">
											Channel Name
											<span className="text-primary-base">*</span>
										</Label.Root>
										<Input.Root size="small" className="rounded-xl">
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
											className="min-h-[60px] resize-none rounded-2xl"
										/>
										<span
											className={`absolute right-3 bottom-2 text-subheading-2xs ${
												isDescriptionOverLimit
													? "text-error-base"
													: "text-text-soft-400"
											}`}
										>
											{descriptionLength}/{MAX_DESCRIPTION_LENGTH}
										</span>
									</div>
								</div>

								<div className="mt-2 space-y-3">
									<label
										htmlFor="default-subscription"
										className="flex w-full cursor-pointer gap-2 rounded-2xl border border-stroke-soft-100 p-3 transition-colors hover:bg-bg-weak-50/50 dark:border-stroke-soft-100/40"
									>
										<Checkbox.Root
											id="default-subscription"
											checked={defaultSubscription === "opt_in"}
											onCheckedChange={(checked) =>
												setDefaultSubscription(checked ? "opt_in" : "opt_out")
											}
											disabled={isSaving}
										/>
										<div className="-mt-px flex-1">
											<p className="font-medium text-paragraph-sm text-text-strong-950">
												Default Subscription
											</p>
											<p className="text-paragraph-xs text-text-sub-600">
												{defaultSubscription === "opt_in"
													? "New contacts are automatically enrolled"
													: "Contacts must be manually enrolled"}
											</p>
										</div>
									</label>

									<label
										htmlFor="public-visibility"
										className="flex w-full cursor-pointer gap-2 rounded-2xl border border-stroke-soft-100 p-3 transition-colors hover:bg-bg-weak-50/50 dark:border-stroke-soft-100/40"
									>
										<Checkbox.Root
											id="public-visibility"
											checked={visibility === "public"}
											onCheckedChange={(checked) =>
												setVisibility(checked ? "public" : "private")
											}
											disabled={isSaving}
										/>
										<div className="-mt-px flex-1">
											<p className="font-medium text-paragraph-sm text-text-strong-950">
												Public Channel
											</p>
											<p className="text-paragraph-xs text-text-sub-600">
												{visibility === "public"
													? "Channel is visible to everyone"
													: "Channel is only visible to your team"}
											</p>
										</div>
									</label>
								</div>
							</Modal.Body>
							<Modal.Footer className="mt-auto flex items-center justify-end gap-3 border-stroke-soft-100 dark:border-stroke-soft-100/40">
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
											Update Channel
											<span className="inline-flex items-center gap-0.5">
												<KbdCommand />
												<KbdEnter />
											</span>
										</>
									)}
								</Button.Root>
							</Modal.Footer>
						</form>

						{/* Right Column: Preview */}
						<div className="hidden flex-1 flex-col bg-bg-weak-50/30 p-6 lg:flex">
							<div className="sticky top-0">
								<CreateChannelPreview
									channel={previewChannel}
									siblingChannels={channelsData?.channels}
									orgName="Your Organization"
									badgeLabel="Editing"
								/>
							</div>
						</div>
					</div>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
