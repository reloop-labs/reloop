import { usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { usePush } from './usePush';

interface UseTabsProps {
  basePath: string;
}

export const useTabs = ({ basePath }: UseTabsProps) => {
  const pathname = usePathname();
  const { push } = usePush();

  const activePath = useMemo(() => {
    const segments = pathname.slice(basePath.length).split('/').filter(Boolean);
    return segments.length > 0 ? segments[segments.length - 1] : '';
  }, [pathname]);

  const onTabChange = useCallback(
    (path: string) => {
      push(`${basePath}/${path}`);
    },
    [push],
  );

  return { activePath, onTabChange };
};
