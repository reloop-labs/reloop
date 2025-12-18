"use client";

import { AnimatedBackButton } from "@fe/dashboard/components/animated-back-button";
import * as Input from "@reloop/ui/input";

export const LeftSidebar = () => {
    return (
        <aside className="w-64 border-r border-stroke-soft-100/50">
            <div className="p-4 space-y-4">
                <AnimatedBackButton />
                <Input.Root size="small">
                    <Input.Wrapper>
                        <Input.Input placeholder="Untitled Template" />
                    </Input.Wrapper>
                </Input.Root>
            </div>
        </aside>
    );
};
