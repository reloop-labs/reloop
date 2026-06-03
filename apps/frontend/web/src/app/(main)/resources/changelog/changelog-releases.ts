import type { ChangelogRelease } from "./changelog-timeline";

/**
 * Product changelog — newest first. Each release groups work by engineering area
 * (Planning, Design, Frontend, Backend, DevOps, Testing) per common release-note standards.
 */
export const changelogReleases: ChangelogRelease[] = [
	{
		date: "June 2026",
		version: "0.9.0",
		title: "Agent inbox, workflows & marketing site",
		tags: [
			"Inbox",
			"Workflows",
			"Marketing",
			"Chatwoot",
			"SMTP",
			"SEO",
			"Licensing",
		],
		sections: [
			{
				category: "Planning",
				items: [
					{
						label: "Inbound email architecture",
						description:
							"Defined mailbox, thread, and message models with JetStream-backed inbound processing for agent workflows. Designed S3 attachment storage strategy and organization-scoped access patterns.",
					},
					{
						label: "Marketing site information architecture",
						description:
							"Standardized product pages (developers, marketing teams, AI agents), resources section (blog, license, contact, changelog), and structured SEO/sitemap/robots.txt/JSON-LD strategy across all routes.",
					},
					{
						label: "Licensing model",
						description:
							"Migrated from MIT to Apache 2.0 with custom restrictions. Defined self-hosting requirements, commercial licensing FAQ, and permission bento grid for the license page.",
					},
					{
						label: "Live support integration",
						description:
							"Planned Chatwoot widget integration for both web and dashboard apps with session synchronization and logout reset behavior.",
					},
				],
			},
			{
				category: "Design",
				items: [
					{
						label: "Changelog timeline",
						description:
							"New release timeline layout with version badges, date columns, tags, categorized sections (Planning → Design → Frontend → Backend → DevOps → Testing), and code block previews.",
					},
					{
						label: "SMTP feature page",
						description:
							"Redesigned SMTP landing with interactive sandbox, CopyCodeBlock tabs with animated pill indicators, custom CSS-variable-based Shiki syntax theme, and browser chrome styling.",
					},
					{
						label: "Contact & license pages",
						description:
							"Streamlined contact form layout with valibot validation, Apache 2.0 license bento grid with LicensePermissions component, and compact marketing page shell variants.",
					},
					{
						label: "Homepage & theme system",
						description:
							"Light/dark theme provider with UI toggle, hero decorative underlines with hover-triggered primary color transitions, use-case grid refresh with updated color palette, and footer theme toggle.",
					},
					{
						label: "Product landing pages",
						description:
							"Modular FeatureMarketingPage component system with shared configuration. Custom layouts for developers (hero, bento, code samples), marketing teams (metrics, guide), and AI agents (component-based architecture).",
					},
					{
						label: "Code block redesign",
						description:
							"Reusable CopyCodeBlock component with consolidated copy button, dynamic icon logic, tab navigation with animated pill and indicator, and simplified browser chrome visual assets.",
					},
				],
			},
			{
				category: "Frontend",
				items: [
					{
						label: "Agent inbox (dashboard)",
						description:
							"Mailbox and thread management UI with CRUD operations, add-agent-address modal redesign, read/unread toggle and message deletion, attachment support, and page layout styling updates.",
					},
					{
						label: "Workflow editor",
						description:
							"Visual workflow editor with trigger nodes (route icon), empty state components, and management interfaces for creating and configuring automated email workflows.",
					},
					{
						label: "Template editor enhancements",
						description:
							"CodeMirror integration (xcodeDark theme), variable suggestion dropdown with fixed positioning replacing tippy.js, split-pane visual/code/history modes, image upload slash commands, deliverability score panel, and email HTML sanitization with styling normalization.",
					},
					{
						label: "Template versioning",
						description:
							"Save and restore functionality implemented in the editor sidebar for template version management.",
					},
					{
						label: "Forward DNS (dashboard)",
						description:
							"Forward domain DNS records to an email address from domain settings with tracking domain support.",
					},
					{
						label: "Marketing web app",
						description:
							"Product pages (developers, marketing teams, AI agents), languages/SDK documentation hub with individual integration pages, FeatureMarketingPage system with shared config, JSON-LD structured data, robots.txt, and comprehensive sitemap.",
					},
					{
						label: "Contact form (web)",
						description:
							"Valibot-validated contact form with updated metadata, FeatureCta component, and streamlined layout.",
					},
					{
						label: "Blog & community pages",
						description:
							"Blog page with changelog integration, community page redesign with Platform and Stats components, compact hero variant, and about page messaging updates.",
					},
					{
						label: "Chatwoot live chat",
						description:
							"Live chat widget with user session synchronization on web and dashboard apps. Session reset on logout, ready event listener for user identification, and type-safe user identification.",
					},
					{
						label: "Header & scroll performance",
						description:
							"Optimized header scroll animations with requestAnimationFrame and CSS contain. Native scroll behavior tuning, responsive layout adjustments for integrations section and footer typography.",
					},
				],
			},
			{
				category: "Backend",
				items: [
					{
						label: "Inbox service",
						description:
							"New be-inbox service (port 8021): mail routing, CRUD for mailboxes/threads/messages, attachment retrieval via S3, organization-scoped auth middleware, and email thread/message database schema with migrations.",
					},
					{
						label: "Inbound email pipeline",
						description:
							"KumoMTA inbound JetStream initialization, inbound email subscriber for processing incoming mail, integration test suite for end-to-end inbound flow verification.",
					},
					{
						label: "S3 integration",
						description:
							"S3 client implementation with nested configuration object, path-style env support, and bucket connectivity check integrated into the health route.",
					},
					{
						label: "Observability",
						description:
							"Elysia OpenTelemetry plugin integration; removed Bull Board dashboard and legacy tracking routes to simplify backend architecture.",
					},
					{
						label: "Workflow service",
						description:
							"Removed Bull Board dependencies, integrated elysia-opentelemetry plugin, improved controller logic, standardized import formatting, and refactored routing structure.",
					},
				],
			},
			{
				category: "DevOps",
				items: [
					{
						label: "CI deployment pipeline",
						description:
							"Automated CI workflow for inbox service build and deployment. Updated controller return types and standardized authentication properties.",
					},
					{
						label: "KumoMTA SMTP expansion",
						description:
							"Expanded SMTP listener support to include submission and SMTPS ports via Docker and Lua configuration. Added relay hosts for ESMTP listeners and port 2025 for alternate submission. Removed implicit SMTPS where simplified.",
					},
					{
						label: "Status page & configuration",
						description:
							"Status page URL updates, codebase-wide format pass, and Discord invite link standardization across documentation and frontend pages.",
					},
				],
			},
			{
				category: "Testing",
				items: [
					{
						label: "Inbound flow integration tests",
						description:
							"End-to-end integration tests covering inbound email processing pipeline from KumoMTA JetStream through to mailbox thread creation.",
					},
					{
						label: "Auth standardization tests",
						description:
							"Test suite aligned with organizationId-scoped authentication across inbox APIs, validating middleware behavior and token propagation.",
					},
					{
						label: "Real mailbox & thread API tests",
						description:
							"SWR integration tests for mailbox and thread API endpoints with mock data and assertion coverage.",
					},
				],
			},
		],
		code: `// Send from the new SDK after onboarding
import { Reloop } from '@reloop/sdk';

const reloop = new Reloop(process.env.RELOOP_API_KEY);
await reloop.emails.send({
  to: 'user@example.com',
  subject: 'Hello from Reloop',
  html: '<p>Your agent inbox is live.</p>',
});`,
	},
	{
		date: "May 2026",
		version: "0.8.0",
		title: "Templates, webhooks & deliverability",
		tags: [
			"Templates",
			"Webhooks",
			"Contacts",
			"Tracking",
			"Metrics",
			"API Keys",
			"Collaboration",
		],
		sections: [
			{
				category: "Planning",
				items: [
					{
						label: "Email lifecycle webhooks",
						description:
							"Mapped EMAIL_SENT and KUMOMTA_EVENT bus messages to webhook subscribers for full lifecycle coverage. Designed webhook event schema with delivery attempt tracking.",
					},
					{
						label: "Custom tracking domains",
						description:
							"Planned granular click/open tracking with per-domain TLS and return-path options. Defined base64url token signing strategy for tracking links.",
					},
					{
						label: "Template collaboration",
						description:
							"Designed real-time collaborative editing architecture using Yjs with WebSocket and WebRTC providers, IndexedDB persistence, and awareness-based cursor tracking.",
					},
				],
			},
			{
				category: "Design",
				items: [
					{
						label: "Template editor UX overhaul",
						description:
							"Toolbar for design/test modes, side panels for variables and deliverability, animated EmailInspector with modular document/node/text panels, score ring component, and diamond-layout spacing control.",
					},
					{
						label: "Inspector component system",
						description:
							"Custom UI primitives with standardized property rows, breadcrumb navigation, ButtonGroup for typography controls, react-colorful color picker integration, and flat design aesthetic.",
					},
					{
						label: "Email timeline UI",
						description:
							"Failure steps, error classification panel, skeleton loaders, and unified lifecycle stepper on contact history page.",
					},
					{
						label: "Deliverability charts",
						description:
							"Multi-select event types, complaints line chart, custom tooltips with formatted data, and 14-day default date range.",
					},
					{
						label: "Webhook documentation layout",
						description:
							"SideBySide layout for webhook event details and JSON payloads with dynamic code display portal.",
					},
					{
						label: "Domain status redesign",
						description:
							"Circuit board aesthetic for status banner and timeline, spinner integration, dot grid patterns, consistent color schemes across verification states.",
					},
				],
			},
			{
				category: "Frontend",
				items: [
					{
						label: "Template variables system",
						description:
							"Typed variables with defaults, triple-brace syntax (e.g., {{{name}}}), create/edit/delete modals, slash-command insertion in the editor, Valibot + react-hook-form validation.",
					},
					{
						label: "Template send & test",
						description:
							"Reply-To toggle, test email warnings when from-address is missing, recent send history, variable inputs for test sends, and conditional warning with disabled functionality when from email is missing.",
					},
					{
						label: "Email inspector (side panel)",
						description:
							"Node-specific controls with breadcrumb navigation, modular panels for document/node/text, alignment/mark/list controls as reusable ButtonGroup components, border width/corner radius support, and spacing control with diamond layout.",
					},
					{
						label: "Collaborative editing",
						description:
							"Real-time cursor tracking with perfect-cursors interpolation, mouse presence synchronization via Yjs awareness, EditorProvider with collaboration logic, PresenceProvider for user states, and avatar display on remote cursors.",
					},
					{
						label: "Webhooks dashboard",
						description:
							"Categorized WebhookEventSelector with search, manual delivery retry, secret rotation, masked secrets in UI, create/edit webhook modals with event subscriptions, redesigned webhook table with DocsButton.",
					},
					{
						label: "Contact activity",
						description:
							"Email and event timeline on contact detail page; auto-capture events surfaced in history with lifecycle stepper.",
					},
					{
						label: "Domain settings enhancements",
						description:
							"Tracking subdomain, TLS mode control, sending/receiving toggles, advanced accordion, verification polling, auto-configure button for DNS records, DNS provider support with direct management links, domain deletion flow using query state, and DomainApiDetails integration.",
					},
					{
						label: "API keys UI refinements",
						description:
							"Usage stats display, creator avatars, prefix and last-used columns, optimistic status toggles, dedicated empty state for filtered search results, dynamic theme switching for code blocks.",
					},
					{
						label: "Transaction emails page",
						description:
							"Interactive API playground and HTML formatter for email body preview on the web app.",
					},
					{
						label: "Send details editor",
						description:
							"Expandable sender details component with zustand state management, preview text field in editor store, and simplified send details UI layout.",
					},
				],
			},
			{
				category: "Backend",
				items: [
					{
						label: "Template engine",
						description:
							"Automated variable extraction on create/update; resolution at send time; react-email composer and HTML sanitization pipeline. Redis-backed Yjs persistence plugin for collaborative state.",
					},
					{
						label: "Webhook delivery system",
						description:
							"Webhook trigger endpoint with background delivery logic, delivery attempt tracking and pagination, test event trigger functionality, delivery log schema with status filtering, secret encryption utilities, retry endpoint.",
					},
					{
						label: "Webhook event management",
						description:
							"Strict event validation, custom error messages for schema validation, webhook status toggling, enabled event IDs in API responses. Centralized environment configuration via webhookConfig module.",
					},
					{
						label: "Tracking system",
						description:
							"Base64url token signing in Lua, custom tracking domains, click redirect via Location header, TRACKING_SECRET in docker-compose.",
					},
					{
						label: "Metrics & analytics",
						description:
							"Dynamic date bucketing, domain-scoped email statistics, calendar max-range validation for query parameters.",
					},
					{
						label: "API key audit trail",
						description:
							"apiKeyId propagated in auth context, usage statistics endpoint, case-insensitive audit actor mapping. Redis-based rate limiting middleware for API key operations.",
					},
					{
						label: "KumoMTA integration",
						description:
							"Dynamic DKIM configuration and delivery webhook integration. Custom routing policy to Mailpit for local development. SMTP authentication and authenticated relay support.",
					},
					{
						label: "Domain webhooks",
						description:
							"Added domain.verify webhook event, domain status and event tracking in DNS verification responses, audit logging for domain mutations.",
					},
					{
						label: "Centralized logging (evlog)",
						description:
							"Integrated evlog service across api-key, domain, contact, group, property, and topic operations. Request metadata and webhook event tracking for all mutations.",
					},
					{
						label: "Multi-auth support",
						description:
							"Multi-auth middleware with cookie + API key authentication, webhook event schema integration, and delivery tracking field enhancements.",
					},
				],
			},
			{
				category: "DevOps",
				items: [
					{
						label: "OpenTelemetry rollout",
						description:
							"OTLP logging support rolled across all microservices. OpenTelemetry instrumentation added to backend services.",
					},
					{
						label: "KumoMTA policy & configuration",
						description:
							"Trusted HTTP hosts via environment variables; API key propagation on NATS publish failure. Local KumoMTA service with Mailpit routing, HTTP API port standardization (8020), and SMTP authentication configuration.",
					},
					{
						label: "Email templates",
						description:
							"Added email confirmation template with sendConfirmEmail utility. Replaced plain text test emails with rendered ConfirmEmail react-email component.",
					},
					{
						label: "Dependency & package management",
						description:
							"Removed unused AI SDK dependencies, updated lockfile. Updated evlog/webhook-events packages across services.",
					},
				],
			},
			{
				category: "Testing",
				items: [
					{
						label: "SMTP send tests",
						description:
							"SMTP test script updated to send rendered OTP email templates using react-email rendering utility.",
					},
					{
						label: "Collaboration sync tests",
						description:
							"WebSocket message transmission verification, content error logging, race condition fix validation for collaboration hook state updates.",
					},
				],
			},
		],
	},
	{
		date: "April 2026",
		version: "0.7.0",
		title: "Contacts, topics & API platform",
		tags: [
			"Contacts",
			"Topics",
			"API Keys",
			"Docs",
			"Onboarding",
			"Groups",
			"Command Menu",
		],
		sections: [
			{
				category: "Planning",
				items: [
					{
						label: "Contacts platform",
						description:
							"Contacts, groups, properties, and topics as first-class CRM primitives with full OpenAPI coverage. Designed transactional property updates with replacement mode and type validation.",
					},
					{
						label: "Public preferences",
						description:
							"Token-based subscription management for end-user preference centers with opt_in/opt_out enrollment semantics.",
					},
					{
						label: "Contact API standardization",
						description:
							"Removed v1 prefix from endpoints, standardized contact identification by email for topic and group management, moved IDs from request bodies to path parameters.",
					},
				],
			},
			{
				category: "Design",
				items: [
					{
						label: "Onboarding flow",
						description:
							"Step cards with connectors, NumberFlow step indicator, animated breadcrumbs, package-manager tabs for SDK install with Shiki highlighting.",
					},
					{
						label: "Contact & group modals",
						description:
							"Discovery pane + selection basket for groups/topics, infinite scroll multi-select, delete-group stats, keyboard shortcuts (⌘+Enter for submit, Esc for cancel).",
					},
					{
						label: "Marketing header",
						description:
							"Sticky glass-morphism header, mega menu with framer-motion animations, dark default theme, and documentation links.",
					},
					{
						label: "Flat design overhaul",
						description:
							"Updated design tokens and UI components for cleaner flat aesthetic with dark mode support. Simplified sidebar layout, removed unnecessary framer-motion animations from template grid.",
					},
				],
			},
			{
				category: "Frontend",
				items: [
					{
						label: "Contacts dashboard",
						description:
							"Collapsible contacts sub-nav, property modals with motion animations, suppression banner, breadcrumb page headers, summary statistics cards (total, subscribed, unsubscribed) with icons.",
					},
					{
						label: "Contact groups",
						description:
							"Full CRUD for groups with dashboard pages, create group modal with icon header, group table with row navigation, and group contact listing.",
					},
					{
						label: "Topics & channels",
						description:
							"Topic CRUD, enrollments with opt_in/opt_out semantics, public/private visibility, card-based channel list, subscriber preview, tabbed navigation integration.",
					},
					{
						label: "API keys",
						description:
							"Shiki-highlighted keys, optimistic toggles, documentation drawer with TabMenuHorizontal and CodeBlock, table columns for prefix and last used, 'a' hotkey for API details.",
					},
					{
						label: "Command menu",
						description:
							"Recent items, ⌘1–9 keyboard navigation, categorized action groups for quick access.",
					},
					{
						label: "Documentation site",
						description:
							"AI-powered search and chat for docs, OG image generation, integration guides, automated OpenAPI reference, APIPage endpoint docs, mega menu links, fumadocs integration.",
					},
					{
						label: "Docs site redesign",
						description:
							"Revamped landing page with quick start cards, updated title/description, ToC navigation with motion indicators, smooth scrolling, persistent sidebar folder expansion, scroll position restore via sessionStorage.",
					},
					{
						label: "URL-managed modals",
						description:
							"Centralized contact-related modal management using URL query parameters and dedicated ContactsModals component, removing local modal state from tables.",
					},
				],
			},
			{
				category: "Backend",
				items: [
					{
						label: "Contacts API",
						description:
							"Full CRUD for contacts, groups, properties, topics. Bulk contact creation, transactional property updates with replacement mode (soft-delete unprovided, restore existing). Remove-from-group by id or email, graceful topic deletion.",
					},
					{
						label: "Contact properties",
						description:
							"Dynamic key-value properties for contacts with name validation, number type support, type enforcement. Injected logger into property controllers with OpenAPI 200 response examples.",
					},
					{
						label: "API keys service",
						description:
							"Cookie + API key auth macros, trace IDs and child loggers, OpenAPI security scheme documentation, list/detail endpoints with creator details.",
					},
					{
						label: "API key hardening",
						description:
							"Node.js API Key service with SDK-based code samples, comprehensive test suite with mocking helpers, 201 status for created keys, rate limiting middleware, atomic database operations, session caching, and owner-only key rotation.",
					},
					{
						label: "API key event bus",
						description:
							"NATS event logging for all CRUD operations (create, delete, enable, disable, rotate). Published API key creation event with subscriber to fetch user details from database.",
					},
					{
						label: "Domain enhancements",
						description:
							"Nameserver lookup, sending/receiving toggles, custom return path, tracking domain support in schema, OpenAPI code samples.",
					},
					{
						label: "Logs service overhaul",
						description:
							"ClickHouse schema validation, date formatting utilities, centralized logging for resource creation events. Structured request details in metadata, daily log retention cleanup cron, truncateLogs utility.",
					},
					{
						label: "Backend standardization",
						description:
							"Modular service loaders, custom error library (ApiKeyErrors) replacing manual status throws, standardized auth middleware with organizationId, health and agent-card routes.",
					},
				],
			},
			{
				category: "DevOps",
				items: [
					{
						label: "Logs service infrastructure",
						description:
							"Tracehub renamed to logs; ClickHouse auto-provisioning in docker-compose; Redis-backed auth for log API; LOGS_API_KEY propagated across services.",
					},
					{
						label: "Documentation infrastructure",
						description:
							"Updated docs theme with custom color tokens, table component dark mode support, @reloop/tailwind integration, breadcrumb home icon, page actions with loading states and raw content support.",
					},
					{
						label: "Backend README standardization",
						description:
							"Consistent README structure with resource links and documentation references across all backend services (api-key, contacts, domain, inbox, etc.).",
					},
					{
						label: "API key CI",
						description:
							"Added unit test execution step to api-key Dockerfile build process (later removed for build optimization).",
					},
				],
			},
			{
				category: "Testing",
				items: [
					{
						label: "API key test suite",
						description:
							"Comprehensive API key management service tests with mocking helpers, test client requests, and 201/delete status validation.",
					},
					{
						label: "Logs API tests",
						description:
							"Auth middleware tests and documentation code samples for list/detail log routes.",
					},
					{
						label: "Log cleanup tests",
						description:
							"Cleanup script validation for removing old logs with environment variable loading.",
					},
				],
			},
		],
	},
	{
		date: "March 2026",
		version: "0.6.0",
		title: "Template editor & observability",
		tags: ["Templates", "Logs", "Domains", "Editor", "Contacts", "ClickHouse"],
		sections: [
			{
				category: "Planning",
				items: [
					{
						label: "Template editor architecture",
						description:
							"Designed three-column editor layout with left/right/center header areas, publish workflow, and property inspection panel. Evaluated Tiptap v3 migration path.",
					},
					{
						label: "Observability strategy",
						description:
							"Planned ClickHouse-backed log ingestion replacing analytics event tracking with structured log schema and date formatting utilities.",
					},
				],
			},
			{
				category: "Design",
				items: [
					{
						label: "Template editor shell",
						description:
							"Three-column layout with configurable left/right/center headers, publish action bar, and spacing/alignment property panels.",
					},
					{
						label: "Contact presentation",
						description:
							"Initial avatars derived from name, hash icon (#) for IDs, reserved field indicators, and hard-delete confirmation dialogs.",
					},
					{
						label: "Add domain (split-screen redesign)",
						description:
							"Split-screen layout with real-time DNS preview, advanced settings collapsible section, auto-scroll and motion-based layout transitions.",
					},
					{
						label: "Logs UI",
						description:
							"List and detail views with navigation, calendar with month transition animations, and apply/reset filter controls.",
					},
				],
			},
			{
				category: "Frontend",
				items: [
					{
						label: "Template editor shell",
						description:
							"Three-column layout with left/right/center headers, publish actions, padding/margin/alignment controls, and inspector width constraints.",
					},
					{
						label: "Email inspector components",
						description:
							"Modular inspector panels for document, node, and text properties. @reloop/ui design system integration, breadcrumb component, SectionHeader layout grouping, and conditional node type pill rendering.",
					},
					{
						label: "Typography controls",
						description:
							"AlignControls and MarkControls as reusable components, list controls with blockquote toggle, code formatting, cyclic uppercase/lowercase controls, and fixed-height normalized button sizing.",
					},
					{
						label: "Contact presentation improvements",
						description:
							"Initial avatars, hash icon for IDs, reserved fields styling, hard-delete confirmation for contacts and properties.",
					},
					{
						label: "Add domain (redesign)",
						description:
							"Split-screen layout with auto-scrolling and motion-based transitions, real-time domain preview, advanced settings in collapsible accordion.",
					},
					{
						label: "Logs UI",
						description:
							"List + detail views with navigation; calendar component with month transitions and apply/reset filters.",
					},
				],
			},
			{
				category: "Backend",
				items: [
					{
						label: "Template routes",
						description:
							"Loading, editing, and saving templates; removed legacy Lexical editor implementation and migrated to Tiptap-based storage.",
					},
					{
						label: "Logs ingestion",
						description:
							"Structured log ingestion replacing analytics event tracking; listLogs and getLogById endpoints with ClickHouse backend.",
					},
					{
						label: "Domain DNS improvements",
						description:
							"Skip redundant verification when already in progress; custom receiving MX records; domain description copy updates.",
					},
					{
						label: "Collaboration backend",
						description:
							"Yjs room management with modular route handlers and controllers, WebSocket integration for real-time sync, and y-protocols dependency.",
					},
				],
			},
			{
				category: "DevOps",
				items: [
					{
						label: "ClickHouse provisioning",
						description:
							"Auto-provisioning and service wiring for log storage in docker-compose. ClickHouse schema validation with date formatting utilities.",
					},
					{
						label: "Package management",
						description:
							"Domain package renamed (domain → domain-dns → domain), tsconfig path aliases updated, deprecated @be/domain paths removed from Next.js config.",
					},
				],
			},
			{
				category: "Testing",
				items: [
					{
						label: "Collaboration sync validation",
						description:
							"Race condition fixes validated in collaboration hook state updates and synchronization logic across multiple test iterations.",
					},
				],
			},
		],
	},
	{
		date: "January 2026",
		version: "0.5.5",
		title: "API key polish, contacts migration & topic management",
		tags: [
			"API Keys",
			"Contacts",
			"Topics",
			"Properties",
			"Dashboard",
			"Settings",
		],
		sections: [
			{
				category: "Planning",
				items: [
					{
						label: "Contacts service migration",
						description:
							"Migrated audience module to a new dedicated contacts backend service with property management. Renamed Audience to Contact, AudienceTopic to Topic throughout the codebase.",
					},
					{
						label: "Topic enrollment model",
						description:
							"Designed auto-enroll and visibility options for topics with opt-in/opt-out semantics. Planned enrollment links on contact headers and topic action dropdowns.",
					},
				],
			},
			{
				category: "Design",
				items: [
					{
						label: "API key management redesign",
						description:
							"Redesigned empty state with animations, granular loading skeletons for header stats, creator information display, API details drawer with TabMenuHorizontal and CodeBlock, filter dropdowns by status and creator.",
					},
					{
						label: "Contact detail page",
						description:
							"Contact header component with property table, dedicated modals for editing, deletion with confirmation, and reserved field rendering with hash icon indicators.",
					},
					{
						label: "Topic management UI",
						description:
							"Create/edit modals with auto-enroll switch (checkedColor prop), visibility toggles, pro tip positioning, topic actions dropdown with centralized logic, and description display.",
					},
					{
						label: "Dashboard shell improvements",
						description:
							"Modularized sidebar with animated hover background, user menu with boring-avatars, organization switcher, feature cards on dashboard home, API key display with usage chart.",
					},
				],
			},
			{
				category: "Frontend",
				items: [
					{
						label: "API key management overhaul",
						description:
							"Enable/disable, edit (name only), and rotate functionalities with dedicated modals. Enforce copying before closing creation modal, post-deletion navigation, prefix label clarification, filter dropdown by status and creator.",
					},
					{
						label: "API key UI polish",
						description:
							"Creator information with tooltip, API details drawer with code blocks and copy functionality, ApiKeyActionsDropdown component, granular header stats skeletons, pagination controls, and animated empty states.",
					},
					{
						label: "Contact property management",
						description:
							"Property creation modal extraction, filter dropdown, loading skeletons with animations, relative time display, hard deletion with confirmation dialog, type selection, default values, and name validation.",
					},
					{
						label: "Contact editing flow",
						description:
							"Contact edit modal with Cmd/Ctrl+Enter submit, contact detail page with header component, view details from table dropdown, deletion confirmation modal, and row navigation.",
					},
					{
						label: "Topic management",
						description:
							"Topic creation with auto-enroll and visibility options, editing and deletion, enrollment management for contacts, topic actions dropdown with edit/delete/enrollment/visibility toggles, navigable topic links in contact header.",
					},
					{
						label: "Contacts & topics consolidation",
						description:
							"Topics integrated under contacts tabbed interface, dedicated topic pages (listing, adding, viewing), contact topic enrollment management, and pagination across all list views.",
					},
					{
						label: "Dashboard home page",
						description:
							"Feature cards for organization navigation, API key display with scraped pages chart (graph-up/graph-down icons), actual API key generation, and chart styling refinements.",
					},
					{
						label: "Settings improvements",
						description:
							"Feedback popover, spinner component replacing Icon loader, consolidated PageSizeDropdown, AnimatedBackButton with onClick prop, dark mode toast styling, and API details components for contacts/topics.",
					},
				],
			},
			{
				category: "Backend",
				items: [
					{
						label: "Contacts service",
						description:
							"Migrated audience module to new contacts backend. Contact creation stores userId, status standardized to lowercase, bulk import, topic subscription management (subscribe, unsubscribe, remove).",
					},
					{
						label: "Contact properties",
						description:
							"Property CRUD with name validation, hard deletion endpoint, secured delete, backend field name updates for consistency.",
					},
					{
						label: "Topic schema & API",
						description:
							"New topic and mapper tables replacing audience groups. Topic auto-enrollment and visibility fields, enrollment management with dedicated endpoint, soft-delete support, nullable description.",
					},
					{
						label: "API key enhancements",
						description:
							"Creator details in responses (user data fetch), removed userId from lookup queries, improved rotation flow, structured HTTP logging, and enhanced schema/authentication.",
					},
					{
						label: "Inngest integration",
						description:
							"Inngest Dev Server added to docker-compose with Caddyfile routing, database initialization script, workflow API routing configuration.",
					},
				],
			},
			{
				category: "DevOps",
				items: [
					{
						label: "Service configuration",
						description:
							"Inngest and Mailpit UI routing in Caddyfile, workflow API configuration, and database initialization scripts.",
					},
					{
						label: "Dashboard infrastructure",
						description:
							"Standardized spinner colors, input sizes across frontend, and dark mode styling for toast notifications.",
					},
				],
			},
			{
				category: "Testing",
				items: [
					{
						label: "API key flow validation",
						description:
							"Manual testing of key creation/rotation enforcement, modal behavior, and post-deletion navigation flows.",
					},
					{
						label: "Contact & topic integration",
						description:
							"Validated contact-topic enrollment, bulk import, pagination, and tabbed navigation across the contacts section.",
					},
				],
			},
		],
	},
	{
		date: "December 2025",
		version: "0.5.0",
		title: "Onboarding, dashboard home & contact-topic model",
		tags: [
			"Onboarding",
			"Dashboard",
			"Contacts",
			"Topics",
			"Settings",
			"Sidebar",
		],
		sections: [
			{
				category: "Planning",
				items: [
					{
						label: "Contact-topic data model",
						description:
							"Replaced audience groups with audience topics and mappers. Renamed Audience to Contact, AudienceTopic to Topic, and introduced Topic Subscription model with enrolled/unenrolled states.",
					},
					{
						label: "Onboarding flow design",
						description:
							"Multi-step onboarding: workspace creation → API key generation → domain setup → DNS configuration, with step indicators and animated transitions.",
					},
				],
			},
			{
				category: "Design",
				items: [
					{
						label: "Onboarding steps UI",
						description:
							"SplitLayout with SidebarPreview, Shiki CodeBlock for code snippets, dynamic logo theming, DNS record table customization (showPriorityColumn, nameColumnWidth), and animated icon transitions.",
					},
					{
						label: "Dashboard sidebar redesign",
						description:
							"Modularized with AnimatedHoverBackground, main navigation with animated hover states, user menu popover with boring-avatars, organization switcher with dropdown, and collapsible sidebar state.",
					},
					{
						label: "Settings UI updates",
						description:
							"Profile settings on appearance page, account settings page for user details, connected accounts component, OS-specific session icons with browser/device type display, sticky settings header.",
					},
				],
			},
			{
				category: "Frontend",
				items: [
					{
						label: "Onboarding steps",
						description:
							"CreateOrg with logo upload and slug validation, ApiPreview with language tabs, ConfigureDnsStep with dynamic DNS records fetch and verification, DomainPreview with logo prop, GenerateApiKeyStep with Go to Dashboard navigation.",
					},
					{
						label: "Dashboard home page",
						description:
							"Feature cards for navigation, API key display, scraped pages chart with 15-day mock data, graph-up/graph-down icons, and chart bar styling.",
					},
					{
						label: "Sidebar & navigation",
						description:
							"User menu popover (account settings, sign out), dynamic user navigation, Dropdown replaced with Tooltip for user email, organization switcher removed from collapsed state.",
					},
					{
						label: "Contact & topic management",
						description:
							"Tabbed navigation for contacts and topics, contact list with search, bulk import to topics, topic subscription management (subscribe, unsubscribe, remove), pagination across lists.",
					},
					{
						label: "Settings overhaul",
						description:
							"Profile and account settings, connected accounts, password change conditional on login method, session management with OS/browser/device icons, redesigned session UI with revocation actions, SWR data fetching with skeleton loaders, framer-motion animations.",
					},
					{
						label: "Team management",
						description:
							"Organization invitation email, role updates and member removal, team member search/filter, invite modal, consolidated team list, cross/link/user-role icons.",
					},
					{
						label: "Accept invitation page",
						description:
							"Frontend page for accepting organization invitations with Suspense/Spinner fallbacks and authentication check with redirect.",
					},
				],
			},
			{
				category: "Backend",
				items: [
					{
						label: "Contact-topic schema",
						description:
							"New topic and mapper tables with custom ID prefixes, topic subscription model, bulk contact import to topics, and bulk add contacts functionality.",
					},
					{
						label: "API key generation",
						description:
							"Actual key generation with enhanced display, strengthened schema and authentication, BETTER_AUTH_SECRET default value.",
					},
					{
						label: "Auth improvements",
						description:
							"Centralized auth config into auth.config.ts, removed serverTiming plugin, enhanced organization invite email logging, and invitation link generation with configurable default port.",
					},
					{
						label: "Onboarding content",
						description:
							"OnBoardingContent component with Suspense wrapper, authentication check with loading spinner, and redirect for unauthenticated users.",
					},
				],
			},
			{
				category: "DevOps",
				items: [
					{
						label: "Protected layout",
						description:
							"Generalized protected layout with simplified onboarding page, authentication checks, and Suspense boundaries.",
					},
					{
						label: "API key schema migration",
						description:
							"Refactored apikey schema to include organizationId with notNull constraints, removed separate export structure.",
					},
				],
			},
			{
				category: "Testing",
				items: [
					{
						label: "Onboarding flow validation",
						description:
							"End-to-end testing of workspace creation, API key generation, domain setup, and DNS verification steps.",
					},
					{
						label: "Session management tests",
						description:
							"Validated session revocation, connected accounts display, and OS-specific icon rendering.",
					},
				],
			},
		],
	},
	{
		date: "November 2025",
		version: "0.4.0",
		title: "SDK, DNS automation & marketing site",
		tags: ["SDK", "DNS", "Workflow", "Homepage", "Inngest", "Docker", "Cron"],
		sections: [
			{
				category: "Planning",
				items: [
					{
						label: "SDK architecture",
						description:
							"Designed Reloop Node.js SDK with email, domain, webhook, and audience services. TypeScript-first with comprehensive documentation and auto-publish workflow.",
					},
					{
						label: "Workflow service design",
						description:
							"Migrated Inngest crons to dedicated workflow service with domain verification retries, webhook cleanup, and health check schedules.",
					},
					{
						label: "Marketing site structure",
						description:
							"Planned homepage sections (Hero, Security, Scale, FAQ, UseCase, CTA), footer restructure, and contact page with form and content sections.",
					},
				],
			},
			{
				category: "Design",
				items: [
					{
						label: "Marketing homepage",
						description:
							"Hero section with early access CTA, Security compliance cards with icons, Scale component with email infrastructure statistics, FAQ accordion, and CTA blocks with engagement buttons.",
					},
					{
						label: "UseCase email cards",
						description:
							"TransactionalEmail component with framer-motion animated card transitions (rotation, scale effects), AutomatedWorkflowEmail with replay functionality, card-based email type showcase (Order Confirmation, Account Verification, Payment Receipt).",
					},
					{
						label: "Footer redesign",
						description:
							"Structured links for product, platform, company, and legal sections. Current year copyright, separator styling, and enhanced navigation accessibility.",
					},
					{
						label: "Contact page",
						description:
							"Contact form with content sections and introductory messaging. Updated layout and accessibility features.",
					},
				],
			},
			{
				category: "Frontend",
				items: [
					{
						label: "Homepage components",
						description:
							"Hero and Security sections, Scale statistics display, FAQ with unique accordion keys, UseCase email type cards, Company component, CTA engagement blocks.",
					},
					{
						label: "API key management UI",
						description:
							"Updated components for better accessibility, management table enhancements, and test send email page with validation and error handling.",
					},
					{
						label: "Footer & layout",
						description:
							"Restructured footer with product/platform/company/legal link groups, layout and spacing refinements, and separator additions.",
					},
					{
						label: "Domain DNS verification",
						description:
							"Enhanced domain validation regex, relative time formatting for creation dates, status icons and labels in DomainListSidebar, DomainSDK component for API button functionality.",
					},
				],
			},
			{
				category: "Backend",
				items: [
					{
						label: "Node.js SDK",
						description:
							"Reloop SDK with email, domain, webhook, and audience services. TypeScript support, npm package (reloop-email), GitHub Actions auto-publish workflow. Version bumps (1.0.1, 1.0.2) with API base URL updates.",
					},
					{
						label: "Email sending",
						description:
							"Enhanced email domain validation with organization ID and wildcard domain matching. Email logging refinements on failure handling.",
					},
					{
						label: "Cron jobs",
						description:
							"Active domain monitoring, DNS verification, domain verification, health checks, and webhook cleanup cron jobs implemented via Inngest.",
					},
					{
						label: "Inngest service",
						description:
							"Landing route with health check, dependencies for global and inngest-cli, service implementation in backend.",
					},
					{
						label: "Webhook service health",
						description:
							"Health check endpoints with database and Redis status reporting, ASCII art branding on landing route.",
					},
					{
						label: "Domain service refinements",
						description:
							"Caching mechanisms for domain and DNS operations, cache invalidation on create/delete/verify, sidebar and topbar components for domain addition, improved validation patterns.",
					},
				],
			},
			{
				category: "DevOps",
				items: [
					{
						label: "Docker infrastructure",
						description:
							"Dockerfiles for audience, inngest, tracehub, and webhook services. VPS deployment setup scripts for production environment.",
					},
					{
						label: "Docker CI workflows",
						description:
							"GitHub Actions workflows for automatic build and push of audience, inngest, tracehub, and webhook service containers.",
					},
					{
						label: "SDK publishing pipeline",
						description:
							"GitHub Actions workflow for automatic npm publishing of reloop-email package on version bumps.",
					},
					{
						label: "Environment configuration",
						description:
							"Global environment variables guide (env.global) for service configuration with security practices documentation.",
					},
					{
						label: "Documentation cleanup",
						description:
							"Removed frontend admin application files, updated import paths to @be/domain, standardized TypeScript configurations, removed reactCompiler option from Next.js config.",
					},
					{
						label: "Package script updates",
						description:
							"Replaced admin filters with docs filters, added tracehub filters for backend development, Postfix docker compose configuration.",
					},
				],
			},
			{
				category: "Testing",
				items: [
					{
						label: "Test send email page",
						description:
							"Dashboard page to send test emails with form validation, error handling, and user-friendly error messages.",
					},
					{
						label: "Service health monitoring",
						description:
							"Landing routes report Postgres, Redis, and per-service health status for webhook and Inngest services.",
					},
				],
			},
		],
		code: `npm install @reloop/sdk

import { Reloop } from '@reloop/sdk';
const client = new Reloop('rl_live_…');
await client.emails.send({ … });`,
	},
	{
		date: "October 2025",
		version: "0.3.0",
		title: "Domains, webhooks & audience",
		tags: ["Domains", "Webhooks", "Audience", "API", "DNS", "Microservices"],
		sections: [
			{
				category: "Planning",
				items: [
					{
						label: "Microservices architecture",
						description:
							"Domain, webhook, and audience services with reverse-proxy routing via Caddy and shared auth middleware. Custom ID prefixes (aud_, dom_, wh_) for cross-service entity identification.",
					},
					{
						label: "Marketing resources roadmap",
						description:
							"Planned changelog, self-hosting, system status, and SDK documentation pages on the web app.",
					},
					{
						label: "Domain lifecycle design",
						description:
							"Designed full domain lifecycle: add → DNS generate → verify → active, with DMARC/DKIM/SPF record management and Redis caching strategy.",
					},
				],
			},
			{
				category: "Design",
				items: [
					{
						label: "Domain dashboard",
						description:
							"Domain table with status badges (verified, pending, failed), DNS record table with copy-to-clipboard actions, skeleton loading states, and popover for domain actions.",
					},
					{
						label: "Webhook UI",
						description:
							"Webhook table, create modal with event icons and selection, delete confirmation by URL, keyboard shortcut indication on delete modal.",
					},
					{
						label: "Audience management",
						description:
							"Audience group layout with sidebar/topbar, edit modal with accessibility features, bulk import with react-dropzone file upload area, and import status display.",
					},
					{
						label: "Dashboard shell redesign",
						description:
							"Organization dropdown in sidebar and topbar, adaptive sidebar/topbar layout toggle with motion library animations, theme toggle functionality with layout-specific icons.",
					},
				],
			},
			{
				category: "Frontend",
				items: [
					{
						label: "Domain management",
						description:
							"Sidebar/topbar layout, add-domain flow with valibot validation, DMARC/DKIM/SPF record sections with copy functionality, delete modal with popover, search and status filters, error handling with SomethingWentWrong component.",
					},
					{
						label: "Domain detail page",
						description:
							"DNS records section, domain header with relative time, status banner with last updated time, loading skeletons, domain table with badges, and action buttons.",
					},
					{
						label: "Webhooks",
						description:
							"List sidebar with webhook table, create modal with event selection and router navigation, delivery logs view, event subscriptions, delete modal with confirmation by URL.",
					},
					{
						label: "Audience management (contacts precursor)",
						description:
							"Audience groups with CRUD, bulk CSV import with react-dropzone and validation, edit/delete group modals with confirmation input, copy audience ID, CSV download export.",
					},
					{
						label: "Dashboard shell",
						description:
							"Organization dropdown in sidebar/topbar with async handling, adaptive sidebar/topbar layout toggle, theme toggle with layout-specific icons.",
					},
					{
						label: "Web marketing pages",
						description:
							"SDK, API reference, campaigns, templates, validation, transactional email, changelog, self-hosting guide, and system status pages with comprehensive layouts and metadata.",
					},
				],
			},
			{
				category: "Backend",
				items: [
					{
						label: "Domain service",
						description:
							"Full CRUD, DNS generate/verify/delete, DKIM key generation, Redis caching with invalidation, OpenAPI via @elysiajs/openapi, organization-scoped operations, domain parameter validation.",
					},
					{
						label: "DNS service",
						description:
							"DNS record generation and insertion, verification with status tracking, DKIM key management, organization membership enforcement, dedicated routes and controllers.",
					},
					{
						label: "Domain schema evolution",
						description:
							"New attributes for DNS and verification status, database migration, status column added to domain_dns_record table, domain regex validation pattern.",
					},
					{
						label: "Webhook service",
						description:
							"Full CRUD, event subscriptions, webhook event seeding (db:seed), actual secret in responses, health checks with Postgres and Redis status.",
					},
					{
						label: "Audience service",
						description:
							"CRUD operations, bulk import, advanced search, port 3014, PostgreSQL + Redis integration, authentication middleware, audience group management with CRUD.",
					},
					{
						label: "Schemas & database",
						description:
							"Audience and webhook tables with custom ID prefixes (aud_, dom_, wh_), relations and enums, and centralized Drizzle schema updates.",
					},
					{
						label: "Service standardization",
						description:
							"Standardized error responses with structured message objects, consistent logger usage across services, auth middleware using API session fetching, CORS support in auth service.",
					},
				],
			},
			{
				category: "DevOps",
				items: [
					{
						label: "Observability stack",
						description:
							"ClickHouse, OpenTelemetry Collector, Grafana, and Loki added to docker-compose for distributed tracing and log aggregation.",
					},
					{
						label: "Logger package (@reloop/logger)",
						description:
							"Pino-based structured logging with pretty-printing in development. Adopted across domain and auth services with standardized error/info message patterns.",
					},
					{
						label: "SDK scaffolding",
						description:
							"Initial .NET, Go, Java, Node, PHP, Python, and Rust hello-world SDK folders with project configuration files.",
					},
					{
						label: "Reverse proxy configuration",
						description:
							"Audience and webhook API endpoints added to Caddyfile for service routing. Domain route versioning updates.",
					},
					{
						label: "Dependency updates",
						description:
							"Next.js upgraded to 16.0.0-beta.0 then canary.14, React 19.2.0, bun 1.3.0, form validation migrated from zod to valibot, babel-plugin-react-compiler added.",
					},
				],
			},
			{
				category: "Testing",
				items: [
					{
						label: "Service health checks",
						description:
							"Landing routes report Postgres, Redis, and per-service health for webhooks and audience services with detailed response messages.",
					},
					{
						label: "Domain service integration",
						description:
							"Health check endpoints for Domain Service, Redis, and Postgres with summaries and tags for monitoring.",
					},
				],
			},
		],
	},
	{
		date: "September 2025",
		version: "0.2.0",
		title: "Settings, appearance & security",
		tags: ["Settings", "Appearance", "Security", "Auth", "Theme"],
		sections: [
			{
				category: "Planning",
				items: [
					{
						label: "Settings architecture",
						description:
							"Designed settings section with sub-pages for appearance (theme, layout), security (password, sessions), and organization management (logo, name, slug, delete).",
					},
					{
						label: "Authentication flows",
						description:
							"Planned login, signup, password reset with email service integration, Google/GitHub OAuth, and error handling for existing accounts.",
					},
				],
			},
			{
				category: "Design",
				items: [
					{
						label: "Appearance settings",
						description:
							"Theme toggle with light/dark/system options and visual assets, layout toggle with sidebar and topbar icons, adaptive layout preview.",
					},
					{
						label: "Security settings",
						description:
							"Password change form, session management table with API integration, session device information display.",
					},
					{
						label: "Organization settings",
						description:
							"Logo upload preview, name and slug editing with validation, delete workspace with confirmation, and dynamic organization switcher.",
					},
					{
						label: "Dashboard layout",
						description:
							"Adaptive sidebar/topbar layout toggle, cleaned up sidebar with improved styles, removed footer from adaptive layout for streamlined component structure.",
					},
				],
			},
			{
				category: "Frontend",
				items: [
					{
						label: "Authentication pages",
						description:
							"Login and signup components with layout wrappers, routing to home page, and specific error handling for existing accounts.",
					},
					{
						label: "Appearance settings page",
						description:
							"Theme and layout customization options with visual preview assets, sidebar navigation integration, and motion library animations for layout toggle.",
					},
					{
						label: "Security settings page",
						description:
							"Password change component, session management with API integration, and session handling UI.",
					},
					{
						label: "Organization settings page",
						description:
							"Logo upload, name and slug editing, delete workspace functionality, and organization management features including domain and mailbox management.",
					},
					{
						label: "Dashboard adaptive layout",
						description:
							"Sidebar and topbar layout toggle, refined sub-navbar behavior with conditional rendering, cleaned up sidebar component.",
					},
					{
						label: "Landing pages",
						description:
							"Enhanced pages for About Us, Getting Started, Engineering, Product Beliefs, What We Stand For, Why Open Source, Why Reloop, Campaigns, Deliverability, and Community sections.",
					},
					{
						label: "Initial page scaffolding",
						description:
							"New pages for Contacts, API Keys, Webhooks, and Logs with sub-navbar integration and CreateOrganizationModal in org layout.",
					},
				],
			},
			{
				category: "Backend",
				items: [
					{
						label: "Password reset",
						description:
							"Implemented password reset functionality with email service integration, new file structure for reset flow, and enhanced user experience for account recovery.",
					},
					{
						label: "Auth improvements",
						description:
							"Authentication middleware integration into domain and validation routes, user context handling for domain operations, signup error handling for existing accounts.",
					},
					{
						label: "Docker image updates",
						description:
							"Updated PostgreSQL, Redis, and Caddy to latest stable versions in docker-compose.yml.",
					},
				],
			},
			{
				category: "DevOps",
				items: [
					{
						label: "Observability bootstrap",
						description:
							"Added ClickHouse, OpenTelemetry Collector, Grafana, and Loki services to docker-compose.yml. Removed deprecated env.local, README.md, and start.sh files.",
					},
					{
						label: "Container updates",
						description:
							"Updated Docker images to latest stable versions for PostgreSQL, Redis, and Caddy.",
					},
				],
			},
			{
				category: "Testing",
				items: [
					{
						label: "Auth flow validation",
						description:
							"Tested login, signup, password reset, and error handling flows including existing account detection and redirect behavior.",
					},
				],
			},
		],
	},
	{
		date: "September 2025",
		version: "0.1.0",
		title: "Open source foundation",
		tags: [
			"GitHub",
			"Auth",
			"API Keys",
			"Contacts",
			"DevOps",
			"Monorepo",
			"Email",
		],
		sections: [
			{
				category: "Planning",
				items: [
					{
						label: "Monorepo architecture",
						description:
							"Centralized Drizzle schema with @reloop/* packages and clear separation between web, dashboard, and backend services. Turborepo for build orchestration.",
					},
					{
						label: "Open source launch",
						description:
							"Public GitHub repository under Apache 2.0 with README, getting started guides, and API package for typed Elysia clients.",
					},
					{
						label: "Technology stack decisions",
						description:
							"Next.js for frontends, Elysia (Bun) for backend services, Drizzle ORM for database, Redis for caching/sessions, and Caddy as reverse proxy.",
					},
				],
			},
			{
				category: "Design",
				items: [
					{
						label: "Design system foundation",
						description:
							"@reloop/tailwind and @reloop/ui package integration; global styles, PostCSS configuration, icon component with consistent attribute naming.",
					},
					{
						label: "Landing content pages",
						description:
							"About, engineering, product beliefs, deliverability, community, and campaign narrative pages with content structure and visual hierarchy.",
					},
					{
						label: "Dashboard layout system",
						description:
							"Navbar with breadcrumb navigation, organization management sidebar with animations, and full-height page components.",
					},
				],
			},
			{
				category: "Frontend",
				items: [
					{
						label: "Dashboard application",
						description:
							"New Next.js dashboard with navbar, breadcrumbs, adaptive layout, organization-scoped routing, and loading state management.",
					},
					{
						label: "Authentication system",
						description:
							"Login, signup, password reset pages, Google/GitHub OAuth integration, appearance and security settings pages.",
					},
					{
						label: "Contacts & API keys pages",
						description:
							"Initial Contacts, API Keys, and Webhooks pages with CreateOrganizationModal in org layout.",
					},
					{
						label: "Domains & mailboxes",
						description:
							"Domain pages with DNS table and clipboard copy; mailbox list and AddNewMailboxModal with form validation.",
					},
					{
						label: "Team settings",
						description:
							"Invites UI, members table with @tanstack/react-table, Nuqs integration for URL state, Team section renamed from Members.",
					},
					{
						label: "Organization settings",
						description:
							"Logo upload with preview, name/slug editing, delete workspace with confirmation, dynamic org switcher in sidebar.",
					},
					{
						label: "Web landing pages",
						description:
							"Marketing site with landing page, footer with navigation links, and link-based routing using Next.js Link component.",
					},
				],
			},
			{
				category: "Backend",
				items: [
					{
						label: "Auth service",
						description:
							"better-auth with Redis sessions, organization invitations with role defaults, PG_URL environment variable standardization, logging configuration with enhanced timestamps.",
					},
					{
						label: "Database foundation",
						description:
							"Initial auth schema with Drizzle migrations, drizzle studio script for visual inspection, centralized schema exports from @reloop/db package.",
					},
					{
						label: "Domain & mail API",
						description:
							"Add domain endpoint, DKIM key generation, mail send router with request validation, and API route configuration in Caddyfile.",
					},
					{
						label: "Email templates package",
						description:
							"@reloop/emails package with transactional email templates (invitation, password reset), build pipeline, and logo assets.",
					},
					{
						label: "API package",
						description:
							"@reloop/api package for storing typed Elysia API clients with admin script commands and consistent package structure.",
					},
					{
						label: "Organization management",
						description:
							"Member invitation feature, organization member management, dependency updates, sidebar component enhancements with navigation and animations.",
					},
				],
			},
			{
				category: "DevOps",
				items: [
					{
						label: "One-command local setup",
						description:
							"Setup script plus docker-compose for PostgreSQL, Redis, Dovecot, Postfix, and Rspamd. Single command bootstraps the entire development stack.",
					},
					{
						label: "Local development environment",
						description:
							"Caddy reverse proxy with local.reloop.sh domain, environment templates, API routes in Caddyfile, firewall rules, SSL certificate configuration.",
					},
					{
						label: "CI foundations",
						description:
							"Backend workflow files, compose network fixes for reproducible local stacks, context path updates for Docker builds.",
					},
					{
						label: "Package infrastructure",
						description:
							"@reloop/tsconfig for shared TypeScript configuration, @reloop/tailwind for design tokens, refactored import paths across frontend applications.",
					},
					{
						label: "Monorepo tooling",
						description:
							"Turborepo configuration, bun workspaces, Biome for linting/formatting, Husky for git hooks, and package.json scripts for dev/build/lint.",
					},
				],
			},
			{
				category: "Testing",
				items: [
					{
						label: "Local development smoke test",
						description:
							"Documented local dev setup with Docker + Caddy for end-to-end auth and API verification. Manual testing path for signup → login → organization creation → domain setup.",
					},
				],
			},
		],
		code: `import { Reloop } from '@reloop/sdk';

const reloop = new Reloop('rl_live_…');
await reloop.emails.send({
  to: 'user@example.com',
  subject: 'Welcome',
  html: '<p>Hello from Reloop.</p>',
});`,
	},
];

export const changelogComingNext = [
	"Campaigns builder",
	"Broadcast email sending",
	"SDK GA across all languages",
	"Expanded deliverability tooling",
	"Community integrations marketplace",
	"Advanced analytics dashboard",
	"Custom SMTP relay configuration",
	"A/B testing for email templates",
];
],
			},
{
	category: "Testing", items;
	: [
		label: "API key flow validation", description;
	:
		"Manual testing of key creation/rotation enforcement, modal behavior, and post-deletion navigation flows.",
		,
		label: "Contact & topic integration", description;
	:
		"Validated contact-topic enrollment, bulk import, pagination, and tabbed navigation across the contacts section.",
		,
	],
}
,
		],
	},
{
	date: "December 2025", version;
	: "0.5.0",
		title: "Onboarding, dashboard home & contact-topic model",
			tags: [
				"Onboarding",
				"Dashboard",
				"Contacts",
				"Topics",
				"Settings",
				"Sidebar",
			],
				sections: [
					category: "Planning", items;
	: [
						label: "Contact-topic data model", description;
	:
						"Replaced audience groups with audience topics and mappers. Renamed Audience to Contact, AudienceTopic to Topic, and introduced Topic Subscription model with enrolled/unenrolled states.",
						,
						label: "Onboarding flow design", description;
	:
						"Multi-step onboarding: workspace creation → API key generation → domain setup → DNS configuration, with step indicators and animated transitions.",
						,
					],
					,
					category: "Design", items;
	: [
						label: "Onboarding steps UI", description;
	:
						"SplitLayout with SidebarPreview, Shiki CodeBlock for code snippets, dynamic logo theming, DNS record table customization (showPriorityColumn, nameColumnWidth), and animated icon transitions.",
						,
						label: "Dashboard sidebar redesign", description;
	:
						"Modularized with AnimatedHoverBackground, main navigation with animated hover states, user menu popover with boring-avatars, organization switcher with dropdown, and collapsible sidebar state.",
						,
						label: "Settings UI updates", description;
	:
						"Profile settings on appearance page, account settings page for user details, connected accounts component, OS-specific session icons with browser/device type display, sticky settings header.",
						,
					],
					,
					category: "Frontend", items;
	: [
						label: "Onboarding steps", description;
	:
						"CreateOrg with logo upload and slug validation, ApiPreview with language tabs, ConfigureDnsStep with dynamic DNS records fetch and verification, DomainPreview with logo prop, GenerateApiKeyStep with Go to Dashboard navigation.",
						,
						label: "Dashboard home page", description;
	:
						"Feature cards for navigation, API key display, scraped pages chart with 15-day mock data, graph-up/graph-down icons, and chart bar styling.",
						,
						label: "Sidebar & navigation", description;
	:
						"User menu popover (account settings, sign out), dynamic user navigation, Dropdown replaced with Tooltip for user email, organization switcher removed from collapsed state.",
						,
						label: "Contact & topic management", description;
	:
						"Tabbed navigation for contacts and topics, contact list with search, bulk import to topics, topic subscription management (subscribe, unsubscribe, remove), pagination across lists.",
						,
						label: "Settings overhaul", description;
	:
						"Profile and account settings, connected accounts, password change conditional on login method, session management with OS/browser/device icons, redesigned session UI with revocation actions, SWR data fetching with skeleton loaders, framer-motion animations.",
						,
						label: "Team management", description;
	:
						"Organization invitation email, role updates and member removal, team member search/filter, invite modal, consolidated team list, cross/link/user-role icons.",
						,
						label: "Accept invitation page", description;
	:
						"Frontend page for accepting organization invitations with Suspense/Spinner fallbacks and authentication check with redirect.",
						,
					],
					,
					category: "Backend", items;
	: [
						label: "Contact-topic schema", description;
	:
						"New topic and mapper tables with custom ID prefixes, topic subscription model, bulk contact import to topics, and bulk add contacts functionality.",
						,
						label: "API key generation", description;
	:
						"Actual key generation with enhanced display, strengthened schema and authentication, BETTER_AUTH_SECRET default value.",
						,
						label: "Auth improvements", description;
	:
						"Centralized auth config into auth.config.ts, removed serverTiming plugin, enhanced organization invite email logging, and invitation link generation with configurable default port.",
						,
						label: "Onboarding content", description;
	:
						"OnBoardingContent component with Suspense wrapper, authentication check with loading spinner, and redirect for unauthenticated users.",
						,
					],
					,
					category: "DevOps", items;
	: [
						label: "Protected layout", description;
	:
						"Generalized protected layout with simplified onboarding page, authentication checks, and Suspense boundaries.",
						,
						label: "API key schema migration", description;
	:
						"Refactored apikey schema to include organizationId with notNull constraints, removed separate export structure.",
						,
					],
					,
					category: "Testing", items;
	: [
						label: "Onboarding flow validation", description;
	:
						"End-to-end testing of workspace creation, API key generation, domain setup, and DNS verification steps.",
						,
						label: "Session management tests", description;
	:
						"Validated session revocation, connected accounts display, and OS-specific icon rendering.",
						,
					],
					,
				],
}
,
{
	date: "November 2025",
		version: "0.4.0",
			title: "SDK, DNS automation & marketing site",
				tags: [
					"SDK",
					"DNS",
					"Workflow",
					"Homepage",
					"Inngest",
					"Docker",
					"Cron",
				],
					sections: [
						category: "Planning",
						items: [
							label: "SDK architecture",
							description:
							"Designed Reloop Node.js SDK with email, domain, webhook, and audience services. TypeScript-first with comprehensive documentation and auto-publish workflow.", ,
							label: "Workflow service design",
							description:
							"Migrated Inngest crons to dedicated workflow service with domain verification retries, webhook cleanup, and health check schedules.", ,
							label: "Marketing site structure",
							description:
							"Planned homepage sections (Hero, Security, Scale, FAQ, UseCase, CTA), footer restructure, and contact page with form and content sections.", ,
						], ,
						category: "Design",
						items: [
							label: "Marketing homepage",
							description:
							"Hero section with early access CTA, Security compliance cards with icons, Scale component with email infrastructure statistics, FAQ accordion, and CTA blocks with engagement buttons.", ,
							label: "UseCase email cards",
							description:
							"TransactionalEmail component with framer-motion animated card transitions (rotation, scale effects), AutomatedWorkflowEmail with replay functionality, card-based email type showcase (Order Confirmation, Account Verification, Payment Receipt).", ,
							label: "Footer redesign",
							description:
							"Structured links for product, platform, company, and legal sections. Current year copyright, separator styling, and enhanced navigation accessibility.", ,
							label: "Contact page",
							description:
							"Contact form with content sections and introductory messaging. Updated layout and accessibility features.", ,
						], ,
						category: "Frontend",
						items: [
							label: "Homepage components",
							description:
							"Hero and Security sections, Scale statistics display, FAQ with unique accordion keys, UseCase email type cards, Company component, CTA engagement blocks.", ,
							label: "API key management UI",
							description:
							"Updated components for better accessibility, management table enhancements, and test send email page with validation and error handling.", ,
							label: "Footer & layout",
							description:
							"Restructured footer with product/platform/company/legal link groups, layout and spacing refinements, and separator additions.", ,
							label: "Domain DNS verification",
							description:
							"Enhanced domain validation regex, relative time formatting for creation dates, status icons and labels in DomainListSidebar, DomainSDK component for API button functionality.", ,
						], ,
						category: "Backend",
						items: [
							label: "Node.js SDK",
							description:
							"Reloop SDK with email, domain, webhook, and audience services. TypeScript support, npm package (reloop-email), GitHub Actions auto-publish workflow. Version bumps (1.0.1, 1.0.2) with API base URL updates.", ,
							label: "Email sending",
							description:
							"Enhanced email domain validation with organization ID and wildcard domain matching. Email logging refinements on failure handling.", ,
							label: "Cron jobs",
							description:
							"Active domain monitoring, DNS verification, domain verification, health checks, and webhook cleanup cron jobs implemented via Inngest.", ,
							label: "Inngest service",
							description:
							"Landing route with health check, dependencies for global and inngest-cli, service implementation in backend.", ,
							label: "Webhook service health",
							description:
							"Health check endpoints with database and Redis status reporting, ASCII art branding on landing route.", ,
							label: "Domain service refinements",
							description:
							"Caching mechanisms for domain and DNS operations, cache invalidation on create/delete/verify, sidebar and topbar components for domain addition, improved validation patterns.", ,
						], ,
						category: "DevOps",
						items: [
							label: "Docker infrastructure",
							description:
							"Dockerfiles for audience, inngest, tracehub, and webhook services. VPS deployment setup scripts for production environment.", ,
							label: "Docker CI workflows",
							description:
							"GitHub Actions workflows for automatic build and push of audience, inngest, tracehub, and webhook service containers.", ,
							label: "SDK publishing pipeline",
							description:
							"GitHub Actions workflow for automatic npm publishing of reloop-email package on version bumps.", ,
							label: "Environment configuration",
							description:
							"Global environment variables guide (env.global) for service configuration with security practices documentation.", ,
							label: "Documentation cleanup",
							description:
							"Removed frontend admin application files, updated import paths to @be/domain, standardized TypeScript configurations, removed reactCompiler option from Next.js config.", ,
							label: "Package script updates",
							description:
							"Replaced admin filters with docs filters, added tracehub filters for backend development, Postfix docker compose configuration.", ,
						], ,
						category: "Testing",
						items: [
							label: "Test send email page",
							description:
							"Dashboard page to send test emails with form validation, error handling, and user-friendly error messages.", ,
							label: "Service health monitoring",
							description:
							"Landing routes report Postgres, Redis, and per-service health status for webhook and Inngest services.", ,
						], ,
					],
						code: `npm install @reloop/sdk

import { Reloop } from '@reloop/sdk';
const client = new Reloop('rl_live_…');
await client.emails.send({ … });`,
	},
{
	date: "October 2025",
		version: "0.3.0",
			title: "Domains, webhooks & audience",
				tags: [
					"Domains",
					"Webhooks",
					"Audience",
					"API",
					"DNS",
					"Microservices",
				],
					sections: [
						{
							category: "Planning",
							items: [
								{
									label: "Microservices architecture",
									description:
										"Domain, webhook, and audience services with reverse-proxy routing via Caddy and shared auth middleware. Custom ID prefixes (aud_, dom_, wh_) for cross-service entity identification.",
								},
								{
									label: "Marketing resources roadmap",
									description:
										"Planned changelog, self-hosting, system status, and SDK documentation pages on the web app.",
								},
								{
									label: "Domain lifecycle design",
									description:
										"Designed full domain lifecycle: add → DNS generate → verify → active, with DMARC/DKIM/SPF record management and Redis caching strategy.",
								},
							],
						},
						{
							category: "Design",
							items: [
								{
									label: "Domain dashboard",
									description:
										"Domain table with status badges (verified, pending, failed), DNS record table with copy-to-clipboard actions, skeleton loading states, and popover for domain actions.",
								},
								{
									label: "Webhook UI",
									description:
										"Webhook table, create modal with event icons and selection, delete confirmation by URL, keyboard shortcut indication on delete modal.",
								},
								{
									label: "Audience management",
									description:
										"Audience group layout with sidebar/topbar, edit modal with accessibility features, bulk import with react-dropzone file upload area, and import status display.",
								},
								{
									label: "Dashboard shell redesign",
									description:
										"Organization dropdown in sidebar and topbar, adaptive sidebar/topbar layout toggle with motion library animations, theme toggle functionality with layout-specific icons.",
								},
							],
						},
						{
							category: "Frontend",
							items: [
								{
									label: "Domain management",
									description:
										"Sidebar/topbar layout, add-domain flow with valibot validation, DMARC/DKIM/SPF record sections with copy functionality, delete modal with popover, search and status filters, error handling with SomethingWentWrong component.",
								},
								{
									label: "Domain detail page",
									description:
										"DNS records section, domain header with relative time, status banner with last updated time, loading skeletons, domain table with badges, and action buttons.",
								},
								{
									label: "Webhooks",
									description:
										"List sidebar with webhook table, create modal with event selection and router navigation, delivery logs view, event subscriptions, delete modal with confirmation by URL.",
								},
								{
									label: "Audience management (contacts precursor)",
									description:
										"Audience groups with CRUD, bulk CSV import with react-dropzone and validation, edit/delete group modals with confirmation input, copy audience ID, CSV download export.",
								},
								{
									label: "Dashboard shell",
									description:
										"Organization dropdown in sidebar/topbar with async handling, adaptive sidebar/topbar layout toggle, theme toggle with layout-specific icons.",
								},
								{
									label: "Web marketing pages",
									description:
										"SDK, API reference, campaigns, templates, validation, transactional email, changelog, self-hosting guide, and system status pages with comprehensive layouts and metadata.",
								},
							],
						},
						{
							category: "Backend",
							items: [
								{
									label: "Domain service",
									description:
										"Full CRUD, DNS generate/verify/delete, DKIM key generation, Redis caching with invalidation, OpenAPI via @elysiajs/openapi, organization-scoped operations, domain parameter validation.",
								},
								{
									label: "DNS service",
									description:
										"DNS record generation and insertion, verification with status tracking, DKIM key management, organization membership enforcement, dedicated routes and controllers.",
								},
								{
									label: "Domain schema evolution",
									description:
										"New attributes for DNS and verification status, database migration, status column added to domain_dns_record table, domain regex validation pattern.",
								},
								{
									label: "Webhook service",
									description:
										"Full CRUD, event subscriptions, webhook event seeding (db:seed), actual secret in responses, health checks with Postgres and Redis status.",
								},
								{
									label: "Audience service",
									description:
										"CRUD operations, bulk import, advanced search, port 3014, PostgreSQL + Redis integration, authentication middleware, audience group management with CRUD.",
								},
								{
									label: "Schemas & database",
									description:
										"Audience and webhook tables with custom ID prefixes (aud_, dom_, wh_), relations and enums, and centralized Drizzle schema updates.",
								},
								{
									label: "Service standardization",
									description:
										"Standardized error responses with structured message objects, consistent logger usage across services, auth middleware using API session fetching, CORS support in auth service.",
								},
							],
						},
						{
							category: "DevOps",
							items: [
								{
									label: "Observability stack",
									description:
										"ClickHouse, OpenTelemetry Collector, Grafana, and Loki added to docker-compose for distributed tracing and log aggregation.",
								},
								{
									label: "Logger package (@reloop/logger)",
									description:
										"Pino-based structured logging with pretty-printing in development. Adopted across domain and auth services with standardized error/info message patterns.",
								},
								{
									label: "SDK scaffolding",
									description:
										"Initial .NET, Go, Java, Node, PHP, Python, and Rust hello-world SDK folders with project configuration files.",
								},
								{
									label: "Reverse proxy configuration",
									description:
										"Audience and webhook API endpoints added to Caddyfile for service routing. Domain route versioning updates.",
								},
								{
									label: "Dependency updates",
									description:
										"Next.js upgraded to 16.0.0-beta.0 then canary.14, React 19.2.0, bun 1.3.0, form validation migrated from zod to valibot, babel-plugin-react-compiler added.",
								},
							],
						},
						{
							category: "Testing",
							items: [
								{
									label: "Service health checks",
									description:
										"Landing routes report Postgres, Redis, and per-service health for webhooks and audience services with detailed response messages.",
								},
								{
									label: "Domain service integration",
									description:
										"Health check endpoints for Domain Service, Redis, and Postgres with summaries and tags for monitoring.",
								},
							],
						},
					],
	},
{
	date: "September 2025",
		version: "0.2.0",
			title: "Settings, appearance & security",
				tags: ["Settings", "Appearance", "Security", "Auth", "Theme"],
					sections: [
						{
							category: "Planning",
							items: [
								{
									label: "Settings architecture",
									description:
										"Designed settings section with sub-pages for appearance (theme, layout), security (password, sessions), and organization management (logo, name, slug, delete).",
								},
								{
									label: "Authentication flows",
									description:
										"Planned login, signup, password reset with email service integration, Google/GitHub OAuth, and error handling for existing accounts.",
								},
							],
						},
						{
							category: "Design",
							items: [
								{
									label: "Appearance settings",
									description:
										"Theme toggle with light/dark/system options and visual assets, layout toggle with sidebar and topbar icons, adaptive layout preview.",
								},
								{
									label: "Security settings",
									description:
										"Password change form, session management table with API integration, session device information display.",
								},
								{
									label: "Organization settings",
									description:
										"Logo upload preview, name and slug editing with validation, delete workspace with confirmation, and dynamic organization switcher.",
								},
								{
									label: "Dashboard layout",
									description:
										"Adaptive sidebar/topbar layout toggle, cleaned up sidebar with improved styles, removed footer from adaptive layout for streamlined component structure.",
								},
							],
						},
						{
							category: "Frontend",
							items: [
								{
									label: "Authentication pages",
									description:
										"Login and signup components with layout wrappers, routing to home page, and specific error handling for existing accounts.",
								},
								{
									label: "Appearance settings page",
									description:
										"Theme and layout customization options with visual preview assets, sidebar navigation integration, and motion library animations for layout toggle.",
								},
								{
									label: "Security settings page",
									description:
										"Password change component, session management with API integration, and session handling UI.",
								},
								{
									label: "Organization settings page",
									description:
										"Logo upload, name and slug editing, delete workspace functionality, and organization management features including domain and mailbox management.",
								},
								{
									label: "Dashboard adaptive layout",
									description:
										"Sidebar and topbar layout toggle, refined sub-navbar behavior with conditional rendering, cleaned up sidebar component.",
								},
								{
									label: "Landing pages",
									description:
										"Enhanced pages for About Us, Getting Started, Engineering, Product Beliefs, What We Stand For, Why Open Source, Why Reloop, Campaigns, Deliverability, and Community sections.",
								},
								{
									label: "Initial page scaffolding",
									description:
										"New pages for Contacts, API Keys, Webhooks, and Logs with sub-navbar integration and CreateOrganizationModal in org layout.",
								},
							],
						},
						{
							category: "Backend",
							items: [
								{
									label: "Password reset",
									description:
										"Implemented password reset functionality with email service integration, new file structure for reset flow, and enhanced user experience for account recovery.",
								},
								{
									label: "Auth improvements",
									description:
										"Authentication middleware integration into domain and validation routes, user context handling for domain operations, signup error handling for existing accounts.",
								},
								{
									label: "Docker image updates",
									description:
										"Updated PostgreSQL, Redis, and Caddy to latest stable versions in docker-compose.yml.",
								},
							],
						},
						{
							category: "DevOps",
							items: [
								{
									label: "Observability bootstrap",
									description:
										"Added ClickHouse, OpenTelemetry Collector, Grafana, and Loki services to docker-compose.yml. Removed deprecated env.local, README.md, and start.sh files.",
								},
								{
									label: "Container updates",
									description:
										"Updated Docker images to latest stable versions for PostgreSQL, Redis, and Caddy.",
								},
							],
						},
						{
							category: "Testing",
							items: [
								{
									label: "Auth flow validation",
									description:
										"Tested login, signup, password reset, and error handling flows including existing account detection and redirect behavior.",
								},
							],
						},
					],
	},
{
	date: "September 2025",
		version: "0.1.0",
			title: "Open source foundation",
				tags: [
					"GitHub",
					"Auth",
					"API Keys",
					"Contacts",
					"DevOps",
					"Monorepo",
					"Email",
				],
					sections: [
						{
							category: "Planning",
							items: [
								{
									label: "Monorepo architecture",
									description:
										"Centralized Drizzle schema with @reloop/* packages and clear separation between web, dashboard, and backend services. Turborepo for build orchestration.",
								},
								{
									label: "Open source launch",
									description:
										"Public GitHub repository under Apache 2.0 with README, getting started guides, and API package for typed Elysia clients.",
								},
								{
									label: "Technology stack decisions",
									description:
										"Next.js for frontends, Elysia (Bun) for backend services, Drizzle ORM for database, Redis for caching/sessions, and Caddy as reverse proxy.",
								},
							],
						},
						{
							category: "Design",
							items: [
								{
									label: "Design system foundation",
									description:
										"@reloop/tailwind and @reloop/ui package integration; global styles, PostCSS configuration, icon component with consistent attribute naming.",
								},
								{
									label: "Landing content pages",
									description:
										"About, engineering, product beliefs, deliverability, community, and campaign narrative pages with content structure and visual hierarchy.",
								},
								{
									label: "Dashboard layout system",
									description:
										"Navbar with breadcrumb navigation, organization management sidebar with animations, and full-height page components.",
								},
							],
						},
						{
							category: "Frontend",
							items: [
								{
									label: "Dashboard application",
									description:
										"New Next.js dashboard with navbar, breadcrumbs, adaptive layout, organization-scoped routing, and loading state management.",
								},
								{
									label: "Authentication system",
									description:
										"Login, signup, password reset pages, Google/GitHub OAuth integration, appearance and security settings pages.",
								},
								{
									label: "Contacts & API keys pages",
									description:
										"Initial Contacts, API Keys, and Webhooks pages with CreateOrganizationModal in org layout.",
								},
								{
									label: "Domains & mailboxes",
									description:
										"Domain pages with DNS table and clipboard copy; mailbox list and AddNewMailboxModal with form validation.",
								},
								{
									label: "Team settings",
									description:
										"Invites UI, members table with @tanstack/react-table, Nuqs integration for URL state, Team section renamed from Members.",
								},
								{
									label: "Organization settings",
									description:
										"Logo upload with preview, name/slug editing, delete workspace with confirmation, dynamic org switcher in sidebar.",
								},
								{
									label: "Web landing pages",
									description:
										"Marketing site with landing page, footer with navigation links, and link-based routing using Next.js Link component.",
								},
							],
						},
						{
							category: "Backend",
							items: [
								{
									label: "Auth service",
									description:
										"better-auth with Redis sessions, organization invitations with role defaults, PG_URL environment variable standardization, logging configuration with enhanced timestamps.",
								},
								{
									label: "Database foundation",
									description:
										"Initial auth schema with Drizzle migrations, drizzle studio script for visual inspection, centralized schema exports from @reloop/db package.",
								},
								{
									label: "Domain & mail API",
									description:
										"Add domain endpoint, DKIM key generation, mail send router with request validation, and API route configuration in Caddyfile.",
								},
								{
									label: "Email templates package",
									description:
										"@reloop/emails package with transactional email templates (invitation, password reset), build pipeline, and logo assets.",
								},
								{
									label: "API package",
									description:
										"@reloop/api package for storing typed Elysia API clients with admin script commands and consistent package structure.",
								},
								{
									label: "Organization management",
									description:
										"Member invitation feature, organization member management, dependency updates, sidebar component enhancements with navigation and animations.",
								},
							],
						},
						{
							category: "DevOps",
							items: [
								{
									label: "One-command local setup",
									description:
										"Setup script plus docker-compose for PostgreSQL, Redis, Dovecot, Postfix, and Rspamd. Single command bootstraps the entire development stack.",
								},
								{
									label: "Local development environment",
									description:
										"Caddy reverse proxy with local.reloop.sh domain, environment templates, API routes in Caddyfile, firewall rules, SSL certificate configuration.",
								},
								{
									label: "CI foundations",
									description:
										"Backend workflow files, compose network fixes for reproducible local stacks, context path updates for Docker builds.",
								},
								{
									label: "Package infrastructure",
									description:
										"@reloop/tsconfig for shared TypeScript configuration, @reloop/tailwind for design tokens, refactored import paths across frontend applications.",
								},
								{
									label: "Monorepo tooling",
									description:
										"Turborepo configuration, bun workspaces, Biome for linting/formatting, Husky for git hooks, and package.json scripts for dev/build/lint.",
								},
							],
						},
						{
							category: "Testing",
							items: [
								{
									label: "Local development smoke test",
									description:
										"Documented local dev setup with Docker + Caddy for end-to-end auth and API verification. Manual testing path for signup → login → organization creation → domain setup.",
								},
							],
						},
					],
						code: `import { Reloop } from '@reloop/sdk';

const reloop = new Reloop('rl_live_…');
await reloop.emails.send({
  to: 'user@example.com',
  subject: 'Welcome',
  html: '<p>Hello from Reloop.</p>',
});`,
	},
];

export const changelogComingNext = [
	"Campaigns builder",
	"Broadcast email sending",
	"SDK GA across all languages",
	"Expanded deliverability tooling",
	"Community integrations marketplace",
	"Advanced analytics dashboard",
	"Custom SMTP relay configuration",
	"A/B testing for email templates",
];
