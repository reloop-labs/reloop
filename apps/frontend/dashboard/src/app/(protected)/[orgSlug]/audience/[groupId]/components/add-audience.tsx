"use client";
import { isValidEmail, isValidPhone } from "@fe/dashboard/utils/audience";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import * as Select from "@reloop/ui/select";
import Spinner from "@reloop/ui/spinner";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import * as v from "valibot";

const addAudienceSchema = v.object({
	email: v.pipe(
		v.string("Email is required"),
		v.minLength(1, "Email is required"),
		v.custom(
			(email: unknown) => typeof email === "string" && isValidEmail(email),
			"Please enter a valid email address",
		),
	),
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
	phone: v.optional(
		v.pipe(
			v.string(),
			v.maxLength(50, "Phone must be less than 50 characters"),
			v.custom(
				(phone: unknown) =>
					typeof phone === "string" && (!phone || isValidPhone(phone)),
				"Please enter a valid phone number",
			),
		),
	),
	status: v.optional(
		v.union([v.literal("subscribed"), v.literal("unsubscribed")]),
	),
});

type AddAudienceFormValues = v.InferInput<typeof addAudienceSchema>;

interface AddAudienceProps {
	groupId: string;
	groupName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const AddAudience = ({
	groupId,
	groupName,
	open,
	onOpenChange,
}: AddAudienceProps) => {
	const { changeStatus, status } = useLoading();
	const { mutate } = useSWRConfig();
	const {
		register,
		handleSubmit,
		formState,
		setError,
		reset,
		watch,
		setValue,
	} = useForm<AddAudienceFormValues>({
		resolver: valibotResolver(
			addAudienceSchema,
		) as Resolver<AddAudienceFormValues>,
		defaultValues: {
			email: "",
			firstName: "",
			lastName: "",
			phone: "",
			status: "subscribed",
		},
	});

	const onSubmit = async (data: AddAudienceFormValues) => {
		try {
			changeStatus("loading");
			await axios.post(
				"/api/audience/v1/add",
				{
					...data,
					audienceGroupId: groupId,
				},
				{ headers: { credentials: "include" } },
			);
			await mutate(`/api/audience/v1/list?audienceGroupId=${groupId}`);
			toast.success("Audience added successfully");
			reset();
			onOpenChange(false);
		} catch (error) {
			changeStatus("idle");
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "An unexpected error occurred"
				: "An unexpected error occurred";
			setError("email", {
				type: "manual",
				message: errorMessage,
			});
		}
	};

	const handleCancel = () => {
		reset();
		onOpenChange(false);
	};

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-md">
				<Modal.Header>
					<Modal.Title>Add Audience to "{groupName}"</Modal.Title>
					<Modal.Description>
						Add a new audience to this group. All fields except email are
						optional.
					</Modal.Description>
				</Modal.Header>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					<div>
						<Label.Root
							htmlFor="email"
							className="mb-2 block font-medium text-gray-700 text-sm"
						>
							Email Address
							<Label.Asterisk />
						</Label.Root>
						<Input.Root
							hasError={!!formState?.errors?.email?.message}
							className="w-full"
						>
							<Input.Wrapper>
								<Input.Input
									id="email"
									type="email"
									placeholder="john@example.com"
									{...register("email")}
									disabled={status === "loading"}
								/>
							</Input.Wrapper>
						</Input.Root>
						{formState.errors.email && (
							<div className="mt-2 flex items-center gap-2">
								<Icon name="alert-circle" className="h-4 w-4 text-red-500" />
								<p className="text-red-600 text-sm">
									{formState.errors.email.message}
								</p>
							</div>
						)}
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label.Root
								htmlFor="firstName"
								className="mb-2 block font-medium text-gray-700 text-sm"
							>
								First Name
							</Label.Root>
							<Input.Root
								hasError={!!formState?.errors?.firstName?.message}
								className="w-full"
							>
								<Input.Wrapper>
									<Input.Input
										id="firstName"
										placeholder="John"
										{...register("firstName")}
										disabled={status === "loading"}
									/>
								</Input.Wrapper>
							</Input.Root>
							{formState.errors.firstName && (
								<div className="mt-2 flex items-center gap-2">
									<Icon name="alert-circle" className="h-4 w-4 text-red-500" />
									<p className="text-red-600 text-sm">
										{formState.errors.firstName.message}
									</p>
								</div>
							)}
						</div>

						<div>
							<Label.Root
								htmlFor="lastName"
								className="mb-2 block font-medium text-gray-700 text-sm"
							>
								Last Name
							</Label.Root>
							<Input.Root
								hasError={!!formState?.errors?.lastName?.message}
								className="w-full"
							>
								<Input.Wrapper>
									<Input.Input
										id="lastName"
										placeholder="Doe"
										{...register("lastName")}
										disabled={status === "loading"}
									/>
								</Input.Wrapper>
							</Input.Root>
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

					<div>
						<Label.Root
							htmlFor="phone"
							className="mb-2 block font-medium text-gray-700 text-sm"
						>
							Phone Number
						</Label.Root>
						<Input.Root
							hasError={!!formState?.errors?.phone?.message}
							className="w-full"
						>
							<Input.Wrapper>
								<Input.Input
									id="phone"
									type="tel"
									placeholder="+1 (555) 123-4567"
									{...register("phone")}
									disabled={status === "loading"}
								/>
							</Input.Wrapper>
						</Input.Root>
						{formState.errors.phone && (
							<div className="mt-2 flex items-center gap-2">
								<Icon name="alert-circle" className="h-4 w-4 text-red-500" />
								<p className="text-red-600 text-sm">
									{formState.errors.phone.message}
								</p>
							</div>
						)}
					</div>

					<div>
						<Label.Root
							htmlFor="status"
							className="mb-2 block font-medium text-gray-700 text-sm"
						>
							Subscription Status
						</Label.Root>
						<Select.Root
							value={watch("status")}
							onValueChange={(value) => {
								setValue("status", value as "subscribed" | "unsubscribed");
							}}
						>
							<Select.Trigger className="w-full">
								<Select.Value placeholder="Select status" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="subscribed">
									<div className="flex items-center gap-2 text-sm">
										<Icon
											name="check-circle"
											className="h-4 w-4 text-success-base"
										/>
										Subscribed
									</div>
								</Select.Item>
								<Select.Item value="unsubscribed">
									<div className="flex items-center gap-2 text-sm">
										<Icon
											name="minus-circle"
											className="h-4 w-4 text-text-sub-600"
										/>
										Unsubscribed
									</div>
								</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>

					<Modal.Footer className="flex gap-2">
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							onClick={handleCancel}
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
									Adding...
								</>
							) : (
								<>
									<Icon name="plus" className="h-4 w-4" />
									Add Audience
								</>
							)}
						</Button.Root>
					</Modal.Footer>
				</form>
			</Modal.Content>
		</Modal.Root>
	);
};
