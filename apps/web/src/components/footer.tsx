import { Logo } from '@reloop/ui/components/logo';

export const Footer = () => {
  return (
    <footer>
      <div className="border-dashed border-gray-200 border-t border-b mx-auto">
        <FooterTitle />
      </div>
      <div className="border-dashed border-gray-200 border-b mx-auto">
        <FooterLinks />
      </div>
      <div className="relative">
        <p className="text-outline text-[300px] leading-96 text-gray-400 text-center font-bold">
          Reloop
        </p>
        <div className="absolute inset-0 bottom-0 w-full  bg-gradient-to-t from-white to-white/0"></div>
      </div>
    </footer>
  );
};

const FooterTitle = () => {
  return (
    <div className="flex flex-col items-start gap-5 pt-10 pb-16 max-w-5xl border-l border-r mx-auto border-dashed border-gray-200">
      <div className="flex justify-center items-center  flex-col w-full">
        <Logo className="w-16 h-16 rounded-full" />
        <p className="text-center text-[28px] font-medium leading-9">
          Reloop Mail
          <br />
          <span className="text-gray-500">Email Infrastructure.</span>
        </p>
      </div>
    </div>
  );
};

const FooterLinks = () => {
  return (
    <div className="flex flex-col items-start gap-5 max-w-5xl border-l border-r mx-auto border-dashed border-gray-200">
      <div className="grid grid-cols-5 w-full">
        <div className="border-r border-dashed border-gray-200 py-10 pl-10">
          <p className="label-md pb-6">Product</p>
          <div className="flex flex-col gap-3 text-[15px] text-gray-600">
            <p>Campaigns</p>
            <p>Email Analytics</p>
            <p>Transaction Emails</p>
            <p>Email Validation</p>
            <p>Email Templates</p>
            <p>Deliverable</p>
          </div>
        </div>

        <div className="border-r border-dashed border-gray-200 py-10 pl-10">
          <p className="label-md pb-6">Docs</p>
          <div className="flex flex-col gap-3 text-[15px] text-gray-600">
            <p>Getting Started</p>
            <p>API Reference</p>
            <p>Campain Builder</p>
            <p>Integration</p>
            <p>Webhooks</p>
            <p>SDKs</p>
          </div>
        </div>
        <div className="border-r border-dashed border-gray-200 py-10 pl-10">
          <p className="label-md pb-6">Resources</p>
          <div className="flex flex-col gap-3 text-[15px] text-gray-600">
            <p>Changelog</p>
            <p>Self-hosting Guide</p>
            <p>Status</p>
            <p>Community</p>
            <p>Glossary</p>
          </div>
        </div>
        <div className="border-r border-dashed border-gray-200 py-10 pl-10">
          <p className="label-md pb-6">Philosophy</p>
          <div className="flex flex-col gap-3 text-[15px] text-gray-600">
            <p>Why Reloop</p>
            <p>Why Open-source</p>
            <p>What we stand for</p>
            <p>Our Product Beliefs</p>
            <p>Engineering</p>
          </div>
        </div>
        <div className="border-r border-dashed border-gray-200 py-10 pl-10">
          <p className="label-md pb-6">Company</p>
          <div className="flex flex-col gap-3 text-[15px] text-gray-600">
            <p>About us</p>
            <p>Blog</p>
            <p>Contact us</p>
            <p>License</p>
          </div>
        </div>
      </div>
    </div>
  );
};
