"use client";

import { authClient } from "@reloop/auth/client";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Spinner from "@reloop/ui/spinner";
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

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 16 15"
  >
    <path
      fill="#4280EF"
      d="M14.117 7.661c0-.456-.045-.926-.118-1.368H7.63v2.604h3.648a3.07 3.07 0 0 1-1.353 2.044l2.177 1.692c1.28-1.192 2.015-2.927 2.015-4.972"
    />
    <path
      fill="#34A353"
      d="M7.63 14.252c1.824 0 3.354-.604 4.472-1.633l-2.177-1.677c-.603.412-1.383.647-2.295.647-1.765 0-3.25-1.191-3.794-2.78L1.6 10.53a6.74 6.74 0 0 0 6.03 3.722"
    />
    <path
      fill="#F6B704"
      d="M3.836 8.794a4.1 4.1 0 0 1 0-2.588L1.6 4.47a6.76 6.76 0 0 0 0 6.06z"
    />
    <path
      fill="#E54335"
      d="M7.63 3.426A3.68 3.68 0 0 1 10.22 4.44L12.146 2.5A6.5 6.5 0 0 0 7.63.749a6.74 6.74 0 0 0-6.03 3.72l2.236 1.736c.544-1.603 2.03-2.78 3.794-2.78"
    />
  </svg>
);

const getProviderInfo = (providerId: string) => {
  switch (providerId.toLowerCase()) {
    case "google":
      return {
        name: "Google",
        icon: "google",
        useCustomIcon: true,
        description: "Signed in with Google",
        borderColor: "border-stroke-soft-100",
      };
    case "github":
      return {
        name: "GitHub",
        icon: "github",
        useCustomIcon: false,
        description: "Signed in with GitHub",
        borderColor: "border-stroke-soft-100",
      };
    case "credential":
      return {
        name: "Email & Password",
        icon: "mail",
        useCustomIcon: false,
        description: "Signed in with email and password",
        borderColor: "border-stroke-soft-100",
      };
    default:
      return {
        name: providerId,
        icon: "user",
        useCustomIcon: false,
        description: `Signed in with ${providerId}`,
        borderColor: "border-stroke-soft-100",
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
          <p className="font-medium text-label-md text-text-strong-950">
            Connected Accounts
          </p>
          <p className="text-paragraph-sm text-text-sub-600">
            See how you're signed in to your account
          </p>
        </div>
        <div className="flex items-center justify-center py-8">
          <Spinner size={20} color="var(--text-strong-950)" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <p className="font-medium text-label-md text-text-strong-950">
          Connected Accounts
        </p>
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
              className={cn(
                "rounded-xl border py-2 pr-2.5 pl-3",
                provider.borderColor,
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-weak-50">
                    {provider.useCustomIcon && account.providerId.toLowerCase() === "google" ? (
                      <GoogleIcon className="h-4 w-4" />
                    ) : (
                      <Icon
                        name={provider.icon}
                        className="h-4 w-4 text-text-sub-600"
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-label-sm text-text-strong-950">
                      {provider.name}
                    </p>
                    <p className="text-paragraph-xs text-text-sub-600">
                      {provider.description}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-success-lighter px-2 py-0.5 font-medium text-success-base text-xs">
                  Connected
                </span>
              </div>
            </div>
          );
        })}

        {accounts.length === 0 && (
          <div className="rounded-xl border border-stroke-soft-100 py-2 pr-2.5 pl-3">
            <p className="text-paragraph-sm text-text-sub-600">
              No connected accounts found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
