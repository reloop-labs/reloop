# Changelog

All notable changes to Reloop are documented here. For the full interactive changelog with code samples and visuals, visit [reloop.sh/changelog](https://reloop.sh/changelog).

This file follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions. Releases are grouped chronologically.

---

## [0.56.0] — 19 August 2026

**Minimal Shipping Log UI & Homepage Refresh**

Streamlined the homepage changelog timeline into a clean, minimal row layout with direct release links.

### Design
- Streamlined homepage changelog into a clean, minimal row layout with direct release navigation.
- Calendar-to-arrow hover transitions for quick release discovery.
- Standardized typography and spacing tokens across marketing sections.

---

## [0.55.0] — 14 August 2026

**Revamped Marketing & Email Analytics Scenes**

Refactored preview stages across marketing emails, templates, and delivery analytics with theme-aware styling.

### Design
- Refactored preview scenes for Transactional, Marketing Emails, Templates, and Analytics.
- Added theme-aware styling tokens and responsive layout scaling.
- Standardized SceneHeader badges across all home sections.

---

## [0.54.0] — 6 August 2026

**Convictions Feature Cards with Micro-UIs**

Redesigned feature overview cards with centered, compact micro-UI animations and live GitHub stars.

### Design
- Redesigned convictions value cards with centered, compact micro-UI animations.
- Added live GitHub star counter badge with dynamic repository fetch.
- Cleaned up inline icon alignment beside card titles.

---

## [0.53.0] — 29 July 2026

**Interactive Email System Preview Stage**

Interactive tabs on the homepage for testing Transactional, Marketing, Templates, and Webhooks live.

### Frontend
- Interactive preview tabs for live testing of email delivery pipelines.
- Dynamic simulated payload generation and transmission animation.

---

## [0.52.0] — 21 July 2026

**Language Explorer & Dynamic OpenGraph Engine**

Interactive multi-language code tabs on the marketing site with automated branded OG preview images.

### Frontend
- Interactive multi-language code explorer for Node.js, Python, Go, PHP, Ruby, and Rust.
- Automated dynamic OpenGraph image generation per page and release.

---

## [0.51.0] — 13 July 2026

**Credits & Billing Management System**

Usage tracking, credit top-ups, and subscription tier management in settings (apps/backend/credits).

### Backend
- Built usage tracking, credit top-ups, and subscription tier management.
- Organization billing history and downloadable invoice summaries.

---

## [0.50.0] — 5 July 2026

**Webhook Domain-Level Filtering**

Configure webhook subscriptions to only listen to events originating from specific sending domains.

### Backend
- Domain-scoped webhook subscriptions to isolate production and staging traffic.
- Selective delivery event filtering for granular integration endpoints.

---

## [0.49.0] — 27 June 2026

**OpenClaw Workflow Integration Guide**

Step-by-step connector to route emails directly between Reloop inboxes and OpenClaw autonomous agents.

### AI
- Step-by-step connector for routing inbound messages to autonomous agents.
- Automated agent reply dispatch using verified sender domains.

---

## [0.48.0] — 19 June 2026

**Mailing & Broadcast Infrastructure**

Built the mailing service (apps/backend/mailing) to handle scheduled broadcast deliveries to contact lists.

### Infrastructure
- High-capacity mailing service handling scheduled broadcast deliveries.
- Automated recipient batch chunking and suppression deduplication.

---

## [0.47.0] — 11 June 2026

**Standardized llms.txt and skill.md Public Endpoints**

Added structured documentation endpoints so external AI assistants can discover Reloop capabilities.

### AI
- Standardized llms.txt and skill.md endpoints for AI agent discoverability.
- Machine-readable API reference and usage guides.

---

## [0.46.0] — 3 June 2026

**Copy-Prompt Setup Guides for AI Coding Agents**

One-click setup prompts for Cursor, Claude Code, and Windsurf to automatically configure Reloop integrations.

### AI
- One-click setup prompts for Cursor, Claude Code, and Windsurf.
- Automatic SDK installation and environment variable configuration.

---

## [0.45.0] — 30 May 2026

**AI Email Template Generator**

Generate production-ready React email templates directly from natural language prompts.

### AI
- Natural language prompt to clean React email templates.
- Interactive visual preview and code refinement in the dashboard editor.

---

## [0.44.0] — 22 May 2026

**Automation Workflows Engine (Beta)**

Event-driven workflow system (apps/backend/workflow) to trigger automated emails based on custom user events.

### Backend
- Event-driven workflow triggers based on custom application events.
- Visual workflow node canvas and condition branching.

---

## [0.43.0] — 14 May 2026

**Agent Email Drafting & Review Workflow**

Configurable review flow: agent drafts remain in a pending queue until approved by a team member.

### AI
- Human-in-the-loop review queue for AI-drafted responses.
- One-click approval, inline editing, and automated dispatch.

---

## [0.42.0] — 10 May 2026

**Reloop MCP Server (reloop-agent-inbox)**

Official Model Context Protocol server exposing send_email, read_inbox, and reply_to_email tools to Claude and AI agents.

### AI
- Model Context Protocol (MCP) server integration.
- Tools exposed: send_email, read_inbox, get_thread, and reply_to_email.

---

## [0.41.0] — 2 May 2026

**Agent Email Inboxes**

Dedicated mailboxes designed specifically for AI agents to autonomously receive, triage, and reply to messages.

### AI
- Dedicated mailboxes created for autonomous AI agents.
- Full MIME body parsing and attachment extraction into structured JSON.

---

## [0.40.0] — 24 April 2026

**Activity & Security Audit Logs**

Track team actions (key creation, domain updates, template changes) in organization settings.

### Backend
- Audit log table tracking all security-sensitive workspace actions.
- Actor attribution, timestamping, and IP logging.

---

## [0.39.0] — 21 April 2026

**Team Management & Role-Based Permissions**

Invite team members to your organization with Admin, Developer, and Viewer access control.

### Frontend
- Role-based access control with Admin, Developer, and Viewer tiers.
- Team invitation links with expiration and status indicators.

---

## [0.38.0] — 13 April 2026

**Multi-Stage Dockerfile Optimizations**

Optimized Docker builds across all backend services, cutting image sizes by over 60% and speeding up deploy times.

### DevOps
- Multi-stage Docker builds reducing production image sizes by 60%.
- Optimized layer caching for faster CI/CD pipelines.

---

## [0.37.0] — 9 April 2026

**Independent GitHub Actions CI/CD for All 22 Services**

Created separate CI/CD workflows (be-*.yml, fe-*.yml) so each backend service and frontend app builds independently.

### DevOps
- 22 independent GitHub Actions workflows for microservices.
- Parallel builds and isolated automated test suites.

---

## [0.36.0] — 1 April 2026

**Direct Email Reply from Dashboard**

Reply to incoming threads directly from the dashboard inbox using verified custom domain addresses.

### Frontend
- Dashboard reply composer with markdown support.
- Direct dispatch using verified custom domain senders.

---

## [0.35.0] — 28 March 2026

**Shared Inbox & Email Thread History**

Built the Inbox dashboard to view incoming emails, complete conversation threads, and message history.

### Frontend
- Unified inbox view with searchable conversation threads.
- Thread timeline displaying full back-and-forth email history.

---

## [0.34.0] — 20 March 2026

**Recipient Email Validation Package (@reloop/email-validation)**

Created shared validation package checking email RFC syntax, disposable domains, and MX records.

### Feature
- RFC 5322 syntax validation and disposable domain filtering.
- Real-time MX record lookups and domain health checks.

---

## [0.33.0] — 12 March 2026

**Deliverability Trend Charts & Custom Date Filters**

Interactive line charts tracking delivery volume and engagement over 24h, 7d, 30d, and custom date ranges.

### Design
- Interactive delivery charts with 24h, 7d, and 30d presets.
- Custom date range selector and hover tooltips with rate breakdowns.

---

## [0.32.0] — 8 March 2026

**Deliverability & Reputation Metrics Dashboard**

Added the Metrics page with delivery rates, bounce rates, spam complaint rates, and health ratings.

### Feature
- Dedicated deliverability dashboard with health ratings.
- Real-time tracking of bounce, complaint, and delivery rates.

---

## [0.31.0] — 28 February 2026

**Template Version History & Rollbacks**

Track template revisions with visual side-by-side diffs and instant one-click rollback.

### Feature
- Template revision history with visual side-by-side diffs.
- One-click version restore and rollback capability.

---

## [0.30.0] — 20 February 2026

**Template Test Send Modal**

Send live preview emails with mock variable data directly from the template builder.

### Frontend
- Instant test sending with mock variable substitution.
- Direct delivery verification in personal inbox.

---

## [0.29.0] — 17 February 2026

**Dynamic Variables & Handlebars Syntax**

Added variable injection {{name}}, conditional blocks {{#if}}, and loops {{#each}}.

### Feature
- Handlebars dynamic templating support ({{name}}, {{#if}}, {{#each}}).
- Real-time variable parsing and fallback default values.

---

## [0.28.0] — 13 February 2026

**Visual Email Template Designer**

Added side-by-side code editor and responsive live preview canvas in the Templates dashboard.

### Feature
- Split-screen template editor with live responsive preview.
- Dark/light canvas toggle and instant HTML rendering.

---

## [0.27.0] — 5 February 2026

**React Email Integration**

Support for @react-email/components allowing developers to build transactional emails using React.

### Frontend
- Support for @react-email/components across transactional templates.
- Automatic JSX-to-HTML rendering with inlined CSS.

---

## [0.26.0] — 28 January 2026

**Verified Code Samples for PHP, Ruby, and Rust**

Added drop-in code samples and integration tests for PHP (Laravel), Ruby on Rails, and Rust.

### Docs
- Verified drop-in code snippets for PHP (Laravel), Ruby on Rails, and Rust.
- Automated integration tests verifying payload delivery.

---

## [0.25.0] — 24 January 2026

**Official Go SDK (reloop-go)**

Published idiomatic Go client library with zero-allocation JSON streaming and context cancellation.

### Feature
- Idiomatic Go client package published on GitHub.
- Zero-allocation streaming and full Context support.

---

## [0.24.0] — 16 January 2026

**Official Python SDK (reloop-python)**

Published Python client package supporting both sync and asyncio for FastAPI, Django, and Flask.

### Feature
- Published reloop-python package on PyPI.
- Supports both synchronous and asyncio dispatch modes.

---

## [0.23.0] — 8 January 2026

**SDK Quickstart Snippets in Dashboard**

Interactive copy-ready code snippets in Node.js, Python, Go, and cURL inside the API keys page.

### Frontend
- Interactive code snippet drawer inside API keys page.
- Copy-ready code blocks in Node.js, Python, Go, and cURL.

---

## [0.22.0] — 4 January 2026

**Official Node.js & TypeScript SDK**

Published @reloop/email on npm with full TypeScript definitions, auto-retry logic, and batch sending.

### Feature
- Published @reloop/email on npm.
- Full TypeScript definitions, exponential backoff retries, and batch sending.

---

## [0.21.0] — 17 December 2025

**Shared UI Component Package (@reloop/ui)**

Extracted buttons, modals, dropdowns, inputs, and icons into a centralized package used across all frontend apps.

### Design
- Extracted buttons, modals, dropdowns, and icons into @reloop/ui.
- Standardized design tokens across web, dashboard, and docs.

---

## [0.20.0] — 14 December 2025

**Biome Linter & Fast Monorepo Tooling**

Replaced legacy ESLint/Prettier with Biome across all apps and packages for sub-50ms formatting and lint checks.

### DevOps
- Replaced ESLint and Prettier with Biome across the entire monorepo.
- Sub-50ms linting and formatting execution in CI/CD.

---

## [0.19.0] — 6 December 2025

**Webhook Retry Engine & Test Delivery Tool**

Automatic exponential backoff retries for failed webhook deliveries and a Send Test Event tool in settings.

### Feature
- Exponential backoff retry schedule for unacknowledged webhooks.
- One-click 'Send Test Event' modal in dashboard settings.

---

## [0.18.0] — 2 December 2025

**Real-Time Webhook Engine with Signature Verification**

Deliver webhook events (delivered, opened, clicked, bounced) with cryptographic signature headers.

### Backend
- Dispatches real-time events: delivered, opened, clicked, bounced.
- HMAC-SHA256 signature verification headers on every payload.

---

## [0.17.0] — 24 November 2025

**Attachment Upload & S3 Storage Service**

Built dedicated upload microservice (apps/backend/upload) to store email attachments with presigned URLs.

### Infrastructure
- Dedicated upload service (apps/backend/upload) with S3 compatibility.
- Presigned upload URLs and secure attachment stream delivery.

---

## [0.16.0] — 16 November 2025

**Inbound MIME Parser to Structured JSON**

Incoming messages are automatically parsed from raw MIME into clean JSON (apps/backend/inbound).

### Backend
- Automatic MIME parser extracting text, HTML, and attachment buffers.
- Converts complex multipart emails into structured JSON objects.

---

## [0.15.0] — 12 November 2025

**Inbound Email Ingestion via MX Routing**

Configure MX records to receive incoming emails directly at your custom domain.

### Infrastructure
- MX record ingestion routing incoming emails to backend parsers.
- Automated validation for custom domain MX configuration.

---

## [0.14.0] — 4 November 2025

**Subscription Topics & Preference Pages**

Configurable subscription topics (Newsletter, Billing, Product Updates) for recipient preference management.

### Feature
- Configurable subscription topics (Newsletter, Billing, Product Updates).
- Hosted preference center allowing recipients to manage topics.

---

## [0.13.0] — 1 November 2025

**Inngest Background Job & Event Bus Architecture**

Integrated Inngest (packages/inngest) to handle delayed sends, batch processing, and async worker queues.

### Infrastructure
- Integrated Inngest (packages/inngest) for background job scheduling.
- Handles delayed email sends, batch dispatches, and async queue workers.

---

## [0.12.0] — 23 October 2025

**Contact Groups & Filtered Lists**

Organize contacts into static groups and saved filter lists (packages/db/src/schema/group.ts).

### Feature
- Static contact groups and saved filter views.
- Targeted audience selection for scheduled broadcast messages.

---

## [0.11.0] — 19 October 2025

**Custom Contact Properties & Metadata**

Define custom schema attributes and key-value metadata on contact profiles for targeted messaging.

### Feature
- Arbitrary key-value metadata schema for contact profiles.
- Inject custom properties directly into dynamic email templates.

---

## [0.10.0] — 11 October 2025

**Bulk CSV Contact Import & Export**

Upload contact lists from CSV files with column mapping and duplicate detection.

### Frontend
- CSV import flow with column mapping and duplicate detection.
- One-click audience CSV export with custom property fields.

---

## [0.9.0] — 7 October 2025

**Contacts & Audience Management**

Created audience models (packages/db/src/schema/contact.ts) and dashboard interface for managing subscribers.

### Feature
- Contact database schema (packages/db/src/schema/contact.ts).
- Searchable audience directory with subscriber status filters.

---

## [0.8.0] — 29 September 2025

**Suppression List Management UI**

Dashboard page to view, search, add, and remove suppressed email addresses.

### Frontend
- Dedicated dashboard table for searching suppressed addresses.
- Manual suppression addition and removal with audit history.

---

## [0.7.0] — 26 September 2025

**Automated Suppression Service**

Background suppression engine (apps/backend/spam) that automatically filters hard bounces and spam complaints.

### Infrastructure
- Automated suppression filtering (apps/backend/spam).
- Protects sender reputation by suppressing hard bounces and spam complaints.

---

## [0.6.0] — 18 September 2025

**Raw MIME Header Viewer**

Inspect raw message headers and SMTP transaction responses directly from the email log drawer.

### Frontend
- Raw MIME header inspector drawer in the dashboard.
- Full SMTP server transaction logs and response codes.

---

## [0.5.0] — 15 September 2025

**Outbound Email Logs & Transmission Inspector**

Added the Emails dashboard to inspect every sent message, delivery timestamp, recipient, and HTTP status.

### Feature
- Outbound email logs tracking transmission timestamps, recipients, and status.
- Filter emails by status, date range, and recipient address.

---

## [0.4.0] — 7 September 2025

**Scoped API Keys & Environment Management**

Generate environment-scoped API keys (rl_live_, rl_test_) with granular permissions and instant revocation.

### Security
- Environment-scoped API keys (rl_live_ and rl_test_).
- Granular capability scopes and instant key revocation.

---

## [0.3.0] — 4 September 2025

**Migration to Drizzle ORM & PostgreSQL**

Replaced raw SQL queries with type-safe Drizzle ORM schemas (packages/db) and automated migrations.

### Infrastructure
- Full database migration to Drizzle ORM schemas in packages/db.
- Automated SQL migration generation and type-safe database queries.

---

## [0.2.5] — 26 August 2025

**DNS Record Status Badges & Quick Copy**

Visual status chips (Verified / Pending) with one-click DNS record copying in the domain settings tab.

### Frontend
- Visual status chips (Verified / Pending) in domain settings.
- One-click DNS record copying for faster domain setup.

---

## [0.2.0] — 23 August 2025

**Domain DNS Verification Engine (SPF, DKIM, DMARC)**

Automated DNS record verification with setup guides for Cloudflare, Route 53, and GoDaddy.

### Infrastructure
- Automated DNS verification engine checking SPF, DKIM, and DMARC.
- Step-by-step setup guides for Cloudflare, AWS Route 53, and GoDaddy.

---

## [0.1.5] — 15 August 2025

**Dashboard "Send Test Email" Tool**

Added an instant test-send modal in the SMTP settings tab to verify credentials without writing code.

### Frontend
- Send test email modal in SMTP settings tab.
- Verify SMTP gateway credentials and inbox delivery in seconds.

---

## [0.1.0] — 12 August 2025

**KumoMTA Engine & High-Performance SMTP Gateway**

Integrated KumoMTA as our core mail transfer agent for high-throughput SMTP processing on ports 587 and 465.

### Infrastructure
- Integrated KumoMTA as the core Mail Transfer Agent (MTA).
- High-throughput SMTP processing on ports 587 and 465 with TLS support.

---

## [0.0.5] — 4 August 2025

**System-Aware Dark & Light Mode**

Added system theme detection and manual toggle across all web apps and dashboard pages.

### Design
- System theme detection and smooth dark/light mode toggle.
- Tailwind design tokens shared across all frontend applications.

---

## [0.0.1] — 1 August 2025

**Initial Release of Reloop**

Open-source launch of the Reloop repository with Bun workspace monorepo and core email pipelines.

### Infrastructure
- Initial open-source release of Reloop repository.
- Bun workspace monorepo structure and foundational email pipelines.

---
