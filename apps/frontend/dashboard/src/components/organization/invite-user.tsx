"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import * as Select from "@reloop/ui/select";
import Spinner from "@reloop/ui/spinner";
import { useState } from "react";
import type { Resolver } from "react-hook-form";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as v from "valibot";

const userSchema = v.object({
	email: v.pipe(
		v.string("Email is required"),
		v.email("Please enter a valid email address"),
	),
	role: v.picklist(["dev", "marketing", "admin"], "Please select a valid role"),
});

const formSchema = v.object({
	users: v.pipe(v.array(userSchema), v.minLength(1, "Add at least one user")),
});

type InviteValues = v.InferInput<typeof formSchema>;

export const InviteMember = ({ onClose }: { onClose: () => void }) => {
	const [loading, setLoading] = useState(false);
	const form = useForm<InviteValues>({
		resolver: valibotResolver(formSchema) as Resolver<InviteValues>,
		defaultValues: {
			users: [{ email: "", role: "dev" }],
		},
	});
	const { data: session } = authClient.useSession();
	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "users",
	});

	const onSubmit = async (data: InviteValues) => {
		if (!session?.user.activeOrganizationId) return;
		setLoading(true);
		const { users } = data;
		try {
			toast.success("Team members invited successfully!");
			for (const user of users) {
				await authClient.organization.inviteMember({
					email: user.email,
					role: "member",
					organizationId: session?.user.activeOrganizationId,
				});
			}
			form.reset({ users: [{ email: "", role: "dev" }] });
			onClose();
		} catch (error) {
			toast.error("Failed to invite team members");
		} finally {
			setLoading(false);
		}
	};

	const addNewUser = () => append({ email: "", role: "dev" });

	return (
		<form onSubmit={form.handleSubmit(onSubmit)}>
			<div className="gap-7 space-y-4">
				<Modal.Body>
					<div className="mb-5 space-y-1">
						<div className="font-medium text-label-md text-text-strong-950">
							Invite Team Members
						</div>
						<div className="text-paragraph-sm text-text-sub-600">
							Enter the email addresses of the people you'd like to invite to
							your
						</div>
					</div>

					{!!fields.length && (
						<div className="mb-2 flex items-start gap-2">
							<Label.Root className="w-1/2 text-paragraph-sm text-text-strong-950">
								Email Address
							</Label.Root>
							<Label.Root className="ml-5 text-paragraph-sm text-text-strong-950">
								Role
							</Label.Root>
						</div>
					)}
					<div className="space-y-3">
						{fields.map((field, index) => (
							<div key={field.id} className="flex gap-2">
								<div className="flex-1">
									<Input.Root size='small'>
										<Input.Wrapper>
											<Input.Input
												placeholder="colleague@company.com"
												disabled={loading}
												{...form.register(`users.${index}.email`)}
											/>
										</Input.Wrapper>
									</Input.Root>
									{form.formState.errors.users?.[index]?.email && (
										<p className="mt-1 text-error-base text-paragraph-sm">
											{form.formState.errors.users[index]?.email?.message}
										</p>
									)}
								</div>

								<div>
									<Select.Root
										disabled={loading}
										onValueChange={(value: "dev" | "marketing" | "admin") =>
											form.setValue(`users.${index}.role`, value)
										}
										defaultValue={field.role}
									>
										<Select.Trigger>
											<Select.Value placeholder="Select role" />
										</Select.Trigger>
										<Select.Content>
											<Select.Item value="dev">Developer</Select.Item>
											<Select.Item value="marketing">Marketing</Select.Item>
											<Select.Item value="admin">Admin</Select.Item>
										</Select.Content>
									</Select.Root>
									{form.formState.errors.users?.[index]?.role && (
										<p className="mt-1 text-error-base text-paragraph-sm">
											{form.formState.errors.users[index]?.role?.message}
										</p>
									)}
								</div>

								<Button.Root
									type="button"
									variant="neutral"
									mode="stroke"
									size="xsmall"
									className="h-10 w-10 p-0"
									disabled={loading}
									onClick={() => remove(index)}
								>
									<Icon name="minus-rounded-border" className="h-4 w-4" />
								</Button.Root>
							</div>
						))}
					</div>
					<Button.Root
						type="button"
						onClick={addNewUser}
						variant="neutral"
						mode="stroke"
						size="medium"
						className="mt-3 flex items-center gap-2"
					>
						<Icon name="plus-outline" className="h-4 w-4" />
						<span>Add Member</span>
					</Button.Root>
				</Modal.Body>
			</div>

			<Modal.Footer className="flex justify-end">
				<Button.Root
					type="button"
					variant="neutral"
					mode="stroke"
					disabled={loading}
					onClick={onClose}
				>
					Skip
				</Button.Root>
				<Button.Root
					className="w-24"
					type="submit"
					variant="neutral"
					disabled={loading}
				>
					{loading && <Spinner color="var(--text-strong-950)" />}
					{loading ? "Inviting..." : "Invite"}
				</Button.Root>
			</Modal.Footer>
		</form>
	);
};
