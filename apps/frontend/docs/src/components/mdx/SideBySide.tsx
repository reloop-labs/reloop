import React from "react";
import { cn } from "@reloop/ui/cn";

interface SideBySideProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A layout component that splits its children into two columns on large screens.
 * Expects exactly two children (typically two <div> tags or fragments).
 */
export function SideBySide({ children, className }: SideBySideProps) {
  // Convert children to an array and filter out any null/undefined
  const childrenArray = React.Children.toArray(children).filter(Boolean);
  
  // If we have only one child, something might be wrong with MDX grouping,
  // but we'll still try to render it.
  const left = childrenArray[0];
  const right = childrenArray[1];

  return (
    <div className={cn("relative grid grid-cols-1 gap-x-10 lg:grid-cols-[minmax(0,1fr)_minmax(400px,1fr)]", className)}>
      {/* Left Column: Documentation */}
      <div className="min-w-0">
        {left}
      </div>

      {/* Right Column: Code/Examples (Sticky on large screens) */}
      <div className="hidden lg:block">
        <div className="sticky top-24">
          {right}
        </div>
      </div>

      {/* Mobile: Show right column below left column */}
      <div className="mt-8 lg:hidden">
        {right}
      </div>
    </div>
  );
}
