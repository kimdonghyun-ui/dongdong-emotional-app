import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { stats, todayRecords } = await req.json();

    // ✅ 데이터 과다 방지 (비용 보호)
    const promptData = {
      stats,
      todayRecords: Array.isArray(todayRecords)
        ? todayRecords.slice(0, 10)
        : [],
    };

    // ✅ GPT 프롬프트
    const prompt = `
      너는 감정 분석 전문가야.

      아래 데이터를 기반으로 사용자의 감정 상태를 분석해.

      ⚠️ 매우 중요:
      - 반드시 JSON만 출력
      - 설명, 인사말, 마크다운 절대 금지
      - 코드블록(\`\`\`) 사용 금지

      형식은 정확히 이것만:
      {
        "summary": "전체 요약 (1~2문장)",
        "patterns": ["패턴1", "패턴2", "패턴3"],
        "suggestions": ["조언1", "조언2", "조언3"]
      }

      ⚠️ 추가 규칙:
      - patterns는 최대 3개까지만 작성 (절대 3개 초과 금지)
      - suggestions도 최대 3개까지만 작성 (절대 3개 초과 금지)
      - 부족하면 1~2개만 작성해도 됨

      데이터:
      ${JSON.stringify(promptData)}
    `;

    // console.log("GPT 요청 데이터:", promptData);

    // =========================
    // 🔥 OpenAI 연결 (최신 방식)
    // =========================
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: prompt,
    });
    const raw = response.output_text;


    // =========================
    // 🔥 테스트용 mock
    // =========================
    // const raw = JSON.stringify({
    //   summary:
    //     "이번 주는 전반적으로 긍정적인 감정 흐름을 보이고 있어요.",
    //   patterns: [
    //     "행복 감정이 가장 많아요",
    //     "아침 시간대 기록이 많아요",
    //   ],
    //   suggestions: [
    //     "좋은 흐름을 유지하세요",
    //     "감정 기록을 꾸준히 해보세요",
    //   ],
    // });






    // =========================
    // 🔥 JSON 파싱 보호
    // =========================
    let result: {
      summary: string;
      patterns: string[];
      suggestions: string[];
      fallback:boolean;
    };

    try {
      // 혹시라도 코드블럭 들어오는 경우 대비 (추가 방어)
      const clean = raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(clean);
      result = {
        summary: parsed.summary ?? "분석 결과가 부족해요.",
        patterns: Array.isArray(parsed.patterns)
          ? parsed.patterns.slice(0, 3)
          : [],
        suggestions: Array.isArray(parsed.suggestions)
          ? parsed.suggestions.slice(0, 3)
          : [],
        fallback: false,
      };
    } catch (e) {
      console.error("JSON 파싱 실패", raw);

      return NextResponse.json(
        {
          summary: "분석 결과를 불러오지 못했어요.",
          patterns: [],
          suggestions: [],
          fallback: true,
        },
        { status: 200 } // 👉 앱 안터지게
      );
    }

    // =========================
    // 🔥 최종 응답
    // =========================
    return NextResponse.json(result);

  } catch (err) {
    console.error("AI 전체 에러", err);

    return NextResponse.json(
      {
        summary: "AI 서버 연결이 원활하지 않아 기본 리포트를 제공하고 있어요.",
        patterns: ["최근 감정 기록을 기준으로 기본 분석을 제공했어요."],
        suggestions: ["잠시 후 다시 AI 분석을 시도해보세요."],
        fallback: true,
      },
      { status: 200 }
    );
  }
}

