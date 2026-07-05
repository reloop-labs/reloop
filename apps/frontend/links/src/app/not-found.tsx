import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { cacheLife } from "next/cache";
import Link from "next/link";

async function getYear() {
	"use cache";
	cacheLife("max");
	return new Date().getFullYear();
}

export default async function NotFound() {
	const year = await getYear();
	return (
		<div className="dark relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-6 py-12 selection:bg-white/10">
			<div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
				{/* Top Branding Logo */}
				<div className="mb-12 transition-transform duration-300 hover:scale-105">
					<Link href="https://reloop.sh">
						<Logo className="h-10 w-auto cursor-pointer" />
					</Link>
				</div>

				{/* 404 Content Container */}
				<div className="w-full">
					{/* Icon Badge */}
					<div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 transition-transform duration-300 hover:rotate-12">
						<Icon name="alert-triangle" className="h-8 w-8" />
					</div>

					{/* Title */}
					<h1 className="mb-3 font-bold text-3xl text-white tracking-tight">
						Page not found
					</h1>

					{/* Description */}
					<p className="mb-8 font-medium text-paragraph-md text-white/50 leading-relaxed">
						We couldn't find the page you're looking for. The link might be
						broken, or the page may have been moved.
					</p>

					{/* Actions */}
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
						<Link
							href="https://reloop.sh"
							className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 font-bold text-[15px] text-black shadow-lg transition-all duration-200 hover:bg-white/90 active:scale-[0.98]"
						>
							<Icon name="home" className="h-4 w-4" />
							Go to homepage
						</Link>
					</div>
				</div>

				{/* Footer Copyright */}
				<p className="mt-8 font-medium text-white/20 text-xs">
					&copy; {year} Reloop. All rights reserved.
				</p>
			</div>
		</div>
	);
}
