import { Logo } from "@reloop/ui/logo";
import type { ReactNode } from "react";

export function PreferenceShell({
	children,
	email,
	emailLabel = "Managing preferences for",
}: {
	children: ReactNode;
	email?: string;
	emailLabel?: string;
}) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-black px-4 py-12">
			<div className="w-full max-w-[450px]">
				<div className="relative overflow-hidden">
					<div className="mb-8 flex justify-center">
						<a
							href="https://reloop.sh/home"
							aria-label="Reloop home"
							className="transition-opacity hover:opacity-80"
						>
							<Logo className="h-20" />
						</a>
					</div>
					{children}
					<div className="mt-10 flex flex-col items-center gap-4">
						<a
							href="https://reloop.sh/home"
							aria-label="Reloop home"
							className="flex items-center justify-center gap-2 transition-opacity hover:opacity-80"
						>
							<span className="text-[11px] text-white/25">Powered by</span>
							<div className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/5 shadow-inner">
								<Logo className="h-3 w-3" />
							</div>
							<span className="font-semibold text-[11px] text-white/40 tracking-tight">
								Reloop
							</span>
						</a>
						{email ? (
							<p className="text-center text-[11px] text-white/20 leading-relaxed">
								{emailLabel}
								<br />
								<span className="text-white/40">{email}</span>
							</p>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
}

export function PreferenceInvalid({
	title,
	description,
}: {
	title: string;
	description: string;
}) {
	return (
		<div className="flex min-h-screen items-center justify-center bg-black px-4 py-12">
			<div className="w-full max-w-[600px]">
				<div className="rounded-[32px] bg-[#111113] p-10 text-center shadow-2xl ring-1 ring-white/10">
					<div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/20">
						<svg
							className="h-8 w-8 text-red-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
							/>
						</svg>
					</div>
					<h1 className="mb-4 font-bold text-2xl text-white tracking-tight">
						{title}
					</h1>
					<p className="text-[15px] text-white/50 leading-relaxed">
						{description}
					</p>
				</div>
			</div>
		</div>
	);
}

export function PreferenceFallback() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-black px-4 py-12">
			<div className="w-full max-w-[450px]">
				<div className="animate-pulse space-y-6">
					<div className="mx-auto h-20 w-20 rounded-full bg-white/5" />
					<div className="mx-auto h-8 w-64 rounded-lg bg-white/5" />
					<div className="mx-auto h-4 w-48 rounded bg-white/5" />
					<div className="space-y-2">
						<div className="h-14 rounded-2xl bg-white/5" />
						<div className="h-14 rounded-2xl bg-white/5" />
					</div>
					<div className="h-14 rounded-2xl bg-white/10" />
				</div>
			</div>
		</div>
	);
}
