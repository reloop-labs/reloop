"use client";

import { authClient } from "@reloop/auth/client";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useEffect, useState } from "react";

interface Account {
  id: string;
  accountId: string;
  providerId: string;
  createdAt: Date;
}

interface ConnectedAccountsProps {
  className?: string;
}

const getProviderInfo = (providerId: string) => {
  switch (providerId.toLowerCase()) {
    case "google":
      return {
        name: "Google",
        icon: "google",
        description: "Signed in with Google",
        color: "text-[#4285F4]",
        bgColor: "bg-[#4285F4]/10",
      };
    case "github":
      return {
        name: "GitHub",
        icon: "github",
        description: "Signed in with GitHub",
        color: "text-[#333]",
        bgColor: "bg-[#333]/10",
      };
    case "credential":
      return {
        name: "Email & Password",
        icon: "mail",
        description: "Signed in with email and password",
        color: "text-primary-base",
        bgColor: "bg-primary-light",
      };
    default:
      return {
        name: providerId,
        icon: "user",
        description: `Signed in with ${providerId}`,
        color: "text-text-sub-600",
        bgColor: "bg-bg-weak-50",
      };
  }
};

export const ConnectedAccounts = ({ className }: ConnectedAccountsProps) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const { data, error } = await authClient.listAccounts();
        if (error) {
          console.error("Failed to fetch accounts:", error);
          setAccounts([]);
        } else {
          setAccounts(data || []);
        }
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div>
          <h3 className="font-semibold text-lg text-text-strong-950">
            Connected Accounts
          </h3>
          <p className="text-paragraph-sm text-text-sub-600">
            See how you're signed in to your account
          </p>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-base border-t-transparent" />
            <span className="text-paragraph-sm text-text-sub-600">
              Loading...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="font-semibold text-lg text-text-strong-950">
          Connected Accounts
        </h3>
        <p className="text-paragraph-sm text-text-sub-600">
          See how you're signed in to your account
        </p>
      </div>

      <div className="space-y-3">
        {accounts.map((account) => {
          const provider = getProviderInfo(account.providerId);
          return (
            <div
              key={account.id}
              className="flex items-center gap-4 rounded-xl border border-stroke-soft-100 p-4"
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  provider.bgColor,
                )}
              >
                <Icon
                  name={provider.icon}
                  className={cn("h-5 w-5", provider.color)}
                />
              </div>
              <div className="flex-1">
                <p className="font-medium text-text-strong-950">
                  {provider.name}
                </p>
                <p className="text-paragraph-sm text-text-sub-600">
                  {provider.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-success-light px-2 py-0.5 font-medium text-success-base text-xs">
                  Connected
                </span>
              </div>
            </div>
          );
        })}

        {accounts.length === 0 && (
          <div className="rounded-xl border border-stroke-soft-100 p-6 text-center">
            <p className="text-paragraph-sm text-text-sub-600">
              No connected accounts found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
