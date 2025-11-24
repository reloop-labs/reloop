"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import { Copy, Globe, Loader2 } from "lucide-react";
import { useState } from "react";

interface AddDomainStepProps {
	data: {
		domain: string;
	};
	updateData: (newData: Partial<AddDomainStepProps["data"]>) => void;
}

export const AddDomainStep = ({ data, updateData }: AddDomainStepProps) => {
	const [verifying, setVerifying] = useState(false);
	const [recordsVisible, setRecordsVisible] = useState(false);

	const handleVerify = () => {
		if (!data.domain) return;
		setVerifying(true);
		setTimeout(() => {
			setVerifying(false);
			setRecordsVisible(true);
		}, 1500);
	};

	return (
		<div className="fade-in animate-in space-y-6 duration-500">
			<div className="flex flex-col gap-1">
				<Label.Root htmlFor="domain-name">Domain Name</Label.Root>
				<div className="flex gap-3">
					<Input.Root className="flex-1">
						<Input.Wrapper>
							<Input.Icon>
								<Globe size={18} />
							</Input.Icon>
							<Input.Input
								id="domain-name"
								type="text"
								placeholder="e.g. news.reloop.sh"
								value={data.domain}
								onChange={(e) => updateData({ domain: e.target.value })}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
				<div className="mt-6">
					<div className="flex items-center gap-2 text-xs uppercase">
						<Icon name="bulb" className="h-3 w-3" />
						<p>Pro Tip</p>
					</div>
					<p className="pt-2 text-sm text-text-sub-600">
						Use separate domain for domain reputation
					</p>
					<div className="pt-3 text-sm text-text-sub-600">
						<p>Subdomain example:</p>
						<ul className="list-disc pl-5">
							<li>marketing.example.com</li>
							<li>send.example.com</li>
							<li>transection.example.com</li>
						</ul>
					</div>
				</div>
				<div className="pt-5">
					<Button.Root
						variant="neutral"
						mode="filled"
						className="w-full"
						onClick={handleVerify}
						disabled={!data.domain || verifying}
					>
						{verifying ? (
							<Loader2 className="mr-2 animate-spin" size={16} />
						) : null}
						{verifying ? "Verifying" : "Verify Domain"}
					</Button.Root>
				</div>
			</div>

			{recordsVisible && (
				<div className="slide-in-from-bottom-4 fade-in mt-6 animate-in duration-500">
					<div className="mb-4 flex items-center justify-between">
						<h3 className="font-semibold text-text-strong-950">
							DNS Configuration
						</h3>
						<span className="rounded-full bg-warning-lighter px-2 py-1 font-medium text-text-strong-950 text-xs">
							Pending Verification
						</span>
					</div>

					<div className="space-y-3">
						{[
							{
								type: "TXT",
								name: "@",
								value: "v=spf1 include:mailinfra.com ~all",
							},
							{
								type: "CNAME",
								name: "mte1._domainkey",
								value: "dkim.mailinfra.com",
							},
						].map((record, idx) => (
							<div
								key={idx}
								className="group rounded-lg border border-stroke-soft-200 bg-bg-weak-50 p-4 transition-colors hover:border-primary-base"
							>
								<div className="mb-2 flex items-center justify-between">
									<div className="flex items-center gap-2">
										<span className="rounded border border-stroke-soft-200 bg-bg-white-0 px-2 py-0.5 font-bold font-mono text-text-sub-600 text-xs">
											{record.type}
										</span>
										<span className="font-medium text-sm text-text-strong-950">
											{record.name}
										</span>
									</div>
									<Button.Root
										variant="neutral"
										mode="ghost"
										size="xsmall"
										className="opacity-0 transition-opacity group-hover:opacity-100"
									>
										<Copy size={16} />
									</Button.Root>
								</div>
								<div className="break-all rounded border border-stroke-soft-100 bg-bg-white-0 p-2 font-mono text-text-sub-600 text-xs">
									{record.value}
								</div>
							</div>
						))}
					</div>
					<p className="mt-4 text-text-sub-600 text-xs">
						It may take up to 48 hours for DNS changes to propagate, although
						it's usually much faster.
					</p>
				</div>
			)}
		</div>
	);
};
