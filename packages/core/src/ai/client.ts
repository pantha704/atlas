// AI client — Groq (OpenAI-compatible) primary, Gemini fallback.
// Both have generous free tiers. Groq: 14.4k req/day. Gemini: 15 RPM, 1500/day.
// ponytail: two providers, single interface. Add more (Anthropic, etc.) only if both fail.

import type { AIConfig } from '../types'
import { retry } from '../util'

export interface CompletionRequest {
  system: string
  user: string
  // Override model for this call (e.g. cheap filter vs reason model)
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface AIClient {
  complete(req: CompletionRequest): Promise<string>
}

export function createAIClient(config: AIConfig): AIClient {
  return new GroqGeminiClient(config)
}

class GroqGeminiClient implements AIClient {
  constructor(private cfg: AIConfig) {}

  async complete(req: CompletionRequest): Promise<string> {
    const model = req.model ?? this.cfg.cheapModel
    return retry(
      async () => {
        // Try Groq first
        try {
          return await this.groqComplete(req, model)
        } catch (groqErr) {
          // Fallback to Gemini if configured
          if (this.cfg.geminiApiKeyEnv && this.cfg.geminiModel) {
            return await this.geminiComplete(req, this.cfg.geminiModel)
          }
          throw groqErr
        }
      },
      { maxAttempts: 3 },
    )
  }

  private async groqComplete(req: CompletionRequest, model: string): Promise<string> {
    const apiKey = process.env[this.cfg.apiKeyEnv]
    if (!apiKey) throw new Error(`Missing env ${this.cfg.apiKeyEnv}`)
    const baseUrl = this.cfg.baseUrl ?? 'https://api.groq.com/openai/v1'
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: req.system },
          { role: 'user', content: req.user },
        ],
        temperature: req.temperature ?? this.cfg.temperature,
        max_tokens: req.maxTokens ?? this.cfg.maxTokens,
        response_format: { type: 'json_object' },
      }),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Groq ${res.status}: ${text.slice(0, 200)}`)
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('Groq: empty response')
    return content
  }

  private async geminiComplete(req: CompletionRequest, model: string): Promise<string> {
    const apiKey = process.env[this.cfg.geminiApiKeyEnv ?? '']
    if (!apiKey) throw new Error(`Missing env ${this.cfg.geminiApiKeyEnv}`)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: req.system }] },
        contents: [{ role: 'user', parts: [{ text: req.user }] }],
        generationConfig: {
          temperature: req.temperature ?? this.cfg.temperature,
          maxOutputTokens: req.maxTokens ?? this.cfg.maxTokens,
          responseMimeType: 'application/json',
        },
      }),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Gemini ${res.status}: ${text.slice(0, 200)}`)
    }
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!content) throw new Error('Gemini: empty response')
    return content
  }
}
