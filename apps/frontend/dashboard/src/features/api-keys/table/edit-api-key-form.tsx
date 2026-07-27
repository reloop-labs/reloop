import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useInvalidateApiKeys } from "../hooks/use-api-keys-query";
import type { ApiKeyData } from "../types";

interface EditApiKeyFormProps {
	apiKey: ApiKeyData;
	onCancel: () => void;
	onSuccess?: (updatedName: string) => void;
	variant?: "modal" | "inline";
}

export function EditApiKeyForm({
	apiKey,
	onCancel,
	onSuccess,
	variant = "modal",
}: EditApiKeyFormProps) {
	const invalidate = useInvalidateApiKeys();
	const [name, setName] = useState(apiKey.name || "");
	const [error, setError] = useState<string | null>(null);
	const [status, setStatus] = useState<"idle" | "saving" | "success">("idle");
	const isInline = variant === "inline";

	useEffect(() => {
		setName(apiKey.name || "");
		setError(null);
		setStatus("idle");
	}, [apiKey]);

	const canSubmit =
		Boolean(name.trim()) &&
		name.trim() !== (apiKey.name || "") &&
		status === "idle";

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (canSubmit) {
				void handleSubmit();
			}
		},
		{ enableOnFormTags: ["INPUT"] },
		[canSubmit, name, apiKey],
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
			await axios.patch(
				`/api/api-key/v1/${apiKey.id}`,
				{ name: name.trim() },
				{ withCredentials: true },
			);
			setStatus("success");
			toast.success("API key updated successfully");
			setTimeout(() => {
				void invalidate();
				onSuccess?.(name.trim());
			}, 750);
		} catch (err) {
			const message = axios.isAxiosError(err)
				? err.response?.data?.message || "Failed to update API key"
				: "Failed to update API key";
			setError(message);
			toast.error(message);
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
						"overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 dark:border-stroke-soft-100/40 dark:bg-[#0F0F0F]",
				)}
			>
				<div
					className={cn(
						"space-y-2",
						isInline &&
							"m-0.5 rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-6 pt-5 pb-6 dark:border-stroke-soft-100/40",
					)}
				>
					<Label.Root htmlFor={`edit-api-key-name-${apiKey.id}`}>
						Key name
						<Label.Asterisk />
					</Label.Root>
					<Input.Root size="medium" hasError={Boolean(error)}>
						<Input.Wrapper>
							<Input.Input
								id={`edit-api-key-name-${apiKey.id}`}
								placeholder="e.g., Production Server, Web App"
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
							Provide a descriptive name to help you identify this API key
							later.
						</p>
					)}
				</div>

				<div
					className={cn(
						"flex items-center justify-end gap-3",
						isInline ? "px-6 pt-3 pb-3.5" : "mt-6",
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
										<span>Key Name Updated</span>
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
