"use client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

interface Group {
	id: string;
	name: string;
}

interface EditGroupModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	group: Group | null;
}

export const EditGroupModal = ({
	open,
	onOpenChange,
	group,
}: EditGroupModalProps) => {
	const { mutate } = useSWRConfig();
	const [name, setName] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (group) {
			setName(group.name);
		}
	}, [group]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!group || !name.trim() || name === group.name) return;

		setIsSubmitting(true);
		try {
			const response = await fetch(`/api/contacts/v1/groups/${group.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to update group");
			}

			toast.success("Group updated successfully");
			mutate(
				(key: string) =>
					typeof key === "string" && key.startsWith("/api/contacts/v1/groups"),
			);
			onOpenChange(false);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to update group",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
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
							<Modal.Title>Edit Group</Modal.Title>
						</div>
					</Modal.Header>
					<form onSubmit={handleSubmit} className="flex flex-col">
						<Modal.Body className="relative space-y-4">
							<div className="flex flex-col gap-1">
								<Label.Root htmlFor="edit-name">Group Name</Label.Root>
								<Input.Root size="small">
									<Input.Wrapper>
										<Input.Input
											id="edit-name"
											value={name}
											onChange={(e) => setName(e.target.value)}
											autoFocus
											disabled={isSubmitting}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
						</Modal.Body>
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
								<KbdEsc />
							</Button.Root>
							<Button.Root
								type="submit"
								variant="neutral"
								size="xsmall"
								disabled={isSubmitting || !name.trim() || name === group?.name}
							>
								{isSubmitting ? (
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
