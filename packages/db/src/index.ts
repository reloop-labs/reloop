export {
	and,
	eq,
	gt,
	gte,
	ilike,
	inArray,
	isNotNull,
	isNull,
	like,
	lt,
	lte,
	ne,
	notInArray,
	or,
} from "drizzle-orm";
export { alias } from "drizzle-orm/pg-core";
export * from "drizzle-orm/sql";
export {
	createDb,
	type DatabaseClientOptions,
	type DatabaseInstance,
	db,
} from "./client";
export {
	domainDailyOverlay,
	isRegistrationAgeStale,
	mergeDailyLimits,
	NEW_DOMAIN_COLD_DAILY_CAP,
	NEW_DOMAIN_TOO_NEW_DAILY_CAP,
	REGISTRATION_AGE_STALE_MS,
	refreshDomainRegistrationAge,
} from "./domain-daily-overlay";
export * from "./email-send-source";
export {
	type AssignCheck,
	applyWarmupReservation,
	assertCanAssignDedicatedIp,
	DEFAULT_WARMUP_SCHEDULE,
	dailyCapForDay,
	type EgressDecision,
	emptyProviderCounts,
	MAILBOX_PROVIDER_SHARES,
	normalizeProviderCounts,
	phaseForDay,
	providerCapForDay,
	resolveEgressDecision,
	splitProviderCaps,
	totalSentToday,
	type WarmupProgressView,
	type WarmupReservation,
	type WarmupSnapshot,
	warmupDayNumber,
	warmupProgressView,
} from "./ip-warmup";
export {
	classifyMailboxProvider,
	recipientDomain,
} from "./mailbox-provider";
export {
	applyCreditReservation,
	type CreditReservation,
	type CreditSnapshot,
	peekSendCredits,
	type ReserveDecision,
	refundSendCredits,
	reserveSendCredits,
	utcDayStart,
} from "./reserve-send-credits";
export * from "./schema/index";
export {
	type AssignDedicatedIpResult,
	assignDedicatedIp,
	type CreateSendingIpResult,
	createSendingIp,
	getSendingIp,
	listOrganizationSendingIps,
	listSendingIps,
	type OrgEgress,
	parseSendingHostname,
	parseSendingIpAddress,
	presentOrganizationSendingIps,
	resolveOrgEgress,
	setWarmupAction,
	unassignDedicatedIp,
	updateSendingIp,
	type WarmupAction,
} from "./sending-ip";
export { bareEmail, uniqueBareEmails } from "./smtp-recipients";
export * from "./utils/crypto";
export * from "./webhook-events";
