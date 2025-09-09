import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function LandingLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			<Header />
			{children}
			<div className="mt-10">
				<Footer />
			</div>
		</>
	);
}
