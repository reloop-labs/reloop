"use client";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useSWRConfig } from "swr";
import * as v from "valibot";

const addContactSchema = v.object({
	email: v.pipe(
		v.string("Email is required"),
		v.email("Please enter a valid email address"),
	),
	firstName: v.optional(v.string()),
	lastName: v.optional(v.string()),
});

type AddContactFormValues = v.InferInput<typeof addContactSchema>;

interface AddContactProps {
	topicId: string;
	topicName: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const AddContact = ({
	topicId,
	topicName,
	open,
	onOpenChange,
}: AddContactProps) => {
	const { mutate } = useSWRConfig();
	const { changeStatus, status } = useLoading();

	const { register, handleSubmit, formState, setError, reset } =
		useForm<AddContactFormValues>({
			resolver: valibotResolver(
				addContactSchema,
			) as Resolver<AddContactFormValues>,
			defaultValues: {
				email: "",
				firstName: "",
				lastName: "",
			},
		});

	const onSubmit = async ({
		email,
		firstName,
		lastName,
	}: AddContactFormValues) => {
		try {
			changeStatus("loading");
			await axios.post(
				"/api/contacts/v1/contacts/add-to-topic",
				{
					email,
					firstName: firstName || undefined,
					lastName: lastName || undefined,
					topicId,
				},
				{ withCredentials: true },
			);
			await mutate(
				`/api/contacts/v1/subscriptions/list?topicId=${topicId}&limit=100`,
			);
			reset();
			onOpenChange(false);
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to add contact"
				: "Failed to add contact";
			setError("email", {
				type: "manual",
				message: errorMessage,
			});
		} finally {
			changeStatus("idle");
		}
	};

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-md">
				<Modal.Header>
					<Modal.Title>Add Contact</Modal.Title>
					<Modal.Description>Add a contact to "{topicName}"</Modal.Description>
				</Modal.Header>

				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="space-y-4 p-4">
						<div>
							<Label.Root
								htmlFor="email"
								className="mb-2 block font-medium text-sm"
							>
								Email
								<Label.Asterisk />
							</Label.Root>
							<Input.Root hasError={!!formState.errors.email}>
								<Input.Wrapper>
									<Input.Input
										id="email"
										type="email"
										placeholder="contact@example.com"
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
									className="mb-2 block font-medium text-sm"
								>
									First Name
								</Label.Root>
								<Input.Root>
									<Input.Wrapper>
										<Input.Input
											id="firstName"
											placeholder="John"
											{...register("firstName")}
											disabled={status === "loading"}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
							<div>
								<Label.Root
									htmlFor="lastName"
									className="mb-2 block font-medium text-sm"
								>
									Last Name
								</Label.Root>
								<Input.Root>
									<Input.Wrapper>
										<Input.Input
											id="lastName"
											placeholder="Doe"
											{...register("lastName")}
											disabled={status === "loading"}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
						</div>
					</div>

					<Modal.Footer>
						<Button.Root
							type="button"
							variant="neutral"
							mode="stroke"
							onClick={() => onOpenChange(false)}
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
									<Spinner color="currentColor" />
									Adding...
								</>
							) : (
								<>
									<Icon name="user-plus" className="h-4 w-4" />
									Add Contact
								</>
							)}
						</Button.Root>
					</Modal.Footer>
				</form>
			</Modal.Content>
		</Modal.Root>
	);
};
