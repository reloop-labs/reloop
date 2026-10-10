import * as z from "zod";
import {
	MAX_RECORD_KEYS,
	resourceIdSchema,
	withinKeyLimit,
} from "../contacts/schemas";

export const ADDRESS_PATTERN =
	/^(?:[^\p{Cc}\u2028\u2029<>@,;]{1,200}<[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+>|[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+)$/u;

export const SINGLE_LINE_PATTERN = /^[^\p{Cc}\u2028\u2029]*$/u;

export const subjectSchema = z
	.string()
	.trim()
	.min(1)
	.max(255)
	.regex(SINGLE_LINE_PATTERN, "subject must be a single line")
	.describe("Subject line");

export const addressSchema = z
	.string()
	.trim()
	.min(3)
	.max(320)
	.regex(ADDRESS_PATTERN)
	.describe(
		"Email address, optionally with a display name: user@example.com or Jane Doe <user@example.com>",
	);

export const recipientsSchema = z.union([
	addressSchema,
	z.array(addressSchema).min(1).max(50),
]);

export const RESERVED_HEADERS = new Set([
	"from",
	"to",
	"cc",
	"bcc",
	"subject",
	"reply-to",
	"sender",
	"date",
	"message-id",
	"return-path",
	"received",
	"mime-version",
	"content-type",
	"content-transfer-encoding",
	"dkim-signature",
]);

export const headerNameSchema = z.string().regex(/^[A-Za-z0-9-]{1,100}$/);

export const headerValueSchema = z
	.string()
	.max(1000)
	.regex(SINGLE_LINE_PATTERN, "header values must be a single line");

export const headersSchema = z
	.record(headerNameSchema, headerValueSchema)
	.refine(withinKeyLimit, {
		message: `at most ${MAX_RECORD_KEYS} headers`,
	})
	.refine(
		(headers) =>
			Object.keys(headers).every(
				(name) => !RESERVED_HEADERS.has(name.toLowerCase()),
			),
		{
			message:
				"headers must not override standard envelope headers such as From, To, Cc, Bcc, Subject, or Reply-To",
		},
	)
	.describe(
		"Extra message headers. Standard envelope headers cannot be set here.",
	);

export const TAG_PATTERN = /^[A-Za-z0-9_-]+$/;

export const tagSchema = z.object({
	name: z.string().regex(TAG_PATTERN).max(256),
	value: z.string().regex(TAG_PATTERN).max(256),
});

export const VARIABLE_KEY_PATTERN =
	/^(?!FIRST_NAME$|LAST_NAME$|EMAIL$|UNSUBSCRIBE_URL$)[A-Za-z0-9_]{1,50}$/;

export const templateSchema = z.object({
	id: resourceIdSchema.describe("Template ID"),
	variables: z
		.record(
			z.string().regex(VARIABLE_KEY_PATTERN),
			z.union([z.string().max(2000), z.number()]),
		)
		.refine(withinKeyLimit, {
			message: `at most ${MAX_RECORD_KEYS} template variables`,
		})
		.optional()
		.describe(
			"Values substituted into the template. FIRST_NAME, LAST_NAME, EMAIL, and UNSUBSCRIBE_URL are reserved and filled by Reloop.",
		),
});
