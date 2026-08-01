"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { queryKeys } from "#/lib/query-keys";
import {
	type CustomEvent,
	createCustomEvent,
	listCustomEvents,
} from "../hooks/use-custom-events-api";

interface TriggerConfigFormProps {
	/** Custom event key stored on the trigger node */
	value: string | undefined;
	onChange: (
		eventKey: string,
		meta?: { eventId: string; name: string },
	) => void;
}

export const TriggerConfigForm = ({
	value,
	onChange,
}: TriggerConfigFormProps) => {
	const queryClient = useQueryClient();
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [createOpen, setCreateOpen] = useState(false);
	const [newName, setNewName] = useState("");
	const [newKey, setNewKey] = useState("");
	const [newPropName, setNewPropName] = useState("");
	const [busy, setBusy] = useState(false);

	const eventsQuery = useQuery({
		queryKey: queryKeys.workflows.events(),
		queryFn: () => listCustomEvents(100),
	});

	const events = eventsQuery.data?.events ?? [];

	const filteredEvents = useMemo(() => {
		const query = searchQuery.toLowerCase().trim();
		if (!query) return events;
		return events.filter(
			(event) =>
				event.name.toLowerCase().includes(query) ||
				event.key.toLowerCase().includes(query) ||
				(event.description?.toLowerCase().includes(query) ?? false),
		);
	}, [events, searchQuery]);

	const selected = events.find((e) => e.key === value);

	const handleSelect = (event: CustomEvent) => {
		onChange(event.key, { eventId: event.id, name: event.name });
		setIsOpen(false);
	};

	const handleCreate = async () => {
		const name = newName.trim();
		if (!name || busy) return;
		setBusy(true);
		try {
			const props = newPropName.trim()
				? [{ name: newPropName.trim(), propertyType: "string" as const }]
				: undefined;
			const created = await createCustomEvent({
				name,
				key: newKey.trim() || undefined,
				properties: props,
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.workflows.events(),
			});
			onChange(created.key, { eventId: created.id, name: created.name });
			setCreateOpen(false);
			setNewName("");
			setNewKey("");
			setNewPropName("");
			toast.success("Event created");
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Failed to create event");
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="flex flex-col gap-4">
			<div>
				<p className="mb-1 font-medium text-sm text-text-strong-950">
					Workflow event
				</p>
				<p className="mb-3 text-text-sub-600 text-xs">
					Choose a custom event you defined for workflows. These are separate
					from webhooks.
				</p>
				<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
					<Dropdown.Trigger asChild>
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="small"
							className={cn(
								"w-full justify-between bg-bg-white-0 px-3 font-normal hover:bg-bg-weak-50/50",
								!value && "text-text-soft-400",
							)}
						>
							<span className="truncate">
								{selected
									? `${selected.name} (${selected.key})`
									: value
										? value
										: "Select workflow event..."}
							</span>
							<Icon
								name="chevron-down"
								className={cn(
									"h-4 w-4 shrink-0 transition-transform",
									isOpen && "rotate-180",
								)}
							/>
						</Button.Root>
					</Dropdown.Trigger>
					<Dropdown.Content
						align="start"
						className="max-h-72 w-(--radix-dropdown-menu-trigger-width) overflow-y-auto rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-0 shadow-regular-md dark:border-stroke-soft-100/40"
					>
						<div className="flex items-center gap-2 border-stroke-soft-100 border-b px-3 py-2">
							<Icon name="search" className="h-4 w-4 text-text-soft-400" />
							<input
								type="text"
								placeholder="Search events..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								onKeyDown={(e) => e.stopPropagation()}
								className="w-full border-none bg-transparent text-sm outline-none placeholder:text-text-soft-400"
							/>
						</div>
						<div className="space-y-0.5 p-1">
							{eventsQuery.isLoading ? (
								<div className="px-3 py-6 text-center text-sm text-text-soft-400">
									Loading…
								</div>
							) : filteredEvents.length === 0 ? (
								<div className="px-3 py-6 text-center text-sm text-text-soft-400">
									No workflow events yet
								</div>
							) : (
								filteredEvents.map((event) => (
									<button
										key={event.id}
										type="button"
										onClick={() => handleSelect(event)}
										className={cn(
											"flex w-full flex-col gap-0.5 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-bg-weak-50",
											value === event.key && "bg-bg-weak-50/80",
										)}
									>
										<span className="font-medium text-text-strong-950">
											{event.name}
										</span>
										<span className="font-mono text-text-sub-600 text-xs">
											{event.key}
											{event.properties.length > 0
												? ` · ${event.properties.length} prop${event.properties.length === 1 ? "" : "s"}`
												: ""}
										</span>
									</button>
								))
							)}
						</div>
						<div className="border-stroke-soft-100 border-t p-1">
							<button
								type="button"
								onClick={() => {
									setIsOpen(false);
									setCreateOpen(true);
								}}
								className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-text-strong-950 hover:bg-bg-weak-50"
							>
								<Icon name="plus" className="h-4 w-4" />
								Create event
							</button>
						</div>
					</Dropdown.Content>
				</Dropdown.Root>
			</div>

			{selected && selected.properties.length > 0 && (
				<div className="rounded-lg border border-stroke-soft-100 bg-bg-weak-50/40 p-3 dark:border-stroke-soft-100/50">
					<p className="mb-2 font-medium text-text-sub-600 text-xs uppercase tracking-wide">
						Properties
					</p>
					<ul className="space-y-1">
						{selected.properties.map((p) => (
							<li
								key={p.id}
								className="flex items-center justify-between text-xs"
							>
								<span className="font-mono text-text-strong-950">{p.name}</span>
								<span className="text-text-sub-600">
									{p.propertyType}
									{p.required ? " · required" : ""}
								</span>
							</li>
						))}
					</ul>
				</div>
			)}

			<Modal.Root open={createOpen} onOpenChange={setCreateOpen}>
				<Modal.Content className="max-w-md">
					<Modal.Header>
						<Modal.Title>Create workflow event</Modal.Title>
						<Modal.Description>
							Events are used only to start workflows. They are not webhook
							events.
						</Modal.Description>
					</Modal.Header>
					<Modal.Body className="flex flex-col gap-4">
						<div className="space-y-1.5">
							<Label.Root htmlFor="evt-name">Name</Label.Root>
							<Input.Root>
								<Input.Wrapper>
									<Input.Input
										id="evt-name"
										placeholder="e.g. User signed up"
										value={newName}
										onChange={(e) => setNewName(e.target.value)}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
						<div className="space-y-1.5">
							<Label.Root htmlFor="evt-key">
								Key{" "}
								<span className="font-normal text-text-sub-600">
									(optional)
								</span>
							</Label.Root>
							<Input.Root>
								<Input.Wrapper>
									<Input.Input
										id="evt-key"
										placeholder="user.signed_up"
										value={newKey}
										onChange={(e) => setNewKey(e.target.value)}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
						<div className="space-y-1.5">
							<Label.Root htmlFor="evt-prop">
								First property{" "}
								<span className="font-normal text-text-sub-600">
									(optional)
								</span>
							</Label.Root>
							<Input.Root>
								<Input.Wrapper>
									<Input.Input
										id="evt-prop"
										placeholder="plan"
										value={newPropName}
										onChange={(e) => setNewPropName(e.target.value)}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
					</Modal.Body>
					<Modal.Footer className="flex justify-end gap-3">
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={() => setCreateOpen(false)}
							disabled={busy}
						>
							Cancel
						</Button.Root>
						<Button.Root
							variant="neutral"
							size="small"
							onClick={() => void handleCreate()}
							disabled={!newName.trim() || busy}
						>
							{busy ? "Creating…" : "Create"}
						</Button.Root>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
		</div>
	);
};
