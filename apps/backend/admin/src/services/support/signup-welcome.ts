export const SIGNUP_WELCOME_SUPPORT_MESSAGE =
	"Hey, Pranav here. If you get stuck on domains, DNS, or sending, ping me in this thread. I read these.";

export function conversationAlreadyWelcomed(
	messages: Array<{ body: string }>,
): boolean {
	return messages.some(
		(message) => message.body.trim() === SIGNUP_WELCOME_SUPPORT_MESSAGE,
	);
}

export function pickWelcomeSender(input: {
	configuredEmail: string;
	userForConfiguredEmail: { id: string } | null;
	firstSuperAdmin: { id: string } | null;
}): { id: string } | null {
	if (input.configuredEmail) {
		return input.userForConfiguredEmail;
	}
	return input.firstSuperAdmin;
}
