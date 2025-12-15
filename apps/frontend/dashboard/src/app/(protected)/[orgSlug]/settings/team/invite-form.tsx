"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Select from "@reloop/ui/select";
import Spinner from "@reloop/ui/spinner";
import { useState } from "react";
import type { Resolver } from "react-hook-form";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
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

const roleOptions = [
	{
		value: "admin",
		label: "Admin",
		description: "Full access to all features",
		icon: "shield",
	},
	{
		value: "member",
		label: "Member",
		description: "Read-only access",
		icon: "user",
	},
] as const;

export const InviteForm = () => {
	const [loading, setLoading] = useState(false);
	const { mutate } = useSWRConfig();
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
			const results = await Promise.allSettled(
				users.map((user) =>
					authClient.organization.inviteMember({
						email: user.email,
						role: user.role,
						organizationId: session?.user.activeOrganizationId ?? undefined,
					}),
				),
			);

			const successCount = results.filter(
				(r) => r.status === "fulfilled",
			).length;
			const failCount = results.filter((r) => r.status === "rejected").length;

			if (successCount > 0) {
				toast.success(
					`${successCount} invitation${successCount > 1 ? "s" : ""} sent successfully!`,
				);
				form.reset({ users: [{ email: "", role: "member" }] });
				mutate((key) => typeof key === "string" && key.startsWith("invitations-"));
			}

			if (failCount > 0) {
				toast.error(`${failCount} invitation${failCount > 1 ? "s" : ""} failed`);
			}
		} catch (error) {
			toast.error("Failed to invite team members");
		} finally {
			setLoading(false);
		}
	};

	const addNewUser = () => append({ email: "", role: "member" });

	return (
		<div className="overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0">
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className="p-4 space-y-4">
					{!!fields.length && (
						<div className="grid grid-cols-[1fr_140px_40px] gap-3 text-paragraph-xs text-text-sub-600 font-medium">
							<span>Email Address</span>
							<span>Role</span>
							<span />
						</div>
					)}
					<div className="space-y-3">
						{fields.map((field, index) => (
							<div
								key={field.id}
								className="grid grid-cols-[1fr_140px_40px] gap-3 items-start"
							>
								<div>
									<Input.Root size="small">
										<Input.Wrapper>
											<Input.Input
												placeholder="colleague@company.com"
												disabled={loading}
												{...form.register(`users.${index}.email`)}
											/>
										</Input.Wrapper>
									</Input.Root>
									{form.formState.errors.users?.[index]?.email && (
										<p className="mt-1 text-error-base text-paragraph-xs">
											{form.formState.errors.users[index]?.email?.message}
										</p>
									)}
								</div>

								<div>
									<Select.Root
										size="small"
										disabled={loading}
										onValueChange={(value: "admin" | "member") => {
											form.setValue(`users.${index}.role`, value);
										}}
										defaultValue={field.role}
									>
										<Select.Trigger className="w-full">
											<Select.Value placeholder="Select role" />
										</Select.Trigger>
										<Select.Content>
											{roleOptions.map((option) => (
												<Select.Item key={option.value} value={option.value}>
													<div className="flex items-center gap-1.5 w-20">
														<Icon name={option.icon} className="h-3 w-3 text-text-sub-600" />
														<span className="text-xs">{option.label}</span>
													</div>
												</Select.Item>
											))}
										</Select.Content>
									</Select.Root>
								</div>

								<Button.Root
									type="button"
									variant="neutral"
									mode="stroke"
									size="small"
									className={fields.length === 1 ? "invisible" : ""}
									disabled={loading}
									onClick={() => remove(index)}
								>
									<Icon name="minus-circle" className="h-4 w-4 text-text-sub-600" />
								</Button.Root>
							</div>
						))}
					</div>
					<Button.Root
						type="button"
						onClick={addNewUser}
						variant="neutral"
						mode="ghost"
						size="small"
						disabled={loading}
					>
						<Icon name="plus" className="h-4 w-4" />
						<span>Add another</span>
					</Button.Root>
				</div>

				<div className="flex justify-end border-stroke-soft-100 border-t px-4 py-3 bg-bg-weak-50/50">
					<Button.Root
						type="submit"
						variant="neutral"
						size="xsmall"
						disabled={loading}
					>
						{loading && <Spinner size={14} color="currentColor" />}
						{loading ? "Sending..." : "Send Invitations"}
					</Button.Root>
				</div>
			</form>
		</div>
	);
};
