"use client";

import { CodeBlock } from "@reloop/ui/code-block";
import { Icon } from "@reloop/ui/icon";
import { Mail, ShieldCheck } from "lucide-react";

interface SidebarPreviewProps {
	name: string;
	logo: string | null;
	slug: string;
}

export const SidebarPreview = ({ name, logo, slug }: SidebarPreviewProps) => {
	return (
		<div className="absolute top-32 left-28">
			<div className="relative flex h-[520px] w-[480px] flex-col overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-2xl">
				<div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-bg-white-0 to-transparent" />
				<div className="flex items-center gap-2 border-stroke-soft-100 border-b bg-bg-white-0 p-3">
					<div className="flex gap-1.5">
						<div className="h-3 w-3 rounded-full bg-error-base/80" />
						<div className="h-3 w-3 rounded-full bg-warning-base/80" />
						<div className="h-3 w-3 rounded-full bg-success-base/80" />
					</div>
					<div className="ml-4 flex-1 rounded-md bg-bg-weak-50 px-3 py-1 text-center font-mono text-text-soft-400 text-xs">
						reloop.sh/dashboard/{slug}
					</div>
				</div>
				<div className="flex flex-1 overflow-hidden">
					<div className="flex w-52 flex-col gap-2 border-stroke-soft-100 border-r">
						<div className="flex w-full items-center gap-2 border-stroke-soft-100 border-b px-4 py-2">
							{logo ? (
								<img src={logo} alt="Logo" className="h-6 w-6 object-cover" />
							) : (
								<span className="flex h-6 w-6 items-center justify-center rounded-lg border border-stroke-soft-200 p-1 font-bold text-xs">
									{name && name.length > 0 ? name[0]?.toUpperCase() : "W"}
								</span>
							)}
							<p className="text-text-soft-400">/</p>
							<div className="truncate font-semibold text-xs">
								{name || "Workspace"}
							</div>
							<Icon
								name="chevron-down"
								className="h-3 w-3 text-text-soft-400"
							/>
						</div>

						<div className="space-y-1 px-4">
							<div className="flex h-8 items-center gap-3 opacity-50">
								<div className="h-5 w-5 rounded-full bg-bg-soft-200" />
								<div className="h-[17px] w-40 rounded-full bg-bg-soft-200" />
							</div>

							<div className="flex h-8 items-center gap-3 opacity-50">
								<div className="h-5 w-5 rounded-full bg-bg-soft-200" />
								<div className="h-[17px] w-40 rounded-full bg-bg-soft-200" />
							</div>
							<div className="flex h-8 items-center gap-3 opacity-50">
								<div className="h-5 w-5 rounded-full bg-bg-soft-200" />
								<div className="h-[17px] w-40 rounded-full bg-bg-soft-200" />
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
		</div>
	);
};

interface ApiPreviewProps {
	apiKey?: string;
}

const myCodeString = `function hello() {
  console.log("Hello World!");
}`;

export const ApiPreview = ({ apiKey }: ApiPreviewProps) => {
	return (
		<div>
			<div className="flex items-center gap-4 border-stroke-soft-100 border-b bg-bg-white-0 p-3">
				<div className="flex gap-1.5">
					<div className="h-3 w-3 rounded-full bg-error-base/80" />
					<div className="h-3 w-3 rounded-full bg-warning-base/80" />
					<div className="h-3 w-3 rounded-full bg-success-base/80" />
				</div>
				<div className="flex items-center gap-2">
					<span className="text-base">
						<svg
							className="h-4 w-4"
							viewBox="0 0 256 292"
							xmlnsXlink="http://www.w3.org/1999/xlink"
						>
							<defs>
								<linearGradient
									id="nodejs__a"
									x1="68.188%"
									x2="27.823%"
									y1="17.487%"
									y2="89.755%"
								>
									<stop offset="0%" stopColor="#41873F" />
									<stop offset="32.88%" stopColor="#418B3D" />
									<stop offset="63.52%" stopColor="#419637" />
									<stop offset="93.19%" stopColor="#3FA92D" />
									<stop offset="100%" stopColor="#3FAE2A" />
								</linearGradient>
								<linearGradient
									id="nodejs__c"
									x1="43.277%"
									x2="159.245%"
									y1="55.169%"
									y2="-18.306%"
								>
									<stop offset="13.76%" stopColor="#41873F" />
									<stop offset="40.32%" stopColor="#54A044" />
									<stop offset="71.36%" stopColor="#66B848" />
									<stop offset="90.81%" stopColor="#6CC04A" />
								</linearGradient>
								<linearGradient
									id="nodejs__f"
									x1="-4.389%"
									x2="101.499%"
									y1="49.997%"
									y2="49.997%"
								>
									<stop offset="9.192%" stopColor="#6CC04A" />
									<stop offset="28.64%" stopColor="#66B848" />
									<stop offset="59.68%" stopColor="#54A044" />
									<stop offset="86.24%" stopColor="#41873F" />
								</linearGradient>
								<path
									id="nodejs__b"
									d="M134.923 1.832c-4.344-2.443-9.502-2.443-13.846 0L6.787 67.801C2.443 70.244 0 74.859 0 79.745v132.208c0 4.887 2.715 9.502 6.787 11.945l114.29 65.968c4.344 2.444 9.502 2.444 13.846 0l114.29-65.968c4.344-2.443 6.787-7.058 6.787-11.945V79.745c0-4.886-2.715-9.501-6.787-11.944L134.923 1.832Z"
								/>
								<path
									id="nodejs__e"
									d="M134.923 1.832c-4.344-2.443-9.502-2.443-13.846 0L6.787 67.801C2.443 70.244 0 74.859 0 79.745v132.208c0 4.887 2.715 9.502 6.787 11.945l114.29 65.968c4.344 2.444 9.502 2.444 13.846 0l114.29-65.968c4.344-2.443 6.787-7.058 6.787-11.945V79.745c0-4.886-2.715-9.501-6.787-11.944L134.923 1.832Z"
								/>
							</defs>
							<path
								fill="url(#nodejs__a)"
								d="M134.923 1.832c-4.344-2.443-9.502-2.443-13.846 0L6.787 67.801C2.443 70.244 0 74.859 0 79.745v132.208c0 4.887 2.715 9.502 6.787 11.945l114.29 65.968c4.344 2.444 9.502 2.444 13.846 0l114.29-65.968c4.344-2.443 6.787-7.058 6.787-11.945V79.745c0-4.886-2.715-9.501-6.787-11.944L134.923 1.832Z"
							/>
							<mask id="nodejs__d" fill="#fff">
								<use xlinkHref="#nodejs__b" />
							</mask>
							<path
								fill="url(#nodejs__c)"
								d="M249.485 67.8 134.65 1.833c-1.086-.542-2.443-1.085-3.529-1.357L2.443 220.912c1.086 1.357 2.444 2.443 3.8 3.258l114.834 65.968c3.258 1.9 7.059 2.443 10.588 1.357L252.47 70.515c-.815-1.086-1.9-1.9-2.986-2.714Z"
								mask="url(#nodejs__d)"
							/>
							<mask id="nodejs__g" fill="#fff">
								<use xlinkHref="#nodejs__e" />
							</mask>
							<path
								fill="url(#nodejs__f)"
								d="M249.756 223.898c3.258-1.9 5.701-5.158 6.787-8.687L130.579.204c-3.258-.543-6.787-.272-9.773 1.628L6.786 67.53l122.979 224.238c1.628-.272 3.529-.815 5.158-1.63l114.833-66.239Z"
								mask="url(#nodejs__g)"
							/>
						</svg>
					</span>
					<span className="text-text-soft-400 text-xs">Node.js</span>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-base">
						<svg className="h-6 w-6 text-black" viewBox="0 0 207 78">
							<g fill="currentColor" fillRule="evenodd">
								<path d="m16.2 24.1c-.4 0-.5-.2-.3-.5l2.1-2.7c.2-.3.7-.5 1.1-.5h35.7c.4 0 .5.3.3.6l-1.7 2.6c-.2.3-.7.6-1 .6z" />
								<path d="m1.1 33.3c-.4 0-.5-.2-.3-.5l2.1-2.7c.2-.3.7-.5 1.1-.5h45.6c.4 0 .6.3.5.6l-.8 2.4c-.1.4-.5.6-.9.6z" />
								<path d="m25.3 42.5c-.4 0-.5-.3-.3-.6l1.4-2.5c.2-.3.6-.6 1-.6h20c.4 0 .6.3.6.7l-.2 2.4c0 .4-.4.7-.7.7z" />
								<g transform="translate(55)">
									<path d="m74.1 22.3c-6.3 1.6-10.6 2.8-16.8 4.4-1.5.4-1.6.5-2.9-1-1.5-1.7-2.6-2.8-4.7-3.8-6.3-3.1-12.4-2.2-18.1 1.5-6.8 4.4-10.3 10.9-10.2 19 .1 8 5.6 14.6 13.5 15.7 6.8.9 12.5-1.5 17-6.6.9-1.1 1.7-2.3 2.7-3.7-3.6 0-8.1 0-19.3 0-2.1 0-2.6-1.3-1.9-3 1.3-3.1 3.7-8.3 5.1-10.9.3-.6 1-1.6 2.5-1.6h36.4c-.2 2.7-.2 5.4-.6 8.1-1.1 7.2-3.8 13.8-8.2 19.6-7.2 9.5-16.6 15.4-28.5 17-9.8 1.3-18.9-.6-26.9-6.6-7.4-5.6-11.6-13-12.7-22.2-1.3-10.9 1.9-20.7 8.5-29.3 7.1-9.3 16.5-15.2 28-17.3 9.4-1.7 18.4-.6 26.5 4.9 5.3 3.5 9.1 8.3 11.6 14.1.6.9.2 1.4-1 1.7z" />
									<path
										d="m107.2 77.6c-9.1-.2-17.4-2.8-24.4-8.8-5.9-5.1-9.6-11.6-10.8-19.3-1.8-11.3 1.3-21.3 8.1-30.2 7.3-9.6 16.1-14.6 28-16.7 10.2-1.8 19.8-.8 28.5 5.1 7.9 5.4 12.8 12.7 14.1 22.3 1.7 13.5-2.2 24.5-11.5 33.9-6.6 6.7-14.7 10.9-24 12.8-2.7.5-5.4.6-8 .9zm23.8-40.4c-.1-1.3-.1-2.3-.3-3.3-1.8-9.9-10.9-15.5-20.4-13.3-9.3 2.1-15.3 8-17.5 17.4-1.8 7.8 2 15.7 9.2 18.9 5.5 2.4 11 2.1 16.3-.6 7.9-4.1 12.2-10.5 12.7-19.1z"
										fillRule="nonzero"
									/>
								</g>
							</g>
						</svg>
					</span>
					<span className="text-text-soft-400 text-xs">Go</span>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-base">
						<svg viewBox="0 -1 100 50" className="h-6 w-6 text-black">
							<path
								fill="currentColor"
								d="M7.579 10.123h14.204c4.169.035 7.19 1.237 9.063 3.604 1.873 2.367 2.491 5.6 1.855 9.699-.247 1.873-.795 3.71-1.643 5.512a16.385 16.385 0 01-3.392 4.876c-1.767 1.837-3.657 3.003-5.671 3.498a26.11 26.11 0 01-6.254.742h-6.36l-2.014 10.07H0l7.579-38.001m6.201 6.042l-3.18 15.9c.212.035.424.053.636.053h.742c3.392.035 6.219-.3 8.48-1.007 2.261-.742 3.781-3.321 4.558-7.738.636-3.71 0-5.848-1.908-6.413-1.873-.565-4.222-.83-7.049-.795-.424.035-.83.053-1.219.053h-1.113l.053-.053M41.093 0h7.314L46.34 10.123h6.572c3.604.071 6.289.813 8.056 2.226 1.802 1.413 2.332 4.099 1.59 8.056l-3.551 17.649h-7.42L54.979 21.2c.353-1.767.247-3.021-.318-3.763s-1.784-1.113-3.657-1.113l-5.883-.053-4.346 21.783h-7.314L41.093 0M70.412 10.123h14.204c4.169.035 7.19 1.237 9.063 3.604 1.873 2.367 2.491 5.6 1.855 9.699-.247 1.873-.795 3.71-1.643 5.512a16.385 16.385 0 01-3.392 4.876c-1.767 1.837-3.657 3.003-5.671 3.498a26.11 26.11 0 01-6.254.742h-6.36L70.2 48.124h-7.367l7.579-38.001m6.201 6.042l-3.18 15.9c.212.035.424.053.636.053h.742c3.392.035 6.219-.3 8.48-1.007 2.261-.742 3.781-3.321 4.558-7.738.636-3.71 0-5.848-1.908-6.413-1.873-.565-4.222-.83-7.049-.795-.424.035-.83.053-1.219.053H76.56l.053-.053"
							/>
						</svg>
					</span>
					<span className="text-text-soft-400 text-xs">PHP</span>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-base">
						<svg className="h-6 w-6" fill="none" viewBox="16 16 32 32">
							<path
								fill="url(#python__a)"
								d="M31.885 16c-8.124 0-7.617 3.523-7.617 3.523l.01 3.65h7.752v1.095H21.197S16 23.678 16 31.876c0 8.196 4.537 7.906 4.537 7.906h2.708v-3.804s-.146-4.537 4.465-4.537h7.688s4.32.07 4.32-4.175v-7.019S40.374 16 31.885 16zm-4.275 2.454a1.394 1.394 0 1 1 0 2.79 1.393 1.393 0 0 1-1.395-1.395c0-.771.624-1.395 1.395-1.395z"
							/>
							<path
								fill="url(#python__b)"
								d="M32.115 47.833c8.124 0 7.617-3.523 7.617-3.523l-.01-3.65H31.97v-1.095h10.832S48 40.155 48 31.958c0-8.197-4.537-7.906-4.537-7.906h-2.708v3.803s.146 4.537-4.465 4.537h-7.688s-4.32-.07-4.32 4.175v7.019s-.656 4.247 7.833 4.247zm4.275-2.454a1.393 1.393 0 0 1-1.395-1.395 1.394 1.394 0 1 1 1.395 1.395z"
							/>
							<defs>
								<linearGradient
									id="python__a"
									x1="19.075"
									x2="34.898"
									y1="18.782"
									y2="34.658"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#387EB8" />
									<stop offset={1} stopColor="#366994" />
								</linearGradient>
								<linearGradient
									id="python__b"
									x1="28.809"
									x2="45.803"
									y1="28.882"
									y2="45.163"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#FFE052" />
									<stop offset={1} stopColor="#FFC331" />
								</linearGradient>
							</defs>
						</svg>
					</span>
					<span className="text-text-soft-400 text-xs">Python</span>
				</div>
			</div>
			<CodeBlock code={myCodeString} lang="bash" theme="github-dark" />
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
