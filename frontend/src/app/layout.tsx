import type { Metadata } from 'next';
import Sidebar from '@/components/layout/Sidebar';
import './globals.css';

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
        <div className="app-layout">
          <Sidebar />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
