import UserStats from "../components/UserStats";

export default function Home() {
	return (
		<div className="flex-1 bg-gray-900">
			{/* Content */}
			<div className="space-y-6 p-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div>
						<h1 className="font-bold text-2xl text-white">Dashboard</h1>
						<p className="text-gray-400">Welcome to your admin dashboard</p>
					</div>
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					<UserStats />
				</div>
			</div>
		</div>
	);
}
