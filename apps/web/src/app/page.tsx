import { Footer } from '@/components/footer';
import { Header } from '@/components/header';

export default function Home() {
  return (
    <div>
      <div className="relative z-50 w-full flex-col items-center xl:container lg:flex xl:mx-auto lg:mt-6">
        <div className="relative z-20 flex w-full items-center justify-center gap-8 mac:justify-stretch">
          <Header />
        </div>
      </div>
      <h1 className="title-h1 text-center mt-20">
        Open Source Email for <br /> Developers & Marketing teams
      </h1>
      <div className="mt-10">
        <Footer />
      </div>
    </div>
  );
}
