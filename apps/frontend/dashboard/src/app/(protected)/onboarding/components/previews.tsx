"use client";

import { LayoutDashboard, Mail, Server, ShieldCheck } from "lucide-react";

interface SidebarPreviewProps {
	name?: string;
	logo?: string | null;
}

export const SidebarPreview = ({ name, logo }: SidebarPreviewProps) => {
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
									{name && name.length > 0 ? name[0]?.toUpperCase() : "W"}
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

interface ApiPreviewProps {
	apiKey?: string;
}

export const ApiPreview = ({ apiKey }: ApiPreviewProps) => {
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

interface DomainPreviewProps {
	domain?: string;
}

export const DomainPreview = ({ domain }: DomainPreviewProps) => {
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
