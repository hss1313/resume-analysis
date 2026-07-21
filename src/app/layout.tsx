import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '职引简历竞争力分析 - AI驱动的个人竞争力评估',
  description:
    '上传您的简历，获取专业的五维能力评估、岗位匹配分析和面试准备建议。AI驱动，数据化分析。',
  keywords: [
    '简历分析',
    '竞争力评估',
    '求职',
    '面试准备',
    'ATS检测',
    'AI简历',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
