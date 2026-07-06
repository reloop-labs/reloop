"use client";

import * as Button from "@reloop/ui/button";
import type { FeatureCtaBand } from "@reloop/web/components/landing/types";
import {
	FeatureCta,
	MarketingPageShell,
	PageSection,
} from "@reloop/web/components/page-shell";
import type { GlossaryTermDefinition } from "@reloop/web/lib/landing/types";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";

export function GlossaryTermPage({
	term,
	cta,
}: {
	term: GlossaryTermDefinition;
	cta: FeatureCtaBand;
}) {
	return (
		<MarketingPageShell
			titleLines={[term.title]}
			description={term.description}
			compactHero
			primaryCta={{ label: "Get started", href: "/get-started" }}
			secondaryCta={
				term.relatedFeatureHref
					? { label: "Related feature", href: term.relatedFeatureHref }
					: { label: "Full glossary", href: "/resources/glossary" }
			}
		>
			<PageSection flushTop narrow>
				<article className="prose prose-neutral dark:prose-invert max-w-none">
					<p className="text-[17px] text-text-sub-600 leading-8 dark:text-white/60">
						{term.body}
					</p>
				</article>

				{term.relatedTerms && term.relatedTerms.length > 0 && (
					<div className="mt-12">
						<h2 className="mb-4 font-semibold text-lg text-text-strong-950 dark:text-white">
							Related terms
						</h2>
						<div className="flex flex-wrap gap-3">
							{term.relatedTerms.map((related) => (
								<Link
									key={related.slug}
									href={`/glossary/${related.slug}`}
									className="rounded-full border border-stroke-soft-200 px-4 py-2 text-sm text-text-sub-600 transition-colors hover:border-primary-base hover:text-primary-base dark:border-white/10"
								>
									{related.title}
								</Link>
							))}
						</div>
					</div>
				)}
			</PageSection>
			<FeatureCta {...cta} />
		</MarketingPageShell>
	);
}

export function BlogPostPage({
	post,
	cta,
}: {
	post: {
		title: string;
		description: string;
		publishedAt: string;
		tag: string;
		readTime: string;
		sections: { heading?: string; paragraphs: string[] }[];
	};
	cta: FeatureCtaBand;
}) {
	return (
		<MarketingPageShell
			titleLines={[post.title]}
			description={post.description}
			compactHero
		>
			<PageSection flushTop narrow>
				<div className="mb-10 flex flex-wrap items-center gap-3 text-[13px] text-text-sub-600 dark:text-white/40">
					<span className="font-semibold text-primary-base uppercase tracking-wider">
						{post.tag}
					</span>
					<span>·</span>
					<time dateTime={post.publishedAt}>
						{new Date(post.publishedAt).toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</time>
					<span>·</span>
					<span>{post.readTime}</span>
				</div>

				<article className="space-y-8">
					{post.sections.map((section) => (
						<div key={section.heading ?? section.paragraphs[0]}>
							{section.heading && (
								<h2 className="mb-4 font-serif text-2xl text-text-strong-950 tracking-tight dark:text-white">
									{section.heading}
								</h2>
							)}
							{section.paragraphs.map((paragraph) => (
								<p
									key={paragraph.slice(0, 40)}
									className="mb-4 text-[16px] text-text-sub-600 leading-8 last:mb-0 dark:text-white/60"
								>
									{paragraph}
								</p>
							))}
						</div>
					))}
				</article>

				<div className="mt-12 border-stroke-soft-200 border-t pt-8 dark:border-white/10">
					<Link
						href="/company/blog"
						className={Button.buttonVariants({
							mode: "stroke",
							variant: "neutral",
						}).root({
							className: "rounded-full",
						})}
					>
						← Back to blog
					</Link>
				</div>
			</PageSection>
			<FeatureCta {...cta} />
		</MarketingPageShell>
	);
}

export function ToolWidget({ toolType }: { toolType: string }) {
	switch (toolType) {
		case "email-validator":
			return <EmailValidatorWidget />;
		case "deliverability-tester":
			return <DeliverabilityTesterWidget />;
		case "auth-checker":
			return <AuthCheckerWidget />;
		case "template-generator":
			return <TemplateGeneratorWidget />;
		case "subject-tester":
			return <SubjectTesterWidget />;
		case "mobile-preview":
			return <MobilePreviewWidget />;
		default:
			return null;
	}
}

function EmailValidatorWidget() {
	const [email, setEmail] = useState("");
	const [result, setResult] = useState<string | null>(null);

	function validate() {
		const trimmed = email.trim();
		if (!trimmed) {
			setResult("Enter an email address.");
			return;
		}
		const basic = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!basic.test(trimmed)) {
			setResult("Invalid format — check for typos or missing @ domain.");
			return;
		}
		const domain = trimmed.split("@")[1];
		if (domain && !domain.includes(".")) {
			setResult("Domain looks incomplete.");
			return;
		}
		setResult(
			"Format looks valid. Use Reloop validation API for MX and deliverability checks.",
		);
	}

	return (
		<ToolCard title="Validate an address">
			<input
				type="email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				placeholder="user@example.com"
				className="w-full rounded-xl border border-stroke-soft-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black"
			/>
			<button
				type="button"
				onClick={validate}
				className={`${Button.buttonVariants({ variant: "neutral" }).root()} mt-4 w-full rounded-xl`}
			>
				Validate
			</button>
			{result && <ResultBox message={result} />}
		</ToolCard>
	);
}

function DeliverabilityTesterWidget() {
	const [content, setContent] = useState("");
	const [score, setScore] = useState<number | null>(null);

	function analyze() {
		const spamWords = [
			"free",
			"winner",
			"urgent",
			"act now",
			"click here",
			"!!!",
		];
		const lower = content.toLowerCase();
		let penalty = 0;
		for (const word of spamWords) {
			if (lower.includes(word)) penalty += 12;
		}
		const linkCount = (content.match(/https?:\/\//g) ?? []).length;
		if (linkCount > 5) penalty += 15;
		if (content.length < 50) penalty += 10;
		setScore(Math.max(0, 100 - penalty));
	}

	return (
		<ToolCard title="Paste email HTML or text">
			<textarea
				value={content}
				onChange={(e) => setContent(e.target.value)}
				rows={6}
				placeholder="Paste your email content..."
				className="w-full rounded-xl border border-stroke-soft-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black"
			/>
			<button
				type="button"
				onClick={analyze}
				className={`${Button.buttonVariants({ variant: "neutral" }).root()} mt-4 w-full rounded-xl`}
			>
				Analyze
			</button>
			{score !== null && (
				<ResultBox
					message={`Estimated spam score: ${score}/100 (${score >= 80 ? "looks good" : score >= 50 ? "review content" : "high risk"})`}
				/>
			)}
		</ToolCard>
	);
}

function AuthCheckerWidget() {
	const [domain, setDomain] = useState("");
	const [checked, setChecked] = useState(false);

	function check() {
		setChecked(!!domain.trim());
	}

	return (
		<ToolCard title="Enter your sending domain">
			<input
				type="text"
				value={domain}
				onChange={(e) => setDomain(e.target.value)}
				placeholder="yourdomain.com"
				className="w-full rounded-xl border border-stroke-soft-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black"
			/>
			<button
				type="button"
				onClick={check}
				className={`${Button.buttonVariants({ variant: "neutral" }).root()} mt-4 w-full rounded-xl`}
			>
				Check records
			</button>
			{checked && (
				<div className="mt-4 space-y-2 rounded-xl bg-bg-weak-50 p-4 font-mono text-sm dark:bg-white/5">
					<p className="text-text-sub-600 dark:text-white/50">
						Demo mode — add <strong>{domain}</strong> in Reloop to get exact
						SPF, DKIM, and DMARC records.
					</p>
					<p>SPF: configure in dashboard</p>
					<p>DKIM: configure in dashboard</p>
					<p>DMARC: add _dmarc TXT record</p>
				</div>
			)}
		</ToolCard>
	);
}

function TemplateGeneratorWidget() {
	const [type, setType] = useState("transactional");
	const templates: Record<string, string> = {
		newsletter: "<h1>Weekly Update</h1><p>Your news here...</p>",
		transactional: "<h1>Order confirmed</h1><p>Thanks for your purchase.</p>",
		welcome: "<h1>Welcome!</h1><p>We're glad you're here.</p>",
		marketing: "<h1>Special offer</h1><p>Limited time deal inside.</p>",
	};

	return (
		<ToolCard title="Choose a template type">
			<select
				value={type}
				onChange={(e) => setType(e.target.value)}
				className="w-full rounded-xl border border-stroke-soft-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black"
			>
				<option value="newsletter">Newsletter</option>
				<option value="transactional">Transactional</option>
				<option value="welcome">Welcome</option>
				<option value="marketing">Marketing</option>
			</select>
			<pre className="mt-4 overflow-x-auto rounded-xl bg-bg-weak-50 p-4 font-mono text-xs dark:bg-white/5">
				{templates[type]}
			</pre>
			<p className="mt-3 text-[13px] text-text-sub-600 dark:text-white/40">
				Use the Reloop template editor for full drag-and-drop design.
			</p>
		</ToolCard>
	);
}

function SubjectTesterWidget() {
	const [subject, setSubject] = useState("");
	const [score, setScore] = useState<number | null>(null);

	function test() {
		let s = 100;
		if (subject.length > 60) s -= 20;
		if (subject.length < 10) s -= 15;
		if (subject === subject.toUpperCase() && subject.length > 3) s -= 25;
		if (/!{2,}/.test(subject)) s -= 15;
		if (/free|winner|urgent/i.test(subject)) s -= 10;
		setScore(Math.max(0, s));
	}

	return (
		<ToolCard title="Enter subject line">
			<input
				type="text"
				value={subject}
				onChange={(e) => setSubject(e.target.value)}
				placeholder="Your email subject..."
				className="w-full rounded-xl border border-stroke-soft-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-black"
			/>
			<button
				type="button"
				onClick={test}
				className={`${Button.buttonVariants({ variant: "neutral" }).root()} mt-4 w-full rounded-xl`}
			>
				Score subject
			</button>
			{score !== null && (
				<ResultBox
					message={`Score: ${score}/100 · Length: ${subject.length} chars`}
				/>
			)}
		</ToolCard>
	);
}

function MobilePreviewWidget() {
	const [html, setHtml] = useState("<h2>Hello!</h2><p>Your email preview.</p>");

	return (
		<ToolCard title="Paste HTML to preview">
			<textarea
				value={html}
				onChange={(e) => setHtml(e.target.value)}
				rows={4}
				className="w-full rounded-xl border border-stroke-soft-200 bg-white px-4 py-3 font-mono text-sm dark:border-white/10 dark:bg-black"
			/>
			<div className="mx-auto mt-6 w-[280px] rounded-[2rem] border-4 border-stroke-soft-200 bg-white p-2 dark:border-white/20 dark:bg-black">
				<div className="h-6 rounded-t-2xl bg-bg-weak-50 dark:bg-white/5" />
				<div
					className="min-h-[320px] overflow-auto rounded-b-2xl p-4 text-sm"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: user preview tool
					dangerouslySetInnerHTML={{ __html: html }}
				/>
			</div>
		</ToolCard>
	);
}

function ToolCard({ title, children }: { title: string; children: ReactNode }) {
	return (
		<div className="mx-auto max-w-lg rounded-2xl border border-stroke-soft-200 bg-bg-weak-50 p-8 dark:border-white/10">
			<h2 className="mb-6 font-semibold text-lg text-text-strong-950 dark:text-white">
				{title}
			</h2>
			{children}
		</div>
	);
}

function ResultBox({ message }: { message: string }) {
	return (
		<p className="mt-4 rounded-xl border border-stroke-soft-200 bg-white p-4 text-sm text-text-sub-600 dark:border-white/10 dark:bg-black dark:text-white/60">
			{message}
		</p>
	);
}
