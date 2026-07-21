# 支付宝支付接入技能包

一套帮助开发者快速集成支付宝支付能力的技能包，支持 AI 辅助接入支付宝全部主流支付产品。

## 项目简介

本技能包整合了支付宝开放平台的全部主流支付产品接入能力，通过智能路由机制帮助开发者快速定位到对应的专业接入文档和代码示例。无论是线下门店收款、线上应用支付、周期性订阅扣款还是预授权押金场景，都能找到完整的接入方案。

## 产品覆盖

```
支付宝支付产品
├── 线下收款
│   ├── 当面付          → 用户出示付款码，商家扫描收款
│   └── 订单码支付       → 商家生成二维码，用户扫码支付
├── 线上支付
│   ├── App支付         → 移动应用内调起支付宝
│   ├── JSAPI支付       → 支付宝小程序内支付
│   ├── 手机网站支付     → H5 页面支付
│   └── 电脑网站支付     → PC 网页支付
├── 商家扣款
│   └── 周期扣款（订阅）  → 会员续费、周期性账单
└── 资金管理
    └── 预授权支付       → 押金冻结、信用住、免押租车
```

## 项目结构

```
alipay_skills/
├── alipay-payment-integration/      # 技能包主目录
│   └── SKILL.md                     # 统一入口，智能路由
├── bin/                             # CLI 入口
│   └── alipay-payment-skills.js     # 可执行文件
├── src/                             # 源代码
│   ├── index.ts                     # CLI 主入口
│   ├── types.ts                     # 类型定义
│   ├── commands/                    # 命令实现
│   │   ├── install.ts               # 安装命令
│   │   ├── uninstall.ts             # 卸载命令
│   │   └── update.ts                # 更新命令
│   └── utils/                       # 工具函数
│       ├── config.ts                # 配置
│       ├── file.ts                  # 文件操作
│       └── npm.ts                   # NPM 相关
├── package.json
├── tsconfig.json
├── LEGAL.md                         # 法律免责声明
└── README.md                        # 本文件
```

## 安装使用

### NPM 安装（推荐）

通过 npx 一键安装技能包到你的项目：

```bash
# 安装 skills 到当前项目的 .claude/skills/ 目录
npx @alipay/alipay-payment-integration install

# 更新到最新版本
npx @alipay/alipay-payment-integration update

# 卸载
npx @alipay/alipay-payment-integration uninstall
```

安装后，Claude Code 等 AI 工具将自动识别这些支付技能。

### 手动安装

将 `alipay-payment-integration` 目录复制到项目的 `.claude/skills/` 目录下即可。

## 技能包功能

`alipay-payment-integration` 技能包提供以下能力：

### 智能路由

根据业务场景描述自动匹配对应的支付产品：

| 场景 | 推荐产品 | 核心 API |
|-----|---------|---------|
| 线下门店，用户出示付款码 | 当面付   | `alipay.trade.pay` |
| 线下门店，用户扫码支付 | 订单码支付 | `alipay.trade.precreate` |
| 手机浏览器 H5 支付 | 手机网站支付 | `alipay.trade.wap.pay` |
| 电脑浏览器网页支付 | 电脑网站支付 | `alipay.trade.page.pay` |
| 支付宝小程序内支付 | JSAPI 支付 | `alipay.trade.create` + `my.tradePay` |
| 原生 App 内支付 | App 支付 | `alipay.trade.app.pay` |
| 押金冻结、信用住 | 预授权支付 | `alipay.fund.auth.order.app.freeze` |
| 会员订阅、周期续费 | 商家扣款 | `alipay.trade.app.pay` + `alipay.trade.pay` |

### 场景关键词匹配

通过关键词快速定位产品：

| 关键词 | 路由产品 |
|-------|---------|
| 付款码、条码支付、扫码枪 | 当面付 |
| 订单码、商家二维码 | 订单码支付 |
| H5支付、WAP支付、手机网站 | 手机网站支付 |
| PC支付、电脑网站、网页支付 | 电脑网站支付 |
| 小程序支付、JSAPI | JSAPI 支付 |
| App支付、移动应用支付 | App 支付 |
| 预授权、押金、资金冻结 | 预授权支付 |
| 周期扣款、自动续费、会员订阅 | 商家扣款 |

### 澄清话术

当用户描述模糊时，提供标准化的场景澄清引导，帮助快速确定需求。

## 核心特性

- **智能路由**：根据业务场景描述自动匹配对应的支付产品
- **动态文档**：实时访问支付宝在线文档获取最新接口参数
- **场景关键词**：支持关键词快速路由到对应产品
- **澄清引导**：模糊场景下的标准化澄清话术
- **在线文档链接**：直接访问支付宝官方最新文档

## 开发环境

- **沙箱环境**：https://openhome.alipay.com/develop/sandbox/app
- **生产环境**：https://open.alipay.com

## 常用链接

| 资源 | 地址 |
|-----|------|
| 开放平台首页 | https://open.alipay.com |
| 沙箱控制台 | https://openhome.alipay.com/develop/sandbox/app |
| 技术支持工单 | https://open.alipay.com/support/supportCenter.htm |
| 服务端 SDK 文档 | https://ideservice.alipay.com/cms/site/0j0cjj |
| 公共错误码说明 | https://ideservice.alipay.com/cms/site/02km9f |

## 通用注意事项

- 所有接口调用必须使用 **HTTPS** 协议
- 签名方式统一使用 **RSA2**（SHA256WithRSA）
- 异步通知必须验签，返回字符串 `success`
- 测试阶段优先使用**沙箱环境**
- 保留完整的交易日志，便于问题排查
- 域名必须完成 **ICP 备案**

## 许可证

MIT License

---

**法律声明**：代码注释中，中文注释为官方版本，其他语言注释仅作参考。