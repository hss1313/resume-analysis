import { NextRequest, NextResponse } from 'next/server';

// 存储订单信息（生产环境应使用数据库）
const orders = new Map<string, {
  outTradeNo: string;
  amount: number;
  subject: string;
  status: 'pending' | 'paid';
  createdAt: number;
}>();

// 模拟支付完成（仅用于测试）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { outTradeNo } = body;

    if (!outTradeNo) {
      return NextResponse.json(
        { error: '缺少订单号' },
        { status: 400 }
      );
    }

    // 查找订单
    const order = orders.get(outTradeNo);
    if (!order) {
      // 如果是模拟模式，直接标记为已支付
      orders.set(outTradeNo, {
        outTradeNo,
        amount: 9.9,
        subject: '模拟订单',
        status: 'paid',
        createdAt: Date.now(),
      });

      return NextResponse.json({
        success: true,
        data: {
          outTradeNo,
          status: 'paid',
          message: '模拟支付成功',
        },
      });
    }

    // 更新订单状态
    order.status = 'paid';

    return NextResponse.json({
      success: true,
      data: {
        outTradeNo: order.outTradeNo,
        status: 'paid',
        message: '支付成功',
      },
    });
  } catch (error) {
    console.error('模拟支付失败:', error);
    return NextResponse.json(
      { error: '模拟支付失败' },
      { status: 500 }
    );
  }
}
