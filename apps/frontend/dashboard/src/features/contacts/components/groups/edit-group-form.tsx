import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import {
	type Group,
	useInvalidateContacts,
} from "#/features/contacts/hooks/use-contacts-query";

interface EditGroupFormProps {
	group: Group;
	onCancel: () => void;
	onSuccess?: () => void;
	variant?: "modal" | "inline";
}

export function EditGroupForm({
	group,
	onCancel,
	onSuccess,
	variant = "modal",
}: EditGroupFormProps) {
	const invalidate = useInvalidateContacts();
	const [name, setName] = useState(group.name || "");
	const [error, setError] = useState<string | null>(null);
	const [status, setStatus] = useState<"idle" | "saving" | "success">("idle");
	const isInline = variant === "inline";

	useEffect(() => {
		setName(group.name || "");
		setError(null);
		setStatus("idle");
	}, [group]);

	const canSubmit =
		Boolean(name.trim()) && name.trim() !== group.name && status === "idle";

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (canSubmit) {
				void handleSubmit();
			}
		},
		{ enableOnFormTags: ["INPUT"] },
		[canSubmit, name, group],
	);

	useHotkeys(
		"escape",
		(e) => {
			e.preventDefault();
			if (status === "idle") onCancel();
		},
		{ enableOnFormTags: true },
	);

	const handleSubmit = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!canSubmit) return;

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
			setTimeout(() => {
				void invalidate();
				onSuccess?.();
			}, 750);
		} catch (err) {
			console.error("Failed to update group:", err);
			const msg = err instanceof Error ? err.message : "Failed to update group";
			setError(msg);
			toast.error(msg);
			setStatus("idle");
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			onClick={(e) => e.stopPropagation()}
			className="w-full font-sans"
		>
			{/* Table inline: nested gray/white card. Modal: flat. */}
			<div
				className={cn(
					isInline &&
						"overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50",
				)}
			>
				<div
					className={cn(
						"space-y-2",
						isInline &&
							"m-0.5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-6 pt-5 pb-6",
					)}
				>
					<Label.Root htmlFor={`edit-group-name-${group.id}`}>
						Group name
						<Label.Asterisk />
					</Label.Root>
					<Input.Root size="medium" hasError={Boolean(error)}>
						<Input.Wrapper>
							<Input.Input
								id={`edit-group-name-${group.id}`}
								placeholder="e.g., VIP Customers, Early Adopters"
								value={name}
								onChange={(e) => {
									setName(e.target.value);
									if (error) setError(null);
								}}
								autoFocus={isInline}
								disabled={status !== "idle"}
							/>
						</Input.Wrapper>
					</Input.Root>
					{error ? (
						<p className="text-error-base text-paragraph-xs">{error}</p>
					) : (
						<p className="text-paragraph-xs text-text-sub-600">
							Provide a descriptive name to help you identify this group later.
						</p>
					)}
				</div>

				<div
					className={cn(
						"flex items-center justify-end gap-3",
						isInline
							? "px-6 pt-3 pb-3.5 dark:bg-bg-weak-50/40"
							: "mt-6",
					)}
				>
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="small"
						onClick={onCancel}
						disabled={status !== "idle"}
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
						disabled={!canSubmit}
						className={cn(
							"w-[160px] min-w-[160px] justify-center overflow-hidden transition-all duration-200",
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
			</div>
		</form>
	);
}
