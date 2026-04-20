"use client";

import { authClient } from "@reloop/auth/client";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import Link from "next/link";

export const Header = () => {
	const { useSession } = authClient;
	const { data: session } = useSession();

	return (
		<header className="bg-[#05070b]">
			<div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between px-4 sm:px-6 lg:px-8">
				<Link href="/" className="flex items-center">
					<Logo theme="dark" className="w-16" />
				</Link>

				<div className="flex items-center gap-2.5 sm:gap-3">
					<a
						href="https://github.com/reloop-labs/reloop"
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-white/18 bg-black/16 px-4 py-2 font-semibold text-[13px] text-white backdrop-blur-sm transition-colors hover:bg-black/24"
					>
						<Icon name="social-github" className="size-3.5" />
						GitHub
					</a>
					<Link
						href={session ? "/dashboard" : "/dashboard/login"}
						className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-white px-4 py-2 font-semibold text-[#0a0d12] text-[13px] transition-colors hover:bg-white/92"
					>
						{session ? "Dashboard" : "Login"}
					</Link>
				</div>
			</div>
		</header>
	);
};
