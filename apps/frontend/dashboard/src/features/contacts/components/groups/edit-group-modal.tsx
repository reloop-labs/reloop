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
import { useInvalidateContacts, type Group } from "#/features/contacts/hooks/use-contacts-query";

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
	const invalidate = useInvalidateContacts();
	const [name, setName] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [status, setStatus] = useState<"idle" | "saving" | "success">("idle");

	useEffect(() => {
		if (group) {
			setName(group.name);
		}
	}, [group]);

	const handleClose = () => {
		setError(null);
		setStatus("idle");
		onOpenChange(false);
	};

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!group || !name.trim() || status !== "idle") return;

		setError(null);
		setStatus("saving");
		try {
			const response = await fetch(`/api/contacts/v1/groups/${group.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: name.trim() }),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message || "Failed to update group");
			}

			setStatus("success");
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to update group",
			);
			setStatus("idle");
		}
	};

	useEffect(() => {
		if (status === "success") {
			const timer = setTimeout(() => {
				void invalidate();
				handleClose();
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [status, invalidate]);

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (open && status === "idle" && name.trim() && group && name !== group.name) {
				void handleSubmit();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: open && !!group },
		[open, status, name, group],
	);

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
								Edit group
							</Modal.Title>
						</div>

						<form onSubmit={handleSubmit} className="mt-5">
							<div className="space-y-2">
								<Label.Root htmlFor="edit-group-name">
									Group name
									<Label.Asterisk />
								</Label.Root>
								<Input.Root size="medium" hasError={Boolean(error)}>
									<Input.Wrapper>
										<Input.Input
											id="edit-group-name"
											placeholder="e.g., VIP Customers, Early Adopters"
											value={name}
											onChange={(e) => {
												setName(e.target.value);
												if (error) setError(null);
											}}
											autoFocus
											disabled={status !== "idle"}
										/>
									</Input.Wrapper>
								</Input.Root>
								{error ? (
									<p className="text-error-base text-paragraph-xs">
										{error}
									</p>
								) : (
									<p className="text-paragraph-xs text-text-sub-600">
										Provide a descriptive name to help you identify this group later.
									</p>
								)}
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
										status !== "idle" && "pointer-events-none opacity-50",
									)}
								>
									Cancel
								</Button.Root>

								<FancyButton.Root
									type="submit"
									variant={status === "success" ? "success" : "blue"}
									size="small"
									disabled={
										status === "saving" ||
										(status === "idle" && (!name.trim() || name === group?.name))
									}
									className={cn(
										"min-w-[140px] justify-center overflow-hidden transition-all duration-200",
										status !== "idle" && "pointer-events-none",
										status === "saving" && "opacity-90",
									)}
								>
									<AnimatePresence mode="popLayout" initial={false}>
										<motion.span
											key={status}
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
											{status === "saving" ? (
												<>
													<Spinner size={14} color="currentColor" />
													<span>Saving...</span>
												</>
											) : status === "success" ? (
												<>
													<Icon name="check-circle" className="h-4 w-4" />
													<span>Group Updated</span>
												</>
											) : (
												<>
													Save changes
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
