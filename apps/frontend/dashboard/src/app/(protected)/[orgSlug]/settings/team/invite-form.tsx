"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
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
	role: v.picklist(["admin", "member"], "Please select a valid role"),
});

const formSchema = v.object({
	users: v.pipe(v.array(userSchema), v.minLength(1, "Add at least one user")),
});

type InviteValues = v.InferInput<typeof formSchema>;

export const InviteForm = () => {
	const [loading, setLoading] = useState(false);
	const form = useForm<InviteValues>({
		resolver: valibotResolver(formSchema) as Resolver<InviteValues>,
		defaultValues: {
			users: [{ email: "", role: "member" }],
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
					role: user.role,
					organizationId: session?.user.activeOrganizationId,
				});
			}
			form.reset({ users: [{ email: "", role: "member" }] });
		} catch (error) {
			toast.error("Failed to invite team members");
		} finally {
			setLoading(false);
		}
	};

	const addNewUser = () => append({ email: "", role: "member" });

	return (
		<div className="my-4 rounded-xl border border-stroke-soft-200 bg-neutral-alpha-10">
			<p className="p-4 font-medium text-text-strong-950">
				Invite a new member by email address
			</p>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="mx-0.5 mb-0.5 rounded-lg bg-bg-white-0"
			>
				<div className="gap-7 space-y-4 p-4">
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
									<Input.Root>
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
										onValueChange={(value: "admin" | "member") => {
											form.setValue(`users.${index}.role`, value);
										}}
										defaultValue={field.role}
									>
										<Select.Trigger>
											<Select.Value placeholder="Select role" />
										</Select.Trigger>
										<Select.Content>
											<Select.Item value="admin">Admin (Full Access)</Select.Item>
											<Select.Item value="member">Member (Read Only)</Select.Item>
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
				</div>
				<div className="flex justify-end border-stroke-soft-100 border-t p-4">
					<Button.Root type="submit" variant="neutral" disabled={loading}>
						{loading && <Spinner color="var(--text-strong-950)" />}
						{loading ? "Inviting..." : "Invite"}
					</Button.Root>
				</div>
			</form>
		</div>
	);
};
