import Anthropic from '@anthropic-ai/sdk';
import type { GeneratedTestCase } from '@testflow/shared';
import { env } from '../config/env';

export type { GeneratedTestCase };

// Model used for generation. Can be swapped for another Claude model.
const MODEL = 'claude-sonnet-4-6';
const MAX_CASES = 20;

// Tool schema used to force Claude to return well-structured JSON.
const TEST_CASE_TOOL: Anthropic.Tool = {
  name: 'save_test_cases',
  description: 'Save the generated test cases in a structured format.',
  input_schema: {
    type: 'object',
    properties: {
      testCases: {
        type: 'array',
        description: 'The list of generated test cases.',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Short, action-oriented title.' },
            description: { type: 'string', description: 'One-sentence summary of what is verified.' },
            preconditions: { type: 'string', description: 'State required before executing, or an empty string.' },
            steps: { type: 'string', description: 'Numbered steps, one per line (e.g. "1. ...\\n2. ...").' },
            expectedResult: { type: 'string', description: 'Specific, verifiable expected outcome.' },
            priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Critical'] },
          },
          required: ['title', 'description', 'preconditions', 'steps', 'expectedResult', 'priority'],
        },
      },
    },
    required: ['testCases'],
  },
};

function buildPrompt(elementName: string, requirements: string, count: number): string {
  return [
    `You are a senior QA engineer. Generate exactly ${count} high-quality, atomic test cases`,
    `for the application module "${elementName}", based on the requirements below.`,
    '',
    'Guidelines:',
    '- Each test case must verify a single behavior (atomic).',
    '- Cover happy paths, edge cases, and negative/validation scenarios.',
    '- "steps" must be a numbered list, one step per line (e.g. "1. ...\\n2. ...").',
    '- "expectedResult" must be specific and verifiable.',
    '- Leave "preconditions" as an empty string when none are needed.',
    '- Write everything in English.',
    '',
    'Requirements / user stories:',
    '"""',
    requirements,
    '"""',
    '',
    'Call the save_test_cases tool with the result.',
  ].join('\n');
}

/**
 * Generates test cases with Claude and returns them as plain objects.
 * Does NOT persist anything — the caller is responsible for review and saving.
 */
export async function generateTestCases(
  elementName: string,
  requirements: string,
  count: number
): Promise<GeneratedTestCase[]> {
  if (!env.anthropicApiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const safeCount = Math.min(Math.max(count, 1), MAX_CASES);
  const client = new Anthropic({ apiKey: env.anthropicApiKey });

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    tools: [TEST_CASE_TOOL],
    tool_choice: { type: 'tool', name: 'save_test_cases' },
    messages: [{ role: 'user', content: buildPrompt(elementName, requirements, safeCount) }],
  });

  const toolUse = message.content.find((block) => block.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('The model did not return structured test cases');
  }

  const input = toolUse.input as { testCases?: GeneratedTestCase[] };
  if (!Array.isArray(input.testCases)) {
    throw new Error('Malformed response from the model');
  }

  return input.testCases.map((tc) => ({
    title: String(tc.title ?? '').trim(),
    description: String(tc.description ?? '').trim(),
    preconditions: String(tc.preconditions ?? '').trim(),
    steps: String(tc.steps ?? '').trim(),
    expectedResult: String(tc.expectedResult ?? '').trim(),
    priority: String(tc.priority ?? 'Medium').trim() || 'Medium',
  }));
}
