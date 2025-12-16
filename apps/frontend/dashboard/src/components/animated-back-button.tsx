"use client";

import * as Kbd from "@reloop/ui/kbd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AnimatedBackButtonProps {
  showEscKey?: boolean;
  onClick?: () => void;
}

export const AnimatedBackButton = ({ showEscKey = true, onClick }: AnimatedBackButtonProps) => {
  const { back } = useRouter();

  useEffect(() => {
    if (!showEscKey) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        back();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [back, showEscKey]);

  return (
    <button
      type="button"
      onClick={onClick || back}
      className="group flex items-center gap-1.5 px-2 py-1.5 text-paragraph-xs font-medium text-text-sub-600 transition-all duration-300 hover:text-text-strong-950 cursor-pointer"
    >
      <div className="relative flex items-center justify-center w-3.5 h-3.5 overflow-visible">
        {/* Arrow tail - hidden by default, slides in from left on hover */}
        <div className="absolute left-0 h-[1.25px] w-0 bg-current transition-all duration-300 ease-out group-hover:w-2" />
        {/* Chevron/Arrow head - nudges left on hover */}
        <svg
          width="6"
          height="10"
          viewBox="0 0 8 12"
          fill="none"
          className="absolute left-0 transition-all duration-300 ease-out group-hover:-translate-x-0.5"
        >
          <path
            d="M7 1L1.5 6L7 11"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="transition-all duration-300 group-hover:tracking-wide text-xs">Back</span>
      {
        showEscKey && (
          <Kbd.Root className="bg-bg-weak-50 text-[10px] px-1.5 py-0.5">Esc</Kbd.Root>
        )
      }
    </button >
  );
};
