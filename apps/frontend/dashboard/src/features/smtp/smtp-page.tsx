import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Tooltip from "@reloop/ui/tooltip";
import { useCallback, useState } from "react";
import { SMTP_HOST, SMTP_PORT, SMTP_USER } from "./smtp-code-examples";
import { SmtpCodePanel } from "./smtp-code-panel";

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
			// Ignore clipboard failures
		}
	}, [value]);

	return (
		<div className="space-y-1.5">
			<div className="flex items-center gap-1.5">
				<Label.Root htmlFor={id}>{label}</Label.Root>
				{tooltip && (
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
				)}
			</div>
			<Input.Root size="small" className="rounded-xl!">
				<Input.Wrapper
					className="cursor-pointer bg-bg-weak-50/30 transition-all hover:bg-bg-weak-50"
					onClick={handleCopy}
				>
					<Input.Input
						id={id}
						value={copied ? "Copied" : value}
						readOnly
						className={cn(
							"h-9 cursor-pointer font-medium transition-colors duration-200",
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
			// Ignore clipboard failures
		}
	}, [value]);

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="inline-flex min-w-[64px] items-center justify-center gap-1.5 rounded-md bg-bg-weak-50 px-2 py-0.5 transition-all duration-200 hover:bg-bg-soft-200"
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

export function SmtpPage() {
	return (
		<div className="mx-auto w-full max-w-6xl space-y-8 p-6 lg:p-8">
			<div className="grid w-full gap-10 pt-1 pb-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-12">
				{/* Left — credentials */}
				<div className="min-w-0 space-y-6">
					<div>
						<p className="font-medium text-label-md text-text-strong-950">
							SMTP
						</p>
						<p className="mt-1 text-paragraph-sm text-text-sub-600">
							Send emails using SMTP instead of the REST API.
							<a
								href="https://reloop.sh/docs/examples/smtp/introduction"
								target="_blank"
								rel="noreferrer"
								className="rounded-full px-1 py-0.5 font-semibold text-text-strong-950 transition-colors duration-200 hover:bg-bg-soft-200"
							>
								Read Docs
							</a>{" "}
							for more information.
						</p>
					</div>

					<div className="space-y-5">
						<CredentialInput id="host" label="Host" value={SMTP_HOST} />

						<CredentialInput id="port" label="Port" value={String(SMTP_PORT)}>
							<div className="flex flex-wrap items-center gap-1.5 pt-1 text-paragraph-sm text-text-sub-600">
								<span>For STARTTLS use</span>
								<InlineCopy value="587" />
								<span>or</span>
								<InlineCopy value="2587" />
								<span>· encrypted TLS</span>
								<InlineCopy value="2465" />
							</div>
						</CredentialInput>

						<CredentialInput id="user" label="User" value={SMTP_USER} />

						<CredentialInput
							id="password"
							label="Password"
							value="YOUR_API_KEY"
							tooltip="Use your API key as the SMTP password"
							isMono
						/>
					</div>
				</div>

				{/* Right — multi-language code */}
				<div className="min-w-0 lg:sticky lg:top-6 lg:self-start">
					<SmtpCodePanel apiKeyPlaceholder="YOUR_API_KEY" />
				</div>
			</div>
		</div>
	);
}
