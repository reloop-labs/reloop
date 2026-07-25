import type { AudienceStatus } from "#/features/contacts/audience";
import { GroupSelect } from "#/features/contacts/components/groups/group-select";
import { useInvalidateContacts } from "#/features/contacts/hooks/use-contacts-query";
import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";

export interface EditContactFormContact {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	status: AudienceStatus;
	organizationId: string;
	properties: Record<string, string | number>;
	groups?: { id: string; name: string }[];
	channels?: { id: string; name: string; subscription: "opt_in" | "opt_out" }[];
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface Property {
	id: string;
	propertyName: string;
	propertyType: string;
	defaultValue: string | null;
}

interface Channel {
	id: string;
	name: string;
	defaultSubscription: "opt_in" | "opt_out";
}

interface EditContactFormProps {
	contact: EditContactFormContact;
	onCancel: () => void;
	onSuccess?: () => void;
	/** Compact layout for inline row expansion */
	variant?: "modal" | "inline";
}

function getInitialChannelIds(contact: EditContactFormContact): string[] {
	return (contact.channels ?? [])
		.filter((c) => c.subscription === "opt_in")
		.map((c) => c.id);
}

function getInitialGroupIds(contact: EditContactFormContact): string[] {
	return (contact.groups ?? []).map((g) => g.id);
}

async function updateChannelSubscription(
	contactId: string,
	channelId: string,
	subscription: "opt_in" | "opt_out",
) {
	const response = await fetch(`/api/contacts/channel/${channelId}`, {
		method: "PATCH",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			contact_id: contactId,
			subscription,
		}),
	});
	if (!response.ok) {
		const data = (await response.json().catch(() => ({}))) as {
			message?: string;
		};
		throw new Error(data.message || `Failed to update channel ${channelId}`);
	}
}

async function addContactToGroup(contactId: string, groupId: string) {
	const response = await fetch(`/api/contacts/group/${groupId}`, {
		method: "POST",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ contact_id: contactId }),
	});
	if (!response.ok) {
		const data = (await response.json().catch(() => ({}))) as {
			message?: string;
		};
		throw new Error(data.message || `Failed to add contact to group`);
	}
}

async function removeContactFromGroup(contactId: string, groupId: string) {
	const response = await fetch(`/api/contacts/group/${groupId}`, {
		method: "DELETE",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ contact_id: contactId }),
	});
	if (!response.ok) {
		const data = (await response.json().catch(() => ({}))) as {
			message?: string;
		};
		throw new Error(data.message || `Failed to remove contact from group`);
	}
}

export function EditContactForm({
	contact,
	onCancel,
	onSuccess,
	variant = "modal",
}: EditContactFormProps) {
	const invalidate = useInvalidateContacts();
	const [isSaving, setIsSaving] = useState(false);
	const [email, setEmail] = useState(contact.email);
	const [isSubscribed, setIsSubscribed] = useState(
		contact.status.toLowerCase() === "subscribed",
	);
	const [firstName, setFirstName] = useState(contact.firstName || "");
	const [lastName, setLastName] = useState(contact.lastName || "");
	const [propertyValues, setPropertyValues] = useState<Record<string, string>>(
		{},
	);
	const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>(() =>
		getInitialChannelIds(contact),
	);
	const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(() =>
		getInitialGroupIds(contact),
	);
	const [channelInput, setChannelInput] = useState("");
	const [showChannelDropdown, setShowChannelDropdown] = useState(false);
	const [hoveredChannelId, setHoveredChannelId] = useState<string | null>(null);
	const channelInputRef = useRef<HTMLInputElement>(null);

	// Snapshot of memberships when the form opened / contact switched — used for diffs on save
	const initialChannelIdsRef = useRef(getInitialChannelIds(contact));
	const initialGroupIdsRef = useRef(getInitialGroupIds(contact));

	const { data: propertiesData } = useQuery({
		queryKey: ["contacts", "properties", "edit-form"],
		queryFn: async () => {
			const res = await fetch("/api/contacts/v1/properties/list?limit=100", {
				credentials: "include",
			});
			if (!res.ok) throw new Error("Failed");
			return res.json() as Promise<{ properties: Property[]; total: number }>;
		},
	});

	const { data: allChannelsData } = useQuery({
		queryKey: ["contacts", "channels", "edit-form"],
		queryFn: async () => {
			const res = await fetch("/api/contacts/v1/channels/list?limit=100", {
				credentials: "include",
			});
			if (!res.ok) throw new Error("Failed");
			return res.json() as Promise<{ channels: Channel[]; total: number }>;
		},
	});

	const allChannels = allChannelsData?.channels || [];
	const customProperties = propertiesData?.properties || [];

	const channelNameById = useMemo(() => {
		const map = new Map<string, string>();
		for (const c of contact.channels ?? []) {
			map.set(c.id, c.name);
		}
		for (const c of allChannels) {
			map.set(c.id, c.name);
		}
		return map;
	}, [allChannels, contact.channels]);

	// Reset form when switching to a different contact
	useEffect(() => {
		const channelIds = getInitialChannelIds(contact);
		const groupIds = getInitialGroupIds(contact);
		setEmail(contact.email);
		setFirstName(contact.firstName || "");
		setLastName(contact.lastName || "");
		setIsSubscribed(contact.status.toLowerCase() === "subscribed");
		setSelectedChannelIds(channelIds);
		setSelectedGroupIds(groupIds);
		setChannelInput("");
		setShowChannelDropdown(false);
		initialChannelIdsRef.current = channelIds;
		initialGroupIdsRef.current = groupIds;
	}, [contact]);

	useEffect(() => {
		if (contact.properties) {
			const values: Record<string, string> = {};
			const props = propertiesData?.properties || [];
			for (const property of props) {
				const val = contact.properties[property.propertyName];
				if (val !== undefined && val !== null) {
					values[property.id] = String(val);
				}
			}
			setPropertyValues(values);
		}
	}, [contact, propertiesData?.properties]);

	useHotkeys(
		"escape",
		(e) => {
			e.preventDefault();
			if (!isSaving) onCancel();
		},
		{ enableOnFormTags: true },
	);

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (!isSaving) {
				void handleSubmit(new Event("submit") as unknown as React.FormEvent);
			}
		},
		{ enableOnFormTags: ["INPUT"] },
	);

	const addChannel = (channelId: string) => {
		if (!selectedChannelIds.includes(channelId)) {
			setSelectedChannelIds((prev) => [...prev, channelId]);
		}
		setChannelInput("");
		setShowChannelDropdown(false);
	};

	const removeChannel = (channelId: string) => {
		setSelectedChannelIds((prev) => prev.filter((id) => id !== channelId));
	};

	const getChannelName = (channelId: string) =>
		channelNameById.get(channelId) || "";

	const availableChannels = allChannels.filter(
		(channel) => !selectedChannelIds.includes(channel.id),
	);

	const filteredChannels = channelInput
		? availableChannels.filter((t) =>
				t.name.toLowerCase().includes(channelInput.toLowerCase()),
			)
		: availableChannels;

	const handlePropertyChange = (propertyId: string, value: string) => {
		setPropertyValues((prev) => ({
			...prev,
			[propertyId]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setIsSaving(true);
		try {
			const propertiesPayload: Record<string, string | number> = {};
			for (const property of customProperties) {
				const value = propertyValues[property.id];
				if (value !== undefined && value !== "") {
					propertiesPayload[property.propertyName] =
						property.propertyType === "number" ? Number(value) : value;
				}
			}

			const response = await fetch(`/api/contacts/${contact.id}`, {
				method: "PATCH",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					// Send empty strings so cleared fields are updated (undefined = skip)
					firstName,
					lastName,
					status: isSubscribed ? "subscribed" : "unsubscribed",
					// Always send properties once defs are loaded — empty {} clears all
					// (backend upsert is replacement mode)
					...(propertiesData ? { properties: propertiesPayload } : {}),
				}),
			});

			if (!response.ok) {
				const data = (await response.json().catch(() => ({}))) as {
					message?: string;
				};
				throw new Error(data.message || "Failed to update contact");
			}

			const initialChannels = initialChannelIdsRef.current;
			const initialGroups = initialGroupIdsRef.current;

			const channelsToAdd = selectedChannelIds.filter(
				(id) => !initialChannels.includes(id),
			);
			const channelsToRemove = initialChannels.filter(
				(id) => !selectedChannelIds.includes(id),
			);
			const groupsToAdd = selectedGroupIds.filter(
				(id) => !initialGroups.includes(id),
			);
			const groupsToRemove = initialGroups.filter(
				(id) => !selectedGroupIds.includes(id),
			);

			const membershipResults = await Promise.allSettled([
				...channelsToAdd.map((channelId) =>
					updateChannelSubscription(contact.id, channelId, "opt_in"),
				),
				...channelsToRemove.map((channelId) =>
					updateChannelSubscription(contact.id, channelId, "opt_out"),
				),
				...groupsToAdd.map((groupId) =>
					addContactToGroup(contact.id, groupId),
				),
				...groupsToRemove.map((groupId) =>
					removeContactFromGroup(contact.id, groupId),
				),
			]);

			const failed = membershipResults.filter((r) => r.status === "rejected");
			if (failed.length > 0) {
				console.error("Some membership updates failed", failed);
				toast.warning(
					"Contact updated, but some group or channel changes failed",
				);
			} else {
				toast.success("Contact updated successfully");
			}

			await invalidate();
			onSuccess?.();
		} catch (error) {
			console.error("Failed to update contact:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to update contact",
			);
		} finally {
			setIsSaving(false);
		}
	};

	const isInline = variant === "inline";

	return (
		<form
			onSubmit={handleSubmit}
			className={isInline ? "grid gap-4 md:grid-cols-2" : "flex flex-col gap-4"}
			onClick={(e) => e.stopPropagation()}
		>
			<div
				className={
					isInline ? "contents" : "max-h-[60vh] space-y-4 overflow-y-auto px-0"
				}
			>
				{/* Email — modal only; list row already shows it */}
				{!isInline && (
					<div className="flex flex-col gap-1.5">
						<Label.Root
							htmlFor={`email-${contact.id}`}
							className="font-medium text-text-strong-950 text-xs"
						>
							Email
						</Label.Root>
						<Input.Root size="medium">
							<Input.Wrapper>
								<Input.Input
									id={`email-${contact.id}`}
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									disabled={isSaving}
									readOnly
									placeholder={contact.email}
									className="cursor-not-allowed bg-bg-weak-50"
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>
				)}

				{/* First Name */}
				<div
					className={`flex flex-col gap-1.5 ${isInline ? "" : "border-stroke-soft-100 border-t pt-4"}`}
				>
					<Label.Root
						htmlFor={`firstName-${contact.id}`}
						className="font-medium text-text-strong-950 text-xs"
					>
						First name
					</Label.Root>
					<Input.Root size="medium">
						<Input.Wrapper>
							<Input.Input
								id={`firstName-${contact.id}`}
								type="text"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								disabled={isSaving}
								placeholder="First name"
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>

				{/* Last Name */}
				<div className="flex flex-col gap-1.5">
					<Label.Root
						htmlFor={`lastName-${contact.id}`}
						className="font-medium text-text-strong-950 text-xs"
					>
						Last name
					</Label.Root>
					<Input.Root size="medium">
						<Input.Wrapper>
							<Input.Input
								id={`lastName-${contact.id}`}
								type="text"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								disabled={isSaving}
								placeholder="Last name"
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>

				{/* Channels */}
				<div
					className={`flex flex-col gap-1.5 ${isInline ? "md:col-span-2" : "border-stroke-soft-100 border-t pt-4"}`}
				>
					<Label.Root
						htmlFor={`channels-${contact.id}`}
						className="font-medium text-text-strong-950 text-xs"
					>
						Channels
					</Label.Root>
					<div className="relative">
						<label
							className={cn(
								"group/chips flex min-h-[42px] cursor-text flex-wrap content-start gap-1.5 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-3 py-2 transition duration-200 ease-out focus-within:border-stroke-strong-950 focus-within:shadow-xs hover:[&:not(:focus-within)]:bg-bg-weak-50/50 dark:border-stroke-soft-100/40",
								isSaving && "pointer-events-none opacity-50",
							)}
						>
							{selectedChannelIds.map((channelId) => {
								const channelName = getChannelName(channelId);
								if (!channelName) return null;
								return (
									<span
										key={channelId}
										className="inline-flex items-center gap-1.5 rounded-full border border-stroke-soft-100 bg-bg-weak-50 py-0.5 pr-2 pl-0.5 text-paragraph-xs text-text-strong-950 transition-all dark:border-stroke-soft-100/40"
									>
										<Avatar.Root size="20" color="gray">
											<Icon
												name="notification-indicator"
												className="h-3 w-3 text-text-sub-600"
											/>
										</Avatar.Root>
										<span className="font-medium">{channelName}</span>
										<button
											type="button"
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												removeChannel(channelId);
											}}
											className="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full text-text-sub-600 transition-colors hover:bg-stroke-soft-200 hover:text-text-strong-950"
											disabled={isSaving}
											aria-label={`Remove ${channelName}`}
										>
											<Icon name="cross" className="h-3 w-3" />
										</button>
									</span>
								);
							})}
							<input
								ref={channelInputRef}
								id={`channels-${contact.id}`}
								type="text"
								value={channelInput}
								onChange={(e) => {
									setChannelInput(e.target.value);
									setShowChannelDropdown(true);
								}}
								onFocus={() => setShowChannelDropdown(true)}
								onBlur={(e) => {
									const relatedTarget = e.relatedTarget as HTMLElement | null;
									if (!relatedTarget?.closest("[data-channel-select-dropdown]")) {
										setShowChannelDropdown(false);
									}
								}}
								placeholder={
									selectedChannelIds.length === 0 ? "Search channels..." : ""
								}
								className="min-w-[80px] flex-1 bg-transparent text-paragraph-sm text-text-sub-600 outline-none placeholder:text-text-soft-400"
								disabled={isSaving}
							/>
						</label>
						<AnimatePresence>
							{showChannelDropdown && filteredChannels.length > 0 && (
								<motion.div
									data-channel-select-dropdown
									initial={{ opacity: 0, y: -6, scale: 0.96 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, y: -6, scale: 0.96 }}
									transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
									onMouseLeave={() => setHoveredChannelId(null)}
									className="absolute right-0 left-0 z-50 mt-1.5 max-h-56 overflow-y-auto rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-1.5 shadow-regular-md ring-1 ring-stroke-soft-100 ring-inset dark:ring-stroke-soft-100/50"
								>
									{filteredChannels.map((channel) => (
										<button
											key={channel.id}
											type="button"
											onMouseEnter={() => setHoveredChannelId(channel.id)}
											onMouseDown={(e) => e.preventDefault()}
											onClick={() => addChannel(channel.id)}
											className="group relative flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-paragraph-sm text-text-strong-950 transition-colors"
										>
											{hoveredChannelId === channel.id && (
												<motion.span
													layoutId="channel-dropdown-hover-pill"
													className="absolute inset-0 rounded-xl bg-bg-weak-50"
													transition={{
														type: "spring",
														stiffness: 500,
														damping: 38,
													}}
												/>
											)}
											<span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border border-stroke-soft-100 bg-bg-weak-50 text-text-sub-600 transition-colors group-hover:bg-bg-white-0 group-hover:text-text-strong-950">
												<Icon
													name="notification-indicator"
													className="h-3.5 w-3.5"
												/>
											</span>
											<span className="relative z-10 font-medium text-text-strong-950 text-xs">
												{channel.name}
											</span>
											{channel.defaultSubscription === "opt_out" && (
												<span className="relative z-10 ml-auto text-paragraph-xs text-text-soft-400">
													Opt-out default
												</span>
											)}
										</button>
									))}
								</motion.div>
							)}
							{showChannelDropdown &&
								filteredChannels.length === 0 &&
								channelInput && (
									<motion.div
										data-channel-select-dropdown
										initial={{ opacity: 0, y: -6, scale: 0.96 }}
										animate={{ opacity: 1, y: 0, scale: 1 }}
										exit={{ opacity: 0, y: -6, scale: 0.96 }}
										transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
										className="absolute right-0 left-0 z-50 mt-1.5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 text-center shadow-regular-md ring-1 ring-stroke-soft-100 ring-inset dark:ring-stroke-soft-100/50"
									>
										<p className="text-paragraph-xs text-text-soft-400">
											No channels found for &ldquo;{channelInput}&rdquo;
										</p>
									</motion.div>
								)}
						</AnimatePresence>
					</div>
					<p className="text-paragraph-xs text-text-soft-400">
						Channels this contact is enrolled to receive emails from.
					</p>
				</div>

				{/* Groups */}
				<div className={isInline ? "md:col-span-2" : "border-stroke-soft-100 border-t pt-4"}>
					<GroupSelect
						id={`groups-${contact.id}`}
						selectedGroupIds={selectedGroupIds}
						onChange={setSelectedGroupIds}
						disabled={isSaving}
						label="Groups"
						description="Segments this contact belongs to for targeting."
						knownGroups={contact.groups}
					/>
				</div>

				{/* Custom Properties */}
				{customProperties.length > 0 && (
					<div
						className={`space-y-4 ${isInline ? "md:col-span-2" : "border-stroke-soft-100 border-t pt-4"}`}
					>
						<div className="grid gap-4 sm:grid-cols-2">
							{customProperties.map((property) => (
								<div key={property.id} className="flex flex-col gap-1.5">
									<Label.Root
										htmlFor={`prop-${contact.id}-${property.id}`}
										className="font-medium text-text-strong-950 text-xs"
									>
										{property.propertyName}
									</Label.Root>
									<Input.Root size="medium">
										<Input.Wrapper>
											<Input.Input
												id={`prop-${contact.id}-${property.id}`}
												type={
													property.propertyType === "number" ? "number" : "text"
												}
												value={propertyValues[property.id] ?? ""}
												onChange={(e) =>
													handlePropertyChange(property.id, e.target.value)
												}
												disabled={isSaving}
												placeholder={
													property.defaultValue ||
													`Enter ${property.propertyName}`
												}
											/>
										</Input.Wrapper>
									</Input.Root>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Subscribed Toggle */}
				<div
					className={
						isInline
							? "md:col-span-2"
							: "border-stroke-soft-100 border-t pt-2"
					}
				>
					<button
						type="button"
						onClick={() => !isSaving && setIsSubscribed(!isSubscribed)}
						disabled={isSaving}
						className={cn(
							"flex w-full cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all duration-200",
							isSubscribed
								? "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 dark:border-emerald-500/30 dark:bg-emerald-500/10"
								: "border-red-500/20 bg-red-500/5 hover:bg-red-500/10 dark:border-red-500/30 dark:bg-red-500/10",
							isSaving && "cursor-not-allowed opacity-50",
						)}
					>
						<div className="flex items-center gap-3">
							<div
								className={cn(
									"flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
									isSubscribed
										? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
										: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
								)}
							>
								<Icon
									name={isSubscribed ? "mail-single" : "bell-off"}
									className="h-4.5 w-4.5"
								/>
							</div>
							<div className="flex flex-col items-start gap-0.5 text-left">
								<span
									className={cn(
										"font-semibold text-xs transition-colors",
										isSubscribed
											? "text-emerald-600 dark:text-emerald-400"
											: "text-red-600 dark:text-red-400",
									)}
								>
									{isSubscribed ? "Subscribed" : "Unsubscribed"}
								</span>
								<span
									className={cn(
										"text-paragraph-xs transition-colors",
										isSubscribed
											? "text-emerald-600/80 dark:text-emerald-400/80"
											: "text-red-600/80 dark:text-red-400/80",
									)}
								>
									{isSubscribed
										? "Receives all emails including marketing and broadcasts"
										: "Receives transactional emails only"}
								</span>
							</div>
						</div>
						<div
							className={cn(
								"flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-200",
								isSubscribed
									? "border-emerald-600 bg-emerald-600 dark:border-emerald-500 dark:bg-emerald-500"
									: "border-red-400 bg-bg-white-0 dark:border-red-500/60 dark:bg-transparent",
							)}
						>
							{isSubscribed && (
								<Icon name="check" className="h-3.5 w-3.5 text-white" />
							)}
						</div>
					</button>
				</div>
			</div>

			<div
				className={`flex items-center justify-end gap-3 ${
					isInline
						? "md:col-span-2 pt-2"
						: "mt-4 border-stroke-soft-100/50 border-t pt-4"
				}`}
			>
				<Button.Root
					type="button"
					variant="neutral"
					mode="ghost"
					size="small"
					onClick={onCancel}
					disabled={isSaving}
				>
					Cancel
					<KbdEsc />
				</Button.Root>
				<FancyButton.Root
					type="submit"
					variant="primary"
					size="small"
					disabled={isSaving}
					className="min-w-[95px] justify-center font-medium"
				>
					<AnimatePresence mode="popLayout" initial={false}>
						<motion.span
							key={isSaving ? "saving" : "idle"}
							transition={{
								type: "spring",
								duration: 0.25,
								bounce: 0,
							}}
							initial={{ opacity: 0, y: -14 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 14 }}
							className="flex items-center justify-center gap-1.5 font-medium"
						>
							{isSaving ? (
								<>
									<Spinner size={14} color="currentColor" />
									<span>Updating...</span>
								</>
							) : (
								<>
									<span>Update</span>
									<span className="inline-flex items-center justify-center rounded bg-white/20 px-1 py-0.5 text-[10px] font-mono leading-none">
										↵
									</span>
								</>
							)}
						</motion.span>
					</AnimatePresence>
				</FancyButton.Root>
			</div>
		</form>
	);
}
