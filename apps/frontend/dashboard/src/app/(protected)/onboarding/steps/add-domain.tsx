"use client";

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
			<div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
				<p className="text-blue-800 text-sm leading-relaxed">
					Adding a sending domain improves your deliverability and removes the
					"via mailinfra.com" label from your emails.
				</p>
			</div>

			<div>
				<label
					htmlFor="domain-name"
					className="mb-1.5 block font-semibold text-slate-700 text-sm"
				>
					Domain Name
				</label>
				<div className="flex gap-3">
					<div className="relative flex-1">
						<Globe
							className="-translate-y-1/2 absolute top-1/2 left-3 transform text-slate-400"
							size={18}
						/>
						<input
							id="domain-name"
							type="text"
							placeholder="e.g. mail.yourcompany.com"
							value={data.domain}
							onChange={(e) => updateData({ domain: e.target.value })}
							className="w-full rounded-lg border border-slate-300 py-2.5 pr-4 pl-10 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<button
						type="button"
						onClick={handleVerify}
						disabled={!data.domain || verifying}
						className="flex items-center whitespace-nowrap rounded-lg bg-slate-900 px-6 py-2.5 font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
					>
						{verifying ? (
							<Loader2 className="mr-2 animate-spin" size={16} />
						) : null}
						{verifying ? "Verifying" : "Verify Domain"}
					</button>
				</div>
			</div>

			{recordsVisible && (
				<div className="slide-in-from-bottom-4 fade-in mt-6 animate-in duration-500">
					<div className="mb-4 flex items-center justify-between">
						<h3 className="font-semibold text-slate-900">DNS Configuration</h3>
						<span className="rounded-full bg-amber-100 px-2 py-1 font-medium text-amber-800 text-xs">
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
								className="group rounded-lg border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-blue-300"
							>
								<div className="mb-2 flex items-center justify-between">
									<div className="flex items-center gap-2">
										<span className="rounded border border-slate-200 bg-white px-2 py-0.5 font-bold font-mono text-slate-600 text-xs">
											{record.type}
										</span>
										<span className="font-medium text-slate-700 text-sm">
											{record.name}
										</span>
									</div>
									<button
										type="button"
										className="text-slate-400 opacity-0 transition-opacity hover:text-blue-600 group-hover:opacity-100"
									>
										<Copy size={16} />
									</button>
								</div>
								<div className="break-all rounded border border-slate-100 bg-white p-2 font-mono text-slate-500 text-xs">
									{record.value}
								</div>
							</div>
						))}
					</div>
					<p className="mt-4 text-slate-500 text-xs">
						It may take up to 48 hours for DNS changes to propagate, although
						it's usually much faster.
					</p>
				</div>
			)}
		</div>
	);
};
