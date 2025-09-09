import { Footer } from "@fe/web/components/footer";
import { Header } from "@fe/web/components/header";
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
