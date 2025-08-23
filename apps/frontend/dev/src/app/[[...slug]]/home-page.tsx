import { Root as Button } from "@reloop/ui/components/button";
import { Logo } from "@reloop/ui/components/logo";
import Link from "next/link";

export default function HomePage() {
	const navigationSections = [
		{
			title: "SDK",
			description: "Integrate Reloop into your application with our SDKs",
			href: "/sdk",
			icon: "🔧",
		},
		{
			title: "API Reference",
			description: "Explore our REST API endpoints and documentation",
			href: "/api",
			icon: "📚",
		},
		{
			title: "Integrations",
			description: "Connect with your favorite tools and platforms",
			href: "/integrations",
			icon: "🔗",
		},
		{
			title: "Deploy",
			description: "Learn how to deploy and host Reloop",
			href: "/deploy",
			icon: "🚀",
		},
		{
			title: "Setup",
			description: "Get started with Reloop configuration",
			href: "/setup",
			icon: "⚙️",
		},
	];

	return (
		<div className="min-h-screen bg-black text-white">
			{/* Header - Exact Vercel style */}
			<header className="border-white/10 border-b bg-black/80 backdrop-blur-sm">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						{/* Left side - Logo */}
						<div className="flex items-center space-x-2">
							<Logo className="h-8 w-8" />
							<span className="font-semibold text-xl">Reloop</span>
						</div>

						{/* Center - Navigation */}
						<nav className="hidden items-center space-x-6 md:flex">
							<Link
								href="/sdk"
								className="font-medium text-sm transition-colors hover:text-blue-400"
							>
								SDK
							</Link>
							<Link
								href="/api"
								className="font-medium text-sm transition-colors hover:text-blue-400"
							>
								API
							</Link>
							<Link
								href="/integrations"
								className="font-medium text-sm transition-colors hover:text-blue-400"
							>
								Integrations
							</Link>
							<Link
								href="/deploy"
								className="font-medium text-sm transition-colors hover:text-blue-400"
							>
								Deploy
							</Link>
							<Link
								href="/setup"
								className="font-medium text-sm transition-colors hover:text-blue-400"
							>
								Setup
							</Link>
						</nav>

						{/* Right side - Buttons and profile */}
						<div className="flex items-center space-x-4">
							<Button
								asChild
								mode="stroke"
								size="small"
								className="border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
							>
								<Link href="/setup">Contact</Link>
							</Button>
							<Button
								asChild
								size="small"
								className="bg-gray-800 text-white hover:bg-gray-700"
							>
								<Link href="https://app.reloop.com">Dashboard</Link>
							</Button>
							<div className="h-8 w-8 rounded-full bg-gray-600" />
						</div>
					</div>
				</div>
			</header>

			{/* Hero Section - Exact Vercel style */}
			<main className="container mx-auto px-4 py-20">
				<div className="mb-20 text-center">
					<h1 className="mb-6 font-bold text-6xl md:text-8xl">
						Making email infrastructure{" "}
						<span className="relative">
							<span className="text-blue-400">fun.</span>
							{/* Decorative elements like Vercel */}
							<div className="-top-2 -right-2 absolute h-4 w-4 animate-pulse rounded-full bg-teal-400" />
							<div className="-bottom-1 -left-1 absolute h-2 w-2 rounded-full bg-red-400" />
							<div className="-right-4 absolute top-1 h-1 w-1 rounded-full bg-green-400" />
						</span>
					</h1>
					<p className="mx-auto mb-8 max-w-3xl text-gray-300 text-xl">
						Turn your email infrastructure into a powerful, scalable system that
						grows with your business.
					</p>
					<div className="flex flex-col justify-center gap-4 sm:flex-row">
						<Button
							asChild
							size="medium"
							className="bg-white text-black hover:bg-gray-100"
						>
							<Link href="https://app.reloop.com">▲ Start Deploying</Link>
						</Button>
						<Button
							asChild
							mode="stroke"
							size="medium"
							className="border-white text-white hover:bg-white/10"
						>
							<Link href="/setup">Get a Demo</Link>
						</Button>
					</div>
				</div>

				{/* Stats Section - Exact Vercel style with company logos */}
				<div className="mx-auto mb-20 grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
					<div className="text-center">
						<div className="mb-2 font-bold text-2xl text-white">37%</div>
						<div className="mb-2 text-gray-400 text-sm">lower bounce rate.</div>
						<div className="font-medium text-sm text-white">DESENIO</div>
					</div>
					<div className="text-center">
						<div className="mb-2 font-bold text-2xl text-white">50%</div>
						<div className="mb-2 text-gray-400 text-sm">
							better Core Web Vitals.
						</div>
						<div className="font-medium text-sm text-white">hydrow</div>
					</div>
					<div className="text-center">
						<div className="mb-2 font-bold text-2xl text-white">30%</div>
						<div className="mb-2 text-gray-400 text-sm">
							increased conversions.
						</div>
						<div className="font-medium text-sm text-white">chico's</div>
					</div>
					<div className="text-center">
						<div className="mb-2 font-bold text-2xl text-white">77%</div>
						<div className="mb-2 text-gray-400 text-sm">
							increase in page speed.
						</div>
						<div className="font-medium text-sm text-white">neo</div>
					</div>
				</div>

				{/* Documentation Sections */}
				<div className="mx-auto max-w-6xl">
					<h2 className="mb-12 text-center font-bold text-3xl">
						Documentation
					</h2>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{navigationSections.map((section) => (
							<div
								key={section.href}
								className="group hover:-translate-y-1 rounded-lg border border-white/10 bg-white/5 p-6 transition-all duration-200 hover:bg-white/10"
							>
								<div className="mb-4 flex items-center space-x-3">
									<span className="text-2xl">{section.icon}</span>
									<h3 className="font-semibold text-lg">{section.title}</h3>
								</div>
								<p className="mb-4 text-gray-300">{section.description}</p>
								<Button
									asChild
									mode="ghost"
									className="w-full group-hover:bg-white/10"
								>
									<Link href={section.href}>Explore {section.title} →</Link>
								</Button>
							</div>
						))}
					</div>
				</div>

				{/* CTA Section */}
				<div className="mt-20 text-center">
					<div className="mx-auto max-w-4xl rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-12">
						<h2 className="mb-4 font-bold text-3xl">
							Ready to transform your email infrastructure?
						</h2>
						<p className="mb-8 text-blue-100 text-xl">
							Join thousands of developers who trust Reloop for their email
							needs.
						</p>
						<div className="flex flex-col justify-center gap-4 sm:flex-row">
							<Button
								asChild
								size="medium"
								className="bg-white text-blue-600 hover:bg-gray-100"
							>
								<Link href="https://app.reloop.com">🚀 Start Using Reloop</Link>
							</Button>
							<Button
								asChild
								mode="stroke"
								size="medium"
								className="border-white text-white hover:bg-white/10"
							>
								<Link href="/setup">View Documentation</Link>
							</Button>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
