import * as Button from "@reloop/ui/button";
import * as Checkbox from "@reloop/ui/checkbox";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdCommand } from "@reloop/ui/kbd-command";
import { KbdEnter } from "@reloop/ui/kbd-enter";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import * as Textarea from "@reloop/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useInvalidateContacts } from "#/features/contacts/hooks/use-contacts-query";
import { CreateChannelPreview } from "./create-channel-preview";

interface Channel {
	id: string;
	name: string;
	description: string | null;
	defaultSubscription: "opt_in" | "opt_out";
	visibility: "private" | "public";
}

interface CreateChannelModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCreateSuccess?: (channelName: string) => void;
}

const MAX_DESCRIPTION_LENGTH = 500;

export const CreateChannelModal = ({
	open,
	onOpenChange,
	onCreateSuccess,
}: CreateChannelModalProps) => {
	const invalidate = useInvalidateContacts();
	const { data: channelsData } = useQuery({
		queryKey: [
			"contacts",
			"legacy",
			open ? "/api/contacts/v1/channels/list?limit=10" : null,
		],
		queryFn: async () => {
			const url = open ? "/api/contacts/v1/channels/list?limit=10" : null;
			if (!url) throw new Error("missing url");
			const res = await fetch(url as string, { credentials: "include" });
			if (!res.ok) throw new Error("Failed");
			return res.json() as Promise<{ channels: Channel[] }>;
		},
		enabled: Boolean(open ? "/api/contacts/v1/channels/list?limit=10" : null),
	});
	const [status, setStatus] = useState<"idle" | "creating" | "success">("idle");
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [nameError, setNameError] = useState<string | null>(null);
	const [defaultSubscription, setDefaultSubscription] = useState<
		"opt_in" | "opt_out"
	>("opt_in");
	const [visibility, setVisibility] = useState<"private" | "public">("private");
	const formRef = useRef<HTMLFormElement>(null);

	const descriptionLength = description.length;
	const isDescriptionOverLimit = descriptionLength > MAX_DESCRIPTION_LENGTH;

	// Reset state when modal closes
	const handleOpenChange = useCallback(
		(isOpen: boolean) => {
			if (!isOpen) {
				setName("");
				setDescription("");
				setNameError(null);
				setDefaultSubscription("opt_in");
				setVisibility("private");
				setStatus("idle");
			}
			onOpenChange(isOpen);
		},
		[onOpenChange],
	);

	// Validate form
	const validateForm = useCallback((): boolean => {
		if (!name.trim()) {
			setNameError("Channel name is required");
			return false;
		}
		setNameError(null);
		return true;
	}, [name]);

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

			if (status !== "idle") return;

			setStatus("creating");
			const createdChannelName = name.trim();

			try {
				await axios.post(
					"/api/contacts/v1/channels/create",
					{
						name: createdChannelName,
						description: description.trim() || undefined,
						defaultSubscription,
						visibility,
					},
					{ headers: { credentials: "include" } },
				);

				setStatus("success");

				setTimeout(() => {
					onCreateSuccess?.(createdChannelName);
					handleOpenChange(false);
					void invalidate();
				}, 750);
			} catch (error) {
				console.error("Failed to create channel:", error);
				const errorMessage = axios.isAxiosError(error)
					? error.response?.data?.message || "Failed to create channel"
					: "Failed to create channel";
				toast.error(errorMessage);
				setStatus("idle");
			}
		},
		[
			name,
			description,
			defaultSubscription,
			visibility,
			isDescriptionOverLimit,
			status,
			invalidate,
			handleOpenChange,
			validateForm,
			onCreateSuccess,
		],
	);

	// Command/Ctrl + Enter to submit
	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (open && status === "idle" && name.trim() && !isDescriptionOverLimit) {
				handleSubmit();
			}
		},
		{ enableOnFormTags: true, enabled: open },
		[open, status, name, isDescriptionOverLimit, handleSubmit],
	);

	const previewChannel = {
		id: "new-channel",
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
						<div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-base/10 text-primary-base dark:bg-white/10 dark:text-white">
							<Icon name="notification-indicator" className="h-4 w-4" />
						</div>
						<div className="flex-1">
							<Modal.Title className="font-semibold text-lg text-text-strong-950 dark:text-white">
								Create Channel
							</Modal.Title>
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
										<Label.Root htmlFor="channel-name">
											Channel Name
											<span className="text-primary-base">*</span>
										</Label.Root>
										<Input.Root size="medium">
											<Input.Wrapper>
												<Input.Input
													id="channel-name"
													type="text"
													value={name}
													onChange={(e) => {
														setName(e.target.value);
														if (nameError) setNameError(null);
													}}
													placeholder="e.g., Product Updates"
													disabled={status !== "idle"}
													autoFocus
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
												htmlFor="channel-description"
												className="text-text-sub-600"
											>
												Description (Optional)
											</Label.Root>
										</div>
										<Textarea.Root
											simple
											id="channel-description"
											value={description}
											onChange={(e) => setDescription(e.target.value)}
											placeholder="Describe this channel..."
											rows={2}
											disabled={status !== "idle"}
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
										htmlFor="create-default-subscription"
										className={cn(
											"flex w-full cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-all duration-200",
											defaultSubscription === "opt_in"
												? "border-primary-base/40 bg-primary-base/[0.03] dark:border-white/20 dark:bg-white/[0.03]"
												: "border-stroke-soft-100 hover:border-stroke-sub-300 dark:border-stroke-soft-100/40 dark:hover:border-stroke-soft-100/80",
										)}
									>
										<Checkbox.Root
											id="create-default-subscription"
											checked={defaultSubscription === "opt_in"}
											onCheckedChange={(checked) =>
												setDefaultSubscription(checked ? "opt_in" : "opt_out")
											}
											disabled={status !== "idle"}
											className="mt-0.5"
										/>
										<div className="-mt-px flex-1">
											<p className="font-semibold text-paragraph-sm text-text-strong-950 dark:text-white">
												Default Subscription
											</p>
											<p className="mt-0.5 text-paragraph-xs text-text-sub-600 dark:text-white/50">
												{defaultSubscription === "opt_in"
													? "New contacts are automatically enrolled"
													: "Contacts must be manually enrolled"}
											</p>
										</div>
									</label>

									<label
										htmlFor="create-public-visibility"
										className={cn(
											"flex w-full cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-all duration-200",
											visibility === "public"
												? "border-primary-base/40 bg-primary-base/[0.03] dark:border-white/20 dark:bg-white/[0.03]"
												: "border-stroke-soft-100 hover:border-stroke-sub-300 dark:border-stroke-soft-100/40 dark:hover:border-stroke-soft-100/80",
										)}
									>
										<Checkbox.Root
											id="create-public-visibility"
											checked={visibility === "public"}
											onCheckedChange={(checked) =>
												setVisibility(checked ? "public" : "private")
											}
											disabled={status !== "idle"}
											className="mt-0.5"
										/>
										<div className="-mt-px flex-1">
											<p className="font-semibold text-paragraph-sm text-text-strong-950 dark:text-white">
												Public Channel
											</p>
											<p className="mt-0.5 text-paragraph-xs text-text-sub-600 dark:text-white/50">
												{visibility === "public"
													? "Channel is visible to everyone on subscription pages"
													: "Channel is private and only visible to your team"}
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
									size="small"
									onClick={() => handleOpenChange(false)}
									disabled={status !== "idle"}
								>
									Cancel
									<KbdEsc />
								</Button.Root>
								<FancyButton.Root
									type="submit"
									variant={status === "success" ? "success" : "blue"}
									size="small"
									disabled={
										status === "creating" ||
										status === "success" ||
										(status === "idle" && (!name.trim() || isDescriptionOverLimit))
									}
									className={cn(
										"w-[160px] min-w-[160px] justify-center overflow-hidden transition-all duration-200",
										status === "creating" && "opacity-90",
									)}
								>
									<AnimatePresence mode="popLayout" initial={false}>
										<motion.span
											key={status}
											transition={{
												type: "spring",
												duration: 0.25,
												bounce: 0,
											}}
											initial={{ opacity: 0, y: -14 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 14 }}
											className="flex items-center justify-center gap-1.5"
										>
											{status === "creating" ? (
												<>
													<Spinner size={14} color="currentColor" />
													<span>Creating...</span>
												</>
											) : status === "success" ? (
												<>
													<Icon name="check-circle" className="h-4 w-4" />
													<span>Channel Created</span>
												</>
											) : (
												<>
													<span>Create Channel</span>
													<span className="inline-flex items-center gap-0.5 opacity-80">
														<KbdCommand />
														<KbdEnter />
													</span>
												</>
											)}
										</motion.span>
									</AnimatePresence>
								</FancyButton.Root>
							</Modal.Footer>
						</form>

						{/* Right Column: Preview */}
						<div className="hidden flex-1 flex-col bg-bg-weak-50/40 p-6 lg:flex dark:bg-bg-weak-50/10">
							<div className="sticky top-0">
								<CreateChannelPreview
									channel={previewChannel}
									siblingChannels={channelsData?.channels}
									orgName="Your Organization"
								/>
							</div>
						</div>
					</div>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
