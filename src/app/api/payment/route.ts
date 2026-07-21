import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// 虎皮椒支付配置
const XUNHU_CONFIG = {
  // 支付网关（使用虎皮椒后台显示的网关地址）
  gateway: 'https://api.dpweixin.com/payment/do.html',
  // 从环境变量读取
  appId: process.env.XUNHU_APPID || '',
  appSecret: process.env.XUNHU_APPSECRET || '',
  // 是否启用虎皮椒支付（需要配置 appId 和 appSecret）
  enabled: !!(process.env.XUNHU_APPID && process.env.XUNHU_APPSECRET),
};

// 生成签名
function generateSign(params: Record<string, string | number>, appSecret: string): string {
  // 按参数名 ASCII 码排序
  const sortedKeys = Object.keys(params).sort();
  const signStr = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join('&') + appSecret;
  
  return crypto.createHash('md5').update(signStr).digest('hex');
}

// 存储订单信息（生产环境应使用数据库）
const orders = new Map<string, {
  outTradeNo: string;
  amount: number;
  subject: string;
  status: 'pending' | 'paid';
  createdAt: number;
}>();

// 生成订单号
function generateOrderNo(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  return `XH${timestamp}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, subject } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: '请输入有效金额' },
        { status: 400 }
      );
    }

    const outTradeNo = generateOrderNo();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || '';

    // 如果虎皮椒未配置，使用模拟模式
    if (!XUNHU_CONFIG.enabled) {
      orders.set(outTradeNo, {
        outTradeNo,
        amount,
        subject: subject || '职引简历竞争力分析',
        status: 'pending',
        createdAt: Date.now(),
      });

      return NextResponse.json({
        success: true,
        data: {
          outTradeNo,
          isMock: true,
          message: '模拟支付模式。配置 XUNHU_APPID 和 XUNHU_APPSECRET 后启用真实支付',
        },
      });
    }

    // 构建虎皮椒支付请求参数
    const timestamp = Math.floor(Date.now() / 1000);
    const nonceStr = crypto.randomBytes(16).toString('hex');
    
    console.log('虎皮椒配置:', {
      appId: XUNHU_CONFIG.appId,
      appIdType: typeof XUNHU_CONFIG.appId,
      gateway: XUNHU_CONFIG.gateway,
    });

    const params: Record<string, string | number> = {
      version: '1.1',
      appid: XUNHU_CONFIG.appId,
      trade_order_id: outTradeNo,
      total_fee: amount.toFixed(2),
      title: subject || '职引简历竞争力分析-完整报告',
      time: timestamp.toString(),
      notify_url: `${baseUrl}/api/payment/notify`,
      return_url: `${baseUrl}/report?paid=true&order=${outTradeNo}`,
      nonce_str: nonceStr,
    };

    // 生成签名
    params.hash = generateSign(params, XUNHU_CONFIG.appSecret);

    console.log('虎皮椒请求参数:', params);

    // 调用虎皮椒 API 创建订单（JSON 格式）
    const response = await fetch(XUNHU_CONFIG.gateway, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify(params),
    });

    const result = await response.json();

    if (result.errcode !== 0) {
      console.error('虎皮椒创建订单失败:', result);
      return NextResponse.json(
        { error: result.errmsg || '创建支付订单失败' },
        { status: 500 }
      );
    }

    // 保存订单信息
    orders.set(outTradeNo, {
      outTradeNo,
      amount,
      subject: subject || '职引简历竞争力分析',
      status: 'pending',
      createdAt: Date.now(),
    });

    // 返回支付信息
    return NextResponse.json({
      success: true,
      data: {
        outTradeNo,
        isMock: false,
        // 支付页面 URL（用户需要跳转到这个页面完成支付）
        payUrl: result.url,
        // 二维码 URL（可以生成二维码展示给用户扫码支付）
        qrCodeUrl: result.url_qrcode,
      },
    });
  } catch (error) {
    console.error('创建订单失败:', error);
    return NextResponse.json(
      { error: '创建订单失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// 查询订单状态
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderNo = searchParams.get('order');

  if (!orderNo) {
    return NextResponse.json(
      { error: '缺少订单号' },
      { status: 400 }
    );
  }

  const order = orders.get(orderNo);
  if (!order) {
    return NextResponse.json(
      { error: '订单不存在' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      outTradeNo: order.outTradeNo,
      amount: order.amount,
      status: order.status,
      createdAt: order.createdAt,
    },
  });
}
