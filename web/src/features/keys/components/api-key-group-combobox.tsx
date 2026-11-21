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
import { Check, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Highlight } from '@/components/highlight'
import { useMediaQuery } from '@/hooks'
import { cn } from '@/lib/utils'

import {
  AUTO_GROUP_FRAME_CLASS_NAME,
  AutoGroupFlowBorder,
  GroupRatioBadge,
} from './auto-group-visuals'
import {
  GROUP_CATEGORY_LABEL_KEYS,
  groupOptionsByCategory,
} from '../lib/group-category'

export type ApiKeyGroupOption = {
  value: string
  label: string
  desc?: string
  ratio?: number | string
  /** Per-request billing marker used for category classification. */
  billingMode?: string
  /** Pre-formatted price summary, e.g. "¥0.4–¥2 / 1M 输入 · 8 个模型". */
  priceText?: string
  /** Per-model price lines shown in the card tooltip. */
  priceDetail?: string
  /** Administrator-configured category name. */
  category?: string
}

type ApiKeyGroupComboboxProps = {
  options: ApiKeyGroupOption[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function ApiKeyGroupCombobox({
  options,
  value,
  onValueChange,
  placeholder,
  disabled,
}: ApiKeyGroupComboboxProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [expanded, setExpanded] = useState<string[]>([])
  const shouldReduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const selectedOption = options.find((option) => option.value === value)
  const isAutoSelected = selectedOption?.value === 'auto'

  const filteredOptions = useMemo(() => {
    const search = searchValue.trim().toLowerCase()
    if (!search) return options

    return options.filter((option) => {
      const ratioText = String(option.ratio ?? '').toLowerCase()
      return (
        option.value.toLowerCase().includes(search) ||
        option.label.toLowerCase().includes(search) ||
        option.desc?.toLowerCase().includes(search) ||
        option.category?.toLowerCase().includes(search) ||
        option.priceText?.toLowerCase().includes(search) ||
        ratioText.includes(search)
      )
    })
  }, [options, searchValue])

  const categorizedOptions = useMemo(
    () =>
      groupOptionsByCategory(filteredOptions, (key) =>
        t(GROUP_CATEGORY_LABEL_KEYS[key])
      ),
    [filteredOptions, t]
  )

  // While searching, expand every matching category; when the search is
  // cleared, restore the pre-search expansion (first category by default).
  const preSearchExpanded = useRef<string[] | null>(null)
  useEffect(() => {
    if (searchValue.trim()) {
      if (preSearchExpanded.current === null) {
        preSearchExpanded.current = expanded
      }
      setExpanded(categorizedOptions.map((bucket) => bucket.key))
    } else if (preSearchExpanded.current !== null) {
      setExpanded(preSearchExpanded.current)
      preSearchExpanded.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, categorizedOptions])

  // Categories start collapsed; they only open on click or while searching.
  const effectiveExpanded = expanded

  const toggleBucket = (key: string) => {
    setExpanded((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    )
  }

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue)
    setOpen(false)
    setSearchValue('')
  }

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setSearchValue('')
      }}
    >
      <PopoverTrigger
        render={
          <Button
            type='button'
            variant='outline'
            role='combobox'
            aria-expanded={open}
            data-auto-group-effect={isAutoSelected ? 'trigger' : undefined}
            disabled={disabled}
            className={cn(
              'border-input bg-muted/40 hover:bg-muted/55 hover:text-foreground active:bg-background data-popup-open:border-ring data-popup-open:bg-background data-popup-open:ring-ring/20 relative h-auto min-h-14 w-full justify-between gap-2 rounded-lg px-3 py-2 text-start shadow-none transition-[background-color,border-color,box-shadow] duration-150 data-popup-open:ring-[3px] sm:min-h-20 sm:gap-3 sm:px-4 sm:py-3',
              isAutoSelected &&
                cn(
                  AUTO_GROUP_FRAME_CLASS_NAME,
                  'hover:border-primary/55 data-popup-open:border-primary/55 data-popup-open:ring-primary/20'
                )
            )}
          />
        }
      >
        {isAutoSelected && (
          <AutoGroupFlowBorder shouldReduceMotion={shouldReduceMotion} />
        )}
        <span className='flex min-w-0 flex-1 items-center justify-between gap-2 sm:gap-3'>
          <span className='min-w-0'>
            <span className='block truncate font-medium'>
              {selectedOption?.label || placeholder || t('Select a group')}
            </span>
            {selectedOption?.desc && (
              <span className='text-muted-foreground block truncate text-[11px] sm:text-xs'>
                {selectedOption.desc}
              </span>
            )}
            {selectedOption?.priceText && (
              <span className='text-foreground/70 block truncate text-[11px] font-medium'>
                {selectedOption.priceText}
              </span>
            )}
          </span>
          {selectedOption &&
            (isAutoSelected ? (
              <span className='hidden sm:block'>
                <GroupRatioBadge
                  ratio={selectedOption.ratio}
                  isAuto={isAutoSelected}
                  shouldReduceMotion={shouldReduceMotion}
                />
              </span>
            ) : (
              <GroupRatioChip ratio={selectedOption.ratio} />
            ))}
        </span>
        <ChevronsUpDown
          aria-hidden='true'
          className='size-4 shrink-0 opacity-50'
        />
      </PopoverTrigger>
      <PopoverContent
        className='bg-popover text-popover-foreground ring-foreground/10 w-[var(--anchor-width)] overflow-hidden rounded-xl p-0 shadow-lg'
        onWheel={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t('Search...')}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList className='border-border/60 no-scrollbar max-h-[360px] overflow-y-auto overflow-x-hidden border-t'>
            {searchValue.trim() && categorizedOptions.length === 0 && (
              <div className='text-muted-foreground px-3 py-6 text-center text-sm'>
                {t('No group found.')}
              </div>
            )}
            {categorizedOptions.map((bucket, bucketIndex) => {
              const isExpanded = effectiveExpanded.includes(bucket.key)
              return (
                <div
                  key={bucket.key}
                  className={cn(
                    'py-1.5',
                    bucketIndex > 0 && 'border-border/70 mt-1.5 border-t'
                  )}
                >
                  <button
                    type='button'
                    tabIndex={-1}
                    aria-expanded={isExpanded}
                    onMouseDown={(event) => {
                      // keep focus where it is so cmdk does not reset its
                      // highlighted item and scroll the list unexpectedly
                      event.preventDefault()
                      event.stopPropagation()
                    }}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => {
                      event.stopPropagation()
                      toggleBucket(bucket.key)
                    }}
                    className='hover:bg-muted/50 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-foreground transition-colors'
                  >
                    <span className='flex-1'>
                      <Highlight text={bucket.label} query={searchValue} />
                    </span>
                    <span className='text-muted-foreground text-xs tabular-nums'>
                      {bucket.options.length}
                    </span>
                    <ChevronDown
                      aria-hidden='true'
                      className={cn(
                        'text-muted-foreground/70 size-3.5 shrink-0 transition-transform duration-200',
                        isExpanded && 'rotate-180'
                      )}
                    />
                  </button>
                  {isExpanded && (
                    <div className='flex flex-col gap-1.5 px-2 pt-0.5 pb-2'>
                      {bucket.options.map((option) => {
                        const isAutoOption = option.value === 'auto'

                        return (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            data-auto-group-effect={
                              isAutoOption ? 'option' : undefined
                            }
                            onSelect={() => handleSelect(option.value)}
                            className={cn(
                              'bg-card hover:border-ring/45 hover:bg-muted/45 hover:shadow-md data-[selected=true]:border-ring/45 data-[selected=true]:bg-muted/50 items-start gap-3 rounded-xl border border-border px-3.5 py-3 shadow-sm transition-all',
                              isAutoOption &&
                                cn(
                                  AUTO_GROUP_FRAME_CLASS_NAME,
                                  'border-primary/35 data-[selected=true]:border-primary/55'
                                )
                            )}
                          >
                            {isAutoOption && (
                              <AutoGroupFlowBorder
                                shouldReduceMotion={shouldReduceMotion}
                              />
                            )}
                            <Check
                              aria-hidden='true'
                              className={cn(
                                'mt-0.5 size-4',
                                value === option.value
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            <span className='min-w-0 flex-1'>
                              <span className='block truncate font-medium'>
                                <Highlight
                                  text={option.label}
                                  query={searchValue}
                                />
                              </span>
                              {option.desc && (
                                <span className='text-muted-foreground block truncate text-xs'>
                                  <Highlight
                                    text={option.desc}
                                    query={searchValue}
                                  />
                                </span>
                              )}
                              {option.priceText && (
                                <span
                                  className='text-foreground/70 block truncate text-[11px] font-medium'
                                  title={option.priceDetail}
                                >
                                  {option.priceText}
                                </span>
                              )}
                            </span>
                            {isAutoOption ? (
                              <GroupRatioBadge
                                ratio={option.ratio}
                                isAuto={isAutoOption}
                                shouldReduceMotion={shouldReduceMotion}
                              />
                            ) : (
                              <GroupRatioChip ratio={option.ratio} />
                            )}
                          </CommandItem>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/** Teal outline pill showing the group ratio, e.g. "0.2x 倍率". */
function GroupRatioChip({ ratio }: { ratio?: number | string }) {
  const { t } = useTranslation()

  if (ratio === undefined || ratio === null || ratio === '') {
    return null
  }

  return (
    <Badge
      variant='outline'
      className='text-emerald-700 dark:text-emerald-300 border-emerald-600/40 bg-emerald-500/10 h-5 shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap'
    >
      {`${ratio}x ${t('Multiplier')}`}
    </Badge>
  )
}
