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
import { useState } from "react";
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
	const [keyRevealed, setKeyRevealed] = useState(false);

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
				toast.success("API key copied to clipboard");
			} catch {
				toast.error("Failed to copy API key");
			}
		}
	};

	const handleContinue = () => {
		if (createdApiKey?.id && activeOrganization?.slug) {
			setCreatedApiKey(null);
			setKeyRevealed(false);
			onClose();
			router.push(`/${activeOrganization.slug}/api-keys/${createdApiKey.id}`);
		}
	};

	const handleClose = () => {
		setCreatedApiKey(null);
		setKeyRevealed(false);
		reset();
		onClose();
	};

	// Show API key reveal screen if created
	if (createdApiKey) {
		return (
			<Modal.Root open={isOpen} onOpenChange={handleClose}>
				<Modal.Content className="sm:max-w-[480px] p-0.5 border border-stroke-soft-100/50 rounded-2xl" showClose={true}>
					<div className="border border-stroke-soft-100/50 rounded-2xl">
						<Modal.Header className="before:border-stroke-soft-200/50">
							<div className="flex items-center justify-centers">
								<Icon name="key-new" className="h-4 w-4" />
							</div>
							<div className="flex-1">
								<Modal.Title>API Key Created</Modal.Title>
							</div>
						</Modal.Header>
						<Modal.Body className="space-y-2">
							<div className="flex flex-col gap-1">
								<Label.Root>API Key</Label.Root>
								<div className="flex items-center gap-2 rounded-xl bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 px-3 py-2.5">
									{keyRevealed ? (
										<>
											<code className="flex-1 break-all font-mono text-paragraph-xs text-text-strong-950">
												{createdApiKey.key}
											</code>
											<Button.Root
												variant="neutral"
												mode="ghost"
												size="xxsmall"
												onClick={handleCopyKey}
											>
												<Icon name="clipboard-copy" className="h-4 w-4" />
											</Button.Root>
										</>
									) : (
										<>
											<code className="flex-1 font-mono text-paragraph-xs text-text-sub-600">
												{"•".repeat(40)}
											</code>
											<Button.Root
												variant="neutral"
												mode="ghost"
												size="xxsmall"
												onClick={() => setKeyRevealed(true)}
											>
												<Icon name="eye" className="h-4 w-4" />
												Reveal
											</Button.Root>
										</>
									)}
								</div>
							</div>
						</Modal.Body>
						<Modal.Footer className="justify-end border-stroke-soft-100/50 mt-4">
							<Button.Root
								type="button"
								variant="neutral"
								size="xsmall"
								onClick={handleContinue}
								disabled={!keyRevealed}
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
						<Modal.Body className="space-y-2">
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
											placeholder="My API Key"
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

