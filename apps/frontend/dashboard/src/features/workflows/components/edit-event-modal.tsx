"use client";

import { useQueryState } from "nuqs";
import { useRef } from "react";
import { toast } from "sonner";
import type { CustomEvent } from "../hooks/use-custom-events-api";
import { CreateEventModal } from "./create-event-modal";

export function EditEventModal({ events }: { events: CustomEvent[] }) {
	const [editId, setEditId] = useQueryState("edit");
	const targetRef = useRef<CustomEvent | null>(null);
	const current = events.find((event) => event.id === editId);
	if (current) {
		targetRef.current = current;
	}
	const eventToEdit = current || (editId ? targetRef.current : null);

	return (
		<CreateEventModal
			open={!!editId && !!eventToEdit}
			event={eventToEdit}
			onOpenChange={(open) => {
				if (!open) void setEditId(null);
			}}
			onUpdated={(updated) => {
				toast.success(`Updated "${updated.name}"`);
			}}
		/>
	);
}
