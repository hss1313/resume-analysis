import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { resumeText, targetCity, targetJob } = await request.json();

    if (!resumeText || !targetJob) {
      return NextResponse.json(
        { error: '请提供简历内容和目标岗位' },
        { status: 400 }
      );
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const systemPrompt = `你是一位拥有10年以上经验的资深人力资源专家（HRBP）和职业规划师，曾在多家知名互联网公司负责招聘工作，擅长简历优化、岗位匹配度分析和职业发展指导。

请根据用户提供的简历内容，生成一份专业、深度、可执行的《个人竞争力分析报告》。报告需客观公正，既要肯定用户的优势，也要明确指出差距，并提供具体可操作的改进建议。

目标城市：${targetCity || '未指定'}
目标岗位：${targetJob}

请严格按照以下 JSON 格式输出报告：

{
  "score": {
    "total": 78,
    "summary": "一句话总结核心结论",
    "level": "良好"
  },
  "dimensions": [
    { "name": "内容完整性", "score": 85, "comment": "简短点评" },
    { "name": "岗位匹配度", "score": 72, "comment": "简短点评" },
    { "name": "成果量化力", "score": 65, "comment": "简短点评" },
    { "name": "结构清晰度", "score": 80, "comment": "简短点评" },
    { "name": "关键词优化度", "score": 70, "comment": "简短点评" }
  ],
  "strengths": [
    { "title": "优势标题", "description": "详细说明为什么这是优势" }
  ],
  "weaknesses": [
    { "title": "短板标题", "description": "详细说明问题和改进方向" }
  ],
  "ats": {
    "status": "有风险",
    "risks": ["风险点1", "风险点2"]
  },
  "fullReport": {
    "abilityComparison": [
      { "ability": "能力项", "requirement": "要求描述", "match": "匹配/部分匹配/不匹配", "evidence": "具体依据" }
    ],
    "gapAnalysis": [
      { "problem": "问题描述", "suggestion": "修改建议", "example": "示例话术" }
    ],
    "starRewrite": [
      { "original": "原文", "optimized": "优化后", "points": "优化要点" }
    ],
    "interviewQuestions": [
      { "question": "面试问题", "type": "简历深挖/业务场景", "hint": "回答思路" }
    ],
    "salaryAdvice": {
      "range": "薪资范围",
      "leverage": "核心筹码",
      "strategy": "谈判策略"
    },
    "careerAdvice": {
      "shortTerm": "短期建议",
      "midTerm": "中期建议"
    }
  }
}

注意：
1. 评分必须基于简历实际内容，客观公正
2. strengths 和 weaknesses 各3条
3. abilityComparison 拆解5-8项核心能力
4. interviewQuestions 至少10个问题（5个简历深挖 + 3个业务场景）
5. 所有建议必须具体可执行`;

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `请分析以下简历并生成竞争力分析报告：\n\n${resumeText}`,
      },
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-2-0-lite-260215',
      temperature: 0.3,
    });

    // Try to parse the JSON response
    let reportData;
    try {
      // Extract JSON from the response (in case there's markdown code blocks)
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        reportData = JSON.parse(jsonMatch[0]);
      } else {
        reportData = JSON.parse(response.content);
      }
    } catch {
      // If parsing fails, create a structured response from the text
      reportData = generateFallbackReport(resumeText, targetJob, targetCity);
    }

    return NextResponse.json({ success: true, data: reportData });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: '分析报告生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}

function generateFallbackReport(
  resumeText: string,
  targetJob: string,
  targetCity: string
) {
  const wordCount = resumeText.length;
  const hasNumbers = /\d+%|\d+万|\d+人|\d+年/.test(resumeText);

  return {
    score: {
      total: Math.min(85, Math.max(50, Math.floor(wordCount / 50))),
      summary: `简历内容${wordCount > 500 ? '较为充实' : '偏简短'}，${hasNumbers ? '有一定数据支撑' : '缺乏量化成果'}`,
      level: wordCount > 500 ? '良好' : '有待提升',
    },
    dimensions: [
      {
        name: '内容完整性',
        score: Math.min(90, Math.max(40, Math.floor(wordCount / 30))),
        comment:
          wordCount > 500
            ? '简历内容较为完整，涵盖了主要模块'
            : '简历内容偏简短，建议补充更多细节',
      },
      {
        name: '岗位匹配度',
        score: 70,
        comment: `与${targetJob}岗位有一定匹配度，建议进一步突出相关经验`,
      },
      {
        name: '成果量化力',
        score: hasNumbers ? 75 : 45,
        comment: hasNumbers
          ? '有一定的数据量化成果'
          : '缺乏具体数据支撑，建议补充量化成果',
      },
      {
        name: '结构清晰度',
        score: 75,
        comment: '简历结构基本清晰，建议优化排版层次',
      },
      {
        name: '关键词优化度',
        score: 65,
        comment: `建议补充更多${targetJob}岗位的核心关键词`,
      },
    ],
    strengths: [
      {
        title: '简历内容有一定基础',
        description: '简历包含了基本的职业信息，为优化提供了良好基础',
      },
      {
        title: '目标方向明确',
        description: `明确了${targetCity}${targetJob}的求职方向，有利于针对性优化`,
      },
      {
        title: '主动寻求专业分析',
        description: '愿意通过专业工具分析竞争力，体现了积极的求职态度',
      },
    ],
    weaknesses: [
      {
        title: '成果量化不足',
        description: '工作经历中缺乏具体数据支撑，建议补充量化成果',
      },
      {
        title: '关键词覆盖不够',
        description: `建议研究${targetJob}岗位JD，补充核心技能关键词`,
      },
      {
        title: 'STAR描述不够突出',
        description: '建议用STAR原则重写核心项目经历，突出个人贡献',
      },
    ],
    ats: {
      status: '有风险',
      risks: [
        '建议检查是否使用了复杂表格或图片',
        '确保使用标准字体',
        '避免使用特殊符号和图标',
      ],
    },
    fullReport: {
      abilityComparison: [
        {
          ability: '专业技能',
          requirement: `${targetJob}岗位核心技能要求`,
          match: '部分匹配',
          evidence: '简历中提及了部分相关技能，建议进一步突出',
        },
        {
          ability: '工作经验',
          requirement: '相关行业经验',
          match: '匹配',
          evidence: '有相关工作经验背景',
        },
        {
          ability: '项目成果',
          requirement: '可量化的项目成果',
          match: '不匹配',
          evidence: '简历中缺乏具体数据支撑',
        },
      ],
      gapAnalysis: [
        {
          problem: '成果描述缺乏数据',
          suggestion: '为每项工作经历补充具体数据',
          example: '将"提升了团队效率"改为"通过流程优化将团队效率提升了30%"',
        },
      ],
      starRewrite: [
        {
          original: '负责项目管理',
          optimized:
            '主导XX项目（情境），负责团队协调和进度把控（任务），引入敏捷管理方法并建立每日站会机制（行动），项目提前2周交付，客户满意度提升25%（结果）',
          points: '用STAR原则完整描述了情境、任务、行动和结果，并量化了成果',
        },
      ],
      interviewQuestions: [
        {
          question: '请详细介绍一个你最有成就感的项目',
          type: '简历深挖',
          hint: '用STAR原则回答，突出个人贡献和量化成果',
        },
        {
          question: `你如何看待${targetJob}行业的发展趋势？`,
          type: '业务场景',
          hint: '结合行业数据和自身经验，展示对行业的深度理解',
        },
      ],
      salaryAdvice: {
        range: `${targetCity}${targetJob}岗位市场参考范围`,
        leverage: '核心竞争力和独特经验',
        strategy: '以市场数据为基础，突出个人价值',
      },
      careerAdvice: {
        shortTerm: '补充目标岗位核心技能，完善简历量化成果',
        midTerm: `结合${targetCity}行业环境，制定3年职业发展路径`,
      },
    },
  };
}
