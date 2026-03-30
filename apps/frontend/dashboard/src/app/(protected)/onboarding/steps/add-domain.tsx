"use client";

import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import * as Label from "@reloop/ui/label";
import * as Select from "@reloop/ui/select";
import * as Switch from "@reloop/ui/switch";
import axios from "axios";
import { Globe, Loader2 } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import { toast } from "sonner";

export const AddDomainStep = () => {
	const [domain, setDomain] = useQueryState(
		"domain",
		parseAsString.withDefault(""),
	);
	const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
	const [verifying, setVerifying] = useState(false);
	const [customReturnPath, setCustomReturnPath] = useState("send");
	const [clickTracking, setClickTracking] = useState(false);
	const [openTracking, setOpenTracking] = useState(false);
	const [tls, setTls] = useState<"opportunistic" | "enforced">(
		"opportunistic",
	);

	const handleVerify = async () => {
		if (!domain) return;
		setVerifying(true);
		try {
			await axios.post(
				"/api/domain/v1/create",
				{
					domain,
					customReturnPath,
					clickTracking,
					openTracking,
					tls,
				},
				{ headers: { credentials: "include" } },
			);
			setStep(step + 1);
		} catch (error) {
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.message || "Failed to add domain"
				: "Failed to add domain";
			toast.error(errorMessage);
		} finally {
			setVerifying(false);
		}
	};

	return (
		<div className="fade-in animate-in space-y-6 duration-500">
			<div className="flex flex-col gap-1">
				<Label.Root htmlFor="domain-name">Domain Name</Label.Root>
				<div className="flex gap-3">
					<Input.Root className="flex-1" size="small">
						<Input.Wrapper>
							<Input.Icon>
								<Globe size={18} />
							</Input.Icon>
							<Input.Input
								id="domain-name"
								type="text"
								placeholder="e.g. news.reloop.sh"
								value={domain}
								onChange={(e) => setDomain(e.target.value)}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
				<div className="space-y-3 rounded-2xl border border-stroke-soft-200 bg-bg-weak-50/50 p-4">
					<div>
						<p className="font-medium text-paragraph-sm text-text-strong-950">
							Advanced settings
						</p>
						<p className="text-paragraph-xs text-text-sub-600">
							Choose how Resend should handle return paths, tracking, and TLS.
						</p>
					</div>
					<div>
						<Label.Root htmlFor="custom-return-path">
							Custom Return Path
						</Label.Root>
						<Input.Root className="mt-1" size="small">
							<Input.Wrapper>
								<Input.Input
									id="custom-return-path"
									type="text"
									placeholder="send"
									value={customReturnPath}
									onChange={(e) => setCustomReturnPath(e.target.value)}
								/>
							</Input.Wrapper>
						</Input.Root>
					</div>
					<div>
						<Label.Root className="mb-2 block">TLS Mode</Label.Root>
						<Select.Root value={tls} onValueChange={(value) => setTls(value as "opportunistic" | "enforced")}>
							<Select.Trigger className="w-full">
								<Select.Value />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="opportunistic">
									Opportunistic TLS
								</Select.Item>
								<Select.Item value="enforced">Enforced TLS</Select.Item>
							</Select.Content>
						</Select.Root>
					</div>
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="flex items-center justify-between rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3">
							<div>
								<p className="font-medium text-paragraph-sm">Click Tracking</p>
								<p className="text-paragraph-xs text-text-sub-600">
									Track link clicks.
								</p>
							</div>
							<Switch.Root
								checked={clickTracking}
								onCheckedChange={setClickTracking}
								disabled={verifying}
								checkedColor="orange"
							/>
						</div>
						<div className="flex items-center justify-between rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3">
							<div>
								<p className="font-medium text-paragraph-sm">Open Tracking</p>
								<p className="text-paragraph-xs text-text-sub-600">
									Track email opens.
								</p>
							</div>
							<Switch.Root
								checked={openTracking}
								onCheckedChange={setOpenTracking}
								disabled={verifying}
								checkedColor="orange"
							/>
						</div>
					</div>
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
						disabled={!domain || verifying}
					>
						{verifying ? (
							<Loader2 className="mr-2 animate-spin" size={16} />
						) : null}
						{verifying ? "Verifying" : "Verify Domain"}
					</Button.Root>
				</div>
			</div>
		</div>
	);
};
