"use client";

import { Upload } from "lucide-react";
import type React from "react";

interface CreateOrgStepProps {
	data: {
		name: string;
		url: string;
		logo: File | null;
		logoPreview: string | null;
		country: string;
		referral: string;
	};
	updateData: (newData: Partial<CreateOrgStepProps["data"]>) => void;
}

export const CreateOrgStep = ({ data, updateData }: CreateOrgStepProps) => {
	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				updateData({ logo: file, logoPreview: reader.result as string });
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className="fade-in animate-in space-y-8 duration-500">
			{/* Logo Section */}
			<div>
				<label
					htmlFor="logo-upload"
					className="mb-3 block font-semibold text-slate-700 text-sm"
				>
					Company logo
				</label>
				<div className="flex items-start gap-6">
					<div
						className={`flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-slate-50 ${data.logoPreview ? "border-slate-200" : "border-slate-300 border-dashed"}`}
					>
						{data.logoPreview ? (
							<img
								src={data.logoPreview}
								alt="Preview"
								className="h-full w-full object-cover"
							/>
						) : (
							<span className="px-2 text-center font-medium text-slate-400 text-xs">
								No image
							</span>
						)}
					</div>
					<div className="flex flex-col gap-2 pt-1">
						<div className="flex items-center gap-3">
							<label
								htmlFor="logo-upload"
								className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 text-sm shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
							>
								<div className="flex items-center gap-2">
									<Upload size={16} />
									<span>Replace image</span>
								</div>
								<input
									id="logo-upload"
									type="file"
									accept="image/*"
									className="hidden"
									onChange={handleLogoChange}
								/>
							</label>
							{data.logoPreview && (
								<button
									type="button"
									onClick={() => updateData({ logo: null, logoPreview: null })}
									className="rounded-lg px-4 py-2 font-medium text-red-600 text-sm transition-colors hover:bg-red-50"
								>
									Remove
								</button>
							)}
						</div>
						<p className="mt-1 text-slate-500 text-xs">
							*.png, *.jpeg files up to 10MB at least 400px by 400px
						</p>
					</div>
				</div>
			</div>

			{/* Form Fields */}
			<div className="space-y-5">
				<div>
					<label
						htmlFor="company-name"
						className="mb-1.5 block font-semibold text-slate-700 text-sm"
					>
						Company Name
					</label>
					<input
						id="company-name"
						type="text"
						value={data.name}
						onChange={(e) =>
							updateData({
								name: e.target.value,
								url: e.target.value.toLowerCase().replace(/\s+/g, "-"),
							})
						}
						placeholder="e.g. Acme Corp"
						className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div>
					<label
						htmlFor="workspace-handle"
						className="mb-1.5 block font-semibold text-slate-700 text-sm"
					>
						Workspace handle
					</label>
					<div className="flex rounded-lg shadow-sm">
						<span className="inline-flex items-center rounded-l-lg border border-slate-300 border-r-0 bg-slate-50 px-4 font-medium text-slate-500 text-sm">
							app.mailinfra.com/
						</span>
						<input
							id="workspace-handle"
							type="text"
							value={data.url}
							onChange={(e) => updateData({ url: e.target.value })}
							className="block w-full min-w-0 flex-1 rounded-none rounded-r-lg border border-slate-300 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 sm:text-sm"
						/>
					</div>
				</div>

				<div>
					<label
						htmlFor="billing-country"
						className="mb-1.5 block font-semibold text-slate-700 text-sm"
					>
						Billing Country
					</label>
					<select
						id="billing-country"
						className="w-full appearance-none rounded-lg border border-slate-300 bg-[length:12px] bg-[right_1rem_center] bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-white bg-no-repeat px-4 py-2.5 text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
						value={data.country}
						onChange={(e) => updateData({ country: e.target.value })}
					>
						<option value="US">United States of America</option>
						<option value="UK">United Kingdom</option>
						<option value="CA">Canada</option>
						<option value="EU">European Union</option>
						<option value="IN">India</option>
					</select>
				</div>

				<div>
					<label
						htmlFor="referral"
						className="mb-1.5 block font-semibold text-slate-700 text-sm"
					>
						How did you hear about us?
					</label>
					<textarea
						id="referral"
						rows={3}
						placeholder="Share how you heard about MailInfra..."
						className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
						value={data.referral}
						onChange={(e) => updateData({ referral: e.target.value })}
					/>
				</div>
			</div>
		</div>
	);
};
