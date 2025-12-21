"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
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
	status: string;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface Property {
	id: string;
	name: string;
	type: string;
	fallbackValue: string | null;
}

interface PropertyValue {
	id: string;
	propertyId: string;
	value: string;
}

interface Topic {
	id: string;
	name: string;
	autoEnroll: "enrolled" | "unenrolled";
}

interface TopicEnrollment {
	id: string;
	contactId: string;
	topicId: string;
	status: "enrolled" | "unenrolled";
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
	// Topics state
	const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
	const [topicInput, setTopicInput] = useState("");
	const [showTopicDropdown, setShowTopicDropdown] = useState(false);
	const topicInputRef = useRef<HTMLInputElement>(null);

	// Fetch all custom properties for the organization
	const { data: propertiesData } = useSWR<{
		properties: Property[];
		total: number;
	}>(open ? "/api/contacts/v1/properties/list?limit=100" : null, fetcher);

	// Fetch property values for this contact
	const { data: contactPropsData } = useSWR<{
		propertyValues: PropertyValue[];
	}>(
		open && contact
			? `/api/contacts/v1/contacts/${contact.id}/properties`
			: null,
		fetcher,
	);

	// Fetch all topics for the organization
	const { data: allTopicsData } = useSWR<{
		topics: Topic[];
		total: number;
	}>(open ? "/api/contacts/v1/topics/list?limit=100" : null, fetcher);

	// Fetch contact's topic enrollments
	const { data: enrollmentsData } = useSWR<{
		enrollments: TopicEnrollment[];
		total: number;
	}>(
		open && contact
			? `/api/contacts/v1/enrollments/list?contactId=${contact.id}&limit=100`
			: null,
		fetcher,
	);

	// All available topics
	const allTopics = allTopicsData?.topics || [];

	// Calculate enrolled topic IDs based on autoEnroll logic
	// Logic: A contact is enrolled in a topic if:
	// 1. Topic has autoEnroll="enrolled" AND there's no explicit "unenrolled" record
	// 2. OR there's an explicit "enrolled" record
	const enrolledTopicIds = (() => {
		if (!allTopics.length) return [];

		// Build a map of topicId -> enrollment status from explicit enrollments
		const enrollmentMap = new Map<string, "enrolled" | "unenrolled">();
		if (enrollmentsData?.enrollments) {
			for (const e of enrollmentsData.enrollments) {
				enrollmentMap.set(e.topicId, e.status);
			}
		}

		return allTopics
			.filter((topic) => {
				const explicitStatus = enrollmentMap.get(topic.id);

				// If there's an explicit enrollment record
				if (explicitStatus) {
					return explicitStatus === "enrolled";
				}

				// No explicit record - use topic's autoEnroll setting
				return topic.autoEnroll === "enrolled";
			})
			.map((topic) => topic.id);
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

	// Set custom property values when fetched
	useEffect(() => {
		if (contactPropsData?.propertyValues) {
			const values: Record<string, string> = {};
			for (const pv of contactPropsData.propertyValues) {
				values[pv.propertyId] = pv.value;
			}
			setPropertyValues(values);
		}
	}, [contactPropsData]);

	// Initialize selected topics from enrollments
	useEffect(() => {
		if (enrolledTopicIds.length > 0) {
			setSelectedTopicIds(enrolledTopicIds);
		}
	}, [enrolledTopicIds.join(",")]);

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
			setSelectedTopicIds([]);
			setTopicInput("");
			setShowTopicDropdown(false);
		}
		onOpenChange(isOpen);
	};

	// Topic management handlers
	const addTopic = (topicId: string) => {
		if (!selectedTopicIds.includes(topicId)) {
			setSelectedTopicIds((prev) => [...prev, topicId]);
		}
		setTopicInput("");
		setShowTopicDropdown(false);
	};

	const removeTopic = (topicId: string) => {
		setSelectedTopicIds((prev) => prev.filter((id) => id !== topicId));
	};

	// Get topic name by id
	const getTopicName = (topicId: string) => {
		return allTopics.find((t) => t.id === topicId)?.name || "";
	};

	// Filter available topics for dropdown (all topics not already selected)
	const availableTopics = allTopics.filter(
		(topic) => !selectedTopicIds.includes(topic.id),
	);

	// Filter by search input
	const filteredTopics = topicInput
		? availableTopics.filter((t) =>
				t.name.toLowerCase().includes(topicInput.toLowerCase()),
			)
		: availableTopics;

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
			// Build custom properties array (firstName/lastName are now direct fields)
			const propsToUpdate: { propertyId: string; value: string }[] = [];
			for (const [propertyId, value] of Object.entries(propertyValues)) {
				if (value) {
					propsToUpdate.push({ propertyId, value });
				}
			}

			console.log("Updating contact with payload:", {
				firstName,
				lastName,
				status: isSubscribed ? "subscribed" : "unsubscribed",
				properties: propsToUpdate,
			});

			const response = await fetch(`/api/contacts/v1/contacts/${contact.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					firstName: firstName || undefined,
					lastName: lastName || undefined,
					status: isSubscribed ? "subscribed" : "unsubscribed",
					properties: propsToUpdate.length > 0 ? propsToUpdate : undefined,
				}),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || "Failed to update contact");
			}

			// Handle topic enrollment changes
			// Find topics that were added (in selectedTopicIds but not in enrolledTopicIds)
			const topicsToAdd = selectedTopicIds.filter(
				(id) => !enrolledTopicIds.includes(id),
			);

			// Find topics that were removed (in enrolledTopicIds but not in selectedTopicIds)
			const topicsToRemove = enrolledTopicIds.filter(
				(id) => !selectedTopicIds.includes(id),
			);

			// Add new enrollments (backend now handles upsert)
			for (const topicId of topicsToAdd) {
				const enrollResponse = await fetch("/api/contacts/v1/enrollments/add", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						contactId: contact.id,
						topicId,
						status: "enrolled",
					}),
				});
				if (!enrollResponse.ok) {
					console.error(`Failed to enroll contact in topic ${topicId}`);
				}
			}

			// Remove/unenroll from topics (backend now handles upsert)
			for (const topicId of topicsToRemove) {
				const unenrollResponse = await fetch(
					"/api/contacts/v1/enrollments/add",
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							contactId: contact.id,
							topicId,
							status: "unenrolled",
						}),
					},
				);
				if (!unenrollResponse.ok) {
					console.error(`Failed to unenroll contact from topic ${topicId}`);
				}
			}

			toast.success("Contact updated successfully");
			handleOpenChange(false);
			// Invalidate the specific contact endpoint
			await mutate(`/api/contacts/v1/contacts/get/${contact.id}`);
			// Invalidate the specific enrollments cache for this contact
			await mutate(
				`/api/contacts/v1/enrollments/list?contactId=${contact.id}&limit=100`,
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

							{/* Topics */}
							<div className="flex flex-col gap-1 border-stroke-soft-100 border-t pt-4">
								<Label.Root htmlFor="topics">Topics</Label.Root>
								<div className="relative">
									<label className="group/chips flex min-h-[44px] cursor-text flex-wrap content-start gap-1.5 rounded-xl bg-bg-white-0 px-3 py-2.5 shadow-regular-xs ring-1 ring-stroke-soft-200 ring-inset transition duration-200 ease-out focus-within:shadow-button-important-focus focus-within:ring-stroke-strong-950 hover:[&:not(:focus-within)]:bg-bg-weak-50 hover:[&:not(:focus-within)]:ring-transparent">
										{selectedTopicIds.map((topicId) => {
											const topicName = getTopicName(topicId);
											if (!topicName) return null;
											return (
												<span
													key={topicId}
													className="inline-flex items-center gap-1 rounded-md border border-stroke-soft-200 bg-bg-weak-50 px-2 py-0.5 text-paragraph-xs text-text-strong-950"
												>
													{topicName}
													<button
														type="button"
														onClick={(e) => {
															e.preventDefault();
															e.stopPropagation();
															removeTopic(topicId);
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
											ref={topicInputRef}
											type="text"
											value={topicInput}
											onChange={(e) => {
												setTopicInput(e.target.value);
												setShowTopicDropdown(true);
											}}
											onFocus={() => setShowTopicDropdown(true)}
											onBlur={(e) => {
												// Close dropdown if focus leaves to outside the dropdown
												const relatedTarget = e.relatedTarget as HTMLElement;
												if (!relatedTarget?.closest(".absolute")) {
													setShowTopicDropdown(false);
												}
											}}
											placeholder={
												selectedTopicIds.length === 0 ? "Add topics..." : ""
											}
											className="min-w-[80px] flex-1 bg-transparent text-paragraph-sm text-text-sub-600 outline-none placeholder:text-text-soft-400"
											disabled={isSaving}
										/>
									</label>
									{/* Dropdown */}
									{showTopicDropdown && filteredTopics.length > 0 && (
										<div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-lg">
											{filteredTopics.map((topic) => (
												<button
													key={topic.id}
													type="button"
													onClick={() => addTopic(topic.id)}
													className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-paragraph-sm text-text-strong-950 transition-colors hover:bg-bg-weak-50"
												>
													<Icon
														name="hash"
														className="h-3 w-3 text-text-sub-600"
													/>
													{topic.name}
													{topic.autoEnroll === "unenrolled" && (
														<span className="ml-auto text-paragraph-xs text-text-soft-400">
															Opt-out
														</span>
													)}
												</button>
											))}
										</div>
									)}
									{showTopicDropdown &&
										filteredTopics.length === 0 &&
										topicInput && (
											<div className="absolute z-10 mt-1 w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-lg">
												<p className="text-paragraph-sm text-text-soft-400">
													No topics found
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
												{property.name}
											</Label.Root>
											<Input.Root size="small">
												<Input.Wrapper>
													<Input.Input
														id={`prop-${property.id}`}
														type={
															property.type === "number" ? "number" : "text"
														}
														value={propertyValues[property.id]}
														onChange={(e) =>
															handlePropertyChange(property.id, e.target.value)
														}
														disabled={isSaving}
														placeholder={
															property.fallbackValue || `Enter ${property.name}`
														}
													/>
												</Input.Wrapper>
											</Input.Root>
										</div>
									))}
								</div>
							)}
						</Modal.Body>

						<Modal.Footer className="mt-4 justify-end border-stroke-soft-100/50">
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
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
