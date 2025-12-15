"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Kbd from "@reloop/ui/kbd";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
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
				<Modal.Content className="data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=closed]:zoom-out-95 max-w-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in">
					<Modal.Body>
						<h2 className="mb-2 font-semibold text-gray-900 text-xl">
							API Key Created
						</h2>
						<p className="mb-4 text-gray-600 text-sm">
							Make sure to copy your API key now. You won't be able to see it
							again!
						</p>

						<div className="mb-4 space-y-2">
							<Label.Root className="font-medium text-sm">API Key</Label.Root>
							<div className="flex items-center gap-2 rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-3">
								{keyRevealed ? (
									<>
										<code className="flex-1 break-all font-mono text-xs">
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
										<code className="flex-1 font-mono text-xs">
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
							{keyRevealed && (
								<p className="text-red-600 text-xs">
									⚠️ This is your only chance to copy the API key. Make sure to
									save it securely.
								</p>
							)}
						</div>
					</Modal.Body>
					<Modal.Footer className="flex items-center justify-end gap-3">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							onClick={handleClose}
						>
							Close
						</Button.Root>
						<Button.Root
							type="button"
							variant="neutral"
							onClick={handleContinue}
							disabled={!keyRevealed}
						>
							Continue
							<Icon name="chevron-right" className="h-3 w-3" />
						</Button.Root>
					</Modal.Footer>
				</Modal.Content>
			</Modal.Root>
		);
	}

	return (
		<Modal.Root open={isOpen} onOpenChange={handleClose}>
			<Modal.Content className="data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=closed]:zoom-out-95 max-w-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in">
				<form onSubmit={handleSubmit(onSubmit)}>
					<Modal.Header>
						<Modal.Title className="flex items-center gap-2">
							<Icon name="key-new" className="h-5 w-5" />
							Create API Key
						</Modal.Title>
						<Modal.Close />
					</Modal.Header>
					<Modal.Body>
						<div className="space-y-4">
							<div>
								<Label.Root htmlFor="name">
									Name
									<Label.Asterisk />
								</Label.Root>
								<Input.Root className="mt-1">
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
									<p className="mt-1 text-red-600 text-sm">
										{formState.errors.name.message}
									</p>
								)}
							</div>
						</div>
					</Modal.Body>
					<Modal.Footer className="flex items-center justify-end gap-3">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							onClick={handleClose}
							disabled={status === "loading"}
						>
							Cancel
							<Kbd.Root className="bg-bg-weak-50 text-xs">Esc</Kbd.Root>
						</Button.Root>
						<Button.Root
							type="submit"
							variant="neutral"
							disabled={status === "loading"}
						>
							{status === "loading" ? (
								<>
									<Icon name="loader-2" className="mr-2 h-4 w-4 animate-spin" />
									Creating...
								</>
							) : (
								<>
									Create API Key
									<Icon name="undo" className="h-3 w-3 scale-y-[-1]" />
								</>
							)}
						</Button.Root>
					</Modal.Footer>
				</form>
			</Modal.Content>
		</Modal.Root>
	);
};

