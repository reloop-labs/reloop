import { toolConfig } from "@be/tool/tool.config";
import { t } from "elysia";

const signalStatus = t.Union([
	t.Literal("pass"),
	t.Literal("fail"),
	t.Literal("warn"),
	t.Literal("neutral"),
]);

export namespace ToolModel {
	export const checkBody = t.Object({
		email: t.String({
			minLength: 1,
			maxLength: toolConfig.constants.maxInputLength,
			description: "An email address or a bare domain.",
			examples: ["you@mailinator.com", "tempmail.com"],
		}),
	});

	export const checkQuery = t.Object({
		email: t.String({
			minLength: 1,
			maxLength: toolConfig.constants.maxInputLength,
			description: "An email address or a bare domain.",
		}),
	});

	export const checkResponse = t.Object({
		input: t.String({
			description: "The input after trimming and lowercasing.",
		}),
		kind: t.Union([t.Literal("email"), t.Literal("domain"), t.Null()], {
			description: "Whether the input parsed as an address or a bare domain.",
		}),
		domain: t.Union([t.String(), t.Null()], {
			description: "Punycode domain used for the lookup.",
		}),
		unicodeDomain: t.Union([t.String(), t.Null()], {
			description: "Unicode form of the domain, when it differs.",
		}),
		verdict: t.Union([
			t.Literal("invalid"),
			t.Literal("disposable"),
			t.Literal("risky"),
			t.Literal("deliverable"),
		]),
		isValidSyntax: t.Boolean(),
		syntaxFailure: t.Union([t.String(), t.Null()], {
			description: "Machine-readable reason the address failed to parse.",
		}),
		isDisposable: t.Boolean(),
		disposableMatch: t.Union([
			t.Object({
				kind: t.Union([t.Literal("exact"), t.Literal("wildcard")]),
				domain: t.String(),
				pattern: t.Optional(t.String()),
			}),
			t.Null(),
		]),
		isAllowlisted: t.Boolean(),
		isRoleAddress: t.Boolean(),
		isFreeProvider: t.Boolean(),
		signals: t.Object({
			syntax: signalStatus,
			disposable: signalStatus,
			role: signalStatus,
			freeProvider: signalStatus,
		}),
	});

	export const errorResponse = t.Object({
		message: t.String(),
		why: t.Optional(t.String()),
		fix: t.Optional(t.String()),
		link: t.Optional(t.String()),
	});

	export type CheckBody = typeof checkBody.static;
	export type CheckResponse = typeof checkResponse.static;
}
