"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Tooltip from "@reloop/ui/tooltip";
import { useCallback, useState } from "react";

function CredentialInput({
	label,
	value,
	id,
	tooltip,
	isMono,
	children,
}: {
	label: string;
	value: string;
	id: string;
	tooltip?: string;
	isMono?: boolean;
	children?: React.ReactNode;
}) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Ignore
		}
	}, [value]);

	return (
		<div className="space-y-1.5">
			<div className="flex items-center gap-1.5">
				<Label.Root htmlFor={id}>{label}</Label.Root>
				{tooltip && (
					<Tooltip.Provider>
						<Tooltip.Root>
							<Tooltip.Trigger asChild>
								<button type="button" className="text-text-soft-400">
									<Icon name="info-outline" className="h-3.5 w-3.5" />
								</button>
							</Tooltip.Trigger>
							<Tooltip.Content side="top">
								<p>{tooltip}</p>
							</Tooltip.Content>
						</Tooltip.Root>
					</Tooltip.Provider>
				)}
			</div>
			<Input.Root size="small" className="rounded-xl!">
				<Input.Wrapper
					className="cursor-pointer bg-bg-weak-50/30 transition-all hover:bg-bg-weak-100"
					onClick={handleCopy}
				>
					<Input.Input
						id={id}
						value={copied ? "Copied" : value}
						readOnly
						className={cn(
							"h-9 font-medium transition-colors duration-200 cursor-pointer",
							isMono && !copied && "font-mono",
							copied && "text-success-base",
						)}
					/>
					<Input.Affix>
						<Icon
							name={copied ? "check" : "copy"}
							className={cn(
								"h-3.5 w-3.5 transition-colors duration-200",
								copied && "text-success-base",
							)}
						/>
					</Input.Affix>
				</Input.Wrapper>
			</Input.Root>
			{children}
		</div>
	);
}

function InlineCopy({ value }: { value: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Ignore
		}
	}, [value]);

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="inline-flex min-w-[64px] items-center justify-center gap-1.5 rounded-md bg-bg-weak-50 px-2 py-0.5 transition-all duration-200 hover:bg-bg-weak-100"
		>
			<span
				className={cn(
					"font-mono text-sm transition-colors duration-200",
					copied ? "font-medium text-success-base" : "text-text-strong-950",
				)}
			>
				{copied ? "Copied" : value}
			</span>
			<Icon
				name={copied ? "check" : "copy"}
				className={cn(
					"h-3 w-3 transition-colors duration-200",
					copied ? "text-success-base" : "text-text-soft-400",
				)}
			/>
		</button>
	);
}

const SMTPPage = () => {
	return (
		<div className="w-full max-w-2xl space-y-8 pt-5">
			<div>
				<div className="mb-6">
					<p className="font-medium text-label-md text-text-strong-950">SMTP</p>
					<p className="text-paragraph-sm text-text-sub-600">
						Send emails using SMTP instead of the REST API.{" "}
						<a
							href="https://reloop.sh/docs/smtp"
							target="_blank"
							rel="noreferrer"
							className="text-primary-base hover:underline"
						>
							See documentation
						</a>{" "}
						for more information.
					</p>
				</div>

				<div className="space-y-6">
					<CredentialInput id="host" label="Host" value="smtp.reloop.sh" />

					<CredentialInput id="port" label="Port" value="465">
						<div className="flex flex-wrap items-center gap-1.5 pt-1 text-paragraph-sm text-text-sub-600">
							<span>For encrypted/TLS connections use</span>
							<InlineCopy value="2465" />
							<span>,</span>
							<InlineCopy value="587" />
							<span>or</span>
							<InlineCopy value="2587" />
						</div>
					</CredentialInput>

					<CredentialInput id="user" label="User" value="reloop" />

					<CredentialInput
						id="password"
						label="Password"
						value="YOUR_API_KEY"
						tooltip="Use your API key as the SMTP password"
						isMono
					/>
				</div>
			</div>
		</div>
	);
};

export default SMTPPage;
