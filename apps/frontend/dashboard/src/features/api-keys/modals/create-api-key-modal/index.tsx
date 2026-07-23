import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
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
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { useInvalidateApiKeys } from "../../hooks/use-api-keys-query";
import type { ApiKeyWithSecret } from "../../types";
import { type ApiKeyFormValues, FormStep } from "./form-step";
import { SuccessStep } from "./success-step";

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

	const form = useForm<ApiKeyFormValues>({
		resolver: valibotResolver(apiKeySchema) as Resolver<ApiKeyFormValues>,
		defaultValues: { name: "" },
	});

	const step = createdApiKey ? "success" : "form";
	const header = HEADER_CONTENT[step];

	const handleClose = () => {
		onClose();
	};

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

	useHotkeys(
		"enter",
		(e) => {
			e.preventDefault();
			if (!createdApiKey) {
				void form.handleSubmit(onSubmit)();
			} else {
				handleClose();
			}
		},
		{ enableOnFormTags: ["INPUT"], enabled: isOpen },
	);

	useEffect(() => {
		if (!isOpen) {
			const timer = setTimeout(() => {
				setCreatedApiKey(null);
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
				showClose={true}
				onEscapeKeyDown={(e) => {
					if (createdApiKey) e.preventDefault();
				}}
				onPointerDownOutside={(e) => {
					if (createdApiKey) e.preventDefault();
				}}
			>
				{/* Outer motion wrapper — animates height as content changes */}
				<motion.div
					layout
					transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
				>
					<div className="p-6">
						{/* Header — title & description cross-fade with blur independently */}
						<div className="relative pr-6">
							<AnimatePresence mode="wait" initial={false}>
								<motion.div
									key={step}
									initial={{ opacity: 0, filter: "blur(6px)", y: -4 }}
									animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
									exit={{ opacity: 0, filter: "blur(6px)", y: 4 }}
									transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
								>
									<Modal.Title className="font-semibold text-[26px] text-text-strong-950 tracking-tight">
										{header.title}
									</Modal.Title>
								</motion.div>
							</AnimatePresence>
						</div>

						{/* Body — center content animates as step key changes */}
						<AnimatePresence mode="wait" initial={false}>
							<motion.div
								key={step}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
							>
								{step === "form" ? (
									<FormStep form={form} isLoading={isLoading} />
								) : (
									<SuccessStep secret={createdApiKey!.key} />
								)}
							</motion.div>
						</AnimatePresence>

						{/* Footer — single shared button row, outside the animated body */}
						<div className="mt-6 flex items-center justify-end gap-3">
							{step === "form" && (
								<Button.Root
									type="button"
									variant="neutral"
									mode="ghost"
									size="small"
									onClick={() => {
										if (!isLoading) handleClose();
									}}
									className={cn(
										"transition-opacity duration-200",
										isLoading && "pointer-events-none opacity-50",
									)}
								>
									Cancel
								</Button.Root>
							)}
							<FancyButton.Root
								type="button"
								variant="blue"
								size="small"
								onClick={() => {
									if (step === "success") {
										handleClose();
									} else if (!isLoading) {
										void form.handleSubmit(onSubmit)();
									}
								}}
								className={cn(
									"justify-center overflow-hidden transition-all duration-200",
									step === "form" && "min-w-[130px]",
									step === "success" && "min-w-[100px] gap-2",
									isLoading && "pointer-events-none opacity-90",
								)}
							>
								<AnimatePresence mode="popLayout" initial={false}>
									<motion.span
										key={
											step === "success"
												? "done"
												: isLoading
													? "creating"
													: "idle"
										}
										transition={{ type: "spring", duration: 0.25, bounce: 0 }}
										initial={{ opacity: 0, y: -14 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 14 }}
										className="flex items-center justify-center gap-1.5"
									>
										{step === "success" ? (
											<>
												Close{" "}
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
										) : isLoading ? (
											<>
												<Spinner size={14} color="currentColor" />
												<span>Creating...</span>
											</>
										) : (
											<>
												Create API key
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
				</motion.div>
			</Modal.Content>
		</Modal.Root>
	);
}
