import * as Button from "@reloop/ui/button";
import * as Checkbox from "@reloop/ui/checkbox";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import type { AudienceStatus } from "#/features/contacts/audience";
import { useInvalidateContacts } from "#/features/contacts/hooks/use-contacts-query";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { ChannelsField, GroupsField } from "./membership-fields";

/** Light keycap so it reads on the blue FancyButton fill. */
const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

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
		throw new Error(data.message || "Failed to add contact to group");
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
		throw new Error(data.message || "Failed to remove contact from group");
	}
}

interface EditContactFieldsProps {
	contact: EditContactFormContact;
	isSaving: boolean;
	email: string;
	firstName: string;
	setFirstName: (value: string) => void;
	lastName: string;
	setLastName: (value: string) => void;
	customProperties: Property[];
	propertyValues: Record<string, string>;
	handlePropertyChange: (propertyId: string, value: string) => void;
	selectedGroupIds: string[];
	setSelectedGroupIds: (ids: string[]) => void;
	isSubscribed: boolean;
	setIsSubscribed: (value: boolean) => void;
	selectedChannelIds: string[];
	setSelectedChannelIds: (ids: string[]) => void;
	/** Focus the first name field on mount (modal only, not inline). */
	autoFocusName?: boolean;
}

function EditContactFields({
	contact,
	isSaving,
	email,
	firstName,
	setFirstName,
	lastName,
	setLastName,
	customProperties,
	propertyValues,
	handlePropertyChange,
	selectedGroupIds,
	setSelectedGroupIds,
	isSubscribed,
	setIsSubscribed,
	selectedChannelIds,
	setSelectedChannelIds,
	autoFocusName = false,
}: EditContactFieldsProps) {
	return (
		<>
			{/* ── Identity ───────────────────────────────────────── */}
			<section className="space-y-4">
				{/* Email — identity key, not editable here */}
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5">
						<Label.Root
							htmlFor={`email-${contact.id}`}
							className="font-medium text-text-strong-950 text-xs"
						>
							Email
						</Label.Root>
						<span className="font-normal text-text-sub-600 text-xs">
							(cannot be changed)
						</span>
					</div>
					<Input.Root
						size="medium"
						className="rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/30"
					>
						<Input.Wrapper>
							<Input.Input
								id={`email-${contact.id}`}
								type="email"
								value={email}
								readOnly
								className="cursor-not-allowed font-medium text-text-strong-950 opacity-100 focus:outline-none"
							/>
							<Icon
								name="lock"
								className="mr-1.5 h-3.5 w-3.5 shrink-0 text-text-sub-600"
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>

				{/* First Name & Last Name */}
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="flex flex-col gap-1.5">
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
									autoFocus={autoFocusName}
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>
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
				</div>

				{/* Custom properties — same identity block, no section header */}
				{customProperties.length > 0 && (
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
				)}
			</section>

			{/* ── Organization ───────────────────────────────────── */}
			<section className="space-y-4">
				<GroupsField
					contactId={contact.id}
					knownGroups={contact.groups}
					selectedGroupIds={selectedGroupIds}
					onChange={setSelectedGroupIds}
					disabled={isSaving}
				/>
			</section>

			{/* ── Email preferences (last) ───────────────────────── */}
			<section className="space-y-4">
				{/* 1. Channels */}
				<ChannelsField
					contactId={contact.id}
					knownChannels={contact.channels}
					selectedChannelIds={selectedChannelIds}
					onChange={setSelectedChannelIds}
					disabled={isSaving}
					isSubscribed={isSubscribed}
				/>

				{/* 2. Marketing Email toggle */}
				<label
					htmlFor={`marketing-subscription-${contact.id}`}
					className={cn(
						"flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-3.5 transition-colors",
						isSubscribed
							? "border-stroke-soft-200 bg-bg-weak-50/40"
							: "border-red-500/15 bg-red-500/[0.03]",
						isSaving && "pointer-events-none opacity-50",
					)}
				>
					<div className="flex min-w-0 items-center gap-3">
						<div
							className={cn(
								"flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-bg-white-0 shadow-xs",
								isSubscribed
									? "border-stroke-soft-200 text-text-strong-950"
									: "border-red-500/20 text-red-600",
							)}
						>
							<Icon
								name={isSubscribed ? "mail-single" : "bell-off"}
								className="h-4 w-4"
							/>
						</div>
						<div className="flex min-w-0 flex-col gap-0.5 text-left">
							<div className="flex flex-wrap items-center gap-2">
								<span className="font-medium text-text-strong-950 text-xs">
									Marketing Email
								</span>
								<span
									className={cn(
										"inline-flex items-center rounded-md px-1.5 py-0.5 font-medium text-[10px] leading-none",
										isSubscribed
											? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
											: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
									)}
								>
									{isSubscribed ? "Subscribed" : "Unsubscribed"}
								</span>
							</div>
							<span className="text-paragraph-xs text-text-sub-600">
								{isSubscribed
									? "Can receive marketing and broadcast emails"
									: "Marketing paused — transactional emails only"}
							</span>
						</div>
					</div>
					<Checkbox.Root
						id={`marketing-subscription-${contact.id}`}
						checked={isSubscribed}
						onCheckedChange={(checked) => setIsSubscribed(checked === true)}
						disabled={isSaving}
						aria-label="Marketing Email"
					/>
				</label>
			</section>
		</>
	);
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

	const customProperties = propertiesData?.properties || [];

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
				...groupsToAdd.map((groupId) => addContactToGroup(contact.id, groupId)),
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

	if (!isInline) {
		return (
			<div className="w-full font-sans" onClick={(e) => e.stopPropagation()}>
				{/* Modal: same nested gray/white card + header as CreateApiKeyModal. */}
				<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 p-0 dark:border-stroke-soft-100/40 dark:bg-white/[0.03]">
					<form onSubmit={handleSubmit}>
						<div className="relative m-0.5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 pt-5 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
							{/* Header — icon + title + in-flow close, like CreateApiKeyModal */}
							<div className="flex items-start justify-between gap-4 px-6">
								<div className="flex items-center gap-2">
									<Icon
										name="user"
										className="size-4 text-text-sub-600 dark:text-white/60"
									/>
									<Modal.Title className="font-medium text-text-strong-950 text-xl tracking-tight dark:text-white">
										Edit contact
									</Modal.Title>
								</div>
								<button
									type="button"
									onClick={onCancel}
									aria-label="Close"
									disabled={isSaving}
									className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 active:scale-[0.95] disabled:opacity-50 dark:bg-transparent dark:hover:bg-white/[0.05] dark:hover:text-white"
								>
									<X className="size-3.5" strokeWidth={2.25} />
								</button>
							</div>

							<div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 pt-5 pb-6">
								<EditContactFields
									contact={contact}
									isSaving={isSaving}
									email={email}
									firstName={firstName}
									setFirstName={setFirstName}
									lastName={lastName}
									setLastName={setLastName}
									customProperties={customProperties}
									propertyValues={propertyValues}
									handlePropertyChange={handlePropertyChange}
									selectedGroupIds={selectedGroupIds}
									setSelectedGroupIds={setSelectedGroupIds}
									isSubscribed={isSubscribed}
									setIsSubscribed={setIsSubscribed}
									selectedChannelIds={selectedChannelIds}
									setSelectedChannelIds={setSelectedChannelIds}
									autoFocusName
								/>
							</div>
						</div>

						{/* Bottom Footer / Action Bar — like CreateApiKeyModal */}
						<div className="relative flex items-center justify-between gap-3 px-3 pt-2 pb-3">
							<Button.Root
								type="button"
								variant="neutral"
								mode="ghost"
								size="small"
								onClick={onCancel}
								disabled={isSaving}
								className={cn(
									"gap-1.5 transition-opacity duration-200",
									isSaving && "pointer-events-none opacity-50",
								)}
							>
								Cancel
								<ActionKbd className="lowercase! w-auto min-w-0 px-1">
									esc
								</ActionKbd>
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
												<ActionKbd className={actionKbdOnBlueClassName}>
													↵
												</ActionKbd>
											</>
										)}
									</motion.span>
								</AnimatePresence>
							</FancyButton.Root>
						</div>
					</form>
				</div>
			</div>
		);
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="w-full font-sans"
			onClick={(e) => e.stopPropagation()}
		>
			{/* Table inline: nested gray/white card. */}
			<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50">
				<div className="m-0.5 space-y-6 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-6 pt-5 pb-6">
					{/* ── Identity ───────────────────────────────────────── */}
					<section className="space-y-4">
						{/* Email — identity key, not editable here */}
						<div className="flex flex-col gap-1.5">
							<div className="flex items-center gap-1.5">
								<Label.Root
									htmlFor={`email-${contact.id}`}
									className="font-medium text-text-strong-950 text-xs"
								>
									Email
								</Label.Root>
								<span className="font-normal text-text-sub-600 text-xs">
									(cannot be changed)
								</span>
							</div>
							<Input.Root
								size="medium"
								className="rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/30"
							>
								<Input.Wrapper>
									<Input.Input
										id={`email-${contact.id}`}
										type="email"
										value={email}
										readOnly
										className="cursor-not-allowed font-medium text-text-strong-950 opacity-100 focus:outline-none"
									/>
									<Icon
										name="lock"
										className="mr-1.5 h-3.5 w-3.5 shrink-0 text-text-sub-600"
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>

						{/* First Name & Last Name */}
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="flex flex-col gap-1.5">
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
						</div>

						{/* Custom properties — same identity block, no section header */}
						{customProperties.length > 0 && (
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
														property.propertyType === "number"
															? "number"
															: "text"
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
						)}
					</section>

					{/* ── Organization ───────────────────────────────────── */}
					<section className="space-y-4">
						<GroupsField
							contactId={contact.id}
							knownGroups={contact.groups}
							selectedGroupIds={selectedGroupIds}
							onChange={setSelectedGroupIds}
							disabled={isSaving}
						/>
					</section>

					{/* ── Email preferences (last) ───────────────────────── */}
					<section className="space-y-4">
						{/* 1. Channels */}
						<ChannelsField
							contactId={contact.id}
							knownChannels={contact.channels}
							selectedChannelIds={selectedChannelIds}
							onChange={setSelectedChannelIds}
							disabled={isSaving}
							isSubscribed={isSubscribed}
						/>

						{/* 2. Marketing Email toggle */}
						<label
							htmlFor={`marketing-subscription-${contact.id}`}
							className={cn(
								"flex cursor-pointer items-center justify-between gap-4 rounded-2xl border p-3.5 transition-colors",
								isSubscribed
									? "border-stroke-soft-200 bg-bg-weak-50/40"
									: "border-red-500/15 bg-red-500/[0.03]",
								isSaving && "pointer-events-none opacity-50",
							)}
						>
							<div className="flex min-w-0 items-center gap-3">
								<div
									className={cn(
										"flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-bg-white-0 shadow-xs",
										isSubscribed
											? "border-stroke-soft-200 text-text-strong-950"
											: "border-red-500/20 text-red-600",
									)}
								>
									<Icon
										name={isSubscribed ? "mail-single" : "bell-off"}
										className="h-4 w-4"
									/>
								</div>
								<div className="flex min-w-0 flex-col gap-0.5 text-left">
									<div className="flex flex-wrap items-center gap-2">
										<span className="font-medium text-text-strong-950 text-xs">
											Marketing Email
										</span>
										<span
											className={cn(
												"inline-flex items-center rounded-md px-1.5 py-0.5 font-medium text-[10px] leading-none",
												isSubscribed
													? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
													: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400",
											)}
										>
											{isSubscribed ? "Subscribed" : "Unsubscribed"}
										</span>
									</div>
									<span className="text-paragraph-xs text-text-sub-600">
										{isSubscribed
											? "Can receive marketing and broadcast emails"
											: "Marketing paused — transactional emails only"}
									</span>
								</div>
							</div>
							<Checkbox.Root
								id={`marketing-subscription-${contact.id}`}
								checked={isSubscribed}
								onCheckedChange={(checked) => setIsSubscribed(checked === true)}
								disabled={isSaving}
								aria-label="Marketing Email"
							/>
						</label>
					</section>
				</div>

				{/* Bottom Footer / Action Bar */}
				<div
					className={cn(
						"flex items-center justify-end gap-3",
						isInline ? "px-6 pt-3 pb-3.5 dark:bg-bg-weak-50/40" : "mt-6",
					)}
				>
					<Button.Root
						type="button"
						variant="neutral"
						mode="stroke"
						size="small"
						onClick={onCancel}
						disabled={isSaving}
						className={cn(
							"gap-1.5 transition-opacity duration-200",
							isSaving && "pointer-events-none opacity-50",
						)}
					>
						Cancel
						<ActionKbd className="lowercase! w-auto min-w-0 px-1">
							esc
						</ActionKbd>
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
										<ActionKbd className={actionKbdOnBlueClassName}>
											↵
										</ActionKbd>
									</>
								)}
							</motion.span>
						</AnimatePresence>
					</FancyButton.Root>
				</div>
			</div>
		</form>
	);
}
