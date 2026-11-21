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
import type { TFunction } from 'i18next'

import { formatBillingCurrencyFromUSD } from '@/lib/currency'

/** Minimal pricing-model shape needed for group summaries. */
export type GroupPricingModel = {
  model_name: string
  quota_type: number
  model_ratio: number
  model_price?: number
  enable_groups?: string[]
}

export type GroupPricingSummary = {
  /** Number of enabled models in this group. */
  modelCount: number
  /** 'per_request' when every model in the group bills per request. */
  billingMode?: 'per_request'
  /** Display text such as "价格 ¥0.4–¥2 / 1M 输入 · 8 个模型". */
  priceText?: string
  /** Per-model price lines shown in the card tooltip. */
  priceDetail?: string
}

const QUOTA_TYPE_REQUEST = 1

function formatRange(
  min: number,
  max: number,
  digits: number
): string {
  const fmt = (value: number) =>
    formatBillingCurrencyFromUSD(value, {
      showSymbol: true,
      digitsLarge: digits,
      digitsSmall: digits,
      abbreviate: false,
    })
  return min === max ? fmt(min) : `${fmt(min)}–${fmt(max)}`
}

/**
 * Aggregate per-group model count and input price range from pricing data.
 * Token-billed models take precedence so mixed groups show the token range.
 */
export function summarizeGroupPricing(
  models: GroupPricingModel[],
  group: string,
  groupRatio: number | undefined,
  t: TFunction
): GroupPricingSummary {
  const ratio = groupRatio ?? 1
  const inGroup = (models || []).filter((model) =>
    (model.enable_groups || []).includes(group)
  )
  if (inGroup.length === 0) {
    return { modelCount: 0 }
  }

  const tokenPrices = inGroup
    .filter((model) => model.quota_type !== QUOTA_TYPE_REQUEST)
    .map((model) => model.model_ratio * 2 * ratio)
    .filter((value) => Number.isFinite(value) && value > 0)
  const requestPrices = inGroup
    .filter((model) => model.quota_type === QUOTA_TYPE_REQUEST)
    .map((model) => (model.model_price || 0) * ratio)
    .filter((value) => Number.isFinite(value) && value > 0)

  const count = t('{{count}} models', { count: inGroup.length })
  const detail = buildPriceDetail(inGroup, ratio, t)

  if (tokenPrices.length > 0) {
    const min = Math.min(...tokenPrices)
    const max = Math.max(...tokenPrices)
    return {
      modelCount: inGroup.length,
      priceText: t('Price {{range}} / 1M input · {{count}}', {
        range: formatRange(min, max, 4),
        count,
      }),
      priceDetail: detail,
    }
  }

  if (requestPrices.length > 0) {
    const min = Math.min(...requestPrices)
    const max = Math.max(...requestPrices)
    const allPerRequest = inGroup.every(
      (model) => model.quota_type === QUOTA_TYPE_REQUEST
    )
    return {
      modelCount: inGroup.length,
      billingMode: allPerRequest ? 'per_request' : undefined,
      priceText: t('Price {{range}} / request · {{count}}', {
        range: formatRange(min, max, 4),
        count,
      }),
      priceDetail: detail,
    }
  }

  const allPerRequest = inGroup.every(
    (model) => model.quota_type === QUOTA_TYPE_REQUEST
  )
  return {
    modelCount: inGroup.length,
    billingMode: allPerRequest ? 'per_request' : undefined,
    priceText: count,
    priceDetail: detail,
  }
}

/** Per-model price lines ("GPT-6 Sol: ¥0.4 / 1M 输入") for the tooltip. */
function buildPriceDetail(
  models: GroupPricingModel[],
  ratio: number,
  t: TFunction
): string {
  return models
    .map((model) => {
      const groupRatio = getConfiguredRatioValue(ratio)
      if (model.quota_type === QUOTA_TYPE_REQUEST) {
        return t('{{model}}: {{price}} / request', {
          model: model.model_name,
          price: formatBillingCurrencyFromUSD(
            (model.model_price || 0) * groupRatio,
            { showSymbol: true, digitsLarge: 4, digitsSmall: 4 }
          ),
        })
      }
      return t('{{model}}: {{price}} / 1M input', {
        model: model.model_name,
        price: formatBillingCurrencyFromUSD(model.model_ratio * 2 * groupRatio, {
          showSymbol: true,
          digitsLarge: 4,
          digitsSmall: 4,
        }),
      })
    })
    .join('\n')
}

function getConfiguredRatioValue(ratio: number): number {
  return Number.isFinite(ratio) && ratio > 0 ? ratio : 1
}
