import type { AudienceStatus } from "#/features/contacts/audience";
import { useInvalidateContacts } from "#/features/contacts/hooks/use-contacts-query";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
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
	const [selectedChannelIds, setSelectedChannelIds] = useState<string[]>([]);
	const [channelInput, setChannelInput] = useState("");
	const [showChannelDropdown, setShowChannelDropdown] = useState(false);
	const channelInputRef = useRef<HTMLInputElement>(null);

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

	const enrolledChannelIds = (() => {
		if (!allChannels.length) return [];

		const subscriptionMap = new Map<string, "opt_in" | "opt_out">();
		if (contact.channels) {
			for (const t of contact.channels) {
				subscriptionMap.set(t.id, t.subscription);
			}
		}

		return allChannels
			.filter((channel) => {
				const explicitStatus = subscriptionMap.get(channel.id);
				if (explicitStatus) {
					return explicitStatus === "opt_in";
				}
				return channel.defaultSubscription === "opt_in";
			})
			.map((channel) => channel.id);
	})();

	const customProperties = propertiesData?.properties || [];

	useEffect(() => {
		setEmail(contact.email);
		setFirstName(contact.firstName || "");
		setLastName(contact.lastName || "");
		setIsSubscribed(contact.status.toLowerCase() === "subscribed");
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

	useEffect(() => {
		if (enrolledChannelIds.length > 0) {
			setSelectedChannelIds(enrolledChannelIds);
		}
	}, [enrolledChannelIds]);

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

	const getChannelName = (channelId: string) => {
		return allChannels.find((t) => t.id === channelId)?.name || "";
	};

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

			const channelsToAdd = selectedChannelIds.filter(
				(id) => !enrolledChannelIds.includes(id),
			);
			const channelsToRemove = enrolledChannelIds.filter(
				(id) => !selectedChannelIds.includes(id),
			);

			for (const channelId of channelsToAdd) {
				const enrollResponse = await fetch(
					"/api/contacts/v1/subscriptions/add",
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							contactId: contact.id,
							channelId,
							status: "enrolled",
						}),
					},
				);
				if (!enrollResponse.ok) {
					console.error(`Failed to enroll contact in channel ${channelId}`);
				}
			}

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
			className={
				isInline
					? "grid gap-4 md:grid-cols-2"
					: "flex flex-col"
			}
			onClick={(e) => e.stopPropagation()}
		>
			<div
				className={
					isInline
						? "contents"
						: "max-h-[60vh] space-y-4 overflow-y-auto px-0"
				}
			>
				{/* Email — modal only; list row already shows it */}
				{!isInline && (
					<div className="flex flex-col gap-1">
						<Label.Root htmlFor={`email-${contact.id}`}>Email</Label.Root>
						<Input.Root size="small">
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
									aria-hidden="true"
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
				<div
					className={`flex flex-col gap-1 ${isInline ? "md:col-span-2" : "border-stroke-soft-100 border-t pt-4"}`}
				>
					<Label.Root htmlFor={`channels-${contact.id}`}>Channels</Label.Root>
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
								id={`channels-${contact.id}`}
								type="text"
								value={channelInput}
								onChange={(e) => {
									setChannelInput(e.target.value);
									setShowChannelDropdown(true);
								}}
								onFocus={() => setShowChannelDropdown(true)}
								onBlur={(e) => {
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

				{/* First Name */}
				<div
					className={`flex flex-col gap-1 ${isInline ? "" : "border-stroke-soft-100 border-t pt-4"}`}
				>
					<Label.Root htmlFor={`firstName-${contact.id}`}>First name</Label.Root>
					<Input.Root size="small">
						<Input.Wrapper>
							<Input.Input
								id={`firstName-${contact.id}`}
								type="text"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								disabled={isSaving}
								placeholder="Your contact name"
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>

				{/* Last Name */}
				<div className="flex flex-col gap-1">
					<Label.Root htmlFor={`lastName-${contact.id}`}>Last name</Label.Root>
					<Input.Root size="small">
						<Input.Wrapper>
							<Input.Input
								id={`lastName-${contact.id}`}
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
					<div
						className={`space-y-4 ${isInline ? "md:col-span-2" : "border-stroke-soft-100 border-t pt-4"}`}
					>
						{customProperties.map((property) => (
							<div key={property.id} className="flex flex-col gap-1">
								<Label.Root htmlFor={`prop-${contact.id}-${property.id}`}>
									{property.propertyName}
								</Label.Root>
								<Input.Root size="small">
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
			</div>

			<div
				className={`flex items-center justify-end gap-3 ${
					isInline
						? "md:col-span-2 pt-1"
						: "mt-4 border-stroke-soft-100/50 border-t"
				}`}
			>
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					size="xsmall"
					onClick={onCancel}
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
			</div>
		</form>
	);
}
