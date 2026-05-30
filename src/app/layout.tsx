import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import AntiCheat from '@/components/AntiCheat';
import 'katex/dist/katex.min.css';

export const metadata: Metadata = {
  title: 'DSAT.JO | Full Online Practice Tests and Detailed Analytics',
  description: 'Master the Digital SAT with DSAT.JO - our platform featuring the latest practice tests, module-based exercises, detailed score analysis, and a reliable score calculator to achieve your highest score.',
  keywords: 'Digital SAT, SAT preparation, online practice tests, Digital SAT score calculator',
  openGraph: {
    title: 'DSAT.JO - Digital SAT Preparation Platform',
    description: 'DSAT.JO - Our comprehensive platform for Digital SAT success.',
    siteName: 'DSAT.JO',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* KaTeX CSS for LaTeX rendering across the site */}
      </head>
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          <AntiCheat />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
