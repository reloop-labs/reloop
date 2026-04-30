"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import useSWR, { useSWRConfig } from "swr";

interface Contact {
	id: string;
	email: string;
}

interface Subscription {
	id: string;
	contactId: string;
	channelId: string;
	organizationId: string;
	status: "subscribed" | "unsubscribed";
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface SubscriptionListResponse {
	subscriptions: Subscription[];
	total: number;
	page: number;
	limit: number;
}

interface AddContactToChannelModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const AddContactToChannelModal = ({
	open,
	onOpenChange,
}: AddContactToChannelModalProps) => {
	const params = useParams();
	const channelId = params.channelId as string;
	const { mutate } = useSWRConfig();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [searchInput, setSearchInput] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [showDropdown, setShowDropdown] = useState(false);
	const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(searchInput);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchInput]);

	const { data } = useSWR<{ contacts: Contact[] }>(
		open
			? `/api/contacts/list?limit=100${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ""}`
			: null,
	);

	// Also fetch the current channel's contacts so we don't show already-added contacts
	const { data: channelData } = useSWR<SubscriptionListResponse>(
		open && channelId
			? `/api/contacts/v1/subscriptions/list?channelId=${channelId}&limit=100`
			: null,
	);

	const allContacts = data?.contacts || [];
	const currentChannelContactIds =
		channelData?.subscriptions?.map((s) => s.contactId) || [];

	const addContact = (contactId: string) => {
		if (!selectedContactIds.includes(contactId)) {
			setSelectedContactIds([...selectedContactIds, contactId]);
		}
		setSearchInput("");
		setShowDropdown(false);
		inputRef.current?.focus();
	};

	const removeContact = (contactId: string) => {
		setSelectedContactIds(selectedContactIds.filter((id) => id !== contactId));
	};

	const getContactEmail = (contactId: string) => {
		return allContacts.find((c) => c.id === contactId)?.email || "";
	};

	// Only show contacts that are NOT already in the channel AND NOT already selected
	const availableContacts = allContacts.filter(
		(contact) =>
			!selectedContactIds.includes(contact.id) &&
			!currentChannelContactIds.includes(contact.id),
	);

	const filteredContacts = searchInput
		? availableContacts.filter((c) =>
				c.email.toLowerCase().includes(searchInput.toLowerCase()),
			)
		: availableContacts;

	const handleOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			setSelectedContactIds([]);
			setSearchInput("");
		}
		onOpenChange(isOpen);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!channelId) {
			toast.error("Channel ID not found");
			return;
		}

		if (selectedContactIds.length === 0) {
			toast.error("Please select at least one contact");
			return;
		}

		setIsSubmitting(true);
		try {
			let added = 0;
			for (const contactId of selectedContactIds) {
				const emailPayload = getContactEmail(contactId);
				if (!emailPayload) continue;

				const response = await fetch(`/api/contacts/channel/${channelId}`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email: emailPayload, subscription: "opt_in" }),
				});

				if (response.ok) {
					added++;
				}
			}

			if (added > 0) {
				toast.success(`${added} contact(s) added to channel`);
			} else {
				toast.error("Failed to add contacts to channel");
			}

			handleOpenChange(false);

			// Re-fetch the channel contact list
			await mutate(
				`/api/contacts/v1/subscriptions/list?channelId=${channelId}&limit=100`,
			);
		} catch (error) {
			console.error("Failed to add contacts:", error);
			toast.error("Failed to add contacts to channel");
		} finally {
			setIsSubmitting(false);
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
							<Icon name="user-plus" className="h-4 w-4" />
						</div>
						<div className="flex-1">
							<Modal.Title>Add Contacts to Channel</Modal.Title>
						</div>
					</Modal.Header>
					<form onSubmit={handleSubmit} className="flex flex-col">
						<Modal.Body className="relative space-y-4">
							<div className="flex flex-col gap-1 border-stroke-soft-100 pt-2">
								<Label.Root htmlFor="contacts">Select Contacts</Label.Root>
								<div className="relative">
									<label className="group/chips flex min-h-[44px] cursor-text flex-wrap content-start gap-1.5 rounded-xl border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 shadow-regular-xs transition duration-200 ease-out focus-within:border-stroke-strong-950 focus-within:shadow-button-important-focus hover:[&:not(:focus-within)]:bg-bg-weak-50">
										{selectedContactIds.map((contactId) => {
											const email = getContactEmail(contactId);
											if (!email) return null;
											return (
												<span
													key={contactId}
													className="inline-flex items-center gap-1 rounded-md border border-stroke-soft-200 bg-bg-weak-50 px-2 py-0.5 text-paragraph-xs text-text-strong-950"
												>
													<Icon
														name="mail-single"
														className="h-3 w-3 text-text-sub-600"
													/>
													{email}
													<button
														type="button"
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															removeContact(contactId);
														}}
														className="ml-0.5 text-text-sub-600 transition-colors hover:text-text-strong-950"
														disabled={isSubmitting}
													>
														<Icon name="cross" className="h-3 w-3" />
													</button>
												</span>
											);
										})}
										<input
											ref={inputRef}
											type="text"
											value={searchInput}
											onChange={(e) => {
												setSearchInput(e.target.value);
												setShowDropdown(true);
											}}
											onFocus={() => setShowDropdown(true)}
											onBlur={(e) => {
												const relatedTarget = e.relatedTarget as HTMLElement;
												if (!relatedTarget?.closest(".absolute")) {
													setShowDropdown(false);
												}
											}}
											placeholder={
												selectedContactIds.length === 0
													? "Search existing contacts by email..."
													: ""
											}
											className="min-w-[120px] flex-1 bg-transparent text-paragraph-sm text-text-sub-600 outline-none placeholder:text-text-soft-400"
											disabled={isSubmitting}
										/>
									</label>

									{/* Dropdown */}
									{showDropdown && filteredContacts.length > 0 && (
										<div className="absolute z-10 mx-auto mt-1 max-h-48 w-[calc(100%-4px)] overflow-y-auto rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-lg">
											{filteredContacts.map((contact) => (
												<button
													key={contact.id}
													type="button"
													onMouseDown={(e) => {
														e.preventDefault();
														addContact(contact.id);
													}}
													className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-paragraph-sm text-text-strong-950 transition-colors hover:bg-bg-weak-50"
												>
													<Icon
														name="mail-single"
														className="h-3 w-3 text-text-sub-600"
													/>
													{contact.email}
												</button>
											))}
										</div>
									)}
									{showDropdown &&
										filteredContacts.length === 0 &&
										searchInput && (
											<div className="absolute z-10 mx-auto mt-1 w-[calc(100%-4px)] rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-lg">
												<p className="text-paragraph-sm text-text-soft-400">
													No available contacts found
												</p>
											</div>
										)}
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
								disabled={isSubmitting}
							>
								Cancel
								<KbdEsc />
							</Button.Root>
							<Button.Root
								type="submit"
								variant="neutral"
								size="xsmall"
								disabled={isSubmitting || selectedContactIds.length === 0}
							>
								{isSubmitting ? (
									<>
										<Spinner size={14} color="currentColor" />
										Adding...
									</>
								) : (
									<>
										Add{" "}
										{selectedContactIds.length > 0
											? selectedContactIds.length
											: ""}{" "}
										Contact
										{selectedContactIds.length !== 1 ? "s" : ""}
										<span className="inline-flex items-center gap-0.5">
											<Icon
												name="command"
												className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
											/>
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
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
