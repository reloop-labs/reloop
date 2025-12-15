"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { isValidEmail } from "@fe/dashboard/utils/audience";
import { valibotResolver } from "@hookform/resolvers/valibot";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import Spinner from "@reloop/ui/spinner";
import * as Textarea from "@reloop/ui/textarea";
import { useLoading } from "@reloop/ui/use-loading";
import axios from "axios";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as v from "valibot";

// Helper function to validate comma-separated emails
const validateEmails = (emails: string): boolean => {
	if (!emails.trim()) return false;
	const emailList = emails
		.split(",")
		.map((e) => e.trim())
		.filter(Boolean);
	return emailList.length > 0 && emailList.every(isValidEmail);
};

// Helper function to parse comma-separated emails into array
const parseEmails = (emails: string): string[] => {
	return emails
		.split(",")
		.map((e) => e.trim())
		.filter(Boolean);
};

const emailSendSchema = v.object({
	from: v.pipe(
		v.string("From email is required"),
		v.minLength(1, "From email is required"),
		v.email("Please enter a valid email address"),
	),
	to: v.pipe(
		v.string("To email is required"),
		v.minLength(1, "To email is required"),
		v.custom(
			(to: unknown) => typeof to === "string" && validateEmails(to),
			"Please enter valid email address(es). Separate multiple emails with commas.",
		),
	),
	subject: v.pipe(
		v.string("Subject is required"),
		v.minLength(1, "Subject is required"),
		v.maxLength(255, "Subject must be less than 255 characters"),
	),
	text: v.optional(v.string()),
	html: v.optional(v.string()),
	replyTo: v.optional(
		v.pipe(v.string(), v.email("Please enter a valid email address")),
	),
	cc: v.optional(
		v.pipe(
			v.string(),
			v.custom(
				(cc: unknown) =>
					typeof cc === "string" && (cc.trim() === "" || validateEmails(cc)),
				"Please enter valid email address(es). Separate multiple emails with commas.",
			),
		),
	),
	bcc: v.optional(
		v.pipe(
			v.string(),
			v.custom(
				(bcc: unknown) =>
					typeof bcc === "string" && (bcc.trim() === "" || validateEmails(bcc)),
				"Please enter valid email address(es). Separate multiple emails with commas.",
			),
		),
	),
});

type EmailSendFormValues = v.InferInput<typeof emailSendSchema>;

interface SendEmailResponse {
	success: boolean;
	messageId: string;
	status: string;
	timestamp: string;
}

export default function TestSendPage() {
	const { activeOrganization } = useUserOrganization();
	const { changeStatus, status } = useLoading();
	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
		reset,
		setError,
	} = useForm<EmailSendFormValues>({
		resolver: valibotResolver(emailSendSchema) as Resolver<EmailSendFormValues>,
		defaultValues: {
			from: "",
			to: "",
			subject: "",
			text: "",
			html: "",
			replyTo: "",
			cc: "",
			bcc: "",
		},
	});

	const onSubmit = async (data: EmailSendFormValues) => {
		if (!activeOrganization?.id) {
			toast.error("Organization not found");
			return;
		}

		// Validate that at least one of text or html is provided
		const hasText = data.text && data.text.trim().length > 0;
		const hasHtml = data.html && data.html.trim().length > 0;
		if (!hasText && !hasHtml) {
			setError("text", {
				type: "manual",
				message:
					"At least one of Text Content or HTML Content must be provided",
			});
			setError("html", {
				type: "manual",
				message:
					"At least one of Text Content or HTML Content must be provided",
			});
			toast.error(
				"At least one of Text Content or HTML Content must be provided",
			);
			return;
		}

		try {
			changeStatus("loading");

			// Parse to emails (support single or multiple)
			const toEmails = parseEmails(data.to);

			// Prepare payload according to API spec
			const payload: {
				from: string;
				to: string | string[];
				subject: string;
				text?: string;
				html?: string;
				replyTo?: string;
				cc?: string | string[];
				bcc?: string | string[];
			} = {
				from: data.from.trim(),
				to: toEmails.length === 1 ? (toEmails[0] ?? "") : toEmails,
				subject: data.subject.trim(),
			};

			// Add text content if provided
			const textContent = data.text?.trim();
			if (textContent) {
				payload.text = textContent;
			}

			// Add HTML content if provided
			const htmlContent = data.html?.trim();
			if (htmlContent) {
				payload.html = htmlContent;
			}

			// Add reply-to if provided
			const replyToEmail = data.replyTo?.trim();
			if (replyToEmail) {
				payload.replyTo = replyToEmail;
			}

			// Add CC if provided
			const ccValue = data.cc?.trim();
			if (ccValue) {
				const ccEmails = parseEmails(ccValue);
				payload.cc = ccEmails.length === 1 ? (ccEmails[0] ?? "") : ccEmails;
			}

			// Add BCC if provided
			const bccValue = data.bcc?.trim();
			if (bccValue) {
				const bccEmails = parseEmails(bccValue);
				payload.bcc = bccEmails.length === 1 ? (bccEmails[0] ?? "") : bccEmails;
			}

			const response = await axios.post<SendEmailResponse>(
				"/api/mail/v1/send",
				payload,
				{ headers: { credentials: "include" } },
			);

			if (response.data?.success) {
				toast.success("Email sent successfully", {
					description: `Message ID: ${response.data.messageId}`,
				});
				reset();
			} else {
				toast.error("Failed to send email");
			}

			changeStatus("idle");
		} catch (error) {
			changeStatus("idle");
			if (axios.isAxiosError(error)) {
				const errorMessage =
					error.response?.data?.message ??
					error.message ??
					"Failed to send email";
				toast.error(errorMessage);

				// Try to set field-specific errors if available
				const errorField = error.response?.data?.field;
				if (errorField) {
					setError(errorField as keyof EmailSendFormValues, {
						type: "server",
						message: errorMessage,
					});
				}
			} else {
				toast.error("An unexpected error occurred");
			}
		}
	};

	return (
		<div className="mx-auto max-w-4xl px-4 py-8">
			<div className="mb-8 border-stroke-soft-200 border-b border-dashed pb-6">
				<h1 className="font-medium text-title-h5 leading-8">Test Send Email</h1>
				<p className="mt-2 text-paragraph-sm text-text-sub-600">
					Send a test email through your configured mail server. Use this to
					verify your email delivery setup.
				</p>
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				{/* From Email */}
				<div className="space-y-2">
					<Label.Root htmlFor="from">
						From Email
						<Label.Asterisk />
					</Label.Root>
					<Input.Root hasError={!!errors.from}>
						<Input.Wrapper>
							<Input.Input
								id="from"
								type="email"
								placeholder="sender@example.com"
								disabled={status === "loading"}
								{...register("from")}
							/>
						</Input.Wrapper>
					</Input.Root>
					{errors.from && (
						<p className="flex items-center gap-2 text-error-base text-sm">
							<Icon name="alert-circle" className="h-4 w-4" />
							{errors.from.message}
						</p>
					)}
				</div>

				{/* To Email */}
				<div className="space-y-2">
					<Label.Root htmlFor="to">
						To Email(s)
						<Label.Asterisk />
					</Label.Root>
					<Input.Root hasError={!!errors.to}>
						<Input.Wrapper>
							<Input.Input
								id="to"
								type="text"
								placeholder="recipient@example.com or email1@example.com, email2@example.com"
								disabled={status === "loading"}
								{...register("to")}
							/>
						</Input.Wrapper>
					</Input.Root>
					{errors.to && (
						<p className="flex items-center gap-2 text-error-base text-sm">
							<Icon name="alert-circle" className="h-4 w-4" />
							{errors.to.message}
						</p>
					)}
					<p className="text-text-sub-600 text-xs">
						Separate multiple emails with commas
					</p>
				</div>

				{/* Subject */}
				<div className="space-y-2">
					<Label.Root htmlFor="subject">
						Subject
						<Label.Asterisk />
					</Label.Root>
					<Input.Root hasError={!!errors.subject}>
						<Input.Wrapper>
							<Input.Input
								id="subject"
								type="text"
								placeholder="Email subject"
								maxLength={255}
								disabled={status === "loading"}
								{...register("subject")}
							/>
						</Input.Wrapper>
					</Input.Root>
					{errors.subject && (
						<p className="flex items-center gap-2 text-error-base text-sm">
							<Icon name="alert-circle" className="h-4 w-4" />
							{errors.subject.message}
						</p>
					)}
				</div>

				{/* Text Content */}
				<div className="space-y-2">
					<Label.Root htmlFor="text">Text Content</Label.Root>
					<Textarea.Root
						id="text"
						placeholder="Plain text email content..."
						disabled={status === "loading"}
						rows={6}
						hasError={!!errors.text}
						{...register("text")}
					/>
					{errors.text && (
						<p className="flex items-center gap-2 text-error-base text-sm">
							<Icon name="alert-circle" className="h-4 w-4" />
							{errors.text.message}
						</p>
					)}
				</div>

				{/* HTML Content */}
				<div className="space-y-2">
					<Label.Root htmlFor="html">HTML Content</Label.Root>
					<Textarea.Root
						id="html"
						placeholder="<h1>HTML email content...</h1>"
						disabled={status === "loading"}
						rows={6}
						hasError={!!errors.html}
						{...register("html")}
					/>
					{errors.html && (
						<p className="flex items-center gap-2 text-error-base text-sm">
							<Icon name="alert-circle" className="h-4 w-4" />
							{errors.html.message}
						</p>
					)}
					{errors.root && (
						<p className="flex items-center gap-2 text-error-base text-sm">
							<Icon name="alert-circle" className="h-4 w-4" />
							{errors.root.message}
						</p>
					)}
					<p className="text-text-sub-600 text-xs">
						At least one of Text Content or HTML Content must be provided
					</p>
				</div>

				{/* Optional Fields Section */}
				<div className="border-stroke-soft-200 border-t border-dashed pt-6">
					<h2 className="mb-4 font-semibold text-gray-900 text-lg">
						Optional Fields
					</h2>

					<div className="space-y-6">
						{/* Reply To */}
						<div className="space-y-2">
							<Label.Root htmlFor="replyTo">Reply To</Label.Root>
							<Input.Root hasError={!!errors.replyTo}>
								<Input.Wrapper>
									<Input.Input
										id="replyTo"
										type="email"
										placeholder="reply@example.com"
										disabled={status === "loading"}
										{...register("replyTo")}
									/>
								</Input.Wrapper>
							</Input.Root>
							{errors.replyTo && (
								<p className="flex items-center gap-2 text-error-base text-sm">
									<Icon name="alert-circle" className="h-4 w-4" />
									{errors.replyTo.message}
								</p>
							)}
						</div>

						{/* CC */}
						<div className="space-y-2">
							<Label.Root htmlFor="cc">CC</Label.Root>
							<Input.Root hasError={!!errors.cc}>
								<Input.Wrapper>
									<Input.Input
										id="cc"
										type="text"
										placeholder="cc1@example.com, cc2@example.com"
										disabled={status === "loading"}
										{...register("cc")}
									/>
								</Input.Wrapper>
							</Input.Root>
							{errors.cc && (
								<p className="flex items-center gap-2 text-error-base text-sm">
									<Icon name="alert-circle" className="h-4 w-4" />
									{errors.cc.message}
								</p>
							)}
							<p className="text-text-sub-600 text-xs">
								Separate multiple emails with commas
							</p>
						</div>

						{/* BCC */}
						<div className="space-y-2">
							<Label.Root htmlFor="bcc">BCC</Label.Root>
							<Input.Root hasError={!!errors.bcc}>
								<Input.Wrapper>
									<Input.Input
										id="bcc"
										type="text"
										placeholder="bcc1@example.com, bcc2@example.com"
										disabled={status === "loading"}
										{...register("bcc")}
									/>
								</Input.Wrapper>
							</Input.Root>
							{errors.bcc && (
								<p className="flex items-center gap-2 text-error-base text-sm">
									<Icon name="alert-circle" className="h-4 w-4" />
									{errors.bcc.message}
								</p>
							)}
							<p className="text-text-sub-600 text-xs">
								Separate multiple emails with commas
							</p>
						</div>
					</div>
				</div>

				{/* Submit Button */}
				<div className="flex justify-end border-stroke-soft-200 border-t border-dashed pt-6">
					<Button.Root
						type="submit"
						variant="neutral"
						size="small"
						disabled={status === "loading" || !isValid}
						className="min-w-[140px]"
					>
						{status === "loading" ? (
							<>
								<Spinner color="currentColor" />
								Sending...
							</>
						) : (
							<>
								Send Email
								<Icon name="send" className="h-5 w-5" />
							</>
						)}
					</Button.Root>
				</div>
			</form>
		</div>
	);
}
