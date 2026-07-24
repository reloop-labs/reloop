import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
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

	const handleClose = () => {
		setName("");
		onOpenChange(false);
	};

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!name.trim() || isSubmitting) return;

		setIsSubmitting(true);
		try {
			const response = await fetch("/api/contacts/v1/groups/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: name.trim() }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to create group");
			}

			toast.success("Group created successfully");
			void invalidate();
			handleClose();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to create group",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (open && !isSubmitting && name.trim()) {
				void handleSubmit();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: open },
		[open, isSubmitting, name],
	);

	useEffect(() => {
		if (!open) {
			const timer = setTimeout(() => {
				setName("");
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [open]);

	return (
		<Modal.Root open={open} onOpenChange={(o) => !o && handleClose()}>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={true}
			>
				<motion.div
					layout
					transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
				>
					<div className="p-6">
						<div className="relative pr-6">
							<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
								Create group
							</Modal.Title>
						</div>

						<form onSubmit={handleSubmit} className="mt-5">
							<div className="space-y-2">
								<Label.Root htmlFor="group-name">
									Group name
									<Label.Asterisk />
								</Label.Root>
								<Input.Root size="medium">
									<Input.Wrapper>
										<Input.Input
											id="group-name"
											placeholder="e.g., VIP Customers, Early Adopters"
											value={name}
											onChange={(e) => setName(e.target.value)}
											autoFocus
											disabled={isSubmitting}
										/>
									</Input.Wrapper>
								</Input.Root>
								<p className="text-paragraph-xs text-text-sub-600">
									Provide a descriptive name to help you identify this group later.
								</p>
							</div>

							<div className="mt-6 flex items-center justify-end gap-3">
								<Button.Root
									type="button"
									variant="neutral"
									mode="ghost"
									size="small"
									onClick={handleClose}
									className={cn(
										"transition-opacity duration-200",
										isSubmitting && "pointer-events-none opacity-50",
									)}
								>
									Cancel
								</Button.Root>

								<FancyButton.Root
									type="submit"
									variant="blue"
									size="small"
									disabled={isSubmitting || !name.trim()}
									className={cn(
										"min-w-[130px] justify-center overflow-hidden transition-all duration-200",
										isSubmitting && "pointer-events-none opacity-90",
									)}
								>
									<AnimatePresence mode="popLayout" initial={false}>
										<motion.span
											key={isSubmitting ? "creating" : "idle"}
											transition={{
												type: "spring",
												duration: 0.25,
												bounce: 0,
											}}
											initial={{ opacity: 0, y: -14 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 14 }}
											className="flex items-center justify-center gap-1.5"
										>
											{isSubmitting ? (
												<>
													<Spinner size={14} color="currentColor" />
													<span>Creating...</span>
												</>
											) : (
												<>
													Create group
													<span className="inline-flex items-center gap-0.5 opacity-80">
														<Icon
															name="command"
															className="h-3.5 w-3.5 rounded-sm border border-white/20 p-px"
														/>
														<Icon
															name="enter"
															className="h-3.5 w-3.5 rounded-sm border border-white/20 p-px"
														/>
													</span>
												</>
											)}
										</motion.span>
									</AnimatePresence>
								</FancyButton.Root>
							</div>
						</form>
					</div>
				</motion.div>
			</Modal.Content>
		</Modal.Root>
	);
};
