import { Root as Button } from "@reloop/ui/components/button";
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
			{/* Hero Section - Exact Vercel style */}
			<main className="container mx-auto px-4 py-20">
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
			</main>
		</div>
	);
}
