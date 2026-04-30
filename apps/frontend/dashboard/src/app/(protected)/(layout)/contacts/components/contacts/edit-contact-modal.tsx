"use client";

import type { AudienceStatus } from "@fe/dashboard/utils/audience";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";

interface Contact {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	status: AudienceStatus;
	organizationId: string;
	properties: Record<string, string | number>;
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

interface EditContactModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	contact: Contact | null;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const EditContactModal = ({
	open,
	onOpenChange,
	contact,
}: EditContactModalProps) => {
	const { mutate } = useSWRConfig();
	const [isSaving, setIsSaving] = useState(false);
	const [email, setEmail] = useState("");
	const [isSubscribed, setIsSubscribed] = useState(true);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [propertyValues, setPropertyValues] = useState<Record<string, string>>(
		{},
	);
	// Channels state
	const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
	const [channelInput, setChannelInput] = useState("");
	const [showChannelDropdown, setShowChannelDropdown] = useState(false);
	const channelInputRef = useRef<HTMLInputElement>(null);

	// Fetch all custom properties for the organization
	const { data: propertiesData } = useSWR<{
		properties: Property[];
		total: number;
	}>(open ? "/api/contacts/v1/properties/list?limit=100" : null, fetcher);

	// Fetch all channels for the organization
	const { data: allChannelsData } = useSWR<{
		channels: Channel[];
		total: number;
	}>(open ? "/api/contacts/v1/channels/list?limit=100" : null, fetcher);

	// All available channels
	const allChannels = allChannelsData?.channels || [];

	// Calculate enrolled channel IDs based on defaultSubscription logic
	// Logic: A contact is enrolled in a channel if:
	// 1. Channel has defaultSubscription="opt_in" AND there's no explicit "unenrolled" record
	// 2. OR there's an explicit "enrolled" record
	const enrolledChannelIds = (() => {
		if (!allChannels.length) return [];

		// Build a map of channelId -> subscription status from explicit subscriptions
		const subscriptionMap = new Map<string, "opt_in" | "opt_out">();
		if (contact?.channels) {
			for (const t of contact.channels) {
				subscriptionMap.set(t.id, t.subscription);
			}
		}

		return allChannels
			.filter((channel) => {
				const explicitStatus = subscriptionMap.get(channel.id);

				// If there's an explicit subscription record
				if (explicitStatus) {
					return explicitStatus === "opt_in";
				}

				// No explicit record - use channel's defaultSubscription setting
				return channel.defaultSubscription === "opt_in";
			})
			.map((channel) => channel.id);
	})();

	// Custom properties only (firstName/lastName are now system fields on the contact)
	const customProperties = propertiesData?.properties || [];

	// Reset form when contact changes or modal opens
	useEffect(() => {
		if (open && contact) {
			setEmail(contact.email);
			setFirstName(contact.firstName || "");
			setLastName(contact.lastName || "");
			setIsSubscribed(contact.status.toLowerCase() === "subscribed");
		}
	}, [contact, open]);

	// Set custom property values when contact data is loaded
	useEffect(() => {
		if (open && contact && contact.properties) {
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
	}, [contact, open, propertiesData?.properties]);

	// Initialize selected channels from subscriptions
	useEffect(() => {
		if (enrolledChannelIds.length > 0) {
			setSelectedChannelIds(enrolledChannelIds);
		}
	}, [enrolledChannelIds.join(",")]);

	// Cmd/Ctrl + Enter to submit
	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (open && !isSaving) {
				handleSubmit(new Event("submit") as unknown as React.FormEvent);
			}
		},
		{ enableOnFormTags: ["INPUT"] },
	);

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			setEmail("");
			setIsSubscribed(true);
			setFirstName("");
			setLastName("");
			setPropertyValues({});
			setSelectedChannelIds([]);
			setChannelInput("");
			setShowChannelDropdown(false);
		}
		onOpenChange(isOpen);
	};

	// Channel management handlers
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

	// Get channel name by id
	const getChannelName = (channelId: string) => {
		return allChannels.find((t) => t.id === channelId)?.name || "";
	};

	// Filter available channels for dropdown (all channels not already selected)
	const availableChannels = allChannels.filter(
		(channel) => !selectedChannelIds.includes(channel.id),
	);

	// Filter by search input
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
		if (!contact) return;

		setIsSaving(true);
		try {
			// Build custom properties record
			const propertiesPayload: Record<string, string | number> = {};
			for (const property of customProperties) {
				const value = propertyValues[property.id];
				if (value !== undefined && value !== "") {
					propertiesPayload[property.propertyName] =
						property.propertyType === "number" ? Number(value) : value;
				}
			}

			console.log("Updating contact with payload:", {
				firstName,
				lastName,
				status: isSubscribed ? "subscribed" : "unsubscribed",
				properties: propertiesPayload,
			});

			const response = await fetch(`/api/contacts/${contact.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					firstName: firstName || undefined,
					lastName: lastName || undefined,
					status: isSubscribed ? "subscribed" : "unsubscribed",
					properties:
						Object.keys(propertiesPayload).length > 0
							? propertiesPayload
							: undefined,
				}),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || "Failed to update contact");
			}

			// Handle channel subscription changes
			// Find channels that were added (in selectedChannelIds but not in enrolledChannelIds)
			const channelsToAdd = selectedChannelIds.filter(
				(id) => !enrolledChannelIds.includes(id),
			);

			// Find channels that were removed (in enrolledChannelIds but not in selectedChannelIds)
			const channelsToRemove = enrolledChannelIds.filter(
				(id) => !selectedChannelIds.includes(id),
			);

			// Add new subscriptions (backend now handles upsert)
			for (const channelId of channelsToAdd) {
				const enrollResponse = await fetch("/api/contacts/v1/subscriptions/add", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						contactId: contact.id,
						channelId,
						status: "enrolled",
					}),
				});
				if (!enrollResponse.ok) {
					console.error(`Failed to enroll contact in channel ${channelId}`);
				}
			}

			// Remove/unenroll from channels (backend now handles upsert)
			for (const channelId of channelsToRemove) {
				const unenrollResponse = await fetch(
					"/api/contacts/v1/subscriptions/add",
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							contactId: contact.id,
							channelId,
							status: "unenrolled",
						}),
					},
				);
				if (!unenrollResponse.ok) {
					console.error(`Failed to unenroll contact from channel ${channelId}`);
				}
			}

			toast.success("Contact updated successfully");
			handleOpenChange(false);
			// Invalidate the specific contact endpoint
			await mutate(`/api/contacts/retrieve/${contact.id}`);
			// Invalidate the specific subscriptions cache for this contact
			await mutate(
				`/api/contacts/v1/subscriptions/list?contactId=${contact.id}&limit=100`,
			);
			// Invalidate all contacts API cache
			await mutate(
				(key: string) =>
					typeof key === "string" && key.includes("/api/contacts/v1"),
			);
		} catch (error) {
			console.error("Failed to update contact:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to update contact",
			);
		} finally {
			setIsSaving(false);
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
							<Icon name="edit-2" className="h-4 w-4" />
						</div>
						<div className="flex-1">
							<Modal.Title>Edit Contact</Modal.Title>
						</div>
					</Modal.Header>
					{!contact && open ? (
						<div className="flex h-[400px] flex-col items-center justify-center space-y-4 p-8 text-center">
							<Spinner size={32} />
							<p className="text-sm text-text-sub-600">
								Loading contact details...
							</p>
						</div>
					) : (
						<form onSubmit={handleSubmit} className="flex flex-col">
							<Modal.Body className="max-h-[60vh] space-y-4 overflow-y-auto">
								{/* Email */}
								<div className="flex flex-col gap-1">
									<Label.Root htmlFor="email">Email</Label.Root>
									<Input.Root size="small">
										<Input.Wrapper>
											<Input.Input
												id="email"
												type="email"
												value={email || contact?.email || ""}
												onChange={(e) => setEmail(e.target.value)}
												disabled={isSaving}
												readOnly
												placeholder={contact?.email || "Email address"}
												className="cursor-not-allowed bg-bg-weak-50"
											/>
										</Input.Wrapper>
									</Input.Root>
								</div>

								{/* Subscribed Toggle */}
								<div className="border-stroke-soft-100 border-t pt-2">
									<button
										type="button"
										onClick={() => !isSaving && setIsSubscribed(!isSubscribed)}
										disabled={isSaving}
										className={`flex w-full cursor-pointer items-center justify-between rounded-xl border p-4 transition-all duration-200 ${
											isSubscribed
												? "border-success-base bg-success-light/20"
												: "border-error-base bg-error-light/20"
										} ${isSaving ? "cursor-not-allowed opacity-50" : ""}`}
									>
										<div className="flex flex-col items-start gap-0.5">
											<span
												className={`font-medium text-label-sm ${isSubscribed ? "text-success-base" : "text-error-base"}`}
											>
												{isSubscribed ? "Subscribed" : "Unsubscribed"}
											</span>
											<span
												className={`font-medium text-paragraph-xs ${isSubscribed ? "text-success-base" : "text-error-base"}`}
											>
												{isSubscribed
													? "Receives all emails including marketing and broadcasts"
													: "Receives transactional emails only"}
											</span>
										</div>
										<div
											className={`flex h-4.5 w-4.5 items-center justify-center rounded transition-all duration-200 ${
												isSubscribed
													? "bg-success-base"
													: "border border-error-base bg-bg-white-0"
											}`}
										>
											{isSubscribed && (
												<svg
													width="10"
													height="10"
													viewBox="0 0 12 10"
													fill="none"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														d="M1 5L4.5 8.5L11 1.5"
														stroke="white"
														strokeWidth="1.5"
														strokeLinecap="round"
														strokeLinejoin="round"
													/>
												</svg>
											)}
										</div>
									</button>
								</div>

								{/* Channels */}
								<div className="flex flex-col gap-1 border-stroke-soft-100 border-t pt-4">
									<Label.Root htmlFor="channels">Channels</Label.Root>
									<div className="relative">
										<label className="group/chips flex min-h-[44px] cursor-text flex-wrap content-start gap-1.5 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 shadow-regular-xs transition duration-200 ease-out focus-within:border-stroke-strong-950 focus-within:shadow-button-important-focus hover:[&:not(:focus-within)]:bg-bg-weak-50">
											{selectedChannelIds.map((channelId) => {
												const channelName = getChannelName(channelId);
												if (!channelName) return null;
												return (
													<span
														key={channelId}
														className="inline-flex items-center gap-1 rounded-md border border-stroke-soft-200 bg-bg-weak-50 px-2 py-0.5 text-paragraph-xs text-text-strong-950"
													>
														{channelName}
														<button
															type="button"
															onClick={(e) => {
																e.preventDefault();
																e.stopPropagation();
																removeChannel(channelId);
															}}
															className="ml-0.5 text-text-sub-600 transition-colors hover:text-text-strong-950"
															disabled={isSaving}
														>
															<Icon name="cross" className="h-3 w-3" />
														</button>
													</span>
												);
											})}
											<input
												ref={channelInputRef}
												type="text"
												value={channelInput}
												onChange={(e) => {
													setChannelInput(e.target.value);
													setShowChannelDropdown(true);
												}}
												onFocus={() => setShowChannelDropdown(true)}
												onBlur={(e) => {
													// Close dropdown if focus leaves to outside the dropdown
													const relatedTarget = e.relatedTarget as HTMLElement;
													if (!relatedTarget?.closest(".absolute")) {
														setShowChannelDropdown(false);
													}
												}}
												placeholder={
													selectedChannelIds.length === 0 ? "Add Channels..." : ""
												}
												className="min-w-[80px] flex-1 bg-transparent text-paragraph-sm text-text-sub-600 outline-none placeholder:text-text-soft-400"
												disabled={isSaving}
											/>
										</label>
										{/* Dropdown */}
										{showChannelDropdown && filteredChannels.length > 0 && (
											<div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-lg">
												{filteredChannels.map((channel) => (
													<button
														key={channel.id}
														type="button"
														onClick={() => addChannel(channel.id)}
														className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-paragraph-sm text-text-strong-950 transition-colors hover:bg-bg-weak-50"
													>
														<Icon
															name="hash"
															className="h-3 w-3 text-text-sub-600"
														/>
														{channel.name}
														{channel.defaultSubscription === "opt_out" && (
															<span className="ml-auto text-paragraph-xs text-text-soft-400">
																Opt-out
															</span>
														)}
													</button>
												))}
											</div>
										)}
										{showChannelDropdown &&
											filteredChannels.length === 0 &&
											channelInput && (
												<div className="absolute z-10 mt-1 w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-lg">
													<p className="text-paragraph-sm text-text-soft-400">
														No channels found
													</p>
												</div>
											)}
									</div>
								</div>

								{/* First Name - System property, always shown */}
								<div className="flex flex-col gap-1 border-stroke-soft-100 border-t pt-4">
									<Label.Root htmlFor="firstName">First name</Label.Root>
									<Input.Root size="small">
										<Input.Wrapper>
											<Input.Input
												id="firstName"
												type="text"
												value={firstName}
												onChange={(e) => setFirstName(e.target.value)}
												disabled={isSaving}
												placeholder="Your contact name"
											/>
										</Input.Wrapper>
									</Input.Root>
								</div>

								{/* Last Name - System property, always shown */}
								<div className="flex flex-col gap-1">
									<Label.Root htmlFor="lastName">Last name</Label.Root>
									<Input.Root size="small">
										<Input.Wrapper>
											<Input.Input
												id="lastName"
												type="text"
												value={lastName}
												onChange={(e) => setLastName(e.target.value)}
												disabled={isSaving}
												placeholder="Your contact last name"
											/>
										</Input.Wrapper>
									</Input.Root>
								</div>

								{/* Custom Properties */}
								{customProperties.length > 0 && (
									<div className="space-y-4 border-stroke-soft-100 border-t pt-4">
										{customProperties.map((property) => (
											<div key={property.id} className="flex flex-col gap-1">
												<Label.Root htmlFor={`prop-${property.id}`}>
													{property.propertyName}
												</Label.Root>
												<Input.Root size="small">
													<Input.Wrapper>
														<Input.Input
															id={`prop-${property.id}`}
															type={
																property.propertyType === "number"
																	? "number"
																	: "text"
															}
															value={propertyValues[property.id]}
															onChange={(e) =>
																handlePropertyChange(
																	property.id,
																	e.target.value,
																)
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
									disabled={isSaving}
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
					)}
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
