import type { Metadata, Viewport } from 'next';
import ClientProviders from '@/components/layout/ClientProviders';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'CostPilot — 원가/관리회계 통합관리',
  description: '프로젝트 기반 서비스 기업을 위한 원가 집계, 내부대체가액, 표준원가 배분, 원가/성과 요인 분석 대시보드',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
