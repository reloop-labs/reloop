import { toolsConfig } from "@be/tools/tools.config";
import { createError } from "evlog";

export const ToolsErrors = {
	inputTooLong: () =>
		createError({
			status: 400,
			message: "Input too long",
			why: `An email address cannot exceed ${toolsConfig.constants.maxInputLength} characters.`,
			fix: "Check the value you sent — it looks like more than a single address.",
		}),
	emptyInput: () =>
		createError({
			status: 400,
			message: "No address provided",
			why: "The request did not include an email address or domain to check.",
			fix: 'Send {"email": "you@example.com"} in the request body.',
		}),
	blocklistEmptyInput: () =>
		createError({
			status: 400,
			message: "No target provided",
			why: "The request did not include a domain or IP address to check.",
			fix: 'Send {"target": "203.0.113.10"} or {"target": "example.com"} as JSON.',
		}),
	blocklistInvalidTarget: () =>
		createError({
			status: 400,
			message: "Invalid domain or IP",
			why: "The value was not an IPv4 address, IPv6 address, or a domain with a dot.",
			fix: "Enter a host like example.com, an IPv4 address, or an IPv6 address.",
		}),
};
