import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '请上传文件' }, { status: 400 });
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '仅支持 PDF、DOC、DOCX 格式' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: '文件大小不能超过 10MB' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'pdf') {
      try {
        const { getDocumentProxy, extractText } = await import('unpdf');
        // unpdf requires Uint8Array, not Buffer
        const uint8Array = new Uint8Array(buffer);
        const pdf = await getDocumentProxy(uint8Array);
        const result = await extractText(pdf, { mergePages: true });
        text = result.text;
      } catch (e) {
        console.error('PDF parse error:', e);
        return NextResponse.json(
          { error: 'PDF 解析失败，请尝试粘贴文本' },
          { status: 400 }
        );
      }
    } else if (ext === 'docx' || ext === 'doc') {
      try {
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } catch (e) {
        console.error('Word parse error:', e);
        return NextResponse.json(
          { error: 'Word 文档解析失败，请尝试粘贴文本' },
          { status: 400 }
        );
      }
    }

    if (!text || text.trim().length < 10) {
      return NextResponse.json(
        { error: '未能从文件中提取到有效文本，请尝试粘贴文本' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        text: text.trim(),
        fileName: file.name,
        fileSize: file.size,
      },
    });
  } catch (error) {
    console.error('File parse error:', error);
    return NextResponse.json(
      { error: '文件解析失败，请稍后重试' },
      { status: 500 }
    );
  }
}
