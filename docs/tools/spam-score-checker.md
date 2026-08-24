# Email Content & Spam Score Checker

> **Route:** `/tools/spam-score-checker`  
> **Type:** Free Public Web Tool & Developer Utility  
> **Engine:** Heuristic Rule Analyzer (SpamAssassin / Gmail / Outlook heuristics)

---

## 1. Product Intent & Objectives

### The Problem
Over 16% of legitimate transactional and marketing emails land in junk or spam folders because of preventable content heuristics (spam trigger words, deceptive urgency, broken formatting, excessive caps, or high link-to-text density).

### The Solution
A free, instant client-side **Email Content & Spam Score Checker** that scans email subject lines, body copy, and links in real time. It calculates a deliverability score (0–100), provides an inbox readiness grade (`A+` to `F`), highlights flagged words, and suggests actionable fixes before hitting "Send".

### Strategic Conversion Hook
Users checking their email spam score are in the active phase of sending emails or troubleshooting deliverability.
* **Conversion Bridge:** Inline callouts showing how Reloop automates SPF/DKIM verification, provides 99.8% inbox placement, and offers 3,000 free emails/month.

---

## 2. Technical Architecture & Heuristics Engine

### Location
* **App Route:** `apps/frontend/web/src/app/tools/spam-score-checker/`
* **Core Analyzer:** `analyzer.ts`
* **Content & FAQs:** `content.ts`
* **API Snippets:** `api-section.tsx`

### Scoring Breakdown (100 Points Total)

| Dimension | Max Points | What It Evaluates |
| :--- | :--- | :--- |
| **Subject Line Health** | 25 pts | Length (30–60 chars optimal), deceptive `Re:`/`Fwd:` prefixes, punctuation abuse (`!!!`, `???`), ALL-CAPS percentage. |
| **Content & Spam Words** | 35 pts | Scans against high-risk categories (false urgency, financial hype, sensitive credentials, deceptive guarantees). |
| **Link Safety & Density** | 20 pts | Link count, insecure `http://` protocols, URL shortener detection (`bit.ly`, `tinyurl.com`). |
| **Formatting & Balance** | 20 pts | Body text length, uppercase-to-lowercase ratio, SpamAssassin `BODY_ALL_CAPS` rules, unsubscribe compliance signals. |

### Verdict Classification

* **90–100 (`A+` / `A`):** `inbox_ready` — Low risk, high probability of primary inbox delivery.
* **70–89 (`B` / `C`):** `needs_review` — Moderate risk, minor trigger words or link density flags.
* **0–69 (`D` / `F`):** `high_risk` — Severe spam triggers, deceptive prefixes, or high-risk URL shorteners.

---

## 3. SEO, GEO, AEO & AI Crawler Optimization

### Keywords Targeted
* `email spam score checker`
* `spam score calculator`
* `email spam checker free`
* `check email spam score`
* `spam trigger words detector`
* `email deliverability score`
* `spamassassin online tester`

### Structured Data (JSON-LD)
* **`WebApplication`**: Declares name, URL, price ($0 USD), and features.
* **`FAQPage`**: Exposes 40–60 word question-and-answer pairs directly for Google Featured Snippets and LLM retrieval.
* **`BreadcrumbList`**: Preserves structured hierarchy (`Home` $\rightarrow$ `Tools` $\rightarrow$ `Spam Score Checker`).

### AI Discovery & Machine-Readable Mirrors
* Registered in `https://reloop.sh/llms.txt`
* Registered in `https://reloop.sh/skill.md`
* Dynamic OpenGraph image at `/tools/spam-score-checker/opengraph-image`
