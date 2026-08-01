import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import * as v from "valibot";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useInvalidateApiKeys } from "../../hooks/use-api-keys-query";
import type { ApiKeyWithSecret } from "../../types";
import { type ApiKeyFormValues, FormStep } from "./form-step";
import { SuccessStep } from "./success-step";

/** Light keycap so it reads on the blue FancyButton fill. */
const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

const apiKeySchema = v.object({
	name: v.pipe(v.string(), v.minLength(1, "Name must be at least 1 character")),
});

const HEADER_CONTENT = {
	form: {
		title: "Create API key",
	},
	success: {
		title: "API key created",
	},
} as const;

export function CreateApiKeyModal({
	isOpen,
	onClose,
}: {
	isOpen: boolean;
	onClose: () => void;
}) {
	const { activeOrganization } = useActiveOrganization();
	const invalidate = useInvalidateApiKeys();
	const [isLoading, setIsLoading] = useState(false);
	const [createdApiKey, setCreatedApiKey] = useState<ApiKeyWithSecret | null>(
		null,
	);
	const [copied, setCopied] = useState(false);

	const form = useForm<ApiKeyFormValues>({
		resolver: valibotResolver(apiKeySchema) as Resolver<ApiKeyFormValues>,
		defaultValues: { name: "" },
	});

	const step = createdApiKey ? "success" : "form";
	const header = HEADER_CONTENT[step];

	const handleClose = () => {
		onClose();
	};

	const handleCopyKey = async () => {
		if (!createdApiKey) return;
		try {
			await navigator.clipboard.writeText(createdApiKey.key);
			setCopied(true);
			toast.success("API key copied to clipboard");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Failed to copy API key");
		}
	};

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			void handleCopyKey();
		},
		{ enabled: isOpen && step === "success" },
	);

	const onSubmit = async (data: ApiKeyFormValues) => {
		if (!activeOrganization?.id || isLoading) return;
		try {
			setIsLoading(true);
			const response = await axios.post<ApiKeyWithSecret>(
				"/api/api-key/v1/",
				{ name: data.name },
				{ withCredentials: true },
			);
			await invalidate();
			setCreatedApiKey(response.data);
			form.reset();
		} catch (error) {
			const message = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to create API key"
				: "Failed to create API key";
			toast.error(message);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (!isOpen) {
			const timer = setTimeout(() => {
				setCreatedApiKey(null);
				setCopied(false);
				form.reset();
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [isOpen, form]);

	return (
		<Modal.Root
			open={isOpen}
			onOpenChange={(open) => {
				if (!open && !createdApiKey) handleClose();
				if (!open && createdApiKey) handleClose();
			}}
		>
			<Modal.Content
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 bg-bg-white-0 sm:max-w-[460px] dark:border-stroke-soft-100/40"
				showClose={false}
				onPointerDownOutside={(e) => {
					if (createdApiKey) e.preventDefault();
				}}
			>
				{/* Outer motion wrapper — animates height as content changes */}
				<motion.div
					layout="size"
					transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
				>
					<div className="p-6">
						{/* Header — title swaps instantly with the step */}
						<div className="relative pr-10">
							<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
								{header.title}
							</Modal.Title>
						</div>

						{/* Center content only — animates on step change */}
						<AnimatePresence mode="wait" initial={false}>
							{step === "form" ? (
								<motion.div
									key="form"
									initial={{ opacity: 0, filter: "blur(4px)", y: 6 }}
									animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
									exit={{ opacity: 0, filter: "blur(4px)", y: -6 }}
									transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
								>
									<form
										id="create-api-key-form"
										onSubmit={(e) => {
											e.preventDefault();
											if (!isLoading) void form.handleSubmit(onSubmit)();
										}}
									>
										<FormStep form={form} isLoading={isLoading} />
									</form>
								</motion.div>
							) : (
								<motion.div
									key="success"
									initial={{ opacity: 0, filter: "blur(4px)", y: 6 }}
									animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
									exit={{ opacity: 0, filter: "blur(4px)", y: -6 }}
									transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
								>
									<SuccessStep secret={createdApiKey!.key} />
								</motion.div>
							)}
						</AnimatePresence>

						{/* Footer — outside animation, plain conditional */}
						<div className="mt-6 flex items-center justify-end gap-3">
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								size="small"
								onClick={() => {
									if (!isLoading) handleClose();
								}}
								className={cn(
									"gap-1.5 transition-opacity duration-200",
									isLoading && "pointer-events-none opacity-50",
								)}
							>
								Cancel
								<ActionKbd className="lowercase! w-auto min-w-0 px-1">
									esc
								</ActionKbd>
							</Button.Root>
							{step === "form" ? (
								<FancyButton.Root
									type="submit"
									form="create-api-key-form"
									variant="blue"
									size="small"
									disabled={isLoading}
									className={cn(
										"min-w-[130px] justify-center overflow-hidden transition-all duration-200",
										isLoading && "pointer-events-none opacity-90",
									)}
								>
									<AnimatePresence mode="popLayout" initial={false}>
										<motion.span
											key={isLoading ? "creating" : "idle"}
											transition={{ type: "spring", duration: 0.25, bounce: 0 }}
											initial={{ opacity: 0, y: -14 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 14 }}
											className="flex items-center justify-center gap-1.5"
										>
											{isLoading ? (
												<>
													<Spinner size={14} color="currentColor" />
													<span>Creating...</span>
												</>
											) : (
												<>
													Create API key
													<ActionKbd className={actionKbdOnBlueClassName}>
														↵
													</ActionKbd>
												</>
											)}
										</motion.span>
									</AnimatePresence>
								</FancyButton.Root>
							) : (
								<FancyButton.Root
									type="button"
									variant="blue"
									size="small"
									onClick={handleCopyKey}
									className="min-w-[130px] justify-center overflow-hidden transition-all duration-200"
								>
									<AnimatePresence mode="popLayout" initial={false}>
										<motion.span
											key={copied ? "copied" : "idle"}
											transition={{ type: "spring", duration: 0.25, bounce: 0 }}
											initial={{ opacity: 0, y: -14 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 14 }}
											className="flex items-center justify-center gap-1.5"
										>
											{copied ? (
												"Copied!"
											) : (
												<>
													Copy API key
													<ActionKbd className={actionKbdOnBlueClassName}>
														↵
													</ActionKbd>
												</>
											)}
										</motion.span>
									</AnimatePresence>
								</FancyButton.Root>
							)}
						</div>
					</div>
				</motion.div>
			</Modal.Content>
		</Modal.Root>
	);
}
