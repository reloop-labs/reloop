"use client";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import * as Button from "@reloop/ui/button";

interface PageSizeDropdownProps {
    value: number;
    onValueChange: (value: number) => void;
}

const pageSizeOptions = [5, 10, 25, 50];

export const PageSizeDropdown = ({ value, onValueChange }: PageSizeDropdownProps) => {
    return (
        <Dropdown.Root>
            <Dropdown.Trigger asChild>
                <Button.Root
                    variant="neutral"
                    mode="stroke"
                    size="xxsmall"
                    className="transition-all duration-200 hover:border-primary-base hover:bg-bg-weak-50/50"
                >
                    {value} per page
                    <Icon name="chevron-down" className="h-3.5 w-3.5" />
                </Button.Root>
            </Dropdown.Trigger>
            <Dropdown.Content align="start" className="min-w-[100px]">
                {pageSizeOptions.map((size) => (
                    <Dropdown.Item
                        key={size}
                        onClick={() => onValueChange(size)}
                        className={value === size ? "bg-bg-weak-50" : ""}
                    >
                        {size}
                    </Dropdown.Item>
                ))}
            </Dropdown.Content>
        </Dropdown.Root>
    );
};
