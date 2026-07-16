import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import axios from "axios";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import * as v from "valibot";
import { useInvalidateApiKeys } from "../hooks/use-api-keys-query";
import type { ApiKeyData } from "../types";
import { ModalHeader } from "./modal-header";

const editApiKeySchema = v.object({
	name: v.pipe(v.string(), v.minLength(1, "Name must be at least 1 character")),
});

type EditApiKeyFormValues = v.InferInput<typeof editApiKeySchema>;

export function EditApiKeyModal({ apiKeys }: { apiKeys: ApiKeyData[] }) {
	const [editId, setEditId] = useQueryState("edit");
	const invalidate = useInvalidateApiKeys();

	const apiKeyToEdit = apiKeys.find((k) => k.id === editId);

	const form = useForm<EditApiKeyFormValues>({
		resolver: valibotResolver(
			editApiKeySchema,
		) as Resolver<EditApiKeyFormValues>,
		defaultValues: { name: "" },
	});

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = form;

	useEffect(() => {
		if (editId && apiKeyToEdit) {
			reset({ name: apiKeyToEdit.name || "" });
		}
	}, [editId, apiKeyToEdit, reset]);

	const handleClose = () => {
		void setEditId(null);
	};

	const onSubmit = async (data: EditApiKeyFormValues) => {
		if (!apiKeyToEdit) return;
		try {
			await axios.patch(
				`/api/api-key/v1/${apiKeyToEdit.id}`,
				{ name: data.name },
				{ withCredentials: true },
			);
			await invalidate();
			toast.success("API key updated successfully");
			handleClose();
		} catch (error) {
			const message = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to update API key"
				: "Failed to update API key";
			toast.error(message);
		}
	};

	useHotkeys(
		"mod+enter",
		(e) => {
			e.preventDefault();
			void handleSubmit(onSubmit)();
		},
		{ enableOnFormTags: ["INPUT"], enabled: !!editId },
	);

	useEffect(() => {
		if (!editId) {
			const t = setTimeout(() => reset(), 300);
			return () => clearTimeout(t);
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
				className="overflow-hidden rounded-2xl border border-stroke-soft-100 p-0 sm:max-w-[480px] dark:border-stroke-soft-100/40"
				showClose={false}
			>
				<form onSubmit={handleSubmit(onSubmit)}>
					<ModalHeader
						title="Edit API key"
						icon="edit"
						onClose={handleClose}
					/>

					<Modal.Body className="space-y-4 px-5 py-4 pb-5">
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="edit-name"
								className="font-medium text-label-sm text-text-strong-950"
							>
								Key name
								<span className="ml-0.5 text-error-base">*</span>
							</label>
							<Input.Root size="xsmall" hasError={!!errors.name}>
								<Input.Wrapper>
									<Input.Input
										id="edit-name"
										placeholder="e.g. Production Server, Web App"
										autoFocus
										{...register("name")}
										disabled={isSubmitting}
									/>
								</Input.Wrapper>
							</Input.Root>
							{errors.name && (
								<p className="text-error-base text-paragraph-xs">
									{errors.name.message}
								</p>
							)}
						</div>
					</Modal.Body>

					<div className="flex items-center justify-end gap-2 border-stroke-soft-100 border-t px-5 py-3.5 dark:border-stroke-soft-100/50">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							size="xsmall"
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
							size="xsmall"
							disabled={isSubmitting}
							className="gap-2"
						>
							{isSubmitting ? (
								<>
									<Spinner size={12} color="currentColor" />
									Saving…
								</>
							) : (
								<>
									Save changes
									<span className="inline-flex items-center gap-0.5">
										<Icon
											name="command"
											className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
										/>
										<Icon
											name="enter"
											className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
										/>
									</span>
								</>
							)}
						</Button.Root>
					</div>
				</form>
			</Modal.Content>
		</Modal.Root>
	);
}
