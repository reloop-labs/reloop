import { validationConfig } from "@be/validation/validation.config";
import { createError } from "evlog";

export const ValidationErrors = {
	inputTooLong: () =>
		createError({
			status: 400,
			message: "Input too long",
			why: `An email address cannot exceed ${validationConfig.constants.maxInputLength} characters.`,
			fix: "Check the value you sent — it looks like more than a single address.",
		}),
	emptyInput: () =>
		createError({
			status: 400,
			message: "No address provided",
			why: "The request did not include an email address or domain to check.",
			fix: 'Send {"email": "you@example.com"} in the request body.',
		}),
};
