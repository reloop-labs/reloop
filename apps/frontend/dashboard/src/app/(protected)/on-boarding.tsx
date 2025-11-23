import {
	ArrowLeft,
	Building2,
	CheckCircle2,
	ChevronRight,
	Copy,
	Globe,
	Image as ImageIcon,
	Key,
	LayoutDashboard,
	Loader2,
	Mail,
	RefreshCw,
	Server,
	ShieldCheck,
	Terminal,
	Upload,
	X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

// --- Layout Components ---

const SplitLayout = ({
	stepIndicator,
	title,
	description,
	children,
	previewContent,
	onBack,
	onNext,
	canProceed,
	isLastStep,
}) => {
	return (
		<div className="flex min-h-screen bg-white font-sans text-slate-900">
			{/* Left Panel - Form */}
			<div className="flex w-full flex-col overflow-y-auto border-slate-100 border-r px-8 py-12 lg:w-[55%] lg:px-24 lg:py-16">
				{/* Header / Nav */}
				<div className="mb-12">
					<div className="mb-8 flex items-center justify-between">
						{/* Simple Logo placeholder */}
						<div className="flex items-center gap-2 font-bold text-slate-900 text-xl">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
								<Mail size={16} />
							</div>
							<span>MailInfra</span>
						</div>
					</div>
					<div className="mb-2 font-medium text-slate-400 text-sm">
						{stepIndicator}
					</div>
					<h1 className="mb-3 font-bold text-3xl text-slate-900">{title}</h1>
					<p className="text-lg text-slate-500">{description}</p>
				</div>

				{/* Main Form Content */}
				<div className="flex-1">{children}</div>

				{/* Footer Actions */}
				<div className="mt-12 flex items-center justify-between pt-6">
					{onBack && (
						<button
							onClick={onBack}
							className="rounded-lg px-4 py-2 font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
						>
							Back
						</button>
					)}
					<div className="ml-auto">
						{" "}
						{/* Spacer if no back button */}
						<button
							onClick={onNext}
							disabled={!canProceed}
							className={`flex w-full items-center justify-center rounded-xl px-8 py-3.5 font-semibold text-base transition-all sm:w-auto ${
								canProceed
									? "hover:-translate-y-0.5 transform bg-blue-600 text-white shadow-blue-600/20 shadow-lg hover:bg-blue-700"
									: "cursor-not-allowed bg-slate-100 text-slate-400"
							}`}
						>
							{isLastStep ? "Finish Setup" : "Continue"}
						</button>
					</div>
				</div>
			</div>

			{/* Right Panel - Live Preview */}
			<div className="relative hidden flex-col items-center justify-center overflow-hidden bg-slate-50 p-12 lg:flex lg:w-[45%]">
				{/* Decorative Background Elements */}
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute top-[20%] right-[10%] h-64 w-64 rounded-full bg-blue-100 opacity-60 mix-blend-multiply blur-3xl" />
					<div className="absolute bottom-[20%] left-[10%] h-64 w-64 rounded-full bg-indigo-100 opacity-60 mix-blend-multiply blur-3xl" />
				</div>

				{/* Preview Card */}
				<div className="fade-in slide-in-from-bottom-8 relative z-10 w-full max-w-md animate-in duration-700">
					{previewContent}
				</div>
			</div>
		</div>
	);
};

// --- Preview Components ---

const SidebarPreview = ({ name, logo }) => {
	return (
		<div className="flex h-[500px] w-full flex-col overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-2xl">
			<div className="flex items-center gap-2 border-slate-100 border-b bg-white p-3">
				<div className="flex gap-1.5">
					<div className="h-3 w-3 rounded-full bg-red-400/80" />
					<div className="h-3 w-3 rounded-full bg-amber-400/80" />
					<div className="h-3 w-3 rounded-full bg-green-400/80" />
				</div>
				<div className="ml-4 flex-1 rounded-md bg-slate-100 px-3 py-1 text-center font-mono text-slate-400 text-xs">
					app.mailinfra.com/dashboard
				</div>
			</div>
			<div className="flex flex-1 overflow-hidden">
				{/* Sidebar */}
				<div className="flex w-64 flex-col gap-6 border-slate-100 border-r bg-slate-50 p-4">
					{/* Workspace Header */}
					<div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
							{logo ? (
								<img
									src={logo}
									alt="Logo"
									className="h-full w-full object-cover"
								/>
							) : (
								<span className="font-bold text-lg text-slate-400">
									{name ? name[0].toUpperCase() : "W"}
								</span>
							)}
						</div>
						<div className="min-w-0">
							<div className="truncate font-semibold text-slate-900 text-sm">
								{name || "Workspace"}
							</div>
							<div className="text-slate-500 text-xs">Free Plan</div>
						</div>
					</div>

					{/* Nav Items Mockup */}
					<div className="space-y-2">
						<div className="flex h-8 items-center gap-3 rounded-lg bg-blue-50 px-3 font-medium text-blue-600 text-sm">
							<LayoutDashboard size={16} /> Dashboard
						</div>
						<div className="flex h-8 items-center gap-3 px-3 font-medium text-slate-500 text-sm opacity-60">
							<Mail size={16} /> Campaigns
						</div>
						<div className="flex h-8 items-center gap-3 px-3 font-medium text-slate-500 text-sm opacity-60">
							<Server size={16} /> Infrastructure
						</div>
					</div>

					<div className="mt-auto border-slate-200 border-t pt-4">
						<div className="flex items-center gap-2 opacity-50">
							<div className="h-8 w-8 rounded-full bg-slate-200" />
							<div className="flex-1 space-y-1">
								<div className="h-2 w-20 rounded bg-slate-200" />
								<div className="h-2 w-12 rounded bg-slate-200" />
							</div>
						</div>
					</div>
				</div>

				{/* Main Content Area Mockup */}
				<div className="flex-1 bg-white p-6">
					<div className="mb-6 h-8 w-32 rounded bg-slate-100" />
					<div className="grid grid-cols-2 gap-4">
						<div className="h-24 rounded-xl border border-slate-100 bg-slate-50" />
						<div className="h-24 rounded-xl border border-slate-100 bg-slate-50" />
					</div>
					<div className="mt-6 h-40 rounded-xl border border-slate-100 bg-slate-50" />
				</div>
			</div>
		</div>
	);
};

const ApiPreview = ({ apiKey }) => {
	return (
		<div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-[#1E1E1E] font-mono text-sm shadow-2xl">
			<div className="flex items-center justify-between bg-[#2D2D2D] px-4 py-3">
				<div className="flex gap-1.5">
					<div className="h-3 w-3 rounded-full bg-[#FF5F56]" />
					<div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
					<div className="h-3 w-3 rounded-full bg-[#27C93F]" />
				</div>
				<div className="text-gray-400 text-xs">curl request</div>
			</div>
			<div className="overflow-x-auto p-6 text-gray-300 leading-relaxed">
				<div className="flex">
					<span className="mr-2 text-[#569CD6]">curl</span>
					<span className="text-[#CE9178]">-X POST</span>
					<span className="ml-2 text-[#9CDCFE]">
						https://api.mailinfra.com/v1/send
					</span>
					<span className="text-white"> \</span>
				</div>
				<div className="pl-4">
					<span className="text-[#CE9178]">-H</span>{" "}
					<span className="text-[#9CDCFE]">
						"Authorization: Bearer{" "}
						<span className="rounded bg-[#4EC9B0]/10 px-1 text-[#4EC9B0]">
							{apiKey || "mi_live_..."}
						</span>
						"
					</span>{" "}
					<span className="text-white">\</span>
				</div>
				<div className="pl-4">
					<span className="text-[#CE9178]">-H</span>{" "}
					<span className="text-[#9CDCFE]">
						"Content-Type: application/json"
					</span>{" "}
					<span className="text-white">\</span>
				</div>
				<div className="pl-4">
					<span className="text-[#CE9178]">-d</span>{" "}
					<span className="text-[#CE9178]">'</span>
					<span className="text-white">{"{"}</span>
				</div>
				<div className="pl-8">
					<span className="text-[#9CDCFE]">"to"</span>:{" "}
					<span className="text-[#CE9178]">"user@example.com"</span>,
				</div>
				<div className="pl-8">
					<span className="text-[#9CDCFE]">"subject"</span>:{" "}
					<span className="text-[#CE9178]">"Welcome aboard!"</span>
				</div>
				<div className="pl-4">
					<span className="text-white">{"}"}</span>
					<span className="text-[#CE9178]">'</span>
				</div>
			</div>
		</div>
	);
};

const DomainPreview = ({ domain }) => {
	return (
		<div className="w-full max-w-md">
			<div className="mb-4 rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
				<div className="flex items-center gap-3 rounded-lg border-slate-100 border-b bg-slate-50 p-3">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
						<Mail size={16} />
					</div>
					<div className="min-w-0 flex-1">
						<div className="mb-1.5 h-2 w-24 rounded bg-slate-200" />
						<div className="h-2 w-16 rounded bg-slate-200" />
					</div>
					<div className="text-slate-400 text-xs">Just now</div>
				</div>
				<div className="space-y-3 p-4">
					<div className="h-2 w-3/4 rounded bg-slate-100" />
					<div className="h-2 w-full rounded bg-slate-100" />
					<div className="h-2 w-5/6 rounded bg-slate-100" />
				</div>
			</div>

			{/* Security Badge Preview */}
			<div className="slide-in-from-bottom-2 fade-in flex animate-in items-center gap-3 rounded-xl border border-green-100 bg-green-50 p-4 duration-500">
				<div className="rounded-full bg-green-100 p-2 text-green-600">
					<ShieldCheck size={20} />
				</div>
				<div>
					<div className="font-semibold text-green-800 text-sm">
						Signed & Verified
					</div>
					<div className="text-green-700 text-xs">
						Mailed by{" "}
						<span className="font-medium font-mono">
							{domain || "your-domain.com"}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

// --- Step Components ---

const WorkspaceStep = ({ data, updateData }) => {
	const handleLogoChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				updateData({ logo: file, logoPreview: reader.result });
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className="fade-in animate-in space-y-8 duration-500">
			{/* Logo Section */}
			<div>
				<label className="mb-3 block font-semibold text-slate-700 text-sm">
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
							<label className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 text-sm shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50">
								<div className="flex items-center gap-2">
									<Upload size={16} />
									<span>Replace image</span>
								</div>
								<input
									type="file"
									accept="image/*"
									className="hidden"
									onChange={handleLogoChange}
								/>
							</label>
							{data.logoPreview && (
								<button
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
					<label className="mb-1.5 block font-semibold text-slate-700 text-sm">
						Company Name
					</label>
					<input
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
					<label className="mb-1.5 block font-semibold text-slate-700 text-sm">
						Workspace handle
					</label>
					<div className="flex rounded-lg shadow-sm">
						<span className="inline-flex items-center rounded-l-lg border border-slate-300 border-r-0 bg-slate-50 px-4 font-medium text-slate-500 text-sm">
							app.mailinfra.com/
						</span>
						<input
							type="text"
							value={data.url}
							onChange={(e) => updateData({ url: e.target.value })}
							className="block w-full min-w-0 flex-1 rounded-none rounded-r-lg border border-slate-300 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500 sm:text-sm"
						/>
					</div>
				</div>

				<div>
					<label className="mb-1.5 block font-semibold text-slate-700 text-sm">
						Billing Country
					</label>
					<select
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
					<label className="mb-1.5 block font-semibold text-slate-700 text-sm">
						How did you hear about us?
					</label>
					<textarea
						rows="3"
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

const ApiKeyStep = ({ data, updateData }) => {
	const [loading, setLoading] = useState(false);
	const [copied, setCopied] = useState(false);

	const generateKey = () => {
		setLoading(true);
		setTimeout(() => {
			const key =
				"mi_live_" +
				Math.random().toString(36).substring(2, 15) +
				Math.random().toString(36).substring(2, 15);
			updateData({ apiKey: key });
			setLoading(false);
		}, 1200);
	};

	const copyToClipboard = () => {
		navigator.clipboard.writeText(data.apiKey);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className="fade-in animate-in space-y-6 duration-500">
			{!data.apiKey ? (
				<div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
						<Key size={32} />
					</div>
					<h3 className="mb-2 font-semibold text-lg text-slate-900">
						Generate Secret Key
					</h3>
					<p className="mx-auto mb-6 max-w-sm text-slate-500">
						You need an API key to authenticate your requests. This key grants
						full access to your account.
					</p>
					<button
						onClick={generateKey}
						disabled={loading}
						className="inline-flex items-center rounded-xl bg-slate-900 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-70"
					>
						{loading ? (
							<Loader2 className="mr-2 animate-spin" size={18} />
						) : (
							<RefreshCw className="mr-2" size={18} />
						)}
						Generate API Key
					</button>
				</div>
			) : (
				<div className="space-y-6">
					<div className="flex gap-4 rounded-xl border border-amber-100 bg-amber-50 p-5">
						<div className="mt-1 text-amber-600">
							<ShieldCheck size={24} />
						</div>
						<div>
							<h4 className="font-semibold text-amber-900">
								Keep this key secret
							</h4>
							<p className="mt-1 text-amber-700 text-sm leading-relaxed">
								We only show this key once. If you lose it, you will need to
								generate a new one and update your applications.
							</p>
						</div>
					</div>

					<div>
						<label className="mb-2 block font-semibold text-slate-700 text-sm">
							Your API Key
						</label>
						<div className="group relative">
							<input
								type="text"
								readOnly
								value={data.apiKey}
								className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-14 font-mono text-slate-600 text-sm transition-colors focus:border-blue-500 focus:outline-none"
							/>
							<button
								onClick={copyToClipboard}
								className="-translate-y-1/2 absolute top-1/2 right-2 transform rounded-md p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
								title="Copy to clipboard"
							>
								{copied ? (
									<CheckCircle2 size={18} className="text-green-500" />
								) : (
									<Copy size={18} />
								)}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

const DomainStep = ({ data, updateData }) => {
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
				<label className="mb-1.5 block font-semibold text-slate-700 text-sm">
					Domain Name
				</label>
				<div className="flex gap-3">
					<div className="relative flex-1">
						<Globe
							className="-translate-y-1/2 absolute top-1/2 left-3 transform text-slate-400"
							size={18}
						/>
						<input
							type="text"
							placeholder="e.g. mail.yourcompany.com"
							value={data.domain}
							onChange={(e) => updateData({ domain: e.target.value })}
							className="w-full rounded-lg border border-slate-300 py-2.5 pr-4 pl-10 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
						/>
					</div>
					<button
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
									<button className="text-slate-400 opacity-0 transition-opacity hover:text-blue-600 group-hover:opacity-100">
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

// --- Main Application ---

export default function App() {
	const [step, setStep] = useState(1);
	const [formData, setFormData] = useState({
		name: "",
		url: "",
		logo: null,
		logoPreview: null,
		apiKey: "",
		domain: "",
		country: "US",
		referral: "",
	});

	const updateData = (newData) => {
		setFormData((prev) => ({ ...prev, ...newData }));
	};

	const canProceed = () => {
		if (step === 1) return formData.name.length > 0;
		if (step === 2) return formData.apiKey.length > 0;
		if (step === 3) return true;
		return false;
	};

	// Configuration for each step
	const stepsConfig = {
		1: {
			stepIndicator: "1/3",
			title: "Create your workspace",
			description: "Let's set up your team's environment.",
			component: <WorkspaceStep data={formData} updateData={updateData} />,
			preview: (
				<SidebarPreview name={formData.name} logo={formData.logoPreview} />
			),
		},
		2: {
			stepIndicator: "2/3",
			title: "Generate API Credentials",
			description: "Securely connect your application to our infrastructure.",
			component: <ApiKeyStep data={formData} updateData={updateData} />,
			preview: <ApiPreview apiKey={formData.apiKey} />,
		},
		3: {
			stepIndicator: "3/3",
			title: "Verify Sending Domain",
			description: "Ensure high deliverability by verifying domain ownership.",
			component: <DomainStep data={formData} updateData={updateData} />,
			preview: <DomainPreview domain={formData.domain} />,
		},
	};

	const currentConfig = stepsConfig[step];

	if (step === 4) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-white p-4">
				<div className="zoom-in max-w-md animate-in text-center duration-500">
					<div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600">
						<CheckCircle2 size={48} />
					</div>
					<h2 className="mb-4 font-bold text-3xl text-slate-900">
						Setup Complete!
					</h2>
					<p className="mb-8 text-lg text-slate-500">
						Your workspace{" "}
						<span className="font-semibold text-slate-900">
							{formData.name}
						</span>{" "}
						is ready. Redirecting you to the dashboard...
					</p>
					<button className="hover:-translate-y-1 w-full transform rounded-xl bg-slate-900 py-4 font-semibold text-white shadow-xl transition-all hover:shadow-2xl">
						Go to Dashboard
					</button>
				</div>
			</div>
		);
	}

	return (
		<SplitLayout
			stepIndicator={currentConfig.stepIndicator}
			title={currentConfig.title}
			description={currentConfig.description}
			previewContent={currentConfig.preview}
			onBack={step > 1 ? () => setStep((s) => s - 1) : null}
			onNext={() => setStep((s) => s + 1)}
			canProceed={canProceed()}
			isLastStep={step === 3}
		>
			{currentConfig.component}
		</SplitLayout>
	);
}
