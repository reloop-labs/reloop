import { GearIcon } from '@radix-ui/react-icons';
import { cn } from '@reloop/ui/lib/utils';

function Spinner({ className }: Readonly<{ className?: string }>) {
  return (
    <div className={cn('inline-block animate-spin duration-500', className)}>
      <GearIcon />
    </div>
  );
}

export default Spinner;
