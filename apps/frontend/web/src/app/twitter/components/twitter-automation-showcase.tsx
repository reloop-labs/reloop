"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import * as Label from "@reloop/ui/label";
import * as Modal from "@reloop/ui/modal";
import * as Textarea from "@reloop/ui/textarea";
import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import { useState } from "react";

/* -------------------------------------------------------------------------- */
/*                                    DATA                                    */
/* -------------------------------------------------------------------------- */

const steps = [
	{
		title: "Pick a trigger",
		description:
			"Start when an email event happens — sent, opened, bounced, and more.",
	},
	{
		title: "Add send steps",
		description: "Chain one or more Send email actions on the canvas.",
	},
	{
		title: "Activate",
		description:
			"Turn the workflow on when every step is connected and configured.",
	},
];

const features = [
	{
		icon: "route" as const,
		title: "Visual builder",
		description: "Connect triggers to actions with a drag-and-drop canvas.",
	},
	{
		icon: "mail-single" as const,
		title: "Email-native",
		description: "Built on the same events that power Reloop webhooks.",
	},
	{
		icon: "route" as const,
		title: "Automatic sends",
		description:
			"Emails fire when your trigger conditions match (coming soon).",
	},
];

/* -------------------------------------------------------------------------- */
/*                        CREATE WORKFLOW MODAL (MOCK)                        */
/* -------------------------------------------------------------------------- */

function CreateWorkflowModalMock({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [busy, setBusy] = useState(false);
	const [created, setCreated] = useState(false);

	const handleClose = () => {
		onOpenChange(false);
		setTimeout(() => {
			setName("");
			setDescription("");
			setCreated(false);
		}, 200);
	};

	const handleCreate = () => {
		if (!name.trim() || busy) return;
		setBusy(true);
		setTimeout(() => {
			setBusy(false);
			setCreated(true);
			setTimeout(() => {
				handleClose();
			}, 900);
		}, 600);
	};

	return (
		<Modal.Root open={open} onOpenChange={onOpenChange}>
			<Modal.Content className="max-w-md">
				<Modal.Header>
					<Modal.Title>Create workflow</Modal.Title>
					<Modal.Description>
						Name your automation. You will configure triggers and steps on the
						canvas next.
					</Modal.Description>
				</Modal.Header>
				<Modal.Body className="flex flex-col gap-4">
					<div className="space-y-1.5">
						<Label.Root htmlFor="workflow-name">Name</Label.Root>
						<Input.Root>
							<Input.Wrapper>
								<Input.Input
									id="workflow-name"
									placeholder="e.g. Welcome sequence"
									value={name}
									onChange={(e) => setName(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") handleCreate();
									}}
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>
					<div className="space-y-1.5">
						<Label.Root htmlFor="workflow-description">
							Description{" "}
							<span className="font-normal text-text-sub-600">(optional)</span>
						</Label.Root>
						<Textarea.Root
							id="workflow-description"
							placeholder="What does this workflow do?"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
						/>
					</div>
				</Modal.Body>
				<Modal.Footer className="flex items-center justify-end gap-3">
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="small"
						onClick={handleClose}
					>
						Cancel
						<KbdEsc />
					</Button.Root>
					<Button.Root
						variant="neutral"
						size="small"
						onClick={handleCreate}
						disabled={!name.trim() || busy}
					>
						{busy ? "Creating..." : created ? "Created!" : "Create workflow"}
					</Button.Root>
				</Modal.Footer>
			</Modal.Content>
		</Modal.Root>
	);
}

/* -------------------------------------------------------------------------- */
/*                    LEFT SIDE: DASHBOARD AUTOMATION EMPTY                   */
/* -------------------------------------------------------------------------- */

function AutomationEmptyPageLeft() {
	const [createOpen, setCreateOpen] = useState(false);

	return (
		<div className="w-full space-y-6">
			{/* Page Header */}
			<div className="flex items-center justify-between pb-2">
				<h1 className="font-medium text-2xl text-text-strong-950 dark:text-white">
					Workflows
				</h1>
				<div className="flex items-center gap-2 self-end">
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						asChild
						className="gap-2"
					>
						<a
							href="https://reloop.sh/docs/learn/workflows"
							target="_blank"
							rel="noopener noreferrer"
						>
							<Icon name="book-open" className="h-3.5 w-3.5" />
							Docs
						</a>
					</Button.Root>
					<Button.Root
						variant="neutral"
						size="xsmall"
						onClick={() => setCreateOpen(true)}
						className="gap-2"
					>
						<Icon name="plus" className="h-4 w-4" />
						Create workflow
						<span className="inline-flex items-center gap-0.5">
							<Icon
								name="command"
								className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
							/>
							<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100/20 p-px font-medium text-[10px] uppercase">
								A
							</span>
						</span>
					</Button.Root>
				</div>
			</div>

			{/* Main Empty State Card */}
			<div className="overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50 dark:bg-[#0c0c0c]">
				{/* Top Hero Section */}
				<div className="flex flex-col items-center border-stroke-soft-100 border-b bg-bg-soft-200/10 px-6 py-12 text-center dark:border-stroke-soft-100/50 dark:bg-bg-soft-200/15">
					<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50 dark:bg-[#111111]">
						<Icon name="workflow" className="h-5 w-5 text-text-sub-600 dark:text-white/70" />
					</div>
					<h3 className="mb-2 font-semibold text-text-strong-950 text-xl dark:text-white">
						No workflows yet
					</h3>
					<p className="mx-auto mb-6 max-w-[300px] text-balance font-medium text-[12px] text-text-sub-600 dark:text-white/60">
						Automate email sends when events occur — like Zapier, but built for
						your Reloop stack.
					</p>
					<div className="flex items-center gap-3">
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="xsmall"
							onClick={() => setCreateOpen(true)}
							className="gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50 dark:text-white/70 dark:hover:text-white"
						>
							<Icon name="plus" className="h-4 w-4" />
							Create workflow
							<span className="inline-flex items-center gap-0.5">
								<Icon
									name="command"
									className="h-4 w-4 rounded-sm border border-stroke-soft-100 p-px"
								/>
								<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100 p-px font-medium text-[10px] uppercase">
									A
								</span>
							</span>
						</Button.Root>
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="xsmall"
							asChild
							className="gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50 dark:text-white/70 dark:hover:text-white"
						>
							<a
								href="https://reloop.sh/docs/learn/workflows"
								target="_blank"
								rel="noopener noreferrer"
							>
								<Icon name="book-open" className="h-3.5 w-3.5" />
								Read the docs
							</a>
						</Button.Root>
					</div>
				</div>

				{/* Two Column Guide Section */}
				<div className="grid grid-cols-1 md:grid-cols-2">
					{/* How it works */}
					<div className="border-stroke-soft-100 border-r p-6 dark:border-stroke-soft-100/50">
						<h4 className="mb-3 font-medium text-sm text-text-strong-950 dark:text-white">
							How it works
						</h4>
						<div className="flex flex-col gap-6">
							{steps.map((step, i) => (
								<div key={step.title} className="relative flex gap-4">
									{i < steps.length - 1 && (
										<div className="absolute top-10 bottom-[-4px] left-[13px] w-px bg-stroke-soft-100 dark:bg-stroke-soft-100/50" />
									)}
									<div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stroke-soft-100 bg-bg-surface-0 font-medium text-text-sub-600 text-xs dark:border-stroke-soft-100/50 dark:bg-[#141414] dark:text-white/70">
										{i + 1}
									</div>
									<div>
										<h5 className="font-medium text-sm text-text-strong-950 dark:text-white">
											{step.title}
										</h5>
										<p className="mt-0.5 text-balance font-medium text-[12px] text-text-sub-600 dark:text-white/60">
											{step.description}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* What you can do */}
					<div className="p-6">
						<h4 className="mb-3 font-medium text-sm text-text-strong-950 dark:text-white">
							What you can do
						</h4>
						<div className="flex flex-col">
							{features.map((feature, i) => (
								<div
									key={feature.title}
									className={
										i < features.length - 1
											? "mb-3 flex gap-4 border-stroke-soft-100 border-b pb-3 dark:border-stroke-soft-100/50"
											: "flex gap-4"
									}
								>
									<div className="mt-0.5 shrink-0">
										<Icon
											name={feature.icon}
											className="h-4 w-4 text-text-sub-600 dark:text-white/60"
										/>
									</div>
									<div>
										<h5 className="font-medium text-sm text-text-strong-950 dark:text-white">
											{feature.title}
										</h5>
										<p className="mt-0.5 text-balance font-medium text-[12px] text-text-sub-600 dark:text-white/60">
											{feature.description}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			<CreateWorkflowModalMock open={createOpen} onOpenChange={setCreateOpen} />
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/*                  RIGHT SIDE: NEW DESIGN PLACEHOLDER AREA                   */
/* -------------------------------------------------------------------------- */

function AutomationPlaceholderRight() {
	return (
		<div className="w-full space-y-6">
			{/* Placeholder Header */}
			<div className="flex items-center justify-between pb-2">
				<div className="flex items-center gap-2.5">
					<h2 className="font-medium text-2xl text-text-strong-950 dark:text-white">
						New Design
					</h2>
					<span className="inline-flex items-center gap-1 rounded-full border border-stroke-soft-200 bg-bg-soft-200/50 px-2 py-0.5 font-medium text-[11px] text-text-sub-600 dark:border-stroke-soft-100/40 dark:bg-white/[0.04] dark:text-white/70">
						<Sparkles className="h-3 w-3 text-blue-500" />
						Variant
					</span>
				</div>
				<div className="flex items-center gap-2 self-end opacity-40">
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						disabled
						className="gap-2"
					>
						<Icon name="book-open" className="h-3.5 w-3.5" />
						Docs
					</Button.Root>
					<Button.Root variant="neutral" size="xsmall" disabled className="gap-2">
						<Icon name="plus" className="h-4 w-4" />
						Create workflow
					</Button.Root>
				</div>
			</div>

			{/* Placeholder Card Container */}
			<div className="relative flex min-h-[490px] flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-stroke-soft-200 bg-bg-soft-200/20 p-8 text-center transition-colors dark:border-stroke-soft-100/40 dark:bg-white/[0.02]">
				<div className="flex max-w-sm flex-col items-center">
					<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-xs dark:border-white/[0.08] dark:bg-[#121212]">
						<Plus className="h-6 w-6 text-text-sub-600/70 dark:text-white/50" />
					</div>
					<h4 className="mb-1.5 font-semibold text-text-strong-950 text-base dark:text-white">
						Ready for new design
					</h4>
					<p className="text-balance font-medium text-[12px] text-text-sub-600 dark:text-white/60">
						Drop your upcoming automation empty state or workflow canvas design
						here to preview and compare against the current dashboard implementation.
					</p>
				</div>
			</div>
		</div>
	);
}

/* -------------------------------------------------------------------------- */
/*                           TWITTER SHOWCASE PAGE                            */
/* -------------------------------------------------------------------------- */

export function TwitterAutomationShowcase() {
	return (
		<div
			data-standalone="true"
			className="relative flex min-h-dvh w-full items-center justify-center bg-white p-6 sm:p-10 lg:p-12 dark:bg-[#080808]"
		>
			<div className="grid w-full max-w-[1600px] grid-cols-1 items-start gap-10 xl:grid-cols-2 xl:gap-14">
				{/* LEFT COLUMN: CURRENT AUTOMATION EMPTY PAGE */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
					className="flex w-full justify-center"
				>
					<AutomationEmptyPageLeft />
				</motion.div>

				{/* RIGHT COLUMN: PLACEHOLDER FOR UPCOMING DESIGN */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.05 }}
					className="flex w-full justify-center"
				>
					<AutomationPlaceholderRight />
				</motion.div>
			</div>
		</div>
	);
}
