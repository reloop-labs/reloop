"use client";

import type { GlossarySection } from "@reloop/web/lib/glossary-sections";
import { getSectionSlug } from "@reloop/web/lib/glossary-sections";
import Link from "next/link";
import { useEffect, useState } from "react";

export function GlossaryPageMain({
	sections,
}: {
	sections: GlossarySection[];
}) {
	const [activeSection, setActiveSection] = useState<string>("");

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActiveSection(entry.target.id);
					}
				}
			},
			{
				rootMargin: "-20% 0px -60% 0px", // Trigger when section is in the upper/middle viewport
				threshold: 0,
			},
		);

		for (const section of sections) {
			const slug = getSectionSlug(section.title);
			const el = document.getElementById(slug);
			if (el) observer.observe(el);
		}

		return () => observer.disconnect();
	}, [sections]);

	useEffect(() => {
		const handleHashChange = () => {
			const hash = window.location.hash.replace("#", "");
			if (hash) {
				const el = document.getElementById(hash);
				if (el) {
					const headerOffset = 100; // Offset for sticky header
					const elementPosition = el.getBoundingClientRect().top;
					const offsetPosition =
						elementPosition + window.scrollY - headerOffset;

					window.scrollTo({
						top: offsetPosition,
						behavior: "smooth",
					});
					setActiveSection(hash);
				}
			}
		};

		// Run on mount with a slight delay so browser layout is fully established
		const timer = setTimeout(handleHashChange, 150);

		window.addEventListener("hashchange", handleHashChange);
		return () => {
			clearTimeout(timer);
			window.removeEventListener("hashchange", handleHashChange);
		};
	}, []);

	const handleScrollTo = (
		e: React.MouseEvent<HTMLAnchorElement>,
		slug: string,
	) => {
		e.preventDefault();
		const el = document.getElementById(slug);
		if (el) {
			const headerOffset = 100; // Offset for sticky header
			const elementPosition = el.getBoundingClientRect().top;
			const offsetPosition = elementPosition + window.scrollY - headerOffset;

			window.scrollTo({
				top: offsetPosition,
				behavior: "smooth",
			});
			// Update URL hash without jumping the page
			window.history.pushState(null, "", `#${slug}`);
			setActiveSection(slug);
		}
	};

	return (
		<div className="mx-auto max-w-[1200px] px-6 py-8 lg:grid lg:grid-cols-[240px_1fr] lg:gap-10">
			{/* Left Column: Sticky Table of Contents (Desktop only) */}
			<aside className="hidden lg:block">
				<nav className="sticky top-28 max-h-[calc(100vh-10rem)] overflow-y-auto pr-4">
					<h2 className="mb-4 font-semibold text-[0.8rem] text-text-sub-600 uppercase tracking-[0.08em] dark:text-white/55">
						Browse by section
					</h2>
					<ul className="relative m-0 flex list-none flex-col gap-2.5 border-stroke-soft-200 border-l pl-0 dark:border-white/10">
						{sections.map((section) => {
							const slug = getSectionSlug(section.title);
							const isActive = activeSection === slug;
							return (
								<li key={section.title} className="relative">
									{isActive && (
										<div className="absolute top-0 bottom-0 left-[-1px] w-[2px] bg-primary-base transition-all" />
									)}
									<a
										href={`#${slug}`}
										onClick={(e) => handleScrollTo(e, slug)}
										className={`block py-0.5 pl-4 text-[0.92rem] leading-relaxed no-underline transition-colors ${
											isActive
												? "font-medium text-primary-base"
												: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
										}`}
									>
										{section.title}
									</a>
								</li>
							);
						})}
					</ul>
				</nav>
			</aside>

			{/* Right Column: Sections content */}
			<div className="space-y-16">
				{/* Mobile/Tablet Browse navigation */}
				<div className="lg:hidden">
					<nav
						aria-label="Browse by section"
						className="rounded-2xl border border-stroke-soft-200 bg-bg-soft-50 p-4 pr-5 dark:border-white/10 dark:bg-[#0a0a0a]"
					>
						<h2 className="mb-2.5 font-medium text-[0.85rem] text-text-sub-600 uppercase tracking-[0.08em] dark:text-white/55">
							Browse by section
						</h2>
						<ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-2 p-0">
							{sections.map((section) => {
								const slug = getSectionSlug(section.title);
								const isActive = activeSection === slug;
								return (
									<li key={section.title}>
										<a
											href={`#${slug}`}
											onClick={(e) => handleScrollTo(e, slug)}
											className={`text-[0.92rem] no-underline transition-colors hover:underline ${
												isActive
													? "font-medium text-primary-base"
													: "text-text-sub-600 hover:text-primary-base dark:text-white/60"
											}`}
										>
											{section.title}
										</a>
									</li>
								);
							})}
						</ul>
					</nav>
				</div>

				{sections.map((section) => {
					const slug = getSectionSlug(section.title);

					return (
						<section key={section.title} id={slug} className="scroll-mt-28">
							<div className="pb-10">
								<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
									<h2 className="font-serif text-[2.25rem] text-text-strong-950 leading-tight tracking-tight sm:text-[2.5rem] dark:text-white">
										<a
											href={`#${slug}`}
											onClick={(e) => handleScrollTo(e, slug)}
											className="no-underline transition-colors duration-200 hover:text-primary-base"
										>
											{section.title}
										</a>
										<span
											aria-hidden
											className="mt-1 block h-[3px] w-9 bg-primary-base"
										/>
									</h2>
									{section.hub && (
										<Link
											href={section.hub.href}
											className="shrink-0 text-primary-base text-sm hover:underline"
										>
											{section.hub.title} →
										</Link>
									)}
								</div>
								{section.title === "Glossary" ? (
									<div className="mt-10 space-y-12">
										{/* A-C */}
										<div>
											<h3 className="mb-6 font-serif text-2xl text-text-strong-950 dark:text-white">
												A - C
											</h3>
											<div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/api"
															className="transition-colors hover:text-primary-base"
														>
															API
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														Application Programming Interface. A set of
														protocols and tools for building software
														applications that communicate with email services.
													</p>
												</div>
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/authentication"
															className="transition-colors hover:text-primary-base"
														>
															Authentication
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														The process of verifying the identity of an email
														sender using protocols like SPF, DKIM, and DMARC.
													</p>
												</div>
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/bounce-rate"
															className="transition-colors hover:text-primary-base"
														>
															Bounce Rate
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														The percentage of emails that could not be delivered
														to recipients due to invalid addresses or other
														issues.
													</p>
												</div>
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/click-through-rate"
															className="transition-colors hover:text-primary-base"
														>
															Click-through Rate (CTR)
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														The percentage of email recipients who clicked on
														one or more links contained in an email message.
													</p>
												</div>
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/content-filtering"
															className="transition-colors hover:text-primary-base"
														>
															Content Filtering
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														The process of analyzing email content to determine
														if it should be delivered, flagged as spam, or
														blocked.
													</p>
												</div>
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/conversion-rate"
															className="transition-colors hover:text-primary-base"
														>
															Conversion Rate
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														The percentage of email recipients who completed a
														desired action, such as making a purchase or signing
														up for a service.
													</p>
												</div>
											</div>
										</div>

										{/* D-F */}
										<div>
											<h3 className="mb-6 font-serif text-2xl text-text-strong-950 dark:text-white">
												D - F
											</h3>
											<div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/deliverability"
															className="transition-colors hover:text-primary-base"
														>
															Deliverability
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														The ability of an email to reach the recipient's
														inbox without being filtered into spam or blocked.
													</p>
												</div>
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/dkim"
															className="transition-colors hover:text-primary-base"
														>
															DKIM
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														DomainKeys Identified Mail. An email authentication
														method that uses digital signatures to verify email
														authenticity.
													</p>
												</div>
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/dmarc"
															className="transition-colors hover:text-primary-base"
														>
															DMARC
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														Domain-based Message Authentication, Reporting, and
														Conformance. A policy framework for email
														authentication.
													</p>
												</div>
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/email-client"
															className="transition-colors hover:text-primary-base"
														>
															Email Client
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														Software applications used to read, send, and manage
														email messages, such as Gmail, Outlook, or Apple
														Mail.
													</p>
												</div>
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/esp"
															className="transition-colors hover:text-primary-base"
														>
															Email Service Provider (ESP)
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														A company that provides email marketing and
														transactional email services to businesses and
														organizations.
													</p>
												</div>
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/feedback-loop"
															className="transition-colors hover:text-primary-base"
														>
															Feedback Loop
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														A system that allows ISPs to report spam complaints
														back to email senders to help maintain sender
														reputation.
													</p>
												</div>
											</div>
										</div>

										{/* G-M */}
										<div>
											<h3 className="mb-6 font-serif text-2xl text-text-strong-950 dark:text-white">
												G - M
											</h3>
											<div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/hard-bounce"
															className="transition-colors hover:text-primary-base"
														>
															Hard Bounce
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														A permanent email delivery failure due to invalid
														email addresses or blocked domains.
													</p>
												</div>
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/ip-reputation"
															className="transition-colors hover:text-primary-base"
														>
															IP Reputation
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														A score assigned to an IP address based on its email
														sending history and spam complaints.
													</p>
												</div>
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/list-hygiene"
															className="transition-colors hover:text-primary-base"
														>
															List Hygiene
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														The practice of regularly cleaning email lists to
														remove invalid, inactive, or unengaged subscribers.
													</p>
												</div>
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/mta"
															className="transition-colors hover:text-primary-base"
														>
															Mail Transfer Agent (MTA)
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														Software that transfers email messages between
														servers using the SMTP protocol.
													</p>
												</div>
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/open-rate"
															className="transition-colors hover:text-primary-base"
														>
															Open Rate
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														The percentage of email recipients who opened an
														email message, calculated by tracking pixel
														downloads.
													</p>
												</div>
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/mime"
															className="transition-colors hover:text-primary-base"
														>
															MIME
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														Multipurpose Internet Mail Extensions. A standard
														for formatting email messages to support text, HTML,
														and attachments.
													</p>
												</div>
											</div>
										</div>

										{/* N-S */}
										<div>
											<h3 className="mb-6 font-serif text-2xl text-text-strong-950 dark:text-white">
												N - S
											</h3>
											<div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/opt-in"
															className="transition-colors hover:text-primary-base"
														>
															Opt-in
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														The process by which users explicitly consent to
														receive email communications from a sender.
													</p>
												</div>
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/opt-out"
															className="transition-colors hover:text-primary-base"
														>
															Opt-out
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														The process by which users request to stop receiving
														email communications from a sender.
													</p>
												</div>
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/reputation"
															className="transition-colors hover:text-primary-base"
														>
															Reputation
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														A score that ISPs assign to email senders based on
														their sending practices and recipient engagement.
													</p>
												</div>
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/smtp"
															className="transition-colors hover:text-primary-base"
														>
															SMTP
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														Simple Mail Transfer Protocol. The standard protocol
														for sending email messages between servers.
													</p>
												</div>
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/soft-bounce"
															className="transition-colors hover:text-primary-base"
														>
															Soft Bounce
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														A temporary email delivery failure due to issues
														like full mailbox or server problems.
													</p>
												</div>
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/spf"
															className="transition-colors hover:text-primary-base"
														>
															SPF
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														Sender Policy Framework. An email authentication
														method that specifies which servers are authorized
														to send emails for a domain.
													</p>
												</div>
											</div>
										</div>

										{/* T-Z */}
										<div>
											<h3 className="mb-6 font-serif text-2xl text-text-strong-950 dark:text-white">
												T - Z
											</h3>
											<div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/transactional-email"
															className="transition-colors hover:text-primary-base"
														>
															Transactional Email
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														Automated emails triggered by user actions, such as
														password resets, order confirmations, or welcome
														messages.
													</p>
												</div>
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/unsubscribe"
															className="transition-colors hover:text-primary-base"
														>
															Unsubscribe
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														The process by which email recipients remove
														themselves from an email list to stop receiving
														future messages.
													</p>
												</div>
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/webhook"
															className="transition-colors hover:text-primary-base"
														>
															Webhook
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														A mechanism for real-time communication between
														applications by sending HTTP POST requests when
														events occur.
													</p>
												</div>
												<div>
													<h4 className="font-semibold text-[16px] text-text-strong-950 dark:text-white">
														<Link
															href="/glossary/whitelist"
															className="transition-colors hover:text-primary-base"
														>
															Whitelist
														</Link>
													</h4>
													<p className="mt-1 text-[14px] text-text-sub-600 leading-relaxed dark:text-white/50">
														A list of trusted email addresses or domains that
														are allowed to bypass spam filters.
													</p>
												</div>
											</div>
										</div>
									</div>
								) : (
									<ul className="mt-8 columns-1 gap-x-10 sm:columns-2 lg:columns-3">
										{section.links.map((link) => (
											<li key={link.href} className="mb-3 break-inside-avoid">
												<Link
													href={link.href}
													className="text-[15px] text-text-sub-600 leading-snug transition-colors hover:text-primary-base dark:text-white/60"
												>
													{link.title}
												</Link>
											</li>
										))}
									</ul>
								)}
							</div>
						</section>
					);
				})}
			</div>
		</div>
	);
}
