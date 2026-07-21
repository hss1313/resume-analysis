'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import {
  Upload,
  FileText,
  File,
  X,
  Loader2,
  CheckCircle2,
  Sparkles,
  Shield,
  MessageSquare,
  TrendingUp,
  Zap,
} from 'lucide-react';

const CITIES = [
  '北京',
  '上海',
  '深圳',
  '杭州',
  '广州',
  '成都',
  '南京',
  '武汉',
  '西安',
  '苏州',
];

export default function HomePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [resumeText, setResumeText] = useState('');
  const [targetCity, setTargetCity] = useState('');
  const [targetJob, setTargetJob] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: number;
    type: string;
  } | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileUpload = useCallback(
    async (file: File) => {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({ ...prev, file: '仅支持 PDF、DOC、DOCX 格式' }));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, file: '文件大小不能超过 10MB' }));
        return;
      }

      setErrors((prev) => {
        const { file: _, ...rest } = prev;
        return rest;
      });
      setUploadedFile({ name: file.name, size: file.size, type: file.type });
      setIsParsing(true);

      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/parse-file', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          setResumeText(data.data.text);
          // 清除文件相关错误
          setErrors((prev) => {
            const { file: _, resume: __, ...rest } = prev;
            return rest;
          });
        } else {
          // 保留文件状态，显示错误信息
          setErrors((prev) => ({ ...prev, file: data.error, resume: data.error }));
        }
      } catch {
        // 保留文件状态，显示错误信息
        setErrors((prev) => ({ ...prev, file: '文件解析失败，请重试', resume: '文件解析失败，请重试' }));
      } finally {
        setIsParsing(false);
      }
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = () => {
    setUploadedFile(null);
    setResumeText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!resumeText.trim()) {
      // 检查是否有文件解析错误
      if (errors.file) {
        newErrors.resume = errors.file;
      } else if (uploadedFile) {
        newErrors.resume = '文件解析中，请稍候...';
      } else {
        newErrors.resume = '请输入简历内容或上传简历文件';
      }
    }
    if (!targetJob.trim()) newErrors.job = '请输入目标岗位';
    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    setIsGenerating(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        setIsGenerating(false);
        setErrors({ submit: '生成超时，请重试（报告生成通常需要 60-120 秒，最长 180 秒）' });
      }, 180000);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: resumeText.trim(),
          targetCity,
          targetJob: targetJob.trim(),
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('report', JSON.stringify(data.data));
        sessionStorage.setItem(
          'reportMeta',
          JSON.stringify({ city: targetCity, job: targetJob })
        );
        router.push('/report');
      } else {
        setErrors({ submit: data.error || '生成失败，请重试' });
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setErrors({ submit: '生成超时，请重试（报告生成通常需要 60-120 秒）' });
      } else {
        setErrors({ submit: '网络错误，请重试' });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Hero */}
        <section className="mb-8 text-center sm:mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-accent" />
            AI 驱动 · 数据化分析 · 专业评估
          </div>
          <h1 className="mb-4 font-serif text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            个人竞争力分析
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
            上传您的简历，获取专业的五维能力评估、岗位匹配分析和面试准备建议
          </p>
        </section>

        {/* Form */}
        <section className="mb-10 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
          {/* Resume Input */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-semibold text-foreground">
              简历内容 <span className="text-destructive">*</span>
            </label>
            {/* Tabs */}
            <div className="mb-3 flex gap-1 rounded-lg bg-muted p-1">
              <button
                onClick={() => setActiveTab('text')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                  activeTab === 'text'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileText className="h-4 w-4" />
                粘贴文本
              </button>
              <button
                onClick={() => setActiveTab('file')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                  activeTab === 'file'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Upload className="h-4 w-4" />
                上传文件
              </button>
            </div>

            {activeTab === 'text' ? (
              <div>
                <textarea
                  value={resumeText}
                  onChange={(e) => {
                    setResumeText(e.target.value);
                    if (errors.resume)
                      setErrors((prev) => {
                        const { resume: _, ...rest } = prev;
                        return rest;
                      });
                  }}
                  placeholder="请粘贴您的简历内容..."
                  rows={8}
                  className="w-full resize-none rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  支持直接粘贴 Word/PDF 中的文本内容
                </p>
              </div>
            ) : (
              <div>
                {!uploadedFile ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 transition-all ${
                      isDragging
                        ? 'border-accent bg-accent/5'
                        : 'border-border bg-muted hover:border-accent/50 hover:bg-muted/80'
                    }`}
                  >
                    <div
                      className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                        isDragging ? 'bg-accent/10' : 'bg-muted'
                      }`}
                    >
                      <Upload
                        className={`h-6 w-6 ${isDragging ? 'text-accent' : 'text-muted-foreground'}`}
                      />
                    </div>
                    <p className="mb-1 text-sm font-medium text-foreground">
                      拖拽文件到此处，或点击上传
                    </p>
                    <p className="mb-3 text-xs text-muted-foreground">
                      支持 PDF、DOC、DOCX 格式，最大 10MB
                    </p>
                    <div className="flex gap-2">
                      {['PDF', 'DOCX', 'DOC'].map((fmt) => (
                        <span
                          key={fmt}
                          className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground"
                        >
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-muted p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            uploadedFile.type === 'application/pdf'
                              ? 'bg-destructive/10'
                              : 'bg-accent/10'
                          }`}
                        >
                          <File
                            className={`h-5 w-5 ${
                              uploadedFile.type === 'application/pdf'
                                ? 'text-destructive'
                                : 'text-accent'
                            }`}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {uploadedFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(uploadedFile.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isParsing ? (
                          <div className="flex items-center gap-1.5 text-xs text-accent">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            解析中...
                          </div>
                        ) : resumeText ? (
                          <div className="flex items-center gap-1 text-xs text-success">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            解析成功
                          </div>
                        ) : null}
                        <button
                          onClick={removeFile}
                          className="rounded-md p-1 text-muted-foreground hover:bg-border hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                    // 重置 input value，允许再次选择同一文件
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="hidden"
                />
              </div>
            )}
            {errors.resume && (
              <p className="mt-1.5 text-xs text-destructive">{errors.resume}</p>
            )}
            {errors.file && (
              <p className="mt-1.5 text-xs text-destructive">{errors.file}</p>
            )}
          </div>

          {/* City & Job */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                目标城市
              </label>
              <select
                value={targetCity}
                onChange={(e) => setTargetCity(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              >
                <option value="">请选择城市（可选）</option>
                {CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">
                目标岗位 <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={targetJob}
                onChange={(e) => {
                  setTargetJob(e.target.value);
                  if (errors.job)
                    setErrors((prev) => {
                      const { job: _, ...rest } = prev;
                      return rest;
                    });
                }}
                placeholder="如：高级产品经理"
                className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              {errors.job && (
                <p className="mt-1.5 text-xs text-destructive">{errors.job}</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isGenerating}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                正在生成分析报告...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                生成分析报告
              </>
            )}
          </button>
          {errors.submit && (
            <p className="mt-2 text-center text-xs text-destructive">
              {errors.submit}
            </p>
          )}
        </section>

        {/* Features */}
        <section className="mb-10">
          <h2 className="mb-6 text-center font-serif text-xl font-bold text-foreground sm:text-2xl">
            核心分析能力
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                icon: BarChart3Icon,
                title: '五维能力评估',
                desc: '内容完整性、岗位匹配度、成果量化力、结构清晰度、关键词优化度',
                color: 'accent',
              },
              {
                icon: Shield,
                title: 'ATS 兼容性检测',
                desc: '确保简历能通过企业申请追踪系统，避免被自动过滤',
                color: 'success',
              },
              {
                icon: MessageSquare,
                title: '面试问题预测',
                desc: '基于简历和目标岗位，生成面试官最可能追问的问题清单',
                color: 'primary',
              },
              {
                icon: TrendingUp,
                title: '薪资谈判建议',
                desc: '提供市场薪资参考和谈判策略，帮助您争取更好条件',
                color: 'warning',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border bg-card p-5 transition-shadow hover:shadow-sm"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                      feature.color === 'accent'
                        ? 'bg-accent/10'
                        : feature.color === 'success'
                          ? 'bg-success/10'
                          : feature.color === 'warning'
                            ? 'bg-warning/10'
                            : 'bg-primary/10'
                    }`}
                  >
                    <feature.icon
                      className={`h-4.5 w-4.5 ${
                        feature.color === 'accent'
                          ? 'text-accent'
                          : feature.color === 'success'
                            ? 'text-success'
                            : feature.color === 'warning'
                              ? 'text-warning'
                              : 'text-primary'
                      }`}
                    />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: '10,000+', label: '求职者使用' },
              { value: '95%', label: '用户满意度' },
              { value: '50+', label: '覆盖行业' },
              { value: '3min', label: '平均生成时间' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-mono text-xl font-bold text-primary sm:text-2xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function BarChart3Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 3v18h18" />
      <path d="M7 16h4" />
      <path d="M7 11h8" />
      <path d="M7 6h12" />
    </svg>
  );
}
