"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Kbd from "@reloop/ui/kbd";
import * as Modal from "@reloop/ui/modal";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface Group {
	id: string;
	name: string;
}

interface DeleteGroupModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	group: Group | null;
}

export const DeleteGroupModal = ({
	open,
	onOpenChange,
	group,
}: DeleteGroupModalProps) => {
	const { mutate } = useSWRConfig();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleDelete = async () => {
		if (!group) return;

		setIsSubmitting(true);
		try {
			const response = await fetch(`/api/contacts/v1/groups/${group.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to delete group");
			}

			toast.success("Group deleted successfully");
			mutate(
				(key: string) =>
					typeof key === "string" && key.startsWith("/api/contacts/v1/groups"),
			);
			onOpenChange(false);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to delete group",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content
				className="rounded-2xl border border-stroke-soft-100/50 p-0.5 sm:max-w-[425px]"
				showClose={true}
			>
				<div className="rounded-2xl border border-stroke-soft-100/50">
					<Modal.Header className="before:border-stroke-soft-200/50">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error-base/10 text-error-base">
							<Icon name="trash" className="h-5 w-5" />
						</div>
						<div className="flex-1">
							<Modal.Title className="text-error-base">
								Delete Group
							</Modal.Title>
							<Modal.Description>
								Are you sure you want to delete the group{" "}
								<span className="font-semibold text-text-strong-950">
									"{group?.name}"
								</span>
								? This action cannot be undone.
							</Modal.Description>
						</div>
					</Modal.Header>
					<Modal.Footer className="mt-4 flex items-center justify-end gap-3 border-stroke-soft-100/50">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="xsmall"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
						>
							Cancel
							<Kbd.Root className="bg-bg-weak-50 text-xs">Esc</Kbd.Root>
						</Button.Root>
						<Button.Root
							variant="error"
							onClick={handleDelete}
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<Icon name="loader" className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Icon name="trash" className="mr-2 h-4 w-4" />
							)}
							Delete Group
						</Button.Root>
					</Modal.Footer>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
