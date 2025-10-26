"use client";
import * as Button from "@reloop/ui/button";
import * as Checkbox from "@reloop/ui/checkbox";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

interface EventSubscriptionsProps {
	webhookId: string;
}

interface Event {
	id: string;
	name: string;
	description: string | null;
	category: string;
	isActive: boolean;
}

interface Subscription {
	id: string;
	webhookId: string;
	eventId: string;
	isEnabled: boolean;
}

interface EventListResponse {
	events: Event[];
	total: number;
	page: number;
	limit: number;
}

interface SubscriptionListResponse {
	subscriptions: Subscription[];
	total: number;
	page: number;
	limit: number;
}

export const EventSubscriptions = ({ webhookId }: EventSubscriptionsProps) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());

	const { data: eventsData, isLoading: eventsLoading } =
		useSWR<EventListResponse>("/api/webhook/events/list", {
			revalidateOnFocus: false,
			revalidateOnReconnect: true,
		});

	const { data: subscriptionsData, isLoading: subscriptionsLoading } =
		useSWR<SubscriptionListResponse>(
			`/api/webhook/subscriptions/list?webhookId=${webhookId}`,
			{
				revalidateOnFocus: false,
				revalidateOnReconnect: true,
			},
		);

	// Get subscribed event IDs
	const subscribedEventIds = new Set(
		subscriptionsData?.subscriptions
			?.filter((sub) => sub.isEnabled)
			?.map((sub) => sub.eventId) || [],
	);

	// Filter events based on search and category
	const filteredEvents =
		eventsData?.events?.filter((event) => {
			const matchesSearch =
				searchQuery === "" ||
				event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				event.description?.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCategory =
				selectedCategory === "all" || event.category === selectedCategory;
			return matchesSearch && matchesCategory && event.isActive;
		}) || [];

	// Group events by category
	const eventsByCategory = filteredEvents.reduce(
		(acc, event) => {
			if (!acc[event.category]) {
				acc[event.category] = [];
			}
			acc[event.category].push(event);
			return acc;
		},
		{} as Record<string, Event[]>,
	);

	const categories = Array.from(
		new Set(eventsData?.events?.map((e) => e.category) || []),
	);

	const handleEventToggle = async (eventId: string, isSubscribed: boolean) => {
		try {
			if (isSubscribed) {
				// Unsubscribe
				await axios.delete(
					`/api/webhook/subscriptions/${webhookId}/unsubscribe/${eventId}`,
					{
						headers: { credentials: "include" },
					},
				);
				toast.success("Unsubscribed from event");
			} else {
				// Subscribe
				await axios.post(
					`/api/webhook/subscriptions/${webhookId}/subscribe`,
					{
						eventIds: [eventId],
					},
					{
						headers: { credentials: "include" },
					},
				);
				toast.success("Subscribed to event");
			}

			// Refresh subscriptions
			await mutate(`/api/webhook/subscriptions/list?webhookId=${webhookId}`);
		} catch (error) {
			toast.error("Failed to update subscription");
		}
	};

	const handleBulkSubscribe = async (eventIds: string[]) => {
		try {
			await axios.post(
				`/api/webhook/subscriptions/${webhookId}/subscribe`,
				{
					eventIds,
				},
				{
					headers: { credentials: "include" },
				},
			);
			toast.success(`Subscribed to ${eventIds.length} events`);
			await mutate(`/api/webhook/subscriptions/list?webhookId=${webhookId}`);
		} catch (error) {
			toast.error("Failed to subscribe to events");
		}
	};

	const handleBulkUnsubscribe = async (eventIds: string[]) => {
		try {
			await Promise.all(
				eventIds.map((eventId) =>
					axios.delete(
						`/api/webhook/subscriptions/${webhookId}/unsubscribe/${eventId}`,
						{
							headers: { credentials: "include" },
						},
					),
				),
			);
			toast.success(`Unsubscribed from ${eventIds.length} events`);
			await mutate(`/api/webhook/subscriptions/list?webhookId=${webhookId}`);
		} catch (error) {
			toast.error("Failed to unsubscribe from events");
		}
	};

	const subscribedCount = subscribedEventIds.size;

	return (
		<div className="space-y-6">
			{/* Header with stats */}
			<div className="rounded-lg border border-gray-200 bg-white p-6">
				<div className="mb-4 flex items-center justify-between">
					<div>
						<h3 className="font-medium text-gray-900 text-lg">
							Event Subscriptions
						</h3>
						<p className="mt-1 text-gray-500 text-sm">
							Subscribe to events to receive webhook notifications
						</p>
					</div>
					<div className="text-right">
						<div className="font-semibold text-2xl text-blue-600">
							{subscribedCount}
						</div>
						<div className="text-gray-500 text-sm">Subscribed events</div>
					</div>
				</div>

				{/* Filters */}
				<div className="flex items-center gap-4">
					<div className="flex-1">
						<Input.Root size="small">
							<Input.Wrapper>
								<Input.Icon
									as={() => <Icon name="search" className="h-4 w-4" />}
								/>
								<Input.Input
									type="text"
									placeholder="Search events..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>
					<div className="w-48">
						<select
							value={selectedCategory}
							onChange={(e) => setSelectedCategory(e.target.value)}
							className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						>
							<option value="all">All categories</option>
							{categories.map((category) => (
								<option key={category} value={category}>
									{category.charAt(0).toUpperCase() + category.slice(1)}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Events by category */}
			{eventsLoading || subscriptionsLoading ? (
				<div className="space-y-4">
					{Array.from({ length: 3 }).map((_, i) => (
						<div
							key={i}
							className="rounded-lg border border-gray-200 bg-white p-6"
						>
							<div className="mb-4 h-6 w-1/4 animate-pulse rounded bg-gray-200" />
							<div className="space-y-3">
								{Array.from({ length: 2 }).map((_, j) => (
									<div
										key={j}
										className="h-12 animate-pulse rounded bg-gray-100"
									/>
								))}
							</div>
						</div>
					))}
				</div>
			) : (
				<div className="space-y-6">
					{Object.entries(eventsByCategory).map(([category, events]) => (
						<div
							key={category}
							className="rounded-lg border border-gray-200 bg-white"
						>
							<div className="border-gray-200 border-b px-6 py-4">
								<div className="flex items-center justify-between">
									<h4 className="font-medium text-gray-900 text-lg capitalize">
										{category} Events
									</h4>
									<div className="flex items-center gap-2">
										<span className="text-gray-500 text-sm">
											{
												events.filter((e) => subscribedEventIds.has(e.id))
													.length
											}{" "}
											of {events.length} subscribed
										</span>
										{events.length > 0 && (
											<>
												<Button.Root
													size="xsmall"
													variant="neutral"
													onClick={() => {
														const unsubscribedIds = events
															.filter((e) => !subscribedEventIds.has(e.id))
															.map((e) => e.id);
														if (unsubscribedIds.length > 0) {
															handleBulkSubscribe(unsubscribedIds);
														}
													}}
												>
													Subscribe All
												</Button.Root>
												<Button.Root
													size="xsmall"
													variant="neutral"
													onClick={() => {
														const subscribedIds = events
															.filter((e) => subscribedEventIds.has(e.id))
															.map((e) => e.id);
														if (subscribedIds.length > 0) {
															handleBulkUnsubscribe(subscribedIds);
														}
													}}
												>
													Unsubscribe All
												</Button.Root>
											</>
										)}
									</div>
								</div>
							</div>

							<div className="p-6">
								{events.length === 0 ? (
									<p className="py-4 text-center text-gray-500 text-sm">
										No events found in this category
									</p>
								) : (
									<div className="space-y-3">
										{events.map((event) => {
											const isSubscribed = subscribedEventIds.has(event.id);
											return (
												<div
													key={event.id}
													className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
												>
													<div className="flex items-center gap-3">
														<Checkbox.Root
															checked={isSubscribed}
															onCheckedChange={() =>
																handleEventToggle(event.id, isSubscribed)
															}
														/>
														<div>
															<h5 className="font-medium text-gray-900">
																{event.name}
															</h5>
															{event.description && (
																<p className="mt-1 text-gray-500 text-sm">
																	{event.description}
																</p>
															)}
														</div>
													</div>
													<div className="flex items-center gap-2">
														{isSubscribed ? (
															<span className="rounded-full bg-green-50 px-2 py-1 text-green-600 text-xs">
																Subscribed
															</span>
														) : (
															<span className="rounded-full bg-gray-50 px-2 py-1 text-gray-500 text-xs">
																Not subscribed
															</span>
														)}
													</div>
												</div>
											);
										})}
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
