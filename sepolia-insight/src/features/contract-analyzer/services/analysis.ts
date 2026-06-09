import { getStableAIClient } from "@/core/blockchain";
import { AnalysisResult, AIProviderType } from "../types";

const SYSTEM_PROMPT = `
You are an expert Smart Contract Auditor. Your task is to analyze the provided Solidity or Rust source code and generate a clear, human-readable report.
You MUST respond with a JSON object in the following format:
{
  "summary": "Brief explanation of what the contract does",
  "keyFunctions": ["List of the 3-5 most important functions and their purpose"],
  "riskLevel": "Low | Medium | High",
  "redFlags": ["List of any security concerns, vulnerabilities, or suspicious patterns"],
  "suggestions": ["Actionable steps or code improvements to fix the identified red flags and optimize the contract"],
  "contractHash": "Leave this empty"
}
Be precise, technical but accessible, and focus on security.
`;

export async function analyzeContract(sourceCode: string, aiProvider: AIProviderType = "groq-llama"): Promise<AnalysisResult> {
  const client = getStableAIClient();

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Analyze this contract code:\n\n${sourceCode}` }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Empty response from AI");

    const parsed = JSON.parse(content) as AnalysisResult;
    return parsed;
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    throw new Error(`Failed to analyze contract: ${error.message}`);
  }
}
