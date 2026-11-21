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
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { getLobeIcon } from '@/lib/lobe-icon'
import { cn } from '@/lib/utils'

import { FILTER_ALL, getModelSeries } from '../constants'
import type { PricingModel, PricingVendor } from '../types'

type PricingVendorChipsProps = {
  vendors: PricingVendor[]
  models: PricingModel[]
  value: string
  onChange: (value: string) => void
  className?: string
}

/**
 * Model-family chip row derived from model-name prefixes (GPT, Claude,
 * GLM, Kimi...) with unmatched models falling back to their configured
 * vendor. Counts are scoped to the active category.
 */
export function PricingVendorChips({
  models,
  value,
  onChange,
  className,
}: PricingVendorChipsProps) {
  const { t } = useTranslation()

  const entries = useMemo(() => {
    const counts = new Map<string, number>()
    const icons = new Map<string, string | undefined>()
    for (const model of models) {
      const series = getModelSeries(model.model_name)
      if (series) {
        counts.set(series, (counts.get(series) || 0) + 1)
        continue
      }
      if (model.vendor_name) {
        counts.set(
          model.vendor_name,
          (counts.get(model.vendor_name) || 0) + 1
        )
        if (model.vendor_icon) {
          icons.set(model.vendor_name, model.vendor_icon)
        }
      }
    }
    return [...counts.entries()]
      .map(([name, count]) => ({
        name,
        count,
        icon: icons.get(name),
      }))
      .sort((a, b) => b.count - a.count)
  }, [models])

  if (entries.length === 0) {
    return null
  }

  const select = (next: string) => {
    onChange(next === value ? FILTER_ALL : next)
  }

  const chipClassName = (active: boolean) =>
    cn(
      'inline-flex min-h-9 items-center gap-2 rounded border px-3 py-1.5 text-sm font-medium transition-colors',
      active
        ? 'border-primary bg-primary/10 text-primary shadow-sm'
        : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'
    )

  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      <h2 className='text-muted-foreground/80 text-xs font-semibold tracking-wide uppercase'>
        {t('Model Families')}
      </h2>
      <div className='flex flex-wrap gap-2'>
        <Button
          type='button'
          variant='ghost'
          onClick={() => onChange(FILTER_ALL)}
          className={chipClassName(value === FILTER_ALL)}
        >
          <span>{t('All')}</span>
          <span className='tabular-nums opacity-75'>{models.length}</span>
        </Button>
        {entries.map(({ name, count, icon }) => {
          const active = value === name
          return (
            <Button
              key={name}
              type='button'
              variant='ghost'
              onClick={() => select(name)}
              className={chipClassName(active)}
            >
              {icon ? getLobeIcon(icon, 14) : undefined}
              <span className='max-w-28 truncate'>{name}</span>
              <span className='tabular-nums opacity-75'>{count}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
