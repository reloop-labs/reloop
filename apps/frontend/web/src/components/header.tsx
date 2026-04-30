"use client";

import { authClient } from "@reloop/auth/client";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import Link from "next/link";
import { useEffect, useState } from "react";

export const Header = () => {
	const { useSession } = authClient;
	const { data: session } = useSession();
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 20);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<header className="fixed top-0 right-0 left-0 z-50 flex justify-center p-4 transition-all duration-500">
			<div
				className={`flex items-center justify-between rounded-[20px] pr-3 transition-all duration-500 ease-in-out ${
					scrolled
						? "h-15 w-full max-w-[1000px] border border-white/10 bg-black"
						: "h-16 w-full max-w-[1100px] border-transparent bg-transparent shadow-none"
				}`}
			>
				<Link href="/" className="flex items-center">
					<Logo
						theme="dark"
						className={`transition-all duration-500 ${
							scrolled ? "w-14" : "w-16"
						}`}
					/>
				</Link>

				<div className="flex items-center gap-2.5 sm:gap-3">
					<a
						href="https://github.com/reloop-labs/reloop"
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-white/10 bg-white/5 px-4 py-2 font-semibold text-[13px] text-white backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
					>
						<Icon name="social-github" className="size-3.5" />
						GitHub
					</a>
					<a
						href={session ? "/dashboard" : "/dashboard/login"}
						className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-white px-4 py-2 font-semibold text-[#0a0d12] text-[13px] transition-all hover:scale-[1.02] active:scale-[0.98]"
					>
						{session ? "Dashboard" : "Login"}
					</a>
				</div>
			</div>
		</header>
	);
};
