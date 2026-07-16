import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useInvalidateContacts } from "#/features/contacts/hooks/use-contacts-query";

interface CreateGroupModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const CreateGroupModal = ({
	open,
	onOpenChange,
}: CreateGroupModalProps) => {
	const invalidate = useInvalidateContacts();
	const [name, setName] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Command/Ctrl + Enter to submit
	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			if (open && !isSubmitting && name.trim()) {
				handleSubmit();
			}
		},
		{ enableOnFormTags: true, enabled: open },
		[open, isSubmitting, name],
	);

	const handleClose = (isOpen: boolean) => {
		if (!isOpen) {
			setName("");
		}
		onOpenChange(isOpen);
	};

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!name.trim()) return;

		setIsSubmitting(true);
		try {
			const response = await fetch("/api/contacts/v1/groups/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to create group");
			}

			toast.success("Group created successfully");
			void invalidate();
			handleClose(false);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to create group",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Modal.Root open={open} onOpenChange={handleClose}>
			<Modal.Content
				className="rounded-2xl border border-stroke-soft-100/50 p-0.5 sm:max-w-[425px]"
				showClose={true}
			>
				<div className="rounded-2xl border border-stroke-soft-100/50">
					<Modal.Header className="before:border-stroke-soft-200/50">
						<div className="flex items-center justify-center">
							<Icon name="modules" className="h-4 w-4" />
						</div>
						<div className="flex-1">
							<Modal.Title className="font-semibold">Create Group</Modal.Title>
						</div>
					</Modal.Header>
					<form onSubmit={handleSubmit} className="flex flex-col">
						<Modal.Body className="relative space-y-4">
							<div className="relative flex flex-col gap-1.5">
								<Label.Root htmlFor="name">
									Group Name
									<span className="text-primary-base">*</span>
								</Label.Root>
								<Input.Root size="small" className="rounded-xl">
									<Input.Wrapper>
										<Input.Input
											id="name"
											placeholder="e.g. VIP Customers, Early Adopters"
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
								onClick={() => handleClose(false)}
								disabled={isSubmitting}
							>
								Cancel
								<KbdEsc />
							</Button.Root>
							<Button.Root
								type="submit"
								disabled={isSubmitting || !name.trim()}
							>
								{isSubmitting ? (
									<>
										<Spinner size={14} color="currentColor" />
										Creating...
									</>
								) : (
									<>
										Create Group
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
