"use client";
import { valibotResolver } from "@hookform/resolvers/valibot";
import type { AudienceGroup } from "@reloop/api/types";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import * as Textarea from "@reloop/ui/textarea";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import * as v from "valibot";

const audienceGroupSchema = v.object({
	name: v.pipe(
		v.string("Group name is required"),
		v.minLength(1, "Group name is required"),
		v.maxLength(255, "Group name must be less than 255 characters"),
	),
	description: v.optional(
		v.pipe(
			v.string(),
			v.maxLength(1000, "Description must be less than 1000 characters"),
		),
	),
});

type AudienceGroupFormValues = v.InferInput<typeof audienceGroupSchema>;

interface EditAudienceGroupModalProps {
	group: AudienceGroup;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const EditAudienceGroupModal = ({
	group,
	open,
	onOpenChange,
}: EditAudienceGroupModalProps) => {
	const { changeStatus, status } = useLoading();
	const { mutate } = useSWRConfig();

	const { register, handleSubmit, formState, reset, watch } =
		useForm<AudienceGroupFormValues>({
			resolver: valibotResolver(
				audienceGroupSchema,
			) as Resolver<AudienceGroupFormValues>,
			defaultValues: {
				name: group.name,
				description: group.description || "",
			},
		});

	const onSubmit = async (data: AudienceGroupFormValues) => {
		try {
			changeStatus("loading");
			await axios.put(`/api/audience-group/v1/update/${group.id}`, data, {
				headers: { credentials: "include" },
			});

			await mutate(`/api/audience-group/v1/get/${group.id}`);
			toast.success("Audience group updated successfully");
			onOpenChange(false);
		} catch (error) {
			changeStatus("idle");
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "An unexpected error occurred"
				: "An unexpected error occurred";
			toast.error(errorMessage);
		}
	};

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			// Reset form when closing
			reset({
				name: group.name,
				description: group.description || "",
			});
		}
		onOpenChange(newOpen);
	};

	return (
		<Modal.Root open={open} onOpenChange={handleOpenChange}>
			<Modal.Content className="max-w-[440px]">
				<Modal.Header>
					<Modal.Title>Edit Audience Group</Modal.Title>
					<Modal.Description>
						Update the name and description of your audience group
					</Modal.Description>
				</Modal.Header>

				<form onSubmit={handleSubmit(onSubmit)}>
					<Modal.Body className="space-y-4">
						<div>
							<Label.Root
								htmlFor="edit-name"
								className="mb-2 block font-medium text-gray-700 text-sm"
							>
								Group Name
								<Label.Asterisk />
							</Label.Root>
							<div className="relative">
								<Input.Root
									hasError={!!formState?.errors?.name?.message}
									className="w-full"
								>
									<Input.Wrapper>
										<Input.Input
											id="edit-name"
											placeholder="e.g., Newsletter Subscribers"
											{...register("name")}
											disabled={status === "loading"}
										/>
									</Input.Wrapper>
								</Input.Root>
								{formState.errors.name && (
									<div className="mt-2 flex items-center gap-2">
										<Icon
											name="alert-circle"
											className="h-4 w-4 text-red-500"
										/>
										<p className="text-red-600 text-sm">
											{formState.errors.name.message}
										</p>
									</div>
								)}
							</div>
						</div>
						<div>
							<Label.Root
								htmlFor="edit-description"
								className="mb-2 block font-medium text-gray-700 text-sm"
							>
								Description (Optional)
							</Label.Root>
							<div className="relative">
								<Textarea.Root
									id="edit-description"
									className="text-sm"
									placeholder="Describe this audience group..."
									{...register("description")}
									disabled={status === "loading"}
									rows={3}
									hasError={!!formState?.errors?.description?.message}
								>
									<Textarea.CharCounter
										className="text-xs"
										current={watch("description")?.length || 0}
										max={1000}
									/>
								</Textarea.Root>

								{formState.errors.description && (
									<div className="mt-2 flex items-center gap-2">
										<Icon
											name="alert-circle"
											className="h-4 w-4 text-red-500"
										/>
										<p className="text-red-600 text-sm">
											{formState.errors.description?.message}
										</p>
									</div>
								)}
							</div>
						</div>
					</Modal.Body>

					<Modal.Footer className="flex justify-end gap-2">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							onClick={() => onOpenChange(false)}
							disabled={status === "loading"}
						>
							Cancel
						</Button.Root>
						<Button.Root
							type="submit"
							variant="neutral"
							disabled={status === "loading" || !formState.isValid}
						>
							{status === "loading" ? (
								<>
									<Spinner color="white" />
									Saving...
								</>
							) : (
								<>
									<Icon name="check" className="h-4 w-4" />
									Save Changes
								</>
							)}
						</Button.Root>
					</Modal.Footer>
				</form>
			</Modal.Content>
		</Modal.Root>
	);
};
