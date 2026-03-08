import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import type { SuggestedIngredient } from '@shopper/shared'
import {
  buildValidationPrompt,
  parseValidationResponse,
  appendExclusions,
  IngredientsResponseSchema,
  INGREDIENTS_SYSTEM_PROMPT,
} from './prompts'

export type AIProvider = 'claude' | 'openai'

export const DEFAULT_AI_PROVIDER: AIProvider = 'openai'

export interface AIClient {
  validateRecipe(
    recipeName: string
  ): Promise<{ valid: boolean; reason: string }>
  extractIngredients(
    prompt: string,
    existingIngredients?: string[]
  ): Promise<SuggestedIngredient[]>
}

interface APIKeys {
  anthropic: string
  openai: string
}

// ── Claude ──

function createClaudeClient(apiKey: string): AIClient {
  const client = new Anthropic({ apiKey })

  return {
    async validateRecipe(recipeName) {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        messages: [{ role: 'user', content: buildValidationPrompt(recipeName) }],
      })

      const text =
        response.content[0].type === 'text' ? response.content[0].text : ''
      return parseValidationResponse(text)
    },

    async extractIngredients(prompt, existingIngredients) {
      const finalPrompt = appendExclusions(prompt, existingIngredients)

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        tools: [
          {
            name: 'return_ingredients',
            description:
              'Return the extracted ingredients as a structured list',
            input_schema: {
              type: 'object' as const,
              properties: {
                ingredients: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        description: 'Ingredient name',
                      },
                      quantity: {
                        type: 'string',
                        description:
                          'Amount needed (e.g. "500ml", "2 large")',
                      },
                      notes: {
                        type: 'string',
                        description:
                          'Any specifics (e.g. "boneless", "fresh"). Empty string if none.',
                      },
                    },
                    required: ['name', 'quantity', 'notes'],
                  },
                },
              },
              required: ['ingredients'],
            },
          },
        ],
        tool_choice: { type: 'tool', name: 'return_ingredients' },
        messages: [{ role: 'user', content: finalPrompt }],
      })

      const toolUse = response.content.find(
        (block) => block.type === 'tool_use'
      )
      if (!toolUse || toolUse.type !== 'tool_use') {
        throw new Error('Claude did not return a tool_use response')
      }

      return IngredientsResponseSchema.parse(toolUse.input).ingredients
    },
  }
}

// ── OpenAI ──

function createOpenAIClient(apiKey: string): AIClient {
  const client = new OpenAI({ apiKey })

  return {
    async validateRecipe(recipeName) {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 100,
        messages: [
          { role: 'user', content: buildValidationPrompt(recipeName) },
        ],
      })

      const text = response.choices[0]?.message?.content ?? ''
      return parseValidationResponse(text)
    },

    async extractIngredients(prompt, existingIngredients) {
      const finalPrompt = appendExclusions(prompt, existingIngredients)

      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 1024,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: INGREDIENTS_SYSTEM_PROMPT },
          { role: 'user', content: finalPrompt },
        ],
      })

      const text = response.choices[0]?.message?.content ?? '{}'
      return IngredientsResponseSchema.parse(JSON.parse(text)).ingredients
    },
  }
}

// ── Factory ──

export function createAIClient(
  provider: AIProvider,
  keys: APIKeys
): AIClient {
  if (provider === 'openai') {
    return createOpenAIClient(keys.openai)
  }
  return createClaudeClient(keys.anthropic)
}
