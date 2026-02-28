import OpenAI from "openai";
import type { AIAnalysis } from "./types";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const VISION_PROMPT = `Analyze this campus maintenance image and return ONLY valid JSON with no markdown, no code blocks, no extra text:
{
  "trade": "plumbing|electrical|hvac|structural|custodial|landscaping|safety_hazard",
  "priority": "critical|high|medium|low",
  "description": "Brief description of the issue",
  "suggested_action": "What the maintenance team should do",
  "safety_concern": true or false,
  "estimated_cost": "$X-Y range",
  "estimated_time": "repair time estimate",
  "confidence_score": 0.0 to 1.0
}

Trade definitions:
- plumbing: leaks, flooding, broken pipes, clogged drains, bathroom fixtures
- electrical: exposed wires, broken outlets, lighting failures, power issues
- hvac: heating/cooling failures, ventilation problems, thermostat issues
- structural: cracks, broken doors/windows, damaged walls, flooring issues
- custodial: spills, trash overflow, cleaning needed
- landscaping: tree damage, pathway issues, outdoor maintenance
- safety_hazard: immediate danger, fire hazards, trip hazards, biohazards

Priority definitions:
- critical: immediate safety risk, must fix within hours
- high: significant issue affecting many people, fix within 24h
- medium: noticeable problem, fix within a week
- low: minor cosmetic issue, fix when convenient`;

export async function analyzeImage(base64Image: string): Promise<AIAnalysis> {
  // Strip the data URL prefix if present
  const imageData = base64Image.replace(/^data:image\/\w+;base64,/, "");

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: VISION_PROMPT,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageData}`,
              detail: "low",
            },
          },
        ],
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  const analysis: AIAnalysis = JSON.parse(content);
  return analysis;
}
