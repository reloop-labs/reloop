"use client";
import { Icon } from "@reloop/ui/icon";

const TemplatesLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <div className="sticky top-0 z-10 flex h-12 items-center justify-start gap-2 border-stroke-soft-100 border-b bg-bg-white-0 px-2">
                <div className="flex items-center gap-2">
                    <Icon name="file-text" className="h-4 w-4" />
                    <p className="font-medium text-sm">Templates</p>
                    <a
                        href="https://reloop.sh/docs/templates"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Icon name="info-outline" className="h-3.5 w-3.5" />
                    </a>
                </div>
            </div>
            <div>
                <div>{children}</div>
            </div>
        </div>
    );
};

export default TemplatesLayout;
