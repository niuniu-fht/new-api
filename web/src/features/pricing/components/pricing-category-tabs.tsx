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
import { FileText, Images, LayoutGrid, Music4, Video } from 'lucide-react'
import { useMemo, type ComponentType } from 'react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

import {
  MODEL_CATEGORIES,
  MODEL_CATEGORY_ORDER,
  getModelCategory,
  getModelCategoryLabels,
  type ModelCategory,
} from '../constants'
import type { PricingModel } from '../types'

const CATEGORY_ICONS: Record<
  ModelCategory | 'all',
  ComponentType<{ className?: string }>
> = {
  all: LayoutGrid,
  text: FileText,
  image: Images,
  video: Video,
  audio: Music4,
}

type PricingCategoryTabsProps = {
  models: PricingModel[]
  value: string
  onChange: (value: string) => void
  className?: string
}

/**
 * Modality switcher rendered as a full-width row of large bordered tiles
 * (icon + label + count badge) inside the ruled category band.
 */
export function PricingCategoryTabs({
  models,
  value,
  onChange,
  className,
}: PricingCategoryTabsProps) {
  const { t } = useTranslation()
  const labels = getModelCategoryLabels(t)

  const counts = useMemo(() => {
    const result = new Map<ModelCategory, number>([
      [MODEL_CATEGORIES.ALL, models.length],
    ])
    for (const model of models) {
      const category = getModelCategory(model.supported_endpoint_types)
      result.set(category, (result.get(category) || 0) + 1)
    }
    return result
  }, [models])

  const items = [
    MODEL_CATEGORIES.ALL as ModelCategory,
    ...MODEL_CATEGORY_ORDER,
  ].filter((category) =>
    category === MODEL_CATEGORIES.ALL ? true : (counts.get(category) || 0) > 0
  )

  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      <h2 className='text-muted-foreground/80 text-xs font-semibold tracking-wide uppercase'>
        {t('Model Categories')}
      </h2>
      <div
        role='tablist'
        aria-label={t('Model Categories')}
        className='grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5'
      >
        {items.map((category) => {
          const active = value === category
          const Icon = CATEGORY_ICONS[category]
          return (
            <button
              key={category}
              type='button'
              role='tab'
              aria-selected={active}
              onClick={() => onChange(category)}
              className={cn(
                'group flex min-h-14 items-center justify-between gap-2 rounded-lg border px-3.5 py-2.5 text-start transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98]',
                active
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted/50'
              )}
            >
              <span className='flex min-w-0 items-center gap-2.5'>
                <Icon
                  aria-hidden='true'
                  className={cn(
                    'size-4 shrink-0',
                    active
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                <span className='truncate text-sm font-medium'>
                  {labels[category]}
                </span>
              </span>
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 text-xs font-medium tabular-nums',
                  active
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {counts.get(category) || 0}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
