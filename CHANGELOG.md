# Changelog

All notable changes to Reloop are documented here. For the full interactive changelog with code samples and visuals, visit [reloop.sh/changelog](https://reloop.sh/changelog).

This file follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions. Releases are grouped by engineering area: **Planning**, **Design**, **Frontend**, **Backend**, and **DevOps**.

---

## [0.9.0] — June 2026

**Agent inbox, workflows & marketing site**

Inbound agent inbox APIs, a workflow editor prototype, Chatwoot live chat, and a redesigned marketing site with SEO and licensing pages.

### Planning
- Defined mailbox, thread, and message models with JetStream-backed inbound processing for agent workflows
- Standardised product pages (developers, marketing teams, AI agents) and structured SEO/sitemap/robots.txt/JSON-LD strategy
- Migrated from MIT to Apache 2.0 with custom restrictions; defined self-hosting requirements and licensing FAQ
- Chatwoot widget integration plan for marketing site and dashboard with user identification

### Design
- New release timeline layout for changelog with version badges, date columns, tags, and categorised sections
- Redesigned SMTP landing with interactive sandbox and animated CopyCodeBlock tabs
- Streamlined contact and license pages; Apache 2.0 permission bento grid
- Light/dark theme provider with UI toggle; hero decorative underlines with primary color transitions

### Frontend
- Agent inbox dashboard: list/create mailboxes, list messages, read/unread toggle, and message deletion
- Visual workflow editor with trigger nodes and local browser persistence (prototype)
- CodeMirror template editor with xcodeDark theme, variable suggestion dropdown, and deliverability score panel
- Template version save and restore in editor sidebar
- Product pages for developers, marketing teams, and AI agents; JSON-LD, robots.txt, and sitemap
- Chatwoot live chat on marketing site and dashboard; user identification and logout reset

### Backend
- New `inbox` service (port 8021): mailbox/thread/message CRUD, S3 attachment retrieval, organisation-scoped auth
- KumoMTA inbound JetStream initialisation and inbound email subscriber for inbox threading
- S3 client with nested config, path-style env support, and health route connectivity check
- Elysia OpenTelemetry plugin integration; removed Bull Board and legacy tracking routes

### DevOps
- GitHub Actions workflow to build and publish the inbox service Docker image
- Expanded SMTP listeners: submission, SMTPS, and port 2025 via Docker and Lua config
- Status page URL updates and codebase-wide format pass

---

## [0.8.0] — May 2026

**Templates, webhooks & deliverability**

Collaborative template editing, webhook delivery and retries, custom tracking domains, and deliverability charts in the dashboard.

### Planning
- Mapped `EMAIL_SENT` and `KUMOMTA_EVENT` bus messages to webhook subscribers for full lifecycle coverage
- Designed custom tracking domains with per-domain TLS and base64url token signing
- Designed real-time collaborative editing using Yjs with WebSocket/WebRTC providers and awareness-based cursors

### Design
- Template editor UX overhaul: toolbar, side panels for variables and deliverability, animated EmailInspector
- Custom inspector UI primitives with property rows, breadcrumb navigation, and react-colorful color picker
- Email timeline with failure steps, error classification panel, skeleton loaders, and lifecycle stepper
- Multi-select deliverability charts with complaints line chart and 14-day default date range

### Frontend
- Template variables with typed defaults, slash-command insertion, and Valibot validation
- Reply-To toggle, test email warnings, recent send history, and variable inputs for test sends
- Real-time cursor tracking with perfect-cursors interpolation and Yjs awareness for collaborative editing
- Webhooks dashboard: categorised event selector, manual retry, secret rotation, masked secrets
- Contact activity timeline with email and event history on contact detail page
- Domain settings: tracking subdomain, TLS mode, sending/receiving toggles, verification polling, auto-configure DNS

### Backend
- Template engine: automated variable extraction on create/update; Redis-backed Yjs collaborative state
- Webhook delivery: background delivery logic, delivery attempt tracking, test event trigger, retry endpoint
- Base64url token signing in Lua; custom tracking domains; click redirect via `Location` header
- Dynamic date bucketing, domain-scoped email statistics, and calendar max-range validation
- Centralized evlog logging across api-key, domain, contact, group, property, and topic operations

### DevOps
- OpenTelemetry OTLP logging rolled across all microservices
- KumoMTA: trusted HTTP hosts via env vars; local service with Mailpit routing and SMTP auth
- Email confirmation template with rendered react-email component

---

## [0.7.0] — April 2026

**Contacts, topics & API platform**

Contacts, groups, topics, and API keys as first-class primitives with expanded OpenAPI coverage and public documentation.

### Planning
- Contacts, groups, properties, and topics as first-class CRM primitives with full OpenAPI coverage
- Token-based subscription management for end-user preference centers
- Removed v1 prefix from endpoints; standardised contact identification by email

### Design
- Step cards with connectors, NumberFlow step indicator, and animated breadcrumbs for onboarding
- Contact and group modals with infinite scroll multi-select and keyboard shortcuts (⌘+Enter, Esc)
- Sticky glassmorphism header with mega menu and Framer Motion animations

### Frontend
- Collapsible contacts sub-nav, property modals, suppression banner, and summary stats cards
- Full CRUD for groups with dashboard pages and group contact listing
- Topic CRUD, opt_in/opt_out enrollments, and card-based channel list with subscriber preview
- API keys: Shiki-highlighted keys, optimistic toggles, docs drawer with CodeBlock, `a` hotkey
- Command menu with recent items and ⌘1–9 keyboard navigation
- Docs site: AI-powered search and chat, OG image generation, automated OpenAPI reference, fumadocs

### Backend
- Contacts API: full CRUD, bulk creation, transactional property updates with replacement mode
- API key service: cookie + API key auth, trace IDs, OpenAPI security scheme, list/detail endpoints
- NATS event logging for all API key CRUD operations
- Domain: nameserver lookup, sending/receiving toggles, custom return path, tracking domain support
- ClickHouse log ingestion: `listLogs` and `getLogById` endpoints; daily cleanup cron

### DevOps
- ClickHouse auto-provisioning in docker-compose; Redis-backed auth for log API
- GitHub Actions CI for API key service Docker image
- Consistent README structure across all backend services

---

## [0.6.0] — March 2026

**Template editor & observability**

A visual template editor, ClickHouse-backed logs, domain settings improvements, and editor observability tooling.

### Planning
- Three-column editor layout with left/right/center header areas, publish workflow, and property inspection
- ClickHouse-backed log ingestion replacing analytics event tracking

### Design
- Three-column template editor shell with configurable headers, publish action bar, and spacing controls
- Contact presentation: initial avatars, hash icon for IDs, reserved field indicators
- Add domain split-screen redesign with real-time DNS preview and motion-based transitions
- Logs UI with list/detail views, calendar with month transition animations, and apply/reset filters

### Frontend
- Template editor shell with left/right/center headers, publish actions, and alignment controls
- Modular inspector panels for document, node, and text properties
- AlignControls and MarkControls as reusable components; list controls with blockquote toggle
- Logs list and detail views with navigation; calendar component with month transitions

### Backend
- Template routes for loading, editing, and saving; migrated from Lexical to Tiptap-based storage
- Structured log ingestion with `listLogs` and `getLogById` endpoints (ClickHouse backend)
- Domain DNS: skip redundant verification when in progress; custom receiving MX records
- Yjs room management with modular route handlers and WebSocket integration for real-time sync

### DevOps
- ClickHouse auto-provisioning for log storage in docker-compose
- Domain package renamed; tsconfig path aliases updated

---

## [0.5.5] — January 2026

**API key polish, contacts migration & topic management**

API key UX refinements, migration to the contacts service, and topic enrollment management across the dashboard.

### Planning
- Migrated audience module to a new dedicated contacts backend service; renamed Audience → Contact
- Topic auto-enroll and visibility options with opt-in/opt-out semantics

### Design
- API key management redesign: animated empty state, granular loading skeletons, creator information, filter dropdowns
- Contact detail page with property table and dedicated edit/delete modals
- Topic create/edit modals with auto-enroll switch, visibility toggles, and actions dropdown

### Frontend
- API key enable/disable, edit, and rotate with dedicated modals; copy-before-close enforcement
- Contact property creation modal, filter dropdown, relative time display, and hard deletion with confirmation
- Contact edit modal with Cmd+Enter submit and row navigation
- Topic creation, editing, deletion, and enrollment management; navigable topic links in contact header

### Backend
- Contacts service: creation stores userId, status in lowercase, bulk import, topic subscription management
- Property CRUD with name validation and hard deletion endpoint
- New topic and mapper tables with auto-enrollment and visibility fields; soft-delete support
- API key enhancements: creator details in responses, improved rotation flow, structured HTTP logging

### DevOps
- Mailpit UI routing in Caddyfile
- Standardised spinner colors, input sizes, and dark mode toast styling

---

## [0.5.0] — December 2025

**Onboarding, dashboard home & contact-topic model**

A guided onboarding flow, a new dashboard home, and the contact-topic subscription model for audience management.

### Planning
- Contact-topic data model: replaced audience groups with topics and mappers; enrolled/unenrolled subscription states
- Multi-step onboarding: workspace → API key → domain → DNS, with step indicators and transitions

### Design
- Onboarding: SplitLayout with SidebarPreview, Shiki CodeBlock, dynamic logo theming, DNS record table
- Dashboard sidebar redesign with AnimatedHoverBackground, user menu popover, and org switcher
- Profile and account settings on appearance page; session management with OS/browser/device icons

### Frontend
- CreateOrg with logo upload, ApiPreview with language tabs, ConfigureDnsStep with verification
- Dashboard home: feature cards, API key display, and 15-day chart
- User menu popover (account settings, sign out) and dynamic user navigation
- Contact and topic management: tabbed navigation, bulk import to topics, enrollment with subscribe/unsubscribe
- Team management: invitation email, role updates, member removal, search/filter, invite modal
- Accept invitation page with Suspense/Spinner fallbacks and authentication redirect

### Backend
- New topic and mapper tables with custom ID prefixes; bulk contact import to topics
- API key generation: actual key generation, enhanced display, strengthened schema and auth
- Centralised auth config into `auth.config.ts`; invitation link generation with configurable default port

### DevOps
- Generalised protected layout with simplified onboarding page and Suspense boundaries
- Refactored apikey schema to include `organizationId` with `notNull` constraint

---

## [0.4.0] — November 2025

**SDK, DNS automation & marketing site**

The Reloop Node.js SDK, automated DNS verification, scheduled workflow jobs, and the first marketing homepage.

### Planning
- Designed Reloop Node.js SDK with email, domain, webhook, and audience services
- Scheduled domain verification retries, webhook cleanup, and health checks in the workflow service
- Planned homepage sections: Hero, Security, Scale, FAQ, UseCase, CTA

### Design
- Marketing homepage: Hero with early access CTA, Security compliance cards, Scale statistics, FAQ accordion
- TransactionalEmail animated card transitions with Framer Motion; AutomatedWorkflowEmail with replay
- Structured footer with product/platform/company/legal link groups
- Contact page with form, content sections, and accessibility features

### Frontend
- Homepage Hero, Security, Scale, FAQ, UseCase, and CTA components
- Enhanced domain validation regex; status icons and labels in DomainListSidebar
- Restructured footer; layout and spacing refinements
- API key management table enhancements with validation and error handling

### Backend
- Reloop Node.js SDK (`reloop-email`): email, domain, webhook, and audience services; TypeScript support
- Email domain validation with organisation ID and wildcard domain matching
- Domain monitoring, DNS verification, health checks, and webhook cleanup via workflow service
- Domain service: caching mechanisms with invalidation on create/delete/verify

### DevOps
- Dockerfiles for auth, contacts, domain, webhook, and workflow services
- GitHub Actions for automatic Docker image build/push and npm SDK publishing
- Global environment variables guide (`env.global`)

---

## [0.3.0] — October 2025

**Domains, webhooks & audience**

Domain verification, webhook delivery, audience groups, and the first wave of backend microservices.

### Planning
- Domain, webhook, and audience services with Caddy reverse-proxy routing and shared auth middleware
- Full domain lifecycle: add → DNS generate → verify → active, with DMARC/DKIM/SPF record management
- Custom ID prefixes (`aud_`, `dom_`, `wh_`) for cross-service entity identification

### Design
- Domain table with status badges, DNS record table with copy-to-clipboard, and skeleton loading states
- Webhook table, create modal with event icons, and delete confirmation by URL
- Audience group layout with sidebar/topbar, edit modal, and bulk CSV import with react-dropzone
- Adaptive sidebar/topbar layout toggle with Framer Motion animations

### Frontend
- Domain management: add-domain flow, DMARC/DKIM/SPF sections with copy, search and status filters
- Domain detail page: DNS records, status banner with last updated time, skeleton loading
- Webhooks: list sidebar, create modal with event selection, delivery logs, event subscriptions
- Audience CRUD with bulk CSV import, copy audience ID, and CSV export
- Web marketing pages: SDK, API reference, campaigns, templates, changelog, self-hosting, system status

### Backend
- Domain service: full CRUD, DNS generate/verify/delete, DKIM key generation, Redis caching, OpenAPI
- DNS service: record generation and insertion, verification with status tracking
- Webhook service: full CRUD, event subscriptions, seeding, health checks with Postgres and Redis status
- Audience service: CRUD, bulk import, advanced search, authentication middleware, group management
- Standardised error responses, consistent logger usage, and CORS support in auth service

### DevOps
- ClickHouse, OpenTelemetry Collector, Grafana, and Loki added to docker-compose
- `@reloop/logger` package (Pino-based) with pretty-printing in development
- Audience and webhook API endpoints added to Caddyfile for service routing
- Next.js upgraded to 16.0.0; React 19.2.0; form validation migrated from zod to valibot

---

## [0.2.0] — September 2025

**Settings, appearance & security**

Workspace settings, light and dark themes, session management, and security improvements across the dashboard.

### Planning
- Settings section with sub-pages for appearance, security, and organisation management
- Login, signup, password reset with email service integration, Google/GitHub OAuth

### Design
- Appearance settings: theme toggle (light/dark/system) with visual assets and layout preview
- Security settings: password change form and session management table
- Organisation settings: logo upload, name/slug editing, delete workspace with confirmation
- Adaptive sidebar/topbar layout toggle with Framer Motion animations

### Frontend
- Login and signup components with layout wrappers and error handling for existing accounts
- Appearance, security, and organisation settings pages
- Password change, session management with API integration, and session device information
- Adaptive sidebar/topbar layout toggle; refined sub-navbar with conditional rendering
- Landing content pages: About, Getting Started, Engineering, Product Beliefs, Why Open Source, Campaigns

### Backend
- Password reset with email service integration
- Auth middleware integration into domain and validation routes
- Updated Docker images: PostgreSQL, Redis, and Caddy to latest stable versions

### DevOps
- ClickHouse, OpenTelemetry Collector, Grafana, and Loki added to docker-compose
- Removed deprecated env.local and legacy files

---

## [0.1.0] — September 2025

**Open source foundation**

The open-source monorepo launch with authentication, API keys, contacts, and Docker-based local development.

### Planning
- Centralised Drizzle schema with `@reloop/*` packages; separation between web, dashboard, and backend services
- Public GitHub repository under Apache 2.0 with README and getting started guides
- Technology stack decisions: Next.js, Elysia (Bun), Drizzle ORM, Redis, Caddy

### Design
- `@reloop/tailwind` and `@reloop/ui` package integration; global styles and PostCSS configuration
- Landing content pages: About, Engineering, Product Beliefs, Deliverability, Community, Campaigns
- Dashboard layout: navbar with breadcrumbs, org management sidebar with animations

### Frontend
- Next.js dashboard with navbar, breadcrumbs, adaptive layout, and organisation-scoped routing
- Login, signup, and password reset pages; Google/GitHub OAuth
- Initial Contacts, API Keys, Webhooks, and Logs pages
- Domain pages with DNS table and clipboard copy; mailbox list and AddNewMailboxModal
- Team settings: invites UI, members table with @tanstack/react-table, Nuqs URL state
- Marketing site with landing page and footer navigation

### Backend
- Auth service: better-auth with Redis sessions, organisation invitations, PG_URL standardisation
- Initial auth schema with Drizzle migrations and `@reloop/db` package exports
- Add domain endpoint, DKIM key generation, mail send router, and API route config in Caddyfile
- `@reloop/emails` package with transactional templates (invitation, password reset)
- `@reloop/api` package for typed Elysia API clients

### DevOps
- One-command local setup: script + docker-compose for PostgreSQL, Redis, Dovecot, Postfix, Rspamd
- Caddy reverse proxy with `local.reloop.sh` domain; SSL certificate configuration
- Turborepo configuration, bun workspaces, Biome for linting/formatting, Husky for git hooks
- `@reloop/tsconfig` for shared TypeScript configuration

---

For the full visual changelog with code samples visit **[reloop.sh/changelog](https://reloop.sh/changelog)**.
