import { render } from "@react-email/render";
import ConfirmEmail from "./confirm-email";
import OrganizationInviteEmail from "./organization-invite";
import OTPTokenEmail from "./otp";
import WelcomeEmail from "./welcome";

export interface EmailOptions {
	to: string;
	subject: string;
	html: string;
	from?: string;
}

export const sendEmail = async ({
	to,
	subject,
	html,
	from,
}: EmailOptions) => { };

export const sendConfirmEmail = async (email: string, confirmLink: string) => {
	const html = await render(ConfirmEmail({ confirmLink }));

	return sendEmail({
		to: email,
		subject: "Confirm your email address for Reloop",
		html,
	});
};

export interface OrganizationInviteEmailOptions {
	email: string;
	inviteLink: string;
	organizationName: string;
	inviterName: string;
	inviterEmail: string;
	role: string;
}

export const sendOrganizationInviteEmail = async ({
	email,
	inviteLink,
	organizationName,
	inviterName,
	inviterEmail,
	role,
}: OrganizationInviteEmailOptions) => {
	const html = await render(
		OrganizationInviteEmail({
			inviteLink,
			organizationName,
			inviterName,
			inviterEmail,
			role,
		}),
	);

	return sendEmail({
		to: email,
		subject: `You've been invited to join ${organizationName} on Reloop`,
		html,
	});
};

export const sendOTPTokenEmail = async (
	email: string,
	otp: string,
	baseUrl = "https://reloop.sh",
) => {
	const html = await render(OTPTokenEmail({ email, otp, baseUrl }));

	return sendEmail({
		to: email,
		subject: `${otp} is your Reloop verification code`,
		html,
	});
};

export const sendWelcomeEmail = async (
	email: string,
	fullName: string,
	baseUrl = "https://reloop.sh",
) => {
	const html = await render(WelcomeEmail({ fullName, baseUrl }));

	return sendEmail({
		to: email,
		subject: "Welcome to Reloop!",
		html,
	});
};
