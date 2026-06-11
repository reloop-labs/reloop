"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { authClient } from "@reloop/auth/client";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import Spinner from "@reloop/ui/spinner";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as v from "valibot";

// Form validation schema
const mailboxSchema = v.object({
	emailName: v.pipe(
		v.string("Email name is required"),
		v.minLength(1, "Email name is required"),
	),
	selectedDomain: v.pipe(
		v.string("Please select a domain"),
		v.minLength(1, "Please select a domain"),
	),
	password: v.pipe(
		v.string("Password is required"),
		v.minLength(6, "Password must be at least 6 characters"),
	),
});

type MailboxFormValues = v.InferInput<typeof mailboxSchema>;

export const AddNewMailboxModal = ({
	open,
	setState,
}: {
	open: boolean;
	setState: (open: boolean) => void;
}) => {
	const { refetch } = authClient.useSession();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showDetails, setShowDetails] = useState(true);
	const [showServerDetails, setShowServerDetails] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();

	const form = useForm<MailboxFormValues>({
		resolver: valibotResolver(mailboxSchema) as Resolver<MailboxFormValues>,
		defaultValues: {
			emailName: "",
			selectedDomain: "",
			password: "",
		},
	});

	// Sample domains - in a real app, these would come from an API
	const availableDomains = [
		{ value: "example.com", label: "example.com" },
		{ value: "test.example.com", label: "test.example.com" },
		{ value: "mail.example.com", label: "mail.example.com" },
		{ value: "local.reloop.sh", label: "local.reloop.sh" },
	];

	useEffect(() => {
		if (availableDomains.length > 0 && !form.getValues("selectedDomain")) {
			form.setValue("selectedDomain", availableDomains[0]?.value ?? "");
		}
	}, [form]);

	const onSubmit = async (_data: MailboxFormValues) => {
		setIsSubmitting(true);
		try {
			// Here you would make the API call to create the mailbox
			// const fullEmail = `${data.emailName}@${data.selectedDomain}`;
			await new Promise((resolve) => setTimeout(resolve, 1000));

			refetch();
			setShowDetails(true);
			toast.success("Mailbox created successfully!");
			form.reset();
		} catch {
			toast.error("Failed to create mailbox");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Modal.Root open={open} onOpenChange={setState}>
			<Modal.Content className="max-w-[440px]">
				{showDetails ? (
					<div>
						<Modal.Body className="flex w-full items-start gap-4">
							<div className="space-y-1">
								<Modal.Title className="font-medium text-text-strong-950 text-xl">
									Inbox Details
								</Modal.Title>
								<div className="text-paragraph-sm text-text-sub-600">
									New Email Account create under{" "}
									<span className="font-medium">xyz.com</span>
								</div>
								<div className="pt-5 font-medium text-text-strong-950">
									Access Instructions
								</div>
								<div className="text-paragraph-sm text-text-sub-600">
									To access your email account, use the following credentials
								</div>
							</div>
						</Modal.Body>
						<div className="space-y-3.5 border-stroke-soft-200 bg-bg-weak-50 p-5">
							<div className="grid grid-cols-6 items-center gap-2">
								<p className="col-span-2 font-medium text-sm text-text-sub-600">
									Email
								</p>
								<p className="col-span-3 font-medium text-sm text-text-strong-950">
									play@exaple.com
								</p>
								<Icon name="clipboard-copy" className="h-3 w-3" />
							</div>

							<div className="grid grid-cols-6 items-center gap-2">
								<p className="col-span-2 font-medium text-sm text-text-sub-600">
									Password
								</p>
								<p className="col-span-3 font-medium text-text-strong-950 leading-5">
									••••••••••
								</p>
								<Icon name="clipboard-copy" className="h-3 w-3" />
							</div>
							<div className="grid grid-cols-6 items-center gap-2">
								<p className="col-span-2 font-medium text-sm text-text-sub-600">
									Login URL
								</p>
								<p className="col-span-3 font-medium text-sm text-text-strong-950 leading-5">
									inbox.reloop.sh
								</p>
								<Icon name="external-link" className="h-3 w-3" />
							</div>
						</div>

						<AnimatePresence>
							{showServerDetails && (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									transition={{
										duration: 0.3,
										ease: "easeInOut",
									}}
									style={{ overflow: "hidden" }}
								>
									<div className="p-5">
										<p className="font-medium text-sm text-text-strong-950">
											Email Client Configuration
										</p>
										<p className="text-paragraph-sm text-text-sub-600">
											You can also access your email using your preferred email
											client
										</p>
									</div>
									<div className="space-y-3.5 border-stroke-soft-200 bg-bg-weak-50 p-5">
										<div className="mb-2 grid grid-cols-6 items-center gap-2">
											<p className="col-span-2 font-medium text-sm text-text-sub-600">
												Protocol
											</p>
											<p className="col-span-2 font-medium text-sm text-text-strong-950 leading-5">
												Server
											</p>
											<p className="col-span-1 font-medium text-sm text-text-strong-950 leading-5">
												Port
											</p>
										</div>
										<div className="mb-2 grid grid-cols-6 items-center gap-2">
											<p className="col-span-2 font-medium text-sm text-text-sub-600">
												IMAP
											</p>
											<p className="col-span-2 font-medium text-sm text-text-strong-950 leading-5">
												local.reloop.sh
											</p>
											<p className="col-span-1 font-medium text-sm text-text-strong-950 leading-5">
												143/993
											</p>
										</div>
										<div className="grid grid-cols-6 items-center gap-2">
											<p className="col-span-2 font-medium text-sm text-text-sub-600">
												SMTP
											</p>
											<p className="col-span-2 font-medium text-sm text-text-strong-950 leading-5">
												local.reloop.sh
											</p>
											<p className="col-span-1 font-medium text-sm text-text-strong-950 leading-5">
												25/465/587
											</p>
										</div>
									</div>
									<p className="px-5 pt-5 text-center font-medium text-sm">
										Email client engs like google outlook and others can be used
										with the above credentials.
									</p>
								</motion.div>
							)}
						</AnimatePresence>
						<div className="p-5">
							<Button.Root
								type="button"
								variant="neutral"
								mode="stroke"
								size="small"
								onClick={() => setShowServerDetails(!showServerDetails)}
							>
								<Button.Icon
									as={Icon}
									name="chevron-down"
									className={cn(
										"h-4 w-4 transition-transform duration-200 ease-in-out",
										showServerDetails && "rotate-180",
									)}
								/>
								Server Details
							</Button.Root>
						</div>
						<Modal.Footer className="flex justify-end rounded-b-2xl bg-bg-weak-50">
							<Modal.Close asChild>
								<Button.Root
									type="button"
									variant="neutral"
									mode="stroke"
									onClick={(e) => {
										e.preventDefault();
										setShowDetails(false);
									}}
								>
									Add another mailbox
								</Button.Root>
							</Modal.Close>
							<Button.Root
								type="button"
								variant="neutral"
								onClick={() => {
									setState(false);
								}}
							>
								Done
							</Button.Root>
						</Modal.Footer>
					</div>
				) : (
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<Modal.Body className="flex w-full items-start gap-4">
							<div className="w-full space-y-5">
								<Modal.Title className="font-medium text-label-md text-text-strong-950">
									Add new mailbox
								</Modal.Title>
								<div>
									<Label.Root htmlFor="name">
										Name
										<Label.Asterisk />
									</Label.Root>
									<Input.Root>
										<Input.Wrapper>
											<Input.Icon as={Icon} name="mail-single" />
											<Input.Input
												id="email"
												type="text"
												placeholder="Mailbox name..."
												{...form.register("emailName")}
											/>
											<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
												<Dropdown.Trigger asChild>
													<button
														type="button"
														disabled={isSubmitting}
														className="group/trigger flex h-5 min-h-5 w-auto items-center gap-0 rounded-none bg-transparent p-0 font-medium text-text-sub-600 shadow-none outline-none ring-0 hover:bg-transparent hover:text-text-strong-950 disabled:pointer-events-none disabled:opacity-50 data-[state=open]:text-text-strong-950"
													>
														<Icon
															name="at-sign"
															className="mr-1.5 h-4 w-4 shrink-0 text-text-soft-400 transition duration-200 ease-out group-hover/trigger:text-text-sub-600 group-data-[state=open]/trigger:text-text-sub-600"
														/>
														<span className="font-medium text-text-strong-950">
															{form.watch("selectedDomain") || "domain"}
														</span>
														<Icon
															name="chevron-down"
															className={cn(
																"ml-0.5 size-5 shrink-0 text-text-sub-600 transition duration-200 ease-out group-hover/trigger:text-text-strong-950 group-data-[state=open]/trigger:rotate-180 group-data-[state=open]/trigger:text-text-strong-950",
																isOpen && "rotate-180 text-text-strong-950",
															)}
														/>
													</button>
												</Dropdown.Trigger>
												<Dropdown.Content align="end" className="w-56 p-2">
													<div className="relative max-h-80 overflow-y-auto">
														{availableDomains.map((d, idx) => {
															const isSelected =
																d.value === form.watch("selectedDomain");
															return (
																<button
																	key={d.value}
																	ref={(el) => {
																		if (el) buttonRefs.current[idx] = el;
																	}}
																	type="button"
																	onPointerEnter={() => setHoverIdx(idx)}
																	onPointerLeave={() => setHoverIdx(undefined)}
																	onClick={() => {
																		form.setValue("selectedDomain", d.value);
																		setIsOpen(false);
																	}}
																	className={cn(
																		"flex w-full cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-colors",
																		"text-text-strong-950",
																		isSelected && "bg-neutral-alpha-10",
																		!currentRect &&
																			hoverIdx === idx &&
																			"bg-neutral-alpha-10",
																	)}
																>
																	<span className="truncate">{d.label}</span>
																	{isSelected && (
																		<Icon
																			name="check"
																			className="h-3.5 w-3.5 text-text-strong-950"
																		/>
																	)}
																</button>
															);
														})}
														<AnimatedHoverBackground
															rect={currentRect}
															tabElement={currentTab}
														/>
													</div>
												</Dropdown.Content>
											</Dropdown.Root>
										</Input.Wrapper>
									</Input.Root>
									{form.formState.errors.emailName && (
										<p className="mt-1 text-error-base text-paragraph-sm">
											{form.formState.errors.emailName.message}
										</p>
									)}
								</div>
								<div>
									<Label.Root htmlFor="password">
										Password
										<Label.Asterisk />
									</Label.Root>
									<Input.Root className="w-full">
										<Input.Wrapper className="w-full">
											<Input.Icon as={Icon} name="key" />
											<Input.Input
												id="password"
												type="password"
												placeholder="Enter password..."
												{...form.register("password")}
											/>
										</Input.Wrapper>
									</Input.Root>
									{form.formState.errors.password && (
										<p className="mt-1 text-error-base text-paragraph-sm">
											{form.formState.errors.password.message}
										</p>
									)}
								</div>
							</div>
						</Modal.Body>
						<Modal.Footer className="mt-4 flex items-center justify-end gap-3 border-stroke-soft-100/50">
							<Modal.Close asChild>
								<Button.Root
									type="button"
									variant="neutral"
									mode="stroke"
									size="xsmall"
									disabled={isSubmitting}
								>
									Cancel
									<KbdEsc />
								</Button.Root>
							</Modal.Close>
							<Button.Root
								type="submit"
								variant="neutral"
								disabled={isSubmitting}
							>
								{isSubmitting && <Spinner color="var(--text-strong-950)" />}
								{isSubmitting ? "Creating..." : "Confirm"}
							</Button.Root>
						</Modal.Footer>
					</form>
				)}
			</Modal.Content>
		</Modal.Root>
	);
};
