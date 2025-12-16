"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import * as v from "valibot";

const apiKeySchema = v.object({
	name: v.optional(
		v.pipe(v.string(), v.minLength(1, "Name must be at least 1 character")),
	),
});

type ApiKeyFormValues = v.InferInput<typeof apiKeySchema>;

interface CreateApiKeyModalProps {
	isOpen: boolean;
	onClose: () => void;
}

interface ApiKeyWithKeyResponse {
	id: string;
	name: string | null;
	key: string;
	start: string | null;
	prefix: string | null;
	enabled: boolean;
	rateLimitEnabled: boolean;
	rateLimitMax: number;
	rateLimitTimeWindow: number;
	createdAt: string;
}

export const CreateApiKeyModal = ({
	isOpen,
	onClose,
}: CreateApiKeyModalProps) => {
	const { activeOrganization } = useUserOrganization();
	const { changeStatus, status } = useLoading();
	const { mutate } = useSWRConfig();
	const router = useRouter();
	const [createdApiKey, setCreatedApiKey] =
		useState<ApiKeyWithKeyResponse | null>(null);
	const [keyCopied, setKeyCopied] = useState(false);

	// Block browser refresh/close when key is created but not copied
	useEffect(() => {
		if (createdApiKey && !keyCopied) {
			const handleBeforeUnload = (e: BeforeUnloadEvent) => {
				e.preventDefault();
				e.returnValue = "You haven't copied your API key yet. Are you sure you want to leave?";
				return e.returnValue;
			};

			window.addEventListener("beforeunload", handleBeforeUnload);
			return () => window.removeEventListener("beforeunload", handleBeforeUnload);
		}
	}, [createdApiKey, keyCopied]);

	const { register, handleSubmit, formState, reset } =
		useForm<ApiKeyFormValues>({
			resolver: valibotResolver(apiKeySchema) as Resolver<ApiKeyFormValues>,
			defaultValues: {
				name: "",
			},
		});

	// Command/Ctrl + Enter to submit form
	useHotkeys("mod+enter", (e) => {
		e.preventDefault();
		handleSubmit(onSubmit)();
	}, { enableOnFormTags: ["INPUT"] });

	const onSubmit = async (data: ApiKeyFormValues) => {
		if (!activeOrganization?.id) return;

		try {
			changeStatus("loading");
			const payload: Record<string, unknown> = {};
			if (data.name) payload.name = data.name;

			const response = await axios.post<ApiKeyWithKeyResponse>(
				"/api/api-key/v1/",
				payload,
				{ headers: { credentials: "include" } },
			);

			await mutate("/api/api-key/v1/?limit=100");

			setCreatedApiKey(response.data);
			changeStatus("idle");
			reset();
		} catch (error) {
			changeStatus("idle");
			if (axios.isAxiosError(error)) {
				const responseData = error.response?.data?.message;
				if (responseData) {
					toast.error(responseData);
				} else {
					toast.error("Failed to create API key");
				}
			} else {
				toast.error("An unexpected error occurred.");
			}
		}
	};

	const handleCopyKey = async () => {
		if (createdApiKey?.key) {
			try {
				await navigator.clipboard.writeText(createdApiKey.key);
				setKeyCopied(true);
				toast.success("API key copied to clipboard");
			} catch {
				toast.error("Failed to copy API key");
			}
		}
	};

	const handleContinue = () => {
		if (createdApiKey?.id && activeOrganization?.slug) {
			setCreatedApiKey(null);
			setKeyCopied(false);
			onClose();
			router.push(`/${activeOrganization.slug}/api-keys/${createdApiKey.id}`);
		}
	};

	const handleClose = () => {
		// Only allow closing if the key has been copied
		if (!createdApiKey || keyCopied) {
			setCreatedApiKey(null);
			setKeyCopied(false);
			reset();
			onClose();
		}
	};

	// Prevent closing via modal interactions when key is not copied
	const handleOpenChange = (open: boolean) => {
		if (!open && createdApiKey && !keyCopied) {
			// Prevent closing - show a warning toast
			toast.warning("Please copy your API key before closing");
			return;
		}
		if (!open) {
			handleClose();
		}
	};

	// Show API key reveal screen if created
	if (createdApiKey) {
		return (
			<Modal.Root open={isOpen} onOpenChange={handleOpenChange}>
				<Modal.Content
					className="sm:max-w-[480px] p-0.5 border border-stroke-soft-100/50 rounded-2xl"
					showClose={keyCopied}
					onEscapeKeyDown={(e) => {
						if (!keyCopied) {
							e.preventDefault();
							toast.warning("Please copy your API key before closing");
						}
					}}
					onPointerDownOutside={(e) => {
						if (!keyCopied) {
							e.preventDefault();
						}
					}}
					onInteractOutside={(e) => {
						if (!keyCopied) {
							e.preventDefault();
						}
					}}
				>
					<div className="border border-stroke-soft-100/50 rounded-2xl">
						<Modal.Header className="before:border-stroke-soft-200/50">
							<div className="flex items-center justify-center">
								<Icon name="check-circle" className="h-4 w-4 text-success-base" />
							</div>
							<div className="flex-1">
								<Modal.Title>API Key Created</Modal.Title>
							</div>
						</Modal.Header>
						<Modal.Body className="space-y-4">
							<p className="text-text-sub-600 text-sm">
								Your API key has been created. Make sure to copy the key now.
								You won't be able to see it again!
							</p>

							<div className="space-y-2">
								<Label.Root>New API Key</Label.Root>
								<div className="flex items-center gap-2 rounded-xl border border-stroke-soft-200 bg-bg-weak-50 p-3">
									<code className="flex-1 break-all font-mono text-xs text-text-strong-950">
										{createdApiKey.key}
									</code>
									<Button.Root
										variant="neutral"
										mode="ghost"
										size="xxsmall"
										onClick={handleCopyKey}
										disabled={keyCopied}
									>
										<Icon name={keyCopied ? "check" : "clipboard-copy"} className={`h-4 w-4 ${keyCopied ? "text-success-base" : ""}`} />
									</Button.Root>
								</div>
								{!keyCopied && (
									<p className="text-error-base text-xs flex items-center gap-1">
										<Icon name="alert-triangle" className="h-3 w-3" />
										You must copy the API key before you can close this dialog.
									</p>
								)}
								{keyCopied && (
									<p className="text-success-base text-xs flex items-center gap-1">
										<Icon name="check-circle" className="h-3 w-3" />
										API key copied! You can now close this dialog.
									</p>
								)}
							</div>
						</Modal.Body>
						<Modal.Footer className="justify-end border-stroke-soft-100/50 mt-4">
							<Button.Root
								type="button"
								variant="neutral"
								size="xsmall"
								onClick={handleContinue}
								disabled={!keyCopied}
							>
								Continue

								<Icon name="enter" className="w-4 h-4 border rounded-sm p-px border-stroke-soft-100/20" />
							</Button.Root>
						</Modal.Footer>
					</div>
				</Modal.Content>
			</Modal.Root>
		);
	}

	return (
		<Modal.Root open={isOpen} onOpenChange={handleClose}>
			<Modal.Content className="sm:max-w-[480px] p-0.5 border border-stroke-soft-100/50 rounded-2xl" showClose={true}>
				<div className="border border-stroke-soft-100/50 rounded-2xl">
					<form onSubmit={handleSubmit(onSubmit)}>
						<Modal.Header className="before:border-stroke-soft-200/50">
							<div className="flex items-center justify-centers">
								<Icon name="key-new" className="h-4 w-4" />
							</div>
							<div className="flex-1">
								<Modal.Title>Create API Key</Modal.Title>
							</div>
						</Modal.Header>
						<Modal.Body className="space-y-4">
							<p className="text-text-sub-600 text-sm">
								Create an API key to authenticate requests to Reloop from your application.
							</p>

							<div className="flex flex-col gap-1">
								<Label.Root htmlFor="name">
									Name
									<Label.Asterisk />
								</Label.Root>
								<Input.Root>
									<Input.Wrapper>
										<Input.Input
											className="px-2"
											id="name"
											placeholder="e.g., Production Server, My App"
											{...register("name")}
										/>
									</Input.Wrapper>
								</Input.Root>
								{formState.errors.name && (
									<p className="text-error-base text-paragraph-xs">
										{formState.errors.name.message}
									</p>
								)}
							</div>
						</Modal.Body>
						<Modal.Footer className="justify-end border-stroke-soft-100/50 mt-4">
							<Button.Root
								type="submit"
								variant="neutral"
								size="xsmall"
								disabled={status === "loading"}
							>
								{status === "loading" ? (
									<>
										<Icon name="loader-2" className="h-4 w-4 animate-spin" />
										Creating...
									</>
								) : (
									<>
										Create API Key
										<span className="inline-flex items-center gap-0.5">
											<Icon name="enter" className="w-4 h-4 border rounded-sm p-px border-stroke-soft-100/20" />
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

