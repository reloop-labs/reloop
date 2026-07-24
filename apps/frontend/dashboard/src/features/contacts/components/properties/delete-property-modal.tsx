import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useInvalidateContacts } from "#/features/contacts/hooks/use-contacts-query";

interface Property {
	id: string;
	propertyName: string;
	propertyType: string;
	defaultValue: string | null;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface DeletePropertyModalProps {
	property: Property | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDeleteSuccess?: () => void;
}

export const DeletePropertyModal = ({
	property,
	open,
	onOpenChange,
	onDeleteSuccess,
}: DeletePropertyModalProps) => {
	const [confirmationName, setConfirmationName] = useState("");
	const [status, setStatus] = useState<"idle" | "deleting" | "success">("idle");
	const [isNameCopied, setIsNameCopied] = useState(false);
	const invalidate = useInvalidateContacts();

	const handleClose = () => {
		setConfirmationName("");
		setStatus("idle");
		setIsNameCopied(false);
		onOpenChange(false);
	};

	// Reset confirmation when modal closes or property changes
	useEffect(() => {
		if (!open) {
			const timer = setTimeout(() => {
				setConfirmationName("");
				setStatus("idle");
				setIsNameCopied(false);
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [open]);

	const canSubmit =
		property &&
		confirmationName === property.propertyName &&
		status !== "deleting";

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (open && canSubmit && status === "idle") {
				void handleDelete();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: open && !!property },
		[open, confirmationName, property, status, canSubmit],
	);

	const handleDelete = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!property || !canSubmit || status !== "idle") return;

		try {
			setStatus("deleting");
			const response = await fetch(
				`/api/contacts/v1/properties/${property.id}`,
				{
					method: "DELETE",
				},
			);

			if (!response.ok) {
				throw new Error("Failed to delete property");
			}

			setStatus("success");
			setTimeout(() => {
				void invalidate();
				onOpenChange(false);
				setConfirmationName("");
				onDeleteSuccess?.();
			}, 750);
		} catch (error) {
			console.error("Failed to delete property:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to delete property",
			);
			setStatus("idle");
		}
	};

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
						{!property && open ? (
							<div className="flex h-[200px] flex-col items-center justify-center space-y-4 text-center">
								<Icon
									name="loader-2"
									className="h-8 w-8 animate-spin text-text-sub-600"
								/>
								<p className="text-sm text-text-sub-600">
									Loading property details...
								</p>
							</div>
						) : property ? (
							<>
								<div className="relative pr-6">
									<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
										Delete property?
									</Modal.Title>
									<p className="mt-2 text-sm text-text-sub-600 leading-relaxed">
										This will permanently delete the property and its values
										from all contacts. This action cannot be undone.
									</p>
								</div>

								<form onSubmit={handleDelete} className="mt-5 space-y-4">
									{/* Property Info Card */}
									<div className="flex items-center gap-3 rounded-xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/30">
										<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-error-base/10 text-error-base">
											<Icon name="tag" className="h-4.5 w-4.5" />
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate font-medium text-sm text-text-strong-950">
												{property.propertyName}
											</p>
											<p className="mt-0.5 truncate font-medium text-text-sub-600 text-xs capitalize">
												{property.propertyType} property
											</p>
										</div>
									</div>

									{/* Confirmation Input */}
									<div className="space-y-2">
										<p className="text-paragraph-xs text-text-sub-600">
											Type{" "}
											<span className="inline-flex max-w-xs items-center gap-1 truncate rounded-md border border-stroke-soft-100 bg-bg-weak-50/50 px-1.5 py-0.5 font-medium text-text-strong-950 text-xs dark:border-stroke-soft-100/40 dark:bg-bg-strong-200">
												{property.propertyName}
												<button
													type="button"
													onClick={async () => {
														try {
															await navigator.clipboard.writeText(
																property.propertyName,
															);
															setIsNameCopied(true);
															setTimeout(() => setIsNameCopied(false), 2000);
														} catch {
															toast.error("Failed to copy property name");
														}
													}}
													className="text-text-soft-400 transition-colors hover:text-text-strong-950"
												>
													<Icon
														name={isNameCopied ? "check" : "copy"}
														className={`h-3 w-3 ${isNameCopied ? "text-success-base" : ""}`}
													/>
												</button>
											</span>{" "}
											to confirm
										</p>
										<Input.Root size="medium" className="rounded-xl">
											<Input.Wrapper>
												<Input.Input
													type="text"
													value={confirmationName}
													onChange={(e) => setConfirmationName(e.target.value)}
													placeholder={property.propertyName}
													disabled={status !== "idle"}
												/>
											</Input.Wrapper>
										</Input.Root>
									</div>

									{/* Actions */}
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
											variant={status === "success" ? "success" : "destructive"}
											size="small"
											disabled={
												status === "deleting" ||
												(status === "idle" &&
													confirmationName !== property.propertyName)
											}
											className={cn(
												"w-[160px] min-w-[160px] justify-center overflow-hidden transition-all duration-200",
												status === "deleting" && "opacity-90",
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
													{status === "deleting" ? (
														<>
															<Spinner size={14} color="currentColor" />
															<span>Deleting...</span>
														</>
													) : status === "success" ? (
														<>
															<Icon name="check-circle" className="h-4 w-4" />
															<span>Property Deleted</span>
														</>
													) : (
														<>
															Delete property
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
							</>
						) : null}
					</div>
				</motion.div>
			</Modal.Content>
		</Modal.Root>
	);
};
