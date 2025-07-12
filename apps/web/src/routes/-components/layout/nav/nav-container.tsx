import type { ReactNode } from 'react';

export default function NavContainer({
  children,
}: Readonly<{
  children?: ReactNode;
}>) {
  return (
    <div className="px-2 md:px-4 flex items-center justify-between text-lg bg-nav h-12">
      {children}
    </div>
  );
}
