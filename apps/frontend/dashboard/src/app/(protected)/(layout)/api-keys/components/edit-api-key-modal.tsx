"use client";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import * as v from "valibot";

const editApiKeySchema = v.object({
	name: v.pipe(v.string(), v.minLength(1, "Name must be at least 1 character")),
});

type EditApiKeyFormValues = v.InferInput<typeof editApiKeySchema>;

interface ApiKeyData {
	id: string;
	name: string | null;
	start: string | null;
	prefix: string | null;
}

interface EditApiKeyModalProps {
	apiKeys: ApiKeyData[];
}

export const EditApiKeyModal = ({ apiKeys }: EditApiKeyModalProps) => {
	const [editId, setEditId] = useQueryState("edit");
	const { mutate } = useSWRConfig();

	const apiKeyToEdit = apiKeys.find((apiKey) => apiKey.id === editId);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<EditApiKeyFormValues>({
		resolver: valibotResolver(
			editApiKeySchema,
		) as Resolver<EditApiKeyFormValues>,
		defaultValues: {
			name: apiKeyToEdit?.name || "",
		},
	});

	// Reset form when modal opens with a new key
	useEffect(() => {
		if (editId && apiKeyToEdit) {
			reset({
				name: apiKeyToEdit.name || "",
			});
		}
	}, [editId, apiKeyToEdit, reset]);

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			handleSubmit(onSubmit)();
		},
		{ enableOnFormTags: ["INPUT"], enabled: !!editId },
	);

	const onSubmit = async (data: EditApiKeyFormValues) => {
		if (!apiKeyToEdit) return;

		try {
			await axios.patch(
				`/api/api-key/v1/${apiKeyToEdit.id}`,
				{ name: data.name },
				{ withCredentials: true },
			);

			await mutate(`/api/api-key/v1/${apiKeyToEdit.id}`);
			await mutate(
				(key) => typeof key === "string" && key.startsWith("/api/api-key/v1/"),
			);

			toast.success("API key updated successfully");
			handleClose();
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to update API key"
				: "Failed to update API key";
			toast.error(errorMessage);
		}
	};

	const handleClose = () => {
		setEditId(null);
	};

	// Reset state when modal is closed
	useEffect(() => {
		if (!editId) {
			const timer = setTimeout(() => {
				reset();
			}, 300); // Wait for transition
			return () => clearTimeout(timer);
		}
	}, [editId, reset]);

	return (
		<Modal.Root
			open={!!editId}
			onOpenChange={(open) => {
				if (!open) handleClose();
			}}
		>
			<Modal.Content
				className="rounded-20 border-none p-0 sm:max-w-[480px]"
				showClose={true}
			>
				<div className="rounded-20 border border-stroke-soft-100/50 bg-bg-white-0">
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="p-6">
							<div className="mb-4 flex items-center gap-2">
								<Icon name="edit" className="h-4 w-4 text-text-strong-950" />
								<h2 className="font-medium text-text-strong-950">
									Edit API key
								</h2>
							</div>
							<div className="flex flex-col gap-1.5">
								<Label.Root htmlFor="name" className="text-text-strong-950">
									Key Name
									<Label.Asterisk />
								</Label.Root>
								<Input.Root size="small" className="rounded-[10px]">
									<Input.Wrapper>
										<Input.Input
											id="name"
											placeholder="e.g. Production Server, Web App"
											{...register("name")}
										/>
									</Input.Wrapper>
								</Input.Root>
								{errors.name && (
									<p className="font-medium text-error-base text-paragraph-xs">
										{errors.name.message}
									</p>
								)}
							</div>
						</div>

						<div className="flex flex-col-reverse justify-end gap-2 px-6 pb-6 sm:flex-row sm:items-center">
							<Button.Root
								variant="neutral"
								mode="stroke"
								onClick={handleClose}
								disabled={isSubmitting}
								className="gap-1.5"
							>
								Cancel
								<span className="flex h-[19px] w-7 items-center justify-center rounded-[5px] border border-stroke-soft-100 bg-bg-weak-50/50 p-px font-medium text-[10px]">
									Esc
								</span>
							</Button.Root>
							<Button.Root
								type="submit"
								variant="neutral"
								disabled={isSubmitting}
								className="gap-2"
							>
								{isSubmitting ? (
									<>
										<Spinner size={14} color="currentColor" />
										Saving...
									</>
								) : (
									<>
										Save changes
										<Icon
											name="command"
											className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
										/>
										<Icon
											name="enter"
											className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
										/>
									</>
								)}
							</Button.Root>
						</div>
					</form>
				</div>
			</Modal.Content>
		</Modal.Root>
	);
};
