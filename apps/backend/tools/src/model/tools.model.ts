import { toolsConfig } from "@be/tools/tools.config";
import { t } from "elysia";

const signalStatus = t.Union([
	t.Literal("pass"),
	t.Literal("fail"),
	t.Literal("warn"),
	t.Literal("neutral"),
]);

const triggerCategory = t.Union([
	t.Literal("urgency"),
	t.Literal("shady"),
	t.Literal("overpromise"),
	t.Literal("money"),
	t.Literal("outreach"),
]);

export namespace ToolsModel {
	export const checkBody = t.Object({
		email: t.String({
			minLength: 1,
			maxLength: toolsConfig.constants.maxInputLength,
			description: "An email address or a bare domain.",
			examples: ["you@mailinator.com", "tempmail.com"],
		}),
	});

	export const checkQuery = t.Object({
		email: t.String({
			minLength: 1,
			maxLength: toolsConfig.constants.maxInputLength,
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

	export const spamCheckBody = t.Object({
		subject: t.Optional(
			t.String({
				maxLength: 1000,
				description: "Email subject line to evaluate.",
				examples: ["Your monthly analytics report is ready"],
			}),
		),
		body: t.Optional(
			t.String({
				maxLength: 50000,
				description: "Email body text or copy to evaluate.",
				examples: ["Hi Alex, your weekly report has been generated..."],
			}),
		),
	});

	export const spamCheckQuery = t.Object({
		subject: t.Optional(t.String({ maxLength: 1000 })),
		body: t.Optional(t.String({ maxLength: 50000 })),
	});

	export const spamCheckResponse = t.Object({
		score: t.Number({
			description: "Overall spam/deliverability score from 0 to 100.",
		}),
		grade: t.String({ description: "Letter grade (A+, A, B, C, D, F)." }),
		verdict: t.Union([
			t.Literal("inbox_ready"),
			t.Literal("needs_review"),
			t.Literal("high_risk"),
		]),
		verdictLabel: t.String(),
		breakdown: t.Object({
			subjectScore: t.Number(),
			contentScore: t.Number(),
			linkScore: t.Number(),
			formattingScore: t.Number(),
		}),
		metrics: t.Object({
			wordCount: t.Number(),
			charCount: t.Number(),
			subjectLength: t.Number(),
			linkCount: t.Number(),
			triggerWordCount: t.Number(),
			capsPercentage: t.Number(),
			readingTimeSec: t.Number(),
		}),
		categoryCounts: t.Record(triggerCategory, t.Number()),
		detectedTriggers: t.Array(
			t.Object({
				word: t.String(),
				originalMatch: t.String(),
				category: triggerCategory,
				categoryLabel: t.String(),
				severity: t.Union([
					t.Literal("high"),
					t.Literal("medium"),
					t.Literal("low"),
				]),
				startIndex: t.Number(),
				endIndex: t.Number(),
				context: t.Union([t.Literal("subject"), t.Literal("body")]),
			}),
		),
		issues: t.Array(
			t.Object({
				category: t.Union([
					t.Literal("trigger_word"),
					t.Literal("subject"),
					t.Literal("link"),
					t.Literal("formatting"),
					t.Literal("compliance"),
				]),
				severity: t.Union([
					t.Literal("high"),
					t.Literal("medium"),
					t.Literal("low"),
				]),
				title: t.String(),
				detail: t.String(),
				recommendation: t.Optional(t.String()),
			}),
		),
		recommendations: t.Array(t.String()),
	});

	export const blocklistCheckBody = t.Object({
		target: t.String({
			minLength: 1,
			maxLength: 255,
			description:
				"Domain name, IPv4 address, or IPv6 address (e.g. example.com, 198.51.100.1).",
			examples: ["reloop.sh", "1.1.1.1", "2001:4860:4860::8888"],
		}),
	});

	export const blocklistCheckQuery = t.Object({
		target: t.String({
			minLength: 1,
			maxLength: 255,
			description: "Domain name, IPv4 address, or IPv6 address.",
		}),
	});

	const listingStatus = t.Union([
		t.Literal("listed"),
		t.Literal("not_listed"),
		t.Literal("error"),
		t.Literal("skipped"),
	]);

	export const blocklistCheckResponse = t.Object({
		target: t.String(),
		inputType: t.Union([t.Literal("domain"), t.Literal("ip")]),
		ipVersion: t.Union([t.Literal("ipv4"), t.Literal("ipv6"), t.Null()]),
		resolvedIp: t.Union([t.String(), t.Null()]),
		hostname: t.Union([t.String(), t.Null()]),
		checkedIps: t.Array(
			t.Object({
				ip: t.String(),
				source: t.Union([t.Literal("input"), t.Literal("spf")]),
				version: t.Union([t.Literal("ipv4"), t.Literal("ipv6")]),
			}),
		),
		spfIncludes: t.Array(t.String()),
		spfRanges: t.Array(t.String()),
		ipNote: t.Union([t.String(), t.Null()]),
		verdict: t.Union([
			t.Literal("clean"),
			t.Literal("listed"),
			t.Literal("inconclusive"),
		]),
		isClean: t.Boolean(),
		totalChecked: t.Number(),
		listedCount: t.Number(),
		cleanCount: t.Number(),
		errorCount: t.Number(),
		skippedCount: t.Number(),
		scanDurationMs: t.Number(),
		results: t.Array(
			t.Object({
				id: t.String(),
				name: t.String(),
				host: t.String(),
				listType: t.Union([t.Literal("ip"), t.Literal("domain")]),
				category: t.Union([
					t.Literal("reputation"),
					t.Literal("spam"),
					t.Literal("malware"),
					t.Literal("domain"),
				]),
				impact: t.Union([
					t.Literal("high"),
					t.Literal("medium"),
					t.Literal("low"),
				]),
				status: listingStatus,
				isListed: t.Boolean(),
				responseCodes: t.Array(t.String()),
				responseTimeMs: t.Number(),
				delistUrl: t.String(),
				description: t.String(),
				listedTargets: t.Array(t.String()),
				txtRecord: t.Optional(t.String()),
				error: t.Optional(t.String()),
			}),
		),
		recommendations: t.Array(t.String()),
	});

	export const errorResponse = t.Object({
		message: t.String(),
		why: t.Optional(t.String()),
		fix: t.Optional(t.String()),
		link: t.Optional(t.String()),
	});

	export type CheckBody = typeof checkBody.static;
	export type CheckResponse = typeof checkResponse.static;
	export type SpamCheckBody = typeof spamCheckBody.static;
	export type SpamCheckResponse = typeof spamCheckResponse.static;
	export type BlocklistCheckBody = typeof blocklistCheckBody.static;
	export type BlocklistCheckResponse = typeof blocklistCheckResponse.static;
}
