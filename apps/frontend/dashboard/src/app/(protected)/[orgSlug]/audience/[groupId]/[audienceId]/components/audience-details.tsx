"use client";
import { isValidEmail } from "@fe/dashboard/utils/audience";
import { valibotResolver } from "@hookform/resolvers/valibot";
import type { Audience } from "@reloop/api/types";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import { useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import * as v from "valibot";

const audienceDetailsSchema = v.object({
	firstName: v.optional(
		v.pipe(
			v.string(),
			v.maxLength(255, "First name must be less than 255 characters"),
		),
	),
	lastName: v.optional(
		v.pipe(
			v.string(),
			v.maxLength(255, "Last name must be less than 255 characters"),
		),
	),
});

type AudienceDetailsFormValues = v.InferInput<typeof audienceDetailsSchema>;

interface AudienceDetailsProps {
	audience: Audience | null;
	onUpdate: (updatedAudience: Audience) => void;
}

export const AudienceDetails = ({
	audience,
	onUpdate,
}: AudienceDetailsProps) => {
	if (!audience) {
		return null;
	}

	const { changeStatus, status } = useLoading();
	const { mutate } = useSWRConfig();
	const [isEditing, setIsEditing] = useState(false);

	const { register, handleSubmit, formState, setError, reset } =
		useForm<AudienceDetailsFormValues>({
			resolver: valibotResolver(
				audienceDetailsSchema,
			) as Resolver<AudienceDetailsFormValues>,
			defaultValues: {
				firstName: audience.firstName || "",
				lastName: audience.lastName || "",
			},
		});

	const onSubmit = async (data: AudienceDetailsFormValues) => {
		try {
			changeStatus("loading");
			const response = await axios.put(
				`/api/audience/v1/update/${audience.id}`,
				data,
				{ headers: { credentials: "include" } },
			);

			await mutate(`/api/audience/v1/get/${audience.id}`);
			onUpdate(response.data);
			toast.success("Audience updated successfully");
			setIsEditing(false);
		} catch (error) {
			changeStatus("idle");
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "An unexpected error occurred"
				: "An unexpected error occurred";
			toast.error(errorMessage);
		}
	};

	const handleCancel = () => {
		reset();
		setIsEditing(false);
	};

	return (
		<div className="rounded-lg border border-stroke-soft-200 p-6">
			<div className="mb-6 flex items-center justify-between">
				<h2 className="font-medium text-lg">Audience Details</h2>
				{!isEditing ? (
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="small"
						onClick={() => setIsEditing(true)}
					>
						<Icon name="edit" className="h-4 w-4" />
						Edit
					</Button.Root>
				) : (
					<div className="flex gap-2">
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={handleCancel}
							disabled={status === "loading"}
						>
							Cancel
						</Button.Root>
						<Button.Root
							variant="neutral"
							size="small"
							onClick={handleSubmit(onSubmit)}
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
									Save
								</>
							)}
						</Button.Root>
					</div>
				)}
			</div>

			<div className="space-y-4">
				{/* Email (read-only) */}
				<div>
					<Label.Root className="mb-2 block font-medium text-gray-700 text-sm">
						Email Address
					</Label.Root>
					<div className="flex items-center gap-2 rounded-lg border border-stroke-soft-200 bg-gray-50 px-3 py-2">
						<Icon name="mail" className="h-4 w-4 text-text-sub-600" />
						<span className="text-text-strong-950">{audience.email}</span>
					</div>
					<p className="mt-1 text-text-sub-600 text-xs">
						Email address cannot be changed
					</p>
				</div>

				{/* First Name */}
				<div>
					<Label.Root
						htmlFor="firstName"
						className="mb-2 block font-medium text-gray-700 text-sm"
					>
						First Name
					</Label.Root>
					{isEditing ? (
						<Input.Root
							hasError={!!formState?.errors?.firstName?.message}
							className="w-full"
						>
							<Input.Wrapper>
								<Input.Input
									id="firstName"
									placeholder="Enter first name"
									{...register("firstName")}
									disabled={status === "loading"}
								/>
							</Input.Wrapper>
						</Input.Root>
					) : (
						<div className="flex items-center gap-2 rounded-lg border border-stroke-soft-200 bg-gray-50 px-3 py-2">
							<Icon name="user" className="h-4 w-4 text-text-sub-600" />
							<span className="text-text-strong-950">
								{audience.firstName || "—"}
							</span>
						</div>
					)}
					{formState.errors.firstName && (
						<div className="mt-2 flex items-center gap-2">
							<Icon name="alert-circle" className="h-4 w-4 text-red-500" />
							<p className="text-red-600 text-sm">
								{formState.errors.firstName.message}
							</p>
						</div>
					)}
				</div>

				{/* Last Name */}
				<div>
					<Label.Root
						htmlFor="lastName"
						className="mb-2 block font-medium text-gray-700 text-sm"
					>
						Last Name
					</Label.Root>
					{isEditing ? (
						<Input.Root
							hasError={!!formState?.errors?.lastName?.message}
							className="w-full"
						>
							<Input.Wrapper>
								<Input.Input
									id="lastName"
									placeholder="Enter last name"
									{...register("lastName")}
									disabled={status === "loading"}
								/>
							</Input.Wrapper>
						</Input.Root>
					) : (
						<div className="flex items-center gap-2 rounded-lg border border-stroke-soft-200 bg-gray-50 px-3 py-2">
							<Icon name="user" className="h-4 w-4 text-text-sub-600" />
							<span className="text-text-strong-950">
								{audience.lastName || "—"}
							</span>
						</div>
					)}
					{formState.errors.lastName && (
						<div className="mt-2 flex items-center gap-2">
							<Icon name="alert-circle" className="h-4 w-4 text-red-500" />
							<p className="text-red-600 text-sm">
								{formState.errors.lastName.message}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
