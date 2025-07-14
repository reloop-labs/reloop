'use client';
import React, { useState } from 'react';
import { Logo } from '@reloop/ui/components/logo';
import * as Input from '@reloop/ui/components/input';
import * as Label from '@reloop/ui/components/label';
import { Icon } from '@reloop/ui/components/icon';
import * as LinkButton from '@reloop/ui/components/link-button';
import * as FancyButton from '@reloop/ui/components/fancy-button';
import * as Button from '@reloop/ui/components/button';
import * as Divider from '@reloop/ui/components/divider';

const Page = () => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="h-dvh grid md:grid-cols-2">
      <div className="border-r h-full border-stroke-soft-200 md:block hidden">
        <Logo className="w-10 h-10" />
      </div>
      <div className="justify-center flex flex-col items-center">
        <div className="flex w-full max-w-[440px] flex-col gap-6 p-5 md:p-8">
          <div className="justify-center flex flex-col items-center gap-2">
            <div className="relative flex size-[68px] shrink-0 items-center justify-center rounded-full backdrop-blur-xl md:size-24 before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-neutral-500 before:to-transparent before:opacity-10">
              <div className="relative z-10 flex size-12 items-center justify-center rounded-full bg-bg-white-0 shadow-regular-xs ring-1 ring-inset ring-stroke-soft-200 md:size-16">
                <Logo className="w-10 h-10" />
              </div>
            </div>
            <div className="space-y-1 text-center">
              <div className="title-h6 text-text-strong-950 md:title-h5">
                Create a new account
              </div>
              <div className="paragraph-sm text-text-sub-600 md:paragraph-md">
                Enter your details to register.
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Label.Root htmlFor="fullname">
                Full Name
                <Label.Asterisk />
              </Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    id="fullname"
                    type="text"
                    placeholder="Tim cook"
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>
            <div className="flex flex-col gap-1">
              <Label.Root htmlFor="email">
                Email Address
                <Label.Asterisk />
              </Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    id="email"
                    type="email"
                    placeholder="hello@alignui.com"
                  />
                </Input.Wrapper>
              </Input.Root>
            </div>
            <div className="flex flex-col gap-1">
              <Label.Root htmlFor="password1">
                Password <Label.Asterisk />
              </Label.Root>
              <Input.Root>
                <Input.Wrapper>
                  <Input.Input
                    id="password1"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    {showPassword ? (
                      <Icon
                        name="eye-outline"
                        className="size-5 fill-none text-text-soft-400 group-has-[disabled]:text-text-disabled-300"
                      />
                    ) : (
                      <Icon
                        name="eye-slash-outline"
                        className="size-5 fill-none text-text-soft-400 group-has-[disabled]:text-text-disabled-300"
                      />
                    )}
                  </button>
                </Input.Wrapper>
              </Input.Root>
            </div>
          </div>
          <FancyButton.Root>Login</FancyButton.Root>
          <Divider.Root variant="line-text">OR</Divider.Root>
          <Button.Root mode="stroke" variant="neutral">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={15}
              height={15}
              fill="none"
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
           Continue with Google
          </Button.Root>
          <div className="flex items-center gap-1 justify-center">
            <p className="text-paragraph-sm text-text-sub-600">
              Already have an account?
            </p>
            <LinkButton.Root variant="black">Login</LinkButton.Root>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
