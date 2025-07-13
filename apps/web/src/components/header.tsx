import { Logo } from '@reloop/ui/components/logo';
import * as Button from '@reloop/ui/components/button';
import * as FancyButton from '@reloop/ui/components/fancy-button';

export const Header = () => {
  return (
    <header className="flex-1 relative z-10 flex h-16 w-full items-center justify-between gap-4 bg-gray-200 px-4 lg:h-auto lg:w-auto lg:rounded-3xl lg:bg-white lg:p-[18px] lg:shadow-custom-xs">
      <div className="flex items-center">
        <Logo className="h-8 w-8 lg:h-10 lg:w-10 rounded-full" />
      </div>
      <div>Email</div>
      <div className="flex items-center gap-2">
        <Button.Root size="xsmall" mode="stroke" variant="neutral">
          Login
        </Button.Root>
        <FancyButton.Root size="xsmall">Get Started</FancyButton.Root>
      </div>
    </header>
  );
};
