"use client";

import { LayoutDashboard, Mail, Server, ShieldCheck } from "lucide-react";

interface SidebarPreviewProps {
	name?: string;
	logo?: string | null;
}

export const SidebarPreview = ({ name, logo }: SidebarPreviewProps) => {
	return (
		<div className="flex h-[500px] w-full flex-col overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-2xl">
			<div className="flex items-center gap-2 border-stroke-soft-100 border-b bg-bg-white-0 p-3">
				<div className="flex gap-1.5">
					<div className="h-3 w-3 rounded-full bg-error-base/80" />
					<div className="h-3 w-3 rounded-full bg-warning-base/80" />
					<div className="h-3 w-3 rounded-full bg-success-base/80" />
				</div>
				<div className="ml-4 flex-1 rounded-md bg-bg-weak-50 px-3 py-1 text-center font-mono text-text-soft-400 text-xs">
					app.mailinfra.com/dashboard
				</div>
			</div>
			<div className="flex flex-1 overflow-hidden">
				{/* Sidebar */}
				<div className="flex w-64 flex-col gap-6 border-stroke-soft-100 border-r bg-bg-weak-50 p-4">
					{/* Workspace Header */}
					<div className="flex items-center gap-3 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-2 shadow-sm">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stroke-soft-200 bg-bg-weak-50">
							{logo ? (
								<img
									src={logo}
									alt="Logo"
									className="h-full w-full object-cover"
								/>
							) : (
								<span className="font-bold text-lg text-text-soft-400">
									{name && name.length > 0 ? name[0]?.toUpperCase() : "W"}
								</span>
							)}
						</div>
						<div className="min-w-0">
							<div className="truncate font-semibold text-sm text-text-strong-950">
								{name || "Workspace"}
							</div>
							<div className="text-text-sub-600 text-xs">Free Plan</div>
						</div>
					</div>

					{/* Nav Items Mockup */}
					<div className="space-y-2">
						<div className="flex h-8 items-center gap-3 rounded-lg bg-primary-lighter px-3 font-medium text-primary-base text-sm">
							<LayoutDashboard size={16} /> Dashboard
						</div>
						<div className="flex h-8 items-center gap-3 px-3 font-medium text-sm text-text-sub-600 opacity-60">
							<Mail size={16} /> Campaigns
						</div>
						<div className="flex h-8 items-center gap-3 px-3 font-medium text-sm text-text-sub-600 opacity-60">
							<Server size={16} /> Infrastructure
						</div>
					</div>

					<div className="mt-auto border-stroke-soft-200 border-t pt-4">
						<div className="flex items-center gap-2 opacity-50">
							<div className="h-8 w-8 rounded-full bg-bg-soft-200" />
							<div className="flex-1 space-y-1">
								<div className="h-2 w-20 rounded bg-bg-soft-200" />
								<div className="h-2 w-12 rounded bg-bg-soft-200" />
							</div>
						</div>
					</div>
				</div>

				{/* Main Content Area Mockup */}
				<div className="flex-1 bg-bg-white-0 p-6">
					<div className="mb-6 h-8 w-32 rounded bg-bg-weak-50" />
					<div className="grid grid-cols-2 gap-4">
						<div className="h-24 rounded-xl border border-stroke-soft-100 bg-bg-weak-50" />
						<div className="h-24 rounded-xl border border-stroke-soft-100 bg-bg-weak-50" />
					</div>
					<div className="mt-6 h-40 rounded-xl border border-stroke-soft-100 bg-bg-weak-50" />
				</div>
			</div>
		</div>
	);
};

interface ApiPreviewProps {
	apiKey?: string;
}

export const ApiPreview = ({ apiKey }: ApiPreviewProps) => {
	return (
		<div className="w-full max-w-lg overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-strong-950 font-mono text-sm shadow-2xl">
			<div className="flex items-center justify-between bg-bg-surface-800 px-4 py-3">
				<div className="flex gap-1.5">
					<div className="h-3 w-3 rounded-full bg-error-base" />
					<div className="h-3 w-3 rounded-full bg-warning-base" />
					<div className="h-3 w-3 rounded-full bg-success-base" />
				</div>
				<div className="text-text-soft-400 text-xs">curl request</div>
			</div>
			<div className="overflow-x-auto p-6 text-text-sub-600 leading-relaxed">
				<div className="flex">
					<span className="mr-2 text-information-base">curl</span>
					<span className="text-warning-base">-X POST</span>
					<span className="ml-2 text-information-light">
						https://api.mailinfra.com/v1/send
					</span>
					<span className="text-text-strong-950"> \</span>
				</div>
				<div className="pl-4">
					<span className="text-warning-base">-H</span>{" "}
					<span className="text-information-light">
						"Authorization: Bearer{" "}
						<span className="rounded bg-success-alpha-10 px-1 text-success-base">
							{apiKey || "mi_live_..."}
						</span>
						"
					</span>{" "}
					<span className="text-text-strong-950">\</span>
				</div>
				<div className="pl-4">
					<span className="text-warning-base">-H</span>{" "}
					<span className="text-information-light">
						"Content-Type: application/json"
					</span>{" "}
					<span className="text-text-strong-950">\</span>
				</div>
				<div className="pl-4">
					<span className="text-warning-base">-d</span>{" "}
					<span className="text-warning-base">'</span>
					<span className="text-text-strong-950">{"{"}</span>
				</div>
				<div className="pl-8">
					<span className="text-information-light">"to"</span>:{" "}
					<span className="text-warning-base">"user@example.com"</span>,
				</div>
				<div className="pl-8">
					<span className="text-information-light">"subject"</span>:{" "}
					<span className="text-warning-base">"Welcome aboard!"</span>
				</div>
				<div className="pl-4">
					<span className="text-text-strong-950">{"}"}</span>
					<span className="text-warning-base">'</span>
				</div>
			</div>
		</div>
	);
};

interface DomainPreviewProps {
	domain?: string;
}

export const DomainPreview = ({ domain }: DomainPreviewProps) => {
	return (
		<div className="w-full max-w-md">
			<div className="mb-4 rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-1 shadow-xl">
				<div className="flex items-center gap-3 rounded-lg border-stroke-soft-100 border-b bg-bg-weak-50 p-3">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-information-lighter text-information-base">
						<Mail size={16} />
					</div>
					<div className="min-w-0 flex-1">
						<div className="mb-1.5 h-2 w-24 rounded bg-bg-soft-200" />
						<div className="h-2 w-16 rounded bg-bg-soft-200" />
					</div>
					<div className="text-text-soft-400 text-xs">Just now</div>
				</div>
				<div className="space-y-3 p-4">
					<div className="h-2 w-3/4 rounded bg-bg-weak-50" />
					<div className="h-2 w-full rounded bg-bg-weak-50" />
					<div className="h-2 w-5/6 rounded bg-bg-weak-50" />
				</div>
			</div>

			{/* Security Badge Preview */}
			<div className="slide-in-from-bottom-2 fade-in flex animate-in items-center gap-3 rounded-xl border border-success-lighter bg-success-lighter p-4 duration-500">
				<div className="rounded-full bg-success-lighter p-2 text-success-base">
					<ShieldCheck size={20} />
				</div>
				<div>
					<div className="font-semibold text-sm text-text-strong-950">
						Signed & Verified
					</div>
					<div className="text-text-sub-600 text-xs">
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
