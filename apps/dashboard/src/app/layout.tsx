import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { IconsSprite } from '@reloop/ui/components/icon';

export const metadata: Metadata = {
  title: 'Reloop',
  description:
    'An open-source & self-hostable SendGrid / Mailchimp / Resend / Loops alternative.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <IconsSprite />
        </ThemeProvider>
      </body>
    </html>
  );
}
