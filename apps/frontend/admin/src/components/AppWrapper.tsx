import Sidebar from "./sidebar/Sidebar";

interface AppWrapperProps {
	children: React.ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
	return (
		<div className="flex h-screen bg-gray-900">
			<Sidebar />
			<main className="flex-1 overflow-auto">{children}</main>
		</div>
	);
}
