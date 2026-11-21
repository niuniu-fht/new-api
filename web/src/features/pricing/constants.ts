/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { type TFunction } from 'i18next'

import type { TokenUnit } from './types'

// ----------------------------------------------------------------------------
// Pricing Constants
// ----------------------------------------------------------------------------

/** Sort options for pricing models */
export const SORT_OPTIONS = {
  NAME: 'name',
  INPUT_PRICE_LOW: 'input-price-low',
  INPUT_PRICE_HIGH: 'input-price-high',
  OUTPUT_PRICE_LOW: 'output-price-low',
  OUTPUT_PRICE_HIGH: 'output-price-high',
  REQUEST_PRICE_LOW: 'request-price-low',
  REQUEST_PRICE_HIGH: 'request-price-high',
} as const

export type SortOption = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS]

export function getSortLabels(t: TFunction): Record<SortOption, string> {
  return {
    [SORT_OPTIONS.NAME]: t('Name'),
    [SORT_OPTIONS.INPUT_PRICE_LOW]: t('Input Price: Low to High'),
    [SORT_OPTIONS.INPUT_PRICE_HIGH]: t('Input Price: High to Low'),
    [SORT_OPTIONS.OUTPUT_PRICE_LOW]: t('Output Price: Low to High'),
    [SORT_OPTIONS.OUTPUT_PRICE_HIGH]: t('Output Price: High to Low'),
    [SORT_OPTIONS.REQUEST_PRICE_LOW]: t('Per-request Price: Low to High'),
    [SORT_OPTIONS.REQUEST_PRICE_HIGH]: t('Per-request Price: High to Low'),
  }
}

/** Filter values */
export const FILTER_ALL = 'all'

/** Quota type options */
export const QUOTA_TYPES = {
  ALL: 'all',
  TOKEN: 'token',
  REQUEST: 'request',
  TASK: 'task',
} as const

export type QuotaTypeOption = (typeof QUOTA_TYPES)[keyof typeof QUOTA_TYPES]

/** Quota type labels */
export function getQuotaTypeLabels(
  t: TFunction
): Record<QuotaTypeOption, string> {
  return {
    [QUOTA_TYPES.ALL]: t('All Models'),
    [QUOTA_TYPES.TOKEN]: t('Token-based'),
    [QUOTA_TYPES.REQUEST]: t('Per Request'),
    [QUOTA_TYPES.TASK]: t('Task billing'),
  }
}

/** Endpoint type options */
export const ENDPOINT_TYPES = {
  ALL: 'all',
  OPENAI: 'openai',
  OPENAI_RESPONSE: 'openai-response',
  ANTHROPIC: 'anthropic',
  GEMINI: 'gemini',
  JINA_RERANK: 'jina-rerank',
  IMAGE_GENERATION: 'image-generation',
  EMBEDDINGS: 'embeddings',
  OPENAI_VIDEO: 'openai-video',
} as const

export type EndpointTypeOption =
  (typeof ENDPOINT_TYPES)[keyof typeof ENDPOINT_TYPES]

/** Endpoint type labels */
export function getEndpointTypeLabels(
  t: TFunction
): Record<EndpointTypeOption, string> {
  return {
    [ENDPOINT_TYPES.ALL]: t('All Types'),
    [ENDPOINT_TYPES.OPENAI]: 'Chat',
    [ENDPOINT_TYPES.OPENAI_RESPONSE]: 'Response',
    [ENDPOINT_TYPES.ANTHROPIC]: 'Anthropic',
    [ENDPOINT_TYPES.GEMINI]: 'Gemini',
    [ENDPOINT_TYPES.JINA_RERANK]: 'Rerank',
    [ENDPOINT_TYPES.IMAGE_GENERATION]: t('Image'),
    [ENDPOINT_TYPES.EMBEDDINGS]: t('Embeddings'),
    [ENDPOINT_TYPES.OPENAI_VIDEO]: t('Video'),
  }
}

/**
 * Modality buckets that group endpoint types into the top-level catalog
 * categories shown as tabs on the pricing page.
 */
export const MODEL_CATEGORIES = {
  ALL: 'all',
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
} as const

export type ModelCategory = (typeof MODEL_CATEGORIES)[keyof typeof MODEL_CATEGORIES]

export const MODEL_CATEGORY_ORDER: ModelCategory[] = [
  MODEL_CATEGORIES.TEXT,
  MODEL_CATEGORIES.IMAGE,
  MODEL_CATEGORIES.VIDEO,
  MODEL_CATEGORIES.AUDIO,
]

export function getModelCategoryLabels(
  t: TFunction
): Record<ModelCategory, string> {
  return {
    [MODEL_CATEGORIES.ALL]: t('All Types'),
    [MODEL_CATEGORIES.TEXT]: t('Text Models'),
    [MODEL_CATEGORIES.IMAGE]: t('Image Models'),
    [MODEL_CATEGORIES.VIDEO]: t('Video Models'),
    [MODEL_CATEGORIES.AUDIO]: t('Audio Models'),
  }
}

/** Ordered model-family rules: lowercase prefix -> display label. */
export const MODEL_SERIES_RULES: Array<[string, string]> = [
  ['gpt', 'GPT'],
  ['claude', 'Claude'],
  ['gemini', 'Gemini'],
  ['glm', 'GLM'],
  ['kimi', 'Kimi'],
  ['deepseek', 'DeepSeek'],
  ['qwen', 'Qwen'],
  ['minimax', 'Minimax'],
  ['grok', 'Grok'],
  ['doubao', 'Doubao'],
  ['seedance', 'Seedance'],
  ['kling', 'Kling'],
  ['wan', 'Wan'],
  ['sora', 'Sora'],
  ['flux', 'Flux'],
  ['suno', 'Suno'],
  ['llama', 'Llama'],
  ['mistral', 'Mistral'],
  ['nova', 'Nova'],
  ['mimo', 'MiMo'],
  ['omni', 'omni'],
]

/** Resolve the model-family label for a model name, if any rule matches. */
export function getModelSeries(modelName: string): string | undefined {
  const lower = modelName.toLowerCase()
  for (const [prefix, label] of MODEL_SERIES_RULES) {
    if (lower.startsWith(prefix)) return label
  }
  return undefined
}

/** Map a model's supported endpoint types to a modality bucket. */
export function getModelCategory(endpoints?: string[]): ModelCategory {
  const list = endpoints || []
  if (list.some((e) => e.includes('video'))) return MODEL_CATEGORIES.VIDEO
  if (list.some((e) => e.includes('image'))) return MODEL_CATEGORIES.IMAGE
  if (list.some((e) => e.includes('audio') || e.includes('tts'))) {
    return MODEL_CATEGORIES.AUDIO
  }
  return MODEL_CATEGORIES.TEXT
}

/** Filter section keys */
export const FILTER_SECTIONS = {
  PRICING_TYPE: 'pricingType',
  ENDPOINT_TYPE: 'endpointType',
  VENDOR: 'vendor',
  GROUP: 'group',
  TAG: 'tag',
} as const

/** Maximum number of tags to display in model row */
export const MAX_TAGS_DISPLAY = 5

/** Maximum number of filter items to display before showing "More..." */
export const MAX_FILTER_ITEMS = 5

/** Sidebar width */
export const SIDEBAR_WIDTH = 'w-64'

/** Excluded groups */
export const EXCLUDED_GROUPS = ['', 'auto']

/** Quota type values */
export const QUOTA_TYPE_VALUES = {
  TOKEN: 0,
  REQUEST: 1,
} as const

/** Token unit divisors */
export const TOKEN_UNIT_DIVISORS = {
  M: 1,
  K: 1000,
} as const

/** Default token unit for pricing display */
export const DEFAULT_TOKEN_UNIT: TokenUnit = 'M'

/** View mode options */
export const VIEW_MODES = {
  CARD: 'card',
  TABLE: 'table',
} as const

export type ViewMode = (typeof VIEW_MODES)[keyof typeof VIEW_MODES]

/** Default page size for pricing table */
export const DEFAULT_PRICING_PAGE_SIZE = 20
