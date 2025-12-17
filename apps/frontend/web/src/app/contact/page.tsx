"use client";

import * as Button from "@reloop/ui/button";
import * as Checkbox from "@reloop/ui/checkbox";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Select from "@reloop/ui/select";
import * as Textarea from "@reloop/ui/textarea";
import { useState } from "react";

const ContactPage = () => {
	const [newsletter, setNewsletter] = useState(false);

	return (
		<div className="flex flex-col">
			{/* Main Content Section - Two Column Layout */}
			<section className="bg-bg-soft-200">
				<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
					<div className="grid grid-cols-1 gap-12 px-6 py-20 md:grid-cols-2 md:px-12 md:py-28">
						{/* Left Column - Information & Value Proposition */}
						<div className="flex flex-col gap-6">
							{/* Contact Header */}
							<div className="flex items-center gap-2">
								<Icon name="mail-single" className="size-5 text-teal-500" />
								<span className="label-sm text-teal-500">Contact</span>
							</div>

							{/* Main Heading */}
							<h1 className="title-h2 text-text-strong-950">Get in touch</h1>

							{/* Descriptive Text */}
							<p className="paragraph-lg text-text-strong-950">
								Connect with our team to accelerate your cloud application
								journey.
							</p>

							{/* Bulleted List */}
							<ul className="flex flex-col gap-4">
								<li className="flex items-start gap-3">
									<Icon
										name="check"
										className="mt-0.5 size-5 shrink-0 text-teal-500"
									/>
									<span className="paragraph-md text-text-strong-950">
										About our cloud and enterprise plans
									</span>
								</li>
								<li className="flex items-start gap-3">
									<Icon
										name="check"
										className="mt-0.5 size-5 shrink-0 text-teal-500"
									/>
									<span className="paragraph-md text-text-strong-950">
										A deployment or migration partner
									</span>
								</li>
								<li className="flex items-start gap-3">
									<Icon
										name="check"
										className="mt-0.5 size-5 shrink-0 text-teal-500"
									/>
									<span className="paragraph-md text-text-strong-950">
										A live cloud demo
									</span>
								</li>
								<li className="flex items-start gap-3">
									<Icon
										name="check"
										className="mt-0.5 size-5 shrink-0 text-teal-500"
									/>
									<span className="paragraph-md text-text-strong-950">
										Technical support or consultation
									</span>
								</li>
							</ul>

							{/* Testimonial */}
							<blockquote className="paragraph-md text-text-strong-950">
								Switching to this cloud platform cut our deployment time in
								half. The scalability and support have been outstanding.
							</blockquote>

							{/* Company Names */}
							<div className="flex flex-wrap items-center gap-4">
								<span className="paragraph-md text-teal-500">Nexora</span>
								<span className="paragraph-md text-teal-500">Flowbyte</span>
								<span className="paragraph-md text-teal-500">Lumina</span>
							</div>
						</div>

						{/* Right Column - Contact Form */}
						<form className="flex flex-col gap-6">
							{/* Full Name */}
							<div className="flex flex-col gap-2">
								<Label.Root htmlFor="full-name">Full name</Label.Root>
								<Input.Root size="small">
									<Input.Wrapper>
										<Input.Input
											id="full-name"
											name="full-name"
											type="text"
											placeholder="Enter your full name"
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>

							{/* Email */}
							<div className="flex flex-col gap-2">
								<Label.Root htmlFor="email">Email</Label.Root>
								<Input.Root>
									<Input.Wrapper>
										<Input.Input
											id="email"
											name="email"
											type="email"
											placeholder="Enter your email"
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>

							{/* Company Name */}
							<div className="flex flex-col gap-2">
								<Label.Root htmlFor="company-name">Company name</Label.Root>
								<Input.Root>
									<Input.Wrapper>
										<Input.Input
											id="company-name"
											name="company-name"
											type="text"
											placeholder="Enter your company name"
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>

							{/* Inquiry Type */}
							<div className="flex flex-col gap-2">
								<Label.Root htmlFor="inquiry-type">Inquiry type</Label.Root>
								<Select.Root>
									<Select.Trigger id="inquiry-type">
										<Select.Value placeholder="Select an option" />
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="general">General Inquiry</Select.Item>
										<Select.Item value="sales">Sales</Select.Item>
										<Select.Item value="support">Support</Select.Item>
										<Select.Item value="partnership">Partnership</Select.Item>
									</Select.Content>
								</Select.Root>
							</div>

							{/* Message */}
							<div className="flex flex-col gap-2">
								<Label.Root htmlFor="message">Message</Label.Root>
								<Textarea.Root
									id="message"
									name="message"
									simple
									placeholder="Your message..."
									rows={5}
								/>
							</div>

							{/* Newsletter Subscription */}
							<div className="flex items-start gap-3">
								<Checkbox.Root
									id="newsletter"
									checked={newsletter}
									onCheckedChange={(checked: boolean) =>
										setNewsletter(checked === true)
									}
								/>
								<div className="flex flex-col gap-1">
									<Label.Root htmlFor="newsletter" className="cursor-pointer">
										Subscribe to our newsletter
									</Label.Root>
									<Label.Sub>
										Get the latest updates and insights delivered to your inbox.
									</Label.Sub>
								</div>
							</div>

							{/* Submit Button */}
							<button
								type="submit"
								className={Button.buttonVariants({
									variant: "primary",
									mode: "filled",
								}).root({ className: "w-full" })}
							>
								Send message
							</button>
						</form>
					</div>
				</div>
			</section>

			{/* Bottom CTA Section */}
			<section
				className="bg-bg-soft-200"
				style={{
					backgroundImage: `repeating-linear-gradient(
						45deg,
						transparent,
						transparent 10px,
						rgba(0, 0, 0, 0.02) 10px,
						rgba(0, 0, 0, 0.02) 20px
					)`,
				}}
			>
				<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l px-6 py-20 md:px-12 md:py-28">
					<div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
						{/* Heading */}
						<h2 className="title-h2 text-teal-500">
							Build your cloud solution the way you want it
						</h2>

						{/* Action Buttons */}
						<div className="flex flex-col gap-4 sm:flex-row">
							<button
								type="button"
								className={Button.buttonVariants({
									variant: "primary",
									mode: "filled",
								}).root({
									className: "bg-teal-500 text-static-white hover:bg-teal-600",
								})}
							>
								Get started
							</button>
							<button
								type="button"
								className={Button.buttonVariants({
									variant: "primary",
									mode: "stroke",
								}).root({
									className: "bg-bg-white-0 text-teal-500 ring-teal-500",
								})}
							>
								Learn more
							</button>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default ContactPage;
