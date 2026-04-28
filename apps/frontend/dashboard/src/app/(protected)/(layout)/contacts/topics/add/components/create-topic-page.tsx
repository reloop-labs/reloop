"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdCommand } from "@reloop/ui/kbd-command";
import { KbdEnter } from "@reloop/ui/kbd-enter";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import * as Switch from "@reloop/ui/switch";
import * as Textarea from "@reloop/ui/textarea";
import axios from "axios";
import { useCallback, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { useRouter } from "next/navigation";
import { PreferencesPreview } from "./preferences-preview";

const MAX_DESCRIPTION_LENGTH = 500;

export const CreateTopicPage = () => {
	const { mutate } = useSWRConfig();
	const router = useRouter();
	const [isCreating, setIsCreating] = useState(false);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [nameError, setNameError] = useState<string | null>(null);
	const [defaultSubscription, setDefaultSubscription] = useState<
		"opt_in" | "opt_out"
	>("opt_in");
	const [visibility, setVisibility] = useState<"private" | "public">(
		"private",
	);
	const formRef = useRef<HTMLFormElement>(null);

	const descriptionLength = description.length;
	const isDescriptionOverLimit = descriptionLength > MAX_DESCRIPTION_LENGTH;

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

			if (!validateForm()) return;

			if (isDescriptionOverLimit) {
				toast.error("Description exceeds maximum length");
				return;
			}

			setIsCreating(true);
			try {
				await axios.post(
					"/api/contacts/v1/topics/create",
					{
						name: name.trim(),
						description: description.trim() || undefined,
						defaultSubscription,
						visibility,
					},
					{ headers: { credentials: "include" } },
				);

				toast.success("Topic created successfully");
				await mutate(
					(key: string) =>
						typeof key === "string" &&
						key.includes("/api/contacts/v1/topics/list"),
				);
				router.push("/contacts/topics");
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
			defaultSubscription,
			visibility,
			isDescriptionOverLimit,
			mutate,
			router,
		],
	);

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (!isCreating && name.trim() && !isDescriptionOverLimit) {
				handleSubmit();
			}
		},
		{ enableOnFormTags: true },
		[isCreating, name, isDescriptionOverLimit, handleSubmit],
	);

	return (
		<div className="flex min-h-[calc(100vh-180px)] gap-8">
			{/* ─── Left: Form ─── */}
			<form
				ref={formRef}
				onSubmit={handleSubmit}
				className="flex flex-1 flex-col"
			>
				<div className="flex flex-col gap-6">
					{/* Topic Name */}
					<div className="flex flex-col gap-1.5">
						<Label.Root htmlFor="topic-name" className="font-medium text-sm">
							Topic Name
							<span className="ml-0.5 text-primary-base">*</span>
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
									autoFocus
								/>
							</Input.Wrapper>
						</Input.Root>
						{nameError && (
							<p className="text-error-base text-paragraph-xs">{nameError}</p>
						)}
						<p className="text-text-soft-400 text-paragraph-xs">
							This name will appear in your contacts' preferences center.
						</p>
					</div>

					{/* Description */}
					<div className="relative flex flex-col gap-1.5">
						<Label.Root
							htmlFor="topic-description"
							className="font-medium text-sm"
						>
							Description
							<span className="ml-1 font-normal text-text-soft-400 text-xs">
								(optional)
							</span>
						</Label.Root>
						<Textarea.Root
							simple
							id="topic-description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Briefly describe what contacts can expect from this topic..."
							rows={3}
							disabled={isCreating}
							hasError={isDescriptionOverLimit}
							className="resize-none"
						/>
						<div className="flex items-center justify-between">
							<p className="text-text-soft-400 text-paragraph-xs">
								Shown as a subtitle on the preferences page.
							</p>
							<span
								className={`text-subheading-2xs ${
									isDescriptionOverLimit
										? "text-error-base"
										: "text-text-soft-400"
								}`}
							>
								{descriptionLength}/{MAX_DESCRIPTION_LENGTH}
							</span>
						</div>
					</div>

					{/* Settings */}
					<div className="flex flex-col gap-3">
						<p className="font-medium text-sm text-text-strong-950">
							Settings
						</p>

						{/* Default Subscription Toggle */}
						<div className="flex items-center justify-between rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 transition-colors hover:bg-bg-weak-50/40">
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg-weak-50">
									<Icon
										name="user-plus"
										className="h-4 w-4 text-text-sub-600"
									/>
								</div>
								<div>
									<p className="font-medium text-paragraph-sm text-text-strong-950">
										Auto-enroll new contacts
									</p>
									<p className="mt-0.5 text-paragraph-xs text-text-soft-400">
										{defaultSubscription === "opt_in"
											? "All new contacts are automatically subscribed"
											: "Contacts must be manually added to this topic"}
									</p>
								</div>
							</div>
							<Switch.Root
								checked={defaultSubscription === "opt_in"}
								onCheckedChange={(checked) =>
									setDefaultSubscription(checked ? "opt_in" : "opt_out")
								}
								disabled={isCreating}
								checkedColor="orange"
							/>
						</div>

						{/* Visibility Toggle */}
						<div className="flex items-center justify-between rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-4 transition-colors hover:bg-bg-weak-50/40">
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-bg-weak-50">
									<Icon
										name={visibility === "public" ? "globe" : "lock"}
										className="h-4 w-4 text-text-sub-600"
									/>
								</div>
								<div>
									<p className="font-medium text-paragraph-sm text-text-strong-950">
										Public topic
									</p>
									<p className="mt-0.5 text-paragraph-xs text-text-soft-400">
										{visibility === "public"
											? "Visible to all contacts, even if not subscribed"
											: "Only visible to subscribed contacts"}
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
				</div>

				{/* Footer Actions */}
				<div className="mt-8 flex items-center justify-end gap-3 border-stroke-soft-100 border-t pt-5">
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() => router.push("/contacts/topics")}
						disabled={isCreating}
					>
						Cancel
					</Button.Root>
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
									<KbdCommand />
									<KbdEnter />
								</span>
							</>
						)}
					</Button.Root>
				</div>
			</form>

			{/* ─── Right: Live Preview ─── */}
			<div className="w-[340px] shrink-0">
				<div className="sticky top-6">
					<PreferencesPreview
						name={name}
						description={description}
						defaultSubscription={defaultSubscription}
						visibility={visibility}
					/>
				</div>
			</div>
		</div>
	);
};
