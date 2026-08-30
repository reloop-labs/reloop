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
		mxRecords: t.Array(t.String(), {
			description:
				"MX hosts for the domain, lowest priority first. Empty when the input is invalid, the domain has no MX, or DNS did not answer.",
		}),
		confidence: t.Number({
			minimum: 0,
			maximum: 1,
			description: "How sure the engine is of the verdict, from 0 to 1.",
		}),
		riskScore: t.Number({
			minimum: 0,
			maximum: 1,
			description:
				"Signup / list-quality risk, from 0 (safe) to 1 (throwaway).",
		}),
		flags: t.Array(
			t.Union([
				t.Literal("INVALID_SYNTAX"),
				t.Literal("DISPOSABLE_DOMAIN"),
				t.Literal("WILDCARD_DISPOSABLE"),
				t.Literal("PUBLIC_INBOX_DETECTED"),
				t.Literal("ROLE_BASED_PREFIX"),
				t.Literal("FREE_PROVIDER"),
				t.Literal("ALLOWLISTED"),
				t.Literal("NO_MX_RECORDS"),
			]),
			{
				description: "Machine-readable reasons behind the verdict and scores.",
			},
		),
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

	export const spamRewriteBody = t.Object({
		subject: t.Optional(t.String({ maxLength: 1000 })),
		body: t.Optional(t.String({ maxLength: 50000 })),
	});

	export const spamRewriteResponse = t.Object({
		subject: t.String(),
		body: t.String(),
		provider: t.String(),
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
				source: t.Union([
					t.Literal("input"),
					t.Literal("spf"),
					t.Literal("mx"),
					t.Literal("a"),
				]),
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

	export const emailHealthState = t.Union([
		t.Literal("deliverable"),
		t.Literal("undeliverable"),
		t.Literal("risky"),
		t.Literal("unknown"),
	]);

	export const emailHealthReason = t.Union([
		t.Literal("accepted_email"),
		t.Literal("rejected_email"),
		t.Literal("no_mx_records"),
		t.Literal("disposable_domain"),
		t.Literal("invalid_syntax"),
		t.Literal("role_based"),
		t.Literal("low_deliverability"),
	]);

	export const emailHealthAttributes = t.Object({
		free: t.Boolean(),
		role: t.Boolean(),
		disposable: t.Boolean(),
		acceptAll: t.Boolean(),
		tag: t.Boolean(),
		numericalCharacters: t.Number(),
		alphabeticalCharacters: t.Number(),
		unicodeSymbols: t.Number(),
		mailboxFull: t.Boolean(),
		noReply: t.Boolean(),
		secureEmailGateway: t.Boolean(),
	});

	export const emailHealthMailServer = t.Object({
		smtpProvider: t.Union([t.String(), t.Null()]),
		mxRecord: t.Union([t.String(), t.Null()]),
		mxRecords: t.Array(t.String()),
		implicitMxRecord: t.Boolean(),
		hasMx: t.Boolean(),
	});

	export const healthPresentation = t.Object({
		status: t.Union([t.Literal("pass"), t.Literal("fail"), t.Literal("warn")]),
		summary: t.String({
			description: "One-line health summary derived from verdict and flags.",
		}),
		state: emailHealthState,
		score: t.Number({ minimum: 0, maximum: 100 }),
		reason: emailHealthReason,
		user: t.String(),
		domain: t.Union([t.String(), t.Null()]),
		tag: t.Union([t.String(), t.Null()]),
		attributes: emailHealthAttributes,
		mailServer: emailHealthMailServer,
	});

	export const emailHealthCheckBody = checkBody;
	export const emailHealthCheckQuery = checkQuery;

	export const emailHealthCheckResponse = t.Composite([
		checkResponse,
		t.Object({
			health: healthPresentation,
		}),
	]);

	export const batchCreateBody = t.Object({
		emails: t.Optional(t.Array(t.String())),
		file: t.Optional(t.Any()),
	});

	export const batchCreateResponse = t.Object({
		token: t.String(),
		status: t.Literal("queued"),
		pollUrl: t.String(),
	});

	export const batchRowResult = t.Object({
		email: t.String(),
		rowNumber: t.Number(),
		domain: t.Union([t.String(), t.Null()]),
		verdict: t.Union([
			t.Literal("invalid"),
			t.Literal("disposable"),
			t.Literal("risky"),
			t.Literal("deliverable"),
		]),
		isValidSyntax: t.Boolean(),
		isDisposable: t.Boolean(),
		isRoleAddress: t.Boolean(),
		isFreeProvider: t.Boolean(),
		mxRecords: t.Array(t.String()),
		confidence: t.Number(),
		riskScore: t.Number(),
		flags: t.Array(t.String()),
		health: healthPresentation,
	});

	export const batchSummary = t.Object({
		totalUploaded: t.Number(),
		totalUnique: t.Number(),
		duplicatesRemoved: t.Number(),
		deliverableCount: t.Number(),
		riskyCount: t.Number(),
		disposableCount: t.Number(),
		invalidCount: t.Number(),
		noMxCount: t.Number(),
		avgRiskScore: t.Number(),
		healthyPct: t.Number(),
	});

	export const batchPollResponse = t.Object({
		token: t.String(),
		status: t.Union([
			t.Literal("queued"),
			t.Literal("running"),
			t.Literal("done"),
			t.Literal("failed"),
		]),
		createdAt: t.String(),
		completedAt: t.Union([t.String(), t.Null()]),
		totalUploaded: t.Number(),
		totalUnique: t.Number(),
		duplicatesRemoved: t.Number(),
		results: t.Array(batchRowResult),
		summary: t.Union([batchSummary, t.Null()]),
		error: t.Union([t.String(), t.Null()]),
	});

	const checkStatus = t.Union([
		t.Literal("pass"),
		t.Literal("warn"),
		t.Literal("fail"),
	]);

	const recordWarning = t.Object({
		severity: t.Union([t.Literal("warn"), t.Literal("fail")]),
		code: t.String(),
		detail: t.String(),
		fix: t.String(),
	});

	export const bimiCheckBody = t.Object({
		domain: t.String({
			minLength: 1,
			maxLength: 255,
			description: "Domain to look up default._bimi and _dmarc for.",
			examples: ["paypal.com", "example.com"],
		}),
	});

	export const bimiCheckQuery = bimiCheckBody;

	export const bimiCheckResponse = t.Object({
		domain: t.String(),
		queryName: t.String(),
		verdict: checkStatus,
		bimiRecord: t.Union([t.String(), t.Null()]),
		logoUrl: t.Union([t.String(), t.Null()]),
		authorityUrl: t.Union([t.String(), t.Null()]),
		dmarcRecord: t.Union([t.String(), t.Null()]),
		dmarcPolicy: t.Union([t.String(), t.Null()]),
		dmarcPct: t.Union([t.Number(), t.Null()]),
		dmarcEnforced: t.Boolean(),
		logo: t.Object({
			fetched: t.Boolean(),
			contentType: t.Union([t.String(), t.Null()]),
			tinyPsOk: t.Union([t.Boolean(), t.Null()]),
			issues: t.Array(
				t.Object({
					status: checkStatus,
					detail: t.String(),
					fix: t.Optional(t.String()),
				}),
			),
		}),
		checks: t.Array(
			t.Object({
				id: t.String(),
				label: t.String(),
				status: checkStatus,
				detail: t.String(),
				record: t.Optional(t.String()),
				fix: t.Optional(t.String()),
			}),
		),
		recommendations: t.Array(t.String()),
	});

	export const spfGenerateBody = t.Object({
		domain: t.String({
			minLength: 1,
			maxLength: 255,
			examples: ["example.com"],
		}),
		ipv4: t.Optional(t.Array(t.String({ maxLength: 64 }), { maxItems: 20 })),
		ipv6: t.Optional(t.Array(t.String({ maxLength: 64 }), { maxItems: 20 })),
		includes: t.Optional(
			t.Array(t.String({ maxLength: 255 }), { maxItems: 20 }),
		),
		a: t.Optional(t.Boolean()),
		mx: t.Optional(t.Boolean()),
		aHosts: t.Optional(t.Array(t.String({ maxLength: 255 }), { maxItems: 10 })),
		mxHosts: t.Optional(
			t.Array(t.String({ maxLength: 255 }), { maxItems: 10 }),
		),
		policy: t.Optional(
			t.Union([
				t.Literal("~all"),
				t.Literal("-all"),
				t.Literal("?all"),
				t.Literal("+all"),
			]),
		),
	});

	export const spfGenerateResponse = t.Object({
		domain: t.String(),
		dnsName: t.String(),
		record: t.String(),
		lookupCount: t.Number(),
		lookupLimit: t.Number(),
		policy: t.Union([
			t.Literal("~all"),
			t.Literal("-all"),
			t.Literal("?all"),
			t.Literal("+all"),
		]),
		existingRecord: t.Union([t.String(), t.Null()]),
		warnings: t.Array(recordWarning),
	});

	export const dkimGenerateBody = t.Object({
		domain: t.String({
			minLength: 1,
			maxLength: 255,
			examples: ["example.com"],
		}),
		selector: t.Optional(
			t.String({
				minLength: 1,
				maxLength: 63,
				examples: ["default", "reloop"],
			}),
		),
	});

	export const dkimGenerateResponse = t.Object({
		domain: t.String(),
		selector: t.String(),
		dnsName: t.String(),
		record: t.String(),
		recordChunks: t.Array(t.String()),
		recordZone: t.String(),
		publicKey: t.String(),
		privateKey: t.String(),
		keyType: t.Literal("rsa"),
		bits: t.Literal(2048),
	});

	export const dmarcGenerateBody = t.Object({
		domain: t.String({
			minLength: 1,
			maxLength: 255,
			examples: ["example.com"],
		}),
		policy: t.Optional(
			t.Union([
				t.Literal("none"),
				t.Literal("quarantine"),
				t.Literal("reject"),
			]),
		),
		rua: t.Optional(t.String({ maxLength: 500 })),
		ruf: t.Optional(t.String({ maxLength: 500 })),
		aspf: t.Optional(t.Union([t.Literal("r"), t.Literal("s")])),
		adkim: t.Optional(t.Union([t.Literal("r"), t.Literal("s")])),
		pct: t.Optional(t.Integer({ minimum: 0, maximum: 100 })),
		sp: t.Optional(
			t.Union([
				t.Literal("none"),
				t.Literal("quarantine"),
				t.Literal("reject"),
			]),
		),
	});

	export const dmarcGenerateResponse = t.Object({
		domain: t.String(),
		dnsName: t.String(),
		record: t.String(),
		policy: t.Union([
			t.Literal("none"),
			t.Literal("quarantine"),
			t.Literal("reject"),
		]),
		warnings: t.Array(recordWarning),
	});


	export const dnsLookupBody = t.Object({
		domain: t.String({
			minLength: 1,
			maxLength: 255,
			description:
				"Domain name, hostname, IP address, or query with prefix (e.g. ohraya.com, a:ohraya.com, mx:ohraya.com).",
			examples: ["ohraya.com", "a:ohraya.com", "mx:google.com", "txt:_dmarc.apple.com"],
		}),
		recordType: t.Optional(
			t.Union([
				t.Literal("ANY"),
				t.Literal("A"),
				t.Literal("AAAA"),
				t.Literal("MX"),
				t.Literal("TXT"),
				t.Literal("CNAME"),
				t.Literal("NS"),
				t.Literal("SOA"),
				t.Literal("CAA"),
				t.Literal("PTR"),
				t.Literal("SRV"),
			]),
		),
	});

	export const dnsLookupQuery = t.Object({
		domain: t.String({
			minLength: 1,
			maxLength: 255,
			description: "Domain name, hostname, IP address, or query with prefix.",
		}),
		recordType: t.Optional(
			t.Union([
				t.Literal("ANY"),
				t.Literal("A"),
				t.Literal("AAAA"),
				t.Literal("MX"),
				t.Literal("TXT"),
				t.Literal("CNAME"),
				t.Literal("NS"),
				t.Literal("SOA"),
				t.Literal("CAA"),
				t.Literal("PTR"),
				t.Literal("SRV"),
			]),
		),
	});

	export const dnsLookupRecord = t.Object({
		type: t.String(),
		name: t.String(),
		value: t.String(),
		ttl: t.Union([t.Number(), t.Null()]),
		priority: t.Optional(t.Number()),
		details: t.Optional(t.Record(t.String(), t.Any())),
	});

	export const dnsLookupDiagnostic = t.Object({
		id: t.String(),
		name: t.String(),
		category: t.Union([
			t.Literal("dns"),
			t.Literal("email_auth"),
			t.Literal("security"),
			t.Literal("web"),
		]),
		status: t.Union([
			t.Literal("pass"),
			t.Literal("warn"),
			t.Literal("fail"),
			t.Literal("info"),
		]),
		message: t.String(),
		details: t.Optional(t.String()),
	});

	export const dnsLookupProvider = t.Object({
		id: t.String(),
		name: t.String(),
		website: t.String(),
		category: t.Union([
			t.Literal("managed_dns"),
			t.Literal("cloud"),
			t.Literal("registrar"),
			t.Literal("cdn"),
			t.Literal("hosting"),
		]),
		description: t.String(),
	});

	export const dnsLookupResponse = t.Object({
		query: t.String(),
		domain: t.String(),
		recordType: t.String(),
		resolvedAt: t.String(),
		responseTimeMs: t.Number(),
		nameserver: t.Union([t.String(), t.Null()]),
		provider: t.Union([dnsLookupProvider, t.Null()]),
		records: t.Array(dnsLookupRecord),
		diagnostics: t.Array(dnsLookupDiagnostic),
		summary: t.Object({
			totalRecords: t.Number(),
			hasA: t.Boolean(),
			hasAaaa: t.Boolean(),
			hasMx: t.Boolean(),
			hasTxt: t.Boolean(),
			hasCname: t.Boolean(),
			hasNs: t.Boolean(),
			hasSoa: t.Boolean(),
			hasDmarc: t.Boolean(),
			hasSpf: t.Boolean(),
			dmarcPolicy: t.Union([t.String(), t.Null()]),
			spfRecord: t.Union([t.String(), t.Null()]),
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
	export type HealthPresentation = typeof healthPresentation.static;
	export type EmailHealthCheckResponse = typeof emailHealthCheckResponse.static;
	export type BatchCreateResponse = typeof batchCreateResponse.static;
	export type BatchPollResponse = typeof batchPollResponse.static;
	export type BatchRowResult = typeof batchRowResult.static;
	export type BatchSummary = typeof batchSummary.static;
	export type SpamCheckBody = typeof spamCheckBody.static;
	export type SpamCheckResponse = typeof spamCheckResponse.static;
	export type BlocklistCheckBody = typeof blocklistCheckBody.static;
	export type BlocklistCheckResponse = typeof blocklistCheckResponse.static;
	export type DnsLookupBody = typeof dnsLookupBody.static;
	export type DnsLookupResponse = typeof dnsLookupResponse.static;
	export type BimiCheckResponse = typeof bimiCheckResponse.static;
	export type SpfGenerateBody = typeof spfGenerateBody.static;
	export type SpfGenerateResponse = typeof spfGenerateResponse.static;
	export type DkimGenerateBody = typeof dkimGenerateBody.static;
	export type DkimGenerateResponse = typeof dkimGenerateResponse.static;
	export type DmarcGenerateBody = typeof dmarcGenerateBody.static;
	export type DmarcGenerateResponse = typeof dmarcGenerateResponse.static;
}
