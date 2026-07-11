"use client";

import { valibotResolver } from "@hookform/resolvers/valibot";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { cn } from "@reloop/ui/cn";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import * as v from "valibot";
import { AccountDangerZone } from "./components/account-danger-zone";
import { AccountHeader } from "./components/account-header";
import { AccountProfilePicture } from "./components/account-profile-picture";

const accountSchema = v.object({
	firstName: v.pipe(v.string(), v.minLength(1, "First name is required")),
	lastName: v.pipe(v.string(), v.minLength(1, "Last name is required")),
	image: v.string(),
});

type AccountFormValues = v.InferOutput<typeof accountSchema>;

const AccountPage = () => {
	const { data: session, refetch } = authClient.useSession();
	const user = session?.user;
	const [isSaving, setIsSaving] = useState(false);
	const [emailCopied, setEmailCopied] = useState(false);
	const nameParts = user?.name?.split(" ") || [];

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<AccountFormValues>({
		resolver: valibotResolver(accountSchema),
		values: user
			? {
					firstName: nameParts[0] || "",
					lastName: nameParts.slice(1).join(" ") || "",
					image: user.image || "",
				}
			: undefined,
	});

	const firstName = watch("firstName");
	const lastName = watch("lastName");
	const image = watch("image");

	const fullName = `${firstName} ${lastName}`.trim();
	const hasChanges =
		fullName !== (user?.name || "") || image !== (user?.image || "");

	const handleCopyEmail = async () => {
		const email = user?.email || "";
		if (email) {
			try {
				await navigator.clipboard.writeText(email);
				toast.success("Email address copied to clipboard");
				setEmailCopied(true);
				setTimeout(() => setEmailCopied(false), 2000);
			} catch {
				toast.error("Failed to copy email address");
			}
		}
	};

	const handleSaveChanges = async (data: AccountFormValues) => {
		const updatedFullName = `${data.firstName} ${data.lastName}`.trim();
		setIsSaving(true);
		try {
			const { error } = await authClient.updateUser({
				name: updatedFullName,
				image: data.image || undefined,
			});

			if (error) {
				toast.error(error.message || "Failed to update profile");
				return;
			}

			await refetch();
			toast.success("Profile updated successfully");
		} catch (error) {
			console.error("Update error:", error);
			toast.error("Failed to update profile");
		} finally {
			setIsSaving(false);
		}
	};

	useHotkeys(
		"mod+enter",
		() => {
			if (hasChanges && !isSaving) {
				handleSubmit(handleSaveChanges)();
			}
		},
		{
			enableOnFormTags: true,
		},
	);

	const getInitials = () => {
		if (firstName || lastName) {
			return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
		}
		return user?.email?.charAt(0).toUpperCase() || "U";
	};

	return (
		<div className="w-full space-y-6 pt-4">
			<div>
				<AccountHeader />
				<form
					onSubmit={handleSubmit(handleSaveChanges)}
					className="w-full space-y-3"
				>
					<AccountProfilePicture
						initialImageUrl={user?.image || ""}
						onImageChange={(url) =>
							setValue("image", url, { shouldDirty: true })
						}
						initials={getInitials()}
						email={user?.email || ""}
					/>
					<div className="grid grid-cols-2 gap-4 pt-3">
						<div>
							<Label.Root htmlFor="firstName">First Name</Label.Root>
							<Input.Root
								className="mt-1 w-full"
								size="small"
								hasError={!!errors.firstName}
							>
								<Input.Wrapper className="w-full">
									<Input.Input
										id="firstName"
										type="text"
										placeholder="First Name"
										disabled={isSaving}
										{...register("firstName")}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
						<div>
							<Label.Root htmlFor="lastName">Last Name</Label.Root>
							<Input.Root
								className="mt-1 w-full"
								size="small"
								hasError={!!errors.lastName}
							>
								<Input.Wrapper className="w-full">
									<Input.Input
										id="lastName"
										type="text"
										placeholder="Last Name"
										disabled={isSaving}
										{...register("lastName")}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
					</div>

					<div>
						<Label.Root htmlFor="email" className="flex items-center gap-1">
							Email Address
							<span className="flex h-4 min-w-[20px] items-center justify-center rounded-[5px] border border-stroke-soft-100 bg-neutral-alpha-10 px-1.5 font-medium text-[11px] text-text-sub-600 dark:border-stroke-soft-100/40">
								Read only
							</span>
						</Label.Root>
						<Input.Root className="mt-1 w-full" size="small">
							<Input.Wrapper className="w-full pr-1.5!">
								<Input.Input
									id="email"
									type="email"
									value={user?.email || ""}
									readOnly
								/>
								<button
									type="button"
									onClick={handleCopyEmail}
									className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/5"
									title="Copy email address"
								>
									<Icon
										name={emailCopied ? "check" : "copy"}
										className={cn(
											"h-3.5 w-3.5",
											emailCopied ? "text-success-base" : "text-text-sub-600",
										)}
									/>
								</button>
							</Input.Wrapper>
						</Input.Root>
						<p className="mt-1 font-medium text-paragraph-xs text-text-sub-600">
							To change your email, contact support.
						</p>
					</div>
					<div className="flex justify-end">
						<Button.Root
							variant="neutral"
							size="xsmall"
							type="submit"
							className="w-40"
							disabled={!hasChanges || isSaving}
						>
							{isSaving ? (
								<Spinner size={14} color="var(--text-strong-950)" />
							) : (
								<>
									Save Changes
									<span className="inline-flex items-center gap-0.5">
										<Icon
											name="command"
											className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
										/>
										<Icon
											name="enter"
											className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
										/>
									</span>
								</>
							)}
						</Button.Root>
					</div>
					<AccountDangerZone />
				</form>
			</div>
		</div>
	);
};

export default AccountPage;
