import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { FieldError, useFieldError } from "@reloop/ui/field-error";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";

const actionKbdOnDestructiveClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

const getBadgeColor = (type?: string) => {
	switch (type?.toLowerCase()) {
		case "string":
			return "blue";
		case "number":
			return "purple";
		default:
			return "gray";
	}
};

interface DeleteTemplateVariableModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => Promise<void>;
	variableName: string;
	variableType?: string;
	defaultValue?: string | null;
	isSubmitting?: boolean;
}

type DeleteState = "idle" | "deleting" | "success";

export const DeleteTemplateVariableModal = ({
	isOpen,
	onClose,
	onConfirm,
	variableName,
	variableType = "string",
	defaultValue = null,
	isSubmitting = false,
}: DeleteTemplateVariableModalProps) => {
	const [confirmationText, setConfirmationText] = useState("");
	const [deleteState, setDeleteState] = useState<DeleteState>("idle");
	const [nameCopied, setNameCopied] = useState(false);
	const confirmField = useFieldError();

	// Cache details so they remain stable during exit animations
	const cachedNameRef = useRef(variableName);
	if (variableName) {
		cachedNameRef.current = variableName;
	}
	const displayName = variableName || cachedNameRef.current || "";

	const handleCopyName = async () => {
		try {
			await navigator.clipboard.writeText(displayName);
			setNameCopied(true);
			setTimeout(() => setNameCopied(false), 1500);
		} catch {
			// silently fail
		}
	};

	const handleDelete = async () => {
		if (deleteState !== "idle") return;

		if (confirmationText.trim() !== displayName) {
			confirmField.show(`Please type "${displayName}" to confirm`);
			return;
		}

		try {
			setDeleteState("deleting");
			await onConfirm();
			setDeleteState("success");

			setTimeout(() => {
				onClose();
				setTimeout(() => {
					setDeleteState("idle");
					setConfirmationText("");
					confirmField.clear();
				}, 300);
			}, 450);
		} catch (error) {
			setDeleteState("idle");
		}
	};

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (isOpen && deleteState === "idle") {
				void handleDelete();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: isOpen },
		[isOpen, confirmationText, displayName, deleteState],
	);

	useHotkeys(
		"escape",
		() => {
			if (isOpen && deleteState === "idle") {
				handleCancel();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: isOpen },
		[isOpen, deleteState],
	);

	useEffect(() => {
		if (!isOpen) {
			const timer = setTimeout(() => {
				setDeleteState("idle");
				setConfirmationText("");
				confirmField.clear();
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	const handleCancel = () => {
		if (deleteState !== "idle" || isSubmitting) return;
		onClose();
	};

	return (
		<Modal.Root open={isOpen} onOpenChange={(o) => !o && handleCancel()}>
			<Modal.Content
				className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 p-0 sm:max-w-[460px] dark:border-stroke-soft-100/40 dark:bg-white/[0.03]"
				showClose={false}
				onOpenAutoFocus={(e) => {
					e.preventDefault();
					setTimeout(() => confirmField.inputRef.current?.focus(), 0);
				}}
			>
				<div className="relative m-0.5 space-y-4 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 pt-5 dark:border-stroke-soft-100/40 dark:bg-[#0c0c0c]">
					{/* Header */}
					<div className="flex items-start justify-between px-6 dark:border-stroke-soft-100/40">
						<Modal.Title className="font-medium text-text-strong-950 text-xl tracking-tight">
							Delete variable
						</Modal.Title>
						<button
							type="button"
							onClick={handleCancel}
							aria-label="Close"
							disabled={deleteState !== "idle"}
							className="flex h-7 w-7 items-center justify-center rounded-lg bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 active:scale-[0.95] disabled:opacity-50 dark:border-stroke-soft-100/40 dark:bg-transparent dark:hover:bg-white/[0.05]"
						>
							<X className="size-3.5" strokeWidth={2.25} />
						</button>
					</div>

					<div className="space-y-3 px-6 pb-6">
						<p className="text-text-sub-600 text-xs leading-relaxed">
							Are you sure you want to delete this variable? This action cannot
							be undone.
						</p>

						{/* Details Card */}
						<div className="grid grid-cols-3 gap-3 rounded-xl border border-stroke-soft-200 bg-bg-soft-50 p-3.5 dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
							<div>
								<p className="font-normal text-text-sub-600 text-[11px]">
									Variable name
								</p>
								<p className="mt-0.5 truncate font-mono font-semibold text-text-strong-950 text-xs">
									{"{{{"}
									{displayName}
									{"}}}"}
								</p>
							</div>
							<div>
								<p className="font-normal text-text-sub-600 text-[11px]">
									Variable type
								</p>
								<div className="mt-0.5 flex items-center">
									<Badge.Root
										size="small"
										variant="lighter"
										color={getBadgeColor(variableType)}
										className="h-[18px] rounded-full px-1.5 font-semibold text-[10px] capitalize"
									>
										{variableType || "String"}
									</Badge.Root>
								</div>
							</div>
							<div>
								<p className="font-normal text-text-sub-600 text-[11px]">
									Default value
								</p>
								<p className="mt-0.5 truncate font-mono text-text-strong-950 text-xs">
									{defaultValue ? `"${defaultValue}"` : "—"}
								</p>
							</div>
						</div>

						{/* Warning Banner */}
						<div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-3 text-amber-900 text-[11px] leading-relaxed dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-200">
							<span className="font-semibold text-amber-950 dark:text-amber-100">
								Warning:
							</span>{" "}
							Deleting this variable will remove its configuration. Any tags in
							your template using this variable will no longer resolve fallback
							values.
						</div>

						{/* Confirmation Input */}
						<div className="space-y-1.5 pt-1">
							<Label.Root
								htmlFor="delete-variable-confirmation"
								className="flex flex-wrap items-center gap-1.5 text-xs text-text-sub-600"
							>
								<span>Type</span>
								<span className="inline-flex items-center gap-1 rounded-md bg-bg-weak-50 px-1.5 py-0.5 font-medium text-[12px] text-text-strong-950 dark:bg-bg-weak-50/20">
									{displayName}
									<button
										type="button"
										onClick={(e) => {
											e.preventDefault();
											void handleCopyName();
										}}
										className="-mr-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded transition-colors hover:text-text-strong-950"
										aria-label={`Copy ${displayName}`}
										title="Copy name"
									>
										<Icon
											name={nameCopied ? "check" : "copy"}
											className="h-3 w-3 text-text-sub-600"
										/>
									</button>
								</span>
								<span>to confirm</span>
							</Label.Root>
							<FieldError field={confirmField}>
								<Input.Root
									size="medium"
									className="rounded-xl"
									hasError={confirmField.hasError}
								>
									<Input.Wrapper>
										<Input.Input
											id="delete-variable-confirmation"
											{...confirmField.controlProps}
											value={confirmationText}
											onChange={(e) => {
												setConfirmationText(e.target.value);
												if (
													confirmField.hasError &&
													e.target.value.trim() === displayName
												) {
													confirmField.clear();
												}
											}}
											placeholder={displayName}
											autoComplete="off"
											disabled={deleteState !== "idle"}
											autoFocus
										/>
									</Input.Wrapper>
								</Input.Root>
							</FieldError>
						</div>
					</div>
				</div>

				{/* Actions / Footer */}
				<div className="relative flex items-center justify-between gap-3 px-3 pt-2 pb-3">
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="small"
						onClick={handleCancel}
						className={cn(
							"gap-1.5 transition-opacity duration-200",
							deleteState !== "idle" && "pointer-events-none opacity-50",
						)}
					>
						Cancel
						<ActionKbd className="lowercase! w-auto min-w-0 px-1">
							esc
						</ActionKbd>
					</Button.Root>

					<FancyButton.Root
						type="button"
						variant={deleteState === "success" ? "success" : "destructive"}
						size="small"
						disabled={deleteState !== "idle"}
						onClick={() => void handleDelete()}
						className={cn(
							"min-w-[110px] justify-center overflow-hidden transition-all duration-200",
							deleteState !== "idle" && "pointer-events-none",
							deleteState === "deleting" && "opacity-90",
						)}
					>
						<AnimatePresence mode="popLayout" initial={false}>
							<motion.span
								key={deleteState}
								transition={{
									type: "spring",
									duration: 0.25,
									bounce: 0,
								}}
								initial={{ opacity: 0, y: -14 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 14 }}
								className="relative z-10 flex items-center justify-center gap-1.5"
							>
								{deleteState === "deleting" ? (
									<>
										<Spinner size={14} color="currentColor" />
										<span>Deleting...</span>
									</>
								) : deleteState === "success" ? (
									<>
										<Icon
											name="check-circle"
											className="h-4 w-4 shrink-0 text-white"
										/>
										<span>Deleted</span>
									</>
								) : (
									<>
										<span>Delete</span>
										<ActionKbd className={actionKbdOnDestructiveClassName}>
											↵
										</ActionKbd>
									</>
								)}
							</motion.span>
						</AnimatePresence>
					</FancyButton.Root>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
