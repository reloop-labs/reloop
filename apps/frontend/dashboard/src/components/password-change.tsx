"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import { useState } from "react";
import { toast } from "sonner";

interface PasswordChangeProps {
	className?: string;
}

interface PasswordForm {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
}

interface FormErrors {
	currentPassword?: string;
	newPassword?: string;
	confirmPassword?: string;
}

export const PasswordChange = ({ className }: PasswordChangeProps) => {
	const [form, setForm] = useState<PasswordForm>({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState<FormErrors>({});
	const [isLoading, setIsLoading] = useState(false);
	const [showPasswords, setShowPasswords] = useState({
		current: false,
		new: false,
		confirm: false,
	});

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		// Current password validation
		if (!form.currentPassword.trim()) {
			newErrors.currentPassword = "Current password is required";
		}

		// New password validation
		if (!form.newPassword.trim()) {
			newErrors.newPassword = "New password is required";
		} else if (form.newPassword.length < 8) {
			newErrors.newPassword = "Password must be at least 8 characters long";
		} else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.newPassword)) {
			newErrors.newPassword =
				"Password must contain at least one uppercase letter, one lowercase letter, and one number";
		}

		// Confirm password validation
		if (!form.confirmPassword.trim()) {
			newErrors.confirmPassword = "Please confirm your new password";
		} else if (form.newPassword !== form.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		// Check if new password is same as current
		if (
			form.currentPassword &&
			form.newPassword &&
			form.currentPassword === form.newPassword
		) {
			newErrors.newPassword =
				"New password must be different from current password";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleInputChange = (field: keyof PasswordForm, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsLoading(true);
		try {
			const response = await fetch("/api/auth/change-password", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					currentPassword: form.currentPassword,
					newPassword: form.newPassword,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to change password");
			}

			toast.success("Password changed successfully");
			setForm({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to change password",
			);
		} finally {
			setIsLoading(false);
		}
	};

	const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
		setShowPasswords((prev) => ({
			...prev,
			[field]: !prev[field],
		}));
	};

	const getPasswordStrength = (
		password: string,
	): { strength: number; label: string; color: string } => {
		if (!password) return { strength: 0, label: "", color: "" };

		let strength = 0;
		if (password.length >= 8) strength++;
		if (/[a-z]/.test(password)) strength++;
		if (/[A-Z]/.test(password)) strength++;
		if (/\d/.test(password)) strength++;
		if (/[^a-zA-Z\d]/.test(password)) strength++;

		const strengthMap = {
			0: { label: "Very Weak", color: "bg-error-base" },
			1: { label: "Weak", color: "bg-error-base" },
			2: { label: "Fair", color: "bg-warning-base" },
			3: { label: "Good", color: "bg-warning-base" },
			4: { label: "Strong", color: "bg-success-base" },
			5: { label: "Very Strong", color: "bg-success-base" },
		};

		return {
			strength: (strength / 5) * 100,
			...strengthMap[strength as keyof typeof strengthMap],
		};
	};

	const passwordStrength = getPasswordStrength(form.newPassword);

	return (
		<div className={cn("space-y-6", className)}>
			<div>
				<h3 className="font-semibold text-lg text-text-strong-950">
					Change Password
				</h3>
				<p className="text-paragraph-sm text-text-sub-600">
					Update your password to keep your account secure
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<Label.Root htmlFor="currentPassword">Current Password</Label.Root>
					<Input.Root className="mt-1">
						<Input.Wrapper>
							<Input.Input
								id="currentPassword"
								type={showPasswords.current ? "text" : "password"}
								placeholder="Enter your current password"
								value={form.currentPassword}
								onChange={(e) =>
									handleInputChange("currentPassword", e.target.value)
								}
								className={errors.currentPassword ? "border-error-base" : ""}
							/>
							<button
								type="button"
								onClick={() => togglePasswordVisibility("current")}
								className="flex items-center justify-center"
							>
								<Icon
									name={showPasswords.current ? "eye-off" : "eye"}
									className="size-5 text-text-soft-400 hover:text-text-sub-600"
								/>
							</button>
						</Input.Wrapper>
					</Input.Root>
					{errors.currentPassword && (
						<p className="mt-1 text-error-base text-paragraph-xs">
							{errors.currentPassword}
						</p>
					)}
				</div>

				<div>
					<Label.Root htmlFor="newPassword">New Password</Label.Root>
					<Input.Root className="mt-1">
						<Input.Wrapper>
							<Input.Input
								id="newPassword"
								type={showPasswords.new ? "text" : "password"}
								placeholder="Enter your new password"
								value={form.newPassword}
								onChange={(e) =>
									handleInputChange("newPassword", e.target.value)
								}
								className={errors.newPassword ? "border-error-base" : ""}
							/>
							<button
								type="button"
								onClick={() => togglePasswordVisibility("new")}
								className="flex items-center justify-center"
							>
								<Icon
									name={showPasswords.new ? "eye-off" : "eye"}
									className="size-5 text-text-soft-400 hover:text-text-sub-600"
								/>
							</button>
						</Input.Wrapper>
					</Input.Root>
					{errors.newPassword && (
						<p className="mt-1 text-error-base text-paragraph-xs">
							{errors.newPassword}
						</p>
					)}
					{form.newPassword && (
						<div className="mt-2">
							<div className="mb-1 flex items-center justify-between text-paragraph-xs text-text-sub-600">
								<span>Password strength:</span>
								<span
									className={
										passwordStrength.color === "bg-success-base"
											? "text-success-base"
											: passwordStrength.color === "bg-warning-base"
												? "text-warning-base"
												: "text-error-base"
									}
								>
									{passwordStrength.label}
								</span>
							</div>
							<div className="h-2 overflow-hidden rounded-full bg-bg-weak-50">
								<div
									className={cn(
										"h-full transition-all duration-300",
										passwordStrength.color,
									)}
									style={{ width: `${passwordStrength.strength}%` }}
								/>
							</div>
						</div>
					)}
				</div>

				<div>
					<Label.Root htmlFor="confirmPassword">
						Confirm New Password
					</Label.Root>
					<Input.Root className="mt-1">
						<Input.Wrapper>
							<Input.Input
								id="confirmPassword"
								type={showPasswords.confirm ? "text" : "password"}
								placeholder="Confirm your new password"
								value={form.confirmPassword}
								onChange={(e) =>
									handleInputChange("confirmPassword", e.target.value)
								}
								className={errors.confirmPassword ? "border-error-base" : ""}
							/>
							<button
								type="button"
								onClick={() => togglePasswordVisibility("confirm")}
								className="flex items-center justify-center"
							>
								<Icon
									name={showPasswords.confirm ? "eye-off" : "eye"}
									className="size-5 text-text-soft-400 hover:text-text-sub-600"
								/>
							</button>
						</Input.Wrapper>
					</Input.Root>
					{errors.confirmPassword && (
						<p className="mt-1 text-error-base text-paragraph-xs">
							{errors.confirmPassword}
						</p>
					)}
				</div>

				<div className="flex items-center gap-4 pt-4">
					<Button.Root
						type="submit"
						variant="primary"
						size="small"
						disabled={isLoading}
					>
						{isLoading ? (
							<>
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
								Changing Password...
							</>
						) : (
							<>
								<Icon name="lock" className="h-4 w-4" />
								Change Password
							</>
						)}
					</Button.Root>
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="small"
						onClick={() => {
							setForm({
								currentPassword: "",
								newPassword: "",
								confirmPassword: "",
							});
							setErrors({});
						}}
						disabled={isLoading}
					>
						Cancel
					</Button.Root>
				</div>
			</form>

			<div className="rounded-xl border border-warning-light bg-warning-50 p-4">
				<div className="flex items-start gap-3">
					<Icon
						name="shield-alert"
						className="mt-0.5 h-5 w-5 text-warning-base"
					/>
					<div>
						<h4 className="font-medium text-warning-base">
							Password Security Tips
						</h4>
						<ul className="mt-2 space-y-1 text-paragraph-sm text-warning-base">
							<li>• Use a unique password that you don't use elsewhere</li>
							<li>
								• Include a mix of uppercase and lowercase letters, numbers, and
								symbols
							</li>
							<li>
								• Avoid using personal information like your name or birthdate
							</li>
							<li>
								• Consider using a password manager to generate and store secure
								passwords
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};
