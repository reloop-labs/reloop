"use client";
import { isValidEmail } from "@fe/dashboard/utils/audience";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Kbd from "@reloop/ui/kbd";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import * as Select from "@reloop/ui/select";
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
			changeStatus("idle");
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
		changeStatus("idle");
		onOpenChange(false);
	};

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:zoom-in-95 data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 data-[state=closed]:zoom-out-95 max-w-md duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in">
				<Modal.Body>
					<h2 className="mb-2 font-semibold text-gray-900 text-xl">
						Add Audience to "{groupName}"
					</h2>
					<p className="mb-4 text-gray-600 text-sm">
						Add a new audience to this group. All fields except email are
						optional.
					</p>

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
										<Icon
											name="alert-circle"
											className="h-4 w-4 text-red-500"
										/>
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
										<Icon
											name="alert-circle"
											className="h-4 w-4 text-red-500"
										/>
										<p className="text-red-600 text-sm">
											{formState.errors.lastName.message}
										</p>
									</div>
								)}
							</div>
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
								<Select.Trigger id="status">
									<Select.Value placeholder="Select status" />
								</Select.Trigger>
								<Select.Content className="w-[410px]">
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
					</form>
				</Modal.Body>

				<Modal.Footer className="flex items-center justify-end gap-3">
					<Button.Root
						type="button"
						variant="neutral"
						size="small"
						mode="stroke"
						onClick={handleCancel}
						disabled={status === "loading"}
					>
						Close
						<Kbd.Root className="bg-bg-weak-50 text-xs">Esc</Kbd.Root>
					</Button.Root>
					<Button.Root
						variant="neutral"
						size="small"
						onClick={handleSubmit(onSubmit)}
						disabled={status === "loading" || !formState.isValid}
					>
						{status === "loading" ? (
							<>
								<Icon name="loader" className="h-4 w-4 animate-spin" />
								Adding...
							</>
						) : (
							<>
								Add Audience
								<Icon name="undo" className="h-3 w-3 scale-y-[-1]" />
							</>
						)}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
};
