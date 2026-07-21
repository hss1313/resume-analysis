# AGENTS.md - 职引简历竞争力分析

## 项目概览

简历竞争力分析报告生成工具，用户输入简历（文本/PDF/Word），AI 生成专业的五维能力评估报告。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **核心**: React 19 + TypeScript 5
- **样式**: Tailwind CSS 4
- **UI**: shadcn/ui
- **LLM**: coze-coding-dev-sdk (doubao-seed-2-0-mini-260215)
- **文件解析**: unpdf (PDF), mammoth (Word)
- **支付**: alipay-sdk (支付宝支付)

## 目录结构

```
src/
├── app/
│   ├── page.tsx          # 首页 - 简历输入
│   ├── report/page.tsx   # 报告页 - 分析结果展示
│   ├── api/
│   │   ├── analyze/route.ts      # LLM 报告生成 API
│   │   ├── parse-file/route.ts   # 文件解析 API
│   │   ├── payment/route.ts      # 支付创建 API
│   │   ├── payment/mock-pay/route.ts  # 模拟支付 API
│   │   └── payment/notify/route.ts    # 支付宝异步通知 API
│   ├── globals.css       # 全局样式 + Design Token
│   └── layout.tsx        # 根布局
└── components/
    └── header.tsx        # 顶部导航
```

## 核心功能

1. **简历输入**: 支持文本粘贴和 PDF/Word 文件上传
2. **AI 分析**: 调用 LLM 生成五维能力评估报告
3. **报告展示**: 免费预览（评分/五维/优势短板/ATS）+ 付费锁定
4. **支付集成**: 支持支付宝支付（模拟模式/真实模式）
5. **私域引流**: 岗位推荐/求职辅导按钮 → 微信二维码弹窗
6. **响应式**: 桌面端 + 移动端自适应

## API 接口

| 路径 | 方法 | 功能 |
|------|------|------|
| `/api/analyze` | POST | 分析简历生成报告 |
| `/api/parse-file` | POST | 解析 PDF/Word 文件 |
| `/api/payment` | POST | 创建支付订单 |
| `/api/payment/mock-pay` | POST | 模拟支付完成 |
| `/api/payment/notify` | POST | 支付宝异步通知 |

## 支付宝支付配置

当前为**模拟支付模式**，无需配置即可测试。

正式接入支付宝需要配置以下环境变量：
- `ALIPAY_APP_ID`: 支付宝应用 AppID
- `ALIPAY_PRIVATE_KEY`: 应用私钥
- `ALIPAY_PUBLIC_KEY`: 支付宝公钥
- `NEXT_PUBLIC_BASE_URL`: 网站域名（用于回调地址）

个人开发者接入流程：
1. 注册支付宝商家账号（个人账号即可）
2. 创建应用并获取 AppID
3. 配置密钥（RSA2）
4. 签约"电脑网站支付"和"手机网站支付"产品

## 设计风格

数据风：暖米色背景(#F8F6F0) + 深蓝主色(#102A43) + 数据蓝强调(#2978B5)

## 命令

- 开发: `pnpm dev`
- 构建: `pnpm build`
- 类型检查: `pnpm ts-check`
- Lint: `pnpm lint`
