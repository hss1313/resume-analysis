'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import {
  Lock,
  X,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowLeft,
  Download,
  Share2,
  Sparkles,
  Briefcase,
  Target,
  Award,
  AlertCircle,
} from 'lucide-react';

interface ReportData {
  score: { total: number; summary: string; level: string };
  dimensions: { name: string; score: number; comment: string }[];
  strengths: { title: string; description: string }[];
  weaknesses: { title: string; description: string }[];
  ats: { status: string; risks: string[] };
  fullReport: {
    abilityComparison: {
      ability: string;
      requirement: string;
      match: string;
      evidence: string;
    }[];
    gapAnalysis: { problem: string; suggestion: string; example: string }[];
    starRewrite: { original: string; optimized: string; points: string }[];
    interviewQuestions: { question: string; type: string; hint: string }[];
    salaryAdvice: { range: string; leverage: string; strategy: string };
    careerAdvice: { shortTerm: string; midTerm: string };
  };
}

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<ReportData | null>(null);
  const [meta, setMeta] = useState<{ city: string; job: string }>({
    city: '',
    job: '',
  });
  const [modalType, setModalType] = useState<'jobs' | 'coaching' | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{
    isMock: boolean;
    payUrl?: string;
    qrCodeUrl?: string;
    outTradeNo?: string;
  } | null>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('report');
    const metaData = sessionStorage.getItem('reportMeta');
    const paidStatus = sessionStorage.getItem('reportPaid');
    if (data) {
      setReport(JSON.parse(data));
    } else {
      router.push('/');
    }
    if (metaData) {
      setMeta(JSON.parse(metaData));
    }
    if (paidStatus === 'true') {
      setIsPaid(true);
    }
  }, [router]);

  if (!report) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-accent';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 80) return 'stroke-success';
    if (score >= 60) return 'stroke-accent';
    if (score >= 40) return 'stroke-warning';
    return 'stroke-destructive';
  };

  const getAtsIconElement = (status: string) => {
    if (status === '通过') return <CheckCircle2 className="h-4 w-4" />;
    if (status === '有风险') return <AlertTriangle className="h-4 w-4" />;
    return <XCircle className="h-4 w-4" />;
  };

  const getAtsColor = (status: string) => {
    if (status === '通过') return 'text-success bg-success/10';
    if (status === '有风险') return 'text-warning bg-warning/10';
    return 'text-destructive bg-destructive/10';
  };

  const handleUnlock = async () => {
    setIsPaying(true);
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 9.9,
          subject: '职引简历竞争力分析-完整报告',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPaymentInfo(data.data);
        setShowPaymentModal(true);
      } else {
        alert('创建订单失败：' + (data.error || '未知错误'));
      }
    } catch {
      alert('网络错误，请稍后重试');
    } finally {
      setIsPaying(false);
    }
  };

  const handleMockPay = async () => {
    setIsPaying(true);
    try {
      const res = await fetch('/api/payment/mock-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outTradeNo: `ORDER_${Date.now()}` }),
      });
      const data = await res.json();
      if (data.success) {
        setIsPaid(true);
        sessionStorage.setItem('reportPaid', 'true');
        setShowPaymentModal(false);
      } else {
        alert('支付失败：' + (data.error || '未知错误'));
      }
    } catch {
      alert('网络错误，请稍后重试');
    } finally {
      setIsPaying(false);
    }
  };

  const handleCheckPayment = async () => {
    if (!paymentInfo?.outTradeNo) return;
    setIsPaying(true);
    try {
      const res = await fetch('/api/payment/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outTradeNo: paymentInfo.outTradeNo }),
      });
      const data = await res.json();
      if (data.success) {
        setIsPaid(true);
        sessionStorage.setItem('reportPaid', 'true');
        setShowPaymentModal(false);
      } else {
        alert('支付未完成，请确认已完成支付后重试');
      }
    } catch {
      alert('查询失败，请稍后重试');
    } finally {
      setIsPaying(false);
    }
  };

  const getMatchIcon = (match: string) => {
    if (match === '匹配') return CheckCircle2;
    if (match === '部分匹配') return AlertCircle;
    return XCircle;
  };

  const getMatchColor = (match: string) => {
    if (match === '匹配') return 'text-success';
    if (match === '部分匹配') return 'text-warning';
    return 'text-destructive';
  };

  const circumference = 2 * Math.PI * 54;
  const scoreOffset =
    circumference - (report.score.total / 100) * circumference;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        {/* Report Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-2 font-serif text-2xl font-bold text-foreground sm:text-3xl">
            个人竞争力分析报告
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {meta.job && (
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                目标岗位：{meta.job}
              </span>
            )}
            {meta.city && (
              <span className="flex items-center gap-1">
                <Target className="h-3.5 w-3.5" />
                目标城市：{meta.city}
              </span>
            )}
            <span>生成时间：{new Date().toLocaleDateString('zh-CN')}</span>
          </div>
        </div>

        {/* Free Preview Section */}
        <div className="space-y-5 sm:space-y-6">
          {/* Score Card */}
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground sm:text-lg">
              <Award className="h-5 w-5 text-accent" />
              综合竞争力评分
            </h2>
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:gap-8">
              <div className="relative">
                <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="var(--grid-line)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    className={getScoreRingColor(report.score.total)}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={scoreOffset}
                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className={`font-mono text-3xl font-bold ${getScoreColor(report.score.total)}`}
                  >
                    {report.score.total}
                  </span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="mb-1 text-lg font-semibold text-foreground">
                  {report.score.level}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {report.score.summary}
                </p>
              </div>
            </div>
          </section>

          {/* Five Dimensions */}
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground sm:text-lg">
              <Sparkles className="h-5 w-5 text-accent" />
              五维能力评估
            </h2>
            <div className="space-y-4">
              {report.dimensions.map((dim) => (
                <div key={dim.name}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {dim.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-sm font-bold ${getScoreColor(dim.score)}`}
                      >
                        {dim.score}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {dim.score >= 80
                          ? '优秀'
                          : dim.score >= 60
                            ? '良好'
                            : dim.score >= 40
                              ? '待提升'
                              : '较弱'}
                      </span>
                    </div>
                  </div>
                  <div className="mb-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        dim.score >= 80
                          ? 'bg-success'
                          : dim.score >= 60
                            ? 'bg-accent'
                            : dim.score >= 40
                              ? 'bg-warning'
                              : 'bg-destructive'
                      }`}
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{dim.comment}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Strengths & Weaknesses */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-success">
                <CheckCircle2 className="h-4 w-4" />
                核心优势
              </h3>
              <div className="space-y-3">
                {report.strengths.map((s, i) => (
                  <div key={i}>
                    <div className="text-sm font-medium text-foreground">
                      {s.title}
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {s.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-warning">
                <AlertTriangle className="h-4 w-4" />
                关键短板
              </h3>
              <div className="space-y-3">
                {report.weaknesses.map((w, i) => (
                  <div key={i}>
                    <div className="text-sm font-medium text-foreground">
                      {w.title}
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {w.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ATS */}
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-foreground sm:text-lg">
              <AlertCircle className="h-5 w-5 text-accent" />
              ATS 兼容性快评
            </h2>
            <div
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${getAtsColor(report.ats.status)}`}
            >
              {getAtsIconElement(report.ats.status)}
              {report.ats.status}
            </div>
            {report.ats.risks.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {report.ats.risks.map((risk, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-muted-foreground"
                  >
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
                    {risk}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Payment Barrier */}
        {!isPaid && (
          <div className="my-8 sm:my-10">
            <div className="rounded-2xl border border-border bg-gradient-to-b from-card to-muted/30 p-6 text-center sm:p-8">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 mx-auto">
                <Lock className="h-5 w-5 text-accent" />
              </div>
              <h3 className="mb-2 font-serif text-lg font-bold text-foreground sm:text-xl">
                解锁完整报告
              </h3>
              <p className="mb-5 text-sm text-muted-foreground">
                获取深度岗位匹配分析、STAR重写示范、面试问题预测等完整内容
              </p>
              <button
                onClick={handleUnlock}
                disabled={isPaying}
                className="rounded-xl bg-accent px-8 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-all hover:bg-accent/90 disabled:opacity-50"
              >
                {isPaying ? '处理中...' : '立即解锁 ¥9.9'}
              </button>
            </div>
          </div>
        )}

        {/* Locked Full Report */}
        {!isPaid && (
        <div className="relative">
          <div className="pointer-events-none space-y-5 select-none sm:space-y-6 opacity-40 blur-[2px]">
            {/* Ability Comparison */}
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="mb-4 text-base font-semibold text-foreground sm:text-lg">
                深度岗位匹配分析
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-xs font-medium text-muted-foreground">
                        能力项
                      </th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground">
                        要求
                      </th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground">
                        匹配
                      </th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground">
                        依据
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.fullReport.abilityComparison.map((item, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2 text-xs font-medium">{item.ability}</td>
                        <td className="py-2 text-xs text-muted-foreground">
                          {item.requirement}
                        </td>
                        <td className="py-2 text-xs">{item.match}</td>
                        <td className="py-2 text-xs text-muted-foreground">
                          {item.evidence}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* STAR Rewrite */}
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="mb-4 text-base font-semibold text-foreground sm:text-lg">
                STAR 原则重写示范
              </h2>
              {report.fullReport.starRewrite.map((item, i) => (
                <div key={i} className="mb-4 last:mb-0">
                  <div className="mb-2 rounded-lg bg-muted p-3">
                    <div className="mb-1 text-xs font-medium text-muted-foreground">
                      原文
                    </div>
                    <div className="text-sm">{item.original}</div>
                  </div>
                  <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
                    <div className="mb-1 text-xs font-medium text-accent">
                      优化后
                    </div>
                    <div className="text-sm">{item.optimized}</div>
                  </div>
                </div>
              ))}
            </section>

            {/* Interview Questions */}
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="mb-4 text-base font-semibold text-foreground sm:text-lg">
                面试问题预测
              </h2>
              <div className="space-y-3">
                {report.fullReport.interviewQuestions.map((q, i) => (
                  <div key={i} className="rounded-lg border border-border p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        Q{i + 1}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                          q.type === '简历深挖'
                            ? 'bg-accent/10 text-accent'
                            : 'bg-warning/10 text-warning'
                        }`}
                      >
                        {q.type}
                      </span>
                    </div>
                    <div className="text-sm font-medium">{q.question}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {q.hint}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Salary */}
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="mb-4 text-base font-semibold text-foreground sm:text-lg">
                薪资参考与谈判建议
              </h2>
              <div className="space-y-3">
                <div className="rounded-lg bg-muted p-3">
                  <div className="text-xs font-medium text-muted-foreground">
                    薪资范围
                  </div>
                  <div className="text-sm">{report.fullReport.salaryAdvice.range}</div>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <div className="text-xs font-medium text-muted-foreground">
                    核心筹码
                  </div>
                  <div className="text-sm">{report.fullReport.salaryAdvice.leverage}</div>
                </div>
              </div>
            </section>
          </div>

          {/* Lock Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-2xl border border-border bg-card/95 px-8 py-6 text-center shadow-lg backdrop-blur-sm">
              <Lock className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                完整报告已锁定
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                支付 ¥9.9 解锁全部内容
              </p>
            </div>
          </div>
        </div>
        )}

        {/* Full Report (Unlocked) */}
        {isPaid && (
          <div className="space-y-5 sm:space-y-6">
            {/* Ability Comparison */}
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="mb-4 text-base font-semibold text-foreground sm:text-lg">
                深度岗位匹配分析
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2 text-xs font-medium text-muted-foreground">能力项</th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground">要求</th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground">匹配</th>
                      <th className="pb-2 text-xs font-medium text-muted-foreground">依据</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.fullReport.abilityComparison.map((item, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2 font-medium">{item.ability}</td>
                        <td className="py-2 text-muted-foreground">{item.requirement}</td>
                        <td className="py-2">
                          <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                            item.match === '匹配' ? 'bg-success/10 text-success' :
                            item.match === '部分匹配' ? 'bg-warning/10 text-warning' :
                            'bg-destructive/10 text-destructive'
                          }`}>
                            {item.match}
                          </span>
                        </td>
                        <td className="py-2 text-xs text-muted-foreground">{item.evidence}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Gap Analysis */}
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="mb-4 text-base font-semibold text-foreground sm:text-lg">
                差距分析与填补建议
              </h2>
              <div className="space-y-3">
                {report.fullReport.gapAnalysis.map((item, i) => (
                  <div key={i} className="rounded-lg border border-border p-3">
                    <div className="mb-2 text-sm font-medium text-destructive">
                      问题：{item.problem}
                    </div>
                    <div className="mb-2 text-sm text-foreground">
                      建议：{item.suggestion}
                    </div>
                    <div className="rounded-lg bg-accent/5 p-2 text-xs text-accent">
                      示例：{item.example}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* STAR Rewrite */}
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="mb-4 text-base font-semibold text-foreground sm:text-lg">
                STAR原则重写示范
              </h2>
              <div className="space-y-4">
                {report.fullReport.starRewrite.map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="rounded-lg border border-border p-3">
                      <div className="mb-1 text-xs font-medium text-muted-foreground">原文</div>
                      <div className="text-sm">{item.original}</div>
                    </div>
                    <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
                      <div className="mb-1 text-xs font-medium text-accent">优化后</div>
                      <div className="text-sm">{item.optimized}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{item.points}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Interview Questions */}
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="mb-4 text-base font-semibold text-foreground sm:text-lg">
                面试问题预测
              </h2>
              <div className="space-y-3">
                {report.fullReport.interviewQuestions.map((q, i) => (
                  <div key={i} className="rounded-lg border border-border p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">Q{i + 1}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                        q.type === '简历深挖' ? 'bg-accent/10 text-accent' : 'bg-warning/10 text-warning'
                      }`}>
                        {q.type}
                      </span>
                    </div>
                    <div className="text-sm font-medium">{q.question}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{q.hint}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Salary */}
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="mb-4 text-base font-semibold text-foreground sm:text-lg">
                薪资参考与谈判建议
              </h2>
              <div className="space-y-3">
                <div className="rounded-lg bg-muted p-3">
                  <div className="text-xs font-medium text-muted-foreground">薪资范围</div>
                  <div className="text-sm">{report.fullReport.salaryAdvice.range}</div>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <div className="text-xs font-medium text-muted-foreground">核心筹码</div>
                  <div className="text-sm">{report.fullReport.salaryAdvice.leverage}</div>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <div className="text-xs font-medium text-muted-foreground">谈判策略</div>
                  <div className="text-sm">{report.fullReport.salaryAdvice.strategy}</div>
                </div>
              </div>
            </section>

            {/* Career Advice */}
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="mb-4 text-base font-semibold text-foreground sm:text-lg">
                职业发展建议
              </h2>
              <div className="space-y-3">
                <div className="rounded-lg bg-muted p-3">
                  <div className="text-xs font-medium text-muted-foreground">短期建议（1年内）</div>
                  <div className="text-sm">{report.fullReport.careerAdvice.shortTerm}</div>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <div className="text-xs font-medium text-muted-foreground">中期建议（1-3年）</div>
                  <div className="text-sm">{report.fullReport.careerAdvice.midTerm}</div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </button>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => setModalType('jobs')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
            >
              <Briefcase className="h-4 w-4" />
              岗位推荐
            </button>
            <button
              onClick={() => setModalType('coaching')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-warning px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-warning/90"
            >
              <TrendingUp className="h-4 w-4" />
              求职辅导
            </button>
          </div>
        </div>
      </main>

      {/* QR Code Modal */}
      {modalType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
          onClick={() => setModalType(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">
                {modalType === 'jobs' ? '岗位推荐' : '求职辅导'}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 mx-auto">
                {modalType === 'jobs' ? (
                  <Briefcase className="h-5 w-5 text-accent" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-accent" />
                )}
              </div>
              <p className="mb-1 text-sm font-medium text-foreground">
                {modalType === 'jobs'
                  ? '扫描二维码添加专属求职顾问'
                  : '扫描二维码添加专属职场顾问'}
              </p>
              <p className="mb-5 text-xs text-muted-foreground">
                {modalType === 'jobs'
                  ? '获取更多岗位资讯'
                  : '获取一对一求职辅导/职业规划服务'}
              </p>
              <div className="mx-auto mb-4 flex h-48 w-48 items-center justify-center rounded-xl border border-border bg-muted">
                <img
                  src="/wechat-qrcode.png"
                  alt="微信二维码"
                  className="h-44 w-44 rounded-lg object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !isPaying && setShowPaymentModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">
                {paymentInfo?.isMock ? '测试支付' : '支付宝支付'}
              </h3>
              <button
                onClick={() => !isPaying && setShowPaymentModal(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 mx-auto">
                <Sparkles className="h-7 w-7 text-accent" />
              </div>
              <p className="mb-1 text-lg font-bold text-foreground">¥9.9</p>
              <p className="mb-4 text-sm text-muted-foreground">
                职引简历竞争力分析 - 完整报告
              </p>

              {/* Xunhu QR Code */}
              {!paymentInfo?.isMock && paymentInfo?.qrCodeUrl && (
                <div className="mb-4">
                  <div className="mb-3 rounded-lg bg-white p-4 inline-block">
                    <img
                      src={paymentInfo.qrCodeUrl}
                      alt="支付二维码"
                      className="h-48 w-48 mx-auto"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    请使用支付宝扫描二维码完成支付
                  </p>
                  <div className="flex gap-2 mb-3">
                    <a
                      href={paymentInfo.payUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-lg border border-accent py-2 text-xs font-medium text-accent hover:bg-accent/5"
                    >
                      跳转支付宝支付
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(paymentInfo.payUrl || '');
                        alert('支付链接已复制');
                      }}
                      className="flex-1 rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
                    >
                      复制链接
                    </button>
                  </div>
                  <button
                    onClick={handleCheckPayment}
                    disabled={isPaying}
                    className="w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition-all hover:bg-accent/90 disabled:opacity-50"
                  >
                    {isPaying ? '查询中...' : '我已完成支付'}
                  </button>
                </div>
              )}

              {/* Mock Payment */}
              {paymentInfo?.isMock && (
                <>
                  <div className="mb-4 rounded-lg bg-muted p-3 text-left">
                    <div className="mb-2 text-xs font-medium text-muted-foreground">
                      支付包含：
                    </div>
                    <ul className="space-y-1 text-xs text-foreground">
                      <li>• 深度岗位匹配分析</li>
                      <li>• 差距分析与填补建议</li>
                      <li>• STAR原则重写示范</li>
                      <li>• 面试问题预测（10题）</li>
                      <li>• 薪资参考与谈判建议</li>
                      <li>• 职业发展路径建议</li>
                    </ul>
                  </div>
                  <button
                    onClick={handleMockPay}
                    disabled={isPaying}
                    className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-all hover:bg-accent/90 disabled:opacity-50"
                  >
                    {isPaying ? '处理中...' : '模拟支付（测试环境）'}
                  </button>
                  <p className="mt-3 text-xs text-muted-foreground">
                    当前为测试环境，点击按钮模拟支付成功
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
