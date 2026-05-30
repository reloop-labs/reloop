import * as v from "valibot";

export const domainSchema = v.object({
	domain: v.pipe(
		v.string("Domain is required"),
		v.minLength(1, "Domain is required"),
		v.regex(
			/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/,
			"Please enter a valid domain name",
		),
	),
	clickTracking: v.boolean(),
	openTracking: v.boolean(),
	customReturnPath: v.optional(
		v.pipe(
			v.string(),
			v.regex(
				/^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)?$/,
				"Please enter a valid subdomain format",
			),
		),
	),
	trackingSubdomain: v.optional(
		v.pipe(
			v.string(),
			v.regex(
				/^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)?$/,
				"Please enter a valid subdomain format",
			),
		),
	),
});

export type DomainFormValues = v.InferInput<typeof domainSchema>;
