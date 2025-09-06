"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/components/button";
import { Icon } from "@reloop/ui/components/icon";
import * as Input from "@reloop/ui/components/input";
import * as Label from "@reloop/ui/components/label";
import * as Select from "@reloop/ui/components/select";
import Spinner from "@reloop/ui/components/spinner";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const userSchema = z.object({
	email: z
		.string()
		.min(1, "Email is required")
		.email("Please enter a valid email address"),
	role: z.enum(["dev", "marketing", "admin"]),
});

const formSchema = z.object({
	users: z.array(userSchema).min(1, "Add at least one user"),
});

type InviteValues = z.infer<typeof formSchema>;

export const InviteForm = () => {
	const [loading, setLoading] = useState(false);
	const form = useForm<InviteValues>({
		resolver: zodResolver(formSchema),
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
					role: "admin",
					organizationId: session?.user.activeOrganizationId,
				});
			}
			form.reset({ users: [{ email: "", role: "dev" }] });
		} catch (error) {
			toast.error("Failed to invite team members");
		} finally {
			setLoading(false);
		}
	};

	const addNewUser = () => append({ email: "", role: "dev" });

	return (
		<div className="my-4 rounded-xl border border-stroke-soft-200 bg-neutral-alpha-10">
			<p className="p-4 text-text-strong-950">
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
										onValueChange={(value) =>
											form.setValue(
												`users.${index}.role`,
												value as "dev" | "marketing" | "admin",
											)
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
