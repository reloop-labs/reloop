"use client";
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

	const { register, handleSubmit, formState, reset } =
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
			{/* Header with icon and title */}
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
						<Icon name="user" className="h-5 w-5 text-blue-600" />
					</div>
					<div>
						<h2 className="font-semibold text-gray-900 text-lg">
							Audience Details
						</h2>
						<p className="text-gray-500 text-sm">
							Manage audience information and preferences
						</p>
					</div>
				</div>
				{!isEditing ? (
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="small"
						onClick={() => setIsEditing(true)}
						className="transition-colors hover:bg-gray-50"
					>
						<Icon name="edit" className="h-4 w-4" />
						Edit Details
					</Button.Root>
				) : (
					<div className="flex gap-2">
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="small"
							onClick={handleCancel}
							disabled={status === "loading"}
							className="transition-colors hover:bg-gray-50"
						>
							Cancel
						</Button.Root>
						<Button.Root
							variant="neutral"
							size="small"
							onClick={handleSubmit(onSubmit)}
							disabled={status === "loading" || !formState.isValid}
							className="transition-colors hover:bg-gray-700"
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
					</div>
				)}
			</div>

			{/* Form fields */}
			<div className="space-y-6">
				{/* Email (read-only) */}
				<div className="space-y-2">
					<Label.Root className="block font-medium text-gray-700 text-sm">
						Email Address
					</Label.Root>
					<div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
						<Icon name="mail" className="h-4 w-4 text-gray-500" />
						<span className="font-medium text-gray-900">{audience.email}</span>
						<div className="ml-auto">
							<span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-800 text-xs">
								Primary
							</span>
						</div>
					</div>
					<p className="text-gray-500 text-xs">
						Email address cannot be changed. This is the primary identifier for
						this audience.
					</p>
				</div>

				{/* First Name */}
				<div className="space-y-2">
					<Label.Root
						htmlFor="firstName"
						className="block font-medium text-gray-700 text-sm"
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
									className="transition-colors focus:ring-2 focus:ring-blue-500"
								/>
							</Input.Wrapper>
						</Input.Root>
					) : (
						<div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
							<Icon name="user" className="h-4 w-4 text-gray-500" />
							<span className="font-medium text-gray-900">
								{audience.firstName || (
									<span className="text-gray-400 italic">Not provided</span>
								)}
							</span>
						</div>
					)}
					{formState.errors.firstName && (
						<div className="flex items-center gap-2 rounded-lg bg-red-50 p-3">
							<Icon name="alert-circle" className="h-4 w-4 text-red-500" />
							<p className="text-red-700 text-sm">
								{formState.errors.firstName.message}
							</p>
						</div>
					)}
				</div>

				{/* Last Name */}
				<div className="space-y-2">
					<Label.Root
						htmlFor="lastName"
						className="block font-medium text-gray-700 text-sm"
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
									className="transition-colors focus:ring-2 focus:ring-blue-500"
								/>
							</Input.Wrapper>
						</Input.Root>
					) : (
						<div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
							<Icon name="user" className="h-4 w-4 text-gray-500" />
							<span className="font-medium text-gray-900">
								{audience.lastName || (
									<span className="text-gray-400 italic">Not provided</span>
								)}
							</span>
						</div>
					)}
					{formState.errors.lastName && (
						<div className="flex items-center gap-2 rounded-lg bg-red-50 p-3">
							<Icon name="alert-circle" className="h-4 w-4 text-red-500" />
							<p className="text-red-700 text-sm">
								{formState.errors.lastName.message}
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Edit mode indicator */}
			{isEditing && (
				<div className="mt-6 rounded-lg bg-blue-50 p-4">
					<div className="flex items-center gap-2">
						<Icon name="info" className="h-4 w-4 text-blue-600" />
						<p className="text-blue-800 text-sm">
							You're editing audience details. Changes will be saved immediately
							when you click "Save Changes".
						</p>
					</div>
				</div>
			)}
		</div>
	);
};
