import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export default function Home() {
	return (
		<div>
			<div className="relative z-50 w-full flex-col items-center xl:container lg:mt-6 lg:flex xl:mx-auto">
				<div className="relative z-20 flex w-full items-center justify-center mac:justify-stretch gap-8">
					<Header />
				</div>
			</div>
			<h1 className="title-h1 mt-20 text-center">
				Open Source Email for <br /> Developers & Marketing teams
			</h1>
			<div className="mt-10">
				<Footer />
			</div>
		</div>
	);
}
