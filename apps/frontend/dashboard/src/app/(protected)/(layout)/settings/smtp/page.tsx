"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const SMTPPage = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();
	const [isSaving, setIsSaving] = useState(false);

	const handleSaveChanges = async (data: any) => {
		setIsSaving(true);
		try {
			// Mock API call
			await new Promise((resolve) => setTimeout(resolve, 1500));
			toast.success("SMTP settings updated successfully");
		} catch (error) {
			toast.error("Failed to update SMTP settings");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="w-full space-y-8 pt-5">
			<div>
				<div className="mb-6">
					<p className="font-medium text-label-md text-text-strong-950">
						SMTP Configuration
					</p>
					<p className="text-paragraph-sm text-text-sub-600">
						Set up your custom SMTP server to send transactional emails.
					</p>
				</div>

				<form
					onSubmit={handleSubmit(handleSaveChanges)}
					className="w-full space-y-5"
				>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="sm:col-span-2">
							<Label.Root htmlFor="host">SMTP Host</Label.Root>
							<Input.Root className="mt-1 w-full" size="small">
								<Input.Wrapper className="w-full">
									<Input.Input
										id="host"
										type="text"
										placeholder="smtp.example.com"
										{...register("host")}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>

						<div>
							<Label.Root htmlFor="port">Port</Label.Root>
							<Input.Root className="mt-1 w-full" size="small">
								<Input.Wrapper className="w-full">
									<Input.Input
										id="port"
										type="number"
										placeholder="587"
										{...register("port")}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>

						<div>
							<Label.Root htmlFor="encryption">Encryption</Label.Root>
							<Input.Root className="mt-1 w-full" size="small">
								<Input.Wrapper className="w-full">
									<Input.Input
										id="encryption"
										type="text"
										placeholder="TLS / SSL"
										{...register("encryption")}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>

						<div>
							<Label.Root htmlFor="user">Username</Label.Root>
							<Input.Root className="mt-1 w-full" size="small">
								<Input.Wrapper className="w-full">
									<Input.Input
										id="user"
										type="text"
										placeholder="apikey"
										{...register("user")}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>

						<div>
							<Label.Root htmlFor="password">Password</Label.Root>
							<Input.Root className="mt-1 w-full" size="small">
								<Input.Wrapper className="w-full">
									<Input.Input
										id="password"
										type="password"
										placeholder="••••••••"
										{...register("password")}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>

						<div className="sm:col-span-2">
							<Label.Root htmlFor="fromEmail">From Email</Label.Root>
							<Input.Root className="mt-1 w-full" size="small">
								<Input.Wrapper className="w-full">
									<Input.Input
										id="fromEmail"
										type="email"
										placeholder="notifications@yourdomain.com"
										{...register("fromEmail")}
									/>
								</Input.Wrapper>
							</Input.Root>
						</div>
					</div>

					<div className="flex justify-end">
						<Button.Root
							variant="neutral"
							size="xsmall"
							type="submit"
							className="w-40"
							disabled={isSaving}
						>
							{isSaving ? (
								<Spinner size={14} color="var(--text-strong-950)" />
							) : (
								<>
									Save Changes
									<span className="inline-flex items-center gap-0.5 ml-2">
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
				</form>
			</div>
		</div>
	);
};

export default SMTPPage;
