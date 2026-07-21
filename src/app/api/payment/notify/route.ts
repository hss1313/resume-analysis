import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// 虎皮椒支付配置
const XUNHU_APPSECRET = process.env.XUNHU_APPSECRET || '';

// 存储订单信息（生产环境应使用数据库）
const orders = new Map<string, {
  outTradeNo: string;
  amount: number;
  subject: string;
  status: 'pending' | 'paid';
  createdAt: number;
}>();

// 验证虎皮椒签名
function verifySign(params: Record<string, string>, appSecret: string): boolean {
  const receivedHash = params.hash;
  if (!receivedHash) return false;

  const { hash, ...rest } = params;
  const sortedKeys = Object.keys(rest).sort();
  const signStr = sortedKeys
    .map(key => `${key}=${rest[key]}`)
    .join('&') + appSecret;

  const calculatedHash = crypto.createHash('md5').update(signStr).digest('hex');
  return calculatedHash === receivedHash;
}

// 虎皮椒异步通知处理
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    console.log('收到支付通知:', params);

    // 验证签名
    if (XUNHU_APPSECRET && !verifySign(params, XUNHU_APPSECRET)) {
      console.error('签名验证失败');
      return new NextResponse('fail', { status: 200 });
    }

    const {
      trade_order_id, // 商户订单号
      status, // 订单状态: OD（已支付）
      total_fee, // 订单金额
    } = params;

    // 查找订单
    const order = orders.get(trade_order_id);
    if (!order) {
      console.error('订单不存在:', trade_order_id);
      return new NextResponse('fail', { status: 200 });
    }

    // 验证金额
    if (parseFloat(total_fee) !== order.amount) {
      console.error('金额不匹配:', total_fee, order.amount);
      return new NextResponse('fail', { status: 200 });
    }

    // 检查是否已处理
    if (order.status === 'paid') {
      console.log('订单已处理:', trade_order_id);
      return new NextResponse('success', { status: 200 });
    }

    // 更新订单状态
    if (status === 'OD') {
      order.status = 'paid';
      console.log('支付成功:', trade_order_id);
    }

    // 虎皮椒要求返回 "success" 字符串表示处理成功
    return new NextResponse('success', { status: 200 });
  } catch (error) {
    console.error('处理支付通知失败:', error);
    return new NextResponse('fail', { status: 200 });
  }
}
