import { valibotResolver } from "@hookform/resolvers/valibot";
import { authClient } from "@reloop/auth/client";
import { cn } from "@reloop/ui/cn";
import * as FancyButton from "@reloop/ui/fancy-button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import * as v from "valibot";
import { useSessionQuery } from "#/features/auth/session-query";
import { ActionKbd } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { queryKeys } from "#/lib/query-keys";
import { AccountDangerZone } from "./account-danger-zone";
import { AccountHeader } from "./account-header";
import { AccountProfilePicture } from "./account-profile-picture";

const actionKbdOnBlueClassName =
	"border-white/25 bg-white/15 text-white shadow-[0_1.5px_0_0_rgba(0,0,0,0.2)] dark:border-white/25 dark:bg-white/15 dark:text-white dark:shadow-[0_1.5px_0_0_rgba(0,0,0,0.35)]";

const accountSchema = v.object({
	firstName: v.pipe(v.string(), v.minLength(1, "First name is required")),
	lastName: v.pipe(v.string(), v.minLength(1, "Last name is required")),
	image: v.string(),
});

type AccountFormValues = v.InferOutput<typeof accountSchema>;

export function ProfilePage() {
	const queryClient = useQueryClient();
	const { data: session } = useSessionQuery();
	const user = session?.user;
	const [status, setStatus] = useState<"idle" | "saving" | "success">("idle");
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
		setStatus("saving");
		try {
			const { error } = await authClient.updateUser({
				name: updatedFullName,
				image: data.image || undefined,
			});

			if (error) {
				toast.error(error.message || "Failed to update profile");
				setStatus("idle");
				return;
			}

			await queryClient.invalidateQueries({
				queryKey: queryKeys.auth.session(),
			});
			setStatus("success");
			setTimeout(() => {
				setStatus("idle");
			}, 1500);
		} catch (error) {
			console.error("Update error:", error);
			toast.error("Failed to update profile");
			setStatus("idle");
		}
	};

	useHotkeys(
		"enter",
		() => {
			if (hasChanges && status === "idle") {
				void handleSubmit(handleSaveChanges)();
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
		<div className="w-full space-y-6 pt-5">
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
						name={fullName || user?.name}
						initials={getInitials()}
						email={user?.email || ""}
					/>
					<div className="grid grid-cols-2 gap-4 pt-3">
						<div>
							<Label.Root htmlFor="firstName">First Name</Label.Root>
							<Input.Root
								className="mt-1 w-full"
								size="medium"
								hasError={!!errors.firstName}
							>
								<Input.Wrapper className="w-full">
									<Input.Input
										id="firstName"
										type="text"
										placeholder="First Name"
										disabled={status !== "idle"}
										{...register("firstName")}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
						<div>
							<Label.Root htmlFor="lastName">Last Name</Label.Root>
							<Input.Root
								className="mt-1 w-full"
								size="medium"
								hasError={!!errors.lastName}
							>
								<Input.Wrapper className="w-full">
									<Input.Input
										id="lastName"
										type="text"
										placeholder="Last Name"
										disabled={status !== "idle"}
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
						<Input.Root className="mt-1 w-full" size="medium">
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
						<FancyButton.Root
							variant={status === "success" ? "success" : "blue"}
							size="small"
							type="submit"
							className={cn(
								"min-w-[140px] justify-center overflow-hidden transition-all duration-200",
								status === "saving" && "opacity-90",
							)}
							disabled={!hasChanges || status === "saving"}
						>
							<AnimatePresence mode="popLayout" initial={false}>
								<motion.span
									key={status}
									transition={{
										type: "spring",
										duration: 0.25,
										bounce: 0,
									}}
									initial={{ opacity: 0, y: -14 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 14 }}
									className="flex items-center justify-center gap-1.5 font-medium text-xs"
								>
									{status === "saving" ? (
										<>
											<Spinner size={12} color="var(--static-white)" />
											<span>Saving...</span>
										</>
									) : status === "success" ? (
										<>
											<Icon name="check-circle" className="h-3.5 w-3.5" />
											<span>Updated</span>
										</>
									) : (
										<>
											<span>Save Changes</span>
											<ActionKbd className={actionKbdOnBlueClassName}>↵</ActionKbd>
										</>
									)}
								</motion.span>
							</AnimatePresence>
						</FancyButton.Root>
					</div>
					<AccountDangerZone />
				</form>
			</div>
		</div>
	);
}
