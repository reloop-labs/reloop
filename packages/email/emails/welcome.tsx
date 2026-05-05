import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Tailwind,
	Text,
} from "react-email";
import * as React from "react";

interface WelcomeEmailProps {
	fullName: string;
	baseUrl?: string;
}

const defaultBaseUrl = process.env.NEXT_PUBLIC_BASE_URL
	? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
	: "https://reloop.sh";

export const WelcomeEmail = ({
	fullName = "User",
	baseUrl = defaultBaseUrl,
}: WelcomeEmailProps) => {
	const firstName = fullName ? fullName.split(" ").at(0) : "";
	const previewText = `Welcome to Reloop, ${firstName}! Building software is easy. Sending emails shouldn't be hard.`;

	return (
		<Html>
			<Head />
			<Preview>{previewText}</Preview>
			<Tailwind>
				<Body className="m-0 bg-[#0e0e0e] p-0 font-sans text-white">
					<Section className="mx-auto mt-[40px] mb-[40px] max-w-[560px] px-6">
						{/* Logo */}
						<Section className="mb-8">
							<Img
								src={`${baseUrl}/web-app-manifest-192x192.png`}
								width="32"
								height="32"
								alt="Reloop Logo"
								style={{ filter: "invert(1)" }}
							/>
						</Section>

						{/* Small Label */}
						<Text className="m-0 font-mono text-[10px] uppercase tracking-[0.2em] text-[#707070]">
							Welcome to Reloop
						</Text>

						{/* Main Headline */}
						<Heading
							className="mt-6 mb-8 p-0 font-serif font-normal text-[32px] leading-[1.2] text-white"
							style={{ fontFamily: "Georgia, serif" }}
						>
							Building software is easy.
							<br />
							<span className="text-[#707070]">
								Sending emails shouldn't be hard.
							</span>
						</Heading>

						<Hr className="my-8 border-[#222222]" />

						{/* Salutation & Intro */}
						<Text className="text-[15px] leading-[1.6] text-white">
							Hi {firstName},
						</Text>
						<Text className="mt-4 text-[15px] leading-[1.6] text-[#b0b0b0]">
							Welcome aboard. We're genuinely glad you're here.
						</Text>
						<Text className="mt-4 text-[15px] leading-[1.6] text-[#b0b0b0]">
							A new era of software is being built — AI agents that run
							autonomously, indie developers shipping products overnight, and
							marketing teams that move at startup speed. The builders are
							getting faster. The tools around them haven't kept up.
						</Text>
						<Text className="mt-4 text-[15px] leading-[1.6] text-[#b0b0b0]">
							That's what Reloop is here to fix.
						</Text>

						{/* Mission Section */}
						<Section className="mt-10 mb-10 pl-6 border-l border-solid border-[#222222]">
							<Text className="m-0 font-mono text-[10px] uppercase tracking-[0.2em] text-[#707070]">
								Our Mission
							</Text>
							<Text className="mt-4 font-serif italic text-[18px] leading-[1.6] text-white">
								"Open-source email infrastructure built for AI agents, marketing
								teams, and developers — so you can focus on what you're
								building, not on how to reach the people who need it."
							</Text>
						</Section>

						<Text className="mt-8 text-[15px] leading-[1.6] text-[#b0b0b0]">
							We've seen the next generation of companies — smaller teams,
							bigger ambitions. They'll be powered by AI, built in the open, and
							run by founders who care more about their product than their
							billing stack.
						</Text>
						<Text className="mt-4 text-[15px] leading-[1.6] text-[#b0b0b0]">
							Reloop gives them the email layer they deserve: reliable,
							composable, and transparent — from transactional sends to
							AI-triggered sequences to developer APIs.
						</Text>

						{/* Capabilities Box */}
						<Section className="mt-10 rounded-lg border border-solid border-[#222222] p-8">
							<Text className="m-0 font-mono text-[10px] uppercase tracking-[0.2em] text-[#707070]">
								What you can do with Reloop
							</Text>

							<table width="100%" cellPadding="0" cellSpacing="0" style={{ marginTop: '24px' }}>
								<tr>
									<td style={{ verticalAlign: 'top', width: '32px' }}>
										<Text className="m-0 font-mono text-[10px] text-[#404040]">
											01
										</Text>
									</td>
									<td style={{ borderBottom: '1px solid #222222', paddingBottom: '24px' }}>
										<Text className="m-0 font-semibold text-white">AI Agents</Text>
										<Text className="mt-1 text-[13px] text-[#707070]">
											Trigger, compose, and send emails programmatically — your
											agents communicate like humans.
										</Text>
									</td>
								</tr>
								<tr>
									<td style={{ verticalAlign: 'top', width: '32px', paddingTop: '24px' }}>
										<Text className="m-0 font-mono text-[10px] text-[#404040]">
											02
										</Text>
									</td>
									<td style={{ borderBottom: '1px solid #222222', paddingTop: '24px', paddingBottom: '24px' }}>
										<Text className="m-0 font-semibold text-white">
											Marketing Teams
										</Text>
										<Text className="mt-1 text-[13px] text-[#707070]">
											Campaign infrastructure with no vendor lock-in. Open,
											auditable, and fast to ship.
										</Text>
									</td>
								</tr>
								<tr>
									<td style={{ verticalAlign: 'top', width: '32px', paddingTop: '24px' }}>
										<Text className="m-0 font-mono text-[10px] text-[#404040]">
											03
										</Text>
									</td>
									<td style={{ paddingTop: '24px' }}>
										<Text className="m-0 font-semibold text-white">Developers</Text>
										<Text className="mt-1 text-[13px] text-[#707070]">
											Open-source APIs and SDKs. Self-host or use our cloud. You own
											your stack.
										</Text>
									</td>
								</tr>
							</table>
						</Section>

						{/* CTA Button */}
						<Section className="mt-10">
							<Button
								className="rounded bg-[#edece1] px-6 py-3 text-center font-mono text-[12px] font-bold uppercase tracking-wider text-black no-underline"
								href={`${baseUrl}/dashboard`}
							>
								Get Started &rarr;
							</Button>
						</Section>

						<Text className="mt-10 text-[15px] leading-[1.6] text-[#b0b0b0]">
							We're building Reloop in the open. That means you get a voice in
							what gets built next. If you have questions, feedback, or just
							want to say hi — reply to this email. We read everything.
						</Text>

						<Hr className="mt-10 mb-8 border-[#222222]" />

						<Text className="text-[15px] leading-[1.6] text-[#b0b0b0]">
							With love,
							<br />
							The Reloop Team
						</Text>

						{/* Footer */}
						<Section className="mt-12 text-[#404040]">
							<Text className="m-0 text-[11px] leading-[1.6]">
								You're receiving this because you signed up at reloop.sh
								<br />
								<Link
									href={`${baseUrl}/unsubscribe`}
									className="text-[#404040] underline"
								>
									Unsubscribe
								</Link>
								{" · "}
								<Link
									href={`${baseUrl}/view-in-browser`}
									className="text-[#404040] underline"
								>
									View in browser
								</Link>
							</Text>
						</Section>
					</Section>
				</Body>
			</Tailwind>
		</Html>
	);
};

export default WelcomeEmail;

