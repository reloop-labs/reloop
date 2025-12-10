import { render } from "@react-email/render";
import OrganizationInviteEmail from "./organization-invite";
import PasswordResetEmail from "./password-reset";


export interface EmailOptions {
	to: string;
	subject: string;
	html: string;
	from?: string;
}

export const sendEmail = async ({ to, subject, html, from }: EmailOptions) => {
};

export const sendPasswordResetEmail = async (
	email: string,
	resetUrl: string,
) => {
	const html = await render(PasswordResetEmail({ resetUrl }));

	return sendEmail({
		to: email,
		subject: "Reset Your Reloop Password",
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
