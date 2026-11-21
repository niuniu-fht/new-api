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

/**
 * Group categorization for the API-key group picker.
 *
 * Categories come from two sources:
 *  1. An administrator-configured map (group → category) served with the
 *     group list; those custom categories are displayed verbatim.
 *  2. Built-in keyword rules that bucket the remaining groups (GPT, Gemini,
 *     image, video, Grok, Claude, domestic models, per-request, other).
 */

export const GROUP_CATEGORIES = [
  'gpt',
  'gemini',
  'image',
  'video',
  'grok',
  'claude',
  'domestic',
  'per_call',
  'other',
] as const

export type GroupCategory = (typeof GROUP_CATEGORIES)[number]

export const GROUP_CATEGORY_LABEL_KEYS: Record<GroupCategory, string> = {
  gpt: 'GPT',
  gemini: 'Gemini',
  image: 'Image Generation',
  video: 'Video',
  grok: 'Grok',
  claude: 'Claude',
  domestic: 'Domestic Models',
  per_call: 'Per-request',
  other: 'Other',
}

/** Groups that are never auto-classified and always land in "other". */
const FORCED_OTHER_GROUPS = new Set([
  'auto',
  'default',
  'g模',
  'kimi k3',
  '免费模型',
])

const RE_PER_CALL = /按次|per[\s_-]?call/i
const RE_VIDEO =
  /视频|video|seedance|veo|(?:^|[\s_-])sd(?:\d|$|[\s_-])/i
const RE_IMAGE = /生图|图像|图片|image|banana|香蕉/i
const RE_CLAUDE =
  /claude|克劳德|kiro|ccmax|cc满血|(?:^|[\s_[(-])cc(?:$|[\s_)\]-])/i
const RE_GPT = /gpt|codex|openai/i
const RE_GROK = /grok/i
const RE_GEMINI = /gemini|双子座/i
const RE_DOMESTIC =
  /国模|domestic|deepseek|ds高|qwen|通义|千问|glm|智谱|doubao|豆包|hunyuan|混元|minimax|ernie|文心/i

export function classifyGroup(
  value: string,
  label: string = value,
  billingMode?: string
): GroupCategory {
  const normalized = value.trim().toLowerCase()
  if (billingMode === 'per_request' || RE_PER_CALL.test(value)) {
    return 'per_call'
  }
  if (FORCED_OTHER_GROUPS.has(normalized)) {
    return 'other'
  }
  const haystack = `${value} ${label}`.trim()
  if (RE_VIDEO.test(haystack)) return 'video'
  if (RE_IMAGE.test(haystack)) return 'image'
  if (RE_GEMINI.test(haystack)) return 'gemini'
  if (RE_CLAUDE.test(haystack)) return 'claude'
  if (RE_GPT.test(haystack)) return 'gpt'
  if (RE_GROK.test(haystack)) return 'grok'
  if (RE_DOMESTIC.test(haystack)) return 'domestic'
  return 'other'
}

export type GroupCategoryInput = {
  value: string
  label?: string
  desc?: string
  billingMode?: string
  /** Administrator-configured category name, displayed verbatim. */
  category?: string
}

export type GroupCategoryBucket<T extends GroupCategoryInput> = {
  /** Stable bucket key: built-in ids or `custom:<name>`. */
  key: string
  /** Display label for the bucket header. */
  label: string
  /** True when the label is an administrator-defined custom category. */
  isCustom: boolean
  options: T[]
}

const CUSTOM_PREFIX = 'custom:'

/**
 * Bucket options by category. Administrator-configured categories come
 * first (in first-seen order), then built-in categories in their fixed
 * order, then "other". The `auto` group is pinned to the top of "other".
 */
export function groupOptionsByCategory<
  T extends GroupCategoryInput,
>(options: T[], translateCategory?: (key: GroupCategory) => string): GroupCategoryBucket<T>[] {
  const customOrder: string[] = []
  const customBuckets = new Map<string, T[]>()
  const buckets = new Map<GroupCategory, T[]>(
    GROUP_CATEGORIES.map((category) => [category, []])
  )
  const autoOptions: T[] = []

  for (const option of options) {
    if (option.value === 'auto') {
      autoOptions.push(option)
      continue
    }
    const configured = option.category?.trim()
    if (configured) {
      let bucket = customBuckets.get(configured)
      if (!bucket) {
        bucket = []
        customBuckets.set(configured, bucket)
        customOrder.push(configured)
      }
      bucket.push(option)
      continue
    }
    const category = classifyGroup(
      option.value,
      `${option.label ?? ''} ${option.desc ?? ''}`.trim() || option.value,
      option.billingMode
    )
    buckets.get(category)?.push(option)
  }

  if (autoOptions.length > 0) {
    buckets.get('other')?.unshift(...autoOptions)
  }

  const translate = translateCategory ?? ((key: GroupCategory) => key)
  const result: GroupCategoryBucket<T>[] = []
  for (const name of customOrder) {
    result.push({
      key: `${CUSTOM_PREFIX}${name}`,
      label: name,
      isCustom: true,
      options: customBuckets.get(name) || [],
    })
  }
  for (const category of GROUP_CATEGORIES) {
    const bucket = buckets.get(category)
    if (bucket && bucket.length > 0) {
      result.push({
        key: category,
        label: translate(category),
        isCustom: false,
        options: bucket,
      })
    }
  }
  return result
}
