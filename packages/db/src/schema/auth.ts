import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

/** Platform user roles (Better Auth admin plugin). Distinct from org member.role. */
export const userRoleEnum = pgEnum("user_role", ["user", "super-admin"]);

export const user = pgTable(
	"user",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		email: text("email").notNull().unique(),
		emailVerified: boolean("email_verified").default(false).notNull(),
		image: text("image"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		role: userRoleEnum("role").default("user").notNull(),
		banned: boolean("banned").default(false),
		banReason: text("ban_reason"),
		banExpires: timestamp("ban_expires"),
		activeOrganizationId: text("active_organization_id"),
		mode: text("mode").default("dev"),
		isSuspect: boolean("is_suspect").default(false).notNull(),
		suspectReason: text("suspect_reason"),
		suspectSeverity: text("suspect_severity"),
		suspectCategory: text("suspect_category"),
		suspectUpdatedAt: timestamp("suspect_updated_at"),
	},
	(table) => [index("user_isSuspect_idx").on(table.isSuspect)],
);

export const account = pgTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at"),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
	"verification",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const jwks = pgTable("jwks", {
	id: text("id").primaryKey(),
	publicKey: text("public_key").notNull(),
	privateKey: text("private_key").notNull(),
	createdAt: timestamp("created_at").notNull(),
	expiresAt: timestamp("expires_at"),
	// Better Auth 1.7 records key algorithm/curve alongside key material.
	alg: text("alg"),
	crv: text("crv"),
});

export const organizationStatusEnum = pgEnum("organization_status", [
	"active",
	"suspended",
	"deleted",
]);

export const organization = pgTable(
	"organization",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		slug: text("slug").notNull().unique(),
		logo: text("logo"),
		createdAt: timestamp("created_at").notNull(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
		metadata: text("metadata"),
		billingEmail: text("billing_email"),
		billingName: text("billing_name"),
		externalCustomerId: text("external_customer_id").unique(),
		status: organizationStatusEnum("status").notNull().default("active"),
		isSuspect: boolean("is_suspect").default(false).notNull(),
		suspectReason: text("suspect_reason"),
		suspectSeverity: text("suspect_severity"),
		suspectCategory: text("suspect_category"),
		suspectUpdatedAt: timestamp("suspect_updated_at"),
	},
	(table) => [index("organization_isSuspect_idx").on(table.isSuspect)],
);

export const member = pgTable(
	"member",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		role: text("role").default("member").notNull(),
		createdAt: timestamp("created_at").notNull(),
	},
	(table) => [
		index("member_organizationId_idx").on(table.organizationId),
		index("member_userId_idx").on(table.userId),
	],
);

export const invitation = pgTable(
	"invitation",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		email: text("email").notNull(),
		role: text("role"),
		status: text("status").default("pending").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		inviterId: text("inviter_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [
		index("invitation_organizationId_idx").on(table.organizationId),
		index("invitation_email_idx").on(table.email),
	],
);

export const userRelations = relations(user, ({ many }) => ({
	accounts: many(account),
	members: many(member),
	invitations: many(invitation),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id],
	}),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
	members: many(member),
	invitations: many(invitation),
}));

export const memberRelations = relations(member, ({ one }) => ({
	organization: one(organization, {
		fields: [member.organizationId],
		references: [organization.id],
	}),
	user: one(user, {
		fields: [member.userId],
		references: [user.id],
	}),
}));

export const invitationRelations = relations(invitation, ({ one }) => ({
	organization: one(organization, {
		fields: [invitation.organizationId],
		references: [organization.id],
	}),
	user: one(user, {
		fields: [invitation.inviterId],
		references: [user.id],
	}),
}));

/**
 * Better Auth session table.
 *
 * Sessions historically lived only in Redis secondary storage. The MCP OAuth
 * provider requires `session.storeSessionInDatabase`, so sessions are now
 * persisted here as well. Reads still come from secondary storage, so
 * pre-existing Redis-only sessions keep working.
 */
export const session = pgTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: timestamp("expires_at").notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		impersonatedBy: text("impersonated_by"),
		activeOrganizationId: text("active_organization_id"),
	},
	(table) => [index("session_userId_idx").on(table.userId)],
);

/** OAuth 2.1 client registry (MCP authorization server). */
export const oauthClient = pgTable(
	"oauth_client",
	{
		id: text("id").primaryKey(),
		clientId: text("client_id").notNull().unique(),
		clientSecret: text("client_secret"),
		/** Provenance for discovered clients (e.g. `"cimd"`). */
		clientDiscoveryId: text("client_discovery_id"),
		disabled: boolean("disabled").default(false),
		skipConsent: boolean("skip_consent"),
		enableEndSession: boolean("enable_end_session"),
		subjectType: text("subject_type"),
		scopes: text("scopes").array(),
		clientCredentialsScopes: text("client_credentials_scopes").array(),
		userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at"),
		updatedAt: timestamp("updated_at"),
		name: text("name"),
		uri: text("uri"),
		icon: text("icon"),
		contacts: text("contacts").array(),
		tos: text("tos"),
		policy: text("policy"),
		softwareId: text("software_id"),
		softwareVersion: text("software_version"),
		softwareStatement: text("software_statement"),
		redirectUris: text("redirect_uris").array().notNull(),
		postLogoutRedirectUris: text("post_logout_redirect_uris").array(),
		backchannelLogoutUri: text("backchannel_logout_uri"),
		backchannelLogoutSessionRequired: boolean(
			"backchannel_logout_session_required",
		),
		tokenEndpointAuthMethod: text("token_endpoint_auth_method"),
		applicationType: text("application_type"),
		jwks: text("jwks"),
		jwksUri: text("jwks_uri"),
		grantTypes: text("grant_types").array(),
		responseTypes: text("response_types").array(),
		requirePKCE: boolean("require_pkce"),
		dpopBoundAccessTokens: boolean("dpop_bound_access_tokens").default(false),
		referenceId: text("reference_id"),
		metadata: jsonb("metadata"),
	},
	(table) => [index("oauthClient_userId_idx").on(table.userId)],
);

/**
 * Protected resources the authorization server issues access tokens for
 * (RFC 8707 / RFC 9728). A null policy column inherits the plugin default.
 */
export const oauthResource = pgTable("oauth_resource", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull().unique(),
	name: text("name").notNull(),
	accessTokenTtl: integer("access_token_ttl"),
	refreshTokenTtl: integer("refresh_token_ttl"),
	signingAlgorithm: text("signing_algorithm"),
	signingKeyId: text("signing_key_id"),
	allowedScopes: text("allowed_scopes").array(),
	customClaims: jsonb("custom_claims"),
	dpopBoundAccessTokensRequired: boolean(
		"dpop_bound_access_tokens_required",
	).default(false),
	disabled: boolean("disabled").default(false),
	createdAt: timestamp("created_at"),
	updatedAt: timestamp("updated_at"),
	policyVersion: integer("policy_version").default(1),
	metadata: jsonb("metadata"),
});

/**
 * Join table: which clients may request which resources. Authoritative only
 * when the provider is configured with `enforcePerClientResources`.
 */
export const oauthClientResource = pgTable(
	"oauth_client_resource",
	{
		id: text("id").primaryKey(),
		clientId: text("client_id")
			.notNull()
			.references(() => oauthClient.clientId, { onDelete: "cascade" }),
		resourceId: text("resource_id")
			.notNull()
			.references(() => oauthResource.identifier, { onDelete: "cascade" }),
		metadata: jsonb("metadata"),
		createdAt: timestamp("created_at"),
	},
	(table) => [
		index("oauthClientResource_clientId_idx").on(table.clientId),
		index("oauthClientResource_resourceId_idx").on(table.resourceId),
		// Composite uniqueness is load-bearing for the provider's
		// `enforcePerClientResources` linkage check and makes concurrent
		// same-pair inserts surface as idempotent UNIQUE violations.
		uniqueIndex("oauthClientResource_client_resource_idx").on(
			table.clientId,
			table.resourceId,
		),
	],
);

/** Opaque refresh tokens created with `offline_access`. Linked to a session. */
export const oauthRefreshToken = pgTable(
	"oauth_refresh_token",
	{
		id: text("id").primaryKey(),
		token: text("token").notNull().unique(),
		clientId: text("client_id")
			.notNull()
			.references(() => oauthClient.clientId, { onDelete: "cascade" }),
		sessionId: text("session_id").references(() => session.id, {
			onDelete: "set null",
		}),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		referenceId: text("reference_id"),
		authorizationCodeId: text("authorization_code_id"),
		resources: text("resources").array(),
		requestedUserInfoClaims: text("requested_user_info_claims").array(),
		expiresAt: timestamp("expires_at"),
		createdAt: timestamp("created_at"),
		revoked: timestamp("revoked"),
		rotatedAt: timestamp("rotated_at"),
		rotationReplayResponse: text("rotation_replay_response"),
		rotationReplayExpiresAt: timestamp("rotation_replay_expires_at"),
		authTime: timestamp("auth_time"),
		confirmation: jsonb("confirmation"),
		scopes: text("scopes").array().notNull(),
	},
	(table) => [
		index("oauthRefreshToken_clientId_idx").on(table.clientId),
		index("oauthRefreshToken_sessionId_idx").on(table.sessionId),
		index("oauthRefreshToken_userId_idx").on(table.userId),
		index("oauthRefreshToken_authorizationCodeId_idx").on(
			table.authorizationCodeId,
		),
	],
);

/**
 * Opaque access tokens. JWT access tokens are never stored (no row is
 * created for them); only opaque tokens are persisted, introspected, and
 * revoked here.
 */
export const oauthAccessToken = pgTable(
	"oauth_access_token",
	{
		id: text("id").primaryKey(),
		token: text("token").unique(),
		clientId: text("client_id")
			.notNull()
			.references(() => oauthClient.clientId, { onDelete: "cascade" }),
		sessionId: text("session_id").references(() => session.id, {
			onDelete: "set null",
		}),
		userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
		referenceId: text("reference_id"),
		authorizationCodeId: text("authorization_code_id"),
		resources: text("resources").array(),
		requestedUserInfoClaims: text("requested_user_info_claims").array(),
		refreshId: text("refresh_id").references(() => oauthRefreshToken.id, {
			onDelete: "cascade",
		}),
		expiresAt: timestamp("expires_at"),
		createdAt: timestamp("created_at"),
		revoked: timestamp("revoked"),
		confirmation: jsonb("confirmation"),
		scopes: text("scopes").array().notNull(),
	},
	(table) => [
		index("oauthAccessToken_clientId_idx").on(table.clientId),
		index("oauthAccessToken_sessionId_idx").on(table.sessionId),
		index("oauthAccessToken_userId_idx").on(table.userId),
		index("oauthAccessToken_authorizationCodeId_idx").on(
			table.authorizationCodeId,
		),
		index("oauthAccessToken_refreshId_idx").on(table.refreshId),
	],
);

/** Per-user, per-client granted scopes. */
export const oauthConsent = pgTable(
	"oauth_consent",
	{
		id: text("id").primaryKey(),
		clientId: text("client_id")
			.notNull()
			.references(() => oauthClient.clientId, { onDelete: "cascade" }),
		userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
		referenceId: text("reference_id"),
		resources: text("resources").array(),
		requestedUserInfoClaims: text("requested_user_info_claims").array(),
		scopes: text("scopes").array().notNull(),
		createdAt: timestamp("created_at"),
		updatedAt: timestamp("updated_at"),
	},
	(table) => [
		index("oauthConsent_clientId_idx").on(table.clientId),
		index("oauthConsent_userId_idx").on(table.userId),
	],
);

/**
 * Single-use `private_key_jwt` assertion IDs. Row id is a digest of the
 * per-client assertion identifier so replays collide on the primary key.
 * Expired rows accumulate until a deployment-level sweep removes them.
 */
export const oauthClientAssertion = pgTable("oauth_client_assertion", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
});

/**
 * RFC 8628 device authorization records (CLI/login flow). The OAuth
 * integration adds `resources` + `oauthClientId`; every code issued here
 * carries OAuth fields, so it can only be redeemed at `/oauth2/token`.
 */
export const deviceCode = pgTable("device_code", {
	id: text("id").primaryKey(),
	deviceCode: text("device_code").notNull().unique(),
	userCode: text("user_code").notNull().unique(),
	userId: text("user_id"),
	expiresAt: timestamp("expires_at").notNull(),
	status: text("status").notNull(),
	lastPolledAt: timestamp("last_polled_at"),
	pollingInterval: integer("polling_interval"),
	clientId: text("client_id"),
	scope: text("scope"),
	resources: text("resources").array(),
	oauthClientId: text("oauth_client_id"),
});
